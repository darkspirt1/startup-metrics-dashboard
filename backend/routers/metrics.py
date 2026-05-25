from fastapi import APIRouter
from datetime import datetime, timedelta
from database import get_connection

router = APIRouter()


@router.get("/metrics")
def get_metrics():
    conn = get_connection()

    today = datetime.now().date().isoformat()
    month_start = datetime.now().replace(day=1).date().isoformat()
    last_week = (datetime.now() - timedelta(days=7)).isoformat()

    dau = conn.execute(
        "SELECT COUNT(DISTINCT user_id) as cnt FROM sessions WHERE DATE(started_at) = ?",
        (today,)
    ).fetchone()["cnt"]

    mau = conn.execute(
        "SELECT COUNT(DISTINCT user_id) as cnt FROM sessions WHERE started_at >= ?",
        (month_start,)
    ).fetchone()["cnt"]

    wau = conn.execute(
        "SELECT COUNT(DISTINCT user_id) as cnt FROM sessions WHERE started_at >= ?",
        (last_week,)
    ).fetchone()["cnt"]

    wau_converted = conn.execute(
        """SELECT COUNT(DISTINCT user_id) as cnt FROM events
           WHERE event_type IN ('signup','purchase') AND occurred_at >= ?""",
        (last_week,)
    ).fetchone()["cnt"]

    dau_trend = []
    for i in range(6, -1, -1):
        d = (datetime.now() - timedelta(days=i)).date().isoformat()
        cnt = conn.execute(
            "SELECT COUNT(DISTINCT user_id) as cnt FROM sessions WHERE DATE(started_at) = ?",
            (d,)
        ).fetchone()["cnt"]
        dau_trend.append({"date": d, "dau": cnt})

    avg_session = conn.execute(
        "SELECT ROUND(AVG(duration_s)/60.0, 1) as avg FROM sessions WHERE started_at >= ?",
        (month_start,)
    ).fetchone()["avg"] or 0

    conn.close()

    return {
        "dau": dau,
        "mau": mau,
        "dau_mau_ratio": round((dau / mau * 100) if mau > 0 else 0, 1),
        "avg_session_min": avg_session,
        "north_star_metric": round((wau_converted / wau * 100) if wau > 0 else 0, 1),
        "north_star_label": "WAU engagement rate",
        "dau_trend": dau_trend,
    }
