import { supabase } from "./supabase";
/**
 * The browser's only route to the model.
 *
 * Every feature that needs generation — translation popups, personal texts,
 * usage checking, writing feedback — goes through here, and here goes to
 * `/api/ai` on our own origin. No provider key ever reaches the bundle.
 *
 * The four callers used to hold four copies of the same fetch, each with its
 * own idea of what a failure meant. This one distinguishes the two cases that
 * actually change what the UI should say: the feature is not configured at all
 * (fall back silently, permanently) versus this call failed (fall back now,
 * try again later).
 */

/**
 * Where the model endpoint lives.
 *
 * Normally it is a path on this same site. Once the site is served from Russian
 * hosting the function stays on Vercel — that is what keeps the provider seeing
 * a European caller — so the build points this at an absolute address instead.
 * The endpoint answers a fixed list of origins, and this is one of them.
 */
const ENDPOINT = import.meta.env.VITE_AI_ENDPOINT || "/api/ai";

/**
 * `signed-out` and `quota` are both "the endpoint refused you", and they are
 * kept apart because the answers differ: one is fixed by signing in, the other
 * only by waiting. Telling a learner to wait when they simply need to log in
 * is the kind of message that gets a product abandoned.
 */
export type AiFailure = "no-key" | "failed" | "signed-out" | "quota";

export class AiError extends Error {
  readonly reason: AiFailure;

  constructor(reason: AiFailure, message?: string) {
    super(message ?? reason);
    this.reason = reason;
  }
}

/**
 * A message part, for the one caller that sends a picture: handwriting
 * practice, which asks the model to read a word off a strip of canvas. The
 * endpoint only forwards inline data URLs, never remote addresses.
 */
export type AiPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string | AiPart[];
}

export interface AiRequest {
  messages: AiMessage[];
  temperature?: number;
  max_completion_tokens?: number;
  /** Only the models the endpoint allows; anything else is ignored server-side. */
  model?: string;
  /** Ask the provider for strict JSON. The only format the endpoint forwards. */
  response_format?: { type: "json_object" };
}

/**
 * Remembered across calls so that a project deployed without a key stops
 * hammering an endpoint that will keep saying 503 — the popup fallback is
 * instant instead of waiting on a round trip every single word.
 */
let keyMissing = false;

export function aiConfigured(): boolean {
  return !keyMissing;
}

/**
 * The current session's token.
 *
 * Read per call rather than cached: Supabase refreshes tokens in the
 * background, and a cached one would start failing an hour into a session for
 * no reason the learner could see.
 */
async function accessToken(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function askModel(request: AiRequest): Promise<string> {
  if (keyMissing) throw new AiError("no-key");

  /* The endpoint is private now: no session, no model. Checked here as well as
     there, so a signed-out learner gets the honest answer immediately instead
     of a round trip that can only end in 401. */
  const token = await accessToken();
  if (!token) throw new AiError("signed-out");

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(request),
    });
  } catch {
    throw new AiError("failed", "network");
  }

  if (response.status === 503) {
    keyMissing = true;
    throw new AiError("no-key");
  }

  if (response.status === 401) throw new AiError("signed-out");
  if (response.status === 429) throw new AiError("quota");

  if (!response.ok) {
    throw new AiError("failed", `status ${response.status}`);
  }

  const data = (await response.json()) as { content?: string };
  return data.content?.trim() ?? "";
}
