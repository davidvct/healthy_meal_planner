const BASE_URL = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// ---- Users ----

export async function createOrUpdateProfile({ userId, conditions, diet, allergies }) {
  return request("/users/profile", {
    method: "POST",
    body: JSON.stringify({ userId, conditions, diet, allergies }),
  });
}

export async function getProfile(userId) {
  return request(`/users/${userId}`);
}

// ---- Dishes ----

export async function getAllDishes() {
  return request("/dishes");
}

export async function getDishDetail(dishId) {
  return request(`/dishes/${dishId}`);
}

export async function getRecommendedDishes(userId, { day, mealType, filterMealType, filterDiet, filterAllergies, filterConditions, search }) {
  const params = new URLSearchParams({
    day: String(day),
    mealType,
    filterMealType: String(filterMealType),
    filterDiet: String(filterDiet),
    filterAllergies: String(filterAllergies),
    filterConditions: String(filterConditions),
  });
  if (search) params.set("search", search);
  return request(`/dishes/recommend/${userId}?${params}`);
}

// ---- Meal Plan ----

export async function getMealPlan(userId) {
  return request(`/mealplan/${userId}`);
}

export async function addDishToPlan(userId, { dayIndex, mealType, dishId, servings, customIngredients }) {
  return request(`/mealplan/${userId}/add`, {
    method: "POST",
    body: JSON.stringify({ dayIndex, mealType, dishId, servings, customIngredients }),
  });
}

export async function removeDishFromPlan(userId, entryId) {
  return request(`/mealplan/${userId}/remove/${entryId}`, { method: "DELETE" });
}

export async function getWeekNutrients(userId) {
  return request(`/mealplan/${userId}/nutrients/week`);
}

export async function getDayNutrients(userId, dayIndex) {
  return request(`/mealplan/${userId}/nutrients/day/${dayIndex}`);
}

// ---- Shopping List ----

export async function getShoppingList(userId) {
  return request(`/shopping-list/${userId}`);
}
