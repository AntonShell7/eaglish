import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getLearnerProfile, isOnboardingDeferred } from "@/lib/learnerProfile";
import { syncSettled, whenSynced } from "@/lib/sync";

/**
 * The wall around the learning sections.
 *
 * Everything behind it writes progress — saved words, review schedules, streaks
 * — and progress without an account has nowhere to go: it lands in one
 * browser's localStorage and is gone with the next device or a cleared cache.
 * Letting someone read for twenty minutes and then quietly losing the words
 * they saved is worse than asking them to sign in first.
 *
 * The public edges stay open: the landing page, the auth pages themselves, and
 * the legal pages, which have to be readable *before* anyone agrees to them.
 */
export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  /* The same wait as on "/": the profile comes from the server, and until it
     has, an empty device copy is indistinguishable from an unanswered
     questionnaire. See the note in src/lib/sync.ts. */
  const [synced, setSynced] = useState(syncSettled);

  useEffect(() => {
    if (synced) return;
    let live = true;
    void whenSynced().then(() => live && setSynced(true));
    return () => {
      live = false;
    };
  }, [synced]);

  // Restoring a session takes a moment. Redirecting during it would bounce a
  // signed-in user to the login screen on every hard refresh.
  if (loading || (user && !synced)) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="skeleton h-8 w-48 rounded-[var(--radius-sm)]" />
        <div className="skeleton mt-4 h-4 w-72 rounded-[var(--radius-sm)]" />
        <div className="skeleton mt-8 h-40 w-full rounded-[var(--radius-lg)]" />
      </div>
    );
  }

  if (!user) {
    // `from` is what sends them back to the page they actually wanted once
    // they are in, instead of dumping everyone on the dashboard.
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  /*
   * No profile yet, so the app does not know what level to serve.
   *
   * It used to wait to be asked — a card on the dashboard offering to set a
   * level — which meant most people never set one, and the app spent their
   * first week guessing. Everything it chooses hangs off that guess: which
   * texts appear, how hard the dictation is, what the first review looks
   * like. Four questions is a cheap price for the whole product working
   * properly, and the one moment somebody will pay it is the moment they
   * arrive.
   *
   * This covers Google as well, which is why it lives here rather than in
   * the email sign-up flow: an OAuth round trip comes back to whatever page
   * it started from, so routing the new account from inside Register would
   * have missed exactly the people who took the quickest way in.
   *
   * `later` is honoured. Without that, declining it is a loop.
   */
  if (
    location.pathname !== "/onboarding" &&
    !getLearnerProfile() &&
    !isOnboardingDeferred()
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
