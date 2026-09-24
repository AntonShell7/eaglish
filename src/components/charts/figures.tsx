import type { ReactNode } from "react";
import { useCountUp } from "@/lib/useCountUp";
import "./charts.css";

/**
 * Figures for when the form is a number, not a plot: a hero figure, stat tiles
 * and a meter. Values wear ink tokens; colour lives on the marks beside them.
 */

/** The one number a view leads with. Exactly one per page. */
export function HeroFigure({
  value,
  label,
  caption,
}: {
  value: string | number;
  label: string;
  caption?: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </p>
      {/* Sans, not the display serif — a serif here reads as decoration. */}
      <p
        className="mt-1 font-extrabold leading-none"
        style={{ fontSize: "clamp(3rem, 8vw, 4.25rem)", fontFamily: "var(--font-sans)" }}
      >
        {value}
      </p>
      {caption && (
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          {caption}
        </p>
      )}
    </div>
  );
}

/**
 * One number, given room.
 *
 * The number leads and the label follows it, because on a page of tiles the
 * eye lands on figures and then looks for what they mean — reading the label
 * first is work nobody does. Numbers count up on first sight: the movement is
 * what makes a page of statistics feel like yours rather than like a report
 * about you, and it costs one animation frame.
 */
export function StatTile({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}) {
  const numeric = typeof value === "number" ? value : null;
  const shown = useCountUp(numeric ?? 0, 900);

  return (
    <div className="viz viz-card stat-tile">
      <p className="stat-tile__value tabular">{numeric === null ? value : shown}</p>
      <p className="stat-tile__label">
        {icon && <span className="stat-tile__icon">{icon}</span>}
        {label}
      </p>
      {hint && <p className="stat-tile__hint">{hint}</p>}
    </div>
  );
}

/**
 * A single ratio against a limit. The unfilled track is a lighter step of the
 * same ramp, so state reads across the whole bar.
 */
export function Meter({
  value,
  max,
  label,
  valueLabel,
  done,
}: {
  value: number;
  max: number;
  label: string;
  valueLabel: string;
  done?: boolean;
}) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  return (
    <div className="viz">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-semibold">{label}</span>
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {valueLabel}
        </span>
      </div>
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full"
        style={{ background: "var(--viz-seq-1)" }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: done ? "var(--color-success)" : "var(--viz-seq-4)" }}
        />
      </div>
    </div>
  );
}
