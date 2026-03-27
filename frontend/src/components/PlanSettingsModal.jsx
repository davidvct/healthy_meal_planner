import { useState, useEffect, useRef } from "react";
import * as api from "../services/api";
import { trackPlanRejectedConstraint } from "../services/analytics";

/* ─── constants ─────────────────────────────────────────────────── */

const INTENSITY_WEIGHTS = {
  breakfast: { light: 1.5, balanced: 2.0, heavy: 3.0 },
  lunch:     { light: 3.0, balanced: 4.5, heavy: 6.0 },
  dinner:    { light: 2.5, balanced: 3.5, heavy: 5.0 },
};

function computeMealRatios(intensities) {
  const w = {
    breakfast: INTENSITY_WEIGHTS.breakfast[intensities.breakfast],
    lunch:     INTENSITY_WEIGHTS.lunch[intensities.lunch],
    dinner:    INTENSITY_WEIGHTS.dinner[intensities.dinner],
  };
  const total = w.breakfast + w.lunch + w.dinner;
  return {
    breakfast: parseFloat((w.breakfast / total).toFixed(4)),
    lunch:     parseFloat((w.lunch     / total).toFixed(4)),
    dinner:    parseFloat((w.dinner    / total).toFixed(4)),
  };
}

const MEAL_LABELS = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" };
const MEAL_ICONS  = { breakfast: "☀️", lunch: "🌿", dinner: "🌙" };
const DEFAULT_NUTRIENTS = ["calories", "protein", "carbs"];
const STORAGE_KEY = "mealwise_plan_settings";

// Condition → display styling + which nutrients are relevant.
// Actual limit VALUES come from backend via getRecommendedLimits().
const CONDITION_PROFILES = {
  "High Blood Sugar": {
    cls: "cp-amber", tagCls: "tg-amber",
    icon: "🩸",
    nutrients: ["sugar", "fiber", "carbs"],
  },
  "High Cholesterol": {
    cls: "cp-purple", tagCls: "tg-purple",
    icon: "💜",
    nutrients: ["fat", "cholesterol"],
  },
  "Hypertension": {
    cls: "cp-red", tagCls: "tg-red",
    icon: "❤️‍🩹",
    nutrients: ["sodium"],
  },
};

function loadSavedSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}
function saveToDisk(s) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

/* ─── component ─────────────────────────────────────────────────── */

export default function PlanSettingsModal({ userId, weekStart, onClose, onGenerated }) {
  const [profile, setProfile]           = useState(null);
  const [recTargets, setRecTargets]     = useState(null);
  const [dishesPerMeal, setDishesPerMeal] = useState({ breakfast: 1, lunch: 1, dinner: 1 });
  const [intensities, setIntensities]   = useState({ breakfast: "balanced", lunch: "balanced", dinner: "balanced" });
  const [thresholds, setThresholds]     = useState([]);
  const [allNutrients, setAllNutrients] = useState([]);
  const [strictMode, setStrictMode]     = useState(true);  // true = stay within MOH, false = allow exceeding
  const [loading, setLoading]           = useState(true);
  const [generating, setGenerating]     = useState(false);
  const [genProgress, setGenProgress]   = useState(0);
  const [error, setError]               = useState(null);
  const savedRef = useRef(null);

  /* ── data load ── */
  useEffect(() => {
    const saved = loadSavedSettings();
    Promise.all([
      api.getAvailableNutrients(),
      api.getThresholds(userId),
      api.getProfile(userId),
      api.getRecommendedLimits(userId),
    ]).then(([nutrients, savedThresholds, prof, recLimits]) => {
      setAllNutrients(nutrients);
      setProfile(prof);

      if (saved) {
        if (saved.dishesPerMeal) {
          // Backward compat: old format was a single int
          if (typeof saved.dishesPerMeal === "number") {
            setDishesPerMeal({ breakfast: saved.dishesPerMeal, lunch: saved.dishesPerMeal, dinner: saved.dishesPerMeal });
          } else {
            setDishesPerMeal(saved.dishesPerMeal);
          }
        }
        if (saved.intensities)   setIntensities(saved.intensities);
        if (saved.strictMode !== undefined) setStrictMode(saved.strictMode);
      }

      const profileCal = recLimits?.recommended?.calories || prof?.recommendedTargets?.calories || null;
      const conditions = prof?.conditions || [];
      const backendTargets = recLimits?.recommended || {};
      setRecTargets(backendTargets);

      // Build condition-aware recommended limits from backend targets
      const condLimits = {};
      for (const cond of conditions) {
        const cp = CONDITION_PROFILES[cond];
        if (!cp) continue;
        for (const key of cp.nutrients) {
          if (backendTargets[key] != null) {
            const daily = backendTargets[key];
            if (!condLimits[key] || daily < condLimits[key].daily) {
              condLimits[key] = { daily, per: "daily" };
            }
          }
        }
      }

      let initial;
      if (savedThresholds.length > 0) {
        initial = savedThresholds.map(t => ({
          ...t,
          enabled: t.enabled ?? (t.dailyValue != null || t.perMealValue != null),
          per: t.per ?? (t.perMealValue != null && t.dailyValue == null ? "meal" : "daily"),
          conditionSource: null,
        }));
      } else {
        initial = DEFAULT_NUTRIENTS.map(key => {
          const n = nutrients.find(x => x.key === key);
          const daily = key === "calories" && profileCal ? Math.round(profileCal) : (n?.defaultDaily ?? null);
          return {
            nutrientKey: key, enabled: true, per: "daily",
            dailyValue: daily, perMealValue: daily ? Math.round(daily / 3) : null,
            conditionSource: null,
          };
        });
      }

      // Auto-add condition-relevant nutrients with MOH recommended limits
      const existingKeys = new Set(initial.map(t => t.nutrientKey));
      for (const cond of conditions) {
        const cp = CONDITION_PROFILES[cond];
        if (!cp) continue;
        for (const key of cp.nutrients) {
          const limit = condLimits[key];
          if (existingKeys.has(key)) {
            // Update existing threshold with condition limit if stricter
            initial = initial.map(t => {
              if (t.nutrientKey !== key) return t;
              const condDaily = limit?.daily ?? t.dailyValue;
              if (t.dailyValue == null || condDaily < t.dailyValue) {
                return { ...t, dailyValue: condDaily, perMealValue: Math.round(condDaily / 3), conditionSource: cond };
              }
              return { ...t, conditionSource: t.conditionSource || cond };
            });
          } else {
            const n = nutrients.find(x => x.key === key);
            const daily = limit?.daily ?? n?.defaultDaily ?? null;
            initial.push({
              nutrientKey: key, enabled: true, per: limit?.per || "daily",
              dailyValue: daily, perMealValue: daily ? Math.round(daily / 3) : null,
              conditionSource: cond,
            });
            existingKeys.add(key);
          }
        }
      }

      // Restore saved local overrides
      if (saved?.thresholds) {
        const savedMap = Object.fromEntries(saved.thresholds.map(t => [t.nutrientKey, t]));
        initial = initial.map(t => {
          const sv = savedMap[t.nutrientKey];
          return sv ? { ...t, enabled: sv.enabled ?? t.enabled, per: sv.per ?? t.per, dailyValue: sv.dailyValue ?? t.dailyValue, perMealValue: sv.perMealValue ?? t.perMealValue } : t;
        });
      }

      setThresholds(initial);
      savedRef.current = initial;
    }).catch(console.error).finally(() => setLoading(false));
  }, [userId]);

  /* ── helpers ── */
  const setIntensity = (meal, level) => setIntensities(prev => ({ ...prev, [meal]: level }));

  const getLabel = key => {
    const n = allNutrients.find(x => x.key === key);
    return n?.label || key.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase());
  };
  const getUnit = key => {
    const n = allNutrients.find(x => x.key === key);
    if (n?.unit) return n.unit;
    return key === "calories" ? "kcal" : (key === "sodium" || key === "cholesterol") ? "mg" : "g";
  };
  const updateThreshold = (key, changes) => {
    setThresholds(prev => prev.map(t => t.nutrientKey === key ? { ...t, ...changes } : t));
  };
  const addableNutrients = allNutrients.filter(n => !thresholds.map(t => t.nutrientKey).includes(n.key));
  const addNutrient = key => {
    const n = allNutrients.find(x => x.key === key);
    setThresholds(prev => [...prev, {
      nutrientKey: key, enabled: true, per: "meal",
      dailyValue: n?.defaultDaily ?? null, perMealValue: n?.defaultDaily ? Math.round(n.defaultDaily / 3) : null,
      conditionSource: null,
    }]);
  };
  const removeThreshold = key => setThresholds(prev => prev.filter(t => t.nutrientKey !== key));

  const conditions = profile?.conditions || [];
  const diet = profile?.diet || "none";
  const dinerName = profile?.name || "";
  const hasConditions = conditions.length > 0;

  /* ── generate ── */
  const handleGenerate = async () => {
    setGenerating(true);
    setGenProgress(0);
    setError(null);

    const mergedThresholds = thresholds
      .filter(t => t.enabled)
      .map(t => {
        if (t.per === "meal" && t.perMealValue != null) {
          return { nutrientKey: t.nutrientKey, dailyValue: t.perMealValue * 3, perMealValue: t.perMealValue };
        }
        if (t.per === "daily" && t.dailyValue != null) {
          return { nutrientKey: t.nutrientKey, dailyValue: t.dailyValue, perMealValue: Math.round(t.dailyValue / 3) };
        }
        return { nutrientKey: t.nutrientKey, dailyValue: t.dailyValue, perMealValue: t.perMealValue };
      });

    const settings = {
      maxDishesPerSlot: dishesPerMeal,
      maxCalories: null, maxCarbs: null, maxFat: null,
      mealCalorieRatio: computeMealRatios(intensities),
    };

    saveToDisk({ dishesPerMeal, intensities, thresholds, strictMode });
    await api.saveThresholds(userId, mergedThresholds).catch(() => {});

    try {
      const validation = await api.validateAutofillPlan(userId, weekStart, settings, mergedThresholds);
      let allowRelaxation = !strictMode;
      if (validation.violations?.length && strictMode) {
        const msg = [
          "Some existing meals exceed the recommended thresholds.",
          "",
          ...validation.violations.map(v => `• Day ${v.dayIndex + 1}${v.mealType ? ` ${v.mealType}` : ""}: ${v.title}`),
          "",
          "Relax these constraints for existing meals and proceed?",
        ].join("\n");
        if (!window.confirm(msg)) { trackPlanRejectedConstraint(validation.violations); setGenerating(false); return; }
        allowRelaxation = true;
      }

      await api.autofillPlan(userId, weekStart, settings, mergedThresholds, allowRelaxation);
      onGenerated?.();
      onClose();
    } catch (err) {
      const msg = err?.message || "Plan generation failed.";
      setError(msg.includes("No feasible meal plan")
        ? "No feasible plan found. Try switching to \"Allow exceeding\" or relaxing some nutrient limits."
        : msg);
    } finally {
      setGenerating(false);
    }
  };

  /* ─── styles (uses CSS vars from index.html) ──────────────────── */
  const S = {
    overlay: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    },
    card: {
      background: "var(--white)", borderRadius: 16, padding: 0, width: "min(460px, 94vw)",
      maxHeight: "90vh", overflowY: "auto",
      boxShadow: "0 8px 32px rgba(6,155,142,0.25)", fontFamily: "var(--font)",
    },
    // header band
    header: {
      background: "var(--navy)", borderRadius: "16px 16px 0 0", padding: "18px 22px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    },
    body: { padding: "20px 22px" },
    section: { marginBottom: 20 },
    sectionLabel: {
      fontSize: 12, fontWeight: 700, color: "var(--navy)", textTransform: "uppercase",
      letterSpacing: "0.06em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6,
    },
    hint: { fontSize: 11, color: "var(--text3)", marginTop: 4, lineHeight: 1.4 },
    // pills
    pillRow: { display: "flex", gap: 6 },
    pill: (active) => ({
      flex: 1, padding: "8px 0", borderRadius: "var(--r-sm)", textAlign: "center",
      border: `1.5px solid ${active ? "var(--teal)" : "var(--border)"}`,
      background: active ? "var(--teal)" : "var(--white)", color: active ? "#fff" : "var(--text2)",
      fontWeight: 700, fontSize: 13, fontFamily: "var(--font)", cursor: "pointer",
      transition: "all 0.15s",
    }),
    // intensity row
    mealRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 },
    mealName: { width: 90, flexShrink: 0, fontSize: 13, fontWeight: 700, color: "var(--navy)", display: "flex", alignItems: "center", gap: 5 },
    // nutrient row
    nRow: (enabled, isCond) => ({
      display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
      padding: "7px 10px", borderRadius: "var(--r-sm)",
      background: enabled
        ? (isCond ? "rgba(6,155,142,0.04)" : "var(--white)")
        : "var(--bg)",
      border: `1px solid ${enabled ? (isCond ? "var(--teal)" : "var(--border)") : "var(--border)"}`,
      transition: "all 0.2s", marginBottom: 5,
      opacity: enabled ? 1 : 0.6,
    }),
    nInput: {
      width: 68, padding: "4px 7px", borderRadius: "var(--r-xs)",
      border: "1px solid var(--border2)", fontSize: 13,
      background: "var(--white)", color: "var(--navy)", fontFamily: "var(--font)",
      outline: "none", boxSizing: "border-box",
    },
    nSelect: {
      padding: "4px 6px", borderRadius: "var(--r-xs)", fontSize: 11,
      border: "1px solid var(--border2)", background: "var(--white)",
      color: "var(--text2)", fontFamily: "var(--font)", cursor: "pointer", outline: "none",
    },
    // toggle switch (strict/relax)
    toggle: (on) => ({
      width: 38, height: 20, borderRadius: 10, cursor: "pointer",
      background: on ? "var(--teal)" : "var(--border2)",
      position: "relative", transition: "background 0.2s", flexShrink: 0, border: "none",
    }),
    toggleDot: (on) => ({
      width: 16, height: 16, borderRadius: "50%", background: "#fff",
      position: "absolute", top: 2, left: on ? 20 : 2,
      transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
    }),
    genBtn: (disabled) => ({
      width: "100%", padding: "14px", borderRadius: "var(--r-sm)", border: "none",
      background: disabled ? "var(--border)" : "var(--teal)", color: disabled ? "var(--text3)" : "#fff",
      fontWeight: 800, fontSize: 15, fontFamily: "var(--font)", cursor: disabled ? "default" : "pointer",
      transition: "all 0.15s", position: "relative", overflow: "hidden",
    }),
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.card} onClick={e => e.stopPropagation()}>

        {/* ── Header band ── */}
        <div style={S.header}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 2 }}>
              Weekly planner
            </div>
            <div style={{ color: "#fff", fontSize: 17, fontWeight: 800 }}>
              Plan this week {dinerName ? `— ${dinerName}` : ""}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, color: "rgba(255,255,255,0.5)", cursor: "pointer", lineHeight: 1, padding: "0 4px" }}>×</button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text3)" }}>Loading…</div>
        ) : (
          <div style={S.body}>

            {/* ── 1. Health profile card ── */}
            {hasConditions && (
              <div style={S.section}>
                <div style={S.sectionLabel}>
                  <span style={{ fontSize: 14 }}>🩺</span> Health profile
                </div>
                <div className="cond-card" style={{ marginBottom: 0 }}>
                  <div className="cpills">
                    {conditions.map(cond => {
                      const cp = CONDITION_PROFILES[cond];
                      if (!cp) return (
                        <div key={cond} className="cpill" style={{ background: "var(--bg)", color: "var(--text2)" }}>
                          {cond}
                        </div>
                      );
                      // Build rule text from backend targets
                      const ruleParts = cp.nutrients
                        .filter(k => recTargets?.[k] != null)
                        .map(k => {
                          const v = Math.round(recTargets[k]);
                          const unit = k === 'sodium' ? 'mg' : 'g';
                          const dir = (k === 'fiber' || k === 'protein') ? '≥' : '≤';
                          return `${k.charAt(0).toUpperCase() + k.slice(1)} ${dir} ${v}${unit}`;
                        });
                      const ruleText = ruleParts.length > 0 ? ruleParts.join(' · ') + '/day' : '';
                      return (
                        <div key={cond} className={`cpill ${cp.cls}`}>
                          <div className="cp-ic" style={{ background: "currentColor", opacity: 0.2 }} />
                          {cp.icon} {cond}
                          {ruleText && <span className="cp-rule">{ruleText}</span>}
                        </div>
                      );
                    })}
                    {diet && diet !== "none" && (
                      <div className="cpill" style={{ background: "var(--teal-l)", color: "var(--teal)" }}>
                        🥗 {diet.charAt(0).toUpperCase() + diet.slice(1)}
                      </div>
                    )}
                  </div>

                  {/* Strict / Allow exceeding toggle */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10, marginTop: 12,
                    padding: "10px 12px", borderRadius: "var(--r-xs)",
                    background: strictMode ? "var(--teal-xl)" : "var(--amber-l)",
                    border: `1px solid ${strictMode ? "rgba(6,155,142,0.15)" : "rgba(217,119,6,0.15)"}`,
                    transition: "all 0.2s",
                  }}>
                    <button style={S.toggle(strictMode)} onClick={() => setStrictMode(v => !v)}>
                      <div style={S.toggleDot(strictMode)} />
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: strictMode ? "var(--teal)" : "var(--amber)" }}>
                        {strictMode ? "Stay within MOH thresholds" : "Allow exceeding thresholds"}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 1 }}>
                        {strictMode
                          ? "Solver will strictly respect condition-based nutrient limits"
                          : "Solver may exceed limits when no suitable dishes are available"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── 2. Dishes per meal ── */}
            <div style={S.section}>
              <div style={S.sectionLabel}>
                <span style={{ fontSize: 14 }}>🍽️</span> Dishes per meal
              </div>
              {["breakfast", "lunch", "dinner"].map(meal => (
                <div key={meal} style={S.mealRow}>
                  <span style={S.mealName}>
                    <span>{MEAL_ICONS[meal]}</span> {MEAL_LABELS[meal]}
                  </span>
                  <div style={{ ...S.pillRow, flex: 1 }}>
                    {[1, 2, 3].map(n => (
                      <button
                        key={n}
                        style={S.pill(dishesPerMeal[meal] === n)}
                        onClick={() => setDishesPerMeal(prev => ({ ...prev, [meal]: n }))}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div style={S.hint}>
                Lunch and dinner with 2+ dishes will include 1 main course plus sides, soup, salad, or dessert.
              </div>
            </div>

            {/* ── 3. Meal intensity ── */}
            <div style={S.section}>
              <div style={S.sectionLabel}>
                <span style={{ fontSize: 14 }}>⚖️</span> Meal intensity
              </div>
              {["breakfast", "lunch", "dinner"].map(meal => (
                <div key={meal} style={S.mealRow}>
                  <span style={S.mealName}>
                    <span>{MEAL_ICONS[meal]}</span> {MEAL_LABELS[meal]}
                  </span>
                  <div style={{ ...S.pillRow, flex: 1 }}>
                    {["light", "balanced", "heavy"].map(level => (
                      <button key={level} style={S.pill(intensities[meal] === level)} onClick={() => setIntensity(meal, level)}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div style={S.hint}>
                Controls calorie share per meal — Light = smaller portion, Heavy = larger portion of daily target.
              </div>
            </div>

            {/* ── 4. Nutrient limits ── */}
            <div style={S.section}>
              <div style={S.sectionLabel}>
                <span style={{ fontSize: 14 }}>📊</span> Nutrient limits
                <span className="tag tg-muted" style={{ fontSize: 9, padding: "1px 7px", marginLeft: 4 }}>optional</span>
              </div>
              <div style={S.hint}>
                Enable nutrients below and set a max value per meal or per day.
                {hasConditions && " Condition-based limits are pre-filled from MOH guidelines."}
              </div>

              <div style={{ display: "flex", flexDirection: "column", marginTop: 10 }}>
                {thresholds.map(t => {
                  const activeValue = t.per === "daily" ? (t.dailyValue ?? "") : (t.perMealValue ?? "");
                  const rec = allNutrients.find(x => x.key === t.nutrientKey);
                  const hint = t.per === "daily" ? rec?.defaultDaily : (rec?.defaultDaily ? Math.round(rec.defaultDaily / 3) : null);
                  const isCond = !!t.conditionSource;
                  const condProfile = isCond ? CONDITION_PROFILES[t.conditionSource] : null;

                  return (
                    <div key={t.nutrientKey} style={S.nRow(t.enabled, isCond)}>
                      {/* checkbox */}
                      <input
                        type="checkbox" checked={t.enabled}
                        onChange={e => updateThreshold(t.nutrientKey, { enabled: e.target.checked })}
                        style={{ accentColor: "var(--teal)", width: 14, height: 14, cursor: "pointer", flexShrink: 0 }}
                      />
                      {/* label */}
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)", minWidth: 64 }}>
                        {getLabel(t.nutrientKey)}
                      </span>
                      {/* condition badge */}
                      {isCond && condProfile && (
                        <span className={`tag ${condProfile.tagCls}`} style={{ fontSize: 8, padding: "1px 6px", lineHeight: 1.3 }}>
                          {condProfile.icon}
                        </span>
                      )}
                      {/* value controls */}
                      {t.enabled && (
                        <>
                          <span style={{ fontSize: 10, color: "var(--text3)", flexShrink: 0 }}>max</span>
                          <input
                            type="number" min={0}
                            placeholder={hint ? String(hint) : "–"}
                            value={activeValue}
                            onChange={e => {
                              const raw = e.target.value;
                              const val = raw === "" ? null : parseFloat(raw);
                              if (t.per === "daily") {
                                updateThreshold(t.nutrientKey, { dailyValue: val, perMealValue: val != null ? Math.round(val / 3) : null });
                              } else {
                                updateThreshold(t.nutrientKey, { perMealValue: val, dailyValue: val != null ? val * 3 : null });
                              }
                            }}
                            style={S.nInput}
                          />
                          <span style={{ fontSize: 10, color: "var(--text3)", flexShrink: 0 }}>{getUnit(t.nutrientKey)}</span>
                          <select value={t.per} onChange={e => updateThreshold(t.nutrientKey, { per: e.target.value })} style={S.nSelect}>
                            <option value="meal">per meal</option>
                            <option value="daily">per day</option>
                          </select>
                        </>
                      )}
                      {/* remove (only non-default, non-condition) */}
                      {!DEFAULT_NUTRIENTS.includes(t.nutrientKey) && !isCond && (
                        <button
                          onClick={() => removeThreshold(t.nutrientKey)}
                          style={{ background: "none", border: "none", color: "var(--coral)", fontSize: 15, cursor: "pointer", padding: "0 3px", flexShrink: 0, marginLeft: "auto" }}
                        >×</button>
                      )}
                    </div>
                  );
                })}

                {/* add nutrient */}
                {addableNutrients.length > 0 && (
                  <select
                    defaultValue=""
                    onChange={e => { if (e.target.value) { addNutrient(e.target.value); e.target.value = ""; } }}
                    style={{
                      padding: "7px 10px", borderRadius: "var(--r-sm)", border: "1.5px dashed var(--border2)",
                      background: "transparent", color: "var(--teal)", fontWeight: 600, fontSize: 11,
                      fontFamily: "var(--font)", cursor: "pointer", outline: "none", marginTop: 4,
                    }}
                  >
                    <option value="" disabled>+ Add a nutrient…</option>
                    {addableNutrients.map(n => (
                      <option key={n.key} value={n.key}>{n.label} ({n.unit})</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* ── Error ── */}
            {error && (
              <div style={{
                background: "var(--red-l)", borderRadius: "var(--r-sm)", padding: "10px 14px",
                color: "#DC2626", fontSize: 12, marginBottom: 14, border: "1px solid rgba(220,38,38,0.15)",
              }}>
                {error}
              </div>
            )}

            {/* ── Generate ── */}
            <button style={S.genBtn(generating)} disabled={generating} onClick={handleGenerate}>
              {generating && (
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: `${(genProgress / 7) * 100}%`,
                  background: "rgba(255,255,255,0.18)", transition: "width 0.4s ease",
                }} />
              )}
              <span style={{ position: "relative" }}>
                {generating ? "Generating plan…" : "⚡ Generate plan"}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
