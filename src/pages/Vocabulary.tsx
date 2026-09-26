import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useSegmented } from "@/lib/useSegmented";
import { SectionHero } from "@/components/SectionHero";
import {
  getVocabulary,
  getDueWords,
  reviewWord,
  addVocabularyWord,
  isWordSaved,
  getReviewedTodayCount,
  type VocabularyWord,
} from "@/lib/vocabularyStore";
import { useTaskDone } from "@/components/tasks/TaskDoneProvider";
import { ReviewCard } from "@/components/vocabulary/ReviewCard";
import { WordList } from "@/components/vocabulary/WordList";
import { activatedCount } from "@/lib/activation";
import "./vocabulary.css";
import { FlashCard } from "@/components/vocabulary/FlashCard";

const DAY = 24 * 60 * 60 * 1000;
/** Cards per completed task. Small enough to reach, big enough to mean something. */
const REVIEWS_PER_TASK = 5;

/**
 * Adding a word by hand.
 *
 * Folded away by default, because it is the rarest thing anyone does here:
 * words arrive from reading, dictation and writing, and a permanent two-field
 * form above the list made the exception look like the main path — while
 * pushing the collection itself below the fold.
 */
function ManualAdd({ onAdded }: { onAdded: () => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const w = word.trim();
    const tr = translation.trim();
    if (!w || !tr) return;

    if (isWordSaved(w)) {
      setError(t("vocabulary.alreadySaved"));
      return;
    }

    addVocabularyWord(w, tr, t("vocabulary.addedManually"));
    setWord("");
    setTranslation("");
    setError(null);
    onAdded();
  };

  if (!open) {
    return (
      <button type="button" className="btn btn--ghost btn--sm mb-4" onClick={() => setOpen(true)}>
        + {t("vocabulary.addTitle")}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card mb-5 p-5">
      <p className="text-sm font-semibold">{t("vocabulary.addTitle")}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={word}
          onChange={(e) => { setWord(e.target.value); setError(null); }}
          placeholder={t("vocabulary.addWordPlaceholder")}
          className="field min-w-0 flex-1"
        />
        <input
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          placeholder={t("vocabulary.addTranslationPlaceholder")}
          className="field min-w-0 flex-1"
        />
        <button
          type="submit"
          disabled={!word.trim() || !translation.trim()}
          className="btn btn--primary disabled:opacity-40"
        >
          {t("vocabulary.addButton")}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs font-medium" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
      )}
      <button type="button" className="btn btn--quiet btn--sm mt-2" onClick={() => setOpen(false)}>
        {t("common.cancel")}
      </button>
    </form>
  );
}

export default function Vocabulary() {
  const { t } = useTranslation();
  const { finish } = useTaskDone();
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [due, setDue] = useState<VocabularyWord[]>([]);
  /*
   * The vocabulary opens on the words that are due, when there are any.
   *
   * Arriving at a shelf and being asked to choose is the friction this section
   * exists to remove: if something is due, that is the work, and putting a list
   * in front of it makes the learner decide what the app already knows.
   */
  const [mode, setMode] = useState<"list" | "practice">(() =>
    getDueWords().length > 0 ? "practice" : "list",
  );
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [reviewedInSession, setReviewedInSession] = useState(0);
  const [query, setQuery] = useState("");
  /* Typing is the better test and stays the default; the deck exists because a
     review that happens beats a stricter one that does not. The choice sticks,
     because it is a habit rather than a per-session decision. */
  const [reviewStyle, setReviewStyle] = useState<"typed" | "cards">(() => {
    try {
      return localStorage.getItem("reviewStyle") === "cards" ? "cards" : "typed";
    } catch {
      return "typed";
    }
  });

  const { ref: styleRef, style: styleStyle } = useSegmented(reviewStyle);

  const chooseStyle = (next: "typed" | "cards") => {
    setReviewStyle(next);
    try {
      localStorage.setItem("reviewStyle", next);
    } catch {
      /* a remembered preference is a convenience, not a requirement */
    }
  };

  const refresh = () => {
    setWords(getVocabulary());
    setDue(getDueWords());
  };

  useEffect(() => {
    refresh();
    // The queue is snapshotted on entry for the same reason it is snapshotted
    // when practice starts by hand: a card answered mid-session must not
    // reshuffle the ones behind it.
    if (getDueWords().length > 0) {
      setPracticeIndex(0);
      setReviewedInSession(0);
    }
  }, []);

  /** Snapshots the queue: a card answered mid-session must not reshuffle the rest. */
  const startPractice = () => {
    setDue(getDueWords());
    setPracticeIndex(0);
    setReviewedInSession(0);
    setMode("practice");
  };

  const handleReview = (id: string, quality: 0 | 1 | 2 | 3) => {
    reviewWord(id, quality);
    setWords(getVocabulary());
    setPracticeIndex((i) => i + 1);
    setReviewedInSession((n) => n + 1);

    // A goal unit is five cards, or clearing whatever was left in the queue —
    // whichever comes first. The bucket id is derived from the day's own review
    // count, so leaving and coming back cannot award the same batch twice.
    const reviewedToday = getReviewedTodayCount();
    const lastInQueue = practiceIndex >= due.length - 1;
    if (reviewedToday % REVIEWS_PER_TASK === 0 || lastInQueue) {
      finish("vocabulary", `review:${Math.floor((reviewedToday - 1) / REVIEWS_PER_TASK)}`, t("tasks.reviewDone"));
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return words;
    return words.filter((w) => w.word.toLowerCase().includes(q) || w.translation.toLowerCase().includes(q));
  }, [words, query]);

  const currentCard = due[practiceIndex];

  const dueLabel = (w: VocabularyWord) => {
    const diff = w.dueAt - Date.now();
    if (diff <= 0) return t("vocabulary.dueNow");
    return t("vocabulary.dueIn", { count: Math.max(1, Math.ceil(diff / DAY)) });
  };

  return (
    <SectionHero
      kicker={t("nav.vocabulary")}
      title={t("nav.vocabulary")}
      description={t("home.descriptions.vocabulary")}
    >
      {/* Three doors, as distinct as the things behind them.
          Words that are due are work with a deadline. All words is the shelf,
          for browsing and drilling. The active vocabulary is proof, and lives
          one click away because it draws on the same collection. */}
      {mode === "list" && (
        <div className="vocab-doors">
          <button
            type="button"
            className={due.length > 0 ? "vocab-door vocab-door--due" : "vocab-door"}
            onClick={startPractice}
            disabled={due.length === 0}
          >
            <span className="vocab-door__n tabular">{due.length}</span>
            <span className="vocab-door__h">{t("vocabulary.doorDue")}</span>
            <span className="vocab-door__p">
              {due.length > 0 ? t("vocabulary.doorDueBody") : t("vocabulary.doorDueEmpty")}
            </span>
          </button>

          <div className="vocab-door vocab-door--static">
            <span className="vocab-door__n tabular">{words.length}</span>
            <span className="vocab-door__h">{t("vocabulary.doorAll")}</span>
            <span className="vocab-door__p">{t("vocabulary.doorAllBody")}</span>
          </div>

          <Link to="/writing" className="vocab-door">
            <span className="vocab-door__n tabular">{activatedCount()}</span>
            <span className="vocab-door__h">{t("vocabulary.doorActive")}</span>
            <span className="vocab-door__p">{t("vocabulary.doorActiveBody")}</span>
          </Link>
        </div>
      )}

      {mode === "list" ? (
        <div className="mt-6">
          <ManualAdd onAdded={refresh} />

          {words.length > 0 && (
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("vocabulary.searchPlaceholder")}
              className="field mb-4"
            />
          )}

          {words.length === 0 && (
            <p className="py-12 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
              {t("vocabulary.empty")}
            </p>
          )}

          {words.length > 0 && filtered.length === 0 && (
            <p className="py-12 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
              {t("vocabulary.noMatches")}
            </p>
          )}

          <WordList words={filtered} onChanged={refresh} dueLabel={dueLabel} />
        </div>
      ) : (
        <div className="mt-8">
          {currentCard ? (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  className="btn btn--quiet btn--sm"
                  onClick={() => {
                    refresh();
                    setMode("list");
                  }}
                >
                  ← {t("vocabulary.backToList")}
                </button>
                <p className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>
                  {t("vocabulary.cardOf", { done: practiceIndex + 1, total: due.length })}
                </p>
                <div className="segmented" ref={styleRef} style={styleStyle}>
                  {(["typed", "cards"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`segmented__item${reviewStyle === option ? " is-active" : ""}`}
                      onClick={() => chooseStyle(option)}
                    >
                      {t(`vocabulary.style.${option}`)}
                    </button>
                  ))}
                </div>
              </div>

              {reviewStyle === "cards" ? (
                <FlashCard key={currentCard.id} word={currentCard} onGraded={(q) => handleReview(currentCard.id, q)} />
              ) : (
                <ReviewCard
                  key={currentCard.id}
                  word={currentCard}
                  onGraded={(q) => handleReview(currentCard.id, q)}
                />
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="page-title text-2xl">
                {reviewedInSession > 0 ? t("vocabulary.sessionDone") : t("vocabulary.allCaughtUp")}
              </p>
              {reviewedInSession > 0 && (
                <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {t("vocabulary.sessionSummary", { count: reviewedInSession })}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  refresh();
                  setMode("list");
                }}
                className="btn btn--primary mt-6"
              >
                {t("vocabulary.backToList")}
              </button>
            </div>
          )}
        </div>
      )}
    </SectionHero>
  );
}
