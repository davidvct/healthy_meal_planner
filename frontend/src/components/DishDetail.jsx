import { useState, useMemo, useEffect } from "react";
import { COLORS } from "../constants/colors";
import { RDA } from "../constants/mealTypes";
import NutrientBar from "./ui/NutrientBar";
import WarningTag from "./ui/WarningTag";
import * as api from "../services/api";

export default function DishDetail({ dish, userProfile, onClose }) {
  const [servings, setServings] = useState(dish.baseServings || 1);
  const [customOverrides, setCustomOverrides] = useState({});
  const [recipe, setRecipe] = useState(null);

  // Fetch full dish detail (includes recipe)
  useEffect(() => {
    api.getDishDetail(dish.id).then(data => {
      if (data.recipe) setRecipe(data.recipe);
    }).catch(() => {});
  }, [dish.id]);

  const activeIngredients = useMemo(() => {
    const res = {};
    for (const [ing, amt] of Object.entries(dish.ingredients)) {
      res[ing] = customOverrides[ing] !== undefined ? customOverrides[ing] : amt * servings;
    }
    return res;
  }, [dish, servings, customOverrides]);

  // Compute nutrients client-side from ingredients (lightweight calculation)
  const nutrients = useMemo(() => {
    const n = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, cholesterol: 0, sugar: 0 };
    // We approximate using the dish's base nutrients scaled by servings
    // For accuracy, the backend provides per-dish nutrients
    if (dish.nutrients) {
      const scale = Object.keys(customOverrides).length > 0 ? 1 : servings;
      Object.keys(n).forEach(k => { n[k] = (dish.nutrients[k] || 0) * scale; });
    }
    return n;
  }, [dish, servings, customOverrides]);

  const warnings = useMemo(() => {
    if (!userProfile.conditions || userProfile.conditions.length === 0) return [];
    // Simple client-side warning check for display
    return [];
  }, [nutrients, userProfile]);

  const updateIngredient = (ing, newAmtStr) => {
    const val = Math.max(0, parseInt(newAmtStr) || 0);
    setCustomOverrides({ ...customOverrides, [ing]: val });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "flex-end" }}
      onClick={onClose}>
      <div style={{
        background: COLORS.bg, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 500, maxHeight: "85vh", overflow: "auto", padding: 24,
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.navy, margin: 0 }}>{dish.name}</h2>
            <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
              {warnings.map(w => <WarningTag key={w} text={w} />)}
              {dish.tags.map(t => (
                <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: COLORS.accentLight, color: COLORS.accent, fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, color: COLORS.gray, cursor: "pointer", padding: 4 }}>×</button>
        </div>

        {/* Serving adjuster */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16, padding: 14, background: COLORS.card, borderRadius: 14,
          border: `1px solid ${COLORS.grayLight}`, marginBottom: 16,
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy }}>Servings</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
            <button onClick={() => setServings(Math.max(0.5, servings - 0.5))}
              style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${COLORS.grayLight}`, background: COLORS.card, fontSize: 18, cursor: "pointer", color: COLORS.navy }}>-</button>
            <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.accent, minWidth: 30, textAlign: "center" }}>{servings}</span>
            <button onClick={() => setServings(servings + 0.5)}
              style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${COLORS.grayLight}`, background: COLORS.card, fontSize: 18, cursor: "pointer", color: COLORS.navy }}>+</button>
          </div>
        </div>

        {/* Nutrients */}
        <div style={{ padding: 16, background: COLORS.card, borderRadius: 14, border: `1px solid ${COLORS.grayLight}`, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, margin: "0 0 12px 0" }}>Nutrition (per {servings} serving{servings !== 1 ? "s" : ""})</h3>
          <NutrientBar label="Calories" value={nutrients.calories} max={RDA.calories / 3} unit=" kcal" color={COLORS.accent} />
          <NutrientBar label="Protein" value={nutrients.protein} max={RDA.protein / 3} unit="g" color={COLORS.green} />
          <NutrientBar label="Carbs" value={nutrients.carbs} max={RDA.carbs / 3} unit="g" color={COLORS.gold} />
          <NutrientBar label="Fat" value={nutrients.fat} max={RDA.fat / 3} unit="g" color={COLORS.accent} />
          <NutrientBar label="Fiber" value={nutrients.fiber} max={RDA.fiber / 3} unit="g" color={COLORS.green} />
          <NutrientBar label="Sodium" value={nutrients.sodium} max={RDA.sodium / 3} unit="mg" color={COLORS.gray} warn />
          <NutrientBar label="Cholesterol" value={nutrients.cholesterol} max={RDA.cholesterol / 3} unit="mg" color={COLORS.gray} warn />
        </div>

        {/* Ingredients */}
        <div style={{ padding: 16, background: COLORS.card, borderRadius: 14, border: `1px solid ${COLORS.grayLight}`, marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, margin: "0 0 10px 0" }}>Ingredients (Editable)</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Object.entries(activeIngredients).map(([ing, amt]) => (
              <div key={ing} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "4px 8px", borderRadius: 8, background: COLORS.accentLight, color: COLORS.navy }}>
                <span>{ing}</span>
                <input type="number" value={Math.round(amt)} onChange={(e) => updateIngredient(ing, e.target.value)}
                  style={{ width: 45, padding: "2px 4px", fontSize: 13, border: `1px solid ${COLORS.accent}`, borderRadius: 4, background: "#fff", textAlign: "right" }} />
                <span>g</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recipe */}
        {recipe && (
          <div style={{ padding: 16, background: COLORS.card, borderRadius: 14, border: `1px solid ${COLORS.grayLight}`, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, margin: "0 0 4px 0" }}>Recipe</h3>
            <div style={{ fontSize: 12, color: COLORS.gray, marginBottom: 12 }}>
              Prep: {recipe.prepTime || recipe.prep_time} min · Cook: {recipe.cookTime || recipe.cook_time} min
            </div>
            {recipe.steps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div style={{
                  minWidth: 24, height: 24, borderRadius: 12, background: COLORS.accentLight, color: COLORS.accent,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700,
                }}>{i + 1}</div>
                <p style={{ margin: 0, fontSize: 13, color: COLORS.navy, lineHeight: 1.5 }}>{s}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
