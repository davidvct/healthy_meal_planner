# MealWise

MealWise is a health-aware weekly meal planning app for Singaporean elderly users. The current stack is:

- frontend: React + Vite
- backend: FastAPI
- database: PostgreSQL via `psycopg`
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
│   │   ├── health.py
│   │   ├── mealplan.py
│   │   ├── shopping_list.py
│   │   └── users.py
│   └── services
│       ├── core.py
│       ├── inputs.py
│       ├── models.py
│       ├── nutrient_calculator.py
│       ├── recommendation_engine.py
│       └── shopping_list_generator.py
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
            ├── CaretakerSetup.jsx
            ├── DinerDashboard.jsx
            ├── OnboardingScreen.jsx
            ├── CalendarScreen.jsx
            ├── AddDishModal.jsx
            ├── MealSlotDetail.jsx
            ├── DishCard.jsx
            ├── DishDetail.jsx
            ├── RecipeViewModal.jsx
            ├── ShoppingListPanel.jsx
            ├── NutrientSummaryPanel.jsx
            └── ui
                ├── FilterChip.jsx
                ├── NutrientBar.jsx
                ├── NutritionBarChart.jsx
                ├── ScoreBadge.jsx
                └── WarningTag.jsx
```

## Running Locally

Open two terminals from the project root.

### Backend

Create or activate your virtual environment, install Python dependencies, and start FastAPI:

```bash
python3 -m venv .venv
. .venv/bin/activate
python3 -m pip install -e .
.venv/bin/uvicorn backend.main:app --reload
```

The backend runs at `http://127.0.0.1:8000`.

Configuration:

- the backend reads real environment variables first, then falls back to `application.properties`
- `.env` is not auto-loaded by the backend process
- `DATABASE_URL` must be a PostgreSQL URL
- on startup, the backend runs schema initialization/migrations via `backend.db.init_db()`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` and proxies `/api/*` requests to the backend.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/request-otp` | Request email OTP |
| `POST` | `/api/auth/verify-otp` | Verify OTP |
| `POST` | `/api/auth/register` | Register account |
| `POST` | `/api/auth/login` | Login and get bearer token |
| `POST` | `/api/caretakers` | Create caretaker |
| `GET` | `/api/caretakers/by-auth/{auth_user_id}` | Load caretaker by auth user |
| `GET` | `/api/caretakers/{caretaker_id}/diners` | List family members |
| `GET` | `/api/dishes` | List dishes |
| `GET` | `/api/dishes/recommend/{user_id}` | Get filtered/scored dishes |
| `GET` | `/api/mealplan/{user_id}` | Read weekly meal plan |
| `POST` | `/api/mealplan/{user_id}/add` | Add one meal plan entry |
| `POST` | `/api/mealplan/{user_id}/generate` | Run solver and persist generated rows into `meal_plans` |
| `POST` | `/api/mealplan/{user_id}/autofill/validate` | Validate fixed assignments before auto-fill |
| `POST` | `/api/mealplan/{user_id}/autofill` | Auto-fill empty slots (paid tier) |
| `DELETE` | `/api/mealplan/{user_id}/clear` | Clear unblocked meals in a selected week |
| `DELETE` | `/api/mealplan/{user_id}/remove/{entry_id}` | Delete one meal plan entry |
| `GET` | `/api/mealplan/{user_id}/nutrients/week` | Weekly nutrients |
| `GET` | `/api/mealplan/{user_id}/nutrients/day/{day_index}` | Daily nutrients |
| `GET` | `/api/shopping-list/{user_id}` | Shopping list |
| `POST` | `/api/shopping-list/{user_id}/toggle-selection` | Toggle shopping selection |
| `POST` | `/api/users/profile` | Create or update diner profile |
| `GET` | `/api/users/{user_id}` | Get profile |
| `DELETE` | `/api/users/{user_id}` | Delete profile |
| `GET` | `/api/thresholds/nutrients` | List available nutrients with RDA defaults |
| `GET` | `/api/thresholds/{user_id}` | Get saved nutrient thresholds for a user |
| `PUT` | `/api/thresholds/{user_id}` | Save/replace nutrient thresholds for a user |
| `GET` | `/api/health` | Health check |

## Testing the API

You can test the FastAPI backend locally with Postman.

### 1. Start the backend

From the project root:

```bash
.venv/bin/uvicorn backend.main:app --reload
```

The API will be available at **http://127.0.0.1:8000**.

### 2. Get a JWT token

Most `/api/*` routes require a bearer token. First call the login endpoint:

- Method: `POST`
- URL: `http://127.0.0.1:8000/api/auth/login`
- Header: `Content-Type: application/json`
- Body:

```json
{
  "email": "your-email@example.com",
  "password": "YourPassword123!"
}
```

Copy the `token` value from the response.

### 3. Call the meal plan generator

- Method: `POST`
- URL: `http://127.0.0.1:8000/api/mealplan/{user_id}/generate`
- Headers:

```text
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

- Body:

```json
{
  "weekStart": "2026-03-09",
  "days": 3,
  "maxSolutions": 1
}
```

### 4. Validate and run auto-fill

Auto-fill uses two separate frontend inputs:

- `Auto-fill Settings`
  - `maxDishesPerSlot`
  - `maxCalories`
  - `maxCarbs`
  - `maxFat`
- `Threshold`
  - daily nutrient targets such as `calories`, `protein`, `carbs`, and `fat`

Recommended request flow:

1. Validate existing fixed meals for the selected week.

- Method: `POST`
- URL: `http://127.0.0.1:8000/api/mealplan/{user_id}/autofill/validate`
- Headers:

```text
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

- Body:

```json
{
  "weekStart": "2026-03-16",
  "settings": {
    "maxDishesPerSlot": 2,
    "maxCalories": 500,
    "maxCarbs": 200,
    "maxFat": 30
  },
  "thresholds": [
    { "nutrientKey": "calories", "dailyValue": 2400, "perMealValue": 800 },
    { "nutrientKey": "protein", "dailyValue": 75, "perMealValue": 25 },
    { "nutrientKey": "carbs", "dailyValue": 325, "perMealValue": 108 },
    { "nutrientKey": "fat", "dailyValue": 90, "perMealValue": 30 }
  ]
}
```

If violations are found, the frontend shows a warning and lets the user decide whether to proceed.

2. Run auto-fill.

- Method: `POST`
- URL: `http://127.0.0.1:8000/api/mealplan/{user_id}/autofill`

Use the same body as validation, and add:

```json
{
  "allowConstraintRelaxation": true
}
```

only after the user explicitly acknowledges existing fixed-assignment violations.

Behavior summary:

- new solver-picked meals must satisfy the current settings and thresholds
- existing fixed meals are blocking by default
- existing fixed-meal violations can be relaxed after user confirmation
- if no feasible solution is found, the frontend shows a popup and leaves the plan unchanged

### 5. Health check

To confirm the backend is up:

- Method: `GET`
- URL: `http://127.0.0.1:8000/api/health`

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite | UI rendering |
| Backend | FastAPI (Python) | REST API and business logic |
| Database | PostgreSQL 16 on Cloud SQL | Managed cloud database (GCP asia-southeast1) |
| Solver | OR-Tools CP-SAT | Meal plan generation |
| Charts | Recharts (optional, CDN) | Weekly nutrition bar chart |
