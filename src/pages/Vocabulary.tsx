import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
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
import { BulkAdd } from "@/components/vocabulary/BulkAdd";
import { Drill } from "@/components/vocabulary/Drill";
import { DueSession } from "@/components/vocabulary/DueSession";
import { ActiveVocabulary } from "@/components/activation/ActiveVocabulary";
import { activatedCount } from "@/lib/activation";
import { useSegmented } from "@/lib/useSegmented";
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
 * The three rooms of the vocabulary.
 *
 * They used to be three cards you clicked into and then had to come back out
 * of, which is a menu pretending to be a section: every move between the
 * review queue and the shelf cost two clicks and a full change of screen. They
 * are tabs now, so switching is instant and the section reads as one place
 * with three views rather than three places.
 *
 * `drill` is not a tab — it is what a tab hands you off to, from the queue or
 * from any folder on the shelf.
 */
type Tab = "due" | "all" | "active";

const TABS: Tab[] = ["due", "all", "active"];

export default function Vocabulary() {
  const { t } = useTranslation();
  const { finish } = useTaskDone();
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [due, setDue] = useState<VocabularyWord[]>([]);
  const [query, setQuery] = useState("");

  /* If something is due, that is the work, and the section opens on it. */
  const [tab, setTab] = useState<Tab>(() => (getDueWords().length > 0 ? "due" : "all"));
  const [drill, setDrill] = useState<{ queue: VocabularyWord[]; title: string } | null>(null);

  const { ref: tabsRef, style: tabsStyle } = useSegmented(tab);

  const refresh = () => {
    setWords(getVocabulary());
    setDue(getDueWords());
  };

  useEffect(refresh, []);

  /** Snapshots the queue: a card answered mid-session must not reshuffle the rest. */
  const startDrill = (queue: VocabularyWord[], title: string) => {
    if (queue.length === 0) return;
    setDrill({ queue, title });
  };

  const leaveDrill = () => {
    refresh();
    setDrill(null);
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

  const count = (key: Tab) =>
    key === "due" ? due.length : key === "all" ? words.length : activatedCount();

  return (
    <SectionHero title={t("nav.vocabulary")} description={t("home.descriptions.vocabulary")}>
      {/* The switcher stays put while a drill runs, so leaving one is a single
          tap onto wherever you actually wanted to be. */}
      <div className="vocab-tabs">
        <div className="segmented" ref={tabsRef} style={tabsStyle} role="tablist">
          {TABS.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`segmented__item${tab === key ? " is-active" : ""}`}
              onClick={() => {
                setTab(key);
                setDrill(null);
                refresh();
              }}
            >
              {t(`vocabulary.tabs.${key}`)}
              <span className="vocab-tabs__n tabular">{count(key)}</span>
            </button>
          ))}
        </div>
      </div>

      {drill ? (
        <div className="mt-8">
          <Drill
            queue={drill.queue}
            title={drill.title}
            onReview={handleReview}
            onExit={leaveDrill}
          />
        </div>
      ) : (
        <>
          {tab === "due" && (
            <div className="mt-8">
              {due.length > 0 ? (
                <DueSession
                  onReview={handleReview}
                  onLeave={() => {
                    refresh();
                    setTab("all");
                  }}
                />
              ) : (
                <div className="vocab-empty">
                  <p className="page-title text-2xl">{t("vocabulary.allCaughtUp")}</p>
                  <p className="vocab-empty__p">
                    {words.length > 0 ? t("vocabulary.doorDueEmpty") : t("vocabulary.empty")}
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === "all" && (
            <div className="mt-8">
              {/* Two ways in, and the list is the one that was missing: a
                  homework list of twenty words has no connection to anything
                  the learner has read, and adding them through a two-field
                  form is twenty forms. */}
              <div className="mb-4 flex flex-wrap items-start gap-3">
                <ManualAdd onAdded={refresh} />
                <BulkAdd onAdded={refresh} />
              </div>

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

              <WordList words={filtered} onChanged={refresh} dueLabel={dueLabel} onDrill={startDrill} />
            </div>
          )}

          {tab === "active" && <ActiveVocabulary />}
        </>
      )}
    </SectionHero>
  );
}
