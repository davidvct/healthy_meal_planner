const BASE_URL = "/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("mealwise_auth_token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// ---- Auth ----

export async function requestOtp(email) {
  return request("/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyOtp(email, otp) {
  return request("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export async function registerWithOtp(email, verificationToken, password) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, verificationToken, password }),
  });
}

export async function login(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ---- Caretakers ----

export async function createCaretaker(name, authUserId) {
  return request("/caretakers", {
    method: "POST",
    body: JSON.stringify({ name, authUserId }),
  });
}

export async function getCaretaker(caretakerId) {
  return request(`/caretakers/${caretakerId}`);
}

export async function getCaretakerByAuth(authUserId) {
  return request(`/caretakers/by-auth/${authUserId}`);
}

export async function getDiners(caretakerId) {
  return request(`/caretakers/${caretakerId}/diners`);
}

// ---- Users (Diners) ----

export async function createOrUpdateProfile({ userId, name, age, sex, weightKg, caretakerId, conditions, diet, allergies }) {
  return request("/users/profile", {
    method: "POST",
    body: JSON.stringify({ userId, name, age, sex, weightKg, caretakerId, conditions, diet, allergies }),
  });
}

export async function getProfile(userId) {
  return request(`/users/${userId}`);
}

export async function deleteDiner(userId) {
  return request(`/users/${userId}`, { method: "DELETE" });
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

export async function toggleShoppingSelection(userId, weekStart, dayIndex, mealType) {
  return request(`/shopping-list/${userId}/toggle-selection`, {
    method: "POST",
    body: JSON.stringify({ weekStart, dayIndex, mealType }),
  });
}
