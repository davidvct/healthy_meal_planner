import { useState, useEffect } from "react";
import { COLORS } from "../constants/colors";
import * as api from "../services/api";

export default function RecipeViewModal({ entry, onClose }) {
  const [dishDetail, setDishDetail] = useState(null);

  useEffect(() => {
    api.getDishDetail(entry.dishId).then(setDishDetail).catch(() => {});
  }, [entry.dishId]);

  const recipe = dishDetail?.recipe;
  const dishName = entry.dishName || dishDetail?.name || "Dish";
  const ings = entry.customIngredients
    || (dishDetail ? Object.fromEntries(Object.entries(dishDetail.ingredients).map(([k, v]) => [k, v * entry.servings])) : {});

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1100, display: "flex", justifyContent: "center", alignItems: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: COLORS.bg, borderRadius: 24, width: "100%", maxWidth: 640, maxHeight: "90vh", overflow: "auto", padding: 32 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: COLORS.navy, margin: 0 }}>{recipe ? recipe.name : dishName}</h2>
            <div style={{ fontSize: 16, color: COLORS.gray, marginTop: 8 }}>
              {recipe ? `Prep: ${recipe.prepTime || recipe.prep_time} min · Cook: ${recipe.cookTime || recipe.cook_time} min` : "Loading..."}
            </div>
            <div style={{ fontSize: 16, color: COLORS.accent, fontWeight: 700, marginTop: 4 }}>
              Serving size: {entry.servings}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 32, color: COLORS.gray, cursor: "pointer" }}>×</button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
          <div style={{ flex: "1 1 200px" }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: COLORS.navy, borderBottom: `2px solid ${COLORS.grayLight}`, paddingBottom: 8 }}>Ingredients</h3>
            <ul style={{ listStyle: "none", padding: 0, fontSize: 18, color: COLORS.navy }}>
              {Object.entries(ings).map(([ing, amt]) => (
                <li key={ing} style={{ padding: "8px 0", borderBottom: `1px solid ${COLORS.grayLight}` }}>
                  <b>{Math.round(amt)}g</b> {ing}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ flex: "2 1 300px" }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: COLORS.navy, borderBottom: `2px solid ${COLORS.grayLight}`, paddingBottom: 8 }}>Instructions</h3>
            {recipe ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
                {recipe.steps.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 16, background: COLORS.card, padding: 16, borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                    <div style={{ minWidth: 32, height: 32, borderRadius: 16, background: COLORS.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>
                      {i + 1}
                    </div>
                    <p style={{ margin: 0, fontSize: 20, color: COLORS.navy, lineHeight: 1.6 }}>{s}</p>
                  </div>
                ))}
              </div>
            ) : <p style={{ fontSize: 18, color: COLORS.gray }}>Loading recipe...</p>}
          </div>
        </div>
        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "12px 24px", borderRadius: 12, background: COLORS.green, color: "#fff", fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer" }}>Got it!</button>
        </div>
      </div>
    </div>
  );
}
