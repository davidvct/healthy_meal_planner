// NutritionChart — SVG bar chart for per-nutrient weekly trends
export default function NutritionChart({ data, target, color = '#069B8E', nutrientLabel = 'Calories', unit = 'kcal' }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 11 }}>
        No data
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.value || 0), target || 0, 1);
  const W = 280, H = 80;
  const barCount = data.length;
  const gap = 4;
  const barW = (W - gap * (barCount - 1)) / barCount;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      {/* Target line */}
      {target && (
        <line
          x1={0} y1={H - (target / maxVal) * H}
          x2={W} y2={H - (target / maxVal) * H}
          stroke="var(--border2)" strokeWidth="1" strokeDasharray="3 3"
        />
      )}
      {/* Bars */}
      {data.map((d, i) => {
        const x = i * (barW + gap);
        const barH = Math.max(3, ((d.value || 0) / maxVal) * H);
        const y = H - barH;
        const over = target && d.value > target;
        return (
          <g key={i}>
            <rect
              x={x} y={y} width={barW} height={barH}
              rx={2}
              fill={over ? '#DC2626' : color}
              opacity={d.active ? 1 : 0.55}
            />
            {/* Day/date label */}
            {d.label && (
              <text
                x={x + barW / 2} y={H + 2}
                textAnchor="middle" dominantBaseline="hanging"
                fontSize={7} fill="var(--text3)" fontFamily="var(--font)"
              >
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
