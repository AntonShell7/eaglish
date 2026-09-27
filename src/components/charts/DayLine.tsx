import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface DayCount {
  date: string;
  count: number;
}

const W = 1000;
const H = 260;
const PAD_T = 18;
const PAD_B = 8;

/**
 * Words collected, as a curve.
 *
 * Columns were the wrong instrument here. Thirty of them across a wide card
 * leaves more gap than bar, so the eye reads the spacing instead of the
 * values, and the whole thing looks sparse however much data is in it. A line
 * has no gaps to read: it starts flush at the left edge, ends flush at the
 * right, and the shape — the climbs, the flat weeks — is the story.
 *
 * Drawn with straight segments rather than a smoothed spline on purpose. A
 * curve through daily counts invents values between the days that nobody
 * recorded, and the invented bits are always the prettiest part.
 */
export function DayLine({ days, unit, delta }: { days: DayCount[]; unit: string; delta: number | null }) {
  const { t, i18n } = useTranslation();

  const label = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language.startsWith("ru") ? "ru-RU" : "en-GB", {
        day: "numeric",
        month: "short",
      }),
    [i18n.language],
  );

  const total = days.reduce((sum, d) => sum + d.count, 0);
  const max = Math.max(1, ...days.map((d) => d.count));
  const peak = days.reduce((best, d) => (d.count > best.count ? d : best), days[0] ?? { date: "", count: 0 });

  const points = days.map((day, i) => {
    const x = days.length > 1 ? (i / (days.length - 1)) * W : W / 2;
    const y = PAD_T + (1 - day.count / max) * (H - PAD_T - PAD_B);
    return { ...day, x, y };
  });

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${W} ${H} L0 ${H} Z`;

  return (
    <section className="dl">
      <header className="dl__head">
        <div>
          <p className="dl__eyebrow">{t("progress.wordsByDayTitle")}</p>
          <p className="dl__total tabular">
            {total}
            <span className="dl__unit">{unit}</span>
            {/* Against the same number of days before this window. A total on
                its own says nothing about direction, which is the thing anyone
                opening a progress page is actually asking. */}
            {delta !== null && (
              <span className={delta >= 0 ? "dl__delta is-up" : "dl__delta is-down"}>
                {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
              </span>
            )}
          </p>
        </div>
        <p className="dl__sub">{t("progress.wordsByDaySub", { count: days.length })}</p>
      </header>

      <div className="dl__plot">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={t("progress.wordsByDayTitle")}>
          <defs>
            <linearGradient id="dl-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path d={area} fill="url(#dl-fill)" />
          <path
            d={line}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>

        {/* Dots sit outside the stretched SVG so they stay round: the plot is
            scaled non-uniformly to fill the card, which would turn circles
            drawn inside it into ellipses. */}
        {points.map((p) => (
          <span
            key={p.date}
            className={`dl__dot${p.count > 0 ? " is-on" : ""}${p.date === peak.date && p.count > 0 ? " is-peak" : ""}`}
            style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` }}
            title={`${label.format(new Date(p.date))} — ${p.count}`}
          />
        ))}
      </div>

      <footer className="dl__foot">
        <span>{label.format(new Date(days[0]?.date ?? Date.now()))}</span>
        <span className="dl__peakLabel">
          {t("progress.peak", { count: max })}
          {peak.date ? ` · ${label.format(new Date(peak.date))}` : ""}
        </span>
        <span>{label.format(new Date(days[days.length - 1]?.date ?? Date.now()))}</span>
      </footer>
    </section>
  );
}
