import { useState, useEffect } from "react";
import { COLORS } from "../constants/colors";
import { DAYS_FULL } from "../constants/mealTypes";
import FilterChip from "./ui/FilterChip";
import DishCard from "./DishCard";
import DishDetail from "./DishDetail";
import * as api from "../services/api";

export default function AddDishModal({ dayIndex, mealType, userProfile, userId, weekStart, onAdd, onClose }) {
  const [search, setSearch] = useState("");
  const [detailDish, setDetailDish] = useState(null);
  const [scored, setScored] = useState([]);
  const [dayNutrients, setDayNutrients] = useState({ calories: 0, protein: 0, carbs: 0 });
  const [loading, setLoading] = useState(true);

  // Toggleable filters
  const [filterMealType, setFilterMealType] = useState(true);
  const [filterDiet, setFilterDiet] = useState(true);
  const [filterAllergies, setFilterAllergies] = useState(true);
  const [filterConditions, setFilterConditions] = useState(true);

  // Fetch recommendations from backend
  useEffect(() => {
    setLoading(true);
    api.getRecommendedDishes(userId, {
      day: dayIndex,
      mealType,
      filterMealType,
      filterDiet,
      filterAllergies,
      filterConditions,
      search: search.trim(),
      weekStart,
    }).then(data => {
      setScored(data.scored);
      setDayNutrients(data.dayNutrients);
    }).catch(err => {
      console.error("Failed to fetch recommendations:", err);
      setScored([]);
    }).finally(() => setLoading(false));
  }, [userId, dayIndex, mealType, filterMealType, filterDiet, filterAllergies, filterConditions, search]);

  if (detailDish) {
    return <DishDetail dish={detailDish} userProfile={userProfile}
      onAdd={(d, s, customIngs) => { onAdd(d, s, customIngs); }}
      onClose={() => setDetailDish(null)} />;
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "flex-end" }}
      onClick={onClose}>
      <div style={{
        background: COLORS.bg, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 500, maxHeight: "85vh", overflow: "auto", padding: 24,
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.navy, margin: 0 }}>
              {DAYS_FULL[dayIndex]} · {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, color: COLORS.gray, cursor: "pointer" }}>×</button>
        </div>

        {/* Day nutrient progress */}
        <div style={{ padding: 12, background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.grayLight}`, marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.gray, marginBottom: 8 }}>Today's intake so far</div>
          <div style={{ display: "flex", gap: 14, fontSize: 12 }}>
            <span style={{ color: COLORS.accent }}>🔥 {Math.round(dayNutrients.calories)} cal</span>
            <span style={{ color: COLORS.green }}>💪 {Math.round(dayNutrients.protein)}g protein</span>
            <span style={{ color: COLORS.gold }}>🌾 {Math.round(dayNutrients.carbs)}g carbs</span>
          </div>
        </div>

        {/* Toggleable Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          <FilterChip label={mealType} active={filterMealType} onToggle={() => setFilterMealType(!filterMealType)} />
          {userProfile.diet !== "none" && (
            <FilterChip label={userProfile.diet} active={filterDiet} onToggle={() => setFilterDiet(!filterDiet)} />
          )}
          {userProfile.allergies.length > 0 && (
            <FilterChip label="No allergens" active={filterAllergies} onToggle={() => setFilterAllergies(!filterAllergies)} />
          )}
          {userProfile.conditions.length > 0 && (
            <FilterChip label="Health-safe only" active={filterConditions} onToggle={() => setFilterConditions(!filterConditions)} />
          )}
        </div>

        {/* Search */}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dishes..."
          style={{
            width: "100%", padding: "12px 16px", borderRadius: 12, border: `1px solid ${COLORS.grayLight}`,
            background: COLORS.card, fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box",
            color: COLORS.navy,
          }} />

        {/* Recommended label */}
        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.gray, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
          Recommended for you
        </div>

        {/* Dish list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {loading && (
            <div style={{ textAlign: "center", padding: 30, color: COLORS.gray }}>Loading...</div>
          )}
          {!loading && scored.length === 0 && (
            <div style={{ textAlign: "center", padding: 30, color: COLORS.gray }}>
              <div style={{ fontSize: 14, marginBottom: 8 }}>No dishes match your filters.</div>
              <div style={{ fontSize: 12 }}>Try toggling off some filters above to see more options.</div>
            </div>
          )}
          {!loading && scored.map(({ dish, score, warnings, nutrients }) => (
            <DishCard key={dish.id} dish={dish} score={score} warnings={warnings} nutrients={nutrients}
              onSelect={(d) => onAdd(d, 1, null)}
              onDetail={(d) => setDetailDish(d)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
