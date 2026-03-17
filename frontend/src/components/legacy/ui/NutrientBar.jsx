import { COLORS } from "../../constants/colors";

export default function NutrientBar({ label, value, max, unit, color, warn }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.gray, marginBottom: 3 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ color: warn && pct > 90 ? COLORS.warn : COLORS.gray }}>
          {Math.round(value)}{unit} / {max}{unit}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: COLORS.grayLight }}>
        <div style={{
          height: "100%", borderRadius: 3, width: `${pct}%`,
          background: warn && pct > 90 ? COLORS.warn : pct > 75 ? COLORS.gold : color || COLORS.green,
          transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  );
}
