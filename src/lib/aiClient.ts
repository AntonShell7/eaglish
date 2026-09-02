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

export type AiFailure = "no-key" | "failed";

export class AiError extends Error {
  readonly reason: AiFailure;

  constructor(reason: AiFailure, message?: string) {
    super(message ?? reason);
    this.reason = reason;
  }
}

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
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

export async function askModel(request: AiRequest): Promise<string> {
  if (keyMissing) throw new AiError("no-key");

  let response: Response;
  try {
    response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch {
    throw new AiError("failed", "network");
  }

  if (response.status === 503) {
    keyMissing = true;
    throw new AiError("no-key");
  }

  if (!response.ok) {
    throw new AiError("failed", `status ${response.status}`);
  }

  const data = (await response.json()) as { content?: string };
  return data.content?.trim() ?? "";
}
