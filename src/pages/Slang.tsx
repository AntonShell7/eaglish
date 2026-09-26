import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionHero } from "@/components/SectionHero";
import { LevelFilter } from "@/components/LevelFilter";
import { useSegmented } from "@/lib/useSegmented";
import { DialogueRunner } from "@/components/slang/DialogueRunner";
import { LessonRunner } from "@/components/everyday/LessonRunner";
import { slangDialogues, allExpressions, type Dialogue } from "@/data/slangDialogues";
import { everydayLessons, type Lesson } from "@/data/everydayLessons";
import { getSlangResults } from "@/lib/slangProgress";
import { getLessonResults, type LessonResult } from "@/lib/lessonProgress";
import { rankLessons } from "@/lib/learnerProfile";
import type { Cefr } from "@/lib/textLevel";
import "@/components/slang/slang.css";

/**
 * Lessons carry hybrid labels — "A2–B1" — because a conversation sits between
 * levels more often than a text does. The shelf is browsed by single levels,
 * so a hybrid is filed under its lower half: someone reaching for B1 should be
 * offered something they can finish, not something that starts there.
 */
function levelOfLesson(lesson: Lesson): Cefr {
  const first = lesson.level.split(/[–-]/)[0].trim();
  return (["A1", "A2", "B1", "B2", "C1", "C2"].includes(first) ? first : "A2") as Cefr;
}

/** Rough reading and answering time, so a card can promise a realistic length. */
function lessonMinutes(lesson: Lesson) {
  return Math.max(3, Math.round((lesson.phrases.length * 0.5 + lesson.exercises.length * 0.6) * 1.2));
}

type Tab = "dialogues" | "lessons";

/**
 * Slang — one section, where there were two.
 *
 * Everyday English and this lived side by side in the sidebar, and a learner
 * reading two names that meant almost the same thing has to decide which is
 * the right door before they can start. That decision is pure tax: both were
 * teaching how people actually speak, from opposite ends.
 *
 * So they are one room with two shelves now. Dialogues are the way in — you
 * follow a conversation and meet the expressions inside it, which is the half
 * that makes people feel they cannot speak the language at all. Lessons are
 * the other direction: a phrase at a time, with its register, and exercises
 * that ask whether you would say it in this room. What did not survive the
 * merge was the flip-card phrasebook, which was the third way of showing the
 * same phrases and the only one nobody ever finished.
 */
export default function Slang() {
  const { t, i18n } = useTranslation();
  const ru = i18n.language.startsWith("ru");
  const [tab, setTab] = useState<Tab>("dialogues");
  const [level, setLevel] = useState<Cefr | null>(null);
  const [open, setOpen] = useState<Dialogue | null>(null);
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [lessonResults, setLessonResults] = useState<Record<string, LessonResult>>({});
  const { ref: tabsRef, style: tabsStyle } = useSegmented(tab);

  useEffect(() => setLessonResults(getLessonResults()), [openLesson]);

  const results = useMemo(() => getSlangResults(), [open]);

  const ranked = useMemo(() => rankLessons(everydayLessons), []);
  const lesson = openLesson ? ranked.find((l) => l.id === openLesson) : undefined;
  const nextLesson = lesson
    ? ranked[(ranked.findIndex((l) => l.id === lesson.id) + 1) % ranked.length]
    : undefined;

  const lessons = useMemo(
    () => (level ? ranked.filter((l) => levelOfLesson(l) === level) : ranked),
    [ranked, level],
  );

  const lessonCounts = useMemo(() => {
    const out: Partial<Record<Cefr, number>> = {};
    for (const l of ranked) {
      const key = levelOfLesson(l);
      out[key] = (out[key] ?? 0) + 1;
    }
    return out;
  }, [ranked]);

  const counts = useMemo(() => {
    const out: Partial<Record<Cefr, number>> = {};
    for (const dialogue of slangDialogues) out[dialogue.level] = (out[dialogue.level] ?? 0) + 1;
    return out;
  }, []);

  const shown = useMemo(
    () => (level ? slangDialogues.filter((d) => d.level === level) : slangDialogues),
    [level],
  );

  const passed = everydayLessons.filter((l) => lessonResults[l.id]).length;

  /* Every hook above this line, every early return below it. Opening a lesson
     returned before two of the memos had run, and React counts hooks — so the
     section crashed the moment anyone clicked one. */
  if (lesson) {
    return (
      <LessonRunner
        key={lesson.id}
        lesson={lesson}
        onExit={() => setOpenLesson(null)}
        onNextLesson={nextLesson && nextLesson.id !== lesson.id ? () => setOpenLesson(nextLesson.id) : undefined}
      />
    );
  }

  if (open) {
    return (
      <SectionHero title={t("nav.slang")} description={t("slangModule.intro")}>
        <DialogueRunner dialogue={open} onExit={() => setOpen(null)} />
      </SectionHero>
    );
  }

  return (
    <SectionHero title={t("nav.slang")} description={t("slangModule.intro")}>
      <div className="segmented mt-7" ref={tabsRef} style={tabsStyle} role="tablist">
        {(["dialogues", "lessons"] as Tab[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => {
              setTab(key);
              setLevel(null);
            }}
            className={`segmented__item${tab === key ? " is-active" : ""}`}
          >
            {key === "dialogues"
              ? t("slangModule.dialoguesTab")
              : `${t("slangModule.lessonsTab")} · ${passed}/${everydayLessons.length}`}
          </button>
        ))}
      </div>

      {tab === "lessons" ? (
        <>
          <p className="mt-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
            {t("slangModule.lessonsIntro")}
          </p>

          <div className="mt-5">
            <LevelFilter value={level} counts={lessonCounts} onChange={setLevel} />
          </div>

          <div className="sl-grid">
            {lessons.length === 0 && (
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {t("levels.empty")}
              </p>
            )}
            {lessons.map((l) => {
              const result = lessonResults[l.id];
              return (
                <button key={l.id} type="button" className="sl-card" onClick={() => setOpenLesson(l.id)}>
                  <div className="sl-card__top">
                    <span className="sl-card__level">{l.level}</span>
                    {result && (
                      <span className="sl-card__done">
                        ✓ {result.bestCorrect}/{result.total}
                      </span>
                    )}
                  </div>
                  <span className="sl-card__title">{l.title}</span>
                  <span className="sl-card__scene">{ru ? l.goalRu : l.goal}</span>
                  <span className="sl-card__meta">
                    {t("everyday.phraseCount", { count: l.phrases.length })} ·{" "}
                    {t("everyday.minutes", { count: lessonMinutes(l) })}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
      <p className="mt-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
        {t("slangModule.shelfMeta", {
          dialogues: slangDialogues.length,
          expressions: allExpressions().length,
        })}
      </p>

      <div className="mt-5">
        <LevelFilter value={level} counts={counts} onChange={setLevel} />
      </div>

      <div className="sl-grid">
        {shown.map((dialogue) => {
          const result = results[dialogue.id];
          return (
            <button key={dialogue.id} type="button" className="sl-card" onClick={() => setOpen(dialogue)}>
              <div className="sl-card__top">
                <span className="sl-card__level">{dialogue.level}</span>
                {result && (
                  <span className="sl-card__done">
                    ✓ {result.bestCorrect}/{result.total}
                  </span>
                )}
              </div>
              <span className="sl-card__title">{ru ? dialogue.titleRu : dialogue.title}</span>
              <span className="sl-card__scene">{ru ? dialogue.sceneRu : dialogue.scene}</span>
              <span className="sl-card__meta">
                {t("slangModule.cardMeta", { count: dialogue.expressions.length })}
              </span>
            </button>
          );
        })}
      </div>
        </>
      )}
    </SectionHero>
  );
}
