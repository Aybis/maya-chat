#!/usr/bin/env python3
"""Initialize the database and create tables."""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import init_db


async def main():
    print("🔄 Creating database tables...")
    await init_db()
    print("✅ Database initialized successfully!")
    print(f"📁 Database file: {os.path.abspath('maya_chat.db')}")


if __name__ == "__main__":
    asyncio.run(main())
