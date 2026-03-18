// NutritionChart — clean bar chart following modern dashboard design (Claude/Stripe style)
import { useState } from 'react';

const FONT = 'Plus Jakarta Sans, sans-serif';

function ndHex(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function NutritionChart({ data, target, color = '#069B8E', higherIsBetter = true, unit = 'kcal' }) {
  const [hovered, setHovered] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: 12, fontFamily: FONT }}>
        No data available
      </div>
    );
  }

  const n = data.length;
  const VW = 700, VH = 200;
  const ml = 4, mr = 48, mt = 20, mb = 32;
  const cw = VW - ml - mr, ch = VH - mt - mb;
  const gap = n > 14 ? 2 : n > 7 ? 4 : 6;
  const bw = Math.max(4, Math.floor((cw - (n - 1) * gap) / n));
  const labelEvery = n <= 7 ? 1 : n <= 14 ? 2 : n <= 21 ? 3 : 5;

  const maxVal = Math.max(...data.map(d => d.value || 0), target || 0, 1);
  const yMax = maxVal * 1.15;
  const yp = v => mt + ch - Math.round((v / yMax) * ch);
  const fmt = v => v >= 1000 ? (Math.round(v / 100) / 10) + 'k' : String(Math.round(v));

  const ty = target ? yp(target) : null;

  // Horizontal grid lines at 25%, 50%, 75% of yMax
  const gridLines = [0.25, 0.5, 0.75].map(pct => ({
    y: yp(yMax * pct),
    label: fmt(yMax * pct),
  }));

  // Tooltip
  const tip = hovered ? (() => {
    const v = hovered.v;
    const pct = target ? Math.round((v / target) * 100) : 0;
    if (v === 0) return { val: 'No meals', sub: hovered.label };
    return {
      val: `${v.toLocaleString()} ${unit}`,
      sub: `${hovered.label} · ${pct}% of ${target?.toLocaleString()} ${unit}`,
    };
  })() : null;

  const tipLeft = hovered ? `${((hovered.barX + hovered.barW / 2) / VW) * 100}%` : '0';
  const barTopPx = hovered ? (hovered.by / VH) * 190 : 0;
  const tipTopPx = hovered ? Math.max(2, barTopPx - 54) : 0;

  return (
    <div style={{ position: 'relative', width: '100%', height: 190 }}>

      {/* Tooltip */}
      {hovered && tip && (
        <div style={{
          position: 'absolute', top: tipTopPx, left: tipLeft,
          transform: 'translateX(-50%)',
          background: '#0F172A', color: '#fff', borderRadius: 8,
          padding: '8px 12px', fontFamily: FONT, whiteSpace: 'nowrap',
          pointerEvents: 'none', zIndex: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.3px' }}>{tip.val}</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{tip.sub}</div>
          <div style={{
            position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
            borderTop: '5px solid #0F172A',
          }} />
        </div>
      )}

      <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" width="100%" height="190" style={{ display: 'block' }}>

        {/* Horizontal grid lines — faint, no y-axis */}
        {gridLines.map((gl, i) => (
          <g key={i}>
            <line x1={ml} y1={gl.y} x2={ml + cw} y2={gl.y} stroke="#E2E8F0" strokeWidth="0.7" />
            <text x={ml + cw + 6} y={gl.y + 3} fontSize="8" fontFamily={FONT} fill="#94A3B8" fontWeight="500">
              {gl.label}
            </text>
          </g>
        ))}

        {/* Baseline */}
        <line x1={ml} y1={mt + ch} x2={ml + cw} y2={mt + ch} stroke="#E2E8F0" strokeWidth="0.7" />

        {/* Bars */}
        {data.map((d, i) => {
          const v = d.value || 0;
          const x = ml + i * (bw + gap);
          const bh = v > 0 ? Math.max(3, Math.round((v / yMax) * ch)) : 2;
          const by = mt + ch - bh;
          const isHov = hovered?.i === i;
          const isOver = v > target;
          const isEmpty = v === 0;
          const showLabel = i % labelEvery === 0 || isHov;

          // Bar color: single hue, opacity conveys state
          let bc;
          if (isEmpty) bc = '#F1F5F9';
          else if (isOver && !higherIsBetter) bc = '#EF4444';
          else if (isHov) bc = color;
          else bc = ndHex(color, 0.55);

          return (
            <g key={i}
              onMouseEnter={() => setHovered({ i, v, label: d.label, barX: x, barW: bw, by })}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect x={x - gap / 2} y={mt} width={bw + gap} height={ch + mb} fill="transparent" />
              <rect
                x={x} y={by} width={bw} height={bh}
                rx={Math.min(bw / 2, 4)}
                fill={bc}
                style={{ transition: 'fill 0.15s, opacity 0.15s' }}
              />

              {/* X-axis label */}
              {showLabel && (
                <text
                  x={x + bw / 2} y={VH - 4}
                  textAnchor="middle" fontSize={n > 14 ? '7.5' : '9'} fontFamily={FONT}
                  fill={isHov ? '#0F172A' : '#94A3B8'}
                  fontWeight={isHov ? '600' : '400'}
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Target line — solid, thin, with right-aligned label */}
        {ty !== null && (
          <g>
            <line x1={ml} y1={ty} x2={ml + cw} y2={ty}
              stroke={color} strokeWidth="1" strokeDasharray="4 3" opacity="0.45" />
            <text
              x={ml + cw + 6} y={ty + 3}
              fontSize="8" fontFamily={FONT} fill={color} fontWeight="600"
            >
              {target.toLocaleString()}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
