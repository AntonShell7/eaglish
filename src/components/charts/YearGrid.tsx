import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface GridDay {
  date: string;
  count: number;
}

/**
 * The calendar of days worked.
 *
 * One square per day, columns as weeks, read left to right — the shape every
 * developer already knows how to read, which is the whole argument for using
 * it: a chart that needs no key has already won. What it says that a streak
 * cannot is the texture of a habit — where the gaps fall, whether weekends
 * are dead, whether a good fortnight was really one good week.
 *
 * Four steps of mint rather than a continuous scale, because the eye cannot
 * rank more than a handful of shades anyway, and today gets a gold ring so
 * there is always somewhere to start looking.
 */
export function YearGrid({ days, goal }: { days: GridDay[]; goal: number }) {
  const { t, i18n } = useTranslation();

  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language.startsWith("ru") ? "ru-RU" : "en-GB", {
        day: "numeric",
        month: "long",
      }),
    [i18n.language],
  );

  const today = days[days.length - 1]?.date;

  /* Columns of seven, starting on whatever weekday the range happens to open
     with — the run of weeks matters here, not their alignment to Mondays. */
  const weeks: GridDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const level = (count: number) => {
    if (count <= 0) return 0;
    const share = count / Math.max(1, goal);
    if (share >= 1) return 3;
    if (share >= 0.6) return 2;
    return 1;
  };

  return (
    <div className="ygrid">
      <div className="ygrid__scroll">
        <div className="ygrid__weeks">
          {weeks.map((week, i) => (
            <div key={i} className="ygrid__week">
              {week.map((day) => (
                <span
                  key={day.date}
                  className={`ygrid__day ygrid__day--${level(day.count)}${day.date === today ? " is-today" : ""}`}
                  title={`${fmt.format(new Date(day.date))} — ${day.count}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="ygrid__key">
        <span>{t("progress.gridLess")}</span>
        {[0, 1, 2, 3].map((n) => (
          <span key={n} className={`ygrid__day ygrid__day--${n}`} aria-hidden />
        ))}
        <span>{t("progress.gridMore")}</span>
      </div>
    </div>
  );
}
