import type { IncomingMessage, ServerResponse } from "node:http";
import { handleAi, originAllowed } from "./_ai.js";

/**
 * POST /api/ai — the only route that may talk to the model provider.
 *
 * Written against Node's own request/response objects rather than the
 * web-standard `Request`/`Response` pair. The web signature is the nicer one to
 * read, and it is what the first deployment of this file used — it crashed on
 * every invocation, because this is a plain Vite project whose functions run on
 * the Node runtime, where a handler is `(req, res)`. The extension on the
 * import matters for the same reason: the package is ESM, and ESM resolves
 * paths literally at runtime.
 *
 * The key is read from the environment per request, so rotating it is a
 * dashboard change and a redeploy, never a code change.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== "POST") {
    return send(res, 405, { error: "method-not-allowed" });
  }

  const origin = header(req, "origin");
  const host = header(req, "host");
  if (!originAllowed(origin, host)) {
    return send(res, 403, { error: "forbidden" });
  }

  let body: unknown;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return send(res, 400, { error: "bad-json" });
  }

  const result = await handleAi(body, process.env.GROQ_API_KEY);
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
