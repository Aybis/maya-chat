import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import Project, ProjectCreate
from app.db.database import get_db
from app.services.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=Project)
async def create_project(project: ProjectCreate, user_id: str = Depends(get_current_user)):
    async for db in get_db():
        project_id = str(uuid.uuid4())
        await db.execute(
            "INSERT INTO projects (id, user_id, name, description, system_prompt) VALUES (?, ?, ?, ?, ?)",
            (project_id, user_id, project.name, project.description, project.system_prompt)
        )
        await db.commit()
        return Project(
            id=project_id,
            name=project.name,
            description=project.description,
            system_prompt=project.system_prompt,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )


@router.get("/", response_model=list[Project])
async def list_projects(user_id: str = Depends(get_current_user)):
    async for db in get_db():
        cursor = await db.execute("SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC", (user_id,))
        rows = await cursor.fetchall()
        return [Project(**dict(row)) for row in rows]


@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: str, user_id: str = Depends(get_current_user)):
    async for db in get_db():
        cursor = await db.execute("SELECT * FROM projects WHERE id = ? AND user_id = ?", (project_id, user_id))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Project not found")
        return Project(**dict(row))


@router.delete("/{project_id}")
async def delete_project(project_id: str, user_id: str = Depends(get_current_user)):
    async for db in get_db():
        await db.execute("DELETE FROM projects WHERE id = ? AND user_id = ?", (project_id, user_id))
        await db.commit()
        return {"status": "deleted"}
