import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const DIET_FILTERS = [
  { id: 'any',          label: 'All' },
  { id: 'vegetarian',   label: 'Vegetarian' },
  { id: 'vegan',        label: 'Vegan' },
  { id: 'halal',        label: 'Halal' },
  { id: 'pescatarian',  label: 'Pescatarian' },
];

const ALLERGEN_OPTIONS = [
  { id: 'peanut',    label: '🥜 Peanut' },
  { id: 'egg',       label: '🥚 Egg' },
  { id: 'fish',      label: '🐟 Fish' },
  { id: 'shellfish', label: '🦐 Shellfish' },
  { id: 'soy',       label: '🫘 Soy' },
  { id: 'wheat',     label: '🌾 Wheat' },
  { id: 'milk',      label: '🥛 Dairy' },
];

const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };
const BG_CLASS = { breakfast: 'fv-b', lunch: 'fv-l', dinner: 'fv-d' };

function RecipeCard({ dish, idx, onAdd, adding, slotCtx, isFav, onFavToggle }) {
  const name    = dish.dishName || dish.name || 'Unknown dish';
  const kcal    = dish.kcal || dish.calories || 0;
  const tags    = (dish.tags || dish.dietaryTags || []).slice(0, 2);
  const matchPct = dish.matchScore ?? dish.score;
  const dishId  = dish.dishId || dish.id;
  const slot    = dish.mealType || dish.slot || '';
  const bgCls   = BG_CLASS[slot] || ['fv-b', 'fv-l', 'fv-d'][idx % 3];

  return (
    <div className="rc">
      <div className={`rc-img ${bgCls}`}>
        {matchPct !== undefined && matchPct !== null && (
          <div className="rc-match">{Math.round(matchPct)}%</div>
        )}
        {kcal > 0 && <div className="rc-kcal">{kcal} kcal</div>}
      </div>
      <div className="rc-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, marginBottom: 5 }}>
          <div className="rc-name" style={{ marginBottom: 0 }}>{name}</div>
          <button
            className={`mc-fav-btn${isFav ? ' on' : ''}`}
            data-tip={isFav ? 'Remove from favourites' : 'Add to favourites'}
            onClick={e => { e.stopPropagation(); onFavToggle(dishId); }}
          >
            {isFav ? '❤️' : '🤍'}
          </button>
        </div>
        {slot && (
          <div className="rc-time">⏱ {MEAL_LABELS[slot] || slot}</div>
        )}
        <div className="rc-tags">
          {tags.map(t => (
            <span key={t} className="rct">{t}</span>
          ))}
          {slotCtx && (
            <button
              className="rc-add-btn"
              onClick={() => onAdd(dish)}
              disabled={adding === dishId}
            >
              {adding === dishId ? '✓' : '+ Add'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DiscoverScreen({ slotCtx, userId, activeDiner, onBack, onAdded }) {
  const [search,          setSearch]          = useState('');
  const [dietFilter,      setDietFilter]      = useState('any');
  const [allergenFilters, setAllergenFilters] = useState(new Set());
  const [favOnly,         setFavOnly]         = useState(false);
  const [results,         setResults]         = useState([]);
  const [favourites,      setFavourites]      = useState(new Set());
  const [loading,         setLoading]         = useState(false);
  const [adding,          setAdding]          = useState(null);

  // Load favourites once
  useEffect(() => {
    if (!userId) return;
    api.getFavourites(userId).then(ids => setFavourites(new Set(ids))).catch(() => {});
  }, [userId]);

  // Pre-apply diner's diet/allergen preferences when screen opens
  useEffect(() => {
    if (!activeDiner) return;
    const diet = (activeDiner.dietaryPreferences || activeDiner.diet || 'any')
      .toLowerCase().replace(/\s+/g, '_').replace('no_restriction', 'any');
    setDietFilter(DIET_FILTERS.some(d => d.id === diet) ? diet : 'any');
    const allergens = (activeDiner.allergens || []).map(a => a.toLowerCase());
    setAllergenFilters(new Set(allergens.filter(a => ALLERGEN_OPTIONS.some(o => o.id === a))));
  }, [activeDiner?.id]);

  const hasActiveFilters = dietFilter !== 'any' || allergenFilters.size > 0 || favOnly;

  const toggleAllergen = (a) => {
    setAllergenFilters(prev => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a); else next.add(a);
      return next;
    });
  };

  const clearFilters = () => {
    setDietFilter('any');
    setAllergenFilters(new Set());
    setFavOnly(false);
  };

  const handleFavToggle = async (dishId) => {
    const isFav = favourites.has(dishId);
    setFavourites(prev => {
      const next = new Set(prev);
      if (isFav) next.delete(dishId); else next.add(dishId);
      return next;
    });
    try {
      if (isFav) await api.removeFavourite(userId, dishId);
      else await api.addFavourite(userId, dishId);
    } catch {
      setFavourites(prev => {
        const next = new Set(prev);
        if (isFav) next.add(dishId); else next.delete(dishId);
        return next;
      });
    }
  };

  const loadDishes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await api.getRecommendedDishes(userId, {
        day:              slotCtx?.dayIndex ?? 0,
        mealType:         slotCtx?.mealType ?? 'lunch',
        filterMealType:   !!slotCtx,
        filterDiet:       dietFilter !== 'any',
        filterAllergies:  allergenFilters.size > 0,
        filterConditions: !!slotCtx,
        search:           search || undefined,
        weekStart:        slotCtx?.weekStart,
      });
      const scored = res.scored || res.dishes || (Array.isArray(res) ? res : []);
      const dishes = scored.map(s => {
        const d = s.dish ?? s;
        return {
          ...d,
          kcal:       s.nutrients?.calories      ?? d.kcal    ?? 0,
          protein:    s.nutrients?.protein       ?? d.protein ?? 0,
          carbs:      s.nutrients?.carbohydrates ?? d.carbs   ?? 0,
          fat:        s.nutrients?.fat           ?? d.fat     ?? 0,
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
    const dishId = dish.dishId || dish.id;
    setAdding(dishId);
    try {
      await api.addDishToPlan(userId, {
        dayIndex:  slotCtx.dayIndex,
        mealType:  slotCtx.mealType,
        dishId,
        servings:  1,
        weekStart: slotCtx.weekStart,
      });
      onAdded();
    } catch (err) {
      console.error('Failed to add dish:', err);
    } finally {
      setAdding(null);
    }
  };

  const displayResults = favOnly
    ? results.filter(d => favourites.has(d.dishId || d.id))
    : results;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Slot context banner */}
      {slotCtx && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px', background: 'var(--navy)', borderRadius: 0, flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="6.5" cy="6.5" r="5.5" stroke="rgba(255,255,255,.6)" strokeWidth="1.2" />
            <path d="M4 6.5l2 2 3-3" stroke="rgba(255,255,255,.8)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', flex: 1 }}>
            Adding to: {slotCtx.label || MEAL_LABELS[slotCtx.mealType] || 'plan'}
          </span>
          <span
            style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', cursor: 'pointer' }}
            onClick={onBack}
          >
            ✕ Cancel
          </span>
        </div>
      )}

      {/* Filters panel */}
      <div style={{ flexShrink: 0, padding: '12px 18px', background: 'var(--white)', borderBottom: '1px solid var(--border)', overflowY: 'auto', maxHeight: '55%' }}>

        {/* Back button for browse mode */}
        {!slotCtx && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text3)', padding: 0, lineHeight: 1 }}>‹</button>
          </div>
        )}

        {/* Search */}
        <div className="searchbox">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: 'var(--text3)', flexShrink: 0 }}>
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            className="s-inp"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search dishes, ingredients..."
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 14, lineHeight: 1, padding: 0, fontFamily: 'var(--font)' }}
            >×</button>
          )}
        </div>

        {/* Active filter summary bar */}
        {hasActiveFilters && (
          <div className="disc-active-bar">
            <span className="disc-active-bar-lbl">Filtered by</span>
            <div className="disc-active-pills">
              {favOnly && (
                <span className="disc-active-pill disc-ap-diet">❤️ Favourites</span>
              )}
              {dietFilter !== 'any' && (
                <span className="disc-active-pill disc-ap-diet">
                  {DIET_FILTERS.find(d => d.id === dietFilter)?.label}
                </span>
              )}
              {[...allergenFilters].map(a => (
                <span key={a} className="disc-active-pill disc-ap-allergen">
                  No {ALLERGEN_OPTIONS.find(o => o.id === a)?.label.replace(/^[^ ]+ /, '') || a}
                </span>
              ))}
            </div>
            <button className="disc-active-bar-reset" onClick={clearFilters}>Reset all ✕</button>
          </div>
        )}

        {/* Favourites filter */}
        <div className="disc-filter-section">
          <div className="disc-filter-chips">
            <div
              className={`disc-fchip${favOnly ? ' diet-active' : ''}`}
              onClick={() => setFavOnly(v => !v)}
            >
              <span className="disc-fchip-dot" />
              ❤️ Favourites only
            </div>
          </div>
        </div>

        {/* Diet preference filter */}
        <div className="disc-filter-section">
          <div className="disc-filter-hdr">
            <span className="disc-filter-label">Dietary preference</span>
            {dietFilter !== 'any' && (
              <button className="disc-filter-clear" onClick={() => setDietFilter('any')}>Clear ✕</button>
            )}
          </div>
          <div className="disc-filter-chips">
            {DIET_FILTERS.map(d => (
              <div
                key={d.id}
                className={`disc-fchip${dietFilter === d.id ? ' diet-active' : ''}`}
                onClick={() => setDietFilter(d.id)}
              >
                {dietFilter === d.id && d.id !== 'any' && <span className="disc-fchip-dot" />}
                {d.label}
              </div>
            ))}
          </div>
        </div>

        {/* Allergen exclusion filter */}
        <div className="disc-filter-section" style={{ marginBottom: 0 }}>
          <div className="disc-filter-hdr">
            <span className="disc-filter-label">Exclude allergens</span>
            {allergenFilters.size > 0 && (
              <button className="disc-filter-clear" onClick={() => setAllergenFilters(new Set())}>Clear ✕</button>
            )}
          </div>
          <div className="disc-filter-chips">
            {ALLERGEN_OPTIONS.map(a => {
              const on = allergenFilters.has(a.id);
              return (
                <div
                  key={a.id}
                  className={`disc-fchip${on ? ' allergen-active' : ''}`}
                  onClick={() => toggleAllergen(a.id)}
                >
                  {on && <span className="disc-fchip-dot" />}
                  {a.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>

        {/* Header */}
        <div className="disc-hdr">
          <div>
            <div className="disc-h1">Discover dishes</div>
            <div className="disc-sub">Browse and filter the full recipe library</div>
          </div>
          {!loading && (
            <div className="disc-match-count"><span>{displayResults.length}</span> dishes</div>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>
            Loading dishes…
          </div>
        ) : displayResults.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text3)' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🍽️</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>No dishes found</div>
            <div style={{ fontSize: 11 }}>Try adjusting your filters or search term</div>
          </div>
        ) : (
          <div className="recipe-grid">
            {displayResults.map((dish, idx) => (
              <RecipeCard
                key={dish.dishId || dish.id}
                dish={dish}
                idx={idx}
                onAdd={handleAdd}
                adding={adding}
                slotCtx={slotCtx}
                isFav={favourites.has(dish.dishId || dish.id)}
                onFavToggle={handleFavToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
