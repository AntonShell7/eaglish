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
const ALLOWED_MODELS = new Set([
  "openai/gpt-oss-120b",
  // Vision, for handwriting practice. The provider has no such model on this
  // account today, so the feature falls back to self-checking; the allowance
  // is here because the request shape is the part worth getting right, and a
  // key that can see is a configuration change rather than a rewrite.
  "meta-llama/llama-4-scout-17b-16e-instruct",
]);
const DEFAULT_MODEL = "openai/gpt-oss-120b";

/** Groq's free tier is 8000 tokens/minute; nothing here needs more than this. */
const MAX_COMPLETION_TOKENS = 6000;
const MAX_MESSAGES = 12;
const MAX_BODY_CHARS = 24_000;
/**
 * An image budget of its own, because base64 is bulky and the text cap would
 * reject a picture that is perfectly reasonable. 400 KB of data URL is about a
 * 300 KB PNG — far more than a word written on a strip of canvas needs, and
 * far less than someone could use this as a free image host with.
 */
const MAX_IMAGE_CHARS = 400_000;
const MAX_IMAGES = 2;

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export interface AiResult {
  status: number;
  body: unknown;
}

/**
 * A message is either plain text or a list of parts, which is how the provider
 * expects an image to arrive. Only these two shapes are forwarded: everything
 * else the format permits — audio, files, tool calls — would be billed
 * differently and is not something this app asks for.
 */
type Part = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

interface Message {
  role: string;
  content: string | Part[];
}

/**
 * Only inline images, and only real picture formats.
 *
 * A remote URL would turn this endpoint into a fetcher that makes requests on
 * the caller's behalf from our server's network position, which is the classic
 * way a harmless-looking proxy becomes a way to reach things it should not.
 */
const DATA_IMAGE = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

interface Sized {
  part: Part | null;
  size: number;
  error?: string;
}

function checkPart(raw: unknown): Sized {
  if (typeof raw !== "object" || raw === null) return { part: null, size: 0, error: "bad-messages" };
  const part = raw as Record<string, unknown>;

  if (part.type === "text") {
    if (typeof part.text !== "string") return { part: null, size: 0, error: "bad-messages" };
    return { part: { type: "text", text: part.text }, size: part.text.length };
  }

  if (part.type === "image_url") {
    const holder = part.image_url;
    const url = typeof holder === "object" && holder !== null ? (holder as Record<string, unknown>).url : undefined;
    if (typeof url !== "string" || !DATA_IMAGE.test(url)) return { part: null, size: 0, error: "bad-image" };
    if (url.length > MAX_IMAGE_CHARS) return { part: null, size: 0, error: "image-too-large" };
    return { part: { type: "image_url", image_url: { url } }, size: 0 };
  }

  return { part: null, size: 0, error: "bad-messages" };
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
  let images = 0;
  for (const message of messages) {
    if (typeof message !== "object" || message === null) {
      return { status: 400, body: { error: "bad-messages" } };
    }
    const { role, content } = message as Record<string, unknown>;
    if (role !== "system" && role !== "user" && role !== "assistant") {
      return { status: 400, body: { error: "bad-role" } };
    }

    if (typeof content === "string") {
      size += content.length;
      if (size > MAX_BODY_CHARS) return { status: 413, body: { error: "too-large" } };
      clean.push({ role, content });
      continue;
    }

    if (!Array.isArray(content) || content.length === 0 || content.length > 4) {
      return { status: 400, body: { error: "bad-messages" } };
    }

    const parts: Part[] = [];
    for (const raw of content) {
      const checked = checkPart(raw);
      if (!checked.part) return { status: checked.error === "image-too-large" ? 413 : 400, body: { error: checked.error } };
      if (checked.part.type === "image_url") {
        images += 1;
        if (images > MAX_IMAGES) return { status: 400, body: { error: "too-many-images" } };
      }
      size += checked.size;
      if (size > MAX_BODY_CHARS) return { status: 413, body: { error: "too-large" } };
      parts.push(checked.part);
    }
    clean.push({ role, content: parts });
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
        // Only the reasoning model takes this; the vision model rejects it.
        ...(model.startsWith("openai/") ? { reasoning_effort: "low" } : {}),
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
