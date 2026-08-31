import type { ReactNode } from "react";

/**
 * A progress ring.
 *
 * A bar tells you how far along you are; a ring makes the day's goal feel like
 * an object you are closing. It is the one thing on the dashboard people look at
 * every session, so it earns the extra care: the stroke animates to its new
 * position rather than jumping, the track is a faint tint rather than grey, and
 * it turns green only when the goal is actually met.
 */
export function ProgressRing({
  value,
  max,
  size = 116,
  stroke = 9,
  children,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = max > 0 ? Math.min(1, value / max) : 0;
  const done = ratio >= 1;

  return (
    <div style={{ position: "relative", width: size, height: size, flex: "none" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface-3)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={done ? "var(--color-success)" : "var(--color-primary)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          style={{ transition: "stroke-dashoffset 900ms var(--ease), stroke 400ms var(--ease)" }}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        {children}
      </div>
    </div>
  );
}
