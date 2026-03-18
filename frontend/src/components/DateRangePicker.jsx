import { useState, useEffect, useRef } from 'react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_HDRS = ['Mo','Tu','We','Th','Fr','Sa','Su'];
const FONT = 'var(--font)';

function toStr(d) {
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
}
function parse(str) {
  if (!str) return null;
  const [y,m,d] = str.split('-').map(Number);
  return new Date(y, m-1, d);
}
function same(a, b) {
  return a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}
function between(d, s, e) {
  return s && e && d > s && d < e;
}

const PRESETS = [
  { label: 'Last 7 days',    days: 7  },
  { label: 'Last 30 days',   days: 30 },
  { label: 'Last 3 months',  days: 90 },
];

export default function DateRangePicker({ startDate, endDate, onChange, onClose }) {
  const today = new Date(); today.setHours(0,0,0,0);

  const initStart = parse(startDate);
  const initEnd   = parse(endDate);

  const [viewYear,  setViewYear]  = useState((initStart || today).getFullYear());
  const [viewMonth, setViewMonth] = useState((initStart || today).getMonth());
  const [tempStart, setTempStart] = useState(initStart);
  const [tempEnd,   setTempEnd]   = useState(initEnd);
  const [hovered,   setHovered]   = useState(null);
  // 'start' = waiting for first click, 'end' = waiting for second click
  const [phase, setPhase] = useState('start');

  const ref = useRef();
  useEffect(() => {
    function outside(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, [onClose]);

  // Build calendar cells for current view month
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startDow     = (firstOfMonth.getDay() + 6) % 7; // Mon=0

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y-1); setViewMonth(11); }
    else setViewMonth(m => m-1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y+1); setViewMonth(0); }
    else setViewMonth(m => m+1);
  };

  const handleDay = (date) => {
    if (date > today) return; // no future dates
    if (phase === 'start') {
      setTempStart(date);
      setTempEnd(null);
      setPhase('end');
    } else {
      if (date < tempStart) {
        // clicked before current start → restart
        setTempStart(date);
        setTempEnd(null);
      } else {
        setTempEnd(date);
        onChange({ start: toStr(tempStart), end: toStr(date) });
        onClose();
      }
    }
  };

  const applyPreset = (days) => {
    const e = new Date(today);
    const s = new Date(today); s.setDate(s.getDate() - (days - 1));
    onChange({ start: toStr(s), end: toStr(e) });
    onClose();
  };

  // Range preview: while picking end, show hover range
  const rangeEnd = phase === 'end' && hovered && hovered >= tempStart ? hovered : tempEnd;

  return (
    <div ref={ref} style={{
      position: 'absolute', zIndex: 300, top: 'calc(100% + 6px)', left: 0,
      background: '#fff', borderRadius: 10, padding: '12px 14px', minWidth: 264,
      boxShadow: '0 8px 32px rgba(11,34,64,0.16)', border: '1px solid var(--border)',
      fontFamily: FONT,
    }}>

      {/* Presets */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => applyPreset(p.days)} style={{
            fontSize: 10, fontWeight: 700, padding: '3px 9px', cursor: 'pointer',
            border: '1.5px solid var(--border2)', borderRadius: 20,
            background: 'var(--bg)', color: 'var(--text2)', fontFamily: FONT,
          }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Instruction hint */}
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--teal)', marginBottom: 8 }}>
        {phase === 'start' ? '① Click a start date' : '② Click an end date'}
      </div>

      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: 'var(--text2)', padding: '0 6px', lineHeight: 1 }}>‹</button>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: 'var(--text2)', padding: '0 6px', lineHeight: 1 }}>›</button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 3 }}>
        {DAY_HDRS.map(h => (
          <div key={h} style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: 'var(--text3)', padding: '2px 0' }}>{h}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const isStart  = same(date, tempStart);
          const isEnd    = same(date, rangeEnd);
          const inRange  = between(date, tempStart, rangeEnd);
          const isToday  = same(date, today);
          const future   = date > today;

          let bg    = 'transparent';
          let color = future ? '#C8D3DF' : isToday ? 'var(--teal)' : 'var(--text)';
          let fw    = 500;
          let br    = 6;

          if (isStart || isEnd) { bg = 'var(--teal)'; color = '#fff'; fw = 800; }
          else if (inRange)     { bg = 'var(--teal-xl)'; color = 'var(--teal)'; br = 0; }

          return (
            <button
              key={i}
              onClick={() => handleDay(date)}
              onMouseEnter={() => phase === 'end' && !future && setHovered(date)}
              onMouseLeave={() => setHovered(null)}
              style={{
                textAlign: 'center', fontSize: 11, fontWeight: fw, padding: '5px 2px',
                border: 'none', borderRadius: br, background: bg, color,
                cursor: future ? 'default' : 'pointer', fontFamily: FONT,
                transition: 'background 0.1s',
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Selected range footer */}
      {tempStart && rangeEnd && (
        <div style={{
          marginTop: 10, padding: '6px 10px', background: 'var(--bg)', borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 11, fontWeight: 600, color: 'var(--text2)',
        }}>
          <span>
            {tempStart.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
            <span style={{ color: 'var(--text3)', margin: '0 5px' }}>→</span>
            {rangeEnd.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}
          </span>
          <span style={{ color: 'var(--teal)', fontWeight: 800 }}>
            {Math.round((rangeEnd - tempStart) / 86400000) + 1}d
          </span>
        </div>
      )}

      {/* Reset link when picking end */}
      {phase === 'end' && (
        <button onClick={() => { setPhase('start'); setTempStart(null); setTempEnd(null); setHovered(null); }} style={{
          marginTop: 8, fontSize: 10, fontWeight: 600, color: 'var(--text3)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: FONT,
        }}>
          ← Reset
        </button>
      )}
    </div>
  );
}
