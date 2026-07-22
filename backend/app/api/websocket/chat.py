import json
import uuid
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.llm import llm_service
from app.services.memory import get_memories_context
from app.db.database import get_db
from app.models.schemas import ChatRequest

ws_router = APIRouter()


@ws_router.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()

    async for db in get_db():
        try:
            while True:
                data = await websocket.receive_text()
                request = ChatRequest(**json.loads(data))

                # Get conversation history
                cursor = await db.execute(
                    "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at",
                    (request.conversation_id,)
                )
                rows = await cursor.fetchall()
                messages = [{"role": row["role"], "content": row["content"]} for row in rows]

                # Add new user message
                messages.append({"role": "user", "content": request.message})

                # Save user message
                msg_id = str(uuid.uuid4())
                await db.execute(
                    "INSERT INTO messages (id, conversation_id, role, content, attachments) VALUES (?, ?, ?, ?, ?)",
                    (msg_id, request.conversation_id, "user", request.message, json.dumps(request.attachments))
                )

                # Get project system prompt
                cursor = await db.execute(
                    "SELECT p.system_prompt FROM projects p JOIN conversations c ON p.id = c.project_id WHERE c.id = ?",
                    (request.conversation_id,)
                )
                project = await cursor.fetchone()
                system_prompt = project["system_prompt"] if project else ""
                
                # Include memory context
                memory_context = await get_memories_context()
                if memory_context:
                    system_prompt = f"{system_prompt}\n\n{memory_context}" if system_prompt else memory_context

                # Stream response
                full_response = ""
                async for chunk in llm_service.stream_chat(
                    messages=messages,
                    model=request.model or "gpt-4o",
                    system_prompt=system_prompt,
                    conversation_id=request.conversation_id,
                ):
                    parsed = json.loads(chunk)
                    await websocket.send_text(chunk)

                    if parsed.get("type") == "token":
                        full_response += parsed["content"]

                # Save assistant response
                assistant_id = str(uuid.uuid4())
                await db.execute(
                    "INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)",
                    (assistant_id, request.conversation_id, "assistant", full_response)
                )
                await db.commit()

        except WebSocketDisconnect:
            break
        except Exception as e:
            await websocket.send_text(json.dumps({"type": "error", "content": str(e)}))
