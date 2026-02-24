# Development Phases: MealWise App

This document outlines the proposed phases of development for the MealWise application.

## Phase 1: MVP (Minimum Viable Product)
**Focus:** Core functionality for a single Meal User account running locally.
*   **User Onboarding:** Basic profile creation (health conditions, diet, allergies).
*   **Meal Planner UI:** Weekly grid view (Breakfast, Lunch, Dinner, Snack slots).
*   **Data Models (Tables A & B):** Define conceptual tables and populate static data for 10-20 core dishes and ingredients.
*   **Recommendation Engine V1:** Dynamic scoring of dishes based on user conditions, remaining daily nutrients, and allergies/filters.
*   **Nutrient Tracking:** Real-time updates of daily macro/micro nutrients based on selected dishes.
*   **Recipe View:** Basic display of recipes and ingredient amounts for standard servings.
*   **Ingredient Adjustments:** Users can manually edit ingredient amounts with real-time nutrient recalculation.
*   **Serving Scaling:** Users can adjust servings via +/- controls.
*   **Shopping List Generation:** Aggregated weekly ingredient list.
*   **Multiple Dishes per Slot:** Users can add multiple dishes to each meal slot.
*   **Toggleable Filters:** Auto-applied filters (meal type, diet, allergies, health conditions) that users can toggle off to broaden dish selection.
*   **localStorage Persistence:** Meal plan and user profile persist across page refreshes.

## Phase 2: Authentication, Customization & Enrichment
**Focus:** Secure user accounts, enhanced interaction, richer UI, and smarter suggestions.
*   **User Authentication:** Implement secure login/signup using a managed auth provider (Firebase Auth, AWS Cognito, or Auth0). Issue JWT tokens on login; add Express middleware to validate tokens and extract `userId` on every request. Remove `/:userId` from public-facing URLs — derive the user identity from the token instead.
*   **Secure Session Management:** Replace `localStorage` profile caching with token-based sessions. On login, fetch the user profile from the API; persist only the auth token client-side.
*   **Request Validation & Error Handling:** Add `zod` or `joi` schema validation on all POST/PUT endpoints. Implement a centralized Express error-handling middleware with consistent error response shapes (`{ error, code, details }`).
*   **Rate Limiting:** Add `express-rate-limit` middleware to protect the recommendation engine and other compute-heavy endpoints from abuse.
*   **Ingredient Substitutions (V1):** Suggest healthy swaps for ingredients (e.g., Chicken Breast instead of Chicken Wing) to better meet nutritional goals or dietary preferences.
*   **Dish Images & Richer UI:** Add dish photography and improve visual hierarchy across the planner and recipe views.
*   **User Ratings & Favorites:** Allow users to rate dishes and save personal favorites for faster meal planning.
*   **Care Taker Accounts:** Implement role-based access control (RBAC) — caretaker accounts can link to and manage multiple Meal User accounts. Leverage the auth system from Phase 2.

## Phase 2.5: Data Enrichment & Containerization
**Focus:** Expand the dish/ingredient database and package the app for cloud deployment.
*   **Dish Database Expansion:** Scale from the initial 10–20 dishes to 100+ dishes covering broader cuisines (Malay, Indian, Western, Japanese, Korean, etc.) and categories (beverages, fruits, snacks, desserts).
*   **Ingredient Database Expansion:** Add comprehensive nutritional data for all new ingredients. Include micronutrients beyond the current set (e.g., potassium, calcium, iron, vitamin D) for richer health tracking.
*   **Nutrient Data Completeness:** Audit and fill in missing or approximate nutrient values using authoritative sources (e.g., USDA FoodData Central, HPB Singapore nutrition database). Add per-100g precision for all existing and new ingredients.
*   **Data Seeding Pipeline:** Migrate from hardcoded JS seed files (`data/ingredients.js`, `data/dishes.js`) to structured JSON or CSV seed files with a versioned migration script, making it easy for non-developers to contribute new dishes.
*   **Backend Containerization (Docker):** Create a `Dockerfile` for the Express.js backend (Node.js base image, multi-stage build). The backend container runs the API server and connects to the database via `DATABASE_URL` environment variable.
*   **Frontend Containerization (Docker):** Create a separate `Dockerfile` for the React frontend — multi-stage build that runs `vite build` and serves the static output via `nginx`. This is a separate container from the backend because they scale independently (frontend is static assets, backend is compute).
*   **Docker Compose for Local Dev:** Create `docker-compose.yml` that spins up three services: `frontend` (nginx, port 3000), `backend` (Node.js, port 8080), and `postgres` (PostgreSQL, port 5432). This replaces the current "run frontend + backend manually" workflow.
*   **Environment-Based Configuration:** Externalize all config into environment variables following 12-Factor App principles: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`, `NODE_ENV`. Use `.env` files for local dev.

## Phase 3: Cloud Migration
**Focus:** Moving from local Docker to a scalable, observable cloud application.
*   **Database Migration (SQLite → PostgreSQL):** Swap `better-sqlite3` queries to `pg` / Knex / Prisma. Migrate seed data to the managed PostgreSQL instance. The Docker Compose setup from Phase 2.5 already uses PostgreSQL locally, so this is primarily a connection-string change for production.
*   **Managed Database:** Use Cloud SQL (GCP) or RDS (AWS) for PostgreSQL, with read replicas to handle read-heavy recommendation workloads at scale.
*   **Cloud Deployment:** Deploy the React frontend to a CDN (AWS CloudFront / GCP Cloud CDN) and the backend API to a scalable compute service (GCP Cloud Run / AWS ECS Fargate) using the Docker images from Phase 2.5.
*   **Redis Caching Layer:** Add Memorystore (GCP) or ElastiCache (AWS) for caching dish catalogues (shared, long TTL), recommendation results (per-user, short TTL), and meal plan snapshots (invalidated on write).
*   **Auto-scaling:** Configure horizontal pod autoscaling (GKE) or auto-scaling groups (ECS/Fargate) for the recommendation engine to handle variable traffic spikes.
*   **CI/CD Pipeline:** Set up GitHub Actions or GCP Cloud Build for automated testing, Docker image builds, and zero-downtime deployments on every merge to main.
*   **Structured Logging & Monitoring:** Replace `console.log` with structured JSON logging (`pino` or `winston`). Deploy Cloud Monitoring (GCP) or CloudWatch (AWS) dashboards with distributed tracing and alerting on error rates and latency thresholds.

## Phase 4: Extended Features & Ecosystem
**Focus:** Social, advanced tracking, and multi-user support.
*   **Mobile Responsiveness & Refinement:** Ensure UI looks pristine and works well on mobile devices.
*   **Advanced Tracking:** Add longitudinal tracking of health conditions (blood sugar data, BP levels) plotting user progress over time.
*   **Community Features:** Allow users to save favorite recipes, rate dishes, and share customized recipes.
*   **Database Expansion Tools:** Allow users to submit or add new dishes, recipes, and ingredients to the shared database (with moderation workflow).
*   **API Versioning:** Introduce `/api/v1/` prefix to all endpoints to support non-breaking API evolution as features grow.
*   **Usage Metering & Billing:** Add usage tracking for premium tier features (number of meal plans, caretaker accounts managed) to support SaaS monetization.

## Testing Strategy
**Focus:** Ensuring correctness, reliability, and confidence across all layers of the application.
*   **Unit Tests:** Cover the recommendation scoring algorithm and all nutrient calculation functions to verify correctness against known inputs and edge cases.
*   **Integration Tests:** Validate API endpoints end-to-end, including auth middleware, request validation, database interactions, and correct HTTP response codes/payloads.
*   **E2E Tests:** Automate critical user flows — user signup/login, onboarding (profile creation), adding dishes to the meal plan, and shopping list generation — using a framework such as Playwright or Cypress.
*   **Container Tests:** Validate that Docker builds succeed and `docker-compose up` boots all services correctly as part of CI.
