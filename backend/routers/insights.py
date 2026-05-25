from fastapi import APIRouter
from datetime import datetime
from routers.funnel import get_funnel
from routers.metrics import get_metrics
from routers.retention import get_retention

router = APIRouter()


@router.get("/insights")
def get_insights():
    metrics = get_metrics()
    funnel = get_funnel(device="all", source="all")
    retention = get_retention()
    mobile = get_funnel(device="mobile", source="all")
    desktop = get_funnel(device="desktop", source="all")

    issues = []
    fixes = []

    if metrics["dau_mau_ratio"] < 20:
        issues.append({
            "severity": "high",
            "title": "DAU/MAU below healthy threshold",
            "detail": f"At {metrics['dau_mau_ratio']}%, users visit ~{round(metrics['dau_mau_ratio']/100*30)} days/month. SaaS benchmark is 20-25%.",
        })
        fixes.append("Add daily email digest to re-engage dormant users")
        fixes.append("Trigger a Day-3 nudge with a personalised prompt")

    purchase_stage = next(
        s for s in funnel["stages"] if s["stage"] == "Purchase")
    if purchase_stage["drop_pct"] and purchase_stage["drop_pct"] > 60:
        issues.append({
            "severity": "high",
            "title": "Critical checkout drop-off",
            "detail": f"{purchase_stage['drop_pct']}% of cart users abandon at checkout.",
        })
        fixes.append("Reduce checkout to 2 steps — enable guest checkout")
        fixes.append("Show total cost before checkout begins")

    if retention["day7_retention"] and retention["day7_retention"] < 40:
        issues.append({
            "severity": "medium",
            "title": f"Day-7 retention is only {retention['day7_retention']}%",
            "detail": "Users drop off sharply after day 14. Product is not sticky enough.",
        })
        fixes.append("Show a first value moment within first 3 sessions")
        fixes.append("Add onboarding checklist with small wins")

    m_signup = next(s["pct_of_total"]
                    for s in mobile["stages"] if s["stage"] == "Signup")
    d_signup = next(s["pct_of_total"]
                    for s in desktop["stages"] if s["stage"] == "Signup")
    if d_signup > 0 and (d_signup - m_signup) / d_signup > 0.15:
        issues.append({
            "severity": "medium",
            "title": f"Mobile signup is {round(d_signup - m_signup, 1)}pp lower than desktop",
            "detail": f"Mobile: {m_signup}% vs Desktop: {d_signup}%. Mobile UX needs rework.",
        })
        fixes.append("Move CTA above the fold on mobile")
        fixes.append("Reduce mobile signup form to email and password only")

    return {
        "generated_at": datetime.now().isoformat(),
        "issues": issues,
        "fixes": fixes,
        "overall_health": "needs_attention" if any(i["severity"] == "high" for i in issues) else "fair",
    }
