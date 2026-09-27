import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface DayCount {
  date: string;
  count: number;
}

/**
 * Words saved, day by day — the page's one large figure.
 *
 * It is the only number here that is genuinely the learner's own work: texts
 * opened and questions answered measure attendance, but a collected word is a
 * thing that did not exist before and now does. So it gets the whole width and
 * everything else arranges itself underneath.
 *
 * Drawn as columns rather than a line. A line implies a continuous quantity
 * moving between readings, and this is not one: it is a count of discrete
 * things on discrete days, and days with nothing should read as nothing rather
 * than as a segment sloping through them.
 */
export function WordsByDay({ days, unit }: { days: DayCount[]; unit: string }) {
  const { t, i18n } = useTranslation();

  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((sum, d) => sum + d.count, 0);
  const active = days.filter((d) => d.count > 0).length;

  const label = useMemo(
    () => new Intl.DateTimeFormat(i18n.language.startsWith("ru") ? "ru-RU" : "en-GB", {
      day: "numeric",
      month: "short",
    }),
    [i18n.language],
  );

  /* A line at the mean, in gold. One reference mark turns a row of bars into a
     comparison — without it the eye has nothing to judge a good day against. */
  const mean = active > 0 ? total / days.length : 0;
  const meanPct = (mean / max) * 100;

  return (
    <section className="wbd">
      <header className="wbd__head">
        <div>
          <p className="wbd__eyebrow">{t("progress.wordsByDayTitle")}</p>
          <p className="wbd__total tabular">
            {total}
            <span className="wbd__unit">{unit}</span>
          </p>
        </div>
        <p className="wbd__sub">{t("progress.wordsByDaySub", { count: days.length })}</p>
      </header>

      <div className="wbd__plot">
        {mean > 0 && (
          <span className="wbd__mean" style={{ bottom: `${meanPct}%` }} aria-hidden>
            <i>{mean.toFixed(1)}</i>
          </span>
        )}

        <ol className="wbd__bars">
          {days.map((day) => (
            <li
              key={day.date}
              className={day.count > 0 ? "wbd__bar is-on" : "wbd__bar"}
              title={`${label.format(new Date(day.date))} — ${day.count}`}
            >
              <span style={{ height: `${Math.max(day.count > 0 ? 3 : 1.5, (day.count / max) * 100)}%` }} />
            </li>
          ))}
        </ol>
      </div>

      <footer className="wbd__foot">
        <span>{label.format(new Date(days[0]?.date ?? Date.now()))}</span>
        <span>{label.format(new Date(days[days.length - 1]?.date ?? Date.now()))}</span>
      </footer>
    </section>
  );
}
