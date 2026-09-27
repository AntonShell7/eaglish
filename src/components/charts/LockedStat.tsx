import { useTranslation } from "react-i18next";

/**
 * A figure that is not shown yet, and says so honestly.
 *
 * Some numbers are meaningless early. "Comprehension" from two questions, or
 * "new words per week" from three days, is noise presented as a measurement —
 * and a learner who reads 40% on day two concludes something false about
 * themselves from a number that was never entitled to exist.
 *
 * So these arrive on a schedule, and the card says exactly what it is waiting
 * for. The progress bar matters as much as the wait: an unexplained blank is
 * a broken feature, while a blank with "three days of seven" underneath is a
 * reason to come back.
 */
export function LockedStat({
  label,
  daysDone,
  daysNeeded,
}: {
  label: string;
  daysDone: number;
  daysNeeded: number;
}) {
  const { t } = useTranslation();
  const pct = Math.min(100, Math.round((daysDone / daysNeeded) * 100));

  return (
    <div className="fig locked">
      <p className="fig__label">{label}</p>

      <p className="fig__value" aria-hidden>
        ——
      </p>

      <p className="locked__note">
        {t("progress.unlockIn", { count: Math.max(0, daysNeeded - daysDone) })} · {daysDone}/{daysNeeded}
      </p>

      <span className="locked__track">
        <span className="locked__fill" style={{ width: `${pct}%` }} />
      </span>
    </div>
  );
}
