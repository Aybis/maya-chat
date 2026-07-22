# Maya Chat

A full-featured Claude-style AI chat application with multi-provider support.

## Quick Start

### Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

### Frontend
cd frontend
npm install
npm run dev
