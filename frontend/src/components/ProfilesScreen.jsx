import { useState, useEffect, useCallback } from 'react';
import NutritionChart from './NutritionChart';
import DateRangePicker from './DateRangePicker';
import * as api from '../services/api';
import { trackProfileSaved, trackConditionChanged, trackDinerAdded, trackDinerRemoved } from '../services/analytics';

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
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toDateStr(d) {
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}

function toWeekStart(d) { return toDateStr(getMonday(d)); }

function getWeeksInRange(startMonday, endDate) {
  const weeks = [];
  let cur = new Date(startMonday);
  while (cur <= endDate) { weeks.push(new Date(cur)); cur = addDays(cur, 7); }
  return weeks;
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

// Base nutrient tab definitions — actual targets come from backend via getRecommendedLimits()
const NUTRIENT_TABS = [
  { key: 'calories', label: 'Calories', unit: 'kcal', color: '#B45309', fallback: 2000, higherIsBetter: true },
  { key: 'sodium',   label: 'Sodium',   unit: 'mg',   color: '#0369A1', fallback: 2000, higherIsBetter: false },
  { key: 'sugar',    label: 'Sugar',    unit: 'g',    color: '#BE185D', fallback: 50,   higherIsBetter: false },
  { key: 'protein',  label: 'Protein',  unit: 'g',    color: '#0B2240', fallback: 60,   higherIsBetter: true  },
  { key: 'fat',      label: 'Fat',      unit: 'g',    color: '#6D3FA0', fallback: 65,   higherIsBetter: false },
];

// Derive per-diner adjusted targets from backend-provided recommended limits
function getDinerTabs(backendTargets) {
  return NUTRIENT_TABS.map(t => {
    const target = backendTargets?.[t.key] || t.fallback;
    return { ...t, target, baseTarget: t.fallback };
  });
}

const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];


function buildStats(chartData, target) {
  const values = chartData.map(d => d.value);
  const nonZero = values.filter(v => v > 0);
  const onTrack    = values.filter(v => v >= target * 0.8).length;
  const overTarget = values.filter(v => v > target).length;
  const maxVal = nonZero.length ? Math.max(...nonZero) : 0;
  const minVal = nonZero.length ? Math.min(...nonZero) : 0;
  const highest  = nonZero.length ? Math.round(maxVal) : null;
  const lowest   = nonZero.length ? Math.round(minVal) : null;
  const avg      = nonZero.length ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 0;
  const avgPct   = target ? Math.round((avg / target) * 100) : 0;
  const highestDay = highest != null ? chartData[values.indexOf(maxVal)]?.label : null;
  const lowestDay  = lowest  != null ? chartData[values.indexOf(minVal)]?.label  : null;
  return { onTrack, overTarget, highest, lowest, highestDay, lowestDay, avg: Math.round(avg), avgPct };
}

function buildStatusSpill(avgPct, higherIsBetter) {
  if (higherIsBetter) {
    if (avgPct >= 80) return { cls: 'nd-spill-green', label: 'On track' };
    if (avgPct >= 50) return { cls: 'nd-spill-amber', label: 'Below target' };
    return { cls: 'nd-spill-red', label: 'Well below' };
  } else {
    if (avgPct > 100) return { cls: 'nd-spill-red', label: 'Over target' };
    if (avgPct >= 75) return { cls: 'nd-spill-amber', label: 'Approaching limit' };
    return { cls: 'nd-spill-teal', label: 'Within limit' };
  }
}

function buildInsight(name, nutTab, avg, tgt, pct, onTrack, over, vals, isWeek) {
  const period = isWeek ? 'this week' : 'this month';
  const periodUnit = isWeek ? 'day' : 'week';
  const { label, unit, higherIsBetter } = nutTab;
  const nutName = label.toLowerCase();
  if (higherIsBetter) {
    if (pct >= 90) return `<strong>${name}</strong> is hitting the ${nutName} target well — averaging <strong>${avg.toLocaleString()} ${unit}</strong> per ${periodUnit} ${period}.`;
    if (pct >= 60) return `<strong>${name}</strong>'s ${nutName} is below target — averaging <strong>${avg.toLocaleString()} ${unit}</strong> vs ${tgt.toLocaleString()} ${unit} goal.`;
    return `<strong>${name}</strong> has very low ${nutName} ${period}. Consider adding more meals to reach the <strong>${tgt.toLocaleString()} ${unit}</strong> daily goal.`;
  } else {
    if (over > 0) return `${nutName.charAt(0).toUpperCase() + nutName.slice(1)} exceeded the limit on <strong>${over} ${over === 1 ? periodUnit : periodUnit + 's'}</strong> ${period}. Target is <strong>${tgt.toLocaleString()} ${unit}</strong>.`;
    if (pct >= 75) return `${nutName.charAt(0).toUpperCase() + nutName.slice(1)} is approaching the daily limit — at <strong>${pct}%</strong> of the <strong>${tgt.toLocaleString()} ${unit}</strong> target.`;
    return `${nutName.charAt(0).toUpperCase() + nutName.slice(1)} is within the healthy range — <strong>${pct}%</strong> of the <strong>${tgt.toLocaleString()} ${unit}</strong> limit ${period}.`;
  }
}

export default function ProfilesScreen({ diners, activeDiner, onSelectDiner, onAddDiner, onEditDiner, onDinersChanged, onViewPlan }) {
  const [selected,     setSelected]     = useState(activeDiner || diners[0] || null);
  const [ndNut,        setNdNut]        = useState('calories');

  // Range filter state
  const [rangeMode,    setRangeMode]    = useState('week');
  const [rangeOffset,  setRangeOffset]  = useState(0);
  const [customStart,  setCustomStart]  = useState(() => toWeekStart(new Date()));
  const [customEnd,    setCustomEnd]    = useState(() => toDateStr(addDays(getMonday(new Date()), 6)));
  const [showPicker,   setShowPicker]   = useState(false);

  // Raw data: array of { label, nutrients, active, hasMeals }
  const [rawPoints,    setRawPoints]    = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [backendTargets, setBackendTargets] = useState(null);

  useEffect(() => {
    setSelected(activeDiner || diners[0] || null);
  }, [activeDiner, diners]);

  // Load condition-aware nutrient targets from backend
  useEffect(() => {
    if (!selected?.userId) return;
    api.getRecommendedLimits(selected.userId).then(res => {
      if (res?.recommended) setBackendTargets(res.recommended);
    }).catch(() => {});
  }, [selected?.userId]);

  // Reset offset when switching modes
  const handleSetRangeMode = (mode) => {
    setRangeMode(mode);
    setRangeOffset(0);
  };

  const loadChartData = useCallback(async () => {
    if (!selected?.userId) return;
    setChartLoading(true);
    try {
      const today = new Date(); today.setHours(0, 0, 0, 0);

      if (rangeMode === 'week') {
        const monday = getMonday(addDays(new Date(), rangeOffset * 7));
        const res = await api.getWeekNutrients(selected.userId, toWeekStart(monday));
        const daily = res?.daily || [];
        const points = DAY_ABBR.map((lbl, i) => {
          const dayDate = addDays(monday, i); dayDate.setHours(0, 0, 0, 0);
          const dayData = daily.find(d => d.dayIndex === i);
          return {
            label: lbl,
            nutrients: dayData?.nutrients || {},
            active: dayDate.getTime() === today.getTime(),
            hasMeals: dayData?.hasMeals || false,
          };
        });
        setRawPoints(points);

      } else if (rangeMode === 'month') {
        const ref = new Date(today.getFullYear(), today.getMonth() + rangeOffset, 1);
        const lastDay = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
        const firstMonday = getMonday(ref);
        const monthStart = firstMonday;
        const weeks = getWeeksInRange(monthStart, lastDay);
        const responses = await Promise.all(
          weeks.map(w => api.getWeekNutrients(selected.userId, toWeekStart(w)))
        );
        // Expand to daily points for continuous bars
        const dailyPoints = [];
        weeks.forEach((monday, wi) => {
          const daily = responses[wi]?.daily || [];
          for (let d = 0; d < 7; d++) {
            const dayDate = addDays(monday, d);
            if (dayDate > lastDay) break;
            if (dayDate < ref) continue;
            const dayData = daily.find(dd => dd.dayIndex === d);
            dailyPoints.push({
              label: dayDate.getDate() === 1 ? dayDate.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' }) : String(dayDate.getDate()),
              nutrients: dayData?.nutrients || {},
              active: dayDate.getTime() === today.getTime(),
              hasMeals: dayData?.hasMeals || false,
            });
          }
        });
        setRawPoints(dailyPoints);

      } else if (rangeMode === 'custom' && customStart && customEnd) {
        const startDate = new Date(customStart); startDate.setHours(0,0,0,0);
        const endDate   = new Date(customEnd);   endDate.setHours(0,0,0,0);
        if (endDate < startDate) { setRawPoints([]); return; }
        const firstMonday = getMonday(startDate);
        const startMonday = firstMonday;
        const weeks = getWeeksInRange(startMonday, endDate).slice(0, 12);
        const responses = await Promise.all(
          weeks.map(w => api.getWeekNutrients(selected.userId, toWeekStart(w)))
        );
        // Expand to daily points
        const dailyPoints = [];
        weeks.forEach((monday, wi) => {
          const daily = responses[wi]?.daily || [];
          for (let d = 0; d < 7; d++) {
            const dayDate = addDays(monday, d);
            if (dayDate > endDate) break;
            if (dayDate < startDate) continue;
            const dayData = daily.find(dd => dd.dayIndex === d);
            dailyPoints.push({
              label: dayDate.getDate() === 1 ? dayDate.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' }) : String(dayDate.getDate()),
              nutrients: dayData?.nutrients || {},
              active: dayDate.getTime() === today.getTime(),
              hasMeals: dayData?.hasMeals || false,
            });
          }
        });
        setRawPoints(dailyPoints);
      }
    } catch (err) {
      console.error('Failed to load chart data:', err);
      setRawPoints([]);
    } finally {
      setChartLoading(false);
    }
  }, [selected?.userId, rangeMode, rangeOffset, customStart, customEnd]);

  useEffect(() => { loadChartData(); }, [loadChartData]);



  const handleDelete = async (diner) => {
    if (!confirm(`Delete ${diner.name}? This cannot be undone.`)) return;
    try {
      await api.deleteDiner(diner.userId);
      trackDinerRemoved();
      onDinersChanged();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Derived chart data
  const dinerTabs = getDinerTabs(backendTargets);
  const nutTab    = dinerTabs.find(t => t.key === ndNut) || dinerTabs[0];
  const chartData = rawPoints.map(d => ({ label: d.label, value: d.nutrients?.[ndNut] || 0, active: d.active }));
  const hasData   = chartData.some(d => d.value > 0);

  const nonZeroVals = chartData.filter(d => d.value > 0);
  const periodAvg   = nonZeroVals.length
    ? Math.round(nonZeroVals.reduce((s, d) => s + d.value, 0) / nonZeroVals.length)
    : 0;

  const stats    = buildStats(chartData, nutTab.target);
  const spill    = buildStatusSpill(stats.avgPct, nutTab.higherIsBetter);
  const isWeekView = rangeMode === 'week';
  const insightHtml = hasData
    ? buildInsight(selected?.name?.split(' ')[0] || 'User', nutTab, stats.avg, nutTab.target, stats.avgPct, stats.onTrack, stats.overTarget, chartData.map(d => d.value), isWeekView)
    : null;

  const selectedIdx = diners.findIndex(d => d.userId === selected?.userId);
  const avCls = AV_CLASSES[selectedIdx % AV_CLASSES.length] || 'dcav-t';

  const conditions = parseTags(selected?.conditions);
  const diet       = parseTags(selected?.diet);
  const allergies  = parseTags(selected?.allergies);

  // Period label for nav pill
  const rangePeriodLabel = (() => {
    if (rangeMode === 'week') {
      if (rangeOffset === 0) return 'This week';
      if (rangeOffset === -1) return 'Last week';
      const m = getMonday(addDays(new Date(), rangeOffset * 7));
      return m.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
    }
    if (rangeMode === 'month') {
      if (rangeOffset === 0) return 'This month';
      const d = new Date(new Date().getFullYear(), new Date().getMonth() + rangeOffset, 1);
      return d.toLocaleDateString('en-SG', { month: 'short', year: 'numeric' });
    }
    return '';
  })();

  const periodUnit = rangeMode === 'week' ? 'days' : 'weeks';


  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '16px 18px' }}>
      <div style={{ maxWidth: '80%', margin: '0 auto', paddingTop: 4 }}>

        {/* Main panel */}
        <div className="prof-panel">
          {selected ? (
            <>
              {/* Card 1: Person header + health profile (consolidated) */}
              <div className="prof-card" style={{ borderLeft: '3px solid var(--teal)' }}>
                <div style={{ padding: '14px 16px' }}>
                  {/* Row 1: avatar + name + stats + actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className={`dcav ${avCls}`} style={{ width: 48, height: 48, fontSize: 15, flexShrink: 0 }}>
                      {avatarLabel(selected.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <div style={{ fontFamily: 'var(--display)', fontSize: 17, fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>
                          {selected.name}
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                          {[selected.age && `${selected.age}y`, selected.sex, selected.weightKg && `${selected.weightKg}kg`].filter(Boolean).join(' · ')}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button className="btn btn-navy" style={{ fontSize: 11, padding: '7px 14px' }} onClick={() => onViewPlan(selected)}>
                        View plan →
                      </button>
                      <button className="btn btn-outline" style={{ fontSize: 11, padding: '7px 12px' }} onClick={() => onEditDiner(selected)}>
                        Edit
                      </button>
                      {selected.userId !== diners[0]?.userId && (
                        <button
                          onClick={() => handleDelete(selected)}
                          title="Delete diner"
                          style={{ width: 32, height: 32, borderRadius: 'var(--r-xs)', border: '1px solid var(--border2)', background: 'var(--white)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', flexShrink: 0, transition: 'all .15s' }}
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
                {/* Health / Diet / Allergens — inline row within same card */}
                <div style={{ borderTop: '1px solid var(--border)', padding: '10px 16px', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)' }}>Health</span>
                    {conditions.length === 0
                      ? <span className="tag tg-green" style={{ fontSize: 10 }}>No conditions</span>
                      : conditions.map(c => <span key={c} className={`tag ${conditionTagClass(c)}`} style={{ fontSize: 10 }}>{c}</span>)
                    }
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)' }}>Diet</span>
                    {diet.length === 0
                      ? <span className="tag tg-muted" style={{ fontSize: 10 }}>No restriction</span>
                      : diet.map(d => <span key={d} className="tag tg-teal" style={{ fontSize: 10 }}>{d}</span>)
                    }
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)' }}>Allergies</span>
                    {allergies.length === 0
                      ? <span className="tag tg-muted" style={{ fontSize: 10 }}>None</span>
                      : allergies.map(a => <span key={a} className="tag tg-amber" style={{ fontSize: 10 }}>{a}</span>)
                    }
                  </div>
                </div>
              </div>



              {/* Card 3: Nutrition dashboard */}
              {hasData ? (
              <div className="prof-card">

                {/* Range filter row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                  {['week', 'month', 'custom'].map(mode => (
                    <button
                      key={mode}
                      className={`nd-range-pill${rangeMode === mode ? ' active' : ''}`}
                      onClick={() => handleSetRangeMode(mode)}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                  {rangeMode === 'custom' && (
                    <div style={{ position: 'relative', marginLeft: 8 }}>
                      {/* Single trigger button showing selected range */}
                      <button
                        onClick={() => setShowPicker(v => !v)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          fontSize: 11, fontWeight: 600, padding: '4px 10px',
                          border: `1.5px solid ${showPicker ? 'var(--teal)' : 'var(--border2)'}`,
                          borderRadius: 7, background: showPicker ? 'var(--teal-xl)' : 'var(--white)',
                          color: 'var(--text)', cursor: 'pointer', fontFamily: 'var(--font)',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <rect x="1" y="3" width="14" height="12" rx="2" stroke="var(--text3)" strokeWidth="1.5"/>
                          <path d="M5 1v4M11 1v4M1 7h14" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        {customStart && customEnd ? (() => {
                          const s = new Date(customStart), e = new Date(customEnd);
                          const days = Math.round((e - s) / 86400000) + 1;
                          const fmt = d => d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
                          return <>{fmt(s)}<span style={{ color: 'var(--text3)' }}>→</span>{fmt(e)}<span style={{ color: 'var(--teal)', fontWeight: 700 }}>{days}d</span></>;
                        })() : 'Select dates'}
                      </button>

                      {/* Calendar popover */}
                      {showPicker && (
                        <DateRangePicker
                          startDate={customStart}
                          endDate={customEnd}
                          onChange={({ start, end }) => { setCustomStart(start); setCustomEnd(end); }}
                          onClose={() => setShowPicker(false)}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Nutrient tabs */}
                <div className="nd-tabs-row">
                  {dinerTabs.map(t => (
                    <button
                      key={t.key}
                      className={`nd-tab${ndNut === t.key ? ' nd-active' : ''}`}
                      style={{ borderBottomColor: ndNut === t.key ? t.color : 'transparent' }}
                      onClick={() => setNdNut(t.key)}
                    >
                      <div className="nd-dot" style={{ background: t.color }} />
                      {t.label}
                      {t.flag && (
                        <span
                          className="nd-flag"
                          style={{
                            background: t.key === 'fat' ? '#F3EEFF' : '#FEE2E2',
                            color: t.key === 'fat' ? '#6D3FA0' : '#DC2626',
                          }}
                        >
                          {t.flag}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="nd-wrap">
                  {/* Insight banner */}
                  {insightHtml && (
                    <div className="nd-insight" dangerouslySetInnerHTML={{ __html: insightHtml }} />
                  )}

                  {/* Chart meta header — always visible so period nav never disappears */}
                  <div className="nd-chart-section" style={{ paddingBottom: 8 }}>
                    <div className="nd-chart-meta">
                      {/* Left: avg stats — only shown when there is data */}
                      <div>
                        {hasData && !chartLoading && (
                          <>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                              <div className="nd-avgval">{periodAvg.toLocaleString()}</div>
                              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>{nutTab.unit}</span>
                            </div>
                            <div className="nd-avgsub" style={{ marginTop: 2 }}>
                              avg per {isWeekView ? 'day' : 'week'}
                            </div>
                            <div style={{ marginTop: 10 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                                <div style={{ width: 120, height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden', flexShrink: 0 }}>
                                  <div style={{
                                    height: '100%', borderRadius: 3,
                                    width: `${Math.min(stats.avgPct, 100)}%`,
                                    background: spill.cls === 'nd-spill-green' ? 'var(--teal)'
                                      : spill.cls === 'nd-spill-red' ? 'var(--red)'
                                      : spill.cls === 'nd-spill-amber' ? 'var(--amber, #D97706)'
                                      : 'var(--teal)',
                                    transition: 'width .4s ease',
                                  }} />
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{stats.avgPct}%</span>
                                <span className={`nd-spill ${spill.cls}`}>{spill.label}</span>
                              </div>
                              <div className="nd-avgtgt">
                                of {nutTab.target.toLocaleString()} {nutTab.unit} {nutTab.higherIsBetter ? 'daily target' : 'daily limit'}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      {/* Right: period nav + legend — always visible */}
                      <div className="nd-meta-right">
                        {rangeMode !== 'custom' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <button className="nd-range-nav-btn" onClick={() => setRangeOffset(o => o - 1)}>‹</button>
                            <span className="nd-range-period" style={{ minWidth: 72 }}>{rangePeriodLabel}</span>
                            <button
                              className="nd-range-nav-btn"
                              onClick={() => setRangeOffset(o => o + 1)}
                              disabled={rangeOffset >= 0}
                              style={{ opacity: rangeOffset >= 0 ? 0.35 : 1 }}
                            >›</button>
                          </div>
                        )}
                        <div className="nd-leg-wrap">
                          <div className="nd-leg-item">
                            <div className="nd-leg-line" style={{ background: nutTab.color }} />
                            <span>Intake</span>
                          </div>
                          <div className="nd-leg-item">
                            <div className="nd-leg-dash" style={{ borderColor: nutTab.color }} />
                            <span>Target</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chart body — conditional on data/loading */}
                  {chartLoading ? (
                    <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 11, color: 'var(--text3)' }}>
                      Loading…
                    </div>
                  ) : hasData ? (
                    <>
                      <div style={{ padding: '0 20px 4px' }}>
                        <NutritionChart
                          data={chartData}
                          target={nutTab.target}
                          color={nutTab.color}
                          higherIsBetter={nutTab.higherIsBetter}
                          unit={nutTab.unit}
                        />
                      </div>
                      {/* Bar-state legend */}
                      <div className="nd-bar-legend">
                        {nutTab.higherIsBetter ? (
                          <>
                            <div className="nd-bl-item"><div className="nd-bl-swatch" style={{ background: '#069B8E' }} />On track (≥90% of target)</div>
                            <div className="nd-bl-item"><div className="nd-bl-swatch" style={{ background: `rgba(${parseInt(nutTab.color.slice(1,3),16)},${parseInt(nutTab.color.slice(3,5),16)},${parseInt(nutTab.color.slice(5,7),16)},0.38)` }} />Below target</div>
                            <div className="nd-bl-item"><div className="nd-bl-swatch" style={{ background: `rgba(${parseInt(nutTab.color.slice(1,3),16)},${parseInt(nutTab.color.slice(3,5),16)},${parseInt(nutTab.color.slice(5,7),16)},0.10)`, border: '1px solid #E8EDF3' }} />Not planned</div>
                          </>
                        ) : (
                          <>
                            <div className="nd-bl-item"><div className="nd-bl-swatch" style={{ background: `rgba(${parseInt(nutTab.color.slice(1,3),16)},${parseInt(nutTab.color.slice(3,5),16)},${parseInt(nutTab.color.slice(5,7),16)},0.80)` }} />Within limit</div>
                            <div className="nd-bl-item"><div className="nd-bl-swatch" style={{ background: `rgba(${parseInt(nutTab.color.slice(1,3),16)},${parseInt(nutTab.color.slice(3,5),16)},${parseInt(nutTab.color.slice(5,7),16)},0.55)` }} />Approaching limit (≥75%)</div>
                            <div className="nd-bl-item"><div className="nd-bl-swatch" style={{ background: 'rgba(220,38,38,0.75)' }} />Over limit</div>
                            <div className="nd-bl-item"><div className="nd-bl-swatch" style={{ background: `rgba(${parseInt(nutTab.color.slice(1,3),16)},${parseInt(nutTab.color.slice(3,5),16)},${parseInt(nutTab.color.slice(5,7),16)},0.10)`, border: '1px solid #E8EDF3' }} />Not planned</div>
                          </>
                        )}
                        <div style={{ flex: 1 }} />
                        <div className="nd-bl-item" style={{ color: 'var(--text2)', fontWeight: 600 }}>
                          <span style={{ letterSpacing: 3, fontSize: 10, color: 'var(--teal)' }}>- - -</span>&ensp;dashed line = daily target
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="nd-empty">
                      <div className="nd-empty-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M12 3a9 9 0 100 18A9 9 0 0012 3z" stroke="var(--teal)" strokeWidth="1.5"/>
                          <path d="M12 7v5l3 3" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="nd-empty-title">No meals planned for this period</div>
                      <div className="nd-empty-sub">Navigate to a different week or add meals to your plan to see nutrition trends.</div>
                    </div>
                  )}

                  <div className="nd-sumrow">
                    <div className="nd-sum-cell">
                      <div className="nd-sum-lbl-wrap">
                        <span className="nd-sum-lbl">On track</span>
                        <span className="nd-tip"><i className="nd-tip-ic">?</i><div className="nd-tip-bubble">Number of {periodUnit} where intake reached at least 80% of the daily target — close enough to count as a good day.</div></span>
                      </div>
                      <div className="nd-sum-val">{hasData ? stats.onTrack : '—'}</div>
                      <div className="nd-sum-sub">{hasData ? `of ${chartData.length} ${chartData.length === 1 ? periodUnit.replace(/s$/, '') : periodUnit}` : ''}</div>
                    </div>
                    <div className="nd-sum-cell">
                      <div className="nd-sum-lbl-wrap">
                        <span className="nd-sum-lbl">Over target</span>
                        <span className="nd-tip"><i className="nd-tip-ic">?</i><div className="nd-tip-bubble">Number of {periodUnit} where intake exceeded the recommended limit. For calories and protein, going over may mean excess. For fat, sodium and sugar, it signals a health risk.</div></span>
                      </div>
                      <div className="nd-sum-val" style={{ color: stats.overTarget > 0 ? 'var(--red)' : 'var(--text)' }}>
                        {hasData ? stats.overTarget : '—'}
                      </div>
                    </div>
                    <div className="nd-sum-cell">
                      <div className="nd-sum-lbl-wrap">
                        <span className="nd-sum-lbl">Highest</span>
                        <span className="nd-tip"><i className="nd-tip-ic">?</i><div className="nd-tip-bubble">The single highest intake recorded in this period. A very high reading may indicate a heavy meal day or data from multiple meals being counted.</div></span>
                      </div>
                      <div className="nd-sum-val">{hasData && stats.highest != null ? stats.highest : '—'}</div>
                      <div className="nd-sum-sub">{hasData && stats.highestDay ? stats.highestDay : ''}</div>
                    </div>
                    <div className="nd-sum-cell">
                      <div className="nd-sum-lbl-wrap">
                        <span className="nd-sum-lbl">Lowest</span>
                        <span className="nd-tip"><i className="nd-tip-ic">?</i><div className="nd-tip-bubble">The single lowest non-zero intake in this period. A very low reading usually means only one or two meals were planned that day.</div></span>
                      </div>
                      <div className="nd-sum-val">{hasData && stats.lowest != null ? stats.lowest : '—'}</div>
                      <div className="nd-sum-sub">{hasData && stats.lowestDay ? stats.lowestDay : ''}</div>
                    </div>
                    <div className="nd-sum-cell nd-sum-cell-accent">
                      <div className="nd-sum-lbl-wrap">
                        <span className="nd-sum-lbl">Avg vs target</span>
                        <span className="nd-tip"><i className="nd-tip-ic">?</i><div className="nd-tip-bubble tip-right">Your average intake expressed as a percentage of the daily target. 100% means you hit the goal exactly. Below 80% suggests under-eating; above 110% suggests excess.</div></span>
                      </div>
                      <div className="nd-sum-val" style={{ color: hasData ? `var(--teal)` : 'var(--text)' }}>{hasData ? `${stats.avgPct}%` : '—'}</div>
                    </div>
                  </div>
                </div>
              </div>
              ) : (
              <div className="prof-card" style={{ padding: '32px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📊</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>No nutrition data yet</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.5 }}>
                  Plan some meals to start tracking nutrition trends.
                </div>
                <button
                  className="btn btn-navy"
                  style={{ fontSize: 11, padding: '7px 16px', marginTop: 14 }}
                  onClick={() => onViewPlan(selected)}
                >
                  Plan meals →
                </button>
              </div>
              )}
            </>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
