import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionHero } from "@/components/SectionHero";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { DialogueRunner } from "@/components/slang/DialogueRunner";
import { LessonRunner } from "@/components/everyday/LessonRunner";
import { slangDialogues, slangShelf, type Dialogue, type SlangTopic } from "@/data/slangDialogues";
import { everydayLessons, type Lesson } from "@/data/everydayLessons";
import { getSlangResults } from "@/lib/slangProgress";
import { getLessonResults, type LessonResult } from "@/lib/lessonProgress";
import { rankLessons } from "@/lib/learnerProfile";
import { TrackPath } from "@/components/track/TrackPath";
import { LessonPlayer } from "@/components/track/LessonPlayer";
import { findLesson } from "@/data/track";
import "@/components/slang/slang.css";

/*
 * No CEFR level in this section, and that is deliberate.
 *
 * Reading and dictation are filed by level because comprehension tracks it
 * closely: a C1 text is genuinely harder to read than an A2 one. Colloquial
 * English does not behave that way. Someone who reads C1 academic prose can be
 * lost in a pub, and someone at A1 who spends their evenings on Discord can be
 * fluent in exactly this register and nowhere else. Filing it by level would
 * sort it along an axis it does not vary on, and would tell an A1 learner that
 * "alright, mate" is above them, which is false.
 *
 * So the shelf is subjects, and inside a subject the only label is which of
 * the two formats a row is. The levels stay in the data — the runners still
 * use them — they just stop being a thing anyone browses by.
 */

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
  /* Room and item in the address, as in reading and dictation. The id slot
     holds either kind: a dialogue and a lesson are different screens but the
     same thing to a link, and the learner choosing one does not care which
     format it turned out to be. */
  const { topic: topicParam, id: itemId } = useParams<{ topic?: string; id?: string }>();
  const navigate = useNavigate();

  /* The track rides on the section's own routing rather than a new route:
     "track" is not one of the nine subjects, so everything below that filters
     by topic simply finds nothing, and the two early returns here take over. */
  const onTrack = topicParam === "track";
  const topic = onTrack ? null : ((topicParam as SlangTopic | undefined) ?? null);
  const [lessonResults, setLessonResults] = useState<Record<string, LessonResult>>({});

  const open = itemId ? (slangDialogues.find((d) => d.id === itemId) ?? null) : null;
  const openLesson = itemId && !open ? itemId : null;

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

  /* Dialogues before lessons: meeting an expression in use and then taking it
     apart is the order that works, and the reverse is a vocabulary list with a
     story attached. */
  const shown = inTopic;

  /* Every hook above this line, every early return below it. Opening a lesson
     returned before two of the memos had run, and React counts hooks — so the
     section crashed the moment anyone clicked one. */
  if (lesson) {
    return (
      <LessonRunner
        key={lesson.id}
        lesson={lesson}
        onExit={() => navigate(topic ? `/slang/${topic}` : "/slang")}
        onNextLesson={
          nextLesson && nextLesson.id !== lesson.id
            ? () => navigate(`/slang/${nextLesson.topic}/${nextLesson.id}`)
            : undefined
        }
      />
    );
  }

  if (open) {
    return (
      <SectionHero title={t("nav.slang")} description={t("slangModule.intro")}>
        <DialogueRunner dialogue={open} onExit={() => navigate(topic ? `/slang/${topic}` : "/slang")} />
      </SectionHero>
    );
  }

  /* A track lesson takes the whole page: no hero, no section title, nothing
     above the progress bar. Everything that is not the question is a reason
     to look away from the question. */
  if (onTrack && itemId) {
    const found = findLesson(itemId);
    if (!found) return <Navigate to="/slang" replace />;
    return (
      <div className="mx-auto max-w-3xl px-5 py-8">
        <LessonPlayer
          key={found.lesson.id}
          module={found.module}
          lesson={found.lesson}
          onExit={() => navigate("/slang")}
        />
      </div>
    );
  }

  return (
    <SectionHero title={t("nav.slang")} description={t("slangModule.intro")}>
      {/* The path comes first, because it is what this section is for now.
          Colloquial English is not browsed, it is accumulated: one short
          lesson at a time, with what was learnt coming back a few lessons
          later. The subject shelf below is the old shape, kept while the
          path is four lessons long — forty-two written items are not worth
          throwing away to make a point about navigation. */}
      {!topic && <TrackPath onOpen={(id) => navigate(`/slang/track/${id}`)} />}

      {!topic && (
        <div className="mt-14">
          <h2 className="page-title text-lg">{t("track.oldShelf")}</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
            {t("track.oldShelfNote")}
          </p>
        </div>
      )}

      {!topic && (
        <div data-stagger className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shelf.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => navigate(`/slang/${entry.id}`)}
              disabled={entry.total === 0}
              className="card card--interactive card--accent flex h-full flex-col p-5 text-left disabled:opacity-50"
            >
              <h2 className="page-title text-lg leading-snug">
                {t(`slangModule.topics.${entry.id}`)}
              </h2>
              <p className="mt-2 flex-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                {t("slangModule.itemCount", { count: entry.total })}
              </p>
            </button>
          ))}
        </div>
      )}

      {topic && (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate("/slang")}
              className="text-sm font-semibold"
              style={{ color: "var(--color-text-muted)" }}
            >
              ← {t("slangModule.allTopics")}
            </button>
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
                  onClick={() => navigate(`/slang/${item.topic}/${item.id}`)}
                >
                  {/* The format, where the other two shelves put the level.
                      A row still needs an anchor on the left, and this is the
                      one distinction that changes what happens when you open
                      it: a dialogue is read through, a lesson is worked. */}
                  <span className="level flex-none">{t(`slangModule.kind.${item.kind}`)}</span>

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
