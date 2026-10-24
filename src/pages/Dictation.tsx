import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SectionHero } from "@/components/SectionHero";
import { DictationRunner } from "@/components/dictation/DictationRunner";
import { listeningTexts, listeningShelf, bandOfText } from "@/data/listeningLibrary";
import type { ReadingText } from "@/data/readingTexts";
import { getLearnerProfile } from "@/lib/learnerProfile";
import { LevelFilter } from "@/components/LevelFilter";
import { progressOf } from "@/lib/dictationProgress";
import { levelOf, type Cefr } from "@/lib/textLevel";
import { ensureLexicon } from "@/lib/lexicon";

/**
 * Dictation, built on the library the app already has.
 *
 * The free dictation sites are limited by their audio: someone had to clip it,
 * so you practise whatever they clipped, and the library stops growing when
 * they stop working. Voicing our own sentences removes that limit entirely.
 *
 * It used to pour the 120 reading texts into this shelf as well, which made it
 * look full — 127 cards — while hiding the fact that only seven texts had been
 * written for it. They are not interchangeable: a fifth of reading sentences
 * run past 120 characters, which is beyond what anyone can hold in their head
 * while typing it. They have been taken out, and the shelf now shows the 48
 * texts written to that constraint and nothing else.
 *
 * Browsed by subject first, exactly as reading is. Eight topics, six texts in
 * each, levels inside.
 */
export default function Dictation() {
  const { t } = useTranslation();
  /* Subject and lesson come from the address, for the same reasons reading
     does: the back button should go up a level rather than out of the
     section, a reload should land where it left — reloading mid-lesson used
     to dump you back on the shelf — and a lesson somebody liked should be
     sendable. */
  const { topic: topicParam, id: lessonId } = useParams<{ topic?: string; id?: string }>();
  const navigate = useNavigate();

  const [texts, setTexts] = useState<ReadingText[]>([]);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<Cefr | null>(null);
  const topic = topicParam ?? null;

  const [levels, setLevels] = useState<Record<string, Cefr>>({});

  const bandOfLearner = getLearnerProfile()?.level ?? null;

  const open = lessonId ? (texts.find((text) => text.id === lessonId) ?? null) : null;

  useEffect(() => {
    setLoading(true);
    let cancelled = false;
    void (async () => {
      // The frequency list has to be in memory before a text can be measured.
      await ensureLexicon();
      if (cancelled) return;
      const measured: Record<string, Cefr> = {};
      for (const text of listeningTexts) {
        measured[text.id] = levelOf(text.level, text.sentences);
      }
      setTexts(listeningTexts);
      setLevels(measured);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** The eight subjects and what each one holds. Fixed data, computed once. */
  const shelf = useMemo(() => listeningShelf(), []);

  /** Texts in the open subject. The shelf is never shown undivided. */
  const inTopic = useMemo(
    () => (topic ? texts.filter((text) => bandOfText(text) === topic) : []),
    [texts, topic],
  );

  const counts = useMemo(() => {
    const out: Partial<Record<Cefr, number>> = {};
    for (const text of inTopic) {
      const level = levels[text.id];
      if (level) out[level] = (out[level] ?? 0) + 1;
    }
    return out;
  }, [inTopic, levels]);

  /** The learner's own band first: dictation at the wrong level is noise. */
  const ordered = useMemo(() => {
    const filtered = picked ? inTopic.filter((text) => levels[text.id] === picked) : inTopic;
    if (!bandOfLearner) return filtered;
    return [...filtered].sort((a, b) => Number(b.level === bandOfLearner) - Number(a.level === bandOfLearner));
  }, [inTopic, levels, picked, bandOfLearner]);

  /* An id this subject does not hold — an old link, or a typo. The shelf is
     the honest landing place; a blank runner is not. */
  if (lessonId && !loading && texts.length > 0 && !open) {
    return <Navigate to={`/dictation/${topic}`} replace />;
  }

  if (open) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10">
        <DictationRunner
          key={open.id}
          id={open.id}
          title={open.title}
          sentences={open.sentences}
          onExit={() => navigate(`/dictation/${topic}`)}
        />
      </div>
    );
  }

  /* No kicker: it used to be passed the same string as the title, so the page
     opened by saying its own name twice in a row. */
  return (
    <SectionHero title={t("nav.dictation")} description={t("dictation.intro")}>
      {/* One mode. "Your own video" sat beside this as a second tab and was
          a promise the product could not keep: it asked a learner to paste a
          YouTube link and produce their own transcript, which is work nobody
          does, so the tab existed to be opened once and closed. The shelf is
          the section. */}
          {/* Stage one: the level. Same shape as reading, because the two
              shelves are browsed by the same person and a section that
              rearranges itself between visits is a section people stop
              trusting. */}
          {!topic && !loading && (
            <div data-stagger className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {shelf.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => navigate(`/dictation/${entry.id}`)}
                  disabled={entry.total === 0}
                  className={`card card--interactive card--accent lvl-card lvl-card--${entry.id} flex h-full flex-col p-5 text-left disabled:opacity-50`}
                >
                  <h2 className="lvl-card__h">{t(`reading.levels.${entry.id}.h`)}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    {t(`reading.levels.${entry.id}.p`)}
                  </p>
                  {/* The per-level counts used to be printed here as six
                      chips per card — forty-eight small numbers on one shelf,
                      none of which anybody chooses a topic by. The level of a
                      lesson is on the lesson, which is where the choice is
                      actually made. */}
                  <p className="shelf-meta">
                    <span>
                      {entry.total > 0
                        ? t("reading.textCount", { count: entry.total })
                        : t("reading.levelEmpty")}
                    </span>
                  </p>
                </button>
              ))}
            </div>
          )}

          {topic && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  setPicked(null);
                  navigate("/dictation");
                }}
                className="text-sm font-semibold"
                style={{ color: "var(--color-text-muted)" }}
              >
                ← {t("reading.allLevels")}
              </button>
              {!loading && <LevelFilter value={picked} counts={counts} onChange={setPicked} />}
            </div>
          )}

          {loading ? (
            <div className="mt-6 grid gap-3">
              <div className="skeleton h-20 rounded-[var(--radius-lg)]" />
              <div className="skeleton h-20 rounded-[var(--radius-lg)]" />
            </div>
          ) : !topic ? null : (
            /* The same cards as reading, in the same grid. These two shelves
               are browsed by the same person on the same evening, and until
               now one was square cards three to a row and the other was
               full-width strips — which reads as two products. Progress shows
               as "started" or "done" rather than as a bar and a percentage:
               what a reader needs from a shelf is which ones are left. */
            <div data-stagger className="rd-list mt-5">
              {ordered.length === 0 && (
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {t("levels.empty")}
                </p>
              )}
              {ordered.map((text) => {
                const done = progressOf(text.id, text.sentences.length);
                const finished = done >= 0.999;
                return (
                  <button
                    key={text.id}
                    type="button"
                    className={`card card--interactive card--accent rd-row text-left${finished ? " is-done" : ""}`}
                    onClick={() => navigate(`/dictation/${topic}/${text.id}`)}
                  >
                    <span className="rd-row__top">
                      {/* The same badge reading uses. Two sections showing the
                          level in two different colours is how an app starts
                          looking assembled rather than designed. */}
                      <span className="level flex-none">{levels[text.id] ?? text.level}</span>
                      {finished && <span className="rd-row__state is-done">✓ {t("reading.stateDone")}</span>}
                      {!finished && done > 0 && (
                        <span className="rd-row__state">{Math.round(done * 100)}%</span>
                      )}
                    </span>

                    <span className="min-w-0">
                      <span className="rd-row__title">{text.title}</span>
                      <span className="rd-row__meta">
                        {t("dictation.sentenceCount", { count: text.sentences.length })}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

    </SectionHero>
  );
}
