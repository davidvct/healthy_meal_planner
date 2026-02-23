import { useState, useEffect } from "react";
import { COLORS } from "../constants/colors";
import { DAYS_FULL } from "../constants/mealTypes";
import NutrientBar from "./ui/NutrientBar";
import WarningTag from "./ui/WarningTag";
import * as api from "../services/api";

export default function NutrientSummaryPanel({ userId, onClose }) {
  const [viewMode, setViewMode] = useState("table");
  const [weekData, setWeekData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getWeekNutrients(userId).then(setWeekData).catch(() => {}).finally(() => setLoading(false));
  }, [userId]);

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
            <div style={{ height: 260, width: "100%" }}>
              {window.Recharts ? (
                <window.Recharts.ResponsiveContainer width="100%" height="100%">
                  <window.Recharts.BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <window.Recharts.CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grayLight} />
                    <window.Recharts.XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.gray }} interval={0} />
                    <window.Recharts.YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.gray }} tickFormatter={(val) => `${val}%`} />
                    <window.Recharts.Tooltip cursor={{ fill: COLORS.bg }} contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} formatter={(val) => [`${val}% of RDA`, "Intake"]} />
                    <window.Recharts.ReferenceLine y={100} stroke={COLORS.warn} strokeDasharray="3 3" />
                    <window.Recharts.Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <window.Recharts.Cell key={`cell-${index}`} fill={entry.pct > 100 ? COLORS.warn : entry.fill} />
                      ))}
                    </window.Recharts.Bar>
                  </window.Recharts.BarChart>
                </window.Recharts.ResponsiveContainer>
              ) : (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.gray }}>
                  Charting library not loaded.
                </div>
              )}
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
