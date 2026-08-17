import { supabase } from "./supabase";
import { getVocabulary, mergeRemoteVocabulary, type VocabularyWord } from "./vocabularyStore";
import { getWritingHistory, mergeRemoteWriting, type WritingSubmission } from "./writingHistory";
import {
  mergeRemoteReading,
  mergeRemoteQuiz,
  type ReadingSessionEntry,
  type QuizResult,
} from "./readingHistory";
import { getActivity, mergeRemoteActivity, type ActivityKind, type DayActivity } from "./activityStore";
import { getLearnerProfile, mergeRemoteProfile, type LearnerProfile } from "./learnerProfile";

/**
 * Local-first sync.
 *
 * Every write lands in localStorage first and is mirrored to Supabase in the
 * background. Reads never wait on the network, the app keeps working offline
 * and while signed out, and a failed sync can never break the UI — push errors
 * are logged, never thrown.
 *
 * On sign-in we pull the account's rows and merge them into the local cache,
 * then push anything the device has that the server doesn't. That's what makes
 * progress follow the user to a second device.
 */

let currentUserId: string | null = null;

/**
 * Append-only writes that happened before a session was available.
 *
 * Restoring a session is asynchronous, so a page that logs activity on mount
 * (opening a reading text, for example) fires before `currentUserId` is known.
 * Snapshot data survives that gap because sign-in re-pushes it wholesale, but
 * logs can't be re-pushed without duplicating history — so they wait here and
 * are flushed once the user is known.
 */
const pending: (() => void)[] = [];
const PENDING_LIMIT = 200;

function queue(op: () => void) {
  if (!supabase) return; // No backend configured — nothing to catch up to.
  if (pending.length < PENDING_LIMIT) pending.push(op);
}

function flushPending() {
  const ops = pending.splice(0, pending.length);
  ops.forEach((op) => op());
}

function client() {
  return currentUserId && supabase ? supabase : null;
}

function warn(label: string, error: unknown) {
  console.warn(`[sync] ${label} failed`, error);
}

/**
 * The learner profile needs a column that older projects don't have yet (see
 * supabase/migrations). One failure is enough to know it's missing — after that
 * we stay local instead of warning on every save.
 */
let profileColumnMissing = false;

export function pushLearnerProfile(profile: LearnerProfile) {
  const db = client();
  if (!db || profileColumnMissing) return;
  db.from("profiles")
    .upsert({ id: currentUserId, english_level: profile.level, learner_profile: profile })
    .then(({ error }) => {
      if (!error) return;
      profileColumnMissing = true;
      warn("push learner profile (staying local)", error);
    });
}

/* ── Writes (fire-and-forget) ─────────────────────────────────────────── */

export function pushVocabularyWord(word: VocabularyWord) {
  const db = client();
  if (!db) return;
  db.from("vocabulary_words")
    .upsert({
      id: word.id,
      user_id: currentUserId,
      word: word.word,
      translation: word.translation,
      source_text: word.sourceText ?? null,
      added_at: new Date(word.addedAt).toISOString(),
      interval_days: word.interval,
      ease_factor: word.easeFactor,
      due_at: new Date(word.dueAt).toISOString(),
      review_count: word.reviewCount,
    })
    .then(({ error }) => error && warn("push vocabulary", error));
}

export function deleteVocabularyWord(id: string) {
  const db = client();
  if (!db) return;
  db.from("vocabulary_words")
    .delete()
    .eq("id", id)
    .then(({ error }) => error && warn("delete vocabulary", error));
}

export function pushWritingSubmission(entry: WritingSubmission) {
  const db = client();
  if (!db) return;
  db.from("writing_submissions")
    .upsert({
      id: entry.id,
      user_id: currentUserId,
      topic_id: entry.topicId,
      word_count: entry.wordCount,
      grammar: entry.scores.grammar,
      vocabulary: entry.scores.vocabulary,
      coherence: entry.scores.coherence,
      overall: entry.scores.overall,
      submitted_at: new Date(entry.submittedAt).toISOString(),
    })
    .then(({ error }) => error && warn("push writing", error));
}

export function pushReadingOpen(entry: ReadingSessionEntry) {
  const db = client();
  if (!db) return queue(() => pushReadingOpen(entry));
  db.from("reading_sessions")
    .insert({
      user_id: currentUserId,
      text_id: entry.textId,
      opened_at: new Date(entry.openedAt).toISOString(),
    })
    .then(({ error }) => error && warn("push reading session", error));
}

export function pushQuizResult(result: QuizResult) {
  const db = client();
  if (!db) return queue(() => pushQuizResult(result));
  db.from("quiz_results")
    .insert({
      user_id: currentUserId,
      text_id: result.textId,
      correct: result.correct,
      total: result.total,
      answered_at: new Date(result.at).toISOString(),
    })
    .then(({ error }) => error && warn("push quiz result", error));
}

export function pushActivityDay(day: DayActivity) {
  const db = client();
  if (!db) return;
  db.from("daily_activity")
    .upsert(
      {
        user_id: currentUserId,
        day: day.date,
        reading: day.counts.reading ?? 0,
        writing: day.counts.writing ?? 0,
        vocabulary: day.counts.vocabulary ?? 0,
        quiz: day.counts.quiz ?? 0,
      },
      { onConflict: "user_id,day" },
    )
    .then(({ error }) => error && warn("push activity", error));
}

/* ── Pull + merge on sign-in ──────────────────────────────────────────── */

const ACTIVITY_KINDS: ActivityKind[] = ["reading", "writing", "vocabulary", "quiz"];

async function pullAll() {
  const db = client();
  if (!db) return;

  const [vocab, writing, reading, quiz, activity, profile] = await Promise.all([
    db.from("vocabulary_words").select("*"),
    db.from("writing_submissions").select("*"),
    db.from("reading_sessions").select("*"),
    db.from("quiz_results").select("*"),
    db.from("daily_activity").select("*"),
    db.from("profiles").select("learner_profile").eq("id", currentUserId).maybeSingle(),
  ]);

  if (profile.error) profileColumnMissing = true;
  else mergeRemoteProfile((profile.data?.learner_profile as LearnerProfile | null) ?? null);

  if (vocab.data) {
    mergeRemoteVocabulary(
      vocab.data.map((r) => ({
        id: r.id,
        word: r.word,
        translation: r.translation,
        sourceText: r.source_text ?? undefined,
        addedAt: Date.parse(r.added_at),
        interval: r.interval_days,
        easeFactor: r.ease_factor,
        dueAt: Date.parse(r.due_at),
        reviewCount: r.review_count,
      })),
    );
  }

  if (writing.data) {
    mergeRemoteWriting(
      writing.data.map((r) => ({
        id: r.id,
        topicId: r.topic_id,
        wordCount: r.word_count,
        scores: {
          grammar: r.grammar,
          vocabulary: r.vocabulary,
          coherence: r.coherence,
          overall: r.overall,
        },
        submittedAt: Date.parse(r.submitted_at),
      })),
    );
  }

  if (reading.data) {
    mergeRemoteReading(reading.data.map((r) => ({ textId: r.text_id, openedAt: Date.parse(r.opened_at) })));
  }

  if (quiz.data) {
    mergeRemoteQuiz(
      quiz.data.map((r) => ({
        textId: r.text_id,
        correct: r.correct,
        total: r.total,
        at: Date.parse(r.answered_at),
      })),
    );
  }

  if (activity.data) {
    mergeRemoteActivity(
      activity.data.map((r) => ({
        date: r.day,
        counts: {
          reading: r.reading,
          writing: r.writing,
          vocabulary: r.vocabulary,
          quiz: r.quiz,
        },
      })),
    );
  }
}

/** Send everything the device holds, so work done signed-out isn't lost. */
function pushLocalState() {
  getVocabulary().forEach(pushVocabularyWord);
  getWritingHistory().forEach(pushWritingSubmission);
  getActivity().forEach(pushActivityDay);
  const profile = getLearnerProfile();
  if (profile) pushLearnerProfile(profile);
  // Sessions and quiz rows are append-only logs; re-pushing them would
  // duplicate history, so only the merged snapshot above is synced.
}

/**
 * Called when the signed-in user changes. Passing null (sign-out) simply stops
 * syncing — local data is left alone so the device keeps working.
 */
export async function setSyncUser(userId: string | null) {
  const changed = userId !== currentUserId;
  currentUserId = userId;
  if (!userId || !changed || !supabase) return;

  try {
    await pullAll();
    pushLocalState();
    flushPending();
  } catch (error) {
    warn("initial sync", error);
  }
}

export { ACTIVITY_KINDS };
