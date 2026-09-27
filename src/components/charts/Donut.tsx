import { useTranslation } from "react-i18next";

export interface Slice {
  key: string;
  label: string;
  value: number;
  color: string;
}

/**
 * Where the time went.
 *
 * A ring rather than a pie: the hole is where the total goes, which is the
 * number people actually want, and it stops the eye trying to compare wedge
 * areas — something human vision is famously bad at. The legend carries the
 * real figures, so the drawing only has to show proportion.
 */
export function Donut({
  slices,
  centre,
  centreLabel,
  emptyLabel,
}: {
  slices: Slice[];
  centre: string;
  centreLabel: string;
  emptyLabel: string;
}) {
  const { t } = useTranslation();
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const shown = slices.filter((s) => s.value > 0).sort((a, b) => b.value - a.value);

  if (total === 0) {
    return (
      <section className="donut">
        <p className="donut__empty">{emptyLabel}</p>
      </section>
    );
  }

  /* One circle, one dash pattern per slice, rotated into place. Cheaper than
     arc paths and it animates on a single property. */
  const R = 54;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <section className="donut">
      <div className="donut__ring">
        <svg viewBox="0 0 140 140" role="img" aria-label={t("progress.timeSplitTitle")}>
          {shown.map((slice) => {
            const share = slice.value / total;
            const dash = share * C;
            const el = (
              <circle
                key={slice.key}
                cx="70"
                cy="70"
                r={R}
                fill="none"
                stroke={slice.color}
                strokeWidth="15"
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 70 70)"
              />
            );
            offset += dash;
            return el;
          })}
        </svg>

        <div className="donut__centre">
          <p className="donut__value tabular">{centre}</p>
          <p className="donut__caption">{centreLabel}</p>
        </div>
      </div>

      <ul className="donut__legend">
        {shown.map((slice) => (
          <li key={slice.key}>
            <span className="donut__dot" style={{ background: slice.color }} aria-hidden />
            <span className="donut__name">{slice.label}</span>
            <span className="donut__pct tabular">{Math.round((slice.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
