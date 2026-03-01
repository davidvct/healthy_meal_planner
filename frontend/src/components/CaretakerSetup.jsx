import { useState } from "react";
import { COLORS } from "../constants/colors";

export default function CaretakerSetup({ onComplete, onLogout }) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onComplete(name.trim());
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        {onLogout && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <button
              onClick={onLogout}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: `1px solid ${COLORS.grayLight}`,
                background: COLORS.card,
                color: COLORS.gray,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        )}

        <span style={{ fontSize: 28, fontWeight: 800, color: COLORS.accent }}>MealWise</span>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.navy, marginTop: 32, marginBottom: 8 }}>Welcome, Caretaker!</h2>
        <p style={{ color: COLORS.gray, fontSize: 14, marginBottom: 28 }}>
          You'll manage meal plans for your diners. Let's start with your name.
        </p>

        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{
            width: "100%",
            padding: "14px 18px",
            borderRadius: 14,
            border: `2px solid ${COLORS.grayLight}`,
            background: COLORS.card,
            color: COLORS.navy,
            fontSize: 16,
            fontWeight: 600,
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          style={{
            marginTop: 24,
            padding: "14px 36px",
            borderRadius: 12,
            border: "none",
            background: name.trim() ? COLORS.accent : COLORS.grayLight,
            color: name.trim() ? "#fff" : COLORS.gray,
            fontSize: 16,
            fontWeight: 700,
            cursor: name.trim() ? "pointer" : "default",
            boxShadow: name.trim() ? "0 2px 8px rgba(212,113,59,0.3)" : "none",
            transition: "all 0.2s",
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
