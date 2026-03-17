import { useState, useEffect, useCallback } from 'react';
import NutritionChart from './NutritionChart';
import * as api from '../services/api';

const AV_CLASSES = ['dcav-t', 'dcav-p', 'dcav-b'];

function avatarLabel(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
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

const EMPTY_VALUES = new Set(['none', 'no restriction', 'no restrictions', 'any', 'n/a', 'na', 'not specified', 'none flagged']);

function parseTags(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(v => !EMPTY_VALUES.has(String(v).trim().toLowerCase()));
  return value.split(',').map(v => v.trim()).filter(v => v && !EMPTY_VALUES.has(v.toLowerCase()));
}

function conditionTagClass(cond) {
  const c = cond.toLowerCase();
  if (c.includes('diabetes') || c.includes('blood sugar')) return 'tg-amber';
  if (c.includes('cholesterol')) return 'tg-purple';
  if (c.includes('hypertension') || c.includes('blood pressure')) return 'tg-red';
  return 'tg-amber';
}

const NUTRIENT_TABS = [
  { key: 'calories',  label: 'Calories',  unit: 'kcal', color: '#069B8E', target: 2000 },
  { key: 'protein',   label: 'Protein',   unit: 'g',    color: '#6EE7B7', target: 50 },
  { key: 'carbs',     label: 'Carbs',     unit: 'g',    color: '#FCD34D', target: 275 },
  { key: 'fat',       label: 'Fat',       unit: 'g',    color: '#93C5FD', target: 78 },
  { key: 'sodium',    label: 'Sodium',    unit: 'mg',   color: '#F9A8D4', target: 2300 },
];

const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function buildChartData(weekNutrients, tabKey) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monday = getMonday(today);
  return DAY_ABBR.map((lbl, i) => {
    const dayDate = addDays(monday, i);
    dayDate.setHours(0, 0, 0, 0);
    const active = dayDate.getTime() === today.getTime();
    const dayNut = weekNutrients?.days?.[i] || weekNutrients?.[i];
    return { label: lbl, value: dayNut?.[tabKey] || 0, active };
  });
}

function buildStats(chartData, target) {
  const values = chartData.map(d => d.value);
  const onTrack = values.filter(v => v >= target * 0.8).length;
  const overTarget = values.filter(v => v > target).length;
  const nonZero = values.filter(v => v > 0);
  const highest = nonZero.length ? Math.round(Math.max(...nonZero)) : null;
  const lowest = nonZero.length ? Math.round(Math.min(...nonZero)) : null;
  const avg = nonZero.length ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 0;
  const avgPct = target ? Math.round((avg / target) * 100) : 0;
  const highestDay = highest != null ? DAY_ABBR[values.indexOf(Math.max(...nonZero))] : null;
  const lowestDay = lowest != null ? DAY_ABBR[values.indexOf(Math.min(...nonZero))] : null;
  return { onTrack, overTarget, highest, lowest, highestDay, lowestDay, avg: Math.round(avg), avgPct };
}

function buildStatusSpill(avgPct) {
  if (avgPct >= 90 && avgPct <= 110) return { cls: 'nd-spill-green', label: 'On target' };
  if (avgPct > 110) return { cls: 'nd-spill-red', label: 'Over target' };
  if (avgPct >= 60) return { cls: 'nd-spill-amber', label: 'Below target' };
  return { cls: 'nd-spill-teal', label: 'Getting started' };
}

export default function ProfilesScreen({ diners, activeDiner, onSelectDiner, onAddDiner, onEditDiner, onDinersChanged, onViewPlan }) {
  const [selected, setSelected] = useState(activeDiner || diners[0] || null);
  const [ndNut, setNdNut] = useState('calories');
  const [weekNutrients, setWeekNutrients] = useState(null);
  const [mealsPlanned, setMealsPlanned] = useState(0);

  useEffect(() => {
    setSelected(activeDiner || diners[0] || null);
  }, [activeDiner, diners]);

  const monday = getMonday(new Date());
  const weekStart = [
    monday.getFullYear(),
    String(monday.getMonth() + 1).padStart(2, '0'),
    String(monday.getDate()).padStart(2, '0'),
  ].join('-');

  const loadWeekNutrients = useCallback(async () => {
    if (!selected?.userId) return;
    try {
      const res = await api.getWeekNutrients(selected.userId, weekStart);
      setWeekNutrients(res);
    } catch {
      setWeekNutrients(null);
    }
  }, [selected?.userId, weekStart]);

  useEffect(() => { loadWeekNutrients(); }, [loadWeekNutrients]);

  const isMyself = selected?.userId === diners[0]?.userId;

  useEffect(() => {
    if (!selected?.userId || isMyself) return;
    api.getMealPlan(selected.userId, weekStart).then(plan => {
      const count = Object.values(plan || {}).flatMap(day =>
        Object.values(day).flatMap(entries => Array.isArray(entries) ? entries : [])
      ).length;
      setMealsPlanned(count);
    }).catch(() => setMealsPlanned(0));
  }, [selected?.userId, weekStart, isMyself]);

  const handleDelete = async (diner) => {
    if (!confirm(`Delete ${diner.name}? This cannot be undone.`)) return;
    try {
      await api.deleteDiner(diner.userId);
      onDinersChanged();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const nutTab = NUTRIENT_TABS.find(t => t.key === ndNut) || NUTRIENT_TABS[0];
  const chartData = buildChartData(weekNutrients, ndNut);
  const weekAvg = Math.round(chartData.reduce((s, d) => s + (d.value || 0), 0) / 7);
  const hasData = chartData.some(d => d.value > 0);

  const stats = buildStats(chartData, nutTab.target);
  const spill = buildStatusSpill(stats.avgPct);

  const selectedIdx = diners.findIndex(d => d.userId === selected?.userId);
  const avCls = AV_CLASSES[selectedIdx % AV_CLASSES.length] || 'dcav-t';

  const conditions = parseTags(selected?.conditions);
  const diet = parseTags(selected?.diet);
  const allergies = parseTags(selected?.allergies);

  const daysPlanned = chartData.filter(d => d.value > 0).length;

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '16px 18px' }}>
      <div style={{ maxWidth: '80%', margin: '0 auto', paddingTop: 4 }}>
      <div className="prof-layout">

        {/* Left rail */}
        <div className="prof-rail">
          {diners.map((d, i) => {
            const isActive = selected?.userId === d.userId;
            const avClass = AV_CLASSES[i % AV_CLASSES.length];
            return (
              <div
                key={d.userId}
                className={`prof-person${isActive ? ' active' : ''}`}
                onClick={() => { setSelected(d); onSelectDiner(d); }}
                title={d.name}
              >
                <div className={`prof-pav ${avClass}`}>{avatarLabel(d.name)}</div>
                <div className="prof-pname">{d.name?.split(' ')[0]}</div>
              </div>
            );
          })}
          <div className="prof-rail-sep" />
          {diners.length < 5 ? (
            <div className="prof-add" onClick={onAddDiner} title="Add diner">
              <div className="prof-add-ic">+</div>
              <div className="prof-add-lbl">Add</div>
            </div>
          ) : (
            <div className="prof-add" title="Maximum 5 diners reached" style={{ opacity: 0.6, cursor: 'not-allowed', pointerEvents: 'none' }}>
              <div className="prof-add-ic" style={{ fontSize: 11 }}>5/5</div>
              <div className="prof-add-lbl">Full</div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="prof-panel">
          {!selected ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 12, color: 'var(--text3)' }}>
              <div style={{ fontSize: 36 }}>👤</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>No diner selected</div>
              <button
                onClick={onAddDiner}
                style={{ padding: '7px 18px', borderRadius: 'var(--r-sm)', background: 'var(--teal)', color: '#fff', border: 'none', fontFamily: 'var(--font)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Add your first diner
              </button>
            </div>
          ) : (
            <>
              {/* Card 1: Person header */}
              <div className="prof-card">
                <div style={{ padding: '12px 15px', display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div className={`dcav ${avCls}`} style={{ width: 42, height: 42, fontSize: 13 }}>
                    {avatarLabel(selected.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font)', fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>
                      {selected.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                      {[selected.age && `${selected.age} yrs`, selected.sex, selected.weightKg && `${selected.weightKg} kg`].filter(Boolean).join(' · ') || 'No details set'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 7, flexShrink: 0, alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 16, paddingRight: 12, borderRight: '1px solid var(--border)' }}>
                      <div>
                        <div className="dcs-v">{daysPlanned}</div>
                        <div className="dcs-l">days planned</div>
                      </div>
                      <div>
                        {isMyself ? (
                          <>
                            <div className="dcs-v">{Math.max(0, diners.length - 1)}</div>
                            <div className="dcs-l">diners managed</div>
                          </>
                        ) : (
                          <>
                            <div className="dcs-v">{mealsPlanned}</div>
                            <div className="dcs-l">meals planned</div>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: 11, padding: '5px 12px' }}
                      onClick={() => onEditDiner(selected)}
                    >
                      Edit profile
                    </button>
                    <button
                      className="btn btn-navy"
                      style={{ fontSize: 11, padding: '5px 12px' }}
                      onClick={() => onViewPlan(selected)}
                    >
                      View plan →
                    </button>
                    {selected.userId !== diners[0]?.userId && (
                      <button
                        onClick={() => handleDelete(selected)}
                        title="Delete diner"
                        style={{ width: 30, height: 30, borderRadius: 'var(--r-xs)', border: '1px solid var(--border2)', background: 'var(--white)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', flexShrink: 0 }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-l)'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'var(--white)'; }}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 3h8M5 3V2h2v1M4.5 5v4M7.5 5v4M3 3l.5 7h5l.5-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Health / Diet / Allergens */}
              <div className="prof-card-flat">
                <div className="dc-hda">
                  <div className="dc-hda-col">
                    <div className="dc-hda-lbl">Health profile</div>
                    {conditions.length === 0
                      ? <span className="tag tg-green">No conditions</span>
                      : <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {conditions.map(c => <span key={c} className={`tag ${conditionTagClass(c)}`}>{c}</span>)}
                        </div>
                    }
                  </div>
                  <div className="dc-hda-col">
                    <div className="dc-hda-lbl">Diet</div>
                    {diet.length === 0
                      ? <span className="tag tg-muted">No restriction</span>
                      : <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {diet.map(d => <span key={d} className="tag tg-teal">{d}</span>)}
                        </div>
                    }
                  </div>
                  <div className="dc-hda-col">
                    <div className="dc-hda-lbl">Allergens</div>
                    {allergies.length === 0
                      ? <span className="tag tg-muted">None flagged</span>
                      : <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {allergies.map(a => <span key={a} className="tag tg-amber">{a}</span>)}
                        </div>
                    }
                  </div>
                </div>
              </div>

              {/* Card 3: Nutrition dashboard */}
              <div className="prof-card">
                <div className="nd-tabs-row">
                  {NUTRIENT_TABS.map(t => (
                    <button
                      key={t.key}
                      className={`nd-tab${ndNut === t.key ? ' nd-active' : ''}`}
                      style={{ borderBottomColor: ndNut === t.key ? t.color : 'transparent' }}
                      onClick={() => setNdNut(t.key)}
                    >
                      <div className="nd-dot" style={{ background: t.color }} />
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="nd-wrap">
                  {!hasData ? (
                    <div className="nd-empty">
                      <div className="nd-empty-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M12 3a9 9 0 100 18A9 9 0 0012 3z" stroke="var(--teal)" strokeWidth="1.5"/>
                          <path d="M12 7v5l3 3" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="nd-empty-title">No nutrition data yet</div>
                      <div className="nd-empty-sub">Start planning meals for {selected.name?.split(' ')[0]} to see calorie and macro trends here.</div>
                    </div>
                  ) : (
                    <div className="nd-chart-section">
                      <div className="nd-chart-meta">
                        <div>
                          <div className="nd-avgval">{weekAvg} <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text2)' }}>{nutTab.unit}/day avg</span></div>
                          <div className="nd-avgsub">This week · {nutTab.label}</div>
                          <div className="nd-avgtgt">Target: {nutTab.target} {nutTab.unit}/day</div>
                          <div className="nd-status">
                            <span className={`nd-spill ${spill.cls}`}>{spill.label}</span>
                          </div>
                        </div>
                        <div className="nd-meta-right">
                          <div className="nd-leg-wrap">
                            <div className="nd-leg-item">
                              <div className="nd-leg-line" style={{ background: nutTab.color }} />
                              <span>Intake</span>
                            </div>
                            <div className="nd-leg-item">
                              <div className="nd-leg-dash" style={{ borderTopColor: 'var(--border2)' }} />
                              <span>Target</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ marginBottom: 4 }}>
                        <NutritionChart
                          data={chartData}
                          target={nutTab.target}
                          color={nutTab.color}
                          nutrientLabel={nutTab.label}
                          unit={nutTab.unit}
                        />
                      </div>
                    </div>
                  )}

                  <div className="nd-sumrow">
                    <div className="nd-sum-cell">
                      <div className="nd-sum-lbl-wrap">
                        <span className="nd-sum-lbl">On track</span>
                        <span className="nd-tip">
                          <i className="nd-tip-ic">?</i>
                          <div className="nd-tip-bubble">Days where intake reached ≥80% of target</div>
                        </span>
                      </div>
                      <div className="nd-sum-val">{hasData ? stats.onTrack : '—'}</div>
                      <div className="nd-sum-sub">{hasData ? 'days ≥80%' : ''}</div>
                    </div>
                    <div className="nd-sum-cell">
                      <div className="nd-sum-lbl-wrap">
                        <span className="nd-sum-lbl">Over target</span>
                        <span className="nd-tip">
                          <i className="nd-tip-ic">?</i>
                          <div className="nd-tip-bubble">Days where intake exceeded the daily target</div>
                        </span>
                      </div>
                      <div className="nd-sum-val" style={{ color: stats.overTarget > 0 ? 'var(--red)' : 'var(--text)' }}>
                        {hasData ? stats.overTarget : '—'}
                      </div>
                    </div>
                    <div className="nd-sum-cell">
                      <div className="nd-sum-lbl-wrap">
                        <span className="nd-sum-lbl">Highest</span>
                        <span className="nd-tip">
                          <i className="nd-tip-ic">?</i>
                          <div className="nd-tip-bubble">Peak intake day in this period</div>
                        </span>
                      </div>
                      <div className="nd-sum-val">{hasData && stats.highest != null ? stats.highest : '—'}</div>
                      <div className="nd-sum-sub">{hasData && stats.highestDay ? stats.highestDay : ''}</div>
                    </div>
                    <div className="nd-sum-cell">
                      <div className="nd-sum-lbl-wrap">
                        <span className="nd-sum-lbl">Lowest</span>
                        <span className="nd-tip">
                          <i className="nd-tip-ic">?</i>
                          <div className="nd-tip-bubble">Lowest intake day in this period</div>
                        </span>
                      </div>
                      <div className="nd-sum-val">{hasData && stats.lowest != null ? stats.lowest : '—'}</div>
                      <div className="nd-sum-sub">{hasData && stats.lowestDay ? stats.lowestDay : ''}</div>
                    </div>
                    <div className="nd-sum-cell">
                      <div className="nd-sum-lbl-wrap">
                        <span className="nd-sum-lbl">Avg vs target</span>
                        <span className="nd-tip">
                          <i className="nd-tip-ic">?</i>
                          <div className="nd-tip-bubble">Average daily intake as % of the recommended target</div>
                        </span>
                      </div>
                      <div className="nd-sum-val">{hasData ? `${stats.avgPct}%` : '—'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
