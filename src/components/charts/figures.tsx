import type { ReactNode } from "react";
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
  return (
    <div className="viz viz-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {label}
        </p>
        {icon && <span style={{ color: "var(--viz-seq-4)" }}>{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-extrabold" style={{ fontFamily: "var(--font-sans)" }}>
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-[11px]" style={{ color: "var(--color-text-muted)" }}>
          {hint}
        </p>
      )}
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
