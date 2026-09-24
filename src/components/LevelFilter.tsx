import { useTranslation } from "react-i18next";
import { CEFR_ORDER, type Cefr } from "@/lib/textLevel";

/**
 * Pick a level, or take them all.
 *
 * Six buttons rather than three bands, because "A1-A2" is a compromise between
 * two genuinely different reading experiences, and because a learner who has
 * been told they are B1 wants B1 — not a shelf that also contains B2.
 */
export function LevelFilter({
  value,
  counts,
  onChange,
}: {
  value: Cefr | null;
  counts: Partial<Record<Cefr, number>>;
  onChange: (level: Cefr | null) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="segmented" role="group" aria-label={t("levels.label")}>
      <button
        type="button"
        className={`segmented__item${value === null ? " is-active" : ""}`}
        onClick={() => onChange(null)}
      >
        {t("levels.all")}
      </button>
      {CEFR_ORDER.filter((level) => (counts[level] ?? 0) > 0).map((level) => (
        <button
          key={level}
          type="button"
          className={`segmented__item${value === level ? " is-active" : ""}`}
          onClick={() => onChange(value === level ? null : level)}
        >
          {level}
          <span className="tabular" style={{ opacity: 0.6, marginLeft: 6, fontSize: "0.78em" }}>
            {counts[level]}
          </span>
        </button>
      ))}
    </div>
  );
}
