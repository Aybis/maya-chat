from datetime import date
from fastapi import APIRouter, Query
from app.services.token_tracker import get_usage_summary, get_daily_usage

router = APIRouter()


@router.get("/usage/summary")
async def usage_summary(
    start_date: str = Query(default=None),
    end_date: str = Query(default=None),
):
    """Get token usage summary for a date range."""
    start = date.fromisoformat(start_date) if start_date else date.today()
    end = date.fromisoformat(end_date) if end_date else date.today()
    return await get_usage_summary(start, end)


@router.get("/usage/daily")
async def daily_usage(days: int = Query(default=30, le=365)):
    """Get daily usage trend."""
    return await get_daily_usage(days)


@router.get("/usage/today")
async def today_usage():
    """Get today's usage."""
    return await get_usage_summary(date.today(), date.today())
