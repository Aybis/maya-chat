from datetime import date
from fastapi import APIRouter, Query, Depends
from app.services.token_tracker import get_usage_summary, get_daily_usage
from app.services.auth import get_current_user

router = APIRouter()


@router.get("/usage/summary")
async def usage_summary(
    start_date: str = Query(default=None),
    end_date: str = Query(default=None),
    user_id: str = Depends(get_current_user),
):
    """Get token usage summary for a date range."""
    start = date.fromisoformat(start_date) if start_date else date.today()
    end = date.fromisoformat(end_date) if end_date else date.today()
    return await get_usage_summary(user_id, start, end)


@router.get("/usage/daily")
async def daily_usage(
    days: int = Query(default=30, le=365),
    user_id: str = Depends(get_current_user),
):
    """Get daily usage trend."""
    return await get_daily_usage(user_id, days)


@router.get("/usage/today")
async def today_usage(user_id: str = Depends(get_current_user)):
    """Get today's usage."""
    return await get_usage_summary(user_id, date.today(), date.today())
