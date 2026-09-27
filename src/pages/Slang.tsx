import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionHero } from "@/components/SectionHero";
import { LevelFilter } from "@/components/LevelFilter";
import { DialogueRunner } from "@/components/slang/DialogueRunner";
import { LessonRunner } from "@/components/everyday/LessonRunner";
import { slangDialogues, slangShelf, type Dialogue, type SlangTopic } from "@/data/slangDialogues";
import { everydayLessons, type Lesson } from "@/data/everydayLessons";
import { getSlangResults } from "@/lib/slangProgress";
import { getLessonResults, type LessonResult } from "@/lib/lessonProgress";
import { rankLessons } from "@/lib/learnerProfile";
import type { Cefr } from "@/lib/textLevel";
import "@/components/slang/slang.css";

/**
 * One shelf, not two.
 *
 * Dialogues and lessons used to live behind a pair of tabs, which asked the
 * learner to choose a *format* before they had seen a subject. Nobody knows
 * whether they want a dialogue or a lesson; they know they are going to a
 * party on Friday. So the subject comes first, the same way it does in reading
 * and in dictation, and the two formats sit together inside it with a label
 * saying which is which.
 */
type Item =
  | { kind: "dialogue"; id: string; topic: SlangTopic; level: string; dialogue: Dialogue }
  | { kind: "lesson"; id: string; topic: SlangTopic; level: string; lesson: Lesson };

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
  const [topic, setTopic] = useState<SlangTopic | null>(null);
  const [level, setLevel] = useState<Cefr | null>(null);
  const [open, setOpen] = useState<Dialogue | null>(null);
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [lessonResults, setLessonResults] = useState<Record<string, LessonResult>>({});

  useEffect(() => setLessonResults(getLessonResults()), [openLesson]);

  const results = useMemo(() => getSlangResults(), [open]);

  const ranked = useMemo(() => rankLessons(everydayLessons), []);
  const lesson = openLesson ? ranked.find((l) => l.id === openLesson) : undefined;
  const nextLesson = lesson
    ? ranked[(ranked.findIndex((l) => l.id === lesson.id) + 1) % ranked.length]
    : undefined;

  /** The nine rooms and what each one holds. Fixed data, computed once. */
  const shelf = useMemo(() => slangShelf(everydayLessons), []);

  /*
   * Both formats in one list, ordered so a conversation comes before the
   * lesson that dissects it. Meeting an expression in use and then taking it
   * apart is the order that works; the reverse is a vocabulary list with a
   * story attached.
   */
  const items = useMemo<Item[]>(() => {
    const dialogues: Item[] = slangDialogues.map((dialogue) => ({
      kind: "dialogue",
      id: dialogue.id,
      topic: dialogue.topic,
      level: dialogue.level,
      dialogue,
    }));
    const lessons: Item[] = ranked.map((lesson) => ({
      kind: "lesson",
      id: lesson.id,
      topic: lesson.topic,
      level: lesson.level,
      lesson,
    }));
    return [...dialogues, ...lessons];
  }, [ranked]);

  const inTopic = useMemo(
    () => (topic ? items.filter((item) => item.topic === topic) : []),
    [items, topic],
  );

  const counts = useMemo(() => {
    const out: Partial<Record<Cefr, number>> = {};
    for (const item of inTopic) {
      const key = item.level.split(/[–-]/)[0].trim() as Cefr;
      out[key] = (out[key] ?? 0) + 1;
    }
    return out;
  }, [inTopic]);

  const shown = useMemo(
    () =>
      level
        ? inTopic.filter((item) => item.level.split(/[–-]/)[0].trim() === level)
        : inTopic,
    [inTopic, level],
  );

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
      {/* Stage one: the subject. Same shape as reading and dictation, because
          the three shelves are browsed by the same person and a section that
          rearranges itself between visits is one people stop trusting. */}
      {!topic && (
        <div data-stagger className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shelf.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setTopic(entry.id)}
              disabled={entry.total === 0}
              className="card card--interactive card--accent flex h-full flex-col p-5 text-left disabled:opacity-50"
            >
              <h2 className="page-title text-lg leading-snug">
                {t(`slangModule.topics.${entry.id}`)}
              </h2>
              <p className="mt-2 flex-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                {t("slangModule.itemCount", { count: entry.total })}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {(["A1", "A2", "B1", "B2", "C1", "C2"] as const)
                  .filter((lv) => entry.counts[lv])
                  .map((lv) => (
                    <span
                      key={lv}
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: "var(--color-surface-2)", color: "var(--color-text-muted)" }}
                    >
                      {lv} · {entry.counts[lv]}
                    </span>
                  ))}
              </div>
            </button>
          ))}
        </div>
      )}

      {topic && (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                setTopic(null);
                setLevel(null);
              }}
              className="text-sm font-semibold"
              style={{ color: "var(--color-text-muted)" }}
            >
              ← {t("slangModule.allTopics")}
            </button>
            <LevelFilter value={level} counts={counts} onChange={setLevel} />
          </div>

          {/* A list, not a grid of tiles — titles are what is being scanned. */}
          <div data-stagger className="mt-5 space-y-2">
            {shown.length === 0 && (
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {t("levels.empty")}
              </p>
            )}
            {shown.map((item) => {
              const done =
                item.kind === "dialogue" ? results[item.id] : lessonResults[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  className="card card--interactive card--accent flex w-full items-center gap-4 px-4 py-3.5 text-left"
                  onClick={() =>
                    item.kind === "dialogue" ? setOpen(item.dialogue) : setOpenLesson(item.id)
                  }
                >
                  <span className="level flex-none">{item.level}</span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      {item.kind === "dialogue"
                        ? ru
                          ? item.dialogue.titleRu
                          : item.dialogue.title
                        : ru
                          ? item.lesson.titleRu
                          : item.lesson.title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {item.kind === "dialogue"
                        ? ru
                          ? item.dialogue.sceneRu
                          : item.dialogue.scene
                        : ru
                          ? item.lesson.goalRu
                          : item.lesson.goal}
                    </span>
                  </span>

                  {/* Which of the two this is. The formats teach differently and
                      a learner should be able to tell before opening one. */}
                  <span
                    className="hidden flex-none rounded-full px-2 py-0.5 text-[10px] font-bold sm:inline-flex"
                    style={{
                      background: "color-mix(in srgb, var(--color-accent) 14%, transparent)",
                      color: "var(--color-accent-ink)",
                    }}
                  >
                    {t(`slangModule.kind.${item.kind}`)}
                  </span>

                  {done && (
                    <span className="flex-none text-xs font-bold" style={{ color: "var(--color-success)" }}>
                      ✓ {done.bestCorrect}/{done.total}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

    </SectionHero>
  );
}
