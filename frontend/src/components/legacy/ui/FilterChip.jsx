import { COLORS } from "../../constants/colors";

export default function FilterChip({ label, active, onToggle }) {
  return (
    <button onClick={onToggle}
      style={{
        padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
        border: `1.5px solid ${active ? COLORS.accent : COLORS.grayLight}`,
        background: active ? COLORS.accentLight : COLORS.card,
        color: active ? COLORS.accent : COLORS.gray,
        transition: "all 0.2s",
      }}>
      {active ? "✓ " : ""}{label}
    </button>
  );
}
