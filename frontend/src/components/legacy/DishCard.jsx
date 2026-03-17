import { COLORS } from "../constants/colors";
import ScoreBadge from "./ui/ScoreBadge";

const FOOD_EMOJIS = ["🍛", "🍜", "🥘", "🍲", "🍱", "🥗", "🍚", "🥙", "🍝", "🫕", "🥣", "🍳"];

function getEmojiForDish(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return FOOD_EMOJIS[Math.abs(hash) % FOOD_EMOJIS.length];
}

export default function DishCard({ dish, score, warnings, nutrients, isFavorite, isSelected, onToggleFavorite, onSelect, onAddToPlan, onCancel, onInfo }) {
  const emoji = getEmojiForDish(dish.id);

  return (
    <div
      style={{
        position: "relative",
        background: COLORS.card,
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${isSelected ? COLORS.accent : COLORS.grayLight}`,
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onClick={() => !isSelected && onSelect(dish)}
    >
      {/* Image area — full width, 1.8:1 aspect ratio */}
      <div style={{
        width: "100%",
        paddingBottom: "55.5%", /* ~1.8:1 */
        position: "relative",
        background: `linear-gradient(135deg, ${COLORS.accentLight} 0%, ${COLORS.goldLight || "#FEFCBF"} 100%)`,
      }}>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 56, userSelect: "none",
        }}>
          {emoji}
        </div>

        {/* Favorite button — top right */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(dish.id); }}
          style={{
            position: "absolute", top: 8, right: 8,
            width: 32, height: 32, borderRadius: 16,
            background: "rgba(255,255,255,0.85)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, transition: "transform 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.15)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      </div>

      {/* Info bar below image */}
      <div style={{ padding: "10px 14px 12px" }}>
        {/* Name + Score */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{
            fontSize: 14, fontWeight: 700, color: COLORS.navy,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, marginRight: 8,
          }}>
            {dish.name}
          </div>
          <ScoreBadge score={score.total} />
        </div>

        {/* Tags + Nutrients */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
          {dish.tags.slice(0, 2).map(t => (
            <span key={t} style={{
              fontSize: 10, padding: "2px 7px", borderRadius: 6,
              background: COLORS.accentLight, color: COLORS.accent, fontWeight: 600,
            }}>{t}</span>
          ))}
          <span style={{ fontSize: 11, color: COLORS.gray, marginLeft: 2 }}>
            {Math.round(nutrients.calories)} cal · P {Math.round(nutrients.protein)}g · C {Math.round(nutrients.carbs)}g · F {Math.round(nutrients.fat)}g
          </span>
        </div>
      </div>

      {/* Selection overlay */}
      {isSelected && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute", inset: 0,
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(1px)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 10,
            borderRadius: 16,
          }}
        >
          <button
            onClick={() => onAddToPlan(dish)}
            style={{
              padding: "10px 28px", borderRadius: 12, border: "none",
              background: COLORS.accent, color: "#fff",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
              boxShadow: "0 2px 8px rgba(212,113,59,0.3)",
            }}
          >
            + Add to Plan
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => onCancel()}
              style={{
                padding: "8px 20px", borderRadius: 10,
                border: `1px solid ${COLORS.grayLight}`, background: "#fff",
                color: COLORS.gray, fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => onInfo(dish)}
              style={{
                padding: "8px 20px", borderRadius: 10,
                border: `1px solid ${COLORS.grayLight}`, background: "#fff",
                color: COLORS.navy, fontWeight: 600, fontSize: 13, cursor: "pointer",
              }}
            >
              Info
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
