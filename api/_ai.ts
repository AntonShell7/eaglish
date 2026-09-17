/**
 * The model call, on the server side of the wall.
 *
 * Until now the Groq key travelled in the browser bundle. Anyone who opened
 * devtools could lift it and spend the project's whole daily allowance, and
 * rotating it would have meant a redeploy — so the key now lives only in the
 * hosting environment and the browser talks to this instead.
 *
 * The handler is written as a plain function over a request body so that the
 * Vercel function and the dev-server middleware run *the same code*. A proxy
 * that behaves differently in development is a proxy that gets debugged twice.
 */

/** Models this endpoint is willing to bill for. */
const ALLOWED_MODELS = new Set(["openai/gpt-oss-120b", "llama-3.3-70b-versatile"]);
const DEFAULT_MODEL = "openai/gpt-oss-120b";

/** Groq's free tier is 8000 tokens/minute; nothing here needs more than this. */
const MAX_COMPLETION_TOKENS = 6000;
const MAX_MESSAGES = 12;
const MAX_BODY_CHARS = 24_000;

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export interface AiResult {
  status: number;
  body: unknown;
}

interface Message {
  role: string;
  content: string;
}

/**
 * The endpoint is unauthenticated, so it is deliberately narrow: a fixed model
 * list, a token ceiling and a size cap. It forwards prompts rather than
 * building them — the prompts live with the features that own them — which
 * means someone could still use it as a small general-purpose model proxy.
 * The caps are what keeps that from being expensive, and the origin check
 * below is what keeps it from being convenient.
 */
export async function handleAi(raw: unknown, apiKey: string | undefined): Promise<AiResult> {
  if (!apiKey) {
    return { status: 503, body: { error: "no-key" } };
  }

  if (typeof raw !== "object" || raw === null) {
    return { status: 400, body: { error: "bad-request" } };
  }

  const input = raw as Record<string, unknown>;
  const messages = input.messages;

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return { status: 400, body: { error: "bad-messages" } };
  }

  const clean: Message[] = [];
  let size = 0;
  for (const message of messages) {
    if (typeof message !== "object" || message === null) {
      return { status: 400, body: { error: "bad-messages" } };
    }
    const { role, content } = message as Record<string, unknown>;
    if (typeof role !== "string" || typeof content !== "string") {
      return { status: 400, body: { error: "bad-messages" } };
    }
    if (role !== "system" && role !== "user" && role !== "assistant") {
      return { status: 400, body: { error: "bad-role" } };
    }
    size += content.length;
    if (size > MAX_BODY_CHARS) {
      return { status: 413, body: { error: "too-large" } };
    }
    clean.push({ role, content });
  }

  const model = typeof input.model === "string" && ALLOWED_MODELS.has(input.model) ? input.model : DEFAULT_MODEL;

  const temperature =
    typeof input.temperature === "number" && input.temperature >= 0 && input.temperature <= 2
      ? input.temperature
      : 0.5;

  const maxTokens =
    typeof input.max_completion_tokens === "number" && input.max_completion_tokens > 0
      ? Math.min(Math.floor(input.max_completion_tokens), MAX_COMPLETION_TOKENS)
      : 1200;

  // Several callers ask for strict JSON back; it is the only response_format
  // worth forwarding, and passing it through unchecked would let a caller
  // request grammars the provider bills differently for.
  const jsonMode =
    typeof input.response_format === "object" &&
    input.response_format !== null &&
    (input.response_format as Record<string, unknown>).type === "json_object";

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: clean,
        temperature,
        max_completion_tokens: maxTokens,
        reasoning_effort: "low",
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
    });
  } catch {
    return { status: 502, body: { error: "upstream-unreachable" } };
  }

  const text = await response.text();

  if (!response.ok) {
    // The upstream message can quote the key back in some error shapes, so the
    // client is told the status and nothing else.
    return { status: response.status === 429 ? 429 : 502, body: { error: "upstream", status: response.status } };
  }

  let data: { choices?: { message?: { content?: string } }[] };
  try {
    data = JSON.parse(text);
  } catch {
    return { status: 502, body: { error: "bad-upstream-json" } };
  }

  return { status: 200, body: { content: data.choices?.[0]?.message?.content?.trim() ?? "" } };
}

/**
 * Which sites may use this endpoint.
 *
 * The rule used to be "same origin", which stopped being true the day the site
 * moved to Russian hosting and the function stayed here: the page is served
 * from eaglish.ru and calls a Vercel address, which is a cross-origin request
 * by definition. That split is deliberate — it keeps the model calls leaving
 * from Europe, where the provider serves us, while the heavy files come from a
 * server that Russian networks do not throttle.
 *
 * So the check becomes a list instead. It does not stop a determined script,
 * since Origin is trivially forged outside a browser, but it does stop the
 * endpoint being embedded in someone else's page as a free model — which is
 * the realistic way a public proxy gets drained.
 */
const ALLOWED_ORIGINS = new Set([
  "https://eaglish.ru",
  "https://www.eaglish.ru",
  "https://eaglish.vercel.app",
  "http://localhost:5173",
]);

export function originAllowed(origin: string | undefined, host: string | undefined): boolean {
  if (!origin) return true; // same-origin fetches from some browsers omit it
  if (ALLOWED_ORIGINS.has(origin)) return true;

  // Vercel's own preview deployments get a fresh hostname each time, and they
  // are ours; anything else with our host is same-origin anyway.
  if (host && origin === `https://${host}`) return true;
  return /^https:\/\/eaglish-[a-z0-9-]+\.vercel\.app$/.test(origin);
}

/** The value to echo back, so a browser will accept the response. */
export function corsOrigin(origin: string | undefined, host: string | undefined): string | null {
  if (!origin) return null;
  return originAllowed(origin, host) ? origin : null;
}
