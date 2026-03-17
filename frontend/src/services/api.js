const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

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
    const detail = err.detail;
    const message =
      err.error ||
      (typeof detail === "string" ? detail : detail?.error) ||
      res.statusText;
    const error = new Error(message);
    error.status = res.status;
    error.payload = err;
    throw error;
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

export async function updateTier(caretakerId, tier) {
  return request(`/caretakers/${caretakerId}/tier`, {
    method: "PUT",
    body: JSON.stringify({ tier }),
  });
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

export async function validateAutofillPlan(userId, weekStart, settings, thresholds) {
  return request(`/mealplan/${userId}/autofill/validate`, {
    method: "POST",
    body: JSON.stringify({ weekStart, settings, thresholds }),
  });
}

export async function autofillPlan(userId, weekStart, settings, thresholds, allowConstraintRelaxation = false) {
  return request(`/mealplan/${userId}/autofill`, {
    method: "POST",
    body: JSON.stringify({ weekStart, settings, thresholds, allowConstraintRelaxation }),
  });
}

export async function removeDishFromPlan(userId, entryId) {
  return request(`/mealplan/${userId}/remove/${entryId}`, { method: "DELETE" });
}

export async function clearWeekMealPlan(userId, weekStart) {
  const params = weekStart ? `?weekStart=${encodeURIComponent(weekStart)}` : "";
  return request(`/mealplan/${userId}/clear${params}`, { method: "DELETE" });
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

// ---- Nutrient Thresholds ----

export async function getAvailableNutrients() {
  return request("/thresholds/nutrients");
}

export async function getThresholds(userId) {
  return request(`/thresholds/${userId}`);
}

export async function saveThresholds(userId, thresholds) {
  return request(`/thresholds/${userId}`, {
    method: "PUT",
    body: JSON.stringify({ thresholds }),
  });
}
