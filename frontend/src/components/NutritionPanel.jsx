// NutritionPanel — sum-bar + nut-card (donut + msr-cell rows) + cond-card

const CONDITION_MAP = {
  'high blood sugar': {
    label: 'High Blood Sugar',
    cls: 'cp-amber',
    icBg: 'rgba(217,95,59,.2)',
    rule: 'Sugar ≤ 25g/day',
  },
  'high cholesterol': {
    label: 'High Cholesterol',
    cls: 'cp-purple',
    icBg: 'rgba(109,63,160,.2)',
    rule: 'Fat ≤ 44g/day',
  },
  hypertension: {
    label: 'Hypertension',
    cls: 'cp-red',
    icBg: 'rgba(220,38,38,.2)',
    rule: 'Sodium ≤ 1,500mg/day',
  },
};

const DIET_RULES = {
  vegetarian: 'Meat dishes excluded',
  vegan:      'Animal products excluded',
  keto:       'Low-carb dishes only',
  low_carb:   'Low-carb dishes only',
  gluten_free:'Gluten-free dishes only',
  halal:      'Halal dishes only',
};

function getTargets(condList, recTargets) {
  const t = {
    calories: recTargets?.calories || 2000,
    protein:  recTargets?.protein  || 70,
    carbs:    recTargets?.carbs    || 225,
    fat:      recTargets?.fat      || 78,
    sodium:   2300,
    sugar:    50,
  };
  if (condList.includes('high blood sugar')) t.sugar = 25;
  if (condList.includes('high cholesterol')) t.fat = Math.min(t.fat, 44);
  if (condList.includes('hypertension')) t.sodium = 1500;
  return t;
}

function buildSummary(nutrients, targets, mealCount) {
  if (!nutrients || mealCount === 0) {
    return 'No meals planned yet. Add meals to see your nutrition summary.';
  }
  const kcal     = nutrients.calories ?? 0;
  const kcalPct  = Math.round((kcal / targets.calories) * 100);
  const sodium   = nutrients.sodium ?? 0;
  const sodiumPct = Math.round((sodium / targets.sodium) * 100);
  const sugar    = nutrients.sugar ?? 0;
  const sugarPct = Math.round((sugar / targets.sugar) * 100);

  if (kcalPct > 100) {
    return `Calorie target <strong>exceeded</strong> (${kcalPct}%). Consider lighter options for remaining meals.`;
  }
  if (sugarPct > 90) {
    return `Sugar at <strong>${sugarPct}%</strong> of daily limit — be mindful of remaining meals. Calories at ${kcalPct}%.`;
  }
  if (sodiumPct > 80) {
    return `Sodium at <strong>${sodiumPct}%</strong> — watch intake for remaining meals. Calories at ${kcalPct}%.`;
  }
  if (kcalPct < 30) {
    return `Meals are <strong>getting started</strong> (${kcalPct}% of target). Add more dishes to reach your daily goals.`;
  }
  return `Calories at <strong>${kcalPct}%</strong> of target. Sodium at ${sodiumPct}% — on track. Keep going!`;
}

const MACROS = [
  { key: 'protein', label: 'Protein', unit: 'g',  color: 'var(--teal)',   targetKey: 'protein' },
  { key: 'carbs',   label: 'Carbs',   unit: 'g',  color: '#6366f1',       targetKey: 'carbs' },
  { key: 'fat',     label: 'Fat',     unit: 'g',  color: 'var(--purple)', targetKey: 'fat' },
  { key: 'sodium',  label: 'Sodium',  unit: 'mg', color: 'var(--coral)',  targetKey: 'sodium' },
  { key: 'sugar',   label: 'Sugar',   unit: 'g',  color: 'var(--green)',  targetKey: 'sugar' },
];

export default function NutritionPanel({ nutrients, conditions, diet, dinerName, mealCount = 0, recommendedTargets }) {
  const condList = Array.isArray(conditions)
    ? conditions.map(c => c.toLowerCase())
    : (conditions || '').split(',').map(c => c.trim().toLowerCase()).filter(Boolean);

  const targets  = getTargets(condList, recommendedTargets);

  const kcal    = nutrients?.calories ?? 0;
  const kcalPct = Math.min(Math.round((kcal / targets.calories) * 100), 100);
  const kcalRem = Math.max(targets.calories - Math.round(kcal), 0);

  const r    = 30, cx = 38, cy = 38;
  const circ = 2 * Math.PI * r;
  const dashFill = circ * Math.min(kcalPct / 100, 1);

  const summaryHtml = buildSummary(nutrients, targets, mealCount);

  const condEntries = condList.map(c => CONDITION_MAP[c]).filter(Boolean);

  // Diet pill (if not "any" / empty)
  const dietKey = (diet || '').toLowerCase().replace(/[\s-]/g, '_').replace('no_restriction', '').replace('none', '');
  const showDietPill = dietKey && dietKey !== 'any' && dietKey !== '';
  const dietRule = DIET_RULES[dietKey] || '';

  const condHeading = dinerName ? `Active filters — ${dinerName}` : 'Active filters';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Status bar */}
      <div className="sum-bar">
        <div className="sum-bar-dot" />
        <div
          className="sum-bar-txt"
          dangerouslySetInnerHTML={{ __html: summaryHtml }}
        />
      </div>

      {/* Nutrition card */}
      <div className="nut-card">
        <div className="nc-title">Today's nutrition</div>
        <div className="nc-sub">{mealCount} of 3 meals planned</div>

        {/* Donut + % info */}
        <div className="donut-wrap">
          <div className="dsw">
            <svg width="76" height="76" viewBox="0 0 76 76">
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E8EDF3" strokeWidth="5.5" />
              <circle
                cx={cx} cy={cy} r={r} fill="none"
                stroke="url(#nutGrad)" strokeWidth="5.5"
                strokeLinecap="round"
                strokeDasharray={`${dashFill} ${circ}`}
                strokeDashoffset={0}
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: 'stroke-dasharray .6s ease' }}
              />
              <defs>
                <linearGradient id="nutGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#069B8E" />
                  <stop offset="100%" stopColor="#18A55A" />
                </linearGradient>
              </defs>
            </svg>
            <div className="dcenter">
              <div className="dcval">{Math.round(kcal)}</div>
              <div className="dcunit">/{targets.calories.toLocaleString()}</div>
            </div>
          </div>
          <div>
            <div className="di-pct" style={{ color: kcalPct >= 60 ? 'var(--teal)' : 'var(--coral)' }}>
              {kcalPct}%
            </div>
            <div className="di-lbl">of daily target</div>
            <div className="di-rem">
              {kcalRem > 0 ? `${kcalRem.toLocaleString()} kcal remaining` : 'Target reached'}
            </div>
          </div>
        </div>

        {/* Macro stat rows */}
        <div className="macro-stat-row">
          {MACROS.map(m => {
            const val       = nutrients?.[m.key] ?? 0;
            const tgt       = targets[m.targetKey];
            const pct       = tgt ? Math.min(Math.round((val / tgt) * 100), 100) : 0;
            const over      = pct >= 90;
            const fillColor = over ? 'var(--red)' : m.color;
            return (
              <div key={m.key} className="msr-cell">
                <div className="msr-dot" style={{ background: m.color }} />
                <div className="msr-name">{m.label}</div>
                <div className="msr-bar">
                  <div className="msr-fill" style={{ background: fillColor, width: `${pct}%` }} />
                </div>
                <div className="msr-pct" style={{ color: fillColor }}>{pct}%</div>
                <div className="msr-val">
                  {Math.round(val)}{m.unit}&thinsp;/&thinsp;{tgt}{m.unit}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active filters card — always shown */}
      <div className="cond-card">
        <div className="cond-hd">{condHeading}</div>
        <div className="cpills">
          {condEntries.map(cond => (
            <div key={cond.label} className={`cpill ${cond.cls}`}>
              <div className="cp-ic" style={{ background: cond.icBg }} />
              {cond.label}
              <span className="cp-rule">{cond.rule}</span>
            </div>
          ))}
          {showDietPill && (
            <div className="cpill" style={{ background: 'var(--teal-l)', color: 'var(--teal)' }}>
              <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>
                {diet.charAt(0).toUpperCase() + diet.slice(1).toLowerCase()}
              </span>
              {dietRule && <span className="cp-rule">{dietRule}</span>}
            </div>
          )}
          {condEntries.length === 0 && !showDietPill && (
            <div className="cpill" style={{ background: 'var(--teal-l)', color: 'var(--teal)' }}>
              <span style={{ fontWeight: 700 }}>No conditions</span>
              <span className="cp-rule">Standard MOH guidelines</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
