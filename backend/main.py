from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import metrics, funnel, retention, insights

app = FastAPI(title="Startup Metrics API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    init_db()


app.include_router(metrics.router, prefix="/api")
app.include_router(funnel.router, prefix="/api")
app.include_router(retention.router, prefix="/api")
app.include_router(insights.router, prefix="/api")


@app.get("/")
def root():
    return {"status": "ok", "api": "Startup Metrics Dashboard"}
