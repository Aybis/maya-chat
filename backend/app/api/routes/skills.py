import uuid
from datetime import datetime
from fastapi import APIRouter, Depends
from app.models.schemas import Skill, SkillBase
from app.db.database import get_db
from app.services.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=Skill)
async def create_skill(skill: SkillBase, user_id: str = Depends(get_current_user)):
    async for db in get_db():
        skill_id = str(uuid.uuid4())
        await db.execute(
            "INSERT INTO skills (id, user_id, name, description, prompt_template, is_active) VALUES (?, ?, ?, ?, ?, ?)",
            (skill_id, user_id, skill.name, skill.description, skill.prompt_template, skill.is_active)
        )
        await db.commit()
        return Skill(
            id=skill_id,
            name=skill.name,
            description=skill.description,
            prompt_template=skill.prompt_template,
            is_active=skill.is_active,
            created_at=datetime.now(),
        )


@router.get("/", response_model=list[Skill])
async def list_skills(user_id: str = Depends(get_current_user)):
    async for db in get_db():
        cursor = await db.execute("SELECT * FROM skills WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        rows = await cursor.fetchall()
        return [Skill(**dict(row)) for row in rows]


@router.delete("/{skill_id}")
async def delete_skill(skill_id: str, user_id: str = Depends(get_current_user)):
    async for db in get_db():
        await db.execute("DELETE FROM skills WHERE id = ? AND user_id = ?", (skill_id, user_id))
        await db.commit()
        return {"status": "deleted"}
