import { useState, useEffect, useCallback, useMemo } from "react";
import React from "react";
import { COLORS } from "../constants/colors";
import { MEAL_TYPES, DAYS } from "../constants/mealTypes";
import * as api from "../services/api";

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ShoppingListPanel({ userId, weekStart, mealPlan, weekDates, isSlotLocked, onClose }) {
  const [view, setView] = useState("weekly");
  const [selections, setSelections] = useState([]); // [{dayIndex, mealType}, ...]
  const [items, setItems] = useState([]);
  const [totalDishes, setTotalDishes] = useState(0);
  const [loading, setLoading] = useState(true);

  // Create a set key for fast lookup
  const selectionKeys = useMemo(
    () => new Set(selections.map(s => `${s.dayIndex}-${s.mealType}`)),
    [selections]
  );

  // Fetch shopping list data (includes selections) on mount
  const fetchData = useCallback(() => {
    setLoading(true);
    api.getShoppingList(userId, weekStart).then(data => {
      setItems(data.items);
      setTotalDishes(data.totalDishes);
      setSelections(data.selections || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [userId, weekStart]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Toggle a meal slot selection
  const handleToggle = useCallback(async (dayIndex, mealType) => {
    try {
      const result = await api.toggleShoppingSelection(userId, weekStart, dayIndex, mealType);
      setSelections(result.selections || []);
      // Re-fetch the shopping list to get updated items
      const data = await api.getShoppingList(userId, weekStart);
      setItems(data.items);
      setTotalDishes(data.totalDishes);
    } catch (err) {
      console.error("Failed to toggle selection:", err);
    }
  }, [userId, weekStart]);

  // Check if a slot has any dishes planned
  const slotHasDishes = useCallback((dayIndex, mealType) => {
    const entries = mealPlan[dayIndex]?.[mealType] || [];
    return entries.length > 0;
  }, [mealPlan]);

  const selectedCount = selections.length;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center" }}
      onClick={onClose}>
      <div style={{
        background: COLORS.bg, borderRadius: 24, width: "100%", maxWidth: 600, maxHeight: "90vh", overflow: "auto", padding: 24,
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.navy, margin: 0 }}>Shopping List</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, color: COLORS.gray, cursor: "pointer" }}>×</button>
        </div>

        {/* View toggle tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 16, borderRadius: 10, overflow: "hidden", border: `1px solid ${COLORS.grayLight}` }}>
          {[
            { key: "weekly", label: "Weekly View" },
            { key: "list", label: "List View" },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => setView(tab.key)}
              style={{
                flex: 1, padding: "10px 16px", border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: 13, transition: "all 0.15s",
                background: view === tab.key ? COLORS.navy : COLORS.card,
                color: view === tab.key ? "#fff" : COLORS.gray,
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Subtitle */}
        <p style={{ color: COLORS.gray, fontSize: 13, margin: "0 0 12px 0" }}>
          {view === "weekly"
            ? "Tap meals to add to your shopping list"
            : `${selectedCount} meal${selectedCount !== 1 ? "s" : ""} selected · ${items.length} ingredient${items.length !== 1 ? "s" : ""}`
          }
        </p>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: COLORS.gray }}>Loading...</div>
        ) : view === "weekly" ? (
          /* ====== WEEKLY VIEW ====== */
          <div style={{ overflowX: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", gap: 3, minWidth: 520 }}>
              {/* Header row: day names + dates */}
              <div />
              {DAYS.map((d, di) => {
                const date = weekDates[di];
                const dd = String(date.getDate()).padStart(2, "0");
                const mmm = MONTH_ABBR[date.getMonth()];
                return (
                  <div key={d} style={{ textAlign: "center", padding: "3px 0" }}>
                    <div style={{ fontSize: 10, color: COLORS.gray, fontWeight: 600 }}>{dd} {mmm}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.navy }}>{d}</div>
                  </div>
                );
              })}

              {/* Meal rows */}
              {MEAL_TYPES.map(mt => (
                <React.Fragment key={mt}>
                  <div style={{
                    display: "flex", alignItems: "center", fontSize: 10, fontWeight: 700, color: COLORS.gray,
                    textTransform: "capitalize", paddingLeft: 2,
                  }}>
                    {mt === "breakfast" ? "🌅" : mt === "lunch" ? "☀️" : "🌙"} {mt}
                  </div>
                  {DAYS.map((d, di) => {
                    const entries = mealPlan[di]?.[mt] || [];
                    const locked = isSlotLocked(di, mt);
                    const hasDishes = entries.length > 0;
                    const isSelected = selectionKeys.has(`${di}-${mt}`);
                    const canSelect = hasDishes && !locked;

                    return (
                      <div key={`${mt}-${di}`}
                        onClick={() => { if (canSelect) handleToggle(di, mt); }}
                        style={{
                          background: locked
                            ? COLORS.grayLight
                            : isSelected
                              ? COLORS.greenLight
                              : COLORS.card,
                          borderRadius: 8,
                          minHeight: 48,
                          padding: 4,
                          border: isSelected
                            ? `2px solid ${COLORS.green}`
                            : `1px solid ${COLORS.grayLight}`,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: entries.length > 0 ? "flex-start" : "center",
                          alignItems: "center",
                          cursor: canSelect ? "pointer" : "default",
                          opacity: locked ? 0.4 : hasDishes ? 1 : 0.5,
                          transition: "all 0.15s",
                          position: "relative",
                        }}
                      >
                        {hasDishes ? (
                          <div style={{ width: "100%" }}>
                            {entries.map((entry, ei) => (
                              <div key={entry.id || ei} style={{
                                textAlign: "center", padding: "1px 0",
                                borderBottom: ei < entries.length - 1 ? `1px dashed ${COLORS.grayLight}` : "none",
                              }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.navy, lineHeight: 1.2 }}>
                                  {entry.dishName}
                                </div>
                                {entry.servings !== 1 && (
                                  <div style={{ fontSize: 8, color: COLORS.gray }}>×{entry.servings}</div>
                                )}
                              </div>
                            ))}
                            {/* Selection indicator */}
                            {isSelected && (
                              <div style={{
                                position: "absolute", top: 2, right: 2,
                                width: 14, height: 14, borderRadius: 7,
                                background: COLORS.green, color: "#fff",
                                fontSize: 10, fontWeight: 700, lineHeight: "14px", textAlign: "center",
                              }}>✓</div>
                            )}
                          </div>
                        ) : (
                          <div style={{ color: COLORS.grayLight, fontSize: 10 }}>—</div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : (
          /* ====== LIST VIEW ====== */
          selections.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: COLORS.gray }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🛒</div>
              No meals selected. Go to Weekly View to select meals for your shopping list.
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: COLORS.gray }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🛒</div>
              No ingredients found for selected meals.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {items.map((item, i) => (
                <div key={item.name} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 14px", background: i % 2 === 0 ? COLORS.card : "transparent", borderRadius: 10,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.navy, textTransform: "capitalize" }}>{item.name}</span>
                  <span style={{ fontSize: 14, color: COLORS.gray, fontWeight: 600 }}>
                    {item.grams >= 1000 ? `${(item.grams / 1000).toFixed(1)} kg` : `${item.grams}g`}
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
