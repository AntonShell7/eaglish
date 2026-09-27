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
  popular: { textId: string; opens: number }[];
  roster: RosterRow[];
  billing: null;
}

export type AdminResult =
  | { ok: true; stats: AdminStats }
  | { ok: false; reason: "denied" | "offline" | "unconfigured" };

export async function fetchAdminStats(passcode: string): Promise<AdminResult> {
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
      body: JSON.stringify({ passcode }),
    });
  } catch {
    return { ok: false, reason: "offline" };
  }

  if (response.status === 401 || response.status === 403) return { ok: false, reason: "denied" };
  if (!response.ok) return { ok: false, reason: "offline" };

  return { ok: true, stats: (await response.json()) as AdminStats };
}
