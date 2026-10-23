import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getLearnerProfile, isOnboardingDeferred } from "@/lib/learnerProfile";
import { syncSettled, whenSynced } from "@/lib/sync";
import Landing from "./Landing";
import Dashboard from "./Dashboard";

/**
 * "/" means two different things.
 *
 * Signed out, it's the pitch: what the method is and why it works. Signed in,
 * that pitch is noise — and its "create an account" button was actively
 * confusing, since the visitor already has one. So the route resolves to
 * whichever page is true for the current session.
 */
export default function Home() {
  const { user, loading } = useAuth();

  /*
   * The profile arrives from the server, and this decision depends on it.
   *
   * It is kept on the device and read from the device, which is right for
   * every other reader of it — but on a browser this account has not used
   * before, the device copy is empty until the first sync lands. For the
   * second between signing in and that pull finishing, "has not answered the
   * questions" and "has not been told yet" look identical from here, and this
   * route acted on the first reading: people who had answered the questions
   * months ago were sent to answer them again. Only sometimes, because it was
   * a race.
   */
  const [synced, setSynced] = useState(syncSettled);

  useEffect(() => {
    if (synced) return;
    let live = true;
    void whenSynced().then(() => live && setSynced(true));
    return () => {
      live = false;
    };
  }, [synced]);

  // Auth restores asynchronously. Rendering the landing during that gap makes
  // a signed-in user see a sign-up pitch flash on every reload.
  if (loading) return <div className="min-h-[60vh]" />;

  // Same for the profile: hold the blank frame rather than guess.
  if (user && !synced) return <div className="min-h-[60vh]" />;

  /*
   * A new account lands here, not on a guarded route.
   *
   * The same check lives in RequireAuth, which covers somebody who arrives
   * deep — a shared link to a text, say. It does not cover "/" because this
   * route is deliberately outside the wall: it has to render the landing page
   * to signed-out visitors. So the commonest path of all, signing in and
   * being dropped on the dashboard, went straight past the redirect.
   */
  if (user && !getLearnerProfile() && !isOnboardingDeferred()) {
    return <Navigate to="/onboarding" replace />;
  }

  return user ? <Dashboard /> : <Landing />;
}
