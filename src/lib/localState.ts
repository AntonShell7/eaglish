/**
 * The local keys that belong to one learner, and how to drop them.
 *
 * Every one of these is written on the device as the person works, and all of
 * them are uploaded by `pushLocalState` when a session appears. That pairing
 * is what made signing out dangerous: nothing cleared on the way out, so the
 * next person to sign in on the same device — a friend trying the app on a
 * borrowed laptop, someone with two accounts — inherited the previous
 * learner's vocabulary, streak and history, and then pushed all of it to
 * their own row in the database. The leak is silent in both directions: the
 * newcomer sees words they never saved, and the original's progress is now
 * attached to an account that is not theirs.
 *
 * Preferences are deliberately not on this list. The theme, the interface
 * language, the consent decision and the small input choices belong to the
 * *browser*, not to the account; wiping them would log somebody out into a
 * suddenly light-themed English-language app and ask them about cookies
 * again, which reads as a malfunction rather than as privacy.
 */

/** Per-learner state. Cleared when a session ends. */
export const PROGRESS_KEYS = [
  "vocabularyWords",
  "activityLog",
  "learnerProfile",
  "onboardingDeferred",
  "readingHistory",
  "readingQuizResults",
  "reviewLog",
  "dictationProgress",
  "slangProgress",
  "knownWords",
  "activeWords",
  "completedTasks",
  "dailyGoal",
  "dailyGoalClosed",
  "dailyGoalSkipped",
  "dailyDesk",
  "deskSlotMinutes",
  "everydayLessonProgress",
  "trackDone",
  "trackSeen",
  "personalTexts",
  "writingDrafts",
  "writingHistory",
  "videoExercises",
  "timeOnSite",
  /* The cached plan. It is an answer about one account, so leaving it behind
     would show the next person to sign in on this device a paid interface
     bought by somebody else. */
  "accessPlan",
] as const;

/**
 * Forget the signed-out learner.
 *
 * Each key is removed on its own rather than through `localStorage.clear()`,
 * which would take the preferences with it — and would also take the Supabase
 * auth token, which Supabase is in the middle of clearing itself.
 */
export function clearLocalProgress() {
  if (typeof window === "undefined") return;
  for (const key of PROGRESS_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* Private mode, or storage disabled. Nothing was written either. */
    }
  }
}
