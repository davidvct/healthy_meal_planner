# Architecture Document: MealWise App

This document outlines the high-level architecture for both the Frontend and Backend of the MealWise application, along with the data storage structure.

## 1. High-Level Architecture

The system is designed as a modern web application, prepared for local testing and eventual migration to cloud platforms (GCP/AWS).

### 1.1 Frontend (Client-Side)
*   **Framework:** React.js (Single Page Application architecture, as seen in `mealplan-app.jsx`).
*   **UI/UX:** Intuitive, grid-based layout optimized for elderly users and responsive for mobile compatibility.
*   **State Management:** React state/hooks to handle dynamic updates for meal slots, nutrient graphs, and condition calculations locally before synchronizing with the backend.
*   **Hosting Deployment:** 
    *   *AWS:* S3 + CloudFront
    *   *GCP:* Firebase Hosting or Cloud Storage with Cloud CDN.

### 1.2 Backend (Server-Side)
*   **API Layer:** RESTful or GraphQL API to handle business logic, recommendation algorithms, and user data management.
*   **Compute Deployment:** 
    *   *AWS:* EC2, ECS, or Lambda (Serverless) + API Gateway
    *   *GCP:* Cloud Run or App Engine
*   **Core Logic:** Recommendation Engine that filters and scores dishes based on dynamic user health constraints, previous meal selections, and target nutritional profiles.

---

## 2. Data Storage Schema

The data storage is conceptually organized into tables. The actual database technology (e.g., SQL or NoSQL) will be decided in a later phase.

### Table A: Dishes
Stores all available dishes, mapped to their required ingredients and metadata.
*   **`dish_id`** (Primary Key, String/UUID)
*   **`name`** (String) - e.g., "Hainanese Chicken Rice"
*   **`recipe_id`** (Foreign Key to Recipes table)
*   **`meal_types`** (Array of Strings) - e.g., ["breakfast", "lunch", "dinner", "snack"]
*   **`tags`** (Array of Strings) - Cuisine type or characteristics, e.g., ["singaporean", "chicken"]
*   **`ingredients`** (JSON/Map) - Maps ingredient IDs to the amount in grams. e.g., `{"chicken breast": 200, "rice": 250}`
*   **`base_servings`** (Integer) - Default is 1 (assumes single person serving).
*   *Health Metadata (Optimization for fast filtering):*
    *   **`suitable_for_high_blood_sugar`** (Boolean)
    *   **`suitable_for_high_blood_pressure`** (Boolean)
    *   **`suitable_for_high_cholesterol`** (Boolean)
    *   **`suitable_diets`** (Array of Strings) - e.g., ["vegan", "vegetarian", "halal"]
    *   **`allergens_present`** (Array of Strings) - Pre-calculated from ingredients.

### Table B: Ingredients & Nutrients
Stores the exact nutritional value per 100g of each ingredient.
*   **`ingredient_id`** (Primary Key, String/UUID) - e.g., "chicken breast"
*   **`calories`** (Float) - in kcal
*   **`protein_g`** (Float) - in grams
*   **`carbs_g`** (Float) - in grams
*   **`fat_g`** (Float) - in grams
*   **`fiber_g`** (Float) - in grams
*   **`sodium_mg`** (Float) - in milligrams
*   **`cholesterol_mg`** (Float) - in milligrams
*   **`sugar_g`** (Float) - in grams

*(Future Enhancement for substitutions: `substitute_ingredient_id` to link high-cholesterol ingredients to healthier alternatives).*

### Other Supporting Tables
*   **Users:** Stores age, gender, weight, health conditions (blood sugar, BP, cholesterol), dietary preferences, allergies, and target daily nutritional profiles. Initially focused on **Meal User accounts**. **Care Taker accounts** (which can manage multiple meal users) will be implemented in a later phase.
*   **Recipes:** Stores cooking steps, estimated prep/cook time, and user ratings.
*   **Weekly Plans:** Stores the user's saved weekly meal plan mapping (User ID -> Day -> Meal Slot -> Dish ID & Servings).
