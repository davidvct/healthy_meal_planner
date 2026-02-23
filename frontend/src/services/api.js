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

export async function getRecommendedDishes(userId, { day, mealType, filterMealType, filterDiet, filterAllergies, filterConditions, search, weekStart }) {
  const params = new URLSearchParams({
    day: String(day),
    mealType,
    filterMealType: String(filterMealType),
    filterDiet: String(filterDiet),
    filterAllergies: String(filterAllergies),
    filterConditions: String(filterConditions),
  });
  if (search) params.set("search", search);
  if (weekStart) params.set("weekStart", weekStart);
  return request(`/dishes/recommend/${userId}?${params}`);
}

// ---- Meal Plan ----

export async function getMealPlan(userId, weekStart) {
  const params = weekStart ? `?weekStart=${weekStart}` : "";
  return request(`/mealplan/${userId}${params}`);
}

export async function addDishToPlan(userId, { dayIndex, mealType, dishId, servings, customIngredients, weekStart }) {
  return request(`/mealplan/${userId}/add`, {
    method: "POST",
    body: JSON.stringify({ dayIndex, mealType, dishId, servings, customIngredients, weekStart }),
  });
}

export async function removeDishFromPlan(userId, entryId) {
  return request(`/mealplan/${userId}/remove/${entryId}`, { method: "DELETE" });
}

export async function getWeekNutrients(userId, weekStart) {
  const params = weekStart ? `?weekStart=${weekStart}` : "";
  return request(`/mealplan/${userId}/nutrients/week${params}`);
}

export async function getDayNutrients(userId, dayIndex, weekStart) {
  const params = weekStart ? `?weekStart=${weekStart}` : "";
  return request(`/mealplan/${userId}/nutrients/day/${dayIndex}${params}`);
}

// ---- Shopping List ----

export async function getShoppingList(userId, weekStart) {
  const params = weekStart ? `?weekStart=${weekStart}` : "";
  return request(`/shopping-list/${userId}${params}`);
}
