import { useState, useEffect } from 'react';
import * as api from '../services/api';

const MEAL_STYLES = {
  breakfast: { thumbCls: 'fv-b', pillColor: '#D97706', label: 'Breakfast', emoji: '🥣' },
  lunch:     { thumbCls: 'fv-l', pillColor: '#059669', label: 'Lunch',     emoji: '🍽️' },
  dinner:    { thumbCls: 'fv-d', pillColor: '#069B8E', label: 'Dinner',    emoji: '🌙' },
};

const DIETARY_TAG_LABELS = {
  vegetarian:   'Vegetarian',
  vegan:        'Vegan',
  gluten_free:  'Gluten-free',
  dairy_free:   'Dairy-free',
  low_carb:     'Low carb',
  high_protein: 'High protein',
  low_sugar:    'Low sugar',
  low_sodium:   'Low sodium',
  spicy:        'Spicy',
  keto:         'Keto',
};

function getDietaryTags(entry, dishDetail) {
  const raw = [
    ...(entry.tags || []),
    ...(dishDetail?.tags || []),
  ];
  const seen = new Set();
  const result = [];
  for (const t of raw) {
    const key = String(t).toLowerCase().replace(/\s+/g, '_');
    if (DIETARY_TAG_LABELS[key] && !seen.has(key)) {
      seen.add(key);
      result.push(DIETARY_TAG_LABELS[key]);
    }
  }
  return result;
}

function getHealthTags(dishDetail) {
  if (!dishDetail) return [];
  const tags = [];

  const LABELS = {
    diabetes:     { safe: 'Diabetes-safe', watch: 'Watch sugar',         alert: 'High sugar' },
    hypertension: { safe: 'Low sodium',    watch: 'Watch sodium',        alert: 'High sodium' },
    cholesterol:  { safe: 'Low cholesterol', watch: 'Watch cholesterol', alert: 'High cholesterol' },
  };

  const checks = [
    { val: (dishDetail.diabetes_category    || dishDetail.diabetesCategory    || '').toLowerCase(), map: LABELS.diabetes },
    { val: (dishDetail.hypertension_category || dishDetail.hypertensionCategory || '').toLowerCase(), map: LABELS.hypertension },
    { val: (dishDetail.cholesterol_category  || dishDetail.cholesterolCategory  || '').toLowerCase(), map: LABELS.cholesterol },
  ];

  for (const { val, map } of checks) {
    if (map[val]) tags.push({ label: map[val], type: val });
  }
  return tags;
}

function deriveHealthClass(healthTags) {
  if (healthTags.some(t => t.type === 'alert')) return 'mc-alert';
  if (healthTags.some(t => t.type === 'watch')) return 'mc-warn';
  if (healthTags.length > 0) return 'mc-safe';
  return '';
}

function tagClass(type) {
  if (type === 'safe') return 'tg-green';
  if (type === 'watch') return 'tg-amber';
  if (type === 'alert') return 'tg-red';
  return 'tg-muted';
}

export default function MealCard({ entry, mealType, onBrowse, dishDetail, userId, healthClass: healthClassProp, locked }) {
  const [expanded, setExpanded] = useState(false);
  const [fav, setFav] = useState(false);

  const dishId = entry.dishId || entry.id;

  useEffect(() => {
    if (!userId || !dishId) return;
    api.getFavourites(userId).then(ids => setFav(ids.includes(dishId))).catch(() => {});
  }, [userId, dishId]);

  const handleFav = async (e) => {
    e.stopPropagation();
    const next = !fav;
    setFav(next);
    try {
      if (next) await api.addFavourite(userId, dishId);
      else await api.removeFavourite(userId, dishId);
    } catch {
      setFav(!next);
    }
  };

  const style = MEAL_STYLES[mealType] || MEAL_STYLES.lunch;

  const kcal    = Math.round(entry.kcal ?? dishDetail?.nutrients?.calories ?? dishDetail?.calories ?? 0);
  const protein = Math.round(entry.protein ?? 0);
  const carbs   = Math.round(entry.carbs   ?? 0);
  const fat     = Math.round(entry.fat     ?? 0);
  const sodium  = Math.round(entry.sodium  ?? 0);
  const sugar   = Math.round(entry.sugar   ?? 0);

  const healthTags  = getHealthTags(dishDetail);
  const dietaryTags = getDietaryTags(entry, dishDetail);
  const healthClass = healthClassProp || deriveHealthClass(healthTags);

  const macroData = [
    { l: 'Protein', v: `${protein}g` },
    { l: 'Carbs',   v: `${carbs}g` },
    { l: 'Fat',     v: `${fat}g` },
    { l: 'Sodium',  v: `${sodium}mg` },
    { l: 'Sugar',   v: `${sugar}g` },
  ];

  const ingredientKeys = (() => {
    // Prefer raw recipe text so quantities are preserved ("2 tbsp olive oil")
    const raw = dishDetail?.recipe?.ingredients_raw || dishDetail?.recipe?.ingredients;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(String).slice(0, 12);
        if (parsed && typeof parsed === 'object') return Object.keys(parsed).slice(0, 12);
      } catch {}
      const lines = String(raw).split(/\n/).map(s => s.trim()).filter(Boolean);
      if (lines.length > 0) return lines.slice(0, 12);
    }
    // Fall back to parsed map keys (no quantities)
    const fromDetail = dishDetail?.ingredients;
    if (fromDetail && Object.keys(fromDetail).length > 0) return Object.keys(fromDetail).slice(0, 12);
    return Object.keys(entry.dishIngredients || {}).slice(0, 12);
  })();

  const steps = dishDetail?.recipe?.steps || [];

  return (
    <div className={`mc${healthClass ? ` ${healthClass}` : ''}${expanded ? ' exp' : ''}`}>

      <div className="mc-zone-wrap">

        {/* Left zone: thumb + info + actions */}
        <div className="mc-zone-left">
          <div className={`mc-thumb ${style.thumbCls}`}>
            {(dishDetail?.image_url || dishDetail?.imageUrl) ? (
              <>
                <img
                  src={dishDetail.image_url || dishDetail.imageUrl}
                  alt=""
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 'inherit' }}
                  onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = ''; }}
                />
                <span className="mc-icon" style={{ display: 'none' }}>{style.emoji}</span>
              </>
            ) : (
              <span className="mc-icon">{style.emoji}</span>
            )}
          </div>

          <div className="mc-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
              <div className="mc-name-c">{entry.dishName || entry.name || 'Dish'}</div>
              {kcal > 0 && <span className="mc-kcal-badge">{kcal} kcal</span>}
              {(entry.servingsQty || 0) > 1 && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 12,
                  background: 'var(--blue-l)', color: 'var(--blue)', marginLeft: 4, whiteSpace: 'nowrap',
                }}>
                  ×{entry.servingsQty} servings
                </span>
              )}
            </div>
            {(healthTags.length > 0 || dietaryTags.length > 0) && (
              <div className="mc-tags">
                {healthTags.map(t => (
                  <span key={t.label} className={`tag ${tagClass(t.type)}`}>{t.label}</span>
                ))}
                {dietaryTags.map(label => (
                  <span key={label} className="tag tg-teal">{label}</span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {!locked && (
            <button
              className="mc-swap-inline"
              onClick={e => { e.stopPropagation(); onBrowse?.(); }}
              style={{ color: 'var(--teal)' }}
            >
              Change
            </button>
            )}
            <button
              className={`mc-fav-btn${fav ? ' on' : ''}`}
              data-tip={fav ? 'Remove from favourites' : 'Add to favourites'}
              onClick={handleFav}
            >
              {fav ? '♥' : '♡'}
            </button>
          </div>
        </div>

        {/* Compact macro row + details toggle */}
        <div className="mc-zone-right">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text3)', alignItems: 'center' }}>
              {macroData.map(x => (
                <span key={x.l}><strong style={{ color: 'var(--text2)' }}>{x.v}</strong> {x.l}</span>
              ))}
              {entry.recipeServings && (
                <span style={{ fontSize: 9, color: 'var(--text3)', fontStyle: 'italic', marginLeft: 2 }}>
                  per serving
                </span>
              )}
            </div>
            <div className="mc-more" onClick={() => setExpanded(e => !e)} style={{ marginTop: 0, borderTop: 'none', padding: '4px 0' }}>
              {expanded ? '− Less' : '+ More'}
            </div>
          </div>
        </div>

      </div>

      {/* Expanded: ingredients + steps */}
      {expanded && (
        <div className="mc-detail">
          <div>
            <div className="mcd-hd">Ingredients</div>
            {ingredientKeys.length > 0 ? (
              <div className="ings">
                {ingredientKeys.map(k => (
                  <div key={k} className="ing">
                    <div className="idot" />
                    {k}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 11, color: 'var(--text3)', padding: '4px 0' }}>
                {dishDetail ? 'No ingredients listed' : 'Loading…'}
              </div>
            )}
          </div>

          <div>
            <div className="mcd-hd">Preparation</div>
            {steps.length > 0 ? (
              <div className="steps">
                {steps.slice(0, 5).map((s, i) => (
                  <div key={i} className="step">
                    <div className="step-n">{i + 1}</div>
                    <div className="step-t">{s}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 11, color: 'var(--text3)', padding: '4px 0' }}>
                {dishDetail ? 'No preparation steps listed' : 'Loading…'}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
