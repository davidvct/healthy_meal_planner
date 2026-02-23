# MealWise — Smart Meal Planner

A health-aware weekly meal planning app for Singaporean elderly users, with dynamic dish recommendations, nutrient tracking, and shopping list generation.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later (includes npm)

## Project Structure

```
project/
├── frontend/                          # React + Vite (UI only)
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.jsx                # Root component (profile state, routing)
│   │   │   ├── OnboardingScreen.jsx   # 3-step health profile wizard
│   │   │   ├── CalendarScreen.jsx     # Weekly planner grid + header
│   │   │   ├── AddDishModal.jsx       # Dish recommendation list with filters
│   │   │   ├── DishCard.jsx           # Single dish card in recommendation list
│   │   │   ├── DishDetail.jsx         # Slide-up panel: servings, ingredients, recipe
│   │   │   ├── RecipeViewModal.jsx    # Full-screen recipe for cooking mode
│   │   │   ├── ShoppingListPanel.jsx  # Aggregated weekly shopping list
│   │   │   ├── NutrientSummaryPanel.jsx # Weekly nutrition overview + chart
│   │   │   └── ui/                    # Reusable UI atoms
│   │   │       ├── NutrientBar.jsx
│   │   │       ├── ScoreBadge.jsx
│   │   │       ├── WarningTag.jsx
│   │   │       └── FilterChip.jsx
│   │   ├── constants/
│   │   │   ├── colors.js             # Theme color palette
│   │   │   └── mealTypes.js          # MEAL_TYPES, DAYS, RDA values
│   │   ├── services/
│   │   │   └── api.js                # HTTP client for all backend API calls
│   │   └── index.jsx                 # Entry point
│   ├── index.html
│   ├── vite.config.js                # Dev server + proxy /api → backend
│   └── package.json
│
├── backend/                           # Express.js + SQLite
│   ├── src/
│   │   ├── server.js                 # Express entry point (port 8080)
│   │   ├── db.js                     # SQLite connection, schema, auto-seeding
│   │   ├── routes/
│   │   │   ├── dishes.js             # GET /api/dishes, GET /api/dishes/:id,
│   │   │   │                         # GET /api/dishes/recommend/:userId
│   │   │   ├── mealplan.js           # GET/POST/DELETE meal plan entries,
│   │   │   │                         # GET weekly & daily nutrient summaries
│   │   │   ├── shoppingList.js       # GET /api/shopping-list/:userId
│   │   │   └── users.js             # POST /api/users/profile, GET/DELETE user
│   │   ├── services/                 # Business logic (testable independently)
│   │   │   ├── nutrientCalculator.js # Nutrient math for dishes, days, weeks
│   │   │   ├── recommendationEngine.js # Dish scoring, filtering, warnings
│   │   │   └── shoppingListGenerator.js # Ingredient aggregation
│   │   └── data/                     # Seed data (loaded into SQLite on first run)
│   │       ├── ingredients.js        # Nutritional values per 100g
│   │       ├── dishes.js             # 10 Singaporean dishes with ingredients
│   │       ├── recipes.js            # Step-by-step cooking instructions
│   │       └── conditionRules.js     # Health condition thresholds
│   ├── mealwise.db                   # SQLite database (auto-created on first run)
│   └── package.json
│
├── shared/                            # Constants shared by frontend & backend
│   └── nutrientKeys.js               # NUTRIENT_KEYS, RDA
│
├── mealplan-app.jsx                   # Original monolithic prototype (reference)
├── architecture.md                    # System architecture & API design
├── flow.md                            # User flow documentation
├── dev_phase.md                       # Development phase roadmap
└── planning.md                        # Recommendation scoring design
```

## Running Locally

Open **two terminals** from the project root:

### Terminal 1 — Start the Backend

```bash
cd backend
npm install
npm run dev
```

The backend starts on **http://localhost:8080**. On first run, it automatically creates `mealwise.db` and seeds it with all dish, ingredient, and recipe data.

### Terminal 2 — Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on **http://localhost:3000**. Vite's dev server automatically proxies all `/api/*` requests to the backend at `localhost:8080`.

### Open the App

Visit **http://localhost:3000** in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dishes` | List all dishes |
| `GET` | `/api/dishes/:id` | Dish detail with recipe and nutrients |
| `GET` | `/api/dishes/recommend/:userId` | Scored + filtered recommendations for a meal slot |
| `GET` | `/api/mealplan/:userId` | Retrieve weekly meal plan |
| `POST` | `/api/mealplan/:userId/add` | Add a dish to a meal slot |
| `DELETE` | `/api/mealplan/:userId/remove/:entryId` | Remove a dish from the plan |
| `GET` | `/api/mealplan/:userId/nutrients/week` | Weekly nutrient summary |
| `GET` | `/api/mealplan/:userId/nutrients/day/:dayIndex` | Single day nutrient totals |
| `GET` | `/api/shopping-list/:userId` | Aggregated weekly shopping list |
| `POST` | `/api/users/profile` | Create or update user profile |
| `GET` | `/api/users/:id` | Get user profile |
| `DELETE` | `/api/users/:id` | Delete user and their meal plans |
| `GET` | `/api/health` | Backend health check |

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite | UI rendering and dev server |
| Backend | Express.js (Node.js) | REST API and business logic |
| Database | SQLite (via better-sqlite3) | Local data storage, zero-config |
| Charts | Recharts (optional, CDN) | Weekly nutrition bar chart |

**Phase 3 migration:** SQLite will be swapped for PostgreSQL when deploying to cloud. See `dev_phase.md` for the full roadmap.
