import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { removeVocabularyWord, wordStrength, type VocabularyWord } from "@/lib/vocabularyStore";
import "./word-list.css";

type Group = "shaky" | "settling" | "held";

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
}: {
  words: VocabularyWord[];
  onChanged: () => void;
  dueLabel: (word: VocabularyWord) => string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<Group | null>(null);
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

  const groups = useMemo(() => {
    const out: Record<Group, VocabularyWord[]> = { shaky: [], settling: [], held: [] };
    for (const word of words) out[groupOf(word)].push(word);
    // Weakest first inside a group: the top of the list is the work.
    for (const key of ORDER) out[key].sort((a, b) => wordStrength(a) - wordStrength(b));
    return out;
  }, [words]);

  const visible = ORDER.filter((group) => groups[group].length > 0);

  return (
    <div className="wl">
      {visible.map((group) => {
        const list = groups[group];
        const collapsed = open !== null && open !== group;

        return (
          <section key={group} className={`wl__group wl__group--${group}`}>
            <button
              type="button"
              className="wl__head"
              onClick={() => setOpen(open === group ? null : group)}
              aria-expanded={!collapsed}
            >
              <span className="wl__dot" aria-hidden />
              <span className="wl__title">{t(`vocabulary.groups.${group}`)}</span>
              <span className="wl__count tabular">{list.length}</span>
              <span className="wl__hint">{t(`vocabulary.groupHints.${group}`)}</span>
            </button>

            {!collapsed && (
              <ul className="wl__items">
                {list.map((word) => (
                  <li key={word.id} className={leaving === word.id ? "wl__item is-leaving" : "wl__item"}>
                    <div className="wl__main">
                      <p className="wl__word">{word.word}</p>
                      <p className="wl__translation">{word.translation}</p>
                      {/* The sentence it was met in, which is what makes a
                          collected word a memory rather than an entry. */}
                      {word.sentence && <p className="wl__sentence">{word.sentence}</p>}
                    </div>

                    <div className="wl__meta">
                      <span
                        className="wl__bar"
                        title={t("vocabulary.strengthHint")}
                        aria-label={`${wordStrength(word)}%`}
                      >
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
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
