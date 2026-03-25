import ReactGA from "react-ga4";

const GA_ID = "G-KF3SVVJLR6";

// ── Initialization ──────────────────────────────────────────────
export function initGA() {
  ReactGA.initialize(GA_ID);
}

// ── Page views ──────────────────────────────────────────────────
export function trackPageView(page) {
  ReactGA.send({ hitType: "pageview", page });
}

// ── User properties (for segmentation in GA4 reports) ───────────
export function setUserProperties(props) {
  // props: { user_conditions, user_diet, user_tier, num_diners }
  ReactGA.gtag("set", "user_properties", props);
}

// ═══════════════════════════════════════════════════════════════
// LEADING INDICATORS — Onboarding funnel
// ═══════════════════════════════════════════════════════════════

export function trackSignUpCompleted() {
  ReactGA.event({ category: "Onboarding", action: "sign_up_completed" });
}

export function trackOnboardingStarted() {
  ReactGA.event({ category: "Onboarding", action: "onboarding_started" });
}

export function trackOnboardingCompleted(conditions = []) {
  ReactGA.event({
    category: "Onboarding",
    action: "onboarding_completed",
    label: conditions.join(",") || "none",
  });
}

export function trackFirstMealPlanGenerated() {
  ReactGA.event({ category: "Onboarding", action: "first_meal_plan_generated" });
}

// ═══════════════════════════════════════════════════════════════
// ENGAGEMENT — Meal plan events
// ═══════════════════════════════════════════════════════════════

export function trackMealPlanGenerated(constraints = {}) {
  ReactGA.event({
    category: "MealPlan",
    action: "meal_plan_generated",
    label: JSON.stringify(constraints),
  });
}

export function trackMealPlanDayGenerated(dayIndex) {
  ReactGA.event({
    category: "MealPlan",
    action: "meal_plan_day_generated",
    label: String(dayIndex),
  });
}

export function trackDishAdded(mealType, dishName) {
  ReactGA.event({
    category: "MealPlan",
    action: "dish_added",
    label: `${mealType}:${dishName}`,
  });
}

export function trackDishSwapped(mealType) {
  ReactGA.event({
    category: "MealPlan",
    action: "dish_swapped",
    label: mealType,
  });
}

export function trackDishRemoved(mealType) {
  ReactGA.event({
    category: "MealPlan",
    action: "dish_removed",
    label: mealType,
  });
}

export function trackServingsChanged(dishName, newQty) {
  ReactGA.event({
    category: "MealPlan",
    action: "servings_changed",
    label: `${dishName}:${newQty}`,
    value: newQty,
  });
}

export function trackDishFavourited(dishName, isFav) {
  ReactGA.event({
    category: "MealPlan",
    action: isFav ? "dish_favourited" : "dish_unfavourited",
    label: dishName,
  });
}

// ═══════════════════════════════════════════════════════════════
// ENGAGEMENT — Settings & preferences
// ═══════════════════════════════════════════════════════════════

export function trackThresholdsCustomized(nutrients = []) {
  ReactGA.event({
    category: "Settings",
    action: "thresholds_customized",
    label: nutrients.join(","),
  });
}

export function trackShoppingListViewed() {
  ReactGA.event({ category: "Shopping", action: "shopping_list_viewed" });
}

export function trackShoppingItemChecked(itemName) {
  ReactGA.event({
    category: "Shopping",
    action: "shopping_item_checked",
    label: itemName,
  });
}

// ═══════════════════════════════════════════════════════════════
// ENGAGEMENT — Discovery & filters
// ═══════════════════════════════════════════════════════════════

export function trackFilterApplied(filterType, value) {
  ReactGA.event({
    category: "Filter",
    action: "filter_applied",
    label: `${filterType}:${value}`,
  });
}

export function trackConditionFilterApplied(condition) {
  ReactGA.event({
    category: "Filter",
    action: "condition_filter_applied",
    label: condition,
  });
}

// ═══════════════════════════════════════════════════════════════
// GUARDRAILS — Rejections & warnings
// ═══════════════════════════════════════════════════════════════

export function trackPlanRejectedInfeasible(reason) {
  ReactGA.event({
    category: "Guardrail",
    action: "plan_rejected_infeasible",
    label: reason,
  });
}

export function trackPlanRejectedConstraint(violations = []) {
  ReactGA.event({
    category: "Guardrail",
    action: "plan_rejected_constraint",
    label: violations.map((v) => v.code || v).join(","),
  });
}

export function trackThresholdWarningShown(exceededNutrients = []) {
  ReactGA.event({
    category: "Guardrail",
    action: "threshold_warning_shown",
    label: exceededNutrients.join(","),
  });
}

// ═══════════════════════════════════════════════════════════════
// PROFILE — saves & changes
// ═══════════════════════════════════════════════════════════════

export function trackProfileSaved() {
  ReactGA.event({ category: "Profile", action: "profile_saved" });
}

export function trackConditionChanged(conditions = []) {
  ReactGA.event({
    category: "Profile",
    action: "condition_changed",
    label: conditions.join(",") || "none",
  });
}

export function trackDinerAdded() {
  ReactGA.event({ category: "Profile", action: "diner_added" });
}

export function trackDinerRemoved() {
  ReactGA.event({ category: "Profile", action: "diner_removed" });
}
