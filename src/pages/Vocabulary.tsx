import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
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
import { WordList } from "@/components/vocabulary/WordList";
import { Drill } from "@/components/vocabulary/Drill";
import { activatedCount } from "@/lib/activation";
import "./vocabulary.css";

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

/**
 * Where the three doors lead.
 *
 * `doors` is the section's front page; `shelf` is everything ever collected,
 * arranged by strength or by the day it arrived; `drill` is a run through some
 * set of words, whichever set the learner came from.
 */
type View =
  | { kind: "doors" }
  | { kind: "shelf" }
  | { kind: "drill"; queue: VocabularyWord[]; title: string };

export default function Vocabulary() {
  const { t } = useTranslation();
  const { finish } = useTaskDone();
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [due, setDue] = useState<VocabularyWord[]>([]);
  const [query, setQuery] = useState("");

  /*
   * The vocabulary opens on the words that are due, when there are any.
   *
   * Arriving at a shelf and being asked to choose is the friction this section
   * exists to remove: if something is due, that is the work, and putting a list
   * in front of it makes the learner decide what the app already knows.
   */
  const [view, setView] = useState<View>(() => {
    const queue = getDueWords();
    return queue.length > 0 ? { kind: "drill", queue, title: "" } : { kind: "doors" };
  });

  const refresh = () => {
    setWords(getVocabulary());
    setDue(getDueWords());
  };

  useEffect(refresh, []);

  /** Snapshots the queue: a card answered mid-session must not reshuffle the rest. */
  const drill = (queue: VocabularyWord[], title: string) => {
    if (queue.length === 0) return;
    setView({ kind: "drill", queue, title });
  };

  const leaveDrill = () => {
    refresh();
    setView({ kind: "doors" });
  };

  const handleReview = (id: string, quality: 0 | 1 | 2 | 3, lastInQueue: boolean) => {
    reviewWord(id, quality);
    setWords(getVocabulary());

    // A goal unit is five cards, or clearing whatever was left in the queue —
    // whichever comes first. The bucket id is derived from the day's own review
    // count, so leaving and coming back cannot award the same batch twice.
    const reviewedToday = getReviewedTodayCount();
    if (reviewedToday % REVIEWS_PER_TASK === 0 || lastInQueue) {
      finish("vocabulary", `review:${Math.floor((reviewedToday - 1) / REVIEWS_PER_TASK)}`, t("tasks.reviewDone"));
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return words;
    return words.filter((w) => w.word.toLowerCase().includes(q) || w.translation.toLowerCase().includes(q));
  }, [words, query]);

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
      {view.kind === "doors" && (
        <>
          <div className="vocab-doors">
            <button
              type="button"
              className={due.length > 0 ? "vocab-door vocab-door--due" : "vocab-door"}
              onClick={() => drill(getDueWords(), t("vocabulary.doorDue"))}
              disabled={due.length === 0}
            >
              <span className="vocab-door__n tabular">{due.length}</span>
              <span className="vocab-door__h">{t("vocabulary.doorDue")}</span>
              <span className="vocab-door__p">
                {due.length > 0 ? t("vocabulary.doorDueBody") : t("vocabulary.doorDueEmpty")}
              </span>
            </button>

            <button type="button" className="vocab-door" onClick={() => setView({ kind: "shelf" })}>
              <span className="vocab-door__n tabular">{words.length}</span>
              <span className="vocab-door__h">{t("vocabulary.doorAll")}</span>
              <span className="vocab-door__p">{t("vocabulary.doorAllBody")}</span>
            </button>

            <Link to="/writing" className="vocab-door">
              <span className="vocab-door__n tabular">{activatedCount()}</span>
              <span className="vocab-door__h">{t("vocabulary.doorActive")}</span>
              <span className="vocab-door__p">{t("vocabulary.doorActiveBody")}</span>
            </Link>
          </div>

          {words.length === 0 && (
            <p className="py-12 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
              {t("vocabulary.empty")}
            </p>
          )}
        </>
      )}

      {view.kind === "shelf" && (
        <div className="mt-6">
          <button type="button" className="btn btn--quiet btn--sm mb-4" onClick={() => setView({ kind: "doors" })}>
            ← {t("vocabulary.backToDoors")}
          </button>

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

          <WordList words={filtered} onChanged={refresh} dueLabel={dueLabel} onDrill={drill} />
        </div>
      )}

      {view.kind === "drill" && (
        <div className="mt-8">
          <Drill
            queue={view.queue}
            title={view.title || t("vocabulary.doorDue")}
            onReview={handleReview}
            onExit={leaveDrill}
          />
        </div>
      )}
    </SectionHero>
  );
}
