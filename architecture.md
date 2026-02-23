# Architecture Document: MealWise App

This document outlines the high-level architecture for both the Frontend and Backend of the MealWise application, along with the data storage structure.

## 1. High-Level Architecture

The system is designed as a modular client-server web application that runs locally during development and is prepared for eventual migration to cloud platforms (GCP/AWS).

```
+---------------------------+        +-----------------------------+        +--------------------+
|   Frontend (React + Vite) |  HTTP  |   Backend (Express.js)      |        |   Database         |
|   localhost:3000           | -----> |   localhost:8080             | -----> |   SQLite           |
|                           |        |                             |        |   (mealwise.db)    |
|  - OnboardingScreen       |  /api  |  Routes:                    |        |                    |
|  - CalendarScreen         | -----> |  - /api/dishes              |        |  - ingredients     |
|  - AddDishModal           |        |  - /api/dishes/recommend    |        |  - dishes          |
|  - NutrientSummaryPanel   |        |  - /api/mealplan            |        |  - recipes         |
|  - ShoppingListPanel      |        |  - /api/shopping-list       |        |  - users           |
|  - RecipeViewModal        |        |  - /api/users               |        |  - meal_plans      |
+---------------------------+        +-----------------------------+        +--------------------+
                                              |
                                     Services (business logic):
                                     - nutrientCalculator.js
                                     - recommendationEngine.js
                                     - shoppingListGenerator.js
```

### 1.1 Frontend (Client-Side)
*   **Framework:** React 18 with Vite as the build tool and dev server.
*   **Architecture:** Single Page Application. Components are split into modular files under `frontend/src/components/` for parallel development by multiple developers.
*   **UI/UX:** Intuitive, grid-based layout optimized for elderly users and responsive for mobile compatibility.
*   **State Management:** React state/hooks for local UI state. All data is fetched from the backend REST API via the `api.js` service layer.
*   **Dev Server Proxy:** Vite proxies all `/api/*` requests to the backend at `localhost:8080`, eliminating CORS issues during development.
*   **Cloud Deployment (Phase 3):**
    *   *AWS:* S3 + CloudFront
    *   *GCP:* Firebase Hosting or Cloud Storage with Cloud CDN.

### 1.2 Backend (Server-Side)
*   **Framework:** Express.js (Node.js) — RESTful API.
*   **Database:** SQLite (via `better-sqlite3`) for local development. Auto-creates the database file and seeds all dish/ingredient/recipe data on first run. **Phase 3 migration** will swap to PostgreSQL with minimal query changes.
*   **Business Logic:** All scoring, nutrient calculation, filtering, and aggregation logic lives in the `services/` directory, separated from route handlers for testability.
*   **Cloud Deployment (Phase 3):**
    *   *AWS:* EC2, ECS, or Lambda (Serverless) + API Gateway
    *   *GCP:* Cloud Run or App Engine

### 1.3 Recommendation Engine
*   **Current State:** The recommendation engine runs server-side in `backend/src/services/recommendationEngine.js`. The frontend calls `GET /api/dishes/recommend/:userId` and receives pre-scored, pre-filtered results — no business logic in the browser.
*   **Future Enhancements:**
    *   **Larger dish databases** — server-side filtering scales to thousands of dishes without impacting frontend performance.
    *   **ML-based personalisation** — collaborative filtering models can run server-side in future phases.
    *   **Shared computation across users** — pre-computed scores and ranked shortlists can be cached and reused.
*   **Scoring Weights** (per `planning.md`):
    *   **Health condition safety** — 60% of total score (hard constraints: sodium, sugar, cholesterol thresholds per condition)
    *   **Nutrient balance** — 30% of total score (macro targets: calories, protein, carbs, fat, fiber)
    *   **User preference** — 10% of total score (dietary tags, allergen exclusions, cuisine preferences)

---

## 2. Data Storage Schema

The database is implemented in SQLite for local development. The schema is defined in `backend/src/db.js` and auto-migrated on startup.

### Table: `ingredients`
Stores the exact nutritional value per 100g of each ingredient.
*   **`id`** (TEXT, Primary Key) — e.g., "chicken breast"
*   **`calories`** (REAL) — in kcal
*   **`protein_g`** (REAL) — in grams
*   **`carbs_g`** (REAL) — in grams
*   **`fat_g`** (REAL) — in grams
*   **`fiber_g`** (REAL) — in grams
*   **`sodium_mg`** (REAL) — in milligrams
*   **`cholesterol_mg`** (REAL) — in milligrams
*   **`sugar_g`** (REAL) — in grams

### Table: `dishes`
Stores all available dishes, mapped to their required ingredients and metadata.
*   **`id`** (TEXT, Primary Key) — e.g., "d1"
*   **`name`** (TEXT) — e.g., "Hainanese Chicken Rice"
*   **`meal_types`** (TEXT, JSON array) — e.g., `["lunch", "dinner"]`
*   **`tags`** (TEXT, JSON array) — e.g., `["singaporean", "classic"]`
*   **`ingredients`** (TEXT, JSON object) — maps ingredient IDs to grams, e.g., `{"chicken breast": 200, "rice": 250}`
*   **`recipe_id`** (TEXT, FK → recipes) — links to cooking instructions
*   **`base_servings`** (INTEGER, default 1)

### Table: `recipes`
Stores cooking steps and timing for each dish.
*   **`id`** (TEXT, Primary Key) — e.g., "r1"
*   **`name`** (TEXT)
*   **`prep_time`** (INTEGER) — in minutes
*   **`cook_time`** (INTEGER) — in minutes
*   **`steps`** (TEXT, JSON array) — ordered list of instruction strings

### Table: `users`
Stores user health profiles.
*   **`id`** (TEXT, Primary Key, UUID)
*   **`conditions`** (TEXT, JSON array) — e.g., `["High Blood Sugar", "Hypertension"]`
*   **`diet`** (TEXT) — e.g., "vegetarian", "none"
*   **`allergies`** (TEXT, JSON array) — e.g., `["egg", "peanut"]`
*   **`created_at`** (TEXT, datetime)

### Table: `meal_plans`
Stores the user's weekly meal plan entries.
*   **`id`** (INTEGER, Primary Key, auto-increment)
*   **`user_id`** (TEXT, FK → users)
*   **`day_index`** (INTEGER) — 0 = Monday, 6 = Sunday
*   **`meal_type`** (TEXT) — "breakfast", "lunch", "dinner", or "snack"
*   **`dish_id`** (TEXT, FK → dishes)
*   **`servings`** (REAL, default 1)
*   **`custom_ingredients`** (TEXT, JSON, nullable) — user-modified ingredient amounts
*   **`entry_order`** (INTEGER) — ordering within a slot (supports multiple dishes per slot)

*(Future Enhancement for substitutions: `substitute_ingredient_id` to link high-cholesterol ingredients to healthier alternatives.)*

---

## 3. API Design

The following REST endpoints are implemented in `backend/src/routes/`.

### Dishes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dishes` | List all dishes with parsed JSON fields. |
| `GET` | `/api/dishes/:id` | Full dish detail including recipe steps, nutritional breakdown, and ingredient list. |
| `GET` | `/api/dishes/recommend/:userId` | Scored and filtered dish recommendations for a specific meal slot. Query params: `day`, `mealType`, `filterMealType`, `filterDiet`, `filterAllergies`, `filterConditions`, `search`. Returns scored dishes and current day nutrient totals. |

### Meal Plan
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/mealplan/:userId` | Retrieve the full weekly meal plan grouped by day and meal type. |
| `POST` | `/api/mealplan/:userId/add` | Add a dish to a specific meal slot. Body: `{ dayIndex, mealType, dishId, servings, customIngredients }`. |
| `DELETE` | `/api/mealplan/:userId/remove/:entryId` | Remove a specific entry from the meal plan. |
| `GET` | `/api/mealplan/:userId/nutrients/week` | Weekly nutrient totals, weekly RDA targets, and per-day breakdown with health warnings. |
| `GET` | `/api/mealplan/:userId/nutrients/day/:dayIndex` | Nutrient totals for a single day. |

### Shopping List
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/shopping-list/:userId` | Aggregated shopping list from the user's meal plan — sums ingredient amounts, deduplicates, returns alphabetical list with gram totals. |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users/profile` | Create or update a user profile. Body: `{ userId?, conditions, diet, allergies }`. Returns the saved profile with a generated `userId` if not provided. |
| `GET` | `/api/users/:id` | Get a user's profile. |
| `DELETE` | `/api/users/:id` | Delete a user and all their meal plan entries. |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check — returns `{ status: "ok", timestamp }`. |

---

## 4. Caching Strategy

Caching decisions are driven by how frequently data changes and whether it is shared across users or user-specific.

*   **Dish and ingredient data** — This data is relatively static (updated infrequently when the dish catalogue is maintained). In the current local setup, SQLite reads are fast enough. For cloud deployment, it is safe to cache at the API Gateway / CDN level:
    *   *AWS:* CloudFront in front of the API Gateway, with a TTL of several hours to a day.
    *   *GCP:* Cloud CDN in front of Cloud Run or App Engine.
    *   Cache invalidation should be triggered by an admin action whenever the dish database is updated.

*   **Ingredient nutrient lookups** — Cached in-memory on the backend (`nutrientCalculator.js`) after first database read, since this data is static during a server session.

*   **Meal plans** — Meal plans are user-specific and change frequently (every time the user adjusts their week). They must **not** be cached at the CDN level (risk of serving another user's data). However, an in-memory cache can reduce database read load in production:
    *   *AWS:* ElastiCache (Redis)
    *   *GCP:* Memorystore (Redis)
    *   Cache key: `mealplan:{userId}`, evicted on every `POST /api/mealplan` write for that user.
