import uuid
from datetime import datetime
from fastapi import APIRouter
from app.models.schemas import Memory, MemoryBase
from app.db.database import get_db

router = APIRouter()


@router.post("/", response_model=Memory)
async def create_memory(memory: MemoryBase):
    async for db in get_db():
        mem_id = str(uuid.uuid4())
        await db.execute(
            "INSERT INTO memories (id, content, category) VALUES (?, ?, ?)",
            (mem_id, memory.content, memory.category)
        )
        await db.commit()
        return Memory(
            id=mem_id,
            content=memory.content,
            category=memory.category,
            created_at=datetime.now(),
        )


@router.get("/", response_model=list[Memory])
async def list_memories():
    async for db in get_db():
        cursor = await db.execute("SELECT * FROM memories ORDER BY created_at DESC")
        rows = await cursor.fetchall()
        return [Memory(**dict(row)) for row in rows]


@router.delete("/{memory_id}")
async def delete_memory(memory_id: str):
    async for db in get_db():
        await db.execute("DELETE FROM memories WHERE id = ?", (memory_id,))
        await db.commit()
        return {"status": "deleted"}
