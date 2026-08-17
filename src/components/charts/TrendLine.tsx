import { useState } from "react";
import "./charts.css";

export interface TrendPoint {
  label: string;
  value: number;
}

interface TrendLineProps {
  points: TrendPoint[];
  title: string;
  subtitle?: string;
  emptyLabel: string;
  /** Fixed upper bound — writing scores are out of 10, so don't autoscale. */
  max?: number;
}

const W = 300;
const H = 120;
const PAD = { top: 14, right: 26, bottom: 20, left: 22 };

/**
 * Trend over time, one series: 2px line, area wash at ~10%, an end marker with
 * a surface ring, and a value label only at the endpoint.
 */
export function TrendLine({ points, title, subtitle, emptyLabel, max = 10 }: TrendLineProps) {
  const [hover, setHover] = useState<number | null>(null);

  if (points.length === 0) {
    return (
      <div className="viz viz-card">
        <p className="viz-title">{title}</p>
        {subtitle && <p className="viz-sub">{subtitle}</p>}
        <p className="viz-empty">{emptyLabel}</p>
      </div>
    );
  }

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length === 1 ? plotW / 2 : (plotW * i) / (points.length - 1));
  const y = (v: number) => PAD.top + plotH - (plotH * Math.min(v, max)) / max;

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.value)}`).join(" ");
  const area = `${line} L${x(points.length - 1)},${PAD.top + plotH} L${x(0)},${PAD.top + plotH} Z`;
  const last = points.length - 1;

  return (
    <div className="viz viz-card">
      <p className="viz-title">{title}</p>
      {subtitle && <p className="viz-sub">{subtitle}</p>}

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" style={{ height: 132 }}>
        {/* two hairlines only: the scale's floor and ceiling */}
        {[0, max].map((v) => (
          <line key={v} x1={PAD.left} y1={y(v)} x2={W - PAD.right} y2={y(v)} className="viz-grid-line" />
        ))}
        {[0, max].map((v) => (
          <text key={v} x={PAD.left - 6} y={y(v) + 3} textAnchor="end" className="viz-axis-label">
            {v}
          </text>
        ))}

        <path d={area} fill="var(--viz-seq-4)" opacity="0.1" />
        <path d={line} fill="none" stroke="var(--viz-seq-4)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {points.map((p, i) => (
          <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <circle cx={x(i)} cy={y(p.value)} r="9" fill="transparent" />
            {(i === last || hover === i) && (
              <circle
                cx={x(i)}
                cy={y(p.value)}
                r="4"
                fill="var(--viz-seq-4)"
                stroke="var(--color-surface)"
                strokeWidth="2"
              />
            )}
          </g>
        ))}

        {/* endpoint label only */}
        <text x={x(last) + 7} y={y(points[last].value) + 3} className="viz-value-label">
          {points[last].value}
        </text>

        {hover !== null && hover !== last && (
          <text x={x(hover)} y={y(points[hover].value) - 9} textAnchor="middle" className="viz-value-label">
            {points[hover].value}
          </text>
        )}
      </svg>
    </div>
  );
}
