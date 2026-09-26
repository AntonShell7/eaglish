import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { removeVocabularyWord, wordStrength, type VocabularyWord } from "@/lib/vocabularyStore";
import "./word-list.css";

type Group = "shaky" | "settling" | "held";
type Arrange = "strength" | "date";

/**
 * The collection, arranged so it can be acted on.
 *
 * A flat alphabetical list is what every vocabulary app starts with and what
 * every learner stops opening: at two hundred words it says nothing except
 * that there are two hundred. The useful question is never "which words do I
 * have" but "which ones are about to slip", so the list answers that first.
 *
 * Three groups, taken from the scheduler rather than invented: words that keep
 * being forgotten, words on their way in, and words the intervals say are
 * held. It is the split Quizlet found — still learning against mastered — with
 * the middle state that a spaced system actually has and a two-way split
 * cannot express.
 */
function groupOf(word: VocabularyWord): Group {
  const strength = wordStrength(word);
  if (strength < 35) return "shaky";
  if (strength < 75) return "settling";
  return "held";
}

const ORDER: Group[] = ["shaky", "settling", "held"];

export function WordList({
  words,
  onChanged,
  dueLabel,
  onDrill,
}: {
  words: VocabularyWord[];
  onChanged: () => void;
  dueLabel: (word: VocabularyWord) => string;
  /**
   * Practise a group. Every heading here names a set worth drilling — the
   * words that keep slipping, or the ones collected on a particular day — and
   * a shelf you can only look at is a shelf that stops being opened.
   */
  onDrill: (words: VocabularyWord[], title: string) => void;
}) {
  const { t, i18n } = useTranslation();
  /*
   * Two ways to arrange the same shelf.
   *
   * By how firmly a word is held, which answers "what should I work on"; or by
   * the day it was collected, which answers "what did I get from that article
   * last Tuesday". The second is the folder people actually build by hand in
   * other apps, and here it needs no building — every word already knows when
   * it arrived.
   */
  const [arrange, setArrange] = useState<Arrange>("strength");
  /*
   * Which date folders are open.
   *
   * Each one is independent — closing September does not force October shut,
   * because these are folders, not an accordion, and a person comparing two
   * days should not have to choose between them. They start closed apart from
   * the most recent, which is both the compact view and the useful one: after
   * a year of collecting, every day expanded at once is a page nobody scrolls,
   * and a page of nothing but headings tells you nothing at all.
   */
  const [openDays, setOpenDays] = useState<Set<string> | null>(null);
  /* A row about to go. It stays in the list while it collapses, because
     removing it from the data first would make it disappear instantly and the
     animation would have nothing to play on. */
  const [leaving, setLeaving] = useState<string | null>(null);

  const remove = (id: string) => {
    setLeaving(id);
    window.setTimeout(() => {
      removeVocabularyWord(id);
      setLeaving(null);
      onChanged();
    }, 420);
  };

  const byDate = useMemo(() => {
    const out = new Map<string, VocabularyWord[]>();
    for (const word of words) {
      const day = new Date(word.addedAt);
      const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
      const list = out.get(key) ?? [];
      list.push(word);
      out.set(key, list);
    }
    return [...out.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [words]);

  const dateFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language.startsWith("ru") ? "ru-RU" : "en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [i18n.language],
  );

  /* Seeded once the days are known, and left alone afterwards so that adding
     a word does not reopen everything the learner has closed. */
  const days = useMemo(() => byDate.map(([day]) => day).join("|"), [byDate]);
  useEffect(() => {
    setOpenDays((current) => current ?? new Set(byDate.length > 0 ? [byDate[0][0]] : []));
  }, [days, byDate]);

  const toggleDay = (day: string) =>
    setOpenDays((current) => {
      const next = new Set(current ?? []);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });

  const allOpen = openDays !== null && byDate.length > 0 && byDate.every(([day]) => openDays.has(day));

  const toggleAll = () =>
    setOpenDays(allOpen ? new Set() : new Set(byDate.map(([day]) => day)));

  const groups = useMemo(() => {
    const out: Record<Group, VocabularyWord[]> = { shaky: [], settling: [], held: [] };
    for (const word of words) out[groupOf(word)].push(word);
    // Weakest first inside a group: the top of the list is the work.
    for (const key of ORDER) out[key].sort((a, b) => wordStrength(a) - wordStrength(b));
    return out;
  }, [words]);

  const visible = ORDER.filter((group) => groups[group].length > 0);

  const row = (word: VocabularyWord) => (
    <li key={word.id} className={leaving === word.id ? "wl__item is-leaving" : "wl__item"}>
      <div className="wl__main">
        <p className="wl__word">{word.word}</p>
        <p className="wl__translation">{word.translation}</p>
        {word.sentence && <p className="wl__sentence">{word.sentence}</p>}
      </div>

      <div className="wl__meta">
        <span className="wl__bar" title={t("vocabulary.strengthHint")} aria-label={`${wordStrength(word)}%`}>
          <span style={{ width: `${wordStrength(word)}%` }} />
        </span>
        <span className="wl__due tabular">{dueLabel(word)}</span>
      </div>

      <button
        type="button"
        className="wl__remove"
        aria-label={t("vocabulary.remove")}
        title={t("vocabulary.remove")}
        onClick={() => remove(word.id)}
      >
        ✕
      </button>
    </li>
  );

  return (
    <div className="wl">
      <div className="wl__arrange">
        {(["strength", "date"] as Arrange[]).map((option) => (
          <button
            key={option}
            type="button"
            className={arrange === option ? "wl__arrangeBtn is-on" : "wl__arrangeBtn"}
            onClick={() => setArrange(option)}
          >
            {t(`vocabulary.arrange.${option}`)}
          </button>
        ))}
      </div>

      {arrange === "date" && byDate.length > 1 && (
        <button type="button" className="wl__toggleAll" onClick={toggleAll}>
          {allOpen ? t("vocabulary.collapseAll") : t("vocabulary.expandAll")}
        </button>
      )}

      {arrange === "date" &&
        byDate.map(([day, list]) => {
          const label = dateFormat.format(new Date(day));
          const shown = openDays?.has(day) ?? false;

          return (
            <section key={day} className={shown ? "wl__group wl__group--date is-open" : "wl__group wl__group--date"}>
              <div className="wl__headRow">
                <button
                  type="button"
                  className="wl__head"
                  onClick={() => toggleDay(day)}
                  aria-expanded={shown}
                >
                  {/* The arrow is the whole affordance: a heading that turns
                      is a heading people know they can press. */}
                  <span className="wl__chevron" aria-hidden>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
                      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  <span className="wl__title">{label}</span>
                  <span className="wl__count tabular">{list.length}</span>
                </button>
                <button
                  type="button"
                  className="wl__drill wl__drill--loud"
                  onClick={() => onDrill(list, label)}
                >
                  {t("vocabulary.practiseFolder")}
                </button>
              </div>
              {shown && <ul className="wl__items">{list.map(row)}</ul>}
            </section>
          );
        })}

      {/* Arranged by strength, nothing folds away. There are only ever three
          groups, and the point of the arrangement is to see the shape of the
          whole collection at once — hiding a third of it would undo that. */}
      {arrange === "strength" &&
        visible.map((group) => {
        const list = groups[group];

        return (
          <section key={group} className={`wl__group wl__group--${group}`}>
            <div className="wl__headRow">
              <div className="wl__head wl__head--static">
                <span className="wl__dot" aria-hidden />
                <span className="wl__title">{t(`vocabulary.groups.${group}`)}</span>
                <span className="wl__count tabular">{list.length}</span>
                <span className="wl__hint">{t(`vocabulary.groupHints.${group}`)}</span>
              </div>
              <button
                type="button"
                className="wl__drill"
                onClick={() => onDrill(list, t(`vocabulary.groups.${group}`))}
              >
                {t("vocabulary.practiseFolder")}
              </button>
            </div>

            <ul className="wl__items">{list.map(row)}</ul>
          </section>
        );
      })}
    </div>
  );
}
