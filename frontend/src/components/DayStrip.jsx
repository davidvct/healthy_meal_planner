// DayStrip — horizontal 7-day strip with B/L/D slot indicators
const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SLOTS = [
  {
    key: 'breakfast', label: 'B',
    bg:      'linear-gradient(135deg,#FEF3C7,#FDE68A,#FCD34D)',
    bgEmpty: 'linear-gradient(135deg,rgba(254,243,199,.45),rgba(252,211,77,.18))',
    icColor: '#D97706',
    textFilled: '#78350F',
    textEmpty:  '#B45309',
  },
  {
    key: 'lunch', label: 'L',
    bg:      'linear-gradient(135deg,#D1FAE5,#A7F3D0,#6EE7B7)',
    bgEmpty: 'linear-gradient(135deg,rgba(209,250,229,.45),rgba(110,231,183,.18))',
    icColor: '#059669',
    textFilled: '#064E3B',
    textEmpty:  '#047857',
  },
  {
    key: 'dinner', label: 'D',
    bg:      'linear-gradient(135deg,#DBEAFE,#BFDBFE,#93C5FD)',
    bgEmpty: 'linear-gradient(135deg,rgba(219,234,254,.45),rgba(147,197,253,.18))',
    icColor: '#3B82F6',
    textFilled: '#1E3A8A',
    textEmpty:  '#1D4ED8',
  },
];

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

  return (
    <div className="ds-wrap">
      {/* Header row */}
      <div className="ds-hdr">
        <div>
          {dayLabel && <div className="ds-date">{dayLabel}</div>}
          <div className="ds-sub">
            {daysWithMeals != null ? `${daysWithMeals} of 7 days planned` : weekLabel(weekDates)}
            {dinerName ? ` · ${dinerName}` : ''}
          </div>
        </div>
        <div className="ds-nav">
          <button className="ds-nav-btn" onClick={onPrevWeek}>‹</button>
          <div className="ds-week-pill">
            📅 {weekLabel(weekDates)}
          </div>
          <button className="ds-nav-btn" onClick={onNextWeek}>›</button>
        </div>
      </div>

      {/* 7 day cards */}
      <div className="ds-scroll">
        {weekDates.map((date, di) => {
          const isActive = di === activeDayIndex;
          const isToday = new Date(date).setHours(0,0,0,0) === today.getTime();
          const dayMeals = mealPlan?.[di] || {};
          const dayKcal = Object.values(dayMeals).flat().reduce((s, e) => s + (e.kcal || 0), 0);

          return (
            <div
              key={di}
              className={`ds-card${isActive ? ' on' : ''}`}
              onClick={() => onSelectDay(di)}
            >
              {/* Day header */}
              <div className="ds-card-hdr">
                <div className="ds-card-day">
                  {DAY_ABBR[di]}{isToday ? ' ·' : ''}
                </div>
                <div className="ds-card-date">
                  {new Date(weekDates[di]).getDate()}
                </div>
              </div>

              {/* Slot rows */}
              <div className="ds-card-body">
                {SLOTS.map(sl => {
                  const entries = dayMeals[sl.key] || [];
                  const filled = entries.length > 0;
                  const firstName = filled ? entries[0].dishName : null;
                  return (
                    <div
                      key={sl.key}
                      className={`ds-slot${filled ? ' ds-filled' : ''}`}
                      style={{ background: filled ? sl.bg : sl.bgEmpty }}
                    >
                      <div className="ds-slot-ic" style={{ color: sl.icColor }}>{sl.label}</div>
                      <div className="ds-slot-name" style={{ color: filled ? sl.textFilled : sl.textEmpty }}>
                        {filled ? shortName(firstName, 12) : 'Not planned'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer kcal */}
              <div className="ds-card-footer">
                {dayKcal ? `${dayKcal} kcal` : '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
