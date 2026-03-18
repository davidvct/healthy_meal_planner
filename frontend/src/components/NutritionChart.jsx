// NutritionChart — SVG bar chart with hover tooltips
import { useState } from 'react';

function ndHex(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function barColor(v, target, color, higherIsBetter) {
  if (v === 0) return ndHex(color, 0.10);
  if (higherIsBetter) {
    return v >= target * 0.9 ? '#069B8E' : ndHex(color, 0.38);
  } else {
    if (v > target) return 'rgba(220,38,38,0.75)';
    if (v >= target * 0.75) return ndHex(color, 0.55);
    return ndHex(color, 0.80);
  }
}

function valColor(v, target, color, higherIsBetter) {
  if (v === 0) return '#8A9BB0';
  if (higherIsBetter) return v >= target * 0.9 ? '#069B8E' : ndHex(color, 0.80);
  if (v > target) return '#DC2626';
  return color;
}

function tooltipLines(v, label, target, unit, higherIsBetter) {
  if (v === 0) {
    return { val: 'No meals planned', ctx: label };
  }
  const pct = Math.round((v / target) * 100);
  const valStr = `${v.toLocaleString()} ${unit}`;
  let ctx;
  if (higherIsBetter) {
    if (pct >= 90) ctx = `On track · ${pct}% of ${target.toLocaleString()} ${unit} target`;
    else           ctx = `${pct}% of ${target.toLocaleString()} ${unit} daily target`;
  } else if (pct > 100) {
    ctx = `Over limit · ${pct}% of ${target.toLocaleString()} ${unit} limit`;
  } else if (pct >= 75) {
    ctx = `Approaching limit · ${pct}% of ${target.toLocaleString()} ${unit}`;
  } else {
    ctx = `Within limit · ${pct}% of ${target.toLocaleString()} ${unit} limit`;
  }
  return { val: valStr, ctx: `${label} · ${ctx}` };
}

const FONT = 'Plus Jakarta Sans, sans-serif';

export default function NutritionChart({ data, target, color = '#069B8E', higherIsBetter = true, unit = 'kcal' }) {
  const [hovered, setHovered] = useState(null);
  // hovered: { i, v, label, barX, barW, by }

  if (!data || data.length === 0) {
    return (
      <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 11 }}>
        No data
      </div>
    );
  }

  // SVG coordinate space — no y-axis labels so ml is just a small gutter
  const VW = 600, VH = 160;
  const ml = 14, mr = 52, mt = 14, mb = 28;
  const cw = VW - ml - mr, ch = VH - mt - mb;
  const n = data.length;
  const bw = Math.floor((cw - (n - 1) * 6) / n);
  const maxVal = Math.max(...data.map(d => d.value || 0), target || 0, 1);
  const yMax = maxVal * 1.25;

  const yp  = v => mt + ch - Math.round((v / yMax) * ch);
  const fmt = v => v >= 1000 ? (Math.round(v / 100) / 10) + 'k' : String(Math.round(v));

  const ty = target ? yp(target) : null;

  // Dashed target line segments
  const dashes = [];
  if (ty !== null) {
    for (let dx = ml; dx < ml + cw; dx += 12) {
      dashes.push([dx, Math.min(dx + 7, ml + cw)]);
    }
  }

  // Tooltip position (CSS, relative to the 170px container)
  // x: center of bar as % of VW → maps 1:1 because preserveAspectRatio="none"
  // y: bar top in SVG → (svgY / VH) * 160px DOM height
  const TOOLTIP_H = 56;
  const tipLeft   = hovered ? `${((hovered.barX + hovered.barW / 2) / VW) * 100}%` : '0';
  const barTopPx  = hovered ? (hovered.by / VH) * 160 : 0;
  const tipTopPx  = hovered ? Math.max(2, barTopPx - TOOLTIP_H - 6) : 0;
  const tip       = hovered ? tooltipLines(hovered.v, hovered.label, target, unit, higherIsBetter) : null;

  return (
    <div style={{ position: 'relative', width: '100%', height: 170 }}>

      {/* Tooltip overlay */}
      {hovered && tip && (
        <div style={{
          position: 'absolute',
          top: tipTopPx,
          left: tipLeft,
          transform: 'translateX(-50%)',
          background: 'var(--navy)',
          color: '#fff',
          borderRadius: 7,
          padding: '6px 10px',
          fontSize: 11,
          fontFamily: FONT,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 10,
          boxShadow: '0 4px 14px rgba(11,34,64,0.22)',
          lineHeight: 1.4,
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.2px' }}>{tip.val}</div>
          <div style={{ fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.72)', marginTop: 1 }}>{tip.ctx}</div>
          {/* Arrow pointing down */}
          <div style={{
            position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid var(--navy)',
          }} />
        </div>
      )}

      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="none"
        width="100%"
        height="160"
        style={{ display: 'block' }}
      >
        {/* Baseline only — one grounding line, no cage */}
        <line x1={ml} y1={mt + ch} x2={ml + cw} y2={mt + ch} stroke="#E8EDF3" strokeWidth="1" />

        {/* Bars + labels */}
        {data.map((d, i) => {
          const v = d.value || 0;
          const x = ml + i * (bw + 6);
          const bh = v > 0 ? Math.max(4, Math.round((v / yMax) * ch)) : 4;
          const by = mt + ch - bh;
          const bc = barColor(v, target, color, higherIsBetter);
          const vc = valColor(v, target, color, higherIsBetter);
          const isHov = hovered?.i === i;

          return (
            <g key={i}
              onMouseEnter={() => setHovered({ i, v, label: d.label, barX: x, barW: bw, by })}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: v > 0 ? 'pointer' : 'default' }}
            >
              {/* Wide invisible hit area */}
              <rect x={x - 3} y={mt} width={bw + 6} height={ch} fill="transparent" />

              {/* Bar — brighten on hover */}
              <rect
                x={x} y={by} width={bw} height={bh} rx="3"
                fill={bc}
                opacity={isHov ? 1 : 0.88}
                style={{ transition: 'opacity 0.1s' }}
              />

              {/* X-axis label */}
              <text
                x={x + bw / 2} y={VH - mb + 15}
                textAnchor="middle" fontSize="9.5" fontFamily={FONT}
                fill={isHov ? 'var(--navy, #0B2240)' : '#8A9BB0'}
                fontWeight={isHov ? '700' : '500'}
              >
                {d.label}
              </text>

              {/* Value label above bar (only when not hovered, to avoid clutter) */}
              {v > 0 && !isHov && (
                <text
                  x={x + bw / 2} y={by - 4}
                  textAnchor="middle" fontSize="8" fontFamily={FONT}
                  fill={vc} fontWeight="700"
                >
                  {fmt(v)}
                </text>
              )}
            </g>
          );
        })}

        {/* Dashed target line */}
        {dashes.map(([x1, x2], i) => (
          <line key={i} x1={x1} y1={ty} x2={x2} y2={ty} stroke={color} strokeWidth="1.5" opacity="0.5" />
        ))}
        {ty !== null && (() => {
          const mx = ml + cw / 2;
          return (
            <g>
              {/* White pill behind label so dashes don't show through */}
              <rect x={mx - 46} y={ty - 15} width={92} height={13} rx="3" fill="white" opacity="0.92" />
              <text x={mx} y={ty - 5} textAnchor="middle" fontSize="8.5" fontFamily={FONT} fill={color} opacity="0.7" fontWeight="700">
                {`Target: ${target.toLocaleString()}`}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
