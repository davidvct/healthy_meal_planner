export const MEAL_TYPES = ["breakfast", "lunch", "dinner"];
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const DAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Fallback RDA values — only used when backend targets are unavailable.
// Actual targets come from backend's get_condition_targets() via getRecommendedLimits().
export const RDA = {
  calories: 2000,
  protein: 60,
  carbs: 275,
  fat: 65,
  fiber: 25,
  sodium: 2000,
  cholesterol: 300,
  sugar: 50,
};
