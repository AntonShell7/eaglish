/**
 * Who is calling, and have they called too much.
 *
 * The model endpoint used to be open. It checked the Origin header and let a
 * request through when there wasn't one — which is every request that does not
 * come from a browser. Anyone who found the URL had a free model, paid for out
 * of this project's budget, and the only thing standing in the way was a header
 * that takes one flag to set.
 *
 * Both halves of the fix happen in a single round trip, which is the whole
 * reason it is shaped like this. `claim_ai_call` is a Postgres function with
 * definer rights: it reads `auth.uid()` from the caller's own token, refuses
 * outright when there isn't one, and increments a counter the caller has no
 * rights to read or delete. So one call answers "is this a real session" and
 * "are they within their ceiling" at the same time, and neither answer can be
 * forged from the client.
 *
 * Verifying the token this way rather than checking its signature here is a
 * deliberate trade. It costs one request to Supabase — same region, tens of
 * milliseconds — and in exchange this function needs no signing secret, learns
 * nothing it shouldn't, and cannot drift out of step with the project's auth
 * settings. A revoked session stops working immediately rather than whenever
 * its token would have expired.
 */

/** Calls per user per hour. A heavy hour of real study is well under this. */
const HOURLY = 60;
/**
 * Calls per user per day. Three generated texts, thirty lookups and twenty
 * checked sentences is about fifty-five, so this is roughly five times what
 * the most committed learner does — wide enough never to be felt, narrow
 * enough that a script on one account is not worth running.
 */
const DAILY = 300;

export type Claim =
  | { ok: true }
  /** No token, or one Supabase would not accept. */
  | { ok: false; status: 401; error: "unauthenticated" }
  /** A real session that has used its allowance. */
  | { ok: false; status: 429; error: "quota"; retryAfter: number }
  /** Supabase itself could not be reached; see `open` below. */
  | { ok: false; status: 503; error: "quota-unavailable" };

interface ClaimRow {
  allowed: boolean;
  retry_after: number;
}

export function supabaseConfig(env: Record<string, string | undefined>) {
  // The names differ between the client bundle and the function runtime, so
  // both spellings are accepted. Neither value is a secret — the anon key
  // ships inside the page — but they still come from the environment so that
  // a project move is a dashboard change rather than a commit.
  const url = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_ANON_KEY;
  return url && key ? { url: url.replace(/\/+$/, ""), key } : null;
}

/** The bearer token out of an Authorization header, if it looks like one. */
export function bearer(value: string | undefined): string | null {
  if (!value) return null;
  const match = /^Bearer\s+(.+)$/i.exec(value.trim());
  const token = match?.[1]?.trim();
  return token && token.length > 20 ? token : null;
}

export async function claimCall(
  token: string | null,
  config: { url: string; key: string } | null,
): Promise<Claim> {
  if (!token) return { ok: false, status: 401, error: "unauthenticated" };

  /*
   * Fail closed.
   *
   * If the quota cannot be checked, the call does not happen. The tempting
   * alternative — let it through when the check is down — turns any outage of
   * the auth service into exactly the open endpoint this exists to close, and
   * an attacker who can cause that outage gets the key back. A learner seeing
   * "try again in a minute" during a Supabase incident is the correct cost.
   */
  if (!config) return { ok: false, status: 503, error: "quota-unavailable" };

  let response: Response;
  try {
    response = await fetch(`${config.url}/rest/v1/rpc/claim_ai_call`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: config.key,
        // The learner's own token: the function reads auth.uid() from it, so
        // the identity is Supabase's conclusion rather than this code's guess.
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ hourly_limit: HOURLY, daily_limit: DAILY }),
    });
  } catch {
    return { ok: false, status: 503, error: "quota-unavailable" };
  }

  // 401 is an expired or forged token; the function's own 28000 arrives as a
  // 4xx too. Either way there is no session behind this request.
  if (response.status === 401 || response.status === 403) {
    return { ok: false, status: 401, error: "unauthenticated" };
  }
  if (!response.ok) return { ok: false, status: 503, error: "quota-unavailable" };

  let rows: ClaimRow[] | ClaimRow;
  try {
    rows = (await response.json()) as ClaimRow[] | ClaimRow;
  } catch {
    return { ok: false, status: 503, error: "quota-unavailable" };
  }

  const row = Array.isArray(rows) ? rows[0] : rows;
  if (!row) return { ok: false, status: 503, error: "quota-unavailable" };

  if (!row.allowed) {
    return {
      ok: false,
      status: 429,
      error: "quota",
      retryAfter: Math.max(1, Math.min(3600, Number(row.retry_after) || 60)),
    };
  }

  return { ok: true };
}
