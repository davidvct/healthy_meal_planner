# User Flow Document: MealWise App

This document outlines the detailed step-by-step user journey, explaining exactly what the user clicks, how the app reacts, and the overall experience from an end-user perspective.

---

## 1. Onboarding & Profiling
**Goal:** Gather baseline data to tailor recommendations.
1.  **Launch:** User opens the application. They are greeted with the "MealWise" welcome screen.
2.  **Health Conditions:** App displays "Any health conditions?" with selectable pills (e.g., High Blood Sugar, High Cholesterol, Hypertension, "None").
    *   *Action:* User clicks applicable conditions or "None". Clicks "Next".
    *   *Reaction:* App stores conditions to define hard nutritional limits and warning thresholds later.
3.  **Dietary Preferences:** App displays "Dietary preference?" (e.g., Vegetarian, Vegan, Halal, Pescatarian, No Restriction).
    *   *Action:* User selects a diet. Clicks "Next".
4.  **Allergies:** App displays common food allergies in a grid (e.g., egg, peanut, shrimp).
    *   *Action:* User selects any allergies or "No allergies". Clicks "Start Planning".
    *   *Reaction:* App calculates the "Target Nutrient Profile" (derived from Standard RDA + restricted limits for selected health conditions). The user is transitioned to the Main Dashboard.

## 2. Main Dashboard (Weekly Planner)
**Goal:** Provide a high-level view of the week and daily nutrient tracking.
1.  **View Planner:** User sees a clean, weekly grid view (Monday to Sunday).
2.  **Meal Slots:** Each day has distinct slots for Breakfast, Lunch, Dinner, and Snacks.
    *   *Empty Slot:* Displays a simple `+ Add Dish` button.
    *   *Filled Slot:* Displays a thumbnail image of the dish, dish name, calorie count, and a health match score.
3.  **Nutrient Summary Pane (Dynamic):** A persistent panel or sidebar shows that day's nutritional progress (Calories, Protein, Carbs, Fat, Sodium, etc.) using progress bars.

## 3. Adding a Meal (Dynamic Dish Recommendation)
**Goal:** Select dishes tailored dynamically to the user's daily dietary needs.
1.  **Initiate:** User clicks an empty `+ Add Dish` slot for "Tuesday - Lunch".
    *   *Reaction:* App opens the "Add Dish Modal".
2.  **Display Recommendations:** 
    *   *Algorithm execution:* The app filters out all dishes containing user allergies/diet restrictions. It then scores remaining dishes prioritizing: Health Condition safety (60%), remaining Daily Nutrient balance (30%), and variety constraint (10%).
    *   *Reaction:* A grid of recommended dishes appears, sorted highest score first. Each dish card shows "Match Score" (e.g., 95%), Name, core macros, and any warning tags (e.g., ⚠ High Sodium).
3.  **Filters & Search:** A search bar and toggles (Vegan, Low Sugar, etc.) sit at the top.
    *   *Action:* User can type "Chicken" or toggle off auto-filters manually to see a wider range of dishes.
4.  **Dish Detail & Selection:** 
    *   *Action:* User clicks "Details" on "Hainanese Chicken Rice".
    *   *Reaction:* A slide-up panel opens showing ingredients, full nutrition breakdown for 1 serving, cooking steps, and preparation time.
    *   *Action:* User adjusts servings via `+ / -` buttons.
    *   *Reaction:* The ingredient amounts and nutritional summary recalculate instantly in the UI.
    *   *Action:* User clicks `+ Add to Plan`.
    *   *Reaction:* Modal closes. Dish appears in the "Tuesday - Lunch" slot.
5.  **Dynamic Adjustment:**
    *   *Reaction:* The App instantly recalculates the Daily Nutrient Summary Pane. Since the user consumed significant carbs for lunch, remaining recommended dishes for *Dinner* will dynamically re-rank to push lower-carb options to the top.

## 4. Grocery / Shopping List
**Goal:** Export the weekly plan into actionable grocery shopping.
1.  **View Cart:** User clicks the "🛒 Shopping List" button on the dashboard.
    *   *Reaction:* The app aggregates all ingredients across all planned dishes for the week, multiplying ingredient grams by the selected servings.
2.  **Display List:** A clean, alphabetical checklist of ingredients is displayed (e.g., Chicken Breast - 600g, Rice - 800g).
    *   *Action:* User can physically use this list at the store, checking off items as they buy them.

## 5. Recipe Execution (Cooking)
**Goal:** Cook the dish using customized metrics.
1.  **Start Cooking:** It is Tuesday Lunchtime. User clicks the "Hainanese Chicken Rice" card in their planner.
2.  **View Recipe Mode:**
    *   *Reaction:* The system displays the user-customized recipe list. If the user previously adjusted the dish for 2 servings, all ingredient quantities (salt, chicken, etc.) are scaled accurately.
    *   *Action:* User follows the step-by-step instructions displayed in a clear, large font suitable for the elderly, along with estimated time limits.
    
## 6. User Preferences & Customization
1.  **Adjusting Ingredients:** While viewing a recipe, a user wants less salt or sugar for health reasons.
    *   *Action:* User clicks "Edit Recipe". They lower the salt or sugar amount.
    *   *Reaction:* The app recalculates the nutritional profile dynamically (e.g., lowering sodium or sugar levels). The quantities for the *other* ingredients in the recipe remain exactly the same; they do not automatically adjust.
2.  **Substitutions:** App flags "High Cholesterol" for an ingredient like Chicken Wing.
    *   *Action:* App displays a prompt: "Swap with Chicken Breast?". User clicks "Yes".
    *   *Reaction:* Nutrients metrics update immediately.
