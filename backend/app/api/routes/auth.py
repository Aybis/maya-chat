import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.db.database import get_db
from app.services.auth import hash_password, verify_password, create_token

router = APIRouter()


@router.post("/register")
async def register(request: dict):
    """Register a new user."""
    email = request.get("email", "").strip().lower()
    username = request.get("username", "").strip()
    password = request.get("password", "")

    if not email or not username or not password:
        raise HTTPException(status_code=400, detail="Email, username, and password required")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    async for db in get_db():
        # Check if user exists
        cursor = await db.execute(
            "SELECT id FROM users WHERE email = ? OR username = ?",
            (email, username)
        )
        if await cursor.fetchone():
            raise HTTPException(status_code=409, detail="Email or username already taken")

        # Create user
        user_id = str(uuid.uuid4())
        password_hash = hash_password(password)
        await db.execute(
            "INSERT INTO users (id, email, username, password_hash) VALUES (?, ?, ?, ?)",
            (user_id, email, username, password_hash)
        )
        await db.commit()

        token = create_token(user_id)
        return {
            "token": token,
            "user": {
                "id": user_id,
                "email": email,
                "username": username,
            }
        }


@router.post("/login")
async def login(request: dict):
    """Login existing user."""
    email = request.get("email", "").strip().lower()
    password = request.get("password", "")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")

    async for db in get_db():
        cursor = await db.execute(
            "SELECT id, email, username, password_hash FROM users WHERE email = ?",
            (email,)
        )
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if not verify_password(password, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = create_token(row["id"])
        return {
            "token": token,
            "user": {
                "id": row["id"],
                "email": row["email"],
                "username": row["username"],
            }
        }


@router.get("/me")
async def get_me(user_id: str = None):
    """Get current user profile."""
    # This will be used with auth dependency later
    async for db in get_db():
        cursor = await db.execute(
            "SELECT id, email, username, avatar_url, created_at FROM users WHERE id = ?",
            (user_id,)
        )
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        return {
            "id": row["id"],
            "email": row["email"],
            "username": row["username"],
            "avatar_url": row["avatar_url"],
            "created_at": row["created_at"],
        }
