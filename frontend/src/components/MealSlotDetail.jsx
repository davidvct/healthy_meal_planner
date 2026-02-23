import { useState, useEffect, useCallback } from "react";
import { COLORS } from "../constants/colors";
import { DAYS_FULL, MEAL_TYPES, RDA } from "../constants/mealTypes";
import * as api from "../services/api";

const NUTRIENT_KEYS = ["calories", "protein", "carbs", "fat", "fiber", "sodium", "cholesterol", "sugar"];
const NUTRIENT_LABELS = {
  calories: "Cal", protein: "Protein", carbs: "Carbs", fat: "Fat",
  fiber: "Fiber", sodium: "Sodium", cholesterol: "Chol", sugar: "Sugar",
};
const NUTRIENT_UNITS = {
  calories: "kcal", protein: "g", carbs: "g", fat: "g",
  fiber: "g", sodium: "mg", cholesterol: "mg", sugar: "g",
};

function NutritionBarChart({ label, totals, color }) {
  const bars = NUTRIENT_KEYS.map(k => ({
    key: k,
    label: NUTRIENT_LABELS[k],
    pct: RDA[k] ? Math.round((totals[k] / RDA[k]) * 100) : 0,
    value: Math.round(totals[k]),
    unit: NUTRIENT_UNITS[k],
  }));
  const maxPct = Math.max(100, ...bars.map(b => b.pct));

  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.navy, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 90 }}>
        {bars.map(b => {
          const barH = maxPct > 0 ? Math.max(2, (b.pct / maxPct) * 72) : 2;
          const over = b.pct > 100;
          return (
            <div key={b.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: over ? COLORS.warn : COLORS.gray, marginBottom: 2 }}>
                {b.pct}%
              </div>
              <div style={{
                width: "80%", height: barH, borderRadius: 4,
                background: over ? COLORS.warn : color,
                transition: "height 0.3s",
              }} />
              <div style={{ fontSize: 8, color: COLORS.gray, marginTop: 3, textAlign: "center", lineHeight: 1.2 }}>
                {b.label}
              </div>
            </div>
          );
        })}
      </div>
      {/* 100% reference line label */}
      <div style={{ fontSize: 8, color: COLORS.grayLight, textAlign: "right", marginTop: 1 }}>— 100% RDA</div>
    </div>
  );
}

function computeTotals(entries, dishDetailsMap) {
  return entries.reduce((acc, entry) => {
    const detail = dishDetailsMap[entry.dishId];
    if (detail?.nutrients) {
      const s = entry.servings || 1;
      NUTRIENT_KEYS.forEach(k => { acc[k] += (detail.nutrients[k] || 0) * s; });
    }
    return acc;
  }, Object.fromEntries(NUTRIENT_KEYS.map(k => [k, 0])));
}

export default function MealSlotDetail({ dayIndex, mealType, entries, dayPlan, onRemove, onAddDish, onViewRecipe, onClose, reloadPlan }) {
  const [dishDetails, setDishDetails] = useState({});
  const [expandedIngredients, setExpandedIngredients] = useState({});

  // Collect all dish IDs for this day (all meals) + current slot
  const allDayEntries = MEAL_TYPES.flatMap(mt => dayPlan[mt] || []);

  useEffect(() => {
    const allEntries = [...new Map([...allDayEntries, ...entries].map(e => [e.dishId, e])).values()];
    allEntries.forEach(entry => {
      if (!dishDetails[entry.dishId]) {
        api.getDishDetail(entry.dishId).then(data => {
          setDishDetails(prev => ({ ...prev, [entry.dishId]: data }));
        }).catch(() => {});
      }
    });
  }, [entries, dayPlan]);

  const toggleIngredients = (entryId) => {
    setExpandedIngredients(prev => ({ ...prev, [entryId]: !prev[entryId] }));
  };

  const handleRemove = useCallback(async (entryId) => {
    await onRemove(entryId);
  }, [onRemove]);

  // Compute slot totals and day totals
  const slotTotals = computeTotals(entries, dishDetails);
  const dayTotals = computeTotals(allDayEntries, dishDetails);

  const mealLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);
  const mealEmoji = mealType === "breakfast" ? "🌅" : mealType === "lunch" ? "☀️" : "🌙";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center" }}
      onClick={onClose}>
      <div style={{
        background: COLORS.bg, borderRadius: 24, width: "100%", maxWidth: 500, maxHeight: "85vh", overflow: "auto", padding: 24,
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.navy, margin: 0 }}>
            {mealEmoji} {DAYS_FULL[dayIndex]} · {mealLabel}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, color: COLORS.gray, cursor: "pointer" }}>×</button>
        </div>

        {/* Nutrition charts */}
        <div style={{ padding: 12, background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.grayLight}`, marginBottom: 16 }}>
          <NutritionBarChart label={`${mealLabel} (this meal)`} totals={slotTotals} color={COLORS.accent} />
          <div style={{ borderTop: `1px solid ${COLORS.grayLight}`, margin: "8px 0" }} />
          <NutritionBarChart label={`${DAYS_FULL[dayIndex]} (full day)`} totals={dayTotals} color={COLORS.green} />
        </div>

        {/* Dish list */}
        {entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: COLORS.gray }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🍽️</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>No dishes planned</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Tap the button below to add a dish.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {entries.map((entry) => {
              const detail = dishDetails[entry.dishId];
              const nutrients = detail?.nutrients;
              const servings = entry.servings || 1;
              const ingredients = entry.customIngredients
                || (detail ? Object.fromEntries(Object.entries(detail.ingredients || {}).map(([k, v]) => [k, v * servings])) : {});
              const isIngredientsOpen = expandedIngredients[entry.id];

              return (
                <div key={entry.id} style={{
                  background: COLORS.card, borderRadius: 16, padding: 16,
                  border: `1px solid ${COLORS.grayLight}`,
                }}>
                  {/* Dish row: image + info */}
                  <div style={{ display: "flex", gap: 14, marginBottom: 10 }}>
                    {/* Larger dish image */}
                    <div style={{
                      width: 96, height: 96, borderRadius: 14, background: COLORS.accentLight,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, flexShrink: 0,
                    }}>
                      🍽️
                    </div>

                    {/* Dish info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.navy, lineHeight: 1.3 }}>
                          {entry.dishName}
                        </div>
                        <button onClick={() => handleRemove(entry.id)}
                          style={{ background: "none", border: "none", color: COLORS.gray, cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1, flexShrink: 0, marginLeft: 8 }}
                          title="Remove">×</button>
                      </div>
                      {servings !== 1 && (
                        <div style={{ fontSize: 12, color: COLORS.gray, marginTop: 2 }}>×{servings} servings</div>
                      )}
                      {nutrients && (
                        <div style={{ display: "flex", gap: 10, fontSize: 11, color: COLORS.gray, marginTop: 6, flexWrap: "wrap" }}>
                          <span>{Math.round(nutrients.calories * servings)} cal</span>
                          <span>P {Math.round(nutrients.protein * servings)}g</span>
                          <span>C {Math.round(nutrients.carbs * servings)}g</span>
                          <span>F {Math.round(nutrients.fat * servings)}g</span>
                        </div>
                      )}

                      {/* Smaller action buttons next to dish info */}
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        <button onClick={() => onViewRecipe(entry)}
                          style={{
                            padding: "4px 10px", borderRadius: 8, border: `1px solid ${COLORS.grayLight}`,
                            background: COLORS.card, color: COLORS.navy, fontWeight: 600, fontSize: 11, cursor: "pointer",
                          }}>
                          📖 Recipe
                        </button>
                        <button onClick={() => toggleIngredients(entry.id)}
                          style={{
                            padding: "4px 10px", borderRadius: 8,
                            border: `1px solid ${isIngredientsOpen ? COLORS.accent : COLORS.grayLight}`,
                            background: isIngredientsOpen ? COLORS.accentLight : COLORS.card,
                            color: isIngredientsOpen ? COLORS.accent : COLORS.navy,
                            fontWeight: 600, fontSize: 11, cursor: "pointer",
                          }}>
                          🥕 Ingredients
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ingredients expandable section */}
                  {isIngredientsOpen && (
                    <div style={{
                      marginTop: 10, padding: 12, background: COLORS.bg, borderRadius: 10,
                      border: `1px solid ${COLORS.grayLight}`,
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.navy, marginBottom: 8 }}>Ingredients</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {Object.entries(ingredients).map(([ing, amt]) => (
                          <span key={ing} style={{
                            fontSize: 12, padding: "4px 10px", borderRadius: 8,
                            background: COLORS.accentLight, color: COLORS.navy,
                          }}>
                            {ing}: <b>{Math.round(amt)}g</b>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Dish button */}
        <button onClick={onAddDish}
          style={{
            width: "100%", padding: 14, borderRadius: 14, border: "none", background: COLORS.accent, color: "#fff",
            fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 16,
            boxShadow: "0 2px 8px rgba(212,113,59,0.3)",
          }}>
          + Add Dish
        </button>
      </div>
    </div>
  );
}
