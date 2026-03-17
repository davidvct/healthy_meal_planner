import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const DIET_FILTERS = [
  { id: 'any', label: 'Any' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'halal', label: 'Halal' },
  { id: 'low-sodium', label: 'Low sodium' },
  { id: 'diabetic-friendly', label: 'Diabetic-friendly' },
];

const ALLERGEN_OPTIONS = ['gluten', 'dairy', 'nuts', 'shellfish', 'eggs', 'soy'];

const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };

function DishCard({ dish, onAdd, adding, slotCtx }) {
  const name = dish.dishName || dish.name || 'Unknown dish';
  const kcal = dish.kcal || dish.calories || 0;
  const tags = dish.tags || dish.dietaryTags || [];
  const matchPct = dish.matchScore ?? dish.score;

  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
      padding: '12px 13px', display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.35, flex: 1 }}>{name}</div>
        {matchPct !== undefined && matchPct !== null && (
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--teal)', background: 'var(--teal-xl)', padding: '2px 7px', borderRadius: 10, flexShrink: 0 }}>
            {Math.round(matchPct)}%
          </div>
        )}
      </div>

      {kcal > 0 && (
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{kcal} kcal</div>
      )}

      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {tags.slice(0, 4).map(t => (
            <span key={t} style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 8, background: 'var(--teal-xl)', color: 'var(--teal)' }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {slotCtx && (
        <button
          onClick={() => onAdd(dish)}
          disabled={adding === (dish.dishId || dish.id)}
          style={{
            marginTop: 2, padding: '6px 0', borderRadius: 7, border: 'none',
            background: adding === (dish.dishId || dish.id) ? 'var(--teal-l)' : 'var(--teal)',
            color: adding === (dish.dishId || dish.id) ? 'var(--teal)' : '#fff',
            fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
          }}
        >
          {adding === (dish.dishId || dish.id) ? '✓ Added' : '+ Add to ' + MEAL_LABELS[slotCtx.mealType]}
        </button>
      )}
    </div>
  );
}

export default function DiscoverScreen({ slotCtx, userId, onBack, onAdded }) {
  const [search, setSearch] = useState('');
  const [dietFilter, setDietFilter] = useState('any');
  const [allergenFilters, setAllergenFilters] = useState(new Set());
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(null);

  const toggleAllergen = (a) => {
    setAllergenFilters(prev => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a);
      else next.add(a);
      return next;
    });
  };

  const loadDishes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      let dishes;
      const res = await api.getRecommendedDishes(userId, {
        day: slotCtx?.dayIndex ?? 0,
        mealType: slotCtx?.mealType ?? 'lunch',
        filterMealType: !!slotCtx,
        filterDiet: dietFilter !== 'any',
        filterAllergies: allergenFilters.size > 0,
        filterConditions: !!slotCtx,
        search: search || undefined,
        weekStart: slotCtx?.weekStart,
      });
      // API returns { scored: [{ dish, nutrients, score }], dayNutrients }
      const scored = res.scored || res.dishes || (Array.isArray(res) ? res : []);
      dishes = scored.map(s => {
        const d = s.dish ?? s;
        return {
          ...d,
          kcal: s.nutrients?.calories ?? d.kcal ?? 0,
          protein: s.nutrients?.protein ?? d.protein ?? 0,
          carbs: s.nutrients?.carbohydrates ?? d.carbs ?? 0,
          fat: s.nutrients?.fat ?? d.fat ?? 0,
          matchScore: s.score ?? null,
        };
      });
      setResults(dishes);
    } catch (err) {
      console.error('Failed to load dishes:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [userId, slotCtx, search, dietFilter, allergenFilters]);

  useEffect(() => {
    const t = setTimeout(loadDishes, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [loadDishes]);

  const handleAdd = async (dish) => {
    if (!slotCtx) return;
    const dishId = dish.id;
    setAdding(dishId);
    try {
      await api.addDishToPlan(userId, {
        dayIndex: slotCtx.dayIndex,
        mealType: slotCtx.mealType,
        dishId,
        servings: 1,
        weekStart: slotCtx.weekStart,
      });
      onAdded();
    } catch (err) {
      console.error('Failed to add dish:', err);
    } finally {
      setAdding(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Context banner */}
      {slotCtx && (
        <div style={{
          background: 'var(--navy)', padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <button
            onClick={onBack}
            style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ‹
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Adding to</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>
              {MEAL_LABELS[slotCtx.mealType] || slotCtx.label}
            </div>
          </div>
          <button
            onClick={onBack}
            style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font)' }}
          >
            Cancel
          </button>
        </div>
      )}

      {!slotCtx && (
        <div style={{ padding: '12px 16px 10px', background: 'var(--white)', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text3)', padding: 0, lineHeight: 1 }}>‹</button>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>Discover dishes</div>
        </div>
      )}

      {/* Filters */}
      <div style={{ flexShrink: 0, padding: '10px 16px', background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}>
            <circle cx="5.5" cy="5.5" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M8.5 8.5L11 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search dishes���"
            style={{
              width: '100%', padding: '7px 10px 7px 30px', borderRadius: 8,
              border: '1px solid var(--border2)', background: 'var(--bg)',
              fontSize: 12, color: 'var(--text)', fontFamily: 'var(--font)', outline: 'none',
            }}
          />
        </div>

        {/* Diet filter */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 6 }}>
          {DIET_FILTERS.map(d => (
            <button
              key={d.id}
              onClick={() => setDietFilter(d.id)}
              style={{
                padding: '3px 10px', borderRadius: 14,
                border: `1.5px solid ${dietFilter === d.id ? 'var(--teal)' : 'var(--border2)'}`,
                background: dietFilter === d.id ? 'var(--teal)' : 'var(--white)',
                color: dietFilter === d.id ? '#fff' : 'var(--text2)',
                fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Allergen filters */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', alignSelf: 'center', marginRight: 2 }}>Exclude:</span>
          {ALLERGEN_OPTIONS.map(a => {
            const on = allergenFilters.has(a);
            return (
              <button
                key={a}
                onClick={() => toggleAllergen(a)}
                style={{
                  padding: '3px 9px', borderRadius: 14,
                  border: `1.5px solid ${on ? '#DC2626' : 'var(--border2)'}`,
                  background: on ? '#FEE2E2' : 'var(--white)',
                  color: on ? '#DC2626' : 'var(--text3)',
                  fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
                }}
              >
                {on ? '✕ ' : ''}{a}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {loading ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>Loading dishes…</div>
        ) : results.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text3)' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🍽️</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>No dishes found</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Try adjusting your filters</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {results.map(dish => (
              <DishCard
                key={dish.dishId || dish.id}
                dish={dish}
                onAdd={handleAdd}
                adding={adding}
                slotCtx={slotCtx}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
