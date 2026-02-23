import { COLORS } from "../../constants/colors";

export default function ScoreBadge({ score }) {
  const color = score >= 80 ? COLORS.green : score >= 50 ? COLORS.gold : COLORS.warn;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 8,
      background: score >= 80 ? COLORS.greenLight : score >= 50 ? COLORS.goldLight : COLORS.warnBg,
      color, fontSize: 12, fontWeight: 700,
    }}>
      {score >= 80 ? "★" : score >= 50 ? "●" : "▼"} {score}%
    </div>
  );
}
