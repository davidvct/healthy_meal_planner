import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const RANGE_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: '3days', label: '3 Days' },
  { id: 'week', label: 'This week' },
];

const CATEGORY_ICONS = {
  proteins: '🥩', grains: '🌾', vegetables: '🥦', fruits: '🍎',
  dairy: '🥛', pantry: '🫙', other: '📦',
};

const CATEGORY_ORDER = ['proteins', 'grains', 'vegetables', 'fruits', 'dairy', 'pantry', 'other'];

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
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toWeekStart(date) {
  return [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');
}

export default function ShoppingScreen({ diners, activeDiner }) {
  const [range, setRange] = useState('week');
  const [activeDiners, setActiveDiners] = useState(() => new Set(activeDiner ? [activeDiner.userId] : []));
  const [items, setItems] = useState({});
  const [checked, setChecked] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);

  // Keep activeDiners in sync when activeDiner prop changes
  useEffect(() => {
    if (activeDiner && activeDiners.size === 0) {
      setActiveDiners(new Set([activeDiner.userId]));
    }
  }, [activeDiner]);

  const monday = getMonday(addDays(new Date(), weekOffset * 7));
  const weekStart = toWeekStart(monday);

  const loadList = useCallback(async () => {
    if (activeDiners.size === 0) { setItems({}); return; }
    setLoading(true);
    try {
      const allItems = [];
      for (const userId of activeDiners) {
        const res = await api.getShoppingList(userId, weekStart);
        const list = res?.items || res || [];
        allItems.push(...list);
      }
      setItems(categorise(allItems));
    } catch (err) {
      console.error('Failed to load shopping list:', err);
      setItems({});
    } finally {
      setLoading(false);
    }
  }, [activeDiners, weekStart]);

  useEffect(() => { loadList(); }, [loadList]);

  const allItems = Object.values(items).flat();
  const checkedCount = checked.size;
  const totalCount = allItems.length;
  const pct = totalCount ? Math.round((checkedCount / totalCount) * 100) : 0;

  const toggleCheck = (key) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleDiner = (userId) => {
    setActiveDiners(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const displayedCategories = activeCategory
    ? (items[activeCategory] ? { [activeCategory]: items[activeCategory] } : {})
    : items;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ maxWidth: '80%', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

      {/* Controls bar */}
      <div style={{ flexShrink: 0, padding: '12px 16px 10px', background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>

        {/* Range pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginRight: 2 }}>Range:</span>
          {RANGE_OPTIONS.map(r => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              style={{
                padding: '4px 12px', borderRadius: 20, border: '1.5px solid',
                borderColor: range === r.id ? 'var(--teal)' : 'var(--border2)',
                background: range === r.id ? 'var(--teal)' : 'var(--white)',
                color: range === r.id ? '#fff' : 'var(--text2)',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
              }}
            >
              {r.label}
            </button>
          ))}
          {range === 'week' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
              <button onClick={() => setWeekOffset(o => o - 1)} style={navBtnStyle}>‹</button>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', minWidth: 80, textAlign: 'center' }}>
                {monday.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })} – {addDays(monday, 6).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
              </span>
              <button onClick={() => setWeekOffset(o => o + 1)} style={navBtnStyle}>›</button>
            </div>
          )}
        </div>

        {/* Diner chips */}
        {diners.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginRight: 2 }}>For:</span>
            {diners.map((d, i) => {
              const on = activeDiners.has(d.userId);
              const GRADIENTS = [
                'linear-gradient(135deg,#069B8E,#07B5A5)',
                'linear-gradient(135deg,#6D3FA0,#9B59B6)',
                'linear-gradient(135deg,#1560A0,#1E72B8)',
                'linear-gradient(135deg,#D95F3B,#E8734A)',
                'linear-gradient(135deg,#18A55A,#22C55E)',
              ];
              return (
                <button
                  key={d.userId}
                  onClick={() => toggleDiner(d.userId)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '3px 10px 3px 4px', borderRadius: 20,
                    border: `1.5px solid ${on ? 'var(--teal)' : 'var(--border2)'}`,
                    background: on ? 'var(--teal-xl)' : 'var(--white)',
                    cursor: 'pointer', fontFamily: 'var(--font)',
                  }}
                >
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: GRADIENTS[i % GRADIENTS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#fff' }}>
                    {d.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: on ? 'var(--teal)' : 'var(--text2)' }}>{d.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Progress row */}
      {totalCount > 0 && (
        <div style={{ flexShrink: 0, padding: '8px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{checkedCount} of {totalCount}</div>
          <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--teal)', borderRadius: 3, transition: 'width 0.3s' }} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal)', whiteSpace: 'nowrap' }}>{pct}%</div>
          <button
            onClick={() => setChecked(new Set())}
            style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font)' }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Body: sidebar + items */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Category sidebar */}
        <div style={{ width: 130, flexShrink: 0, overflowY: 'auto', borderRight: '1px solid var(--border)', padding: '8px 0', background: 'var(--white)' }}>
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              width: '100%', padding: '7px 14px', background: !activeCategory ? 'var(--teal-xl)' : 'none',
              border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font)',
              fontSize: 11, fontWeight: 700, color: !activeCategory ? 'var(--teal)' : 'var(--text2)',
              borderLeft: !activeCategory ? '3px solid var(--teal)' : '3px solid transparent',
            }}
          >
            All items
          </button>
          {CATEGORY_ORDER.filter(c => items[c]?.length > 0).map(cat => {
            const on = activeCategory === cat;
            const catItems = items[cat] || [];
            const catChecked = catItems.filter(it => checked.has(it.key || it.ingredientName)).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(on ? null : cat)}
                style={{
                  width: '100%', padding: '7px 14px', background: on ? 'var(--teal-xl)' : 'none',
                  border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font)',
                  borderLeft: on ? '3px solid var(--teal)' : '3px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: on ? 700 : 600, color: on ? 'var(--teal)' : 'var(--text2)' }}>
                  {CATEGORY_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </span>
                <span style={{ fontSize: 10, background: on ? 'var(--teal)' : 'var(--border)', color: on ? '#fff' : 'var(--text3)', borderRadius: 10, padding: '1px 6px', fontWeight: 700 }}>
                  {catChecked}/{catItems.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Items area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {loading ? (
            <div style={{ padding: '20px 0', fontSize: 12, color: 'var(--text3)' }}>Loading shopping list…</div>
          ) : totalCount === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text3)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🛒</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>No items yet</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>Add meals to your plan to populate the shopping list</div>
            </div>
          ) : (
            Object.entries(displayedCategories).map(([cat, catItems]) => (
              <div key={cat} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  {CATEGORY_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {catItems.map(item => {
                    const key = item.key || item.ingredientName || item.name || Math.random().toString();
                    const isChecked = checked.has(key);
                    return (
                      <button
                        key={key}
                        onClick={() => toggleCheck(key)}
                        style={{
                          padding: '5px 12px', borderRadius: 16,
                          border: `1.5px solid ${isChecked ? 'var(--border)' : 'var(--border2)'}`,
                          background: isChecked ? 'var(--bg)' : 'var(--white)',
                          cursor: 'pointer', fontFamily: 'var(--font)',
                          fontSize: 11, fontWeight: 600,
                          color: isChecked ? 'var(--text3)' : 'var(--text)',
                          textDecoration: isChecked ? 'line-through' : 'none',
                          transition: 'all 0.15s',
                          display: 'flex', alignItems: 'center', gap: 5,
                        }}
                      >
                        {isChecked && <span style={{ color: 'var(--teal)', fontSize: 10 }}>✓</span>}
                        {item.ingredientName || item.name}
                        {item.quantity && <span style={{ color: 'var(--text3)', fontWeight: 400 }}>{item.quantity}{item.unit ? ` ${item.unit}` : ''}</span>}
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

const navBtnStyle = {
  width: 24, height: 24, borderRadius: 6, border: '1px solid var(--border2)',
  background: 'var(--white)', cursor: 'pointer', fontSize: 13,
  color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--font)',
};
