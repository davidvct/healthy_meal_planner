import { useState } from "react";

const STORAGE_KEY = "mealwise_autofill_settings";

export function loadAutofillSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { maxDishesPerSlot: 2, maxCalories: "", maxCarbs: "", maxFat: "" };
}

function saveAutofillSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export default function AutofillSettingsModal({ onClose }) {
  const [settings, setSettings] = useState(loadAutofillSettings);
  const [savedSettings, setSavedSettings] = useState(loadAutofillSettings);

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  const handleSave = () => {
    saveAutofillSettings(settings);
    setSavedSettings({ ...settings });
  };

  const fieldStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #E8EDF3",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "var(--font)",
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--navy)",
    marginBottom: 4,
    display: "block",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--white)",
          borderRadius: 16,
          padding: "clamp(16px, 4vw, 28px)",
          width: "min(380px, 92vw)",
          boxShadow: "0 8px 32px rgba(6,155,142,0.25)",
          fontFamily: "var(--font)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: "var(--navy)", fontSize: 18, fontFamily: "var(--font)" }}>
            Auto-fill Settings
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              color: "var(--text3)",
              cursor: "pointer",
              padding: "0 4px",
              lineHeight: 1,
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Max dishes per meal</label>
          <input
            type="number"
            min={1}
            max={10}
            value={settings.maxDishesPerSlot}
            onChange={(e) => update("maxDishesPerSlot", parseInt(e.target.value) || 1)}
            style={fieldStyle}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Max calories per meal</label>
          <input
            type="number"
            min={0}
            placeholder="No limit"
            value={settings.maxCalories}
            onChange={(e) => update("maxCalories", e.target.value)}
            style={fieldStyle}
          />
          <span style={{ fontSize: 11, color: "var(--text3)" }}>Leave empty for no limit</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Max carbs per meal (g)</label>
          <input
            type="number"
            min={0}
            placeholder="No limit"
            value={settings.maxCarbs}
            onChange={(e) => update("maxCarbs", e.target.value)}
            style={fieldStyle}
          />
          <span style={{ fontSize: 11, color: "var(--text3)" }}>Leave empty for no limit</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Max fat per meal (g)</label>
          <input
            type="number"
            min={0}
            placeholder="No limit"
            value={settings.maxFat}
            onChange={(e) => update("maxFat", e.target.value)}
            style={fieldStyle}
          />
          <span style={{ fontSize: 11, color: "var(--text3)" }}>Leave empty for no limit</span>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background: hasChanges ? "var(--teal)" : "var(--border)",
              color: hasChanges ? "#fff" : "var(--text3)",
              fontWeight: 700,
              fontSize: 14,
              fontFamily: "var(--font)",
              cursor: hasChanges ? "pointer" : "default",
            }}
          >
            Save
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 12,
              border: "1px solid var(--border2)",
              background: "#fff",
              color: "var(--text2)",
              fontWeight: 700,
              fontSize: 14,
              fontFamily: "var(--font)",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
