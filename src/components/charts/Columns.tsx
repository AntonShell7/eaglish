import { useId, useState } from "react";
import "./charts.css";

export interface ColumnDatum {
  label: string;
  value: number;
  /** Longer text for the tooltip; falls back to `label`. */
  title?: string;
}

interface ColumnsProps {
  data: ColumnDatum[];
  /** Rendered above the plot; also names the single series, so no legend box. */
  title: string;
  subtitle?: string;
  unitLabel?: string;
}

const H = 132;
const CAP = 24; // bars never fill their slot — the leftover is air
const RADIUS = 4;

/**
 * Columns for magnitude over time. One series, so it wears the sequential hue
 * and needs no legend: the title already says what's plotted. Only the tallest
 * column carries a direct label — a number on every cap goes unread.
 */
export function Columns({ data, title, subtitle, unitLabel }: ColumnsProps) {
  const [hover, setHover] = useState<number | null>(null);
  const clipId = useId();

  const max = Math.max(1, ...data.map((d) => d.value));
  const peak = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);
  const slot = 100 / Math.max(1, data.length);

  return (
    <div className="viz viz-card">
      <p className="viz-title">{title}</p>
      {subtitle && <p className="viz-sub">{subtitle}</p>}

      <div className="relative mt-4">
        <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" className="h-32 w-full viz-interactive" role="img">
          <clipPath id={clipId}>
            <rect x="0" y="0" width="100" height={H} />
          </clipPath>
          {/* baseline only — gridlines would out-ink four days of data */}
          <line x1="0" y1={H - 18} x2="100" y2={H - 18} className="viz-grid-line" vectorEffect="non-scaling-stroke" />

          {data.map((d, i) => {
            const h = d.value === 0 ? 0 : Math.max(3, ((H - 34) * d.value) / max);
            const w = Math.min(CAP, slot * 0.62);
            const x = slot * i + (slot - w) / 2;
            const y = H - 18 - h;
            return (
              <g key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                {/* full-height hit target, bigger than the mark */}
                <rect x={slot * i} y="0" width={slot} height={H - 18} fill="transparent" />
                {h > 0 && (
                  <rect
                    className="viz-mark"
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx={Math.min(RADIUS, w / 2)}
                    fill={d.value === max ? "var(--viz-seq-5)" : "var(--viz-seq-4)"}
                  />
                )}
                {/* square off the baseline end so the bar grows from it */}
                {h > RADIUS && (
                  <rect className="viz-mark" x={x} y={H - 18 - RADIUS} width={w} height={RADIUS}
                        fill={d.value === max ? "var(--viz-seq-5)" : "var(--viz-seq-4)"} />
                )}
              </g>
            );
          })}
        </svg>

        {/* Axis + the one direct label, in HTML so text never scales with the
            non-uniform viewBox. */}
        <div className="pointer-events-none absolute inset-0">
          {data.map((d, i) => (
            <span
              key={d.label}
              className="absolute text-[10px]"
              style={{
                left: `${slot * i + slot / 2}%`,
                bottom: 0,
                transform: "translateX(-50%)",
                color: "var(--color-text-muted)",
                fontWeight: i === peak ? 600 : 400,
              }}
            >
              {d.label}
            </span>
          ))}
          {data[peak]?.value > 0 && (
            <span
              className="absolute text-[10px] font-semibold"
              style={{
                left: `${slot * peak + slot / 2}%`,
                bottom: `${18 + ((H - 34) * data[peak].value) / max + 3}px`,
                transform: "translateX(-50%)",
                color: "var(--color-text)",
              }}
            >
              {data[peak].value}
            </span>
          )}
        </div>

        {hover !== null && (
          <div
            className="pointer-events-none absolute -top-1 rounded-lg px-2 py-1 text-[11px] font-medium"
            style={{
              left: `${slot * hover + slot / 2}%`,
              transform: "translateX(-50%)",
              background: "var(--color-text)",
              color: "var(--color-surface)",
              whiteSpace: "nowrap",
            }}
          >
            {data[hover].title ?? data[hover].label}: {data[hover].value}
            {unitLabel ? ` ${unitLabel}` : ""}
          </div>
        )}
      </div>
    </div>
  );
}
