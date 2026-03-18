import { useState, useCallback, useEffect, useMemo } from "react";
import React from "react";
import { COLORS } from "../constants/colors";
import { MEAL_TYPES, DAYS } from "../constants/mealTypes";
import AddDishModal from "./AddDishModal";
import MealSlotDetail from "./MealSlotDetail";
import ShoppingListPanel from "./ShoppingListPanel";
import NutrientSummaryPanel from "./NutrientSummaryPanel";
import RecipeViewModal from "./RecipeViewModal";
import AutofillSettingsModal, { loadAutofillSettings } from "./AutofillSettingsModal";
import ThresholdSettingsModal from "./ThresholdSettingsModal";
import UpgradePromptModal from "./UpgradePromptModal";
import * as api from "../services/api";

// Get the Monday of the week containing `date`
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun,1=Mon,...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Meal cutoff hours: breakfast 10am, lunch 2pm, dinner 8pm
const MEAL_CUTOFF = { breakfast: 10, lunch: 14, dinner: 20 };

function formatAutofillViolations(violations) {
  if (!violations?.length) return "";
  return violations
    .map((violation) => {
      const slot = violation.mealType
        ? `Day ${violation.dayIndex + 1} ${violation.mealType}`
        : `Day ${violation.dayIndex + 1}`;
      return `- ${slot}: ${violation.title}`;
    })
    .join("\n");
}

export default function CalendarScreen({ userProfile, userId, diners, userTier, caretakerId, onSwitchDiner, onEditProfile, onBackToDashboard }) {
  const [showDinerDropdown, setShowDinerDropdown] = useState(false);
  const [mealPlan, setMealPlan] = useState(() => {
    const plan = {};
    for (let i = 0; i < 7; i++) plan[i] = {};
    return plan;
  });
  const [slotDetail, setSlotDetail] = useState(null);
  const [addModal, setAddModal] = useState(null);
  const [showShopping, setShowShopping] = useState(false);
  const [showNutrients, setShowNutrients] = useState(false);
  const [recipeView, setRecipeView] = useState(null);
  const [showAutofillSettings, setShowAutofillSettings] = useState(false);
  const [showThresholds, setShowThresholds] = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState(null);

  // Week offset from current week (0 = this week, -1 = last week, +1 = next week)
  const [weekOffset, setWeekOffset] = useState(0);

  // Compute the dates for the displayed week
  const weekDates = useMemo(() => {
    const today = new Date();
    const monday = getMonday(today);
    monday.setDate(monday.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  // Check if a slot is in the past (day passed or meal cutoff passed)
  const isSlotLocked = useCallback((dayIndex, mealType) => {
    const now = new Date();
    const slotDate = weekDates[dayIndex];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const slotDay = new Date(slotDate);
    slotDay.setHours(0, 0, 0, 0);

    // Past day entirely
    if (slotDay < today) return true;
    // Same day — check cutoff
    if (slotDay.getTime() === today.getTime()) {
      const cutoff = MEAL_CUTOFF[mealType];
      if (now.getHours() >= cutoff) return true;
    }
    return false;
  }, [weekDates]);

  // weekStart as YYYY-MM-DD string (Monday of displayed week)
  const weekStart = useMemo(() => {
    const d = weekDates[0];
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, [weekDates]);

  // Fetch meal plan from backend when week changes
  useEffect(() => {
    api.getMealPlan(userId, weekStart).then(setMealPlan).catch(() => {});
  }, [userId, weekStart]);

  // Reload meal plan after modifications
  const reloadPlan = useCallback(() => {
    api.getMealPlan(userId, weekStart).then(setMealPlan).catch(() => {});
  }, [userId, weekStart]);

  const handleAdd = useCallback(async (dish, servings, customIngredients = null) => {
    if (!addModal) return;
    try {
      await api.addDishToPlan(userId, {
        dayIndex: addModal.dayIndex,
        mealType: addModal.mealType,
        dishId: dish.id,
        servings,
        customIngredients,
        weekStart,
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

  const handleAutofill = useCallback(async () => {
    setAutofilling(true);
    try {
      const raw = loadAutofillSettings();
      const settings = {
        maxDishesPerSlot: raw.maxDishesPerSlot || 2,
        maxCalories: raw.maxCalories ? parseFloat(raw.maxCalories) : null,
        maxCarbs: raw.maxCarbs ? parseFloat(raw.maxCarbs) : null,
        maxFat: raw.maxFat ? parseFloat(raw.maxFat) : null,
      };
      const [availableNutrients, savedThresholds] = await Promise.all([
        api.getAvailableNutrients(),
        api.getThresholds(userId),
      ]);

      const requiredKeys = ["calories", "protein", "carbs", "fat"];
      const thresholdMap = new Map(
        savedThresholds.map((item) => [item.nutrientKey, item])
      );

      for (const key of requiredKeys) {
        const nutrient = availableNutrients.find((item) => item.key === key);
        const dailyValue = nutrient?.defaultDaily ?? null;
        const existing = thresholdMap.get(key);
        const hasUsableValue = existing && (
          (existing.dailyValue ?? null) !== null || (existing.perMealValue ?? null) !== null
        );
        if (hasUsableValue) continue;

        thresholdMap.set(key, {
          nutrientKey: key,
          dailyValue,
          perMealValue: dailyValue ? Math.round(dailyValue / 3) : null,
        });
      }

      const thresholds = Array.from(thresholdMap.values());

      console.log("[autofill] sending", { userId, weekStart, settings, thresholds });
      const validation = await api.validateAutofillPlan(userId, weekStart, settings, thresholds);
      let allowConstraintRelaxation = false;
      if (validation.violations?.length) {
        const warning = [
          "Some existing meals violate hard constraints.",
          "If you proceed, autofill will relax those constraints for existing meals only.",
          "",
          formatAutofillViolations(validation.violations),
          "",
          "Proceed anyway?",
        ].join("\n");
        if (!window.confirm(warning)) return;
        allowConstraintRelaxation = true;
      }

      await api.autofillPlan(userId, weekStart, settings, thresholds, allowConstraintRelaxation);
      reloadPlan();
    } catch (err) {
      console.error("Auto-fill failed:", err);
      const message = err?.message || "Auto-fill failed.";
      if (message.includes("No feasible meal plan found.")) {
        window.alert("No feasible meal plan was found for the selected week and current constraints.");
      } else {
        window.alert(message);
      }
    } finally {
      setAutofilling(false);
    }
  }, [userId, weekStart, reloadPlan]);

  const handleClearAll = useCallback(async () => {
    const hasUnlockedEntries = DAYS.some((_, dayIndex) =>
      MEAL_TYPES.some((mealType) => !isSlotLocked(dayIndex, mealType) && (mealPlan[dayIndex]?.[mealType] || []).length > 0)
    );
    if (!hasUnlockedEntries) return;
    if (!window.confirm(`Clear all unblocked meals for the week of ${weekStart}?`)) return;

    setClearing(true);
    try {
      await api.clearWeekMealPlan(userId, weekStart);
      reloadPlan();
    } catch (err) {
      console.error("Clear all failed:", err);
    } finally {
      setClearing(false);
    }
  }, [isSlotLocked, mealPlan, reloadPlan, userId, weekStart]);

  const totalPlanned = (() => {
    let c = 0;
    for (let d = 0; d < 7; d++) MEAL_TYPES.forEach(mt => { c += (mealPlan[d]?.[mt] || []).length; });
    return c;
  })();

  const clearableCount = (() => {
    let c = 0;
    for (let d = 0; d < 7; d++) {
      MEAL_TYPES.forEach((mt) => {
        if (!isSlotLocked(d, mt)) c += (mealPlan[d]?.[mt] || []).length;
      });
    }
    return c;
  })();

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "16px 12px 100px 12px" }}>
      {/* Header */}
      <div style={{ maxWidth: 900, margin: "0 auto", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={onBackToDashboard}
              style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: COLORS.navy, padding: "4px" }}
              title="Back to dashboard"
            >←</button>
            <span style={{ fontSize: 24, fontWeight: 800, color: COLORS.accent }}>🥘 MealWise</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Diner Selector */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowDinerDropdown(!showDinerDropdown)}
                style={{
                  padding: "8px 14px", borderRadius: 10, border: `1px solid ${COLORS.grayLight}`,
                  background: COLORS.card, color: COLORS.navy, fontSize: 13, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                {userProfile.name || "Diner"} ▾
              </button>
              {showDinerDropdown && (
                <div style={{
                  position: "absolute", top: "100%", right: 0, marginTop: 4,
                  background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.grayLight}`,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 100, minWidth: 180, overflow: "hidden",
                }}>
                  {diners.map(d => (
                    <button key={d.userId}
                      onClick={() => { onSwitchDiner(d); setShowDinerDropdown(false); }}
                      style={{
                        display: "block", width: "100%", padding: "10px 16px", border: "none",
                        background: d.userId === userId ? COLORS.accentLight : "transparent",
                        color: COLORS.navy, fontSize: 13, fontWeight: d.userId === userId ? 700 : 500,
                        cursor: "pointer", textAlign: "left",
                      }}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={onEditProfile}
              style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid ${COLORS.grayLight}`, background: COLORS.card, color: COLORS.gray, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              ⚙ Edit
            </button>
          </div>
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
          <button onClick={handleClearAll} disabled={clearing || clearableCount === 0}
            style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: "#c65b3d", color: "#fff", fontWeight: 700, fontSize: 13, cursor: clearing || clearableCount === 0 ? "default" : "pointer", opacity: clearing || clearableCount === 0 ? 0.55 : 1 }}>
            {clearing ? "Clearing…" : "Clear All"}
          </button>
          <button onClick={userTier === "paid" ? handleAutofill : () => setUpgradeFeature("Auto-fill")} disabled={autofilling}
            style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: COLORS.accent, color: "#fff", fontWeight: 700, fontSize: 13, cursor: autofilling ? "wait" : "pointer", opacity: userTier !== "paid" ? 0.6 : autofilling ? 0.7 : 1 }}>
            {userTier !== "paid" && "\uD83D\uDD12 "}{autofilling ? "Filling\u2026" : "Auto-fill"}
          </button>
          <button onClick={userTier === "paid" ? () => setShowAutofillSettings(true) : () => setUpgradeFeature("Auto-fill Settings")}
            style={{ padding: "10px 16px", borderRadius: 12, border: `1px solid ${COLORS.grayLight}`, background: COLORS.card, color: COLORS.gray, fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: userTier !== "paid" ? 0.6 : 1 }}>
            {userTier !== "paid" ? "\uD83D\uDD12" : "\u2699"} Auto-fill Settings
          </button>
          <button onClick={userTier === "paid" ? () => setShowThresholds(true) : () => setUpgradeFeature("Nutrient Thresholds")}
            style={{ padding: "10px 16px", borderRadius: 12, border: `1px solid ${COLORS.grayLight}`, background: COLORS.card, color: COLORS.navy, fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: userTier !== "paid" ? 0.6 : 1 }}>
            {userTier !== "paid" ? "\uD83D\uDD12" : "\uD83C\uDFAF"} Threshold
          </button>
          <span style={{ fontSize: 12, color: COLORS.gray, display: "flex", alignItems: "center", marginLeft: 8 }}>
            {totalPlanned} dish{totalPlanned !== 1 ? "es" : ""} planned
          </span>
        </div>
      </div>

      {/* Week navigation */}
      <div style={{ maxWidth: 900, margin: "0 auto", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <button onClick={() => setWeekOffset(w => w - 1)}
            style={{
              background: "none", border: `1px solid ${COLORS.grayLight}`, borderRadius: 8,
              width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 18, color: COLORS.navy, fontWeight: 700,
            }}
            title="Previous week"
          >←</button>
          <div style={{ textAlign: "center", minWidth: 160 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy }}>
              {weekDates[0].getFullYear()}
            </div>
            <div style={{ fontSize: 13, color: COLORS.gray, fontWeight: 600 }}>
              {weekDates[0].getDate()} {MONTH_ABBR[weekDates[0].getMonth()]} — {weekDates[6].getDate()} {MONTH_ABBR[weekDates[6].getMonth()]}
            </div>
          </div>
          <button onClick={() => setWeekOffset(w => w + 1)}
            style={{
              background: "none", border: `1px solid ${COLORS.grayLight}`, borderRadius: 8,
              width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 18, color: COLORS.navy, fontWeight: 700,
            }}
            title="Next week"
          >→</button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ maxWidth: 900, margin: "0 auto", overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "80px repeat(7, 1fr)", gap: 4, minWidth: 700 }}>
          {/* Header row: date + day name */}
          <div />
          {DAYS.map((d, di) => {
            const date = weekDates[di];
            const dd = String(date.getDate()).padStart(2, "0");
            const mmm = MONTH_ABBR[date.getMonth()];
            return (
              <div key={d} style={{ textAlign: "center", padding: "4px 0" }}>
                <div style={{ fontSize: 11, color: COLORS.gray, fontWeight: 600 }}>{dd} {mmm}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy }}>{d}</div>
              </div>
            );
          })}

          {/* Meal rows */}
          {MEAL_TYPES.map(mt => (
            <React.Fragment key={mt}>
              <div style={{
                display: "flex", alignItems: "center", fontSize: 12, fontWeight: 700, color: COLORS.gray,
                textTransform: "capitalize", paddingLeft: 4,
              }}>
                {mt === "breakfast" ? "🌅" : mt === "lunch" ? "☀️" : "🌙"} {mt}
              </div>
              {DAYS.map((d, di) => {
                const entries = mealPlan[di]?.[mt] || [];
                const locked = isSlotLocked(di, mt);

                return (
                  <div key={`${mt}-${di}`}
                    style={{
                      background: locked ? COLORS.grayLight : COLORS.card,
                      borderRadius: 12, minHeight: 60, padding: 6,
                      border: `1px solid ${COLORS.grayLight}`, display: "flex", flexDirection: "column",
                      justifyContent: entries.length > 0 ? "flex-start" : "center", alignItems: "center", position: "relative",
                      cursor: locked ? "default" : "pointer", transition: "all 0.15s",
                      opacity: locked ? 0.5 : 1,
                      pointerEvents: locked ? "none" : "auto",
                    }}
                    onClick={() => { if (!locked) setSlotDetail({ dayIndex: di, mealType: mt }); }}
                    onMouseEnter={e => { if (!locked) e.currentTarget.style.borderColor = COLORS.accent; }}
                    onMouseLeave={e => { if (!locked) e.currentTarget.style.borderColor = COLORS.grayLight; }}
                  >
                    {entries.length > 0 ? (
                      <div style={{ width: "100%" }}>
                        {entries.map((entry, ei) => (
                          <div key={entry.id || ei} style={{ textAlign: "center", padding: "2px 0", borderBottom: ei < entries.length - 1 ? `1px dashed ${COLORS.grayLight}` : "none" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.navy, lineHeight: 1.3 }}>
                              {entry.dishName}
                            </div>
                            {entry.servings !== 1 && (
                              <div style={{ fontSize: 10, color: COLORS.gray }}>×{entry.servings}</div>
                            )}
                          </div>
                        ))}
                        {!locked && <div style={{ color: COLORS.grayLight, fontSize: 14, fontWeight: 300, textAlign: "center", marginTop: 2 }}>+</div>}
                      </div>
                    ) : (
                      <div style={{ color: locked ? COLORS.gray : COLORS.grayLight, fontSize: locked ? 14 : 22, fontWeight: 300 }}>
                        {locked ? "—" : "+"}
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Modals */}
      {slotDetail && !addModal && (
        <MealSlotDetail
          dayIndex={slotDetail.dayIndex}
          mealType={slotDetail.mealType}
          entries={mealPlan[slotDetail.dayIndex]?.[slotDetail.mealType] || []}
          dayPlan={mealPlan[slotDetail.dayIndex] || {}}
          onRemove={handleRemove}
          onAddDish={() => setAddModal({ dayIndex: slotDetail.dayIndex, mealType: slotDetail.mealType })}
          onViewRecipe={(entry) => setRecipeView(entry)}
          onClose={() => setSlotDetail(null)}
          reloadPlan={reloadPlan}
        />
      )}
      {addModal && (
        <AddDishModal
          dayIndex={addModal.dayIndex}
          mealType={addModal.mealType}
          userProfile={userProfile}
          userId={userId}
          weekStart={weekStart}
          userTier={userTier}
          onAdd={handleAdd}
          onClose={() => setAddModal(null)}
        />
      )}
      {showShopping && <ShoppingListPanel userId={userId} weekStart={weekStart} mealPlan={mealPlan} weekDates={weekDates} isSlotLocked={isSlotLocked} onClose={() => setShowShopping(false)} />}
      {showNutrients && <NutrientSummaryPanel userId={userId} weekStart={weekStart} onClose={() => setShowNutrients(false)} />}
      {recipeView && <RecipeViewModal entry={recipeView} onClose={() => setRecipeView(null)} />}
      {showAutofillSettings && <AutofillSettingsModal onClose={() => setShowAutofillSettings(false)} />}
      {showThresholds && <ThresholdSettingsModal userId={userId} onClose={() => setShowThresholds(false)} />}
      {upgradeFeature && <UpgradePromptModal featureName={upgradeFeature} onClose={() => setUpgradeFeature(null)} />}

    </div>
  );
}
