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

## Phase 2: Customization & Shopping List
**Focus:** Enhanced user interaction and utility.
*   **Ingredient Adjustments:** Allow users to manually increase/decrease specific ingredient amounts (e.g., less salt) and automatically recalculate nutritional data without changing other ingredients.
*   **Serving Scaling:** Allow users to define servings, properly matching and updating total dish ingredients.
*   **Shopping List Generation:** Generate an aggregated list of ingredients across the weekly plan.
*   **Ingredient Substitutions (V1):** Suggest basic healthy swaps (e.g., Chicken Breast instead of Chicken Wing).
*   **Mobile Responsiveness & Refinement:** Ensure UI looks pristine and works well on mobile devices.

## Phase 3: Cloud Migration
**Focus:** Moving from a local prototype to a scalable cloud application.
*   **Database Selection & Migration:** Choose between SQL (e.g., PostgreSQL/MySQL) or NoSQL (e.g., MongoDB/Firestore). Finalize tables configuration and migrate data.
*   **Cloud Deployment:** Deploy the React frontend to a CDN (AWS CloudFront / GCP Cloud CDN) and the backend API to a scalable compute service (AWS Lambda/EC2 / GCP Cloud Run/App Engine).
*   **User Authentication Integration:** Implement proper secure login, credential management, and save/load of account state.

## Phase 4: Extended Features & Ecosystem
**Focus:** Social, advanced tracking, and multi-user support.
*   **Care Taker Accounts:** Implement role-based accounts that can link to and manage multiple Meal User accounts.
*   **Advanced Tracking:** Add longitudinal tracking of health conditions (blood sugar data, BP levels) plotting user progress over time.
*   **Community Features:** Allow users to save favorite recipes, rate dishes, and share customized recipes.
*   **Database Expansion Tools:** Allow users to submit or add new dishes, recipes, and ingredients to the shared database.
