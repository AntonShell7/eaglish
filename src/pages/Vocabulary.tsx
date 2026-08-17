import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { SectionHero } from "@/components/SectionHero";
import {
  getVocabulary,
  getDueWords,
  reviewWord,
  removeVocabularyWord,
  addVocabularyWord,
  isWordSaved,
  type VocabularyWord,
} from "@/lib/vocabularyStore";
import { logActivity } from "@/lib/activityStore";

const DAY = 24 * 60 * 60 * 1000;

function Flashcard({ word, onReview }: { word: VocabularyWord; onReview: (quality: 0 | 1 | 2 | 3) => void }) {
  const { t } = useTranslation();
  const [flipped, setFlipped] = useState(false);

  // A new card must start face-down, or the answer leaks.
  useEffect(() => setFlipped(false), [word.id]);

  const grades: { q: 0 | 1 | 2 | 3; key: string; bg?: string; border?: boolean }[] = [
    { q: 0, key: "again", bg: "var(--color-danger)" },
    { q: 1, key: "hard", border: true },
    { q: 2, key: "good", border: true },
    { q: 3, key: "easy", bg: "var(--color-success)" },
  ];

  return (
    <div
      className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-[var(--radius-lg)] border p-8 text-center"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", boxShadow: "var(--shadow-soft)" }}
    >
      <button
        type="button"
        onClick={() => setFlipped((v) => !v)}
        className="w-full rounded-[var(--radius-md)] px-4 py-12 text-2xl font-bold"
        style={{ background: "var(--color-surface-2)" }}
      >
        {flipped ? word.translation : word.word}
      </button>

      {!flipped ? (
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {t("vocabulary.clickToReveal")}
        </p>
      ) : (
        <div className="grid w-full grid-cols-4 gap-2">
          {grades.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => onReview(g.q)}
              className={
                g.border
                  ? "rounded-full border px-2 py-2 text-xs font-semibold"
                  : "rounded-full px-2 py-2 text-xs font-semibold on-primary"
              }
              style={g.border ? { borderColor: "var(--color-border)" } : { background: g.bg }}
            >
              {t(`vocabulary.${g.key}`)}
            </button>
          ))}
        </div>
      )}

      {word.sourceText && (
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {t("vocabulary.from")} “{word.sourceText}”
        </p>
      )}
    </div>
  );
}

function ManualAdd({ onAdded }: { onAdded: () => void }) {
  const { t } = useTranslation();
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
    logActivity("vocabulary");
    setWord("");
    setTranslation("");
    setError(null);
    onAdded();
  };

  return (
    <form
      onSubmit={submit}
      className="mb-5 rounded-[var(--radius-lg)] border p-5"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <p className="text-sm font-semibold">{t("vocabulary.addTitle")}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={word}
          onChange={(e) => { setWord(e.target.value); setError(null); }}
          placeholder={t("vocabulary.addWordPlaceholder")}
          className="min-w-0 flex-1 rounded-[var(--radius-md)] border px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
        />
        <input
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          placeholder={t("vocabulary.addTranslationPlaceholder")}
          className="min-w-0 flex-1 rounded-[var(--radius-md)] border px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
        />
        <button
          type="submit"
          disabled={!word.trim() || !translation.trim()}
          className="rounded-full px-4 py-2 text-sm font-semibold on-primary disabled:opacity-40"
          style={{ background: "var(--color-primary)" }}
        >
          {t("vocabulary.addButton")}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs font-medium" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
      )}
    </form>
  );
}

export default function Vocabulary() {
  const { t } = useTranslation();
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [due, setDue] = useState<VocabularyWord[]>([]);
  const [mode, setMode] = useState<"list" | "practice">("list");
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [query, setQuery] = useState("");

  const refresh = () => {
    setWords(getVocabulary());
    setDue(getDueWords());
  };

  useEffect(refresh, []);

  const handleReview = (id: string, quality: 0 | 1 | 2 | 3) => {
    reviewWord(id, quality);
    logActivity("vocabulary");
    setPracticeIndex((i) => i + 1);
    refresh();
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
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMode("list")}
          className="rounded-full px-4 py-2 text-sm font-semibold"
          style={{
            background: mode === "list" ? "var(--color-primary)" : "var(--color-surface-2)",
            color: mode === "list" ? "var(--color-on-primary)" : "var(--color-text-muted)",
          }}
        >
          {t("vocabulary.listTab", { count: words.length })}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("practice");
            setPracticeIndex(0);
            refresh();
          }}
          disabled={due.length === 0}
          className="rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-40"
          style={{
            background: mode === "practice" ? "var(--color-primary)" : "var(--color-surface-2)",
            color: mode === "practice" ? "var(--color-on-primary)" : "var(--color-text-muted)",
          }}
        >
          {t("vocabulary.practiceTab")} · {t("vocabulary.dueCount", { count: due.length })}
        </button>
      </div>

      {mode === "list" ? (
        <div className="mt-6">
          <ManualAdd onAdded={refresh} />

          {words.length > 0 && (
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("vocabulary.searchPlaceholder")}
              className="mb-4 w-full rounded-[var(--radius-md)] border px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
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

          <div className="space-y-2">
            {filtered.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border px-4 py-3"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{w.word}</p>
                  <p className="truncate text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {w.translation}
                  </p>
                </div>

                <div className="flex flex-none items-center gap-3">
                  <span className="text-right text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                    {dueLabel(w)}
                    <br />
                    {t("vocabulary.reviewedTimes", { count: w.reviewCount })}
                  </span>
                  <button
                    type="button"
                    aria-label={t("vocabulary.remove")}
                    title={t("vocabulary.remove")}
                    onClick={() => {
                      removeVocabularyWord(w.id);
                      refresh();
                    }}
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-8">
          {currentCard ? (
            <Flashcard word={currentCard} onReview={(q) => handleReview(currentCard.id, q)} />
          ) : (
            <p className="py-12 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
              {t("vocabulary.allCaughtUp")}
            </p>
          )}
        </div>
      )}
    </SectionHero>
  );
}
