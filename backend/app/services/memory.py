import json
import uuid
from app.db.database import get_db

async def get_memories_context() -> str:
    """Format memories for inclusion in system prompt."""
    async for db in get_db():
        cursor = await db.execute(
            "SELECT content, category FROM memories ORDER BY created_at DESC LIMIT 20"
        )
        rows = await cursor.fetchall()
        
        if not rows:
            return ""
        
        memory_lines = ["## User Memories\n"]
        for row in rows:
            memory_lines.append(f"- [{row['category']}] {row['content']}")
        
        return "\n".join(memory_lines)

async def search_memories(query: str) -> list[dict]:
    """Search memories by content."""
    async for db in get_db():
        cursor = await db.execute(
            "SELECT * FROM memories WHERE content LIKE ? ORDER BY created_at DESC LIMIT 10",
            (f"%{query}%",)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
