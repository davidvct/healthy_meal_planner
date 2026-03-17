import { useState } from "react";

export default function CaretakerSetup({ onComplete, onLogout }) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onComplete(name.trim());
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        {onLogout && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button
              onClick={onLogout}
              style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid var(--border2)", background: "var(--white)", color: "var(--text2)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font)" }}
            >
              Log out
            </button>
          </div>
        )}

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path d="M6 1S4 4.5 4 7a2 2 0 004 0C8 4.5 6 1 6 1z" fill="white"/>
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)" }}>MealVitals</span>
        </div>

        <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "28px 24px", boxShadow: "0 2px 12px rgba(11,34,64,.06)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)", marginTop: 0, marginBottom: 8 }}>Welcome, Caretaker!</h2>
          <p style={{ color: "var(--text3)", fontSize: 13, marginBottom: 24, marginTop: 0 }}>
            You'll manage meal plans for your diners. Let's start with your name.
          </p>

          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{
              width: "100%", padding: "13px 16px", borderRadius: "var(--r-sm)",
              border: "1.5px solid var(--border2)", background: "var(--bg)",
              color: "var(--text)", fontSize: 15, fontWeight: 600, outline: "none",
              boxSizing: "border-box", fontFamily: "var(--font)",
            }}
          />

          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            style={{
              marginTop: 20, width: "100%", padding: "13px 36px",
              borderRadius: "var(--r-sm)", border: "none",
              background: name.trim() ? "var(--teal)" : "var(--border)",
              color: name.trim() ? "#fff" : "var(--text3)",
              fontSize: 14, fontWeight: 700,
              cursor: name.trim() ? "pointer" : "default",
              fontFamily: "var(--font)", transition: "background 0.2s",
            }}
          >
            Get Started →
          </button>
        </div>
      </div>
    </div>
  );
}
