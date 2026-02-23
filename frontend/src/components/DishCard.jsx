import { COLORS } from "../constants/colors";
import ScoreBadge from "./ui/ScoreBadge";
import WarningTag from "./ui/WarningTag";

export default function DishCard({ dish, score, warnings, nutrients, onSelect, onDetail }) {
  return (
    <div style={{
      background: COLORS.card, borderRadius: 16, padding: 16, cursor: "pointer",
      border: `1px solid ${COLORS.grayLight}`, transition: "all 0.2s",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.navy, marginBottom: 4 }}>{dish.name}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
            {warnings.map(w => <WarningTag key={w} text={w} />)}
            {dish.tags.slice(0, 2).map(t => (
              <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: COLORS.accentLight, color: COLORS.accent, fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </div>
        <ScoreBadge score={score.total} />
      </div>

      <div style={{ display: "flex", gap: 12, fontSize: 12, color: COLORS.gray, marginBottom: 12 }}>
        <span>{Math.round(nutrients.calories)} cal</span>
        <span>P {Math.round(nutrients.protein)}g</span>
        <span>C {Math.round(nutrients.carbs)}g</span>
        <span>F {Math.round(nutrients.fat)}g</span>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={(e) => { e.stopPropagation(); onSelect(dish); }}
          style={{
            flex: 1, padding: "10px", borderRadius: 10, border: "none", background: COLORS.accent, color: "#fff",
            fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}>
          + Add to Plan
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDetail(dish); }}
          style={{
            padding: "10px 14px", borderRadius: 10, border: `1px solid ${COLORS.grayLight}`, background: COLORS.card,
            color: COLORS.gray, fontWeight: 600, fontSize: 13, cursor: "pointer",
          }}>
          Details
        </button>
      </div>
    </div>
  );
}
