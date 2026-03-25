# MealVitals

MealVitals is a health-aware weekly meal planning app for Singaporean elderly users. The current stack is:

- frontend: React + Vite
- backend: FastAPI
- database: PostgreSQL via SQLAlchemy (async) + `psycopg`
- solver: OR-Tools CP-SAT

Solver-related UX notes:

- auto-fill is solver-based and runs against the currently selected calendar week
- the frontend sends both `Auto-fill Settings` and `Threshold` values to the backend
- existing saved meals are treated as fixed assignments during auto-fill
- fixed-assignment violations are validated first and can be acknowledged by the user before proceeding

## Prerequisites

- Python 3.13+
- Node.js 18+
- a PostgreSQL database reachable through `DATABASE_URL`

## Project Structure

```text
.
├── README.md
├── pyproject.toml
├── application.properties
├── Dockerfile
├── docker-compose.yml
├── .env
├── backend
│   ├── main.py
│   ├── db.py
│   ├── config.py
│   ├── schemas.py
│   ├── security.py
│   ├── utils.py
│   ├── data.py
│   ├── constants.py
│   ├── routers
│   │   ├── auth.py
│   │   ├── caretakers.py
│   │   ├── dishes.py
│   │   ├── favourites.py
│   │   ├── health.py
│   │   ├── mealplan.py
│   │   ├── shopping_list.py
│   │   ├── thresholds.py
│   │   └── users.py
│   └── services
│       ├── core.py
│       ├── dish_candidate.py
│       ├── inputs.py
│       ├── models.py
│       ├── nutrient_calculator.py
│       ├── profile_loader.py
│       ├── recommendation_engine.py
│       ├── shopping_list_generator.py
│       └── solver
│           ├── core.py
│           ├── inputs.py
│           └── models.py
└── frontend
    ├── package.json
    ├── vite.config.js
    └── src
        ├── index.jsx
        ├── services
        │   └── api.js
        ├── constants
        │   ├── colors.js
        │   └── mealTypes.js
        └── components
            ├── App.jsx
            ├── AuthScreen.jsx
            ├── AutofillSettingsModal.jsx
            ├── CaretakerSetup.jsx
            ├── DateRangePicker.jsx
            ├── DayStrip.jsx
            ├── DiscoverScreen.jsx
            ├── MealCard.jsx
            ├── MealSlotCard.jsx
            ├── NutritionChart.jsx
            ├── NutritionPanel.jsx
            ├── OnboardingScreen.jsx
            ├── PlanSettingsModal.jsx
            ├── ProfilesScreen.jsx
            ├── ShoppingScreen.jsx
            ├── ThresholdSettingsModal.jsx
            ├── TodayScreen.jsx
            └── UpgradePromptModal.jsx
```

## Running Locally

Open two terminals from the project root.

### Backend

Install dependencies with [uv](https://docs.astral.sh/uv/) and start FastAPI:

```bash
uv run uvicorn backend.main:app --reload --port 8080
```

The backend runs at `http://127.0.0.1:8080`.

Configuration:

- the backend loads `.env` in the project root automatically (via `python-dotenv`), then falls back to `application.properties`
- environment variables always take priority over both files
- `DATABASE_URL` must be a PostgreSQL URL
- for local development, create a `.env` file with your database connection (see `.env.example`)
- on startup, the backend runs schema initialization/migrations via `backend.db.init_db()`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` and proxies `/api/*` requests to the backend.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite | UI rendering |
| Backend | FastAPI (Python) | REST API and business logic |
| Database | PostgreSQL 16 on Cloud SQL | Managed cloud database (GCP asia-southeast1) |
| Solver | OR-Tools CP-SAT | Meal plan generation |
| Containerisation | Docker + Docker Compose | Local and cloud deployment |
