from fastapi import APIRouter
from datetime import datetime, timedelta
from database import get_connection

router = APIRouter()


@router.get("/retention")
def get_retention():
    conn = get_connection()

    cohort_start = (datetime.now() - timedelta(days=30)).isoformat()

    cohort = conn.execute(
        "SELECT user_id FROM users WHERE signed_up >= ?",
        (cohort_start,)
    ).fetchall()

    cohort_ids = [r["user_id"] for r in cohort]
    cohort_size = len(cohort_ids)

    if not cohort_ids:
        return {"cohort_size": 0, "milestones": [], "curve": []}

    placeholders = ",".join("?" for _ in cohort_ids)

    curve = []
    for day in range(1, 31):
        active = conn.execute(
            f"""SELECT COUNT(DISTINCT s.user_id) as cnt
                FROM sessions s
                JOIN users u ON s.user_id = u.user_id
                WHERE s.user_id IN ({placeholders})
                AND s.started_at >= datetime(u.signed_up, '+{day} days')""",
            cohort_ids
        ).fetchone()["cnt"]
        curve.append({
            "day": day,
            "retention_pct": round(active / cohort_size * 100, 1)
        })

    milestones = [c for c in curve if c["day"] in [1, 7, 14, 30]]

    conn.close()
    return {
        "cohort_size": cohort_size,
        "milestones": milestones,
        "curve": curve,
        "day7_retention": next((c["retention_pct"] for c in curve if c["day"] == 7), None),
    }
