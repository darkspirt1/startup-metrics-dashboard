# Startup Metrics Dashboard

A full-stack product analytics dashboard built to demonstrate PM and data analyst skills.

## Live Demo
- **Frontend:**https://startup-metrics-dashboard-eedm0c8yo-sahil-d-projects.vercel.app
- **Backend API:** https://startup-metrics-dashboard-076v.onrender.com
- **API Docs:** https://startup-metrics-dashboard-076v.onrender.com/docs

## What it does

Tracks key startup health metrics with real SQL queries, a REST API, and an interactive React frontend.

### Metrics covered
- DAU / MAU and stickiness ratio
- North Star Metric — WAU engagement rate
- Cohort retention curve — Day 1 to Day 30
- Conversion funnel — Visit → Signup → Add to cart → Purchase
- Funnel segmentation by device and traffic source
- Auto-generated insights with fix recommendations

## Tech stack

| Layer    | Technology       |
|----------|------------------|
| Database | SQLite + Python  |
| Backend  | FastAPI (Python) |
| Frontend | React + Recharts |

## Project structure
startup_dashboard/
├── backend/
│   ├── main.py          — app setup and router registration
│   ├── database.py      — schema and seed data generator
│   └── routers/
│       ├── metrics.py   — DAU, MAU, North Star Metric
│       ├── funnel.py    — conversion funnel with filters
│       ├── retention.py — cohort retention curve
│       └── insights.py  — auto-generated insights
├── frontend/
│   └── src/
│       └── App.jsx      — React dashboard with 4 tabs
└── README.md

## Running locally

### Backend
```bash
cd backend
pip install fastapi uvicorn pandas
uvicorn main:app --reload --port 8000
```

API docs available at http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Dashboard available at http://localhost:5173

## API endpoints

| Endpoint | Description |
|----------|-------------|
| GET /api/metrics | DAU, MAU, North Star Metric, 7-day trend |
| GET /api/funnel | Conversion funnel with device and source filters |
| GET /api/retention | Cohort retention milestones and curve |
| GET /api/insights | Auto-generated issues and fix recommendations |

## Key findings from the data

- 88% checkout drop-off — critical friction in the purchase flow
- Mobile signup is 28pp lower than desktop — mobile UX needs rework
- DAU/MAU ratio below 20% benchmark — product needs habit-forming features
- Day-30 retention near zero — users churn after 2 weeks

## Skills demonstrated

- SQL query design for cohort and funnel analysis
- REST API design with query parameter filtering
- React state management and live API integration
- Product thinking — NSM definition, insight generation, fix recommendations
- Clean code architecture with separated routers

---
Built as a portfolio project for PM and Data Analyst roles