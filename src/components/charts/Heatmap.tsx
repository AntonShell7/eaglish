import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./charts.css";

export interface HeatmapCell {
  date: string;
  count: number;
}

interface HeatmapProps {
  cells: HeatmapCell[];
  title: string;
  subtitle?: string;
  /** Counts at or above this land on the darkest step. */
  scaleMax?: number;
}

/**
 * Calendar heatmap: magnitude across a grid, so one hue stepped light → dark.
 * Weeks run in columns, days of the week in rows — the shape people already
 * know from contribution graphs.
 */
export function Heatmap({ cells, title, subtitle, scaleMax = 4 }: HeatmapProps) {
  const { t } = useTranslation();
  const [hover, setHover] = useState<HeatmapCell | null>(null);

  const step = (count: number) => {
    if (count <= 0) return "var(--viz-seq-1)";
    const ratio = Math.min(1, count / Math.max(1, scaleMax));
    if (ratio <= 0.25) return "var(--viz-seq-2)";
    if (ratio <= 0.5) return "var(--viz-seq-3)";
    if (ratio <= 0.75) return "var(--viz-seq-4)";
    return "var(--viz-seq-5)";
  };

  // Group into week columns, Monday-first.
  const weeks: (HeatmapCell | null)[][] = [];
  let current: (HeatmapCell | null)[] = [];
  cells.forEach((cell, i) => {
    const dow = (new Date(cell.date).getDay() + 6) % 7; // 0 = Monday
    if (i === 0) current = Array(dow).fill(null);
    current.push(cell);
    if (dow === 6) {
      weeks.push(current);
      current = [];
    }
  });
  if (current.length) weeks.push([...current, ...Array(7 - current.length).fill(null)]);

  return (
    <div className="viz viz-card">
      <p className="viz-title">{title}</p>
      {subtitle && <p className="viz-sub">{subtitle}</p>}

      <div className="relative mt-4">
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-1 flex-col gap-[3px]">
              {week.map((cell, di) => (
                <div
                  key={di}
                  onMouseEnter={() => cell && setHover(cell)}
                  onMouseLeave={() => setHover(null)}
                  className="aspect-square rounded-[3px]"
                  style={{ background: cell ? step(cell.count) : "transparent" }}
                />
              ))}
            </div>
          ))}
        </div>

        {hover && (
          <div
            className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-lg px-2 py-1 text-[11px] font-medium"
            style={{ background: "var(--color-text)", color: "var(--color-surface)", whiteSpace: "nowrap" }}
          >
            {hover.date} · {t("progress.activitiesCount", { count: hover.count })}
          </div>
        )}
      </div>

      {/* Ramp key: a sequential scale needs its direction stated, not a legend box. */}
      <div className="mt-3 flex items-center gap-1.5">
        <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
          {t("progress.less")}
        </span>
        {["var(--viz-seq-1)", "var(--viz-seq-2)", "var(--viz-seq-3)", "var(--viz-seq-4)", "var(--viz-seq-5)"].map((c) => (
          <span key={c} className="h-2.5 w-2.5 rounded-[3px]" style={{ background: c }} />
        ))}
        <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
          {t("progress.more")}
        </span>
      </div>
    </div>
  );
}
