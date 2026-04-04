import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceArea, ReferenceLine,
} from 'recharts';
import * as api from '../services/api';
import DateRangePicker from './DateRangePicker';

// ── Healthy range constants ──
const RANGES = {
  bloodSugar: { low: 3.9, high: 5.6, label: '3.9–5.6 mmol/L (normal fasting)' },
  systolic:   { low: 90,  high: 120, label: '90–120 mmHg' },
  diastolic:  { low: 60,  high: 80,  label: '60–80 mmHg' },
  totalChol:  { high: 5.2, label: '< 5.2 mmol/L' },
  ldl:        { high: 2.6, label: '< 2.6 mmol/L' },
  hdl:        { low: 1.0,  label: '> 1.0 mmol/L' },
  trigly:     { high: 1.7, label: '< 1.7 mmol/L' },
};

// #5 - More distinct colors for cholesterol lines
const COLORS = {
  bloodSugar: '#069B8E',
  systolic: '#1560A0',
  diastolic: '#6D3FA0',
  totalChol: '#D95F3B',   // orange-red
  ldl: '#B91C8C',         // magenta/pink — very distinct from orange
  hdl: '#22C55E',         // green
  trigly: '#2563EB',      // blue — very distinct from orange & pink
};

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];
const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };
const MEAL_EMOJI = { breakfast: '☀️', lunch: '🌿', dinner: '🌙' };

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getMonday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function CustomTooltip({ active, payload, label, mealsByDate, dishDetails }) {
  if (!active || !payload?.length) return null;
  // Find the date string for this label from the chart data
  const dateStr = payload[0]?.payload?.date;
  const dayMeals = dateStr && mealsByDate ? mealsByDate[dateStr] : null;

  return (
    <div style={{
      background: '#0F172A', color: '#fff', borderRadius: 8,
      padding: '10px 14px', fontFamily: 'var(--font)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      maxWidth: 280,
      position: 'relative',
      zIndex: 1000,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6, color: 'rgba(255,255,255,0.6)' }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 500 }}>{p.name}:</span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
      {dayMeals && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          {MEAL_TYPES.map(mt => {
            const entries = dayMeals[mt];
            if (!entries?.length) return null;
            return (
              <div key={mt} style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 1 }}>
                  {MEAL_EMOJI[mt]} {MEAL_LABELS[mt]}
                </div>
                {entries.map((e, i) => {
                  const dish = dishDetails ? dishDetails[e.dishId] : null;
                  const name = e.dishName || dish?.name || e.dishId || 'Unknown';
                  return <div key={i} style={{ fontSize: 11, fontWeight: 500, color: '#fff', paddingLeft: 4 }}>{name}</div>;
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// #2 - Improved healthy range visibility: deeper fill + dotted min/max lines
function HealthChart({ title, data, lines, unit, referenceAreas, referenceLines, rangeLabel, mealsByDate, dishDetails }) {
  const hasData = data.some(d => lines.some(l => d[l.key] != null));
  return (
    <div className="ht-chart-card">
      <div className="ht-chart-hdr">
        <div>
          <div className="ht-chart-title">{title}</div>
          <div className="ht-chart-unit">{unit}</div>
        </div>
        {rangeLabel && (
          <div className="ht-range-label">
            <span className="ht-range-dot" />
            Healthy: {rangeLabel}
          </div>
        )}
      </div>
      {!hasData ? (
        <div className="ht-chart-empty">
          <div style={{ fontSize: 28, marginBottom: 6 }}>📊</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>No data yet</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Add measurements to see trends here</div>
        </div>
      ) : (
        <div style={{ width: '100%', height: 220, overflow: 'visible' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#8A9BB0' }} />
              <YAxis tick={{ fontSize: 10, fill: '#8A9BB0' }} width={40} />
              <Tooltip content={<CustomTooltip mealsByDate={mealsByDate} dishDetails={dishDetails} />} wrapperStyle={{ zIndex: 1000 }} />
              {referenceAreas?.map((ra, i) => (
                <ReferenceArea key={i} y1={ra.y1} y2={ra.y2} fill={ra.fill} />
              ))}
              {referenceLines?.map((rl, i) => (
                <ReferenceLine
                  key={i}
                  y={rl.y}
                  stroke={rl.stroke || '#069B8E'}
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                  strokeOpacity={0.8}
                  label={rl.label ? { value: rl.label, position: 'right', fontSize: 9, fill: rl.stroke || '#069B8E', fontWeight: 600 } : undefined}
                />
              ))}
              {lines.map(l => (
                <Line
                  key={l.key}
                  type="monotone"
                  dataKey={l.key}
                  name={l.name}
                  stroke={l.color}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: l.color, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: l.color, strokeWidth: 2, stroke: '#fff' }}
                  connectNulls
                />
              ))}
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: 10, fontWeight: 600, paddingTop: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}



export default function HealthTrackerScreen({ activeDiner, userId }) {
  const [range, setRange] = useState('7d');
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mealsByDate, setMealsByDate] = useState({});
  const [dishDetails, setDishDetails] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [customStart, setCustomStart] = useState(() => toDateStr(new Date()));
  const [customEnd, setCustomEnd] = useState(() => toDateStr(new Date()));
  const [showPicker, setShowPicker] = useState(false);

  // Form state — #4: removed formTime
  const [formDate, setFormDate] = useState(toDateStr(new Date()));
  const [formBS, setFormBS] = useState('');
  const [formSys, setFormSys] = useState('');
  const [formDia, setFormDia] = useState('');
  const [formTC, setFormTC] = useState('');
  const [formLDL, setFormLDL] = useState('');
  const [formHDL, setFormHDL] = useState('');
  const [formTG, setFormTG] = useState('');
  const [showCholDetail, setShowCholDetail] = useState(false);


  const getDateRange = useCallback(() => {
    if (range === 'custom' && customStart && customEnd) {
      return { from: customStart, to: customEnd };
    }
    const to = new Date();
    const from = new Date();
    if (range === '7d') from.setDate(from.getDate() - 6);
    else if (range === '30d') from.setDate(from.getDate() - 29);
    // Extend range to include the form date if it's in the future
    const fd = new Date(formDate + 'T00:00:00');
    if (fd > to) to.setTime(fd.getTime());
    return { from: toDateStr(from), to: toDateStr(to) };
  }, [range, customStart, customEnd, formDate]);

  const loadMetrics = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { from, to } = getDateRange();
      const data = await api.getHealthMetrics(userId, from, to);
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load health metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, getDateRange]);

  useEffect(() => { loadMetrics(); }, [loadMetrics]);

  // Load meal plans for dates in the range
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    async function loadMeals() {
      const { from, to } = getDateRange();
      const fromDate = new Date(from + 'T00:00:00');
      const toDate = new Date(to + 'T00:00:00');
      const meals = {};
      const details = {};

      const weekStarts = new Set();
      let d = new Date(fromDate);
      while (d <= toDate) {
        const mon = getMonday(d);
        weekStarts.add(toDateStr(mon));
        d.setDate(d.getDate() + 7);
      }
      // Also include the week that contains toDate
      weekStarts.add(toDateStr(getMonday(toDate)));

      for (const ws of weekStarts) {
        try {
          const plan = await api.getMealPlan(userId, ws);
          if (!plan) continue;
          const wsDate = new Date(ws + 'T00:00:00');
          for (const [dayIdx, dayMeals] of Object.entries(plan)) {
            if (isNaN(Number(dayIdx))) continue;
            if (!dayMeals || typeof dayMeals !== 'object') continue;
            const entryDate = new Date(wsDate);
            entryDate.setDate(entryDate.getDate() + Number(dayIdx));
            const dateStr = toDateStr(entryDate);
            if (dateStr < from || dateStr > to) continue;

            const dayEntries = {};
            for (const [mt, entries] of Object.entries(dayMeals)) {
              if (Array.isArray(entries) && entries.length > 0) {
                dayEntries[mt] = entries;
                for (const e of entries) {
                  if (e.dishId && !details[e.dishId]) {
                    try {
                      details[e.dishId] = await api.getDishDetail(e.dishId);
                    } catch { /* skip — we fall back to e.dishName */ }
                  }
                }
              }
            }
            if (Object.keys(dayEntries).length > 0) {
              meals[dateStr] = dayEntries;
            }
          }
        } catch { /* skip */ }
      }
      if (!cancelled) {
        setMealsByDate(meals);
        setDishDetails(prev => ({ ...prev, ...details }));
      }
    }
    loadMeals();
    return () => { cancelled = true; };
  }, [userId, getDateRange]);

  const doSave = useCallback(async () => {
    if (!formBS && !formSys && !formDia && !formTC && !formLDL && !formHDL && !formTG) return;
    if (saving) return;
    setSaving(true);
    try {
      await api.addHealthMetric(userId, {
        date: formDate,
        blood_sugar: formBS ? parseFloat(formBS) : null,
        systolic_bp: formSys ? parseFloat(formSys) : null,
        diastolic_bp: formDia ? parseFloat(formDia) : null,
        total_cholesterol: formTC ? parseFloat(formTC) : null,
        ldl: formLDL ? parseFloat(formLDL) : null,
        hdl: formHDL ? parseFloat(formHDL) : null,
        triglycerides: formTG ? parseFloat(formTG) : null,
      });
      // Clear form after successful save so user can enter next day's data
      setFormBS('');
      setFormSys('');
      setFormDia('');
      setFormTC('');
      setFormLDL('');
      setFormHDL('');
      setFormTG('');
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
      await loadMetrics();
    } catch (err) {
      console.error('Failed to save health metric:', err);
    } finally {
      setSaving(false);
    }
  }, [formDate, formBS, formSys, formDia, formTC, formLDL, formHDL, formTG, saving, userId, loadMetrics]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doSave();
    }
  }, [doSave]);

  // Build chart data
  const chartData = (() => {
    const byDate = {};
    for (const m of metrics) {
      const d = m.date;
      if (!byDate[d]) byDate[d] = { ...m };
      else {
        for (const k of ['blood_sugar', 'systolic_bp', 'diastolic_bp', 'total_cholesterol', 'ldl', 'hdl', 'triglycerides']) {
          if (m[k] != null) byDate[d][k] = m[k];
        }
      }
    }

    for (const dateStr of Object.keys(mealsByDate)) {
      if (!byDate[dateStr]) {
        byDate[dateStr] = { date: dateStr };
      }
    }

    return Object.keys(byDate)
      .sort()
      .map(d => ({
        date: d,
        label: formatDateLabel(d),
        bloodSugar: byDate[d].blood_sugar ?? null,
        systolic: byDate[d].systolic_bp ?? null,
        diastolic: byDate[d].diastolic_bp ?? null,
        totalChol: byDate[d].total_cholesterol ?? null,
        ldl: byDate[d].ldl ?? null,
        hdl: byDate[d].hdl ?? null,
        trigly: byDate[d].triglycerides ?? null,
      }));
  })();

  const rangePills = [
    { id: '7d', label: 'Week' },
    { id: '30d', label: 'Month' },
    { id: 'custom', label: 'Custom' },
  ];

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '16px 18px 20px' }}>
      <div style={{ maxWidth: '80%', margin: '0 auto' }}>

        {/* ── Input form card ── */}
        <div className="ht-form-card">
          <div className="ht-form-hdr">
            <div className="ht-form-title">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 2C5 2 3 4.5 3 7c0 3.5 4.5 6 4.5 6s4.5-2.5 4.5-6c0-2.5-2-5-4.5-5z" stroke="var(--coral)" strokeWidth="1.3" fill="none"/>
                <path d="M5.5 7h4M7.5 5v4" stroke="var(--coral)" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Record Health Metrics
            </div>
            <div className="ht-form-sub">for {activeDiner?.name || 'Diner'}</div>
          </div>

          <div className="ht-form-body">
            {savedMsg && (
              <div style={{ fontSize: 11, marginBottom: 8, fontWeight: 600, color: '#22C55E' }}>
                ✓ Saved!
              </div>
            )}

            {/* Date row — #4: removed Time field */}
            <div className="ht-form-row">
              <div className="ht-field">
                <label className="ht-field-lbl">Date</label>
                <input type="date" className="ht-field-input ht-date" value={formDate} onChange={e => setFormDate(e.target.value)} />
              </div>
            </div>

            {/* Blood Sugar */}
            <div className="ht-metric-group">
              <div className="ht-metric-label">
                <span className="ht-metric-dot" style={{ background: COLORS.bloodSugar }} />
                Fasting Blood Sugar
              </div>
              <div className="ht-field-inline">
                <input type="number" step="0.1" className="ht-field-input ht-num" value={formBS} onChange={e => setFormBS(e.target.value)} placeholder="e.g. 5.2" onKeyDown={handleKeyDown} />
                <span className="ht-field-unit">mmol/L</span>
              </div>
            </div>

            {/* Blood Pressure */}
            <div className="ht-metric-group">
              <div className="ht-metric-label">
                <span className="ht-metric-dot" style={{ background: COLORS.systolic }} />
                Blood Pressure
              </div>
              <div className="ht-bp-row">
                <div className="ht-field-inline">
                  <input type="number" className="ht-field-input ht-num" value={formSys} onChange={e => setFormSys(e.target.value)} placeholder="120" onKeyDown={handleKeyDown} />
                  <span className="ht-field-unit">systolic</span>
                </div>
                <span className="ht-bp-slash">/</span>
                <div className="ht-field-inline">
                  <input type="number" className="ht-field-input ht-num" value={formDia} onChange={e => setFormDia(e.target.value)} placeholder="80" onKeyDown={handleKeyDown} />
                  <span className="ht-field-unit">diastolic</span>
                </div>
                <span className="ht-bp-mmhg">mmHg</span>
              </div>
            </div>

            {/* Cholesterol */}
            <div className="ht-metric-group">
              <div className="ht-metric-label">
                <span className="ht-metric-dot" style={{ background: COLORS.totalChol }} />
                Cholesterol
              </div>
              <div className="ht-field-inline">
                <input type="number" step="0.1" className="ht-field-input ht-num" value={formTC} onChange={e => setFormTC(e.target.value)} placeholder="e.g. 4.8" onKeyDown={handleKeyDown} />
                <span className="ht-field-unit">Total (mmol/L)</span>
              </div>
              <button
                className="ht-chol-toggle"
                onClick={() => setShowCholDetail(v => !v)}
              >
                {showCholDetail ? '− Hide' : '+ Show'} LDL / HDL / Triglycerides
              </button>
              {showCholDetail && (
                <div className="ht-chol-details">
                  <div className="ht-field-inline">
                    <input type="number" step="0.1" className="ht-field-input ht-num" value={formLDL} onChange={e => setFormLDL(e.target.value)} placeholder="LDL" onKeyDown={handleKeyDown} />
                    <span className="ht-field-unit">mmol/L</span>
                  </div>
                  <div className="ht-field-inline">
                    <input type="number" step="0.1" className="ht-field-input ht-num" value={formHDL} onChange={e => setFormHDL(e.target.value)} placeholder="HDL" onKeyDown={handleKeyDown} />
                    <span className="ht-field-unit">mmol/L</span>
                  </div>
                  <div className="ht-field-inline">
                    <input type="number" step="0.1" className="ht-field-input ht-num" value={formTG} onChange={e => setFormTG(e.target.value)} placeholder="Triglycerides" onKeyDown={handleKeyDown} />
                    <span className="ht-field-unit">mmol/L</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={doSave}
              disabled={saving || (!formBS && !formSys && !formDia && !formTC && !formLDL && !formHDL && !formTG)}
              style={{
                marginTop: 16,
                width: '100%',
                padding: '10px 0',
                fontSize: 13,
                fontWeight: 700,
                fontFamily: 'var(--font)',
                color: '#fff',
                background: saving || (!formBS && !formSys && !formDia && !formTC && !formLDL && !formHDL && !formTG)
                  ? 'var(--text3)' : 'var(--coral)',
                border: 'none',
                borderRadius: 8,
                cursor: saving ? 'wait' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* ── Range selector + meals toggle ── */}
        <div className="ht-controls-bar">
          <div className="ht-range-pills">
            {rangePills.map(p => (
              <button
                key={p.id}
                className={`nd-range-pill${range === p.id ? ' active' : ''}`}
                onClick={() => setRange(p.id)}
              >
                {p.label}
              </button>
            ))}
            {range === 'custom' && (
              <div style={{ position: 'relative', marginLeft: 8 }}>
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
                    return <>{fmt(s)}<span style={{ color: 'var(--text3)' }}>{'\u2192'}</span>{fmt(e)}<span style={{ color: 'var(--teal)', fontWeight: 700 }}>{days}d</span></>;
                  })() : 'Select dates'}
                </button>
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
        </div>

        {loading && (
          <div style={{ padding: '20px 0', fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
            Loading health data...
          </div>
        )}

        {/* ── Charts ── */}
        {/* #2 - deeper fill, dotted boundary lines for healthy range */}
        <HealthChart
          title="Blood Sugar"
          data={chartData}
          lines={[{ key: 'bloodSugar', name: 'Blood Sugar (mmol/L)', color: COLORS.bloodSugar }]}
          unit="mmol/L"
          rangeLabel={RANGES.bloodSugar.label}
          referenceAreas={[{ y1: RANGES.bloodSugar.low, y2: RANGES.bloodSugar.high, fill: 'rgba(6,155,142,0.18)' }]}
          referenceLines={[
            { y: RANGES.bloodSugar.low, stroke: '#069B8E', label: 'Min' },
            { y: RANGES.bloodSugar.high, stroke: '#069B8E', label: 'Max' },
          ]}
          mealsByDate={mealsByDate}
          dishDetails={dishDetails}
        />

        <HealthChart
          title="Blood Pressure"
          data={chartData}
          lines={[
            { key: 'systolic', name: 'Systolic (mmHg)', color: COLORS.systolic },
            { key: 'diastolic', name: 'Diastolic (mmHg)', color: COLORS.diastolic },
          ]}
          unit="mmHg"
          rangeLabel={`Sys ${RANGES.systolic.label}, Dia ${RANGES.diastolic.label}`}
          referenceAreas={[
            { y1: RANGES.systolic.low, y2: RANGES.systolic.high, fill: 'rgba(21,96,160,0.14)' },
            { y1: RANGES.diastolic.low, y2: RANGES.diastolic.high, fill: 'rgba(109,63,160,0.14)' },
          ]}
          referenceLines={[
            { y: RANGES.systolic.low, stroke: '#1560A0' },
            { y: RANGES.systolic.high, stroke: '#1560A0' },
            { y: RANGES.diastolic.low, stroke: '#6D3FA0' },
            { y: RANGES.diastolic.high, stroke: '#6D3FA0' },
          ]}
          mealsByDate={mealsByDate}
          dishDetails={dishDetails}
        />

        <HealthChart
          title="Cholesterol"
          data={chartData}
          lines={[
            { key: 'totalChol', name: 'Total (mmol/L)', color: COLORS.totalChol },
            { key: 'ldl', name: 'LDL (mmol/L)', color: COLORS.ldl },
            { key: 'hdl', name: 'HDL (mmol/L)', color: COLORS.hdl },
            { key: 'trigly', name: 'Triglycerides (mmol/L)', color: COLORS.trigly },
          ]}
          unit="mmol/L"
          rangeLabel={`Total ${RANGES.totalChol.label}, LDL ${RANGES.ldl.label}, HDL ${RANGES.hdl.label}, TG ${RANGES.trigly.label}`}
          referenceLines={[
            { y: RANGES.totalChol.high, stroke: COLORS.totalChol, label: 'TC max' },
            { y: RANGES.ldl.high, stroke: COLORS.ldl, label: 'LDL max' },
            { y: RANGES.trigly.high, stroke: COLORS.trigly, label: 'TG max' },
            { y: RANGES.hdl.low, stroke: COLORS.hdl, label: 'HDL min' },
          ]}
          mealsByDate={mealsByDate}
          dishDetails={dishDetails}
        />

        {/* Spacer so the cholesterol tooltip doesn't get clipped at the bottom */}
        <div style={{ height: 220 }} />

      </div>
    </div>
  );
}
