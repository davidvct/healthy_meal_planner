import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { trackDishSwapped, trackDishRemoved, trackDishFavourited, trackServingsChanged } from '../services/analytics';

/**
 * Compact meal-slot card — renders all dishes for a single meal type
 * (breakfast / lunch / dinner) in one card with stacked rows.
 * Designed for readability by elderly caregivers.
 */

const MEAL_THEME = {
  breakfast: { accent: '#D97706', bg: '#FFFBEB', border: '#FDE68A', emoji: '☀️', label: 'Breakfast' },
  lunch:     { accent: '#059669', bg: '#F0FDF9', border: '#A7F3D0', emoji: '🌿', label: 'Lunch' },
  dinner:    { accent: '#069B8E', bg: '#EFF6FF', border: '#BFDBFE', emoji: '🌙', label: 'Dinner' },
};

function DishRow({ entry, dishDetail, onBrowse, onServingsChange, onRemove, userId, locked, canRemove }) {
  const [fav, setFav] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const dishId = entry.dishId || entry.id;

  useEffect(() => {
    if (!userId || !dishId) return;
    api.getFavourites(userId).then(ids => setFav(ids.includes(dishId))).catch(() => {});
  }, [userId, dishId]);

  const handleFav = async (e) => {
    e.stopPropagation();
    const next = !fav;
    setFav(next);
    trackDishFavourited(entry.dishName || dishId, next);
    try {
      if (next) await api.addFavourite(userId, dishId);
      else await api.removeFavourite(userId, dishId);
    } catch { setFav(!next); }
  };

  const perKcal    = Math.round(entry.kcal ?? 0);
  const qty        = entry.servingsQty || 1;
  const perProtein = Math.round(entry.protein ?? 0);
  const perCarbs   = Math.round(entry.carbs ?? 0);
  const perFat     = Math.round(entry.fat ?? 0);
  const perSodium  = Math.round(entry.sodium ?? 0);
  const perSugar   = Math.round(entry.sugar ?? 0);
  // All display values are total for the selected quantity
  const kcal    = perKcal * qty;
  const protein = perProtein * qty;
  const carbs   = perCarbs * qty;
  const fat     = perFat * qty;
  const sodium  = perSodium * qty;
  const sugar   = perSugar * qty;

  const imgUrl = dishDetail?.image_url || dishDetail?.imageUrl;

  // Health tags (max 2 to keep compact)
  const healthTags = [];
  const LABELS = {
    diabetes:     { safe: 'Diabetes-safe', watch: 'Watch sugar', alert: 'High sugar' },
    hypertension: { safe: 'Low sodium',    watch: 'Watch sodium', alert: 'High sodium' },
    cholesterol:  { safe: 'Low cholesterol', watch: 'Watch cholesterol', alert: 'High cholesterol' },
  };
  for (const [, { val, map }] of [
    ['d', { val: (dishDetail?.diabetes_category || dishDetail?.diabetesCategory || '').toLowerCase(), map: LABELS.diabetes }],
    ['h', { val: (dishDetail?.hypertension_category || dishDetail?.hypertensionCategory || '').toLowerCase(), map: LABELS.hypertension }],
    ['c', { val: (dishDetail?.cholesterol_category || dishDetail?.cholesterolCategory || '').toLowerCase(), map: LABELS.cholesterol }],
  ]) {
    if (map[val]) healthTags.push({ label: map[val], type: val });
  }

  const tagCls = (type) => type === 'safe' ? 'tg-green' : type === 'watch' ? 'tg-amber' : type === 'alert' ? 'tg-red' : 'tg-muted';

  // Ingredients for expanded view
  const ingredientKeys = (() => {
    const raw = dishDetail?.recipe?.ingredients_raw || dishDetail?.recipe?.ingredients;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(String).slice(0, 10);
        if (parsed && typeof parsed === 'object') return Object.keys(parsed).slice(0, 10);
      } catch {}
      const lines = String(raw).split(/\n/).map(s => s.trim()).filter(Boolean);
      if (lines.length > 0) return lines.slice(0, 10);
    }
    const fromDetail = dishDetail?.ingredients;
    if (fromDetail && Object.keys(fromDetail).length > 0) return Object.keys(fromDetail).slice(0, 10);
    return Object.keys(entry.dishIngredients || {}).slice(0, 10);
  })();

  // Preparation steps
  const steps = dishDetail?.recipe?.steps || [];

  return (
    <div style={{
      margin: '10px 10px 12px', border: '1px solid var(--border)', borderRadius: 10,
      overflow: 'hidden', background: 'var(--white)',
    }}>
      {/* Main row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
        cursor: 'pointer',
      }} onClick={() => setExpanded(e => !e)}>

        {/* Thumbnail — small */}
        <div style={{
          width: 48, height: 48, borderRadius: 10, flexShrink: 0,
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg)', border: '1px solid var(--border)',
        }}>
          {imgUrl ? (
            <img src={imgUrl} alt="" loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <span style={{ fontSize: 18 }}>🍽️</span>
          )}
        </div>

        {/* Dish name + kcal */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.dishName || 'Dish'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
            {healthTags.slice(0, 2).map(t => (
              <span key={t.label} className={`tag ${tagCls(t.type)}`} style={{ fontSize: 9, padding: '1px 6px' }}>{t.label}</span>
            ))}
          </div>
        </div>

        {/* Kcal + qty stepper */}
        <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)' }}>
            {kcal} <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)' }}>kcal</span>
          </div>
          {/* Qty stepper */}
          {!locked && onServingsChange && (
            <div className="qty-stepper" style={{
              display: 'flex', alignItems: 'center', gap: 0,
              border: '1.5px solid var(--border)', borderRadius: 8, overflow: 'hidden',
            }} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => { if (qty > 1) { onServingsChange(entry.id, qty - 1); trackServingsChanged(entry.dishName || '', qty - 1); } }}
                disabled={qty <= 1}
                className="qty-stepper-btn"
                style={{
                  minWidth: 32, minHeight: 32, border: 'none', background: qty <= 1 ? 'var(--bg)' : 'var(--white)',
                  color: qty <= 1 ? 'var(--border2)' : 'var(--text2)', fontSize: 16, fontWeight: 700,
                  cursor: qty <= 1 ? 'default' : 'pointer', fontFamily: 'var(--font)', lineHeight: 1,
                }}
              >−</button>
              <span style={{
                minWidth: 32, minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: 'var(--navy)',
                borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)',
                background: 'var(--bg)',
              }}>{qty}</span>
              <button
                onClick={() => { if (qty < 10) { onServingsChange(entry.id, qty + 1); trackServingsChanged(entry.dishName || '', qty + 1); } }}
                disabled={qty >= 10}
                className="qty-stepper-btn"
                style={{
                  minWidth: 32, minHeight: 32, border: 'none', background: qty >= 10 ? 'var(--bg)' : 'var(--white)',
                  color: qty >= 10 ? 'var(--border2)' : 'var(--teal)', fontSize: 16, fontWeight: 700,
                  cursor: qty >= 10 ? 'default' : 'pointer', fontFamily: 'var(--font)', lineHeight: 1,
                }}
              >+</button>
            </div>
          )}
          {(locked || !onServingsChange) && qty > 1 && (
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>
              {perKcal} × {qty} servings
            </div>
          )}
        </div>
      </div>

      {/* Macros bar — always visible */}
      <div style={{
        display: 'flex', gap: 0, padding: '0 14px 6px 72px',
        fontSize: 12, color: 'var(--text3)',
      }}>
        {[
          { l: 'Protein', v: `${protein}g`, c: 'var(--teal)' },
          { l: 'Carbs',   v: `${carbs}g`,   c: '#6366f1' },
          { l: 'Fat',     v: `${fat}g`,     c: 'var(--purple)' },
          { l: 'Sodium',  v: `${sodium}mg`, c: 'var(--coral)' },
          { l: 'Sugar',   v: `${sugar}g`,   c: 'var(--green)' },
        ].map(m => (
          <span key={m.l} style={{ marginRight: 10 }}>
            <strong style={{ color: m.c, fontSize: 12 }}>{m.v}</strong>
            <span style={{ marginLeft: 2, fontSize: 10 }}>{m.l}</span>
          </span>
        ))}
      </div>

      {/* Action pills — compact, right-aligned */}
      {!locked && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          gap: 6, padding: '4px 12px 8px 72px',
        }}>
          {canRemove && onRemove && (
            <button
              onClick={e => { e.stopPropagation(); trackDishRemoved(entry.mealType || 'unknown'); onRemove(entry); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 20,
                border: '1px solid var(--border)', background: 'var(--white)',
                fontSize: 10, fontWeight: 600, color: 'var(--text3)',
                cursor: 'pointer', fontFamily: 'var(--font)',
                transition: 'all 0.15s', lineHeight: 1,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-l)'; e.currentTarget.style.color = 'var(--coral)'; e.currentTarget.style.borderColor = 'var(--coral)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--white)'; e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >✕ Remove</button>
          )}
          {onBrowse && (
            <button
              onClick={e => { e.stopPropagation(); trackDishSwapped(entry.mealType || 'unknown'); onBrowse(); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 20,
                border: '1px solid var(--teal)', background: 'var(--teal-xl)',
                fontSize: 10, fontWeight: 600, color: 'var(--teal)',
                cursor: 'pointer', fontFamily: 'var(--font)',
                transition: 'all 0.15s', lineHeight: 1,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--teal)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--teal-xl)'; e.currentTarget.style.color = 'var(--teal)'; }}
            >↻ Change</button>
          )}
          <button
            onClick={handleFav}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 20,
              border: fav ? '1px solid var(--red)' : '1px solid var(--border)',
              background: fav ? 'var(--red-l)' : 'var(--white)',
              fontSize: 10, fontWeight: 600,
              color: fav ? 'var(--red)' : 'var(--text3)',
              cursor: 'pointer', fontFamily: 'var(--font)',
              transition: 'all 0.15s', lineHeight: 1,
            }}
            onMouseEnter={e => { if (!fav) { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; } }}
            onMouseLeave={e => { if (!fav) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text3)'; } }}
          >{fav ? '♥ Saved' : '♡ Save'}</button>
        </div>
      )}

      {/* Expanded: ingredients + preparation */}
      {expanded && (
        <div style={{ padding: '8px 14px 12px 72px', background: 'var(--bg)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Ingredients */}
          {ingredientKeys.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text2)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ingredients</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {ingredientKeys.map(k => (
                  <span key={k} style={{
                    fontSize: 11, padding: '2px 8px', background: 'var(--white)',
                    border: '1px solid var(--border)', borderRadius: 20, color: 'var(--text2)',
                  }}>{k}</span>
                ))}
              </div>
            </div>
          )}

          {/* Preparation steps */}
          {steps.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text2)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Preparation</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {steps.slice(0, 6).map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', background: 'var(--teal)',
                      color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                    }}>{i + 1}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{s}</div>
                  </div>
                ))}
                {steps.length > 6 && (
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic' }}>
                    + {steps.length - 6} more steps
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fallback when no details loaded */}
          {ingredientKeys.length === 0 && steps.length === 0 && (
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>
              {dishDetail ? 'No details available' : 'Loading details…'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const MAX_DISHES_PER_SLOT = 3;

export default function MealSlotCard({ mealType, entries, dishDetails, onBrowse, onRemove, onServingsChange, userId, locked, dayIndex, weekStart }) {
  const theme = MEAL_THEME[mealType] || MEAL_THEME.lunch;

  // Compute slot totals
  const slotKcal = entries.reduce((sum, e) => {
    const kcal = Math.round(e.kcal ?? 0);
    const qty = e.servingsQty || 1;
    return sum + kcal * qty;
  }, 0);

  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--border)',
      borderLeft: `4px solid ${theme.accent}`,
      borderRadius: 'var(--r)', overflow: 'hidden',
    }}>
      {/* Slot header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', background: theme.bg,
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{theme.emoji}</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)' }}>{theme.label}</span>
          <span style={{
            fontSize: 10, fontWeight: 600, color: 'var(--text3)',
            background: 'var(--white)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '1px 8px',
          }}>
            {entries.length} {entries.length === 1 ? 'dish' : 'dishes'}
          </span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: theme.accent }}>
          {slotKcal} <span style={{ fontSize: 11, fontWeight: 600 }}>kcal</span>
        </div>
      </div>

      {/* Dish rows */}
      {entries.map((entry) => (
        <DishRow
          key={entry.id}
          entry={entry}
          dishDetail={dishDetails[entry.dishId]}
          onBrowse={locked ? undefined : () => onBrowse?.({ userId, dayIndex: dayIndex ?? entry.dayIndex, mealType, label: theme.label, weekStart })}
          onServingsChange={locked ? undefined : onServingsChange}
          onRemove={locked ? undefined : onRemove}
          canRemove={true}
          userId={userId}
          locked={locked}
        />
      ))}

      {/* Add dish button */}
      {!locked && entries.length < MAX_DISHES_PER_SLOT && onBrowse && (
        <button
          onClick={() => onBrowse({ userId, dayIndex, mealType, label: theme.label, weekStart })}
          style={{
            width: '100%', padding: '10px 14px',
            background: 'none', border: 'none', borderTop: '1px dashed var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontSize: 12, fontWeight: 600, color: 'var(--teal)',
            cursor: 'pointer', fontFamily: 'var(--font)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--teal-xl)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <span style={{ fontSize: 15, lineHeight: 1 }}>+</span>
          Add dish ({MAX_DISHES_PER_SLOT - entries.length} remaining)
        </button>
      )}
    </div>
  );
}
