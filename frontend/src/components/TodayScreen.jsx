import { useState, useEffect, useCallback, useRef } from 'react';
import DayStrip from './DayStrip';
import MealCard from './MealCard';
import NutritionPanel from './NutritionPanel';
import AutofillSettingsModal, { loadAutofillSettings } from './AutofillSettingsModal';
import ThresholdSettingsModal from './ThresholdSettingsModal';
import * as api from '../services/api';

const MEAL_TYPES  = ['breakfast', 'lunch', 'dinner'];
const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };
const MEAL_EMOJI  = { breakfast: '☀️', lunch: '🌿', dinner: '🌙' };
const THUMB_CLASS = { breakfast: 'fv-b', lunch: 'fv-l', dinner: 'fv-d' };
const MEAL_CUTOFF = { breakfast: 11, lunch: 14, dinner: 20 };

/** Check if a meal slot is locked (past its planning deadline). */
export function isSlotLocked(date, mealType) {
  const now = new Date();
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d < today) return true;                       // past day
  if (d.getTime() === today.getTime()) {             // today — check cutoff
    const cutoff = MEAL_CUTOFF[mealType];
    if (cutoff && now.getHours() >= cutoff) return true;
  }
  return false;
}

/** Check if an entire day is fully past (all slots locked). */
export function isDayPast(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

function getMonday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toWeekStart(mondayDate) {
  const y = mondayDate.getFullYear();
  const m = String(mondayDate.getMonth() + 1).padStart(2, '0');
  const d = String(mondayDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function todayDayIndex(monday) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today - monday) / 86400000);
  return diff >= 0 && diff < 7 ? diff : null;
}

const MEAL_SLOT_INDEX = { breakfast: 0, lunch: 1, dinner: 2 };

function LockedSlot({ mealType }) {
  return (
    <div className="empty-slot-c locked-slot">
      <div className="es-header">
        <div className="es-lbl">
          <span>{MEAL_EMOJI[mealType]}</span>
          {MEAL_LABELS[mealType]}
          <span className="es-sub">— past deadline</span>
        </div>
      </div>
      <div style={{ padding: '16px 14px', fontSize: 12, color: 'var(--text3)' }}>
        🔒 Planning closed — {MEAL_LABELS[mealType].toLowerCase()} cutoff was {MEAL_CUTOFF[mealType] > 12 ? `${MEAL_CUTOFF[mealType] - 12} PM` : `${MEAL_CUTOFF[mealType]} AM`}
      </div>
    </div>
  );
}

function EmptySlot({ mealType, dayIndex, weekStart, userId, onAdded, onBrowse }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.getRecommendedDishes(userId, {
          day: dayIndex,
          mealType,
          filterMealType: true,
          filterDiet: true,
          filterAllergies: true,
          filterConditions: true,
          weekStart,
        });
        const scored = res.scored || res.dishes || (Array.isArray(res) ? res : []);
        const dishes = scored.map(s => ({
          ...(s.dish ?? s),
          kcal: s.nutrients?.calories ?? s.dish?.kcal ?? 0,
        }));
        // Offset by day + meal type so every slot across the week gets different suggestions
        // Wraps with modulo so we never run out of suggestions
        const slotIdx = MEAL_SLOT_INDEX[mealType] || 0;
        const rawOffset = (dayIndex * 3 + slotIdx) * 3;
        const pool = dishes.length;
        if (!cancelled) {
          if (pool <= 3) {
            setSuggestions(dishes.slice(0, 3));
          } else {
            const offset = rawOffset % Math.max(1, pool - 2);
            const picked = dishes.slice(offset, offset + 3);
            // If near the end, wrap around
            if (picked.length < 3) {
              picked.push(...dishes.slice(0, 3 - picked.length));
            }
            setSuggestions(picked);
          }
        }
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [userId, mealType, dayIndex, weekStart]);

  const handleAdd = async (dish) => {
    const dishId = dish.id;
    setAddingId(dishId);
    try {
      await api.addDishToPlan(userId, { dayIndex, mealType, dishId, servings: 1, weekStart });
      onAdded();
    } catch (err) {
      console.error('Failed to add dish:', err);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="empty-slot-c">
      <div className="es-header">
        <div className="es-lbl">
          <span>{MEAL_EMOJI[mealType]}</span>
          {MEAL_LABELS[mealType]}
          <span className="es-sub">— not planned</span>
        </div>
        <button
          className="es-browse"
          onClick={() => onBrowse({ userId, dayIndex, mealType, label: MEAL_LABELS[mealType], weekStart })}
        >
          Browse all →
        </button>
      </div>

      <div className="sugg-hscroll">
        {loading ? (
          <div style={{ padding: '20px 0', fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>
            Loading suggestions…
          </div>
        ) : suggestions.length === 0 ? (
          <div style={{ padding: '20px 0', fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>
            No suggestions available
          </div>
        ) : (
          <>
            {suggestions.map(d => {
              const suggImg = d.image_url || d.imageUrl || '';
              return (
              <div key={d.id} className="sugg-hcard">
                <div className={`sugg-himg ${THUMB_CLASS[mealType] || 'fv-l'}`} style={{ overflow: 'hidden' }}>
                  {suggImg ? (
                    <img
                      src={suggImg}
                      alt=""
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = ''; }}
                    />
                  ) : null}
                  <span style={{ fontSize: 16, display: suggImg ? 'none' : '' }}>{MEAL_EMOJI[mealType] || '🍽️'}</span>
                </div>
                <div className="sugg-hbody">
                  <div className="sugg-hname">{d.dishName || d.name}</div>
                  {d.kcal > 0 && <div className="sugg-hkcal">{d.kcal} kcal</div>}
                </div>
                <button
                  className="sugg-hadd"
                  onClick={() => handleAdd(d)}
                  disabled={addingId === d.id}
                >
                  {addingId === d.id ? '✓' : '+ Add'}
                </button>
              </div>
            );
            })}
            <div
              className="sugg-hcard sugg-hmore"
              onClick={() => onBrowse({ userId, dayIndex, mealType, label: MEAL_LABELS[mealType], weekStart })}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: .4 }}>
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textAlign: 'center', lineHeight: 1.3, marginTop: 4 }}>
                Browse<br />all →
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function getDishHealthClass(dishDetail, conditions) {
  if (!dishDetail || !conditions?.length) return 'mc-safe';
  const condLower = conditions.map(c => c.toLowerCase());
  const rank = { safe: 0, warn: 1, alert: 2 };
  let worst = 'safe';
  const check = (cat) => {
    const c = (cat || '').toLowerCase();
    if (rank[c] !== undefined && rank[c] > rank[worst]) worst = c;
  };
  if (condLower.some(c => c.includes('blood sugar') || c.includes('diabetes'))) check(dishDetail.diabetes_category);
  if (condLower.some(c => c.includes('cholesterol'))) check(dishDetail.cholesterol_category);
  if (condLower.some(c => c.includes('hypertension') || c.includes('blood pressure'))) check(dishDetail.hypertension_category);
  return worst === 'alert' ? 'mc-alert' : worst === 'warn' ? 'mc-warn' : 'mc-safe';
}

function formatAutofillViolations(violations) {
  if (!violations?.length) return '';
  return violations
    .map((v) => {
      const slot = v.mealType ? `Day ${v.dayIndex + 1} ${v.mealType}` : `Day ${v.dayIndex + 1}`;
      return `- ${slot}: ${v.title}`;
    })
    .join('\n');
}

export default function TodayScreen({ activeDiner, userId, onBrowse, weekOffset: weekOffsetProp = 0, onWeekOffsetChange, initialDayIndex = null, onDayIndexChange, userTier = 'paid' }) {
  const [weekOffsetLocal, setWeekOffsetLocal] = useState(weekOffsetProp);
  const weekOffset = weekOffsetProp ?? weekOffsetLocal;
  const setWeekOffset = (v) => {
    const val = typeof v === 'function' ? v(weekOffset) : v;
    setWeekOffsetLocal(val);
    onWeekOffsetChange?.(val);
  };
  const [activeDayIndex, setActiveDayIndexRaw] = useState(() => {
    if (initialDayIndex !== null) return initialDayIndex;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const mon = getMonday(today);
    return Math.max(0, Math.round((today - mon) / 86400000));
  });
  const setActiveDayIndex = (v) => {
    const val = typeof v === 'function' ? v(activeDayIndex) : v;
    setActiveDayIndexRaw(val);
    onDayIndexChange?.(val);
  };
  const [mealPlan, setMealPlan] = useState({});
  const [dayNutrients, setDayNutrients] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(
    () => localStorage.getItem('today-guide-dismissed') === '1'
  );
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [nutExpanded, setNutExpanded] = useState(true);
  const [recommendedTargets, setRecommendedTargets] = useState(null);
  const [dishDetails, setDishDetails] = useState({});
  const [repeatBannerDismissed, setRepeatBannerDismissed] = useState(false);
  const [lastWeekHasMeals, setLastWeekHasMeals] = useState(false);
  const [prevWeekMealCount, setPrevWeekMealCount] = useState(0);
  const [copyingPlan, setCopyingPlan] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [genProgress, setGenProgress] = useState(0); // 0-7 days completed
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const [showAutofillSettings, setShowAutofillSettings] = useState(false);
  const [showThresholds, setShowThresholds] = useState(false);
  const [autofilling, setAutofilling] = useState(false);

  const monday   = getMonday(addDays(new Date(), weekOffset * 7));
  const weekStart = toWeekStart(monday);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  const prevWeekOffsetRef = useRef(weekOffset);
  useEffect(() => {
    // Only reset day index when user navigates to a different week via arrows,
    // not on initial mount (which should preserve the day from browse context)
    if (prevWeekOffsetRef.current !== weekOffset) {
      prevWeekOffsetRef.current = weekOffset;
      const todayIdx = todayDayIndex(monday);
      setActiveDayIndex(todayIdx !== null ? todayIdx : 0);
    }
  }, [weekOffset]);

  const loadDishDetails = async (plan) => {
    const allEntries = Object.values(plan).flatMap(day =>
      Object.values(day).flatMap(entries => Array.isArray(entries) ? entries : [])
    );
    const dishIds = [...new Set(allEntries.map(e => e.dishId).filter(Boolean))];
    if (!dishIds.length) return;
    const settled = await Promise.allSettled(dishIds.map(id => api.getDishDetail(id)));
    setDishDetails(prev => {
      const next = { ...prev };
      dishIds.forEach((id, i) => {
        if (settled[i].status === 'fulfilled') next[id] = settled[i].value;
      });
      return next;
    });
  };

  const loadPlan = useCallback(async () => {
    if (!userId) return null;
    setLoadingPlan(true);
    try {
      const plan = await api.getMealPlan(userId, weekStart);
      const p = plan || {};
      setMealPlan(p);
      return p;
    } catch (err) {
      console.error('Failed to load meal plan:', err);
      setMealPlan({});
      return {};
    } finally {
      setLoadingPlan(false);
    }
  }, [userId, weekStart]);

  const loadNutrients = useCallback(async () => {
    if (!userId) return;
    try {
      const nut = await api.getDayNutrients(userId, activeDayIndex, weekStart);
      setDayNutrients(nut);
    } catch {
      setDayNutrients(null);
    }
  }, [userId, activeDayIndex, weekStart]);

  useEffect(() => {
    loadPlan().then(plan => {
      if (plan) loadDishDetails(plan);
    });
  }, [loadPlan]);
  useEffect(() => { loadNutrients(); }, [loadNutrients]);

  // Load personalized nutrition targets from user profile
  useEffect(() => {
    if (!userId) return;
    api.getProfile(userId).then(p => {
      if (p?.recommendedTargets) setRecommendedTargets(p.recommendedTargets);
    }).catch(() => {});
  }, [userId]);

  // Check if previous week (weekOffset-1) has meals — used by repeat banner and ewc-wrap
  useEffect(() => {
    if (!userId) { setLastWeekHasMeals(false); setPrevWeekMealCount(0); return; }
    const prevMonday = getMonday(addDays(new Date(), (weekOffset - 1) * 7));
    const prevWeekStart = toWeekStart(prevMonday);
    api.getMealPlan(userId, prevWeekStart).then(plan => {
      const allEntries = Object.values(plan || {}).flatMap(day =>
        Object.values(day).flatMap(entries => Array.isArray(entries) ? entries : [])
      );
      setLastWeekHasMeals(allEntries.length > 0);
      setPrevWeekMealCount(allEntries.length);
    }).catch(() => { setLastWeekHasMeals(false); setPrevWeekMealCount(0); });
  }, [userId, weekOffset]);

  const handleCopyPlan = async () => {
    setCopyingPlan(true);
    try {
      const lastMonday = getMonday(addDays(new Date(), (weekOffset - 1) * 7));
      const lastWeekStart = toWeekStart(lastMonday);
      const lastPlan = await api.getMealPlan(userId, lastWeekStart);
      const adds = [];
      Object.entries(lastPlan || {}).forEach(([dayIdx, meals]) => {
        Object.entries(meals).forEach(([mealType, entries]) => {
          (entries || []).forEach(entry => {
            if (entry.dishId) {
              adds.push(api.addDishToPlan(userId, {
                dayIndex: Number(dayIdx),
                mealType,
                dishId: entry.dishId,
                servings: entry.servings || 1,
                weekStart,
              }));
            }
          });
        });
      });
      await Promise.allSettled(adds);
      setRepeatBannerDismissed(true);
      const plan = await loadPlan();
      if (plan) loadDishDetails(plan);
      await loadNutrients();
    } catch (err) {
      console.error('Failed to copy plan:', err);
    } finally {
      setCopyingPlan(false);
    }
  };

  const showToast = useCallback((msg, undo = null) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ msg, undo });
    if (!undo) {
      toastTimerRef.current = setTimeout(() => setToast(null), 3000);
    }
  }, []);

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    setGenProgress(0);
    let totalAdded = 0;
    try {
      for (let day = 0; day < 7; day++) {
        const result = await api.generateMealPlan(userId, { weekStart, dayIndex: day });
        if (result.success === false) {
          showToast(result.error || 'Could not generate plan');
          break;
        }
        totalAdded += result.entriesWritten || 0;
        setGenProgress(day + 1);
        const plan = await loadPlan();
        if (plan) loadDishDetails(plan);
      }
      await loadNutrients();
      if (totalAdded > 0) showToast(`Week planned! ${totalAdded} meals added`);
    } catch (err) {
      console.error('Plan generation failed:', err);
      showToast('Failed to generate plan');
    } finally {
      setGeneratingPlan(false);
      setGenProgress(0);
    }
  };

  const handleAutofill = useCallback(async () => {
    setAutofilling(true);
    try {
      const raw = loadAutofillSettings();
      const settings = {
        maxDishesPerSlot: raw.maxDishesPerSlot || 2,
        maxCalories: raw.maxCalories ? parseFloat(raw.maxCalories) : null,
        maxCarbs: raw.maxCarbs ? parseFloat(raw.maxCarbs) : null,
        maxFat: raw.maxFat ? parseFloat(raw.maxFat) : null,
      };
      const [availableNutrients, savedThresholds] = await Promise.all([
        api.getAvailableNutrients(),
        api.getThresholds(userId),
      ]);
      const requiredKeys = ['calories', 'protein', 'carbs', 'fat'];
      const thresholdMap = new Map(savedThresholds.map((item) => [item.nutrientKey, item]));
      for (const key of requiredKeys) {
        const nutrient = availableNutrients.find((item) => item.key === key);
        const dailyValue = nutrient?.defaultDaily ?? null;
        const existing = thresholdMap.get(key);
        const hasUsableValue = existing && ((existing.dailyValue ?? null) !== null || (existing.perMealValue ?? null) !== null);
        if (hasUsableValue) continue;
        thresholdMap.set(key, { nutrientKey: key, dailyValue, perMealValue: dailyValue ? Math.round(dailyValue / 3) : null });
      }
      const thresholds = Array.from(thresholdMap.values());
      const validation = await api.validateAutofillPlan(userId, weekStart, settings, thresholds);
      let allowConstraintRelaxation = false;
      if (validation.violations?.length) {
        const warning = [
          'Some existing meals violate hard constraints.',
          'If you proceed, autofill will relax those constraints for existing meals only.',
          '', formatAutofillViolations(validation.violations), '', 'Proceed anyway?',
        ].join('\n');
        if (!window.confirm(warning)) return;
        allowConstraintRelaxation = true;
      }
      await api.autofillPlan(userId, weekStart, settings, thresholds, allowConstraintRelaxation);
      const plan = await loadPlan();
      if (plan) loadDishDetails(plan);
      await loadNutrients();
      showToast('Auto-fill complete!');
    } catch (err) {
      console.error('Auto-fill failed:', err);
      const message = err?.message || 'Auto-fill failed.';
      if (message.includes('No feasible meal plan found.')) {
        window.alert('No feasible meal plan was found for the selected week and current constraints.');
      } else {
        window.alert(message);
      }
    } finally {
      setAutofilling(false);
    }
  }, [userId, weekStart, loadPlan, loadNutrients, showToast]);

  const handleRemove = async (entry) => {
    try {
      await api.removeDishFromPlan(userId, entry.id);
      await loadPlan();
      await loadNutrients();
    } catch (err) {
      console.error('Failed to remove dish:', err);
    }
  };

  const dayMeals  = mealPlan?.[activeDayIndex] || {};
  const mealCount = MEAL_TYPES.filter(mt => (dayMeals[mt] || []).length > 0).length;

  const activeDate = weekDates[activeDayIndex] || weekDates[0];
  const _dayRaw = activeDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const dayLabel = _dayRaw.replace(/^(\w+) /, '$1, ');
  const daysWithMeals = Object.keys(mealPlan).filter(di =>
    Object.values(mealPlan[di] || {}).some(entries => Array.isArray(entries) && entries.length > 0)
  ).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>

      {/* Day strip (includes date header) */}
      <div style={{ flexShrink: 0, padding: '12px 16px 0 16px' }}>
        <DayStrip
          weekDates={weekDates}
          activeDayIndex={activeDayIndex}
          mealPlan={mealPlan}
          onSelectDay={setActiveDayIndex}
          onPrevWeek={() => setWeekOffset(o => o - 1)}
          onNextWeek={() => setWeekOffset(o => o + 1)}
          dayLabel={dayLabel}
          daysWithMeals={daysWithMeals}
          dinerName={activeDiner?.name}
        />
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 16px', minHeight: 0 }}>

        {/* Repeat last week banner — current week, empty, prev week has meals */}
        {!repeatBannerDismissed && lastWeekHasMeals && daysWithMeals === 0 && weekOffset === 0 && (
          <div className="repeat-banner">
            <div className="rb-ic">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2.5 7.5C2.5 5 4.5 3 7 3h2M11 2v3H8" stroke="var(--teal)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.5 5.5C10.5 8 8.5 10 6 10H4M2 11V8h3" stroke="var(--teal)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="rb-body">
              <div className="rb-title">Repeat last week's meals?</div>
              <div className="rb-sub">
                {prevWeekMealCount > 0
                  ? `Copy ${prevWeekMealCount} meal${prevWeekMealCount === 1 ? '' : 's'} from last week to this week. You can edit any meal after.`
                  : 'Copy last week\'s meals to this week. You can edit any meal after.'}
              </div>
              <div className="rb-actions">
                <button className="rb-copy" onClick={handleCopyPlan} disabled={copyingPlan}>
                  {copyingPlan ? 'Copying…' : 'Copy meals →'}
                </button>
                <button className="rb-skip" onClick={() => setRepeatBannerDismissed(true)}>Skip</button>
              </div>
            </div>
          </div>
        )}

        {/* Getting started banner */}
        {!bannerDismissed && (
          <div className="today-guide-banner">
            <div className="tgb-icon">💡</div>
            <div className="tgb-body">
              <div className="tgb-title">Getting started</div>
              <div className="tgb-sub">Tap any meal slot to add a dish. Empty slots show suggested dishes based on the active diner's health profile. Your nutrition panel updates in real time.</div>
            </div>
            <button
              className="tgb-close"
              title="Dismiss"
              onClick={() => { setBannerDismissed(true); localStorage.setItem('today-guide-dismissed', '1'); }}
            >×</button>
          </div>
        )}

        {/* "Meals for today" header */}
        <div className="today-section-hd">
          <div className="today-section-title">Meals for today</div>
          <div className="meal-progress-bar">
            <div className="mpb-dots">
              {[0, 1, 2].map(i => (
                <div key={i} className={`mpb-dot${i < mealCount ? ' filled' : ''}`} />
              ))}
            </div>
            <div className="mpb-label">{mealCount} of 3 meals planned</div>
          </div>
          <button
            className={`nut-toggle-btn${nutExpanded ? ' expanded' : ''}`}
            onClick={() => setNutExpanded(v => !v)}
            style={{ marginLeft: 'auto' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d={nutExpanded ? 'M9 3L6 6L3 3M9 7L6 10L3 7' : 'M3 3L6 6L9 3M3 7L6 10L9 7'}
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
            {nutExpanded ? 'Hide nutrition' : 'Show nutrition'}
          </button>
        </div>

        {/* Auto-fill & Threshold action buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <button
            className="af-action-btn af-btn-primary"
            onClick={handleAutofill}
            disabled={autofilling}
          >
            {autofilling ? 'Filling…' : '⚡ Auto-fill week'}
          </button>
          <button
            className="af-action-btn af-btn-secondary"
            onClick={() => setShowAutofillSettings(true)}
          >
            ⚙ Auto-fill Settings
          </button>
          <button
            className="af-action-btn af-btn-secondary"
            onClick={() => setShowThresholds(true)}
          >
            🎯 Thresholds
          </button>
        </div>

        {/* Two-column grid */}
        <div className={nutExpanded ? 'today-grid' : 'today-grid nut-collapsed'}>

          {/* Meal cards column */}
          <div>
            {loadingPlan && (
              <div style={{ padding: '16px 0', fontSize: 12, color: 'var(--text3)' }}>
                Loading plan…
              </div>
            )}

            {/* Empty week split card — shown when navigating to a week with no meals */}
            {!loadingPlan && daysWithMeals === 0 && weekOffset !== 0 && (() => {
              const prevMonday = getMonday(addDays(new Date(), (weekOffset - 1) * 7));
              const prevLabel = `${prevMonday.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })} – ${addDays(prevMonday, 6).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}`;
              const DOT_COLORS = ['#FCD34D', '#6EE7B7', '#93C5FD'];
              return (
                <div className="ewc-wrap">
                  {/* Left: copy last week */}
                  <div className="ewc-half">
                    <div className="ewc-badge ewc-badge-teal">
                      Last week{prevLabel ? ` · ${prevLabel}` : ''}
                    </div>
                    <div className="ewc-title">Copy last week's meals</div>
                    <div className="ewc-desc">
                      {lastWeekHasMeals ? `${prevWeekMealCount} meal${prevWeekMealCount === 1 ? '' : 's'} planned` : 'No meals last week'}
                    </div>
                    <div className="ewc-meals">
                      {lastWeekHasMeals
                        ? DOT_COLORS.map((c, i) => (
                            <div key={i} className="ewc-row">
                              <div className="ewc-dot" style={{ background: c }} />
                              <span className="ewc-meal">Meals from last week</span>
                            </div>
                          )).slice(0, 1).concat(
                            prevWeekMealCount > 1
                              ? [<div key="more" className="ewc-more">+ {prevWeekMealCount - 1} more meals</div>]
                              : []
                          )
                        : <div className="ewc-empty-note">No meals found in the previous week</div>
                      }
                    </div>
                    <button
                      className="ewc-btn ewc-btn-teal"
                      disabled={!lastWeekHasMeals || copyingPlan}
                      onClick={handleCopyPlan}
                    >
                      {copyingPlan ? 'Copying…' : lastWeekHasMeals ? `Copy ${prevWeekMealCount} meals →` : 'No meals to copy'}
                    </button>
                  </div>

                  <div className="ewc-divider" />

                  {/* Right: plan with AI */}
                  <div className="ewc-half">
                    <div className="ewc-badge ewc-badge-navy">AI planner</div>
                    <div className="ewc-title">Plan the full week for {activeDiner?.name || 'you'}</div>
                    <div className="ewc-desc">Fills all 7 days with constraint-safe meals</div>
                    <div className="ewc-meals">
                      {(activeDiner?.conditions?.length > 0) && (
                        <div className="ewc-row">
                          <div className="ewc-dot" style={{ background: '#5DCAA5' }} />
                          <span className="ewc-meal">Conditions: {activeDiner.conditions.join(', ')}</span>
                        </div>
                      )}
                      <div className="ewc-row">
                        <div className="ewc-dot" style={{ background: '#5DCAA5' }} />
                        <span className="ewc-meal">Personalised to your health profile</span>
                      </div>
                    </div>
                    <button className="ewc-btn ewc-btn-navy" disabled={generatingPlan} onClick={handleGeneratePlan}
                      style={{ position: 'relative', overflow: 'hidden' }}>
                      {generatingPlan && (
                        <div style={{
                          position: 'absolute', left: 0, top: 0, bottom: 0,
                          width: `${(genProgress / 7) * 100}%`,
                          background: 'rgba(255,255,255,.18)',
                          transition: 'width .4s ease',
                        }} />
                      )}
                      <span style={{ position: 'relative' }}>
                        {generatingPlan ? `Planning day ${genProgress + 1} of 7…` : 'Plan with AI ✨'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {!(daysWithMeals === 0 && weekOffset !== 0) && (
              <div className="meal-cards">
                {MEAL_TYPES.map(mt => {
                  const entries  = dayMeals[mt] || [];
                  const locked   = isSlotLocked(activeDate, mt);

                  if (entries.length > 0) {
                    // Only show 1 meal card per slot (safety net)
                    return entries.slice(0, 1).map(entry => (
                      <MealCard
                        key={entry.id}
                        entry={entry}
                        mealType={mt}
                        onRemove={locked ? undefined : handleRemove}
                        onBrowse={locked ? undefined : () => onBrowse({ userId, dayIndex: activeDayIndex, mealType: mt, label: MEAL_LABELS[mt], weekStart })}
                        dishDetail={dishDetails[entry.dishId]}
                        healthClass={getDishHealthClass(dishDetails[entry.dishId], activeDiner?.conditions)}
                        userId={userId}
                        locked={locked}
                      />
                    ));
                  }

                  if (locked) {
                    return <LockedSlot key={mt} mealType={mt} />;
                  }

                  return (
                    <EmptySlot
                      key={mt}
                      mealType={mt}
                      dayIndex={activeDayIndex}
                      weekStart={weekStart}
                      userId={userId}
                      onAdded={() => { setToast(null); loadPlan(); loadNutrients(); }}
                      onBrowse={ctx => { setToast(null); onBrowse(ctx); }}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Nutrition panel column */}
          <div className="nut-toggle-col">
            <div className={`nut-panel-wrap${nutExpanded ? '' : ' collapsed'}`}>
              <NutritionPanel
                nutrients={dayNutrients}
                conditions={activeDiner?.conditions}
                diet={activeDiner?.dietaryPreferences || activeDiner?.diet}
                dinerName={activeDiner?.name}
                mealCount={mealCount}
                recommendedTargets={recommendedTargets}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast">
          <span>{toast.msg}</span>
          {toast.undo && (
            <button
              style={{ background: 'none', border: '1px solid rgba(255,255,255,.4)', color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}
              onClick={() => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); setToast(null); toast.undo(); }}
            >Undo</button>
          )}
        </div>
      )}

      {/* Modals */}
      {showAutofillSettings && <AutofillSettingsModal onClose={() => setShowAutofillSettings(false)} />}
      {showThresholds && <ThresholdSettingsModal userId={userId} onClose={() => setShowThresholds(false)} />}
    </div>
  );
}
