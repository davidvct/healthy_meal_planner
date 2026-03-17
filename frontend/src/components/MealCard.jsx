import { useState } from 'react';

const MEAL_STYLES = {
  breakfast: { border: '#D97706', iconBg: '#FEF3C7', labelColor: '#D97706', emoji: '🥣' },
  lunch:     { border: '#059669', iconBg: '#D1FAE5', labelColor: '#059669', emoji: '🍽️' },
  dinner:    { border: '#069B8E', iconBg: '#E8F8F6', labelColor: '#069B8E', emoji: '🌙' },
};

const MEAL_LABEL = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };

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
    diabetes:     { safe: 'Diabetes-safe', watch: 'Watch sugar',       alert: 'High sugar' },
    hypertension: { safe: 'Low sodium',    watch: 'Watch sodium',      alert: 'High sodium' },
    cholesterol:  { safe: 'Low cholesterol', watch: 'Watch cholesterol', alert: 'High cholesterol' },
  };

  const checks = [
    { val: (dishDetail.diabetes_category   || dishDetail.diabetesCategory   || '').toLowerCase(), map: LABELS.diabetes },
    { val: (dishDetail.hypertension_category || dishDetail.hypertensionCategory || '').toLowerCase(), map: LABELS.hypertension },
    { val: (dishDetail.cholesterol_category  || dishDetail.cholesterolCategory  || '').toLowerCase(), map: LABELS.cholesterol },
  ];

  for (const { val, map } of checks) {
    if (map[val]) tags.push({ label: map[val], type: val });
  }
  return tags;
}

export default function MealCard({ entry, mealType, onRemove, onSwap, swapping, dishDetail }) {
  const [expanded, setExpanded] = useState(false);
  const [fav, setFav] = useState(false);

  const style = MEAL_STYLES[mealType] || MEAL_STYLES.lunch;

  const kcal    = Math.round(dishDetail?.nutrients?.calories ?? dishDetail?.calories ?? entry.kcal ?? 0);
  const protein = Math.round(entry.protein ?? 0);
  const carbs   = Math.round(entry.carbs   ?? 0);
  const fat     = Math.round(entry.fat     ?? 0);
  const sodium  = Math.round(entry.sodium  ?? 0);
  const sugar   = Math.round(entry.sugar   ?? 0);

  const healthTags = getHealthTags(dishDetail);
  const dietaryTags = getDietaryTags(entry, dishDetail);

  const ingredientKeys = (() => {
    const fromDetail = dishDetail?.ingredients;
    if (fromDetail && Object.keys(fromDetail).length > 0) return Object.keys(fromDetail).slice(0, 12);
    const raw = dishDetail?.recipe?.ingredients;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(String).slice(0, 12);
        if (parsed && typeof parsed === 'object') return Object.keys(parsed).slice(0, 12);
      } catch {}
      const lines = String(raw).split(/[,\n]/).map(s => s.trim()).filter(Boolean);
      if (lines.length > 0) return lines.slice(0, 12);
    }
    return Object.keys(entry.dishIngredients || {}).slice(0, 12);
  })();

  const steps = dishDetail?.recipe?.steps || [];

  return (
    <div className="mc2" style={{ borderLeft: `4px solid ${style.border}` }}>

      {/* Header */}
      <div className="mc2-hdr">
        <div className="mc2-icon" style={{ background: style.iconBg }}>
          {style.emoji}
        </div>

        <div className="mc2-info">
          <div className="mc2-meal-type" style={{ color: style.labelColor }}>
            {MEAL_LABEL[mealType] || mealType}
          </div>
          <div className="mc2-name-row">
            <div className="mc2-name">{entry.dishName || entry.name || 'Dish'}</div>
            {kcal > 0 && <span className="mc2-kcal">{kcal} kcal</span>}
          </div>
          {(healthTags.length > 0 || dietaryTags.length > 0) && (
            <div className="mc2-tags">
              {healthTags.map(t => (
                <span key={t.label} className={`mc2-tag-${t.type === 'safe' ? 'safe' : t.type === 'watch' ? 'watch' : 'alert'}`}>
                  {t.label}
                </span>
              ))}
              {dietaryTags.map(label => (
                <span key={label} className="mc2-tag-diet">{label}</span>
              ))}
            </div>
          )}
        </div>

        <div className="mc2-actions">
          <button
            className="mc2-swap"
            onClick={e => { e.stopPropagation(); onSwap && onSwap(entry); }}
            disabled={swapping}
          >
            {swapping ? '…' : '⇄ swap'}
          </button>
          <button
            className={`mc2-fav${fav ? ' on' : ''}`}
            onClick={e => { e.stopPropagation(); setFav(v => !v); }}
          >
            {fav ? '♥' : '♡'}
          </button>
        </div>
      </div>

      {/* Macros — always visible */}
      <div className="mc2-macros">
        {[
          { label: 'Protein', value: protein, unit: 'g' },
          { label: 'Carbs',   value: carbs,   unit: 'g' },
          { label: 'Fat',     value: fat,      unit: 'g' },
          { label: 'Sodium',  value: sodium,  unit: 'mg' },
          { label: 'Sugar',   value: sugar,   unit: 'g' },
        ].map(m => (
          <div key={m.label} className="mc2-macro">
            <div className="mc2-macro-val">{m.value}{m.unit}</div>
            <div className="mc2-macro-lbl">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Show/hide details toggle */}
      <div className="mc2-footer" onClick={() => setExpanded(e => !e)}>
        {expanded ? '− Hide details' : '+ Show details'}
      </div>

      {/* Expanded: ingredients + steps */}
      {expanded && (
        <div className="mc2-detail">
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

          <div className="mc2-remove-bar">
            <button
              className="mc2-remove"
              onClick={e => { e.stopPropagation(); onRemove && onRemove(entry); }}
            >
              ✕ Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
