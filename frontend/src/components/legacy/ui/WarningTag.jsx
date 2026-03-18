import { COLORS } from "../../constants/colors";

export default function WarningTag({ text }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 6, background: COLORS.warnBg,
      color: COLORS.warn, fontSize: 11, fontWeight: 700, marginRight: 4,
    }}>
      ⚠ {text}
    </span>
  );
}
