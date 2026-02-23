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

## Phase 2: Customization & Enrichment
**Focus:** Enhanced user interaction, richer UI, and smarter suggestions.
*   **Ingredient Substitutions (V1):** Suggest healthy swaps for ingredients (e.g., Chicken Breast instead of Chicken Wing) to better meet nutritional goals or dietary preferences.
*   **Dish Images & Richer UI:** Add dish photography and improve visual hierarchy across the planner and recipe views.
*   **Mobile Responsiveness & Refinement:** Ensure UI looks pristine and works well on mobile devices.
*   **User Ratings & Favorites:** Allow users to rate dishes and save personal favorites for faster meal planning.

## Phase 3: Cloud Migration
**Focus:** Moving from a local prototype to a scalable, observable cloud application.
*   **Database Selection & Migration:** Choose between SQL (e.g., PostgreSQL/MySQL) or NoSQL (e.g., MongoDB/Firestore). Finalize tables configuration and migrate data.
*   **Managed Database:** Use Cloud SQL (GCP) or RDS (AWS) for PostgreSQL, with read replicas to handle read-heavy recommendation workloads at scale.
*   **Cloud Deployment:** Deploy the React frontend to a CDN (AWS CloudFront / GCP Cloud CDN) and the backend API to a scalable compute service (AWS Lambda/EC2 / GCP Cloud Run/App Engine).
*   **Containerization:** Dockerize the frontend and backend services for consistent, reproducible builds and deployments across environments.
*   **Auto-scaling:** Configure horizontal pod autoscaling (GKE) or auto-scaling groups (ECS/Fargate) for the recommendation engine to handle variable traffic spikes.
*   **CI/CD Pipeline:** Set up GitHub Actions or GCP Cloud Build for automated testing, image builds, and zero-downtime deployments on every merge to main.
*   **User Authentication Integration:** Implement proper secure login, credential management, and save/load of account state.
*   **Monitoring & Observability:** Deploy Cloud Monitoring (GCP) or CloudWatch (AWS) dashboards with structured logging, distributed tracing, and alerting on error rates and latency thresholds.

## Phase 4: Extended Features & Ecosystem
**Focus:** Social, advanced tracking, and multi-user support.
*   **Care Taker Accounts:** Implement role-based accounts that can link to and manage multiple Meal User accounts.
*   **Advanced Tracking:** Add longitudinal tracking of health conditions (blood sugar data, BP levels) plotting user progress over time.
*   **Community Features:** Allow users to save favorite recipes, rate dishes, and share customized recipes.
*   **Database Expansion Tools:** Allow users to submit or add new dishes, recipes, and ingredients to the shared database.

## Testing Strategy
**Focus:** Ensuring correctness, reliability, and confidence across all layers of the application.
*   **Unit Tests:** Cover the recommendation scoring algorithm and all nutrient calculation functions to verify correctness against known inputs and edge cases.
*   **Integration Tests:** Validate API endpoints end-to-end, including request validation, database interactions, and correct HTTP response codes/payloads.
*   **E2E Tests:** Automate critical user flows — user onboarding (profile creation), adding dishes to the meal plan, and shopping list generation — using a framework such as Playwright or Cypress.
