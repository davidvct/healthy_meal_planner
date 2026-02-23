import { useState, useCallback, useEffect } from "react";
import React from "react";
import { COLORS } from "../constants/colors";
import { MEAL_TYPES, DAYS, DAYS_FULL } from "../constants/mealTypes";
import AddDishModal from "./AddDishModal";
import ShoppingListPanel from "./ShoppingListPanel";
import NutrientSummaryPanel from "./NutrientSummaryPanel";
import RecipeViewModal from "./RecipeViewModal";
import WarningTag from "./ui/WarningTag";
import * as api from "../services/api";

export default function CalendarScreen({ userProfile, userId, onEditProfile }) {
  const [mealPlan, setMealPlan] = useState(() => {
    const plan = {};
    for (let i = 0; i < 7; i++) plan[i] = {};
    return plan;
  });
  const [addModal, setAddModal] = useState(null);
  const [showShopping, setShowShopping] = useState(false);
  const [showNutrients, setShowNutrients] = useState(false);
  const [recipeView, setRecipeView] = useState(null);

  // Fetch meal plan from backend on mount
  useEffect(() => {
    api.getMealPlan(userId).then(setMealPlan).catch(() => {});
  }, [userId]);

  // Reload meal plan after modifications
  const reloadPlan = useCallback(() => {
    api.getMealPlan(userId).then(setMealPlan).catch(() => {});
  }, [userId]);

  const handleAdd = useCallback(async (dish, servings, customIngredients = null) => {
    if (!addModal) return;
    try {
      await api.addDishToPlan(userId, {
        dayIndex: addModal.dayIndex,
        mealType: addModal.mealType,
        dishId: dish.id,
        servings,
        customIngredients,
      });
      reloadPlan();
    } catch (err) {
      console.error("Failed to add dish:", err);
    }
    setAddModal(null);
  }, [addModal, userId, reloadPlan]);

  const handleRemove = useCallback(async (entryId) => {
    try {
      await api.removeDishFromPlan(userId, entryId);
      reloadPlan();
    } catch (err) {
      console.error("Failed to remove dish:", err);
    }
  }, [userId, reloadPlan]);

  const totalPlanned = (() => {
    let c = 0;
    for (let d = 0; d < 7; d++) MEAL_TYPES.forEach(mt => { c += (mealPlan[d]?.[mt] || []).length; });
    return c;
  })();

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "16px 12px 100px 12px" }}>
      {/* Header */}
      <div style={{ maxWidth: 900, margin: "0 auto", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: COLORS.accent }}>🥘 MealWise</span>
          <button onClick={onEditProfile}
            style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${COLORS.grayLight}`, background: COLORS.card, color: COLORS.gray, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            ⚙ Profile
          </button>
        </div>

        {/* Condition tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {userProfile.conditions.map(c => (
            <span key={c} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: COLORS.warnBg, color: COLORS.warn, fontWeight: 600 }}>
              {c}
            </span>
          ))}
          {userProfile.diet !== "none" && (
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: COLORS.greenLight, color: COLORS.green, fontWeight: 600 }}>
              {userProfile.diet}
            </span>
          )}
          {userProfile.allergies.map(a => (
            <span key={a} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 8, background: COLORS.goldLight, color: COLORS.gold, fontWeight: 600 }}>
              ✗ {a}
            </span>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowNutrients(true)}
            style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: COLORS.green, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            📊 Nutrition Summary
          </button>
          <button onClick={() => setShowShopping(true)}
            style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: COLORS.navy, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            🛒 Shopping List
          </button>
          <span style={{ fontSize: 12, color: COLORS.gray, display: "flex", alignItems: "center", marginLeft: 8 }}>
            {totalPlanned} dish{totalPlanned !== 1 ? "es" : ""} planned
          </span>
        </div>
      </div>

      {/* Week label */}
      <div style={{ maxWidth: 900, margin: "0 auto", marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, margin: 0 }}>This Week</h2>
      </div>

      {/* Calendar Grid */}
      <div style={{ maxWidth: 900, margin: "0 auto", overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "80px repeat(7, 1fr)", gap: 4, minWidth: 700 }}>
          {/* Header row */}
          <div />
          {DAYS.map((d) => (
            <div key={d} style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: COLORS.navy, padding: "8px 0" }}>{d}</div>
          ))}

          {/* Meal rows */}
          {MEAL_TYPES.map(mt => (
            <React.Fragment key={mt}>
              <div style={{
                display: "flex", alignItems: "center", fontSize: 12, fontWeight: 700, color: COLORS.gray,
                textTransform: "capitalize", paddingLeft: 4,
              }}>
                {mt === "breakfast" ? "🌅" : mt === "lunch" ? "☀️" : mt === "dinner" ? "🌙" : "🍪"} {mt}
              </div>
              {DAYS.map((d, di) => {
                const entries = mealPlan[di]?.[mt] || [];

                return (
                  <div key={`${mt}-${di}`}
                    style={{
                      background: COLORS.card, borderRadius: 12, minHeight: 60, padding: 6,
                      border: `1px solid ${COLORS.grayLight}`, display: "flex", flexDirection: "column",
                      justifyContent: entries.length > 0 ? "flex-start" : "center", alignItems: "center", position: "relative",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                    onClick={() => setAddModal({ dayIndex: di, mealType: mt })}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.grayLight; }}
                  >
                    {entries.length > 0 ? (
                      <div style={{ width: "100%" }}>
                        {entries.map((entry, ei) => (
                          <div key={entry.id || ei} style={{ textAlign: "center", position: "relative", padding: "2px 0", borderBottom: ei < entries.length - 1 ? `1px dashed ${COLORS.grayLight}` : "none" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.navy, lineHeight: 1.3 }}
                              onClick={(e) => { e.stopPropagation(); setRecipeView(entry); }}>
                              {entry.dishName}
                            </div>
                            {entry.servings !== 1 && (
                              <div style={{ fontSize: 10, color: COLORS.gray }}>×{entry.servings}</div>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRemove(entry.id); }}
                              style={{
                                position: "absolute", top: 0, right: 0, background: "none", border: "none",
                                color: COLORS.gray, cursor: "pointer", fontSize: 12, padding: 0, lineHeight: 1,
                              }}
                              title="Remove"
                            >×</button>
                          </div>
                        ))}
                        <div style={{ color: COLORS.grayLight, fontSize: 14, fontWeight: 300, textAlign: "center", marginTop: 2 }}>+</div>
                      </div>
                    ) : (
                      <div style={{ color: COLORS.grayLight, fontSize: 22, fontWeight: 300 }}>+</div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Modals */}
      {addModal && (
        <AddDishModal
          dayIndex={addModal.dayIndex}
          mealType={addModal.mealType}
          userProfile={userProfile}
          userId={userId}
          onAdd={handleAdd}
          onClose={() => setAddModal(null)}
        />
      )}
      {showShopping && <ShoppingListPanel userId={userId} onClose={() => setShowShopping(false)} />}
      {showNutrients && <NutrientSummaryPanel userId={userId} onClose={() => setShowNutrients(false)} />}
      {recipeView && <RecipeViewModal entry={recipeView} onClose={() => setRecipeView(null)} />}
    </div>
  );
}
