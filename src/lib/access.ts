/**
 * Reading and changing what this account is entitled to.
 *
 * The server is the authority. This module only asks it, caches the answer so
 * the interface does not flicker, and offers the one way a plan can change
 * from inside the app: typing a code.
 *
 * The cache deserves a word, because caching an entitlement sounds like a hole
 * and is not one here. It decides what the *interface* shows, and the
 * interface was never the thing holding the line — the sections ship in the
 * bundle and the model allowance is counted in Postgres. So the worst a stale
 * or forged cache does is show somebody buttons that lead to content they
 * could already have read from the bundle, while every call that costs money
 * is still refused. Writing it down this way round is the point: a cache that
 * is load-bearing for security would have to go, and this one is not.
 *
 * What it buys is real. Without it, every reload of a paid section renders the
 * paywall for the half-second the request takes, and a paying learner watches
 * the app forget they paid several times a day.
 */

import { supabase } from "./supabase";
import { isCurrent, type PlanId } from "./plans";

export interface Access {
  plan: PlanId;
  /** ISO timestamp, or null when the plan does not run out. */
  expiresAt: string | null;
  source: string | null;
}

export const FREE: Access = { plan: "free", expiresAt: null, source: null };

const KEY = "accessPlan";

/** Why a code was refused, in the words the interface has strings for. */
export type RedeemError = "not-found" | "used-up" | "expired" | "too-many" | "failed" | "signed-out";

export type RedeemResult = { ok: true; access: Access } | { ok: false; error: RedeemError };

/* ── The cached answer ────────────────────────────────────────────────── */

/**
 * The last thing the server said, if it is still in force.
 *
 * Expiry is re-checked on read rather than trusted from when it was written:
 * a cached "pro until Tuesday" must stop being pro on Wednesday even if the
 * app has not managed to reach the server since.
 */
export function cachedAccess(): Access | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Access>;
    if (parsed.plan !== "free" && parsed.plan !== "pro") return null;
    const expiresAt = typeof parsed.expiresAt === "string" ? parsed.expiresAt : null;
    if (!isCurrent(expiresAt)) return FREE;
    return {
      plan: parsed.plan,
      expiresAt,
      source: typeof parsed.source === "string" ? parsed.source : null,
    };
  } catch {
    return null;
  }
}

function cache(access: Access): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(access));
  } catch {
    /* Storage unavailable. The plan still holds for this session. */
  }
}

/** Forget the cached plan. Called on sign-out; see PROGRESS_KEYS. */
export function clearCachedAccess(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}

/* ── Asking the server ────────────────────────────────────────────────── */

/**
 * What this account is actually entitled to.
 *
 * No row means free, which is why there is no trigger creating one: absence is
 * a perfectly good way to say "has not paid", and a row per registration would
 * be a row that exists only to say nothing.
 *
 * `null` is returned when the question could not be asked — offline, or
 * Supabase unreachable. That is deliberately different from `FREE`: the caller
 * keeps showing whatever it had rather than demoting a paying learner because
 * their train went into a tunnel.
 */
export async function fetchAccess(): Promise<Access | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan, expires_at, source")
    .maybeSingle();

  if (error) {
    /* A missing table is the one error worth treating as an answer: it means
       migration 005 has not run, and on that database nobody has paid. */
    if (error.code === "42P01" || error.code === "PGRST205") {
      cache(FREE);
      return FREE;
    }
    return null;
  }

  const access: Access =
    data && (data.plan === "pro" || data.plan === "free") && isCurrent(data.expires_at)
      ? { plan: data.plan, expiresAt: data.expires_at ?? null, source: data.source ?? null }
      : FREE;

  cache(access);
  return access;
}

/**
 * Redeem a code.
 *
 * Everything that matters happens in `redeem_access_code`: normalising what
 * was typed, checking the code exists and has uses left, rate-limiting wrong
 * guesses, and extending rather than replacing an existing plan. This function
 * types the answer and updates the cache, and makes no decisions of its own —
 * which is what keeps the client from being somewhere a plan can be invented.
 */
export async function redeemCode(code: string): Promise<RedeemResult> {
  if (!supabase) return { ok: false, error: "failed" };

  const { data, error } = await supabase.rpc("redeem_access_code", { raw_code: code });

  if (error) {
    /* 28000 is the function refusing an unauthenticated caller — a session
       that expired while the page was open. */
    if (error.code === "28000") return { ok: false, error: "signed-out" };
    return { ok: false, error: "failed" };
  }

  const answer = data as { ok?: boolean; error?: string; plan?: string; expiresAt?: string | null } | null;

  if (!answer?.ok) {
    const known: RedeemError[] = ["not-found", "used-up", "expired", "too-many"];
    const reported = known.find((value) => value === answer?.error);
    return { ok: false, error: reported ?? "failed" };
  }

  const access: Access = {
    plan: answer.plan === "pro" ? "pro" : "free",
    expiresAt: answer.expiresAt ?? null,
    source: "code",
  };
  cache(access);
  return { ok: true, access };
}
