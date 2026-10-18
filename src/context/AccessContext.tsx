import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { cachedAccess, clearCachedAccess, fetchAccess, FREE, type Access } from "@/lib/access";
import type { PlanId } from "@/lib/plans";

/**
 * What this learner is entitled to, for everything that has to ask.
 *
 * The route guard, the paywall, the lock marks in the navigation and the
 * profile all need the same answer, and all of them render before a network
 * request could finish. So the cached answer is used immediately and the
 * server is asked in the background — which means the common case, a paying
 * learner opening a paid section, never shows them a price.
 *
 * `loading` is true only when there is nothing cached to show. A refresh of a
 * known plan is not a loading state, because treating it as one is what makes
 * an app flicker.
 */

interface AccessContextValue {
  plan: PlanId;
  expiresAt: string | null;
  source: string | null;
  isPro: boolean;
  /** No answer yet, cached or otherwise. Guards should wait rather than refuse. */
  loading: boolean;
  /** Ask the server again — after redeeming a code, or returning from payment. */
  refresh: () => Promise<void>;
  /** Adopt an answer already in hand, so redeeming a code updates at once. */
  adopt: (access: Access) => void;
}

const AccessContext = createContext<AccessContextValue | null>(null);

/**
 * In demo mode there is no account to ask about, so the plan is whatever the
 * browser says it is: `demoPlan` in localStorage, defaulting to pro.
 *
 * Pro by default because demo mode exists to make the signed-in app testable
 * without email delivery, and a demo that locks three of the five sections
 * tests less than it used to. Set `demoPlan` to "free" in the console to look
 * at the paywall instead.
 */
function demoPlan(): PlanId {
  try {
    return window.localStorage.getItem("demoPlan") === "free" ? "free" : "pro";
  } catch {
    return "pro";
  }
}

export function AccessProvider({ children }: { children: ReactNode }) {
  const { user, demo, loading: authLoading } = useAuth();

  const [access, setAccess] = useState<Access | null>(() => (demo ? null : cachedAccess()));
  const [asked, setAsked] = useState(false);

  const refresh = useCallback(async () => {
    if (demo) {
      setAccess({ plan: demoPlan(), expiresAt: null, source: "demo" });
      setAsked(true);
      return;
    }
    const answer = await fetchAccess();
    /* null means the question could not be asked. Keep what we had: a tunnel
       is not a reason to tell somebody their subscription ended. */
    if (answer) setAccess(answer);
    setAsked(true);
  }, [demo]);

  useEffect(() => {
    if (authLoading) return;

    if (demo) {
      setAccess({ plan: demoPlan(), expiresAt: null, source: "demo" });
      setAsked(true);
      return;
    }

    /* Signed out: no plan, and nothing cached should survive — the cache is
       cleared on sign-out too, but a session can also simply expire. */
    if (!user) {
      clearCachedAccess();
      setAccess(FREE);
      setAsked(true);
      return;
    }

    setAsked(false);
    void refresh();
  }, [user, demo, authLoading, refresh]);

  const effective = access ?? FREE;

  return (
    <AccessContext.Provider
      value={{
        plan: effective.plan,
        expiresAt: effective.expiresAt,
        source: effective.source,
        isPro: effective.plan === "pro",
        loading: authLoading || (!asked && access === null),
        refresh,
        adopt: (next) => {
          setAccess(next);
          setAsked(true);
        },
      }}
    >
      {children}
    </AccessContext.Provider>
  );
}

export function useAccess() {
  const ctx = useContext(AccessContext);
  if (!ctx) throw new Error("useAccess must be used within AccessProvider");
  return ctx;
}
