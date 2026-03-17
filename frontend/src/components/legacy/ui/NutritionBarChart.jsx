import { COLORS } from "../../constants/colors";
import { RDA } from "../../constants/mealTypes";

export const NUTRIENT_KEYS = ["calories", "protein", "carbs", "fat", "fiber", "sodium", "cholesterol", "sugar"];
export const NUTRIENT_LABELS = {
  calories: "Cal", protein: "Protein", carbs: "Carbs", fat: "Fat",
  fiber: "Fiber", sodium: "Sodium", cholesterol: "Chol", sugar: "Sugar",
};
export const NUTRIENT_UNITS = {
  calories: "kcal", protein: "g", carbs: "g", fat: "g",
  fiber: "g", sodium: "mg", cholesterol: "mg", sugar: "g",
};

const blinkKeyframes = `
@keyframes nutrientBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
`;

// Inject keyframes once
if (typeof document !== "undefined") {
  const styleId = "nutrient-blink-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = blinkKeyframes;
    document.head.appendChild(style);
  }
}

export default function NutritionBarChart({ label, totals, color, previewTotals }) {
  const bars = NUTRIENT_KEYS.map(k => {
    const pct = RDA[k] ? Math.round((totals[k] / RDA[k]) * 100) : 0;
    const previewPct = previewTotals && RDA[k] ? Math.round((previewTotals[k] / RDA[k]) * 100) : null;
    return {
      key: k,
      label: NUTRIENT_LABELS[k],
      pct,
      previewPct,
      value: Math.round(totals[k]),
      unit: NUTRIENT_UNITS[k],
    };
  });
  const maxPct = Math.max(100, ...bars.map(b => b.previewPct != null ? Math.max(b.pct, b.previewPct) : b.pct));

  const chartH = 72;
  const lineBottom = maxPct > 0 ? (100 / maxPct) * chartH : 0;

  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.navy, marginBottom: 6 }}>{label}</div>
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 90 }}>
          {bars.map(b => {
            const barH = maxPct > 0 ? Math.max(2, (b.pct / maxPct) * chartH) : 2;
            const over = b.pct > 100;
            const hasPreview = b.previewPct != null && b.previewPct !== b.pct;
            const previewBarH = hasPreview ? Math.max(2, (b.previewPct / maxPct) * chartH) : 0;
            const deltaH = hasPreview ? previewBarH - barH : 0;
            const previewOver = hasPreview && b.previewPct > 100;

            return (
              <div key={b.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: over ? COLORS.warn : COLORS.gray, marginBottom: 2 }}>
                  {hasPreview ? `${b.previewPct}%` : `${b.pct}%`}
                </div>
                <div style={{ position: "relative", width: "80%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {/* Preview delta bar (blinking) */}
                  {hasPreview && deltaH > 0 && (
                    <div style={{
                      width: "100%", height: deltaH, borderRadius: "4px 4px 0 0",
                      background: previewOver ? COLORS.warn : color,
                      opacity: 0.6,
                      animation: "nutrientBlink 1s ease-in-out infinite",
                    }} />
                  )}
                  {/* Base bar */}
                  <div style={{
                    width: "100%", height: barH, borderRadius: hasPreview && deltaH > 0 ? "0 0 4px 4px" : 4,
                    background: over ? COLORS.warn : color,
                    transition: "height 0.3s",
                  }} />
                </div>
                <div style={{ fontSize: 8, color: COLORS.gray, marginTop: 3, textAlign: "center", lineHeight: 1.2 }}>
                  {b.label}
                </div>
              </div>
            );
          })}
        </div>
        {/* 100% reference line */}
        {lineBottom > 0 && lineBottom <= chartH && (
          <div style={{
            position: "absolute",
            left: 0, right: 0,
            bottom: lineBottom + 14,
            borderTop: `1.5px dashed ${COLORS.gray}`,
            opacity: 0.45,
            pointerEvents: "none",
          }}>
            <span style={{ position: "absolute", right: 0, top: -10, fontSize: 8, color: COLORS.gray, fontWeight: 600 }}>100%</span>
          </div>
        )}
      </div>
    </div>
  );
}
