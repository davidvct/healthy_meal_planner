import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const RANGE_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: '3days', label: '3 Days' },
  { id: 'week',  label: 'This week' },
];

const CATEGORY_ICONS = {
  proteins:   '🥩',
  grains:     '🌾',
  vegetables: '🥦',
  fruits:     '🍎',
  dairy:      '🥛',
  pantry:     '🫙',
  other:      '📦',
};

const CATEGORY_ORDER = ['proteins', 'grains', 'vegetables', 'fruits', 'dairy', 'pantry', 'other'];

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#069B8E,#07B5A5)',
  'linear-gradient(135deg,#6D3FA0,#9B59B6)',
  'linear-gradient(135deg,#1560A0,#1E72B8)',
  'linear-gradient(135deg,#D95F3B,#E8734A)',
  'linear-gradient(135deg,#18A55A,#22C55E)',
];

function categorise(items) {
  const cats = {};
  (items || []).forEach(item => {
    const cat = (item.category || 'other').toLowerCase();
    const key = CATEGORY_ORDER.find(c => cat.includes(c)) || 'other';
    if (!cats[key]) cats[key] = [];
    cats[key].push(item);
  });
  return cats;
}

function getMonday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toWeekStart(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

// Returns which day indices (0–6) are in the selected range for the given week
function getRangeDays(range, monday) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const mondayTime = monday.getTime();
  const todayIdx = Math.round((today.getTime() - mondayTime) / 86400000);
  const isCurrentWeek = todayIdx >= 0 && todayIdx < 7;

  if (range === 'today')  return isCurrentWeek ? [todayIdx] : [];
  if (range === '3days')  return isCurrentWeek
    ? [0, 1, 2].map(i => todayIdx + i).filter(d => d < 7)
    : [];
  return [0, 1, 2, 3, 4, 5, 6];
}

export default function ShoppingScreen({ diners, activeDiner }) {
  const [range,          setRange]          = useState('week');
  const [activeDiners,   setActiveDiners]   = useState(() => new Set(activeDiner ? [activeDiner.userId] : []));
  const [items,          setItems]          = useState({});
  const [checked,        setChecked]        = useState(new Set());
  const [loading,        setLoading]        = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [weekOffset,     setWeekOffset]     = useState(0);

  // Sync activeDiners when prop changes
  useEffect(() => {
    if (activeDiner && activeDiners.size === 0) {
      setActiveDiners(new Set([activeDiner.userId]));
    }
  }, [activeDiner]);

  // Reset checked items when range/week changes
  useEffect(() => { setChecked(new Set()); }, [range, weekOffset]);

  const monday    = getMonday(addDays(new Date(), weekOffset * 7));
  const weekLabel = `${monday.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })} – ${addDays(monday, 6).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}`;

  const loadList = useCallback(async () => {
    if (activeDiners.size === 0) { setItems({}); return; }
    setLoading(true);
    try {
      const m  = getMonday(addDays(new Date(), weekOffset * 7));
      const ws = toWeekStart(m);
      const rangeDays = new Set(getRangeDays(range, m));

      const allItems = [];

      for (const userId of activeDiners) {
        // Fetch meal plan and current shopping selections in parallel
        const [plan, shoppingRes] = await Promise.all([
          api.getMealPlan(userId, ws),
          api.getShoppingList(userId, ws),
        ]);

        const existingSelections = new Set(
          (shoppingRes?.selections || []).map(s => `${s.dayIndex}:${s.mealType}`)
        );

        // Desired selections = filled slots that fall within the current range
        const desiredSelections = new Set();
        for (const dayIndex of rangeDays) {
          const dayMeals = plan?.[dayIndex] || {};
          for (const [mealType, entries] of Object.entries(dayMeals)) {
            if (Array.isArray(entries) && entries.length > 0) {
              desiredSelections.add(`${dayIndex}:${mealType}`);
            }
          }
        }

        // Slots to add (planned but not yet selected)
        const toAdd = [...desiredSelections].filter(k => !existingSelections.has(k));
        // Slots to remove (selected but no longer in range/plan)
        const toRemove = [...existingSelections].filter(k => !desiredSelections.has(k));

        const toggles = [
          ...toAdd.map(k => {
            const [di, mt] = k.split(':');
            return api.toggleShoppingSelection(userId, ws, Number(di), mt);
          }),
          ...toRemove.map(k => {
            const [di, mt] = k.split(':');
            return api.toggleShoppingSelection(userId, ws, Number(di), mt);
          }),
        ];

        if (toggles.length > 0) {
          await Promise.allSettled(toggles);
        }

        // Fetch the final shopping list with synced selections
        const finalRes = await api.getShoppingList(userId, ws);
        const list = finalRes?.items || (Array.isArray(finalRes) ? finalRes : []);
        allItems.push(...list);
      }

      setItems(categorise(allItems));
    } catch (err) {
      console.error('Failed to load shopping list:', err);
      setItems({});
    } finally {
      setLoading(false);
    }
  }, [activeDiners, weekOffset, range]);

  useEffect(() => { loadList(); }, [loadList]);

  const allItems     = Object.values(items).flat();
  const checkedCount = checked.size;
  const totalCount   = allItems.length;
  const pct          = totalCount ? Math.round((checkedCount / totalCount) * 100) : 0;

  const toggleCheck = (key) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const toggleDiner = (userId) => {
    setActiveDiners(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId); else next.add(userId);
      return next;
    });
  };

  // For "Today" and "3 Days", disable week nav (only relevant for current week)
  const isCurrentWeek = weekOffset === 0;
  const rangeNeedsCurrentWeek = range === 'today' || range === '3days';

  const displayedCategories = activeCategory
    ? (items[activeCategory] ? { [activeCategory]: items[activeCategory] } : {})
    : items;

  const visibleCats = CATEGORY_ORDER.filter(c => items[c]?.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

        {/* ── Controls bar ── */}
        <div className="shop-bar">
          {/* Range pills */}
          {RANGE_OPTIONS.map(r => {
            const disabled = (r.id === 'today' || r.id === '3days') && !isCurrentWeek;
            return (
              <button
                key={r.id}
                className={`shop-rpill${range === r.id ? ' on' : ''}`}
                onClick={() => { if (!disabled) setRange(r.id); }}
                style={disabled ? { opacity: 0.4, cursor: 'default' } : undefined}
              >
                {r.label}
              </button>
            );
          })}

          {/* Week nav — always shown */}
          <div className="shop-sep" />
          <button
            onClick={() => setWeekOffset(o => o - 1)}
            style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--border2)', background: 'var(--white)', cursor: 'pointer', fontSize: 13, color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font)', flexShrink: 0 }}
          >‹</button>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', whiteSpace: 'nowrap', minWidth: 110, textAlign: 'center' }}>{weekOffset === 0 ? 'This week' : weekLabel}</span>
          <button
            onClick={() => setWeekOffset(o => o + 1)}
            disabled={weekOffset >= 0}
            style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--border2)', background: 'var(--white)', cursor: weekOffset >= 0 ? 'default' : 'pointer', fontSize: 13, color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font)', flexShrink: 0, opacity: weekOffset >= 0 ? 0.35 : 1 }}
          >›</button>

          {/* Diner chips (only if multiple diners) */}
          {diners.length > 1 && (
            <>
              <div className="shop-sep" />
              {diners.map((d, i) => {
                const on = activeDiners.has(d.userId);
                return (
                  <button
                    key={d.userId}
                    className={`shop-dchip${on ? ' on' : ''}`}
                    onClick={() => toggleDiner(d.userId)}
                  >
                    <div
                      className="shop-dchip-av"
                      style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}
                    >
                      {d.name?.slice(0, 2).toUpperCase()}
                    </div>
                    {d.name}
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* ── No-meals-in-range notice ── */}
        {rangeNeedsCurrentWeek && !isCurrentWeek && !loading && (
          <div style={{ padding: '8px 16px', fontSize: 11, color: 'var(--text3)', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
            "Today" and "3 Days" only apply to the current week. Switch to <strong>This week</strong> to browse other weeks.
          </div>
        )}

        {/* ── Progress row ── */}
        {totalCount > 0 && (
          <div className="shop-progress-row">
            <div className="shop-prog-big">{checkedCount} of {totalCount} items</div>
            <div className="shop-prog-bar">
              <div className="shop-prog-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="shop-prog-pct">{pct}%</div>
            <button
              onClick={() => setChecked(new Set())}
              style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font)', flexShrink: 0 }}
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── Body ── */}
        <div className="shop-layout">

          {/* Category sidebar */}
          <div className="shop-sidebar">
            <button
              className={`shop-sidebar-item${activeCategory ? '' : ' active'}`}
              onClick={() => setActiveCategory(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
            >
              <div className="shop-si-icon">🛒</div>
              <div className="shop-si-body">
                <div className="shop-si-row">
                  <span className="shop-si-lbl">All items</span>
                  <span className="shop-si-count">{totalCount}</span>
                </div>
                <div className="shop-si-bar">
                  <div className="shop-si-fill" style={{ width: totalCount ? `${pct}%` : '0%' }} />
                </div>
              </div>
            </button>

            {visibleCats.map(cat => {
              const on       = activeCategory === cat;
              const catItems = items[cat] || [];
              const catChecked = catItems.filter(it => checked.has(it.name)).length;
              const catPct   = catItems.length ? Math.round((catChecked / catItems.length) * 100) : 0;
              const allDone  = catChecked === catItems.length && catItems.length > 0;
              return (
                <button
                  key={cat}
                  className={`shop-sidebar-item${on ? ' active' : ''}`}
                  onClick={() => setActiveCategory(on ? null : cat)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                >
                  <div className="shop-si-icon">{CATEGORY_ICONS[cat]}</div>
                  <div className="shop-si-body">
                    <div className="shop-si-row">
                      <span className="shop-si-lbl">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                      {allDone
                        ? <span className="shop-si-done">✓</span>
                        : <span className="shop-si-count">{catChecked}/{catItems.length}</span>
                      }
                    </div>
                    <div className="shop-si-bar">
                      <div className="shop-si-fill" style={{ width: `${catPct}%` }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Items area */}
          <div className="shop-panel-body">
            {loading ? (
              <div style={{ padding: '24px 0', fontSize: 12, color: 'var(--text3)' }}>Loading shopping list…</div>
            ) : totalCount === 0 ? (
              <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text3)' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🛒</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>No items yet</div>
                <div style={{ fontSize: 11 }}>Add meals to your plan to populate the shopping list</div>
              </div>
            ) : (
              Object.entries(displayedCategories).map(([cat, catItems]) => (
                <div key={cat}>
                  <div className="shop-cat-hd">{CATEGORY_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
                  <div className="shop-tokens">
                    {catItems.map(item => {
                      const key       = item.name || Math.random().toString();
                      const isChecked = checked.has(key);
                      return (
                        <button
                          key={key}
                          className={`shop-token${isChecked ? ' checked' : ''}`}
                          onClick={() => toggleCheck(key)}
                        >
                          <span className="shop-tok-dot" />
                          <span className="shop-tok-name">{item.name}</span>
                          {item.grams != null && item.grams > 0 && (
                            <span className="shop-tok-qty">{item.grams}g</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
