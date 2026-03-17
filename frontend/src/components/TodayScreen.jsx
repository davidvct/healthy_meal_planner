import { useState, useEffect, useCallback } from 'react';
import DayStrip from './DayStrip';
import MealCard from './MealCard';
import NutritionPanel from './NutritionPanel';
import * as api from '../services/api';

const MEAL_TYPES  = ['breakfast', 'lunch', 'dinner'];
const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };
const MEAL_EMOJI  = { breakfast: '☀️', lunch: '🌿', dinner: '🌙' };
const THUMB_CLASS = { breakfast: 'fv-b', lunch: 'fv-l', dinner: 'fv-d' };

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
        if (!cancelled) setSuggestions(dishes.slice(0, 4));
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
          onClick={() => onBrowse({ userId, dayIndex, mealType, label: MEAL_LABELS[mealType] })}
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
            {suggestions.map(d => (
              <div key={d.id} className="sugg-hcard">
                <div className={`sugg-himg ${THUMB_CLASS[mealType] || 'fv-l'}`}>
                  <span style={{ fontSize: 16 }}>{MEAL_EMOJI[mealType] || '🍽️'}</span>
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
            ))}
            <div
              className="sugg-hcard sugg-hmore"
              onClick={() => onBrowse({ userId, dayIndex, mealType, label: MEAL_LABELS[mealType] })}
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

export default function TodayScreen({ activeDiner, userId, onBrowse }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeDayIndex, setActiveDayIndex] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const mon = getMonday(today);
    return Math.max(0, Math.round((today - mon) / 86400000));
  });
  const [mealPlan, setMealPlan] = useState({});
  const [dayNutrients, setDayNutrients] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(
    () => localStorage.getItem('today-guide-dismissed') === '1'
  );
  const [swappingKey, setSwappingKey] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [nutExpanded, setNutExpanded] = useState(true);
  const [recommendedTargets, setRecommendedTargets] = useState(null);
  const [dishDetails, setDishDetails] = useState({});
  const [repeatBannerDismissed, setRepeatBannerDismissed] = useState(false);
  const [lastWeekHasMeals, setLastWeekHasMeals] = useState(false);
  const [prevWeekMealCount, setPrevWeekMealCount] = useState(0);
  const [copyingPlan, setCopyingPlan] = useState(false);

  const monday   = getMonday(addDays(new Date(), weekOffset * 7));
  const weekStart = toWeekStart(monday);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  useEffect(() => {
    const todayIdx = todayDayIndex(monday);
    setActiveDayIndex(todayIdx !== null ? todayIdx : 0);
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

  const handleRemove = async (entry) => {
    try {
      await api.removeDishFromPlan(userId, entry.id);
      await loadPlan();
      await loadNutrients();
    } catch (err) {
      console.error('Failed to remove dish:', err);
    }
  };

  const handleSwap = async (entry, mealType) => {
    const key = `${activeDayIndex}-${mealType}`;
    setSwappingKey(key);
    try {
      const res = await api.getRecommendedDishes(userId, {
        day: activeDayIndex,
        mealType,
        filterMealType: true,
        filterDiet: true,
        filterAllergies: true,
        filterConditions: true,
        weekStart,
      });
      const scored = res.scored || res.dishes || (Array.isArray(res) ? res : []);
      const dishes = scored.map(s => ({ ...(s.dish ?? s), id: s.dish?.id ?? s.id }));
      const candidate = dishes.find(d => d.id !== entry.id);
      if (!candidate) return;
      await api.removeDishFromPlan(userId, entry.id);
      await api.addDishToPlan(userId, {
        dayIndex: activeDayIndex,
        mealType,
        dishId: candidate.id,
        servings: 1,
        weekStart,
      });
      await loadPlan();
      await loadNutrients();
    } catch (err) {
      console.error('Swap failed:', err);
    } finally {
      setSwappingKey(null);
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

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
                    <button className="ewc-btn ewc-btn-navy" disabled>
                      Plan with AI ✨ <span style={{ fontSize: 9, opacity: .7 }}>(coming soon)</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {!(daysWithMeals === 0 && weekOffset !== 0) && (
              <div className="meal-cards">
                {MEAL_TYPES.map(mt => {
                  const entries  = dayMeals[mt] || [];
                  const swapKey  = `${activeDayIndex}-${mt}`;

                  if (entries.length > 0) {
                    return entries.map(entry => (
                      <MealCard
                        key={entry.id}
                        entry={entry}
                        mealType={mt}
                        onRemove={handleRemove}
                        onSwap={e => handleSwap(e, mt)}
                        onBrowse={() => onBrowse({ userId, dayIndex: activeDayIndex, mealType: mt, label: MEAL_LABELS[mt], weekStart })}
                        swapping={swappingKey === swapKey}
                        dishDetail={dishDetails[entry.dishId]}
                        healthClass={getDishHealthClass(dishDetails[entry.dishId], activeDiner?.conditions)}
                        userId={userId}
                      />
                    ));
                  }

                  return (
                    <EmptySlot
                      key={mt}
                      mealType={mt}
                      dayIndex={activeDayIndex}
                      weekStart={weekStart}
                      userId={userId}
                      onAdded={() => { loadPlan(); loadNutrients(); }}
                      onBrowse={onBrowse}
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
    </div>
  );
}
