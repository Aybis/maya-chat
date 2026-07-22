import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.models.schemas import Project, ProjectCreate
from app.db.database import get_db

router = APIRouter()


@router.post("/", response_model=Project)
async def create_project(project: ProjectCreate):
    async for db in get_db():
        project_id = str(uuid.uuid4())
        await db.execute(
            "INSERT INTO projects (id, name, description, system_prompt) VALUES (?, ?, ?, ?)",
            (project_id, project.name, project.description, project.system_prompt)
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
async def list_projects():
    async for db in get_db():
        cursor = await db.execute("SELECT * FROM projects ORDER BY updated_at DESC")
        rows = await cursor.fetchall()
        return [Project(**dict(row)) for row in rows]


@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: str):
    async for db in get_db():
        cursor = await db.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Project not found")
        return Project(**dict(row))


@router.delete("/{project_id}")
async def delete_project(project_id: str):
    async for db in get_db():
        await db.execute("DELETE FROM projects WHERE id = ?", (project_id,))
        await db.commit()
        return {"status": "deleted"}
