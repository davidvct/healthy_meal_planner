import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { trackFilterApplied, trackDishAdded } from '../services/analytics';

const DIET_FILTERS = [
  { id: 'any',          label: 'All' },
  { id: 'vegetarian',   label: 'Vegetarian' },
  { id: 'vegan',        label: 'Vegan' },
  { id: 'halal',        label: 'Halal' },
  { id: 'pescatarian',  label: 'Pescatarian' },
];

const ALLERGEN_OPTIONS = [
  { id: 'gluten',   label: '🌾 Gluten' },
  { id: 'dairy',    label: '🥛 Dairy' },
  { id: 'nut',      label: '🥜 Nuts' },
  { id: 'egg',      label: '🥚 Egg' },
  { id: 'seafood',  label: '🦐 Seafood' },
  { id: 'meat',     label: '🥩 Meat' },
  { id: 'soy',      label: '🫘 Soy' },
];

const TAG_OPTIONS = [
  { id: 'high_protein', label: 'Hi-protein' },
  { id: 'low_carb',     label: 'Low-carb'   },
  { id: 'gluten_free',  label: 'GF'         },
  { id: 'dairy_free',   label: 'DF'         },
  { id: 'sweet',        label: 'Sweet'      },
  { id: 'salty',        label: 'Savory'     },
  { id: 'spicy',        label: 'Spicy'      },
];

const MEAL_TYPE_FILTERS = [
  { id: 'any',       label: 'All',            icon: '🍽️' },
  { id: 'breakfast', label: 'Breakfast',       icon: '🌅' },
  { id: 'lunch',     label: 'Lunch & Dinner',  icon: '🍱' },
  { id: 'snack',     label: 'Snack & Dessert', icon: '🍰' },
];

const SUB_CATEGORIES = {
  lunch: [
    { id: 'main course', label: '🥘 Main Course' },
    { id: 'soup',        label: '🍲 Soup' },
    { id: 'salad',       label: '🥗 Salad' },
    { id: 'side dish',   label: '🥦 Side Dish' },
  ],
  snack: [
    { id: 'dessert',   label: '🍰 Dessert' },
    { id: 'appetizer', label: '🍢 Appetizer' },
    { id: 'snack',     label: '🍿 Snack' },
    { id: 'beverage',  label: '🥤 Beverage' },
  ],
};

const CONDITION_OPTIONS = [
  { id: 'hypertension', label: '❤️ Hypertension' },
  { id: 'diabetes',     label: '🩸 Diabetes' },
  { id: 'cholesterol',  label: '🫀 High Cholesterol' },
  { id: 'gout',         label: '🦶 Gout' },
];

const SAFE_LEVELS = {
  'Safe': 1,
  'Suitable with Moderation': 2,
  'Caution': 3,
  'Avoid': 4,
};

const COND_COL_MAP = {
  hypertension: 'hypertension_category',
  diabetes:     'diabetes_category',
  cholesterol:  'cholesterol_category',
  gout:         'gout_category',
};

// Map diner profile condition strings → filter chip ids
const PROFILE_COND_MAP = {
  'hypertension':       'hypertension',
  'high blood pressure':'hypertension',
  'high blood sugar':   'diabetes',
  'diabetes':           'diabetes',
  'high cholesterol':   'cholesterol',
  'cholesterol':        'cholesterol',
  'gout':               'gout',
};

function passesConditionFilter(dish, activeConds, safeLevel) {
  if (activeConds.size === 0) return true;
  const threshold = safeLevel === 'safe' ? 1 : 2;
  return [...activeConds].every(cond => {
    const col = COND_COL_MAP[cond];
    const val = dish[col];
    if (!val) return true; // no data for this condition → don't filter out
    const level = SAFE_LEVELS[val] ?? 99;
    return level <= threshold;
  });
}

function buildCondBadges(dish, activeConds) {
  if (activeConds.size === 0) return null;
  const COLOURS = {
    'Safe':                     'tg-green',
    'Suitable with Moderation': 'tg-amber',
    'Caution':                  'tg-coral',
    'Avoid':                    'tg-red',
  };
  return [...activeConds].map(cond => {
    const cat = dish[COND_COL_MAP[cond]];
    if (!cat) return null;
    const reason = dish[cond + '_reason'] || '';
    return (
      <span key={cond} className={`tag ${COLOURS[cat] || 'tg-muted'}`} title={reason}
        style={{ fontSize: 9, padding: '1px 6px', lineHeight: '16px' }}>
        {cat}
      </span>
    );
  });
}

const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };
const BG_CLASS = { breakfast: 'fv-b', lunch: 'fv-l', dinner: 'fv-d' };

function RecipeCard({ dish, idx, onAdd, adding, slotCtx, isFav, onFavToggle, condBadges }) {
  const name    = dish.dishName || dish.name || 'Unknown dish';
  const kcal    = dish.kcal || dish.calories || 0;
  const dishId  = dish.dishId || dish.id;
  const bgCls   = BG_CLASS[dish.mealType || dish.slot || ''] || ['fv-b', 'fv-l', 'fv-d'][idx % 3];
  const imgUrl  = dish.image_url || dish.imageUrl || '';

  return (
    <div className="rc">
      <div className={`rc-img ${bgCls}`} style={{ height: 120 }}>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={name}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div style={{
          display: imgUrl ? 'none' : 'flex',
          width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, position: 'absolute', top: 0, left: 0,
        }}>
          🍽️
        </div>
        {kcal > 0 && <div className="rc-kcal" style={{ fontSize: 12, padding: '3px 9px' }}>{kcal} kcal</div>}
        {/* Favourite button — overlaid on image for easy reach */}
        <button
          className={`mc-fav-btn${isFav ? ' on' : ''}`}
          onClick={e => { e.stopPropagation(); onFavToggle(dishId); }}
          style={{ position: 'absolute', top: 6, right: 6, fontSize: 16, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.85)', borderRadius: '50%', border: 'none', cursor: 'pointer' }}
        >
          {isFav ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="rc-body" style={{ padding: '10px 12px 12px' }}>
        <div className="rc-name" style={{ fontSize: 14, marginBottom: 6, lineHeight: 1.35 }}>{name}</div>
        {condBadges && condBadges.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
            {condBadges}
          </div>
        )}
        {slotCtx && (
          <button
            className="rc-add-btn"
            onClick={() => onAdd(dish)}
            disabled={adding === dishId}
            style={{ fontSize: 13, padding: '7px 16px', width: '100%', marginTop: 4 }}
          >
            {adding === dishId ? '✓ Added' : '+ Add to plan'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function DiscoverScreen({ slotCtx, userId, activeDiner, onBack, onAdded }) {
  const [search,          setSearch]          = useState('');
  const [mealTypeFilter,  setMealTypeFilter]  = useState('any');
  const [subCategoryFilter, setSubCategoryFilter] = useState('any');
  const [dietFilter,      setDietFilter]      = useState('any');
  const [allergenFilters, setAllergenFilters] = useState(new Set());
  const [tagFilters,      setTagFilters]      = useState(new Set());
  const [favOnly,         setFavOnly]         = useState(false);
  const [conditionFilters, setConditionFilters] = useState(new Set());
  const [safeLevel,       setSafeLevel]       = useState('safe');
  const [results,         setResults]         = useState([]);
  const [relaxed,         setRelaxed]         = useState(false); // true when fallback loosened filters
  const [favourites,      setFavourites]      = useState(new Set());
  const [loading,         setLoading]         = useState(false);
  const [adding,          setAdding]          = useState(null);

  // Reset meal type chip when slot context changes (different slot → fresh filter state)
  useEffect(() => { setMealTypeFilter('any'); setSubCategoryFilter('any'); }, [slotCtx?.mealType]);

  // Load favourites once
  useEffect(() => {
    if (!userId) return;
    api.getFavourites(userId).then(ids => setFavourites(new Set(ids))).catch(() => {});
  }, [userId]);

  // Pre-apply diner's diet/allergen preferences when screen opens or diner changes
  useEffect(() => {
    if (!activeDiner) return;

    // Normalise diet string → DIET_FILTERS id
    const rawDiet = (activeDiner.diet || activeDiner.dietaryPreferences || 'any')
      .toLowerCase().replace(/[\s-]+/g, '_')
      .replace('no_restriction', 'any').replace('no_restrictions', 'any')
      .replace('none', 'any');
    setDietFilter(DIET_FILTERS.some(d => d.id === rawDiet) ? rawDiet : 'any');

    // Normalise allergies — can be a comma-string or array
    const rawAllergies = activeDiner.allergies ?? activeDiner.allergens ?? [];
    const allergyList = Array.isArray(rawAllergies)
      ? rawAllergies
      : String(rawAllergies).split(',').map(s => s.trim()).filter(Boolean);
    const matched = allergyList
      .map(a => a.toLowerCase())
      .filter(a => ALLERGEN_OPTIONS.some(o => o.id === a));
    setAllergenFilters(new Set(matched));

    // Auto-apply health conditions from profile
    const rawConds = activeDiner.conditions ?? [];
    const condList = Array.isArray(rawConds)
      ? rawConds
      : String(rawConds).split(',').map(s => s.trim()).filter(Boolean);
    const matchedConds = condList
      .map(c => PROFILE_COND_MAP[c.toLowerCase()])
      .filter(Boolean);
    setConditionFilters(new Set(matchedConds));
  }, [activeDiner?.userId]);

  const hasActiveFilters = mealTypeFilter !== 'any' || subCategoryFilter !== 'any' || dietFilter !== 'any' || allergenFilters.size > 0 || tagFilters.size > 0 || conditionFilters.size > 0 || favOnly;

  const toggleAllergen = (a) => {
    setAllergenFilters(prev => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a); else next.add(a);
      return next;
    });
  };

  const toggleTag = (t) => {
    setTagFilters(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  };

  const toggleCondition = (c) => {
    setConditionFilters(prev => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c); else next.add(c);
      return next;
    });
  };

  const clearFilters = () => {
    setMealTypeFilter('any');
    setSubCategoryFilter('any');
    setDietFilter('any');
    setAllergenFilters(new Set());
    setTagFilters(new Set());
    setConditionFilters(new Set());
    setSafeLevel('safe');
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

  const parseDishes = (res) => {
    const scored = res.scored || res.dishes || (Array.isArray(res) ? res : []);
    return scored.map(s => {
      const d = s.dish ?? s;
      return {
        ...d,
        kcal:       s.nutrients?.calories      ?? d.kcal    ?? 0,
        protein:    s.nutrients?.protein       ?? d.protein ?? 0,
        carbs:      s.nutrients?.carbohydrates ?? d.carbs   ?? 0,
        fat:        s.nutrients?.fat           ?? d.fat     ?? 0,
        matchScore: s.score?.total ?? (typeof s.score === 'number' ? s.score : null),
      };
    });
  };

  const loadDishes = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setRelaxed(false);
    try {
      // mealType drives scoring (slot context makes relevant dishes rank higher)
      // filterMealType only activates when the user explicitly picks a chip
      const scoringMealType = mealTypeFilter !== 'any' ? mealTypeFilter : (slotCtx?.mealType ?? 'lunch');
      const baseParams = {
        day:             slotCtx?.dayIndex ?? 0,
        mealType:        scoringMealType,
        filterMealType:  mealTypeFilter !== 'any',
        filterDiet:      dietFilter !== 'any',
        filterAllergies: allergenFilters.size > 0,
        filterConditions: false, // Discover is for browsing; conditions are informational, not a hard gate
        search:          search || undefined,
        weekStart:       slotCtx?.weekStart,
        dietValue:       dietFilter !== 'any' ? dietFilter : undefined,
        subCategory:     subCategoryFilter !== 'any' ? subCategoryFilter : undefined,
        allergenValues:  allergenFilters.size > 0 ? [...allergenFilters].join(',') : undefined,
      };

      let dishes = parseDishes(await api.getRecommendedDishes(userId, baseParams));

      // Graceful fallback: relax diet + allergen filters if a specific meal type
      // yields too few results (e.g. only 5 halal breakfast dishes exist)
      if (dishes.length < 5 && mealTypeFilter !== 'any' && (baseParams.filterDiet || baseParams.filterAllergies)) {
        dishes = parseDishes(await api.getRecommendedDishes(userId, {
          ...baseParams,
          filterDiet:      false,
          filterAllergies: false,
        }));
        if (dishes.length > 0) setRelaxed(true);
      }

      setResults(dishes);
    } catch (err) {
      console.error('Failed to load dishes:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [userId, slotCtx, search, mealTypeFilter, subCategoryFilter, dietFilter, allergenFilters]);

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
        entryId:   slotCtx.entryId,
      });
      trackDishAdded(slotCtx.mealType, dish.name || dishId);
      onAdded();
    } catch (err) {
      console.error('Failed to add dish:', err);
    } finally {
      setAdding(null);
    }
  };

  const displayResults = results
    .filter(d => !favOnly || favourites.has(d.dishId || d.id))
    .filter(d => tagFilters.size === 0 || [...tagFilters].every(t => (d.tags || []).includes(t)))
    .filter(d => passesConditionFilter(d, conditionFilters, safeLevel));

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

      {/* Filters panel — all visible at a glance, multi-column layout */}
      <div style={{ flexShrink: 0, padding: '10px 16px 10px', background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>

        {/* Row 1: back + search + count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--text3)', padding: 0, lineHeight: 1, flexShrink: 0 }}>‹</button>
          <div className="searchbox" style={{ padding: '8px 12px', marginBottom: 0, flex: 1 }}>
            <svg width="15" height="15" viewBox="0 0 14 14" fill="none" style={{ color: 'var(--text3)', flexShrink: 0 }}>
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <input
              className="s-inp"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search dishes, ingredients..."
              style={{ fontSize: 14 }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 18, lineHeight: 1, padding: '2px 4px', fontFamily: 'var(--font)' }}>×</button>
            )}
          </div>
          {!loading && (
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)', whiteSpace: 'nowrap', flexShrink: 0 }}>{displayResults.length} dishes</div>
          )}
        </div>

        {/* Row 2: Meal type + Favourites */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
          {MEAL_TYPE_FILTERS.map(m => (
            <div key={m.id} className={`disc-fchip${mealTypeFilter === m.id ? ' diet-active' : ''}`}
              onClick={() => { setMealTypeFilter(m.id); setSubCategoryFilter('any'); }}
              style={{ fontSize: 11, padding: '5px 10px' }}>{m.icon} {m.label}</div>
          ))}
          <div style={{ width: 1, height: 18, background: 'var(--border2)', flexShrink: 0 }} />
          <div className={`disc-fchip${favOnly ? ' diet-active' : ''}`}
            onClick={() => setFavOnly(v => !v)}
            style={{ fontSize: 11, padding: '5px 10px' }}>❤️ Fav</div>
          {hasActiveFilters && (
            <button onClick={clearFilters} style={{ fontSize: 10, fontWeight: 600, color: 'var(--red)', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'var(--font)', padding: '2px 4px', marginLeft: 'auto' }}>Reset ✕</button>
          )}
        </div>
        {SUB_CATEGORIES[mealTypeFilter] && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
            <div className={`disc-fchip${subCategoryFilter === 'any' ? ' diet-active' : ''}`}
              onClick={() => setSubCategoryFilter('any')}
              style={{ fontSize: 10, padding: '3px 8px' }}>All</div>
            {SUB_CATEGORIES[mealTypeFilter].map(s => (
              <div key={s.id} className={`disc-fchip${subCategoryFilter === s.id ? ' diet-active' : ''}`}
                onClick={() => setSubCategoryFilter(s.id)}
                style={{ fontSize: 10, padding: '3px 8px' }}>{s.label}</div>
            ))}
          </div>
        )}

        {/* 4-column filter grid with visual grouping */}
        <div className="disc-filter-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, alignItems: 'start' }}>

          {/* Col 1: Diet */}
          <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '8px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
              <span style={{ fontSize: 12 }}>🥗</span>
              <span className="disc-filter-label">Diet</span>
              {dietFilter !== 'any' && <button className="disc-filter-clear" onClick={() => setDietFilter('any')} style={{ marginLeft: 'auto' }}>✕</button>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {DIET_FILTERS.filter(d => d.id !== 'any').map(d => (
                <div key={d.id} className={`disc-fchip${dietFilter === d.id ? ' diet-active' : ''}`}
                  onClick={() => { const next = dietFilter === d.id ? 'any' : d.id; setDietFilter(next); if (next !== 'any') trackFilterApplied('diet', next); }}
                  style={{ fontSize: 11, padding: '4px 8px' }}>{d.label}</div>
              ))}
            </div>
          </div>

          {/* Col 2: Exclude allergens */}
          <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '8px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
              <span style={{ fontSize: 12 }}>⚠️</span>
              <span className="disc-filter-label">Exclude</span>
              {allergenFilters.size > 0 && <button className="disc-filter-clear" onClick={() => setAllergenFilters(new Set())} style={{ marginLeft: 'auto' }}>✕</button>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {ALLERGEN_OPTIONS.map(a => (
                <div key={a.id} className={`disc-fchip${allergenFilters.has(a.id) ? ' allergen-active' : ''}`}
                  onClick={() => toggleAllergen(a.id)}
                  style={{ fontSize: 11, padding: '4px 8px' }}>{a.label}</div>
              ))}
            </div>
          </div>

          {/* Col 3: Preference tags */}
          <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '8px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
              <span style={{ fontSize: 12 }}>🏷️</span>
              <span className="disc-filter-label">Preference</span>
              {tagFilters.size > 0 && <button className="disc-filter-clear" onClick={() => setTagFilters(new Set())} style={{ marginLeft: 'auto' }}>✕</button>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {TAG_OPTIONS.map(t => (
                <div key={t.id} className={`disc-fchip${tagFilters.has(t.id) ? ' diet-active' : ''}`}
                  onClick={() => toggleTag(t.id)}
                  style={{ fontSize: 11, padding: '4px 8px' }}>{t.label}</div>
              ))}
            </div>
          </div>

          {/* Col 4: Health conditions */}
          <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '8px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}>
              <span style={{ fontSize: 12 }}>🩺</span>
              <span className="disc-filter-label">Safe for</span>
              {conditionFilters.size > 0 && <button className="disc-filter-clear" onClick={() => { setConditionFilters(new Set()); setSafeLevel('safe'); }} style={{ marginLeft: 'auto' }}>✕</button>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {CONDITION_OPTIONS.map(c => (
                <div key={c.id} className={`disc-fchip${conditionFilters.has(c.id) ? ' allergen-active' : ''}`}
                  onClick={() => toggleCondition(c.id)}
                  style={{ fontSize: 11, padding: '4px 8px' }}>{c.label}</div>
              ))}
            </div>
            {conditionFilters.size > 0 && (
              <div style={{ display: 'inline-flex', borderRadius: 12, border: '1.5px solid var(--border2)', overflow: 'hidden', marginTop: 5 }}>
                <div onClick={() => setSafeLevel('safe')}
                  style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font)',
                    background: safeLevel === 'safe' ? 'var(--teal)' : 'var(--white)',
                    color: safeLevel === 'safe' ? '#fff' : 'var(--text3)',
                  }}>Strict</div>
                <div onClick={() => setSafeLevel('moderate')}
                  style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font)',
                    borderLeft: '1.5px solid var(--border2)',
                    background: safeLevel === 'moderate' ? 'var(--teal)' : 'var(--white)',
                    color: safeLevel === 'moderate' ? '#fff' : 'var(--text3)',
                  }}>With caution</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>

        {/* Relaxed-filter notice */}
        {relaxed && !loading && (
          <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 8, background: 'var(--teal-xl)', borderLeft: '3px solid var(--teal)', fontSize: 12, fontWeight: 500, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>ℹ️</span>
            <span>Showing all <strong>{MEAL_TYPE_FILTERS.find(m => m.id === mealTypeFilter)?.label}</strong> dishes — some filters were relaxed as too few matched.</span>
          </div>
        )}

        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>
            Loading dishes…
          </div>
        ) : displayResults.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text3)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🍽️</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>No dishes found</div>
            <div style={{ fontSize: 13 }}>Try adjusting your filters or search term</div>
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
                condBadges={buildCondBadges(dish, conditionFilters)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
