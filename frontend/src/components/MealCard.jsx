import { useState } from 'react';

const THUMB_CLASS = { breakfast: 'fv-b', lunch: 'fv-l', dinner: 'fv-d' };
const MEAL_EMOJI  = { breakfast: '☀️', lunch: '🌿', dinner: '🌙' };
const MEAL_LABEL  = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };

export default function MealCard({ entry, mealType, onRemove, onSwap, swapping, dishDetail, healthClass = 'mc-safe' }) {
  const [expanded, setExpanded] = useState(false);
  const [fav, setFav] = useState(false);

  // Use kcal from dishDetail if available (getMealPlan doesn't return it)
  const kcal = Math.round(dishDetail?.nutrients?.calories ?? dishDetail?.calories ?? entry.kcal ?? 0);
  const ingredientKeys = (() => {
    // 1. dishDetail.ingredients — parsed dict {name: amount} from getDishDetail
    const fromDetail = dishDetail?.ingredients;
    if (fromDetail && Object.keys(fromDetail).length > 0) return Object.keys(fromDetail).slice(0, 10);

    // 2. dishDetail.recipe.ingredients — raw DB field (JSON dict, JSON array, or plain text)
    const raw = dishDetail?.recipe?.ingredients;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(String).slice(0, 10);
        if (parsed && typeof parsed === 'object') return Object.keys(parsed).slice(0, 10);
      } catch {}
      const lines = String(raw).split(/[,\n]/).map(s => s.trim()).filter(Boolean);
      if (lines.length > 0) return lines.slice(0, 10);
    }

    // 3. Fallback: entry.dishIngredients from getMealPlan
    return Object.keys(entry.dishIngredients || {}).slice(0, 10);
  })();
  const steps = dishDetail?.recipe?.steps || [];
  const protein = Math.round(entry.protein ?? 0);
  const carbs   = Math.round(entry.carbs ?? 0);
  const fat     = Math.round(entry.fat ?? 0);
  const sodium  = Math.round(entry.sodium ?? 0);
  const tags    = entry.tags || entry.dietaryTags || [];
  const servings = entry.servings ?? 1;

  const thumbClass = THUMB_CLASS[mealType] || 'fv-l';
  const emoji      = MEAL_EMOJI[mealType] || '🍽️';
  const mealLabel  = MEAL_LABEL[mealType] || mealType;

  return (
    <div className={`mc ${healthClass}${expanded ? ' exp' : ''}`}>
      {/* Compact header row — click to expand */}
      <div className="mc-compact" onClick={() => setExpanded(e => !e)}>
        <div className={`mc-thumb ${thumbClass}`}>
          <span className="mc-icon">{emoji}</span>
        </div>

        <div className="mc-info">
          <div className="mc-pill-c">{mealLabel}</div>
          <div className="mc-header-row">
            <div className="mc-name-c">{entry.dishName || entry.name || 'Dish'}</div>
            <button
              className={`mc-fav-btn${fav ? ' on' : ''}`}
              data-tip={fav ? 'Unfavourite' : 'Favourite'}
              onClick={e => { e.stopPropagation(); setFav(v => !v); }}
            >
              {fav ? '♥' : '♡'}
            </button>
          </div>
          <div className="mc-tags-row">
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {tags.slice(0, 2).map(t => (
                <span key={t} className="tag tg-teal">{t}</span>
              ))}
            </div>
            {kcal > 0 && <span className="mc-kcal-badge">{kcal} kcal</span>}
          </div>
        </div>

        <button
          className="mc-swap-inline"
          onClick={e => { e.stopPropagation(); onSwap && onSwap(entry); }}
          disabled={swapping}
        >
          {swapping ? '…' : '⇄ Swap'}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <>
          <div className="mc-body">
            <div className="mc-macros">
              {[
                { label: 'Kcal',     value: kcal,     unit: '' },
                { label: 'Protein',  value: protein,  unit: 'g' },
                { label: 'Carbs',    value: carbs,    unit: 'g' },
                { label: 'Fat',      value: fat,      unit: 'g' },
                { label: 'Sodium',   value: sodium,   unit: 'mg' },
              ].map(m => (
                <div key={m.label} className="mc-m">
                  <div className="mc-ml">{m.label}</div>
                  <div className="mc-mv">{m.value}{m.unit}</div>
                </div>
              ))}
            </div>
            {servings !== 1 && (
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                {servings} serving{servings !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {(ingredientKeys.length > 0 || steps.length > 0) && (
            <div className="mc-detail">
              {ingredientKeys.length > 0 && (
                <div>
                  <div className="mcd-hd">Ingredients</div>
                  <div className="ings">
                    {ingredientKeys.map(k => (
                      <div key={k} className="ing">
                        <div className="idot" />
                        {k}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {steps.length > 0 && (
                <div>
                  <div className="mcd-hd">Preparation</div>
                  <div className="steps">
                    {steps.slice(0, 5).map((s, i) => (
                      <div key={i} className="step">
                        <div className="step-n">{i + 1}</div>
                        <div className="step-t">{s}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mc-pmw-bar">
            <button
              className="mc-pmw-act"
              onClick={e => { e.stopPropagation(); onSwap && onSwap(entry); }}
              disabled={swapping}
            >
              ⇄ Swap dish
            </button>
            <button
              className="mc-pmw-act dislike"
              onClick={e => { e.stopPropagation(); onRemove && onRemove(entry); }}
            >
              ✕ Remove
            </button>
          </div>
        </>
      )}
    </div>
  );
}
