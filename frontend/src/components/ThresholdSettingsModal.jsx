import { useState, useEffect, useRef } from "react";
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
    border: "1px solid #E8EDF3",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "var(--font)",
  };

  const tabStyle = (active) => ({
    flex: 1,
    padding: "8px 0",
    border: "none",
    borderRadius: 8,
    background: active ? "var(--teal)" : "transparent",
    color: active ? "#fff" : "var(--text3)",
    fontWeight: 700,
    fontSize: 13,
    fontFamily: "var(--font)",
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
      onClick={onClose}
    >
      <div
        style={{
          background: "#FEF0EB",
          borderRadius: 16,
          padding: 28,
          width: 440,
          maxWidth: "90vw",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 8px 32px rgba(6,155,142,0.25)",
          position: "relative",
          fontFamily: "var(--font)",
        }}
        onClick={(e) => e.stopPropagation()}
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
            color: "var(--text3)",
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: 6,
            lineHeight: 1,
          }}
          title="Close"
        >
          ×
        </button>
        <h3 style={{ margin: "0 0 16px", color: "var(--navy)", fontSize: 18, fontFamily: "var(--font)" }}>
          Nutrient Thresholds
        </h3>

        {/* Daily / Per Meal toggle */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "var(--border)",
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
          <div style={{ textAlign: "center", padding: 20, color: "var(--text3)" }}>Loading...</div>
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
                  borderBottom: "1px solid #E8EDF3",
                }}
              >
                <div style={{ width: 130, flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>
                    {getLabel(t.nutrientKey)}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500, marginLeft: 4 }}>
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
                      color: "var(--coral)",
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
                    border: "1px dashed var(--border2)",
                    background: "transparent",
                    color: "var(--teal)",
                    fontWeight: 700,
                    fontSize: 13,
                    fontFamily: "var(--font)",
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
                      border: "2px solid var(--teal)",
                      boxShadow: "0 8px 28px rgba(6,155,142,0.18)",
                      zIndex: 20,
                      maxHeight: 280,
                      overflowY: "auto",
                      padding: "6px 0",
                    }}
                  >
                    <div style={{ padding: "8px 16px 6px", fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 0.5 }}>
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
                          borderBottom: "1px solid #E8EDF3",
                          background: "transparent",
                          color: "var(--navy)",
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: "var(--font)",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--teal-xl)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <span>{n.label}</span>
                        {n.defaultDaily != null && (
                          <span style={{ color: "var(--text3)", fontSize: 12, fontWeight: 500 }}>
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
              background: hasChanges ? "var(--teal)" : "var(--border)",
              color: hasChanges ? "#fff" : "var(--text3)",
              fontWeight: 700,
              fontSize: 14,
              fontFamily: "var(--font)",
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
