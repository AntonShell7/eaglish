import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./charts.css";

export interface MixSegment {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface MixBarProps {
  segments: MixSegment[];
  title: string;
  subtitle?: string;
  emptyLabel: string;
}

/**
 * Part-to-whole across four categories — the one chart here where the
 * categories *are* the subject, so it uses the validated categorical ramp.
 *
 * The segments carry no inline numbers. Interior stacked segments have no free
 * end to label against, and a label *inside* the fill would have to clear
 * contrast on all four hues — measured, white fails on every light-mode fill
 * and dark ink still misses on blue (4.0:1, under the 4.5 needed at this size).
 * So identity and value both live where they always read: the legend carries
 * count + share per category, and the table view carries everything. That is
 * also the relief these low-contrast hues oblige.
 *
 * Segments are separated by a 2px surface gap rather than strokes.
 */
export function MixBar({ segments, title, subtitle, emptyLabel }: MixBarProps) {
  const { t } = useTranslation();
  const [showTable, setShowTable] = useState(false);

  const total = segments.reduce((s, x) => s + x.value, 0);
  const shown = segments.filter((s) => s.value > 0);

  return (
    <div className="viz viz-card">
      <p className="viz-title">{title}</p>
      {subtitle && <p className="viz-sub">{subtitle}</p>}

      {total === 0 ? (
        <p className="viz-empty">{emptyLabel}</p>
      ) : (
        <>
          <div className="mt-4 flex h-11 w-full gap-[2px] overflow-hidden">
            {shown.map((s) => (
              <div
                key={s.key}
                className="rounded-[4px]"
                style={{ background: s.color, flexGrow: s.value, flexBasis: 0 }}
                title={`${s.label}: ${s.value}`}
              />
            ))}
          </div>

          {/* Legend is always present at four series — identity never rests on colour alone. */}
          <div className="viz-legend">
            {segments.map((s) => (
              <span key={s.key} className="viz-legend__item">
                <span className="viz-legend__swatch" style={{ background: s.color }} />
                {s.label}
                <span style={{ color: "var(--color-text)", fontWeight: 600 }}>
                  {s.value} · {total ? Math.round((s.value / total) * 100) : 0}%
                </span>
              </span>
            ))}
          </div>

          <button type="button" className="viz-toggle" onClick={() => setShowTable((v) => !v)}>
            {showTable ? t("progress.hideTable") : t("progress.showTable")}
          </button>

          {showTable && (
            <table className="viz-table">
              <thead>
                <tr>
                  <th>{t("progress.activityType")}</th>
                  <th>{t("progress.count")}</th>
                  <th>{t("progress.share")}</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((s) => (
                  <tr key={s.key}>
                    <td style={{ color: "var(--color-text)" }}>{s.label}</td>
                    <td>{s.value}</td>
                    <td>{total ? Math.round((s.value / total) * 100) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
