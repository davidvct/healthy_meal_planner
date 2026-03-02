import { useState, useEffect } from "react";
import { COLORS } from "../constants/colors";
import { DAYS_FULL } from "../constants/mealTypes";
import NutrientBar from "./ui/NutrientBar";
import WarningTag from "./ui/WarningTag";
import * as api from "../services/api";

export default function NutrientSummaryPanel({ userId, weekStart, onClose }) {
  const [viewMode, setViewMode] = useState("table");
  const [weekData, setWeekData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getWeekNutrients(userId, weekStart).then(setWeekData).catch(() => {}).finally(() => setLoading(false));
  }, [userId, weekStart]);

  if (loading || !weekData) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ background: COLORS.card, borderRadius: 16, padding: 40, color: COLORS.gray }}>Loading...</div>
      </div>
    );
  }

  const { weekNutrients: weekN, weekRDA, daily } = weekData;

  const chartData = [
    { name: "Cals", pct: Math.round(weekN.calories / weekRDA.calories * 100), fill: COLORS.accent },
    { name: "Pro", pct: Math.round(weekN.protein / weekRDA.protein * 100), fill: COLORS.green },
    { name: "Carbs", pct: Math.round(weekN.carbs / weekRDA.carbs * 100), fill: COLORS.gold },
    { name: "Fat", pct: Math.round(weekN.fat / weekRDA.fat * 100), fill: COLORS.accent },
    { name: "Fiber", pct: Math.round(weekN.fiber / weekRDA.fiber * 100), fill: COLORS.green },
    { name: "Sod", pct: Math.round(weekN.sodium / weekRDA.sodium * 100), fill: COLORS.gray },
    { name: "Chol", pct: Math.round(weekN.cholesterol / weekRDA.cholesterol * 100), fill: COLORS.gray },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "flex-end" }}
      onClick={onClose}>
      <div style={{
        background: COLORS.bg, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 500, maxHeight: "85vh", overflow: "auto", padding: 24,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.navy, margin: 0 }}>📊 Weekly Nutrition</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, color: COLORS.gray, cursor: "pointer" }}>×</button>
        </div>

        <div style={{ padding: 16, background: COLORS.card, borderRadius: 14, border: `1px solid ${COLORS.grayLight}`, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, margin: 0 }}>Weekly Totals vs RDA × 7</h3>
            <div style={{ display: "flex", background: COLORS.grayLight, borderRadius: 8, padding: 2 }}>
              <button onClick={() => setViewMode("table")} style={{ background: viewMode === "table" ? "#fff" : "transparent", border: "none", padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", color: COLORS.navy, transition: "background 0.2s" }}>Table</button>
              <button onClick={() => setViewMode("chart")} style={{ background: viewMode === "chart" ? "#fff" : "transparent", border: "none", padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", color: COLORS.navy, transition: "background 0.2s" }}>Chart</button>
            </div>
          </div>

          {viewMode === "table" ? (
            <>
              <NutrientBar label="Calories" value={weekN.calories} max={weekRDA.calories} unit=" kcal" color={COLORS.accent} />
              <NutrientBar label="Protein" value={weekN.protein} max={weekRDA.protein} unit="g" color={COLORS.green} />
              <NutrientBar label="Carbs" value={weekN.carbs} max={weekRDA.carbs} unit="g" color={COLORS.gold} />
              <NutrientBar label="Fat" value={weekN.fat} max={weekRDA.fat} unit="g" color={COLORS.accent} />
              <NutrientBar label="Fiber" value={weekN.fiber} max={weekRDA.fiber} unit="g" color={COLORS.green} />
              <NutrientBar label="Sodium" value={weekN.sodium} max={weekRDA.sodium} unit="mg" color={COLORS.gray} warn />
              <NutrientBar label="Cholesterol" value={weekN.cholesterol} max={weekRDA.cholesterol} unit="mg" color={COLORS.gray} warn />
            </>
          ) : (
            <div style={{ width: "100%" }}>
              {chartData.map((entry) => (
                <div key={entry.name} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: COLORS.navy, fontWeight: 700 }}>{entry.name}</span>
                    <span style={{ color: entry.pct > 100 ? COLORS.warn : COLORS.gray, fontWeight: 700 }}>{entry.pct}%</span>
                  </div>
                  <div style={{ height: 10, borderRadius: 6, background: COLORS.grayLight, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.max(2, Math.min(entry.pct, 160))}%`,
                        background: entry.pct > 100 ? COLORS.warn : entry.fill,
                        transition: "width 0.25s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 8, fontSize: 11, color: COLORS.gray }}>
                Target is 100% of weekly RDA.
              </div>
            </div>
          )}
        </div>

        {/* Daily breakdown */}
        <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.navy, margin: "0 0 10px 0" }}>Daily Breakdown</h3>
        {daily.map(({ dayIndex, nutrients: dn, hasMeals, warnings }) => {
          if (!hasMeals) return (
            <div key={dayIndex} style={{ padding: "10px 14px", marginBottom: 6, borderRadius: 10, background: COLORS.card, border: `1px solid ${COLORS.grayLight}`, color: COLORS.gray, fontSize: 13 }}>
              {DAYS_FULL[dayIndex]}: No meals planned
            </div>
          );

          return (
            <div key={dayIndex} style={{ padding: "12px 14px", marginBottom: 6, borderRadius: 10, background: COLORS.card, border: `1px solid ${COLORS.grayLight}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: COLORS.navy, fontSize: 14 }}>{DAYS_FULL[dayIndex]}</span>
                <span style={{ fontSize: 12, color: COLORS.gray }}>{Math.round(dn.calories)} cal</span>
              </div>
              <div style={{ display: "flex", gap: 10, fontSize: 11, color: COLORS.gray }}>
                <span>P: {Math.round(dn.protein)}g</span>
                <span>C: {Math.round(dn.carbs)}g</span>
                <span>F: {Math.round(dn.fat)}g</span>
                <span>Na: {Math.round(dn.sodium)}mg</span>
              </div>
              {warnings.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  {warnings.map(w => <WarningTag key={w} text={w} />)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
