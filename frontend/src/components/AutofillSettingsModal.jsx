import { useState } from "react";
import { COLORS } from "../constants/colors";

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

  const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  const handleSave = () => {
    saveAutofillSettings(settings);
    onClose();
  };

  const fieldStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${COLORS.grayLight}`,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 700,
    color: COLORS.navy,
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
          background: COLORS.card,
          borderRadius: 16,
          padding: 28,
          width: 380,
          maxWidth: "90vw",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: "0 0 20px", color: COLORS.navy, fontSize: 18 }}>
          Auto-fill Settings
        </h3>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Max dishes per slot</label>
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
          <label style={labelStyle}>Max calories per slot</label>
          <input
            type="number"
            min={0}
            placeholder="No limit"
            value={settings.maxCalories}
            onChange={(e) => update("maxCalories", e.target.value)}
            style={fieldStyle}
          />
          <span style={{ fontSize: 11, color: COLORS.gray }}>Leave empty for no limit</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Max carbs per slot (g)</label>
          <input
            type="number"
            min={0}
            placeholder="No limit"
            value={settings.maxCarbs}
            onChange={(e) => update("maxCarbs", e.target.value)}
            style={fieldStyle}
          />
          <span style={{ fontSize: 11, color: COLORS.gray }}>Leave empty for no limit</span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Max fat per slot (g)</label>
          <input
            type="number"
            min={0}
            placeholder="No limit"
            value={settings.maxFat}
            onChange={(e) => update("maxFat", e.target.value)}
            style={fieldStyle}
          />
          <span style={{ fontSize: 11, color: COLORS.gray }}>Leave empty for no limit</span>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background: COLORS.accent,
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
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
              border: `1px solid ${COLORS.grayLight}`,
              background: COLORS.card,
              color: COLORS.gray,
              fontWeight: 700,
              fontSize: 14,
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
