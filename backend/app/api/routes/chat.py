import json
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.models.schemas import Conversation, ConversationCreate, Message
from app.db.database import get_db

router = APIRouter()


@router.post("/", response_model=Conversation)
async def create_conversation(conv: ConversationCreate):
    async for db in get_db():
        conv_id = str(uuid.uuid4())
        await db.execute(
            "INSERT INTO conversations (id, project_id, title, model) VALUES (?, ?, ?, ?)",
            (conv_id, conv.project_id, conv.title, conv.model)
        )
        await db.commit()
        return Conversation(
            id=conv_id,
            project_id=conv.project_id,
            title=conv.title,
            model=conv.model,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )


@router.get("/", response_model=list[Conversation])
async def list_conversations(project_id: str = None):
    async for db in get_db():
        if project_id:
            cursor = await db.execute(
                "SELECT * FROM conversations WHERE project_id = ? ORDER BY updated_at DESC",
                (project_id,)
            )
        else:
            cursor = await db.execute("SELECT * FROM conversations ORDER BY updated_at DESC")
        rows = await cursor.fetchall()
        return [Conversation(**dict(row)) for row in rows]


@router.get("/{conv_id}/messages", response_model=list[Message])
async def get_messages(conv_id: str):
    async for db in get_db():
        cursor = await db.execute(
            "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at",
            (conv_id,)
        )
        rows = await cursor.fetchall()
        return [Message(
            id=row["id"],
            conversation_id=row["conversation_id"],
            role=row["role"],
            content=row["content"],
            artifacts=json.loads(row["artifacts"]) if row["artifacts"] else [],
            attachments=json.loads(row["attachments"]) if row["attachments"] else [],
            created_at=row["created_at"],
        ) for row in rows]


@router.delete("/{conv_id}")
async def delete_conversation(conv_id: str):
    async for db in get_db():
        await db.execute("DELETE FROM messages WHERE conversation_id = ?", (conv_id,))
        await db.execute("DELETE FROM conversations WHERE id = ?", (conv_id,))
        await db.commit()
        return {"status": "deleted"}
