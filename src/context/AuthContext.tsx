import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { clearLocalProgress } from "@/lib/localState";
import { setSyncUser } from "@/lib/sync";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** True when the session is a local stand-in rather than a real account. */
  demo: boolean;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  resendConfirmation: (email: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Demo mode: pretend someone is signed in, without an account.
 *
 * Everything behind the sign-in wall — the dashboard, the section navigation,
 * the stat strip — is otherwise untestable until email delivery works, and
 * email delivery is waiting on SMTP. This unblocks that, and only that: it is
 * switched on by a local env variable, never touches Supabase, and deliberately
 * does not start syncing, because there is no account to sync to. Progress in
 * demo mode lives in this browser and stays there.
 *
 * Turn it on with VITE_DEMO_MODE=true in .env.local, off by deleting the line.
 */
const DEMO = import.meta.env.VITE_DEMO_MODE === "true";

const DEMO_USER = {
  id: "demo-user",
  email: "demo@eaglish.local",
  aud: "demo",
  app_metadata: {},
  user_metadata: {},
  created_at: new Date().toISOString(),
} as unknown as User;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [demoSignedIn, setDemoSignedIn] = useState(DEMO);
  const [loading, setLoading] = useState(!DEMO && isSupabaseConfigured);

  useEffect(() => {
    if (DEMO || !supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      // Pull the account's progress and push anything done while signed out.
      void setSyncUser(data.session?.user.id ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      void setSyncUser(newSession?.user.id ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  /*
   * Create the account, and say whether the person is already inside.
   *
   * Supabase answers sign-up in one of two ways depending on a project
   * setting the client cannot see: with a session, meaning they are signed in
   * now, or without one, meaning a confirmation email has been sent and there
   * will be no session until the link is opened. This used to throw the
   * answer away and route everybody to onboarding — which sits behind the
   * auth wall, so everyone awaiting confirmation was bounced straight back to
   * the login page seconds after creating an account.
   */
  const signUp = async (email: string, password: string) => {
    if (DEMO) return { error: null, needsConfirmation: false };
    if (!supabase) return { error: "Supabase is not configured yet.", needsConfirmation: false };
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null, needsConfirmation: !error && !data.session };
  };

  /* A second copy of the confirmation email. The first one goes missing often
     enough — spam folders, typos caught too late, a phone that was offline —
     that without this the only route back is to start again. */
  const resendConfirmation = async (email: string) => {
    if (DEMO) return { error: null };
    if (!supabase) return { error: "Supabase is not configured yet." };
    const { error } = await supabase.auth.resend({ type: "signup", email });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    if (DEMO) {
      setDemoSignedIn(true);
      return { error: null };
    }
    if (!supabase) return { error: "Supabase is not configured yet." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  /**
   * Sign in with a Google account.
   *
   * Worth having for a reason beyond convenience: most people who abandon a
   * sign-up do it at the password field, either inventing one they will forget
   * or reusing one that has already leaked. A button that needs neither
   * removes the commonest place to give up — and removes our need to hold a
   * password at all for whoever uses it.
   *
   * This leaves the page: the browser goes to Google and comes back with a
   * session in the URL, which the client exchanges on arrival. Nothing after
   * the call runs, so there is no success branch here.
   */
  const signInWithGoogle = async () => {
    if (DEMO) {
      setDemoSignedIn(true);
      return { error: null };
    }
    if (!supabase) return { error: "Supabase is not configured yet." };

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    return { error: error?.message ?? null };
  };

  /*
   * End the session, and leave nothing of this learner on the device.
   *
   * The clearing is the point. Local progress is uploaded by `pushLocalState`
   * as soon as a session appears, so whatever survives a sign-out is handed
   * to whoever signs in next — their vocabulary, their streak, their reading
   * history, written into somebody else's account. It happens before the
   * sign-out call so there is no window in which a fresh session can see the
   * old data. Preferences stay: see PROGRESS_KEYS.
   */
  const signOut = async () => {
    clearLocalProgress();
    if (DEMO) {
      setDemoSignedIn(false);
      return;
    }
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const user = DEMO ? (demoSignedIn ? DEMO_USER : null) : (session?.user ?? null);

  return (
    <AuthContext.Provider value={{ user, session, loading, demo: DEMO, signUp, resendConfirmation, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
