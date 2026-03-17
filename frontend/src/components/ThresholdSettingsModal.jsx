import { useState, useEffect, useRef } from "react";
import { COLORS } from "../constants/colors";
import * as api from "../services/api";

const DEFAULT_NUTRIENTS = ["calories", "protein", "carbs"];

function snapshotKey(thresholds) {
  return JSON.stringify(
    thresholds.map((t) => [t.nutrientKey, t.dailyValue, t.perMealValue])
  );
}

export default function ThresholdSettingsModal({ userId, onClose }) {
  const [mode, setMode] = useState("daily"); // "daily" or "perMeal"
  const [allNutrients, setAllNutrients] = useState([]); // from backend
  const [thresholds, setThresholds] = useState([]); // [{nutrientKey, dailyValue, perMealValue}]
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const savedSnapshotRef = useRef("");

  useEffect(() => {
    Promise.all([api.getAvailableNutrients(), api.getThresholds(userId)])
      .then(([nutrients, saved]) => {
        setAllNutrients(nutrients);
        let initial;
        if (saved.length > 0) {
          initial = saved;
        } else {
          initial = DEFAULT_NUTRIENTS.map((key) => {
            const n = nutrients.find((x) => x.key === key);
            return {
              nutrientKey: key,
              dailyValue: n?.defaultDaily ?? null,
              perMealValue: n?.defaultDaily ? Math.round(n.defaultDaily / 3) : null,
            };
          });
        }
        setThresholds(initial);
        savedSnapshotRef.current = snapshotKey(initial);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const hasChanges = snapshotKey(thresholds) !== savedSnapshotRef.current;

  const activeKeys = thresholds.map((t) => t.nutrientKey);
  const addableNutrients = allNutrients.filter((n) => !activeKeys.includes(n.key));

  const updateThreshold = (nutrientKey, field, value) => {
    setThresholds((prev) =>
      prev.map((t) =>
        t.nutrientKey === nutrientKey ? { ...t, [field]: value === "" ? null : parseFloat(value) } : t
      )
    );
  };

  const removeThreshold = (nutrientKey) => {
    setThresholds((prev) => prev.filter((t) => t.nutrientKey !== nutrientKey));
  };

  const addNutrient = (key) => {
    const n = allNutrients.find((x) => x.key === key);
    setThresholds((prev) => [
      ...prev,
      {
        nutrientKey: key,
        dailyValue: n?.defaultDaily ?? null,
        perMealValue: n?.defaultDaily ? Math.round(n.defaultDaily / 3) : null,
      },
    ]);
    setShowAddMenu(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.saveThresholds(userId, thresholds);
      savedSnapshotRef.current = snapshotKey(thresholds);
      // Force re-render so hasChanges updates
      setThresholds([...thresholds]);
    } catch (err) {
      console.error("Failed to save thresholds:", err);
    } finally {
      setSaving(false);
    }
  };

  const getLabel = (key) => {
    const n = allNutrients.find((x) => x.key === key);
    return n?.label || key.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getUnit = (key) => {
    const n = allNutrients.find((x) => x.key === key);
    if (n?.unit) return n.unit;
    if (key === "calories") return "kcal";
    if (key === "sodium" || key === "cholesterol") return "mg";
    return "g";
  };

  const fieldStyle = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 8,
    border: `1px solid ${COLORS.grayLight}`,
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };

  const tabStyle = (active) => ({
    flex: 1,
    padding: "8px 0",
    border: "none",
    borderRadius: 8,
    background: active ? COLORS.accent : "transparent",
    color: active ? "#fff" : COLORS.gray,
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.15s",
  });

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
    >
      <div
        style={{
          background: COLORS.card,
          borderRadius: 16,
          padding: 28,
          width: 440,
          maxWidth: "90vw",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "none",
            border: "none",
            fontSize: 20,
            color: COLORS.gray,
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: 6,
            lineHeight: 1,
          }}
          title="Close"
        >
          ×
        </button>
        <h3 style={{ margin: "0 0 16px", color: COLORS.navy, fontSize: 18 }}>
          Nutrient Thresholds
        </h3>

        {/* Daily / Per Meal toggle */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: COLORS.grayLight,
            borderRadius: 10,
            padding: 3,
            marginBottom: 20,
          }}
        >
          <button style={tabStyle(mode === "daily")} onClick={() => setMode("daily")}>
            Daily
          </button>
          <button style={tabStyle(mode === "perMeal")} onClick={() => setMode("perMeal")}>
            Per Meal
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 20, color: COLORS.gray }}>Loading...</div>
        ) : (
          <>
            {/* Threshold rows */}
            {thresholds.map((t) => (
              <div
                key={t.nutrientKey}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                  padding: "6px 0",
                  borderBottom: `1px solid ${COLORS.grayLight}`,
                }}
              >
                <div style={{ width: 130, flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.navy }}>
                    {getLabel(t.nutrientKey)}
                  </span>
                  <span style={{ fontSize: 11, color: COLORS.gray, fontWeight: 500, marginLeft: 4 }}>
                    ({getUnit(t.nutrientKey)})
                  </span>
                </div>
                <input
                  type="number"
                  min={0}
                  placeholder="No limit"
                  value={
                    mode === "daily"
                      ? t.dailyValue ?? ""
                      : t.perMealValue ?? ""
                  }
                  onChange={(e) =>
                    updateThreshold(
                      t.nutrientKey,
                      mode === "daily" ? "dailyValue" : "perMealValue",
                      e.target.value
                    )
                  }
                  style={{ ...fieldStyle, flex: 1 }}
                />
                {!DEFAULT_NUTRIENTS.includes(t.nutrientKey) ? (
                  <button
                    onClick={() => removeThreshold(t.nutrientKey)}
                    title="Remove"
                    style={{
                      background: "none",
                      border: "none",
                      color: COLORS.warn,
                      fontSize: 18,
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: 6,
                      flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                ) : (
                  <div style={{ width: 32, flexShrink: 0 }} />
                )}
              </div>
            ))}

            {/* Add nutrient button */}
            {addableNutrients.length > 0 && (
              <div style={{ position: "relative", marginBottom: 16 }}>
                <button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: `1px dashed ${COLORS.grayLight}`,
                    background: "transparent",
                    color: COLORS.accent,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  + Add Nutrient
                </button>
                {showAddMenu && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "100%",
                      left: 0,
                      right: 0,
                      marginBottom: 6,
                      background: "#fff",
                      borderRadius: 12,
                      border: `2px solid ${COLORS.accent}`,
                      boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
                      zIndex: 20,
                      maxHeight: 280,
                      overflowY: "auto",
                      padding: "6px 0",
                    }}
                  >
                    <div style={{ padding: "8px 16px 6px", fontSize: 11, fontWeight: 700, color: COLORS.gray, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Select a nutrient to add
                    </div>
                    {addableNutrients.map((n) => (
                      <button
                        key={n.key}
                        onClick={() => addNutrient(n.key)}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                          padding: "12px 16px",
                          border: "none",
                          borderBottom: `1px solid ${COLORS.grayLight}`,
                          background: "transparent",
                          color: COLORS.navy,
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.accentLight)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <span>{n.label}</span>
                        {n.defaultDaily != null && (
                          <span style={{ color: COLORS.gray, fontSize: 12, fontWeight: 500 }}>
                            RDA: {n.defaultDaily} {n.unit || ""}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Save button */}
        <div style={{ marginTop: 20 }}>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background: hasChanges ? COLORS.accent : COLORS.grayLight,
              color: hasChanges ? "#fff" : COLORS.gray,
              fontWeight: 700,
              fontSize: 14,
              cursor: saving || !hasChanges ? "default" : "pointer",
              opacity: saving ? 0.7 : 1,
              transition: "all 0.15s",
            }}
          >
            {saving ? "Saving..." : hasChanges ? "Save" : "Saved"}
          </button>
        </div>
      </div>
    </div>
  );
}
