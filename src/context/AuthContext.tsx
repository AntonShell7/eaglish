import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { setSyncUser } from "@/lib/sync";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** True when the session is a local stand-in rather than a real account. */
  demo: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
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

  const signUp = async (email: string, password: string) => {
    if (DEMO) return { error: null };
    if (!supabase) return { error: "Supabase is not configured yet." };
    const { error } = await supabase.auth.signUp({ email, password });
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

  const signOut = async () => {
    if (DEMO) {
      setDemoSignedIn(false);
      return;
    }
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const user = DEMO ? (demoSignedIn ? DEMO_USER : null) : (session?.user ?? null);

  return (
    <AuthContext.Provider value={{ user, session, loading, demo: DEMO, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
