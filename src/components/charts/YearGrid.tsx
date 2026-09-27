import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface GridDay {
  date: string;
  minutes: number;
}

/** Where one band ends and the next begins, in minutes. */
const BANDS = [1, 5, 15];

/**
 * The calendar of days worked, measured in minutes.
 *
 * It used to shade days by a count of finished tasks, which meant the darkest
 * squares were the days with the most clicking rather than the most studying.
 * Minutes are the honest unit, and they let the key say something a learner
 * can act on — five to fifteen minutes is a real description of an evening,
 * "more" and "less" are not.
 *
 * Weekdays run down the left so the rows can be read as Monday through Sunday
 * rather than as an unlabelled seven, which is what turns the grid from a
 * texture into a calendar: without them you cannot see that your Thursdays
 * are empty.
 */
export function YearGrid({ days }: { days: GridDay[] }) {
  const { t, i18n } = useTranslation();
  const ru = i18n.language.startsWith("ru");

  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat(ru ? "ru-RU" : "en-GB", { day: "numeric", month: "long" }),
    [ru],
  );

  /* Columns must start on a Monday or the weekday labels lie, so the range is
     padded at the front with blanks up to the first Monday. */
  const first = days.length > 0 ? new Date(days[0].date) : new Date();
  const lead = (first.getDay() + 6) % 7;
  const cells: (GridDay | null)[] = [...Array<null>(lead).fill(null), ...days];

  const weeks: (GridDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const today = days[days.length - 1]?.date;

  const level = (minutes: number) => {
    if (minutes < BANDS[0]) return 0;
    if (minutes < BANDS[1]) return 1;
    if (minutes < BANDS[2]) return 2;
    return 3;
  };

  const weekdays = ru
    ? ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const keys = [
    t("progress.bandNone"),
    t("progress.bandLow", { to: BANDS[1] }),
    t("progress.bandMid", { from: BANDS[1], to: BANDS[2] }),
    t("progress.bandHigh", { from: BANDS[2] }),
  ];

  return (
    <div className="ygrid">
      <div className="ygrid__body">
        <ul className="ygrid__days" aria-hidden>
          {weekdays.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>

        <div className="ygrid__scroll">
          <div className="ygrid__weeks">
            {weeks.map((week, i) => (
              <div key={i} className="ygrid__week">
                {week.map((day, j) =>
                  day ? (
                    <span
                      key={day.date}
                      className={`ygrid__cell ygrid__cell--${level(day.minutes)}${day.date === today ? " is-today" : ""}`}
                      title={`${fmt.format(new Date(day.date))} — ${t("progress.minutesShort", { count: day.minutes })}`}
                    />
                  ) : (
                    <span key={`pad-${i}-${j}`} className="ygrid__cell ygrid__cell--pad" />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ul className="ygrid__key">
        {keys.map((label, n) => (
          <li key={label}>
            <span className={`ygrid__cell ygrid__cell--${n}`} aria-hidden />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
