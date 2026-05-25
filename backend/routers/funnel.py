from fastapi import APIRouter, Query
from database import get_connection

router = APIRouter()


@router.get("/funnel")
def get_funnel(
    device: str = Query(default="all"),
    source: str = Query(default="all"),
):
    conn = get_connection()

    where = []
    params = []
    if device != "all":
        where.append("u.device = ?")
        params.append(device)
    if source != "all":
        where.append("u.source = ?")
        params.append(source)

    user_filter = ("AND " + " AND ".join(where)) if where else ""

    total_users = conn.execute(
        f"SELECT COUNT(DISTINCT u.user_id) as cnt FROM users u WHERE 1=1 {user_filter}",
        params
    ).fetchone()["cnt"]

    def count_event(event_type):
        return conn.execute(
            f"""SELECT COUNT(DISTINCT e.user_id) as cnt
                FROM events e
                JOIN users u ON e.user_id = u.user_id
                WHERE e.event_type = ? {user_filter}""",
            [event_type] + params
        ).fetchone()["cnt"]

    visits = total_users
    signups = count_event("signup")
    carts = count_event("add_to_cart")
    purchases = count_event("purchase")

    def pct(n, d):
        return round(n / d * 100, 1) if d > 0 else 0

    stages = [
        {"stage": "Visit",       "users": visits,
            "pct_of_total": 100.0,                "drop_pct": None},
        {"stage": "Signup",      "users": signups,   "pct_of_total": pct(
            signups, visits),  "drop_pct": pct(visits - signups, visits)},
        {"stage": "Add to cart", "users": carts,     "pct_of_total": pct(
            carts, visits),    "drop_pct": pct(signups - carts, signups)},
        {"stage": "Purchase",    "users": purchases, "pct_of_total": pct(
            purchases, visits), "drop_pct": pct(carts - purchases, carts)},
    ]

    conn.close()
    return {
        "filters": {"device": device, "source": source},
        "stages": stages,
        "biggest_leakage": max(stages[1:], key=lambda s: s["drop_pct"] or 0)["stage"],
        "overall_conversion_pct": pct(purchases, visits),
    }
