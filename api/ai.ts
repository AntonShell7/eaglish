import type { IncomingMessage, ServerResponse } from "node:http";
import { corsOrigin, handleAi, originAllowed } from "./_ai.js";
import { bearer, claimCall, supabaseConfig } from "./_quota.js";

/**
 * POST /api/ai — the only route that may talk to the model provider.
 *
 * Written against Node's own request/response objects rather than the
 * web-standard Request/Response pair, because a plain Vite project's functions
 * run on Vercel's Node runtime, where a handler is called as (req, res). The
 * extension on the import matters for the same reason: the package is ESM, and
 * ESM resolves paths literally at runtime.
 *
 * This stays on Vercel even though the site itself is served from Russian
 * hosting. Two reasons, and both matter: the provider serves Europe rather than
 * Russia, and these responses are small enough to pass networks that choke on
 * the application's own files.
 *
 * The key is read from the environment per request, so rotating it is a
 * dashboard change and a redeploy, never a code change.
 *
 * Every request must carry a signed-in learner's token. The origin check below
 * stays, but only as the outer layer it always was: it stops this being
 * embedded in somebody else's page, and it has never stopped a terminal, since
 * a request sent without an Origin header used to be waved through. The token
 * is what actually closes the endpoint.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const origin = header(req, "origin");
  const host = header(req, "host");
  const allowed = corsOrigin(origin, host);

  if (allowed) {
    res.setHeader("Access-Control-Allow-Origin", allowed);
    res.setHeader("Vary", "Origin");
  }

  // The browser asks permission before sending a cross-origin POST with a JSON
  // body, and will not send the real request until this answers.
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "86400");
    res.statusCode = allowed ? 204 : 403;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    return send(res, 405, { error: "method-not-allowed" });
  }

  if (!originAllowed(origin, host)) {
    return send(res, 403, { error: "forbidden" });
  }

  /* Identity and quota, before the body is even parsed: there is no reason to
     spend anything on a request that is not going to reach the provider. */
  const claim = await claimCall(bearer(header(req, "authorization")), supabaseConfig(process.env));
  if (!claim.ok) {
    if (claim.status === 429) res.setHeader("Retry-After", String(claim.retryAfter));
    return send(res, claim.status, { error: claim.error });
  }

  let body: unknown;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return send(res, 400, { error: "bad-json" });
  }

  const result = await handleAi(body, process.env.GROQ_API_KEY, process.env.OPENAI_API_KEY);
  send(res, result.status, result.body);
}

function header(req: IncomingMessage, name: string): string | undefined {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function send(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}
