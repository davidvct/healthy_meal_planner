import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { trackShoppingItemChecked } from '../services/analytics';

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
const CATEGORY_TINTS = {
  proteins:   'rgba(220,38,38,0.04)',
  grains:     'rgba(217,119,6,0.04)',
  vegetables: 'rgba(5,150,105,0.04)',
  fruits:     'rgba(236,72,153,0.04)',
  dairy:      'rgba(59,130,246,0.04)',
  pantry:     'rgba(109,63,160,0.04)',
  other:      'rgba(100,116,139,0.04)',
};

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
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
function toWeekStart(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function getRangeDays(range, monday) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayIdx = Math.round((today.getTime() - monday.getTime()) / 86400000);
  const isCurrentWeek = todayIdx >= 0 && todayIdx < 7;
  if (range === 'today')  return isCurrentWeek ? [todayIdx] : [];
  if (range === '3days')  return isCurrentWeek ? [0, 1, 2].map(i => todayIdx + i).filter(d => d < 7) : [];
  const start = isCurrentWeek ? todayIdx : 0;
  return [0, 1, 2, 3, 4, 5, 6].filter(d => d >= start);
}

function fmtQty(amount, unit = 'g') {
  if (!amount || amount <= 0) return null;
  if (unit === 'ml') {
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}L`;
    return `${Math.round(amount)}ml`;
  }
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}kg`;
  if (amount >= 100) return `${Math.round(amount / 10) * 10}g`;
  return `${Math.round(amount)}g`;
}

// localStorage key for checked state
function checkedKey(userId, weekStart, range) {
  return `shop_checked_${userId}_${weekStart}_${range}`;
}

export default function ShoppingScreen({ diners, activeDiner, onGoToPlan }) {
  const [range,        setRange]        = useState('week');
  const [activeDiners, setActiveDiners] = useState(() => new Set(activeDiner ? [activeDiner.userId] : []));
  const [items,        setItems]        = useState({});
  const [checked,      setChecked]      = useState(new Set());
  const [loading,      setLoading]      = useState(false);
  const [weekOffset,   setWeekOffset]   = useState(0);
  const [showDone,     setShowDone]     = useState(false);

  useEffect(() => {
    if (activeDiner && activeDiners.size === 0) {
      setActiveDiners(new Set([activeDiner.userId]));
    }
  }, [activeDiner]);

  const monday    = getMonday(addDays(new Date(), weekOffset * 7));
  const weekStart = toWeekStart(monday);
  const weekLabel = `${monday.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })} – ${addDays(monday, 6).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}`;

  // Persist/restore checked state
  useEffect(() => {
    try {
      const key = checkedKey([...activeDiners].sort().join(','), weekStart, range);
      const saved = localStorage.getItem(key);
      if (saved) setChecked(new Set(JSON.parse(saved)));
      else setChecked(new Set());
    } catch { setChecked(new Set()); }
  }, [range, weekOffset, activeDiners, weekStart]);

  const saveChecked = (next) => {
    setChecked(next);
    try {
      const key = checkedKey([...activeDiners].sort().join(','), weekStart, range);
      localStorage.setItem(key, JSON.stringify([...next]));
    } catch {}
  };

  const loadList = useCallback(async () => {
    if (activeDiners.size === 0) { setItems({}); return; }
    setLoading(true);
    try {
      const m  = getMonday(addDays(new Date(), weekOffset * 7));
      const ws = toWeekStart(m);
      const rangeDays = new Set(getRangeDays(range, m));
      const allItems = [];

      for (const userId of activeDiners) {
        const plan = await api.getMealPlan(userId, ws);
        const selections = [];
        for (const dayIndex of rangeDays) {
          const dayMeals = plan?.[dayIndex] || {};
          for (const [mealType, entries] of Object.entries(dayMeals)) {
            if (Array.isArray(entries) && entries.length > 0) {
              selections.push({ dayIndex, mealType });
            }
          }
        }
        const res = await api.setShoppingSelections(userId, ws, selections);
        allItems.push(...(res?.items || []));
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
    const next = new Set(checked);
    if (next.has(key)) next.delete(key); else { next.add(key); trackShoppingItemChecked(key); }
    saveChecked(next);
  };

  const toggleDiner = (userId) => {
    setActiveDiners(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId); else next.add(userId);
      return next;
    });
  };

  const handleCopyList = () => {
    const lines = [];
    CATEGORY_ORDER.forEach(cat => {
      const catItems = items[cat];
      if (!catItems?.length) return;
      lines.push(`${CATEGORY_ICONS[cat]} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`);
      catItems.forEach(it => {
        const qty = fmtQty(it.amount, it.unit);
        const mark = checked.has(it.name) ? '✓' : '○';
        lines.push(`  ${mark} ${it.name}${qty ? ` (${qty})` : ''}`);
      });
      lines.push('');
    });
    navigator.clipboard?.writeText(lines.join('\n')).then(() => {
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2000);
    });
  };

  const [copyToast, setCopyToast] = useState(false);

  const isCurrentWeek = weekOffset === 0;
  const rangeNeedsCurrentWeek = range === 'today' || range === '3days';

  // Split items into unchecked and checked
  const uncheckedCats = {};
  const checkedCats = {};
  CATEGORY_ORDER.forEach(cat => {
    const catItems = items[cat] || [];
    const unc = catItems.filter(it => !checked.has(it.name));
    const chk = catItems.filter(it => checked.has(it.name));
    if (unc.length) uncheckedCats[cat] = unc;
    if (chk.length) checkedCats[cat] = chk;
  });
  const checkedTotal = Object.values(checkedCats).flat().length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

        {/* Controls bar */}
        <div className="shop-bar">
          {RANGE_OPTIONS.map(r => {
            const disabled = (r.id === 'today' || r.id === '3days') && !isCurrentWeek;
            return (
              <button key={r.id} className={`shop-rpill${range === r.id ? ' on' : ''}`}
                onClick={() => { if (!disabled) setRange(r.id); }}
                style={disabled ? { opacity: 0.4, cursor: 'default' } : undefined}
              >{r.label}</button>
            );
          })}

          <div className="shop-sep" />
          <button onClick={() => setWeekOffset(o => o - 1)} disabled={weekOffset <= 0}
            style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border2)', background: 'var(--white)', cursor: weekOffset <= 0 ? 'default' : 'pointer', fontSize: 14, color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font)', flexShrink: 0, opacity: weekOffset <= 0 ? 0.35 : 1 }}
          >‹</button>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', whiteSpace: 'nowrap', minWidth: 110, textAlign: 'center' }}>
            {weekOffset === 0 ? 'This week' : weekLabel}
          </span>
          <button onClick={() => setWeekOffset(o => o + 1)}
            style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border2)', background: 'var(--white)', cursor: 'pointer', fontSize: 14, color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font)', flexShrink: 0 }}
          >›</button>

          {diners.length > 0 && (
            <>
              <div className="shop-sep" />
              {diners.length > 1 ? diners.map((d, i) => (
                <button key={d.userId} className={`shop-dchip${activeDiners.has(d.userId) ? ' on' : ''}`}
                  onClick={() => toggleDiner(d.userId)}>
                  <div className="shop-dchip-av" style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}>
                    {d.name?.slice(0, 2).toUpperCase()}
                  </div>
                  {d.name}
                </button>
              )) : (
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)' }}>
                  {activeDiner?.name || diners[0]?.name}
                </span>
              )}
            </>
          )}

          {/* Copy list button */}
          {totalCount > 0 && (
            <>
              <div style={{ flex: 1 }} />
              <button onClick={handleCopyList}
                style={{ fontSize: 11, fontWeight: 600, color: 'var(--teal)', background: 'none', border: '1px solid var(--teal)', borderRadius: 7, padding: '5px 12px', cursor: 'pointer', fontFamily: 'var(--font)', whiteSpace: 'nowrap', transition: 'all .12s' }}
                onMouseOver={e => { e.currentTarget.style.background = 'var(--teal-xl)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'none'; }}
              >
                📋 Copy list
              </button>
            </>
          )}
        </div>

        {rangeNeedsCurrentWeek && !isCurrentWeek && !loading && (
          <div style={{ padding: '8px 16px', fontSize: 12, color: 'var(--text3)', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
            "Today" and "3 Days" only apply to the current week.
          </div>
        )}

        {/* Progress bar — sticky top */}
        {totalCount > 0 && (
          <div className="shop-progress-row">
            <div className="shop-prog-big">{checkedCount} / {totalCount}</div>
            <div className="shop-prog-bar">
              <div className="shop-prog-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="shop-prog-pct">{pct}%</div>
            {checkedCount > 0 && (
              <button onClick={() => saveChecked(new Set())}
                style={{ fontSize: 11, fontWeight: 600, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', fontFamily: 'var(--font)', flexShrink: 0 }}
              >Clear</button>
            )}
          </div>
        )}

        {/* Items — full-width single column, no sidebar */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
          {loading ? (
            <div style={{ padding: '40px 0', fontSize: 13, color: 'var(--text3)', textAlign: 'center' }}>Loading shopping list…</div>
          ) : totalCount === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text3)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>No items yet</div>
              <div style={{ fontSize: 13, marginBottom: 14 }}>Add meals to your plan to populate the shopping list</div>
              {onGoToPlan && (
                <button
                  onClick={onGoToPlan}
                  style={{ padding: '8px 20px', borderRadius: 'var(--r-sm)', background: 'var(--teal)', color: '#fff', border: 'none', fontFamily: 'var(--font)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >
                  Plan your meals →
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Unchecked items by category */}
              {CATEGORY_ORDER.map(cat => {
                const catItems = uncheckedCats[cat];
                if (!catItems?.length) return null;
                return (
                  <div key={cat} style={{ marginBottom: 16, background: CATEGORY_TINTS[cat], borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{CATEGORY_ICONS[cat]}</span>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text3)', marginLeft: 'auto' }}>{catItems.length} items</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {catItems.map(item => (
                        <button key={item.name} className="shop-token" onClick={() => toggleCheck(item.name)}>
                          <span className="shop-tok-dot" />
                          <span className="shop-tok-name">{item.name}</span>
                          {fmtQty(item.amount, item.unit) && <span className="shop-tok-qty">{fmtQty(item.amount, item.unit)}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Done section — collapsible */}
              {checkedTotal > 0 && (
                <div style={{ marginTop: 8 }}>
                  <button
                    onClick={() => setShowDone(v => !v)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, fontWeight: 700, color: 'var(--teal)', padding: '8px 0' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: showDone ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}>
                      <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    ✓ Done ({checkedTotal})
                  </button>
                  {showDone && (
                    <div style={{ paddingLeft: 4, opacity: 0.6 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                        {Object.values(checkedCats).flat().map(item => (
                          <button key={item.name} className="shop-token checked" onClick={() => toggleCheck(item.name)}>
                            <span className="shop-tok-dot" />
                            <span className="shop-tok-name">{item.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Copy toast */}
        {copyToast && (
          <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#0F172A', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)', zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
            📋 List copied to clipboard
          </div>
        )}
      </div>
    </div>
  );
}
