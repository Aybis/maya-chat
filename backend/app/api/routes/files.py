import os
import uuid
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.db.database import get_db

router = APIRouter()

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_file(file: UploadFile = File(...), conversation_id: str = None):
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    filepath = os.path.join(UPLOAD_DIR, f"{file_id}{file_ext}")

    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    async for db in get_db():
        await db.execute(
            "INSERT INTO files (id, filename, filepath, mime_type, size, conversation_id) VALUES (?, ?, ?, ?, ?, ?)",
            (file_id, file.filename, filepath, file.content_type, len(content), conversation_id)
        )
        await db.commit()

    return {
        "id": file_id,
        "filename": file.filename,
        "size": len(content),
        "mime_type": file.content_type,
    }
