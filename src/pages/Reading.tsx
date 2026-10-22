import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ShareButton } from "@/components/ui/ShareButton";
import { useTranslation } from "react-i18next";
import type { ReadingText } from "@/data/readingTexts";
import { bandOf, loadLevelTexts, readingLevels, wordCount } from "@/data/readingLibrary";
import { LevelFilter } from "@/components/LevelFilter";
import { levelOf, type Cefr } from "@/lib/textLevel";
import { ReadingTextView } from "@/components/reading/ReadingTextView";
import { ComprehensionQuiz } from "@/components/reading/ComprehensionQuiz";
import { WordWorkout } from "@/components/reading/WordWorkout";
import { ReadingProgress } from "@/components/reading/ReadingProgress";
import {
  generatePersonalText,
  getPersonalTexts,
  pickTargets,
  targetsPresent,
  type PersonalText,
} from "@/lib/personalText";
import { logReadingOpen, getQuizResults, type QuizResult } from "@/lib/readingHistory";
import { getLearnerProfile } from "@/lib/learnerProfile";
import { buildKnownModel, coverageOf } from "@/lib/knownWords";
import { ensureLexicon } from "@/lib/lexicon";
import { getDueWords } from "@/lib/vocabularyStore";
import { normalise, tokenise } from "@/lib/lexicon";
import { refreshDesk, type DeskEntry, type DeskStatus } from "@/lib/dailyDesk";
import { useAuth } from "@/context/AuthContext";
import "./reading.css";

const WORDS_PER_MINUTE = 130;

function minutesFor(text: ReadingText) {
  return Math.max(1, Math.round(wordCount(text) / WORDS_PER_MINUTE));
}

/* ── Stage 1: pick a level ──────────────────────────────────────────────── */

function LevelGrid({
  onPick,
  onPersonal,
  onOpenText,
}: {
  onPick: (id: string) => void;
  onPersonal: () => void;
  onOpenText: (text: ReadingText) => void;
}) {
  const { t } = useTranslation();

  /*
   * The desk: three texts written around the words this learner saved most
   * recently, turning over once a day.
   *
   * This is the half of Reading that justifies it being here at all. A card
   * can show a word ten times; a paragraph is where a learner finds out what
   * the word is *for* — what it sits next to, what work it does, why it
   * exists beyond its translation.
   *
   * It used to search the fixed library for texts containing saved words,
   * which produced the thing it was supposed to prevent: a four-hundred-word
   * text offered for one match, because the library is the library and it has
   * whatever it has. Writing the text instead means every one of them carries
   * four to seven of the learner's own words.
   */
  const { user } = useAuth();
  const profile = getLearnerProfile();
  const [desk, setDesk] = useState<DeskEntry[]>([]);
  const [deskState, setDeskState] = useState<DeskStatus["kind"] | "loading">("loading");

  useEffect(() => {
    let live = true;
    void refreshDesk({
      level: profile?.level ?? "B1-B2",
      topics: profile?.interests ?? [],
      userId: user?.id,
      // The page fills in as each text lands rather than waiting for all three.
      onProgress: (entries) => live && setDesk(entries),
    }).then((status) => {
      if (!live) return;
      setDeskState(status.kind);
      if (status.kind !== "tooFewWords") setDesk(status.entries);
    });
    return () => {
      live = false;
    };
    // Once per mount. A refresh is a day boundary, not a render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* The learner's own band first, then the shelf in order. The profile exists
     to make this page shorter, not longer — and at four cards, "shorter" means
     putting the right one under the cursor rather than hiding the others. */
  const mine = profile?.level ? bandOf(profile.level.slice(0, 2)) : null;
  const ordered = useMemo(
    () => [...readingLevels].sort((a, b) => Number(b.id === mine) - Number(a.id === mine)),
    [mine],
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {/* A title and one line under it. What stood here was three sentences
          explaining that unknown words can be tapped — which the first tap
          teaches better than any paragraph, and which pushed the shelf below
          the fold to say it. */}
      <h1
        className="page-title"
        style={{ "--page-title-size": "3.1rem" } as React.CSSProperties}
      >
        {t("nav.reading")}
      </h1>
      <p className="mt-2 max-w-2xl text-base" style={{ color: "var(--color-text-muted)" }}>
        {t("reading.tagline")}
      </p>

      {(desk.length > 0 || deskState === "loading") && (
        <section className="mt-8">
          <h2 className="eyebrow">{t("reading.deskTitle")}</h2>
          <div data-stagger className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {desk.map(({ text, read }) => (
              <button
                key={text.id}
                type="button"
                onClick={() => onOpenText(text)}
                className={read ? "rd-desk card card--interactive is-read" : "rd-desk card card--interactive"}
              >
                <span className="rd-desk__top">
                  <span className="level">{text.level}</span>
                  {/* Finished texts are replaced tomorrow, and saying so is
                      what stops "it disappeared" reading as a bug. */}
                  {read && <span className="rd-desk__done">{t("reading.deskRead")}</span>}
                </span>
                <span className="rd-desk__title">{text.title}</span>
                {/* The words themselves, not a count: seeing "concede" is what
                    makes somebody open it, and "5 words" is not. */}
                <span className="rd-desk__words">{text.targets.join(" · ")}</span>
              </button>
            ))}

            {/* Placeholders while the rest of today's desk is being written. */}
            {deskState === "loading" &&
              Array.from({ length: Math.max(0, 3 - desk.length) }).map((_, i) => (
                <span key={`skeleton-${i}`} className="rd-desk rd-desk--pending card" aria-hidden />
              ))}
          </div>
        </section>
      )}

      {/* The loop the whole app is built on, and the only thing on this page
          that writes something rather than listing it. It spent a while
          dressed as one of the shelf cards, on the argument that position
          says "first" and costs no colour. Position says "first" to somebody
          already reading top to bottom; four level cards underneath are
          brighter objects than a hairline rectangle, and the eye goes to them.
          It gets the generator's own ground now — the black panel it opens
          onto — so the shelf reads as one offer and four doors. */}
      <button type="button" onClick={onPersonal} className="forge forge--door mt-8 w-full text-left">
        <span className="forge__door-h">{t("reading.personalTitle")} →</span>
        <span className="forge__door-p">{t("reading.personalTeaser")}</span>
      </button>

      <div data-stagger className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ordered.map((level) => {
          const yours = level.id === mine;
          return (
            <button
              key={level.id}
              type="button"
              onClick={() => onPick(level.id)}
              disabled={level.total === 0}
              className="card card--interactive card--accent flex h-full flex-col p-5 text-left disabled:opacity-50"
              style={yours ? { borderColor: "var(--color-primary)" } : undefined}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="page-title text-xl leading-snug">{t(`reading.levels.${level.id}.h`)}</h2>
                {yours && (
                  <span className="flex-none text-[10px] font-bold" style={{ color: "var(--color-primary)" }}>
                    {t("reading.yourLevel")}
                  </span>
                )}
              </div>

              <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                {t(`reading.levels.${level.id}.p`)}
              </p>

              <p className="shelf-meta">
                <span>
                  {level.total > 0 ? t("reading.textCount", { count: level.total }) : t("reading.levelEmpty")}
                </span>
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Stage 2: pick a text ───────────────────────────────────────────────── */

/** Coverage the reading research points at: understood, but still teaching. */
const IDEAL_COVERAGE = 0.97;

function TextList({
  bandId,
  texts,
  quiz,
  onPick,
  onBack,
}: {
  bandId: string;
  texts: ReadingText[];
  quiz: QuizResult[];
  onPick: (text: ReadingText) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const profileBand = getLearnerProfile()?.level;
  const [lexicon, setLexicon] = useState(false);

  useEffect(() => {
    ensureLexicon().then(() => setLexicon(true));
  }, []);

  /* The shelf is browsed by the six real levels rather than the three bands the
     generator wrote to. Measuring needs the frequency list, so until it loads
     every text keeps its published band and nothing is filtered out. */
  const measured = useMemo(() => {
    const out: Record<string, Cefr> = {};
    if (!lexicon) return out;
    for (const text of texts) out[text.id] = levelOf(text.level, text.sentences);
    return out;
  }, [texts, lexicon]);

  const counts = useMemo(() => {
    const out: Partial<Record<Cefr, number>> = {};
    for (const text of texts) {
      const level = measured[text.id];
      if (level) out[level] = (out[level] ?? 0) + 1;
    }
    return out;
  }, [texts, measured]);

  const [level, setLevel] = useState<Cefr | null>(null);

  /**
   * Scores every text against what the reader already knows, then orders by how
   * close it sits to the comprehensible band — and marks texts that happen to
   * contain words due for review, since meeting a word again in reading is
   * worth more than meeting it on a card.
   */
  const scored = useMemo(() => {
    const model = buildKnownModel();
    const due = new Set(getDueWords().map((w) => normalise(w.word)));

    return texts
      .filter((text) => !level || measured[text.id] === level)
      .map((text) => {
        const sentences = text.sentences.map((s) => s.text);
        const coverage = lexicon ? coverageOf(sentences, model) : null;
        const recycled = due.size
          ? new Set(sentences.flatMap(tokenise).filter((token) => due.has(token))).size
          : 0;
        return { text, coverage, recycled };
      })
      .sort((a, b) => {
        // The learner's own band first when they are browsing everything:
        // a shelf that opens on C2 for an A2 reader is a shelf they close.
        if (!level && profileBand) {
          const mine = Number(b.text.level === profileBand) - Number(a.text.level === profileBand);
          if (mine !== 0) return mine;
        }
        if (b.recycled !== a.recycled) return b.recycled - a.recycled;
        if (!a.coverage || !b.coverage) return 0;
        return (
          Math.abs(a.coverage.known - IDEAL_COVERAGE) - Math.abs(b.coverage.known - IDEAL_COVERAGE)
        );
      });
  }, [texts, level, lexicon]);

  const visible = scored;

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <button type="button" onClick={onBack} className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
        ← {t("reading.allLevels")}
      </button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="page-title text-3xl">{t(`reading.levels.${bandId}.h`)}</h1>

        <LevelFilter value={level} counts={counts} onChange={setLevel} />
      </div>

      <div data-stagger className="mt-6 space-y-2">
        {visible.map(({ text, coverage, recycled }) => {
          const best = quiz.filter((r) => r.textId === text.id).reduce((max, r) => Math.max(max, r.correct), -1);
          return (
            <button
              key={text.id}
              type="button"
              onClick={() => onPick(text)}
              className="card card--interactive card--accent flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
              style={best >= 0 ? { borderColor: "var(--color-success)" } : undefined}
            >
              {/* The level leads, because difficulty is what a reader sorts on
                  before the subject. Measured where the frequency list has
                  loaded, published band until then — never absent. */}
              <span className="level flex-none">{measured[text.id] ?? text.level}</span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{text.title}</span>
                <span className="mt-0.5 block text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {t("reading.minRead", { count: minutesFor(text) })} ·{" "}
                  {t("reading.words", { count: wordCount(text) })}
                  {coverage && ` · ${t("reading.knownShare", { percent: Math.round(coverage.known * 100) })}`}
                </span>

                {/* Only rendered when there is something to say. The wrapper
                    used to sit on every row carrying its own top margin, which
                    is most of why the shelf felt crowded. */}
                {recycled > 0 && (
                  <span
                    className="mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      background: "color-mix(in srgb, var(--color-accent) 14%, transparent)",
                      color: "var(--color-accent-ink)",
                    }}
                  >
                    {t("reading.recycled", { count: recycled })}
                  </span>
                )}
              </span>

              {best >= 0 && (
                <span className="flex-none text-xs font-bold" style={{ color: "var(--color-success)" }}>
                  ✓ {best}/{text.questions.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Stage 3: read it ───────────────────────────────────────────────────── */

function Reader({ text, onBack }: { text: ReadingText; onBack: () => void }) {
  const { t } = useTranslation();
  const article = useRef<HTMLElement>(null);

  useEffect(() => {
    // History only. Opening a text earns nothing; answering the questions below
    // is what counts as the reading task.
    logReadingOpen(text.id);
  }, [text.id]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <ReadingProgress target={article} />

      {/* Back and share on one line: the text now has an address, so it can
          be sent to somebody, which is the commonest thing anyone wants to do
          with a text they liked. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
          ← {t("reading.backToList")}
        </button>
        <ShareButton title={text.title} />
      </div>

      <article ref={article} className="card mt-4 p-6 sm:p-12" style={{ boxShadow: "var(--shadow-2)" }}>
        <h1 className="page-title text-2xl">{text.title}</h1>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
          <span className="level level--lg">{text.level}</span>
          <span>{t("reading.minRead", { count: minutesFor(text) })}</span>
          <span aria-hidden>·</span>
          <span>{t("reading.words", { count: wordCount(text) })}</span>
        </div>

        <p
          className="mt-4 rounded-lg px-3 py-2 text-xs"
          style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
        >
          {t("reading.hint")}
        </p>

        <div className="mt-6">
          <ReadingTextView text={text} />
        </div>
      </article>

      <ComprehensionQuiz
        textId={text.id}
        questions={text.questions}
        title={text.title}
        words={Object.entries(text.glossary ?? {})
          .slice(0, 6)
          .map(([word, entry]) => ({ word, translation: entry.translation }))}
      />

      {/* Work with the words this text contained, while it is still fresh. */}
      <WordWorkout text={text} />
    </div>
  );
}

/* ── Texts written around the learner's own words ───────────────────────── */

function PersonalTexts({
  onPick,
  onBack,
}: {
  onPick: (text: PersonalText) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const [texts, setTexts] = useState<PersonalText[]>(() => getPersonalTexts());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profile = getLearnerProfile();
  const targets = pickTargets();

  /* What the text should be about, in the reader's own words.
     It used to be the first interest ticked during onboarding, which meant
     every text anybody ever generated was about the same thing — and the one
     question this screen could usefully ask was the one it did not ask. Left
     empty it falls back to that interest, so the button still works for
     somebody who just wants to press it. */
  const [subject, setSubject] = useState("");

  const rollSubject = () => {
    const pool = t("reading.personalRandomPool", { returnObjects: true }) as string[];
    if (!Array.isArray(pool) || pool.length === 0) return;
    const next = pool.filter((item) => item !== subject);
    setSubject(next[Math.floor(Math.random() * next.length)] ?? pool[0]);
  };

  const make = async () => {
    setBusy(true);
    setError(null);
    const topic = subject.trim() || profile?.interests?.[0] || "everyday life";
    const result = await generatePersonalText({
      level: profile?.level ?? "A1-A2",
      topic,
      targets,
    });
    setBusy(false);

    if ("error" in result) {
      setError(t(result.error === "no-key" ? "lookup.noKey" : "reading.personalFailed"));
      return;
    }
    setTexts(getPersonalTexts());
    onPick(result.text);
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <button type="button" onClick={onBack} className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
        ← {t("reading.allLevels")}
      </button>

      <h1 className="page-title mt-4 text-3xl">{t("reading.personalPageTitle")}</h1>
      <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--color-text-muted)" }}>
        {t("reading.personalLede")}
      </p>

      {/* The one thing on this page that does something, built to look like
          it. The black ground does the separating — it was a mint panel on a
          page where everything else was mint, and it read as a notice rather
          than as the control. The button stays mint, because that is what
          "press this" means everywhere else. */}
      <div className="forge mt-6">
        {targets.length === 0 ? (
          <p className="forge__note">{t("reading.personalNoWords")}</p>
        ) : (
          <>
            {/* The word list that used to stand here is gone. It printed six
                bare stems — "torso", "polyurethane", "rather" — above a field
                asking what the text should be about, which read as a quiz
                about words the reader half-remembers saving. The words are in
                the text when it arrives, and that is where they do their work. */}
            <label className="forge__field">
              <span className="forge__fieldLabel">{t("reading.personalTopicLabel")}</span>
              <input
                type="text"
                className="forge__input"
                value={subject}
                maxLength={120}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t("reading.personalTopicPlaceholder")}
                disabled={busy}
              />
            </label>

            {/* For the evening when nothing comes to mind. An empty field is a
                small decision and a small decision is where a session ends. */}
            <button type="button" onClick={rollSubject} disabled={busy} className="forge__dice">
              {t("reading.personalRandom")}
            </button>

            <button type="button" onClick={make} disabled={busy} className="forge__cta">
              {busy ? t("reading.personalWriting") : t("reading.personalCta")}
            </button>
          </>
        )}
        {error && <p className="forge__error">{error}</p>}
      </div>

      <div className="mt-6 space-y-2">
        {texts.map((text) => (
          <button
            key={text.id}
            type="button"
            onClick={() => onPick(text)}
            className="card card--interactive card--accent flex w-full items-center gap-4 px-4 py-3.5 text-left"
          >
            <span className="level flex-none">{text.level}</span>

            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{text.title}</span>
              <span className="mt-0.5 block text-xs" style={{ color: "var(--color-text-muted)" }}>
                {t("reading.words", { count: wordCount(text) })} · {targetsPresent(text).join(", ")}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── The section ────────────────────────────────────────────────────────── */

/**
 * Reading, with the place you are in written in the address bar.
 *
 * All three stages — the shelf, a band, a text — used to be local state at
 * /reading, which had three consequences and no benefits. The browser's back
 * button left the section instead of going up a level. Reloading inside a
 * text dropped the reader on the shelf. And a text could not be sent to
 * anybody: there was no address for it, so "read this one" meant describing
 * where to click.
 *
 * The state is derived from the route rather than mirrored into it. Mirroring
 * is what produces the bug where the address and the screen disagree after a
 * back button; deriving cannot, because there is only one source.
 */
export default function Reading() {
  const { t } = useTranslation();
  const { topic: bandParam, textId } = useParams<{ topic?: string; textId?: string }>();
  const navigate = useNavigate();

  /* "personal" occupies the band slot. It is a real destination with its own
     screen, and no band is ever called that. */
  const personal = bandParam === "personal";
  const bandId = personal ? null : (bandParam ?? null);

  const [texts, setTexts] = useState<ReadingText[]>([]);
  const [loading, setLoading] = useState(false);

  /* Personal texts are the learner's own and exist only on their device, so
     there is nothing to share and nothing to resolve from an id. They keep
     the state they always had. */
  const [openPersonal, setOpenPersonal] = useState<ReadingText | null>(null);

  const open = textId ? (texts.find((text) => text.id === textId) ?? null) : null;

  const [quiz, setQuiz] = useState<QuizResult[]>([]);

  // Re-read on leaving the reader, so a fresh score shows up in the list.
  useEffect(() => {
    setQuiz(getQuizResults());
  }, [textId]);

  useEffect(() => {
    if (!bandId) return;
    let cancelled = false;
    setLoading(true);
    loadLevelTexts(bandId).then((loaded: ReadingText[]) => {
      if (cancelled) return;
      setTexts(loaded);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [bandId]);

  if (openPersonal) {
    return <Reader key={openPersonal.id} text={openPersonal} onBack={() => setOpenPersonal(null)} />;
  }

  if (personal) {
    return <PersonalTexts onPick={setOpenPersonal} onBack={() => navigate("/reading")} />;
  }

  /* An id in the address that this band does not contain. It happens with an
     old link, a renamed text, or a typo — and dropping the reader on the
     band's list is the honest answer, rather than a blank screen or a reader
     showing nothing. */
  if (textId && !loading && texts.length > 0 && !open) {
    return <Navigate to={`/reading/${bandId}`} replace />;
  }

  if (open) {
    return <Reader key={open.id} text={open} onBack={() => navigate(`/reading/${bandId}`)} />;
  }

  if (bandId) {
    if (loading) {
      return (
        <p className="mx-auto max-w-5xl px-5 py-16 text-sm" style={{ color: "var(--color-text-muted)" }}>
          {t("common.loading")}
        </p>
      );
    }
    return (
      <TextList
        key={bandId}
        bandId={bandId}
        texts={texts}
        quiz={quiz}
        onPick={(text) => navigate(`/reading/${bandId}/${text.id}`)}
        onBack={() => navigate("/reading")}
      />
    );
  }

  return (
    <LevelGrid
      onPick={(id: string) => navigate(`/reading/${id}`)}
      onPersonal={() => navigate("/reading/personal")}
      onOpenText={(text: ReadingText) => navigate(`/reading/${bandOf(text.level)}/${text.id}`)}
    />
  );
}
