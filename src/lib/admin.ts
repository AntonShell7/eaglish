import { supabase } from "./supabase";

/**
 * The owner's view of the product.
 *
 * Nothing here is a security boundary. The identifier list below only decides
 * whether a link is drawn; the real check happens inside the edge function,
 * against the caller's own signed token and a passcode that exists only in the
 * function's environment. Editing this list in devtools gets you a visible
 * link and a 403.
 */

const ADMIN_IDS = (import.meta.env.VITE_ADMIN_IDS ?? "")
  .split(",")
  .map((s: string) => s.trim())
  .filter(Boolean);

export function looksLikeAdmin(userId: string | undefined): boolean {
  return Boolean(userId && ADMIN_IDS.includes(userId));
}

export interface RosterRow {
  id: string;
  email: string | null;
  provider: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  minutes: number;
  activeDays: number;
  words: number;
  textsRead: number;
}

export interface AdminStats {
  generatedAt: string;
  users: {
    total: number;
    active7: number;
    active30: number;
    signupsByDay: Record<string, number>;
  };
  totals: {
    words: number;
    textOpens: number;
    writingPieces: number;
    quiz: { correct: number; total: number };
    minutes: number;
  };
  sectionTotals: Record<string, number>;
  texts: { textId: string; opens: number; readers: number }[];
  roster: RosterRow[];
  billing: null;
}

export interface UserDetail {
  profile: {
    id: string;
    email: string | null;
    provider: string | null;
    createdAt: string | null;
    lastSignInAt: string | null;
  };
  days: { day: string; minutes: number; reading: number; listening: number; writing: number; vocabulary: number; quiz: number; slang: number }[];
  bySection: Record<string, number>;
  totals: {
    minutes: number;
    activeDays: number;
    words: number;
    texts: number;
    writingPieces: number;
    quiz: { correct: number; total: number };
  };
  words: { word: string; translation: string; added_at: string; review_count: number; stability: number | null }[];
  reads: { text_id: string; opened_at: string }[];
  writing: { topic_id: string; overall: number; submitted_at: string }[];
}

/**
 * Pinned people, kept in this browser.
 *
 * Watching a handful of students among a thousand strangers is the whole
 * reason the list needs an order other than "most active". It lives locally
 * because it is a note to oneself, not a fact about the account being watched
 * — and it should not become a row in anybody's record.
 */
const PINS_KEY = "adminPinned";

export function getPinned(): string[] {
  try {
    const raw = localStorage.getItem(PINS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function togglePinned(id: string): string[] {
  const pins = getPinned();
  const next = pins.includes(id) ? pins.filter((p) => p !== id) : [...pins, id];
  try {
    localStorage.setItem(PINS_KEY, JSON.stringify(next));
  } catch {
    /* a lost pin is not worth an exception */
  }
  return next;
}

export type Failure = "denied" | "offline" | "unconfigured";
export type AdminResult<T> = { ok: true; data: T } | { ok: false; reason: Failure };

async function call<T>(passcode: string, payload: Record<string, unknown>): Promise<AdminResult<T>> {
  if (!supabase) return { ok: false, reason: "unconfigured" };

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { ok: false, reason: "denied" };

  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!base) return { ok: false, reason: "unconfigured" };

  let response: Response;
  try {
    response = await fetch(`${base}/functions/v1/admin-stats`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ passcode, ...payload }),
    });
  } catch {
    return { ok: false, reason: "offline" };
  }

  if (response.status === 401 || response.status === 403) return { ok: false, reason: "denied" };
  if (!response.ok) return { ok: false, reason: "offline" };

  return { ok: true, data: (await response.json()) as T };
}

export const fetchAdminStats = (passcode: string) => call<AdminStats>(passcode, { action: "overview" });

export const fetchUserDetail = (passcode: string, userId: string) =>
  call<UserDetail>(passcode, { action: "user", userId });
