// DayStrip — horizontal 7-day strip with B/L/D slot indicators
const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function weekLabel(weekDates) {
  if (!weekDates || weekDates.length < 7) return '';
  const fmt = (d) => d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
  return `${fmt(weekDates[0])} – ${fmt(weekDates[6])}`;
}

function shortName(name, max = 14) {
  if (!name) return '';
  return name.length > max ? name.slice(0, max - 1) + '…' : name;
}

export default function DayStrip({ weekDates, activeDayIndex, mealPlan, onSelectDay, onPrevWeek, onNextWeek, dayLabel, daysWithMeals, dinerName }) {
  if (!weekDates || weekDates.length < 7) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const SLOTS = [
    { key: 'breakfast', label: 'B', border: '#FCD34D', bg: '#FFFBEB', textFilled: '#78350F', textEmpty: '#A87D30' },
    { key: 'lunch',     label: 'L', border: '#6EE7B7', bg: '#F0FDF9', textFilled: '#064E3B', textEmpty: '#2D7A5C' },
    { key: 'dinner',    label: 'D', border: '#93C5FD', bg: '#EFF6FF', textFilled: '#1E3A8A', textEmpty: '#3B5EA6' },
  ];

  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r)',
      padding: '14px 16px 14px', marginBottom: 16, position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 2px 8px rgba(11,34,64,.06)',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          {dayLabel && (
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>{dayLabel}</div>
          )}
          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
            {daysWithMeals != null ? `${daysWithMeals} of 7 days planned` : weekLabel(weekDates)}
            {dinerName ? ` · ${dinerName}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={onPrevWeek}
            style={{ width: 26, height: 26, borderRadius: 'var(--r-xs)', border: '1px solid var(--border2)', background: 'var(--white)', cursor: 'pointer', fontSize: 14, color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font)' }}
          >‹</button>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 14px', borderRadius: 'var(--r-xs)', border: '1px solid var(--border2)', fontSize: 11, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', minWidth: 200, justifyContent: 'center' }}>
            📅 {weekLabel(weekDates)}
          </div>
          <button
            onClick={onNextWeek}
            style={{ width: 26, height: 26, borderRadius: 'var(--r-xs)', border: '1px solid var(--border2)', background: 'var(--white)', cursor: 'pointer', fontSize: 14, color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font)' }}
          >›</button>
        </div>
      </div>

      {/* 7 day cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 7 }}>
        {weekDates.map((date, di) => {
          const isActive = di === activeDayIndex;
          const isToday = date.setHours(0,0,0,0) === today.getTime();
          // Restore time after comparison
          const dayMeals = mealPlan?.[di] || {};
          const dayKcal = Object.values(dayMeals).flat().reduce((s, e) => s + (e.kcal || 0), 0);

          return (
            <div
              key={di}
              onClick={() => onSelectDay(di)}
              style={{
                borderRadius: 'var(--r-sm)', border: isActive ? '2px solid var(--teal)' : '1.5px solid var(--border)',
                background: 'var(--white)', overflow: 'hidden', cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onMouseOver={e => { if (!isActive) e.currentTarget.style.borderColor = 'var(--teal)'; }}
              onMouseOut={e => { if (!isActive) e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              {/* Day header */}
              <div style={{ padding: '8px 8px 6px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isActive ? 'var(--navy)' : 'var(--white)' }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: isActive ? 'rgba(255,255,255,0.5)' : 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {DAY_ABBR[di]}{isToday ? ' ·' : ''}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: isActive ? '#fff' : 'var(--text)', lineHeight: 1 }}>
                    {new Date(weekDates[di]).getDate()}
                  </div>
                </div>
              </div>

              {/* Slot rows */}
              <div style={{ padding: '2px 0' }}>
                {SLOTS.map(sl => {
                  const entries = dayMeals[sl.key] || [];
                  const filled = entries.length > 0;
                  const firstName = filled ? entries[0].dishName : null;
                  return (
                    <div
                      key={sl.key}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5, padding: '6px 8px',
                        borderBottom: sl.key !== 'dinner' ? '1px solid var(--border)' : 'none',
                        borderLeft: `3px solid ${sl.border}`,
                        background: filled ? sl.bg : 'transparent',
                      }}
                    >
                      <div style={{ fontSize: 8, fontWeight: 800, color: filled ? sl.textFilled : 'var(--text3)', width: 10, flexShrink: 0, textTransform: 'uppercase' }}>
                        {sl.label}
                      </div>
                      <div style={{ fontSize: 10, color: filled ? sl.textFilled : 'var(--text3)', overflow: 'hidden', flex: 1, fontStyle: filled ? 'normal' : 'italic', fontWeight: filled ? 500 : 400, lineHeight: 1.3, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {filled ? shortName(firstName, 12) : 'Not planned'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer kcal */}
              <div style={{ padding: '3px 8px', borderTop: '1px solid var(--border)', fontSize: 9, fontWeight: 600, color: 'var(--text2)', textAlign: 'right' }}>
                {dayKcal ? `${dayKcal} kcal` : '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
