import { handleAi, originAllowed } from "./_ai";

/**
 * POST /api/ai — the only route that may talk to the model provider.
 *
 * Vercel's Node runtime. The key is read from the environment at request time,
 * so rotating it is a dashboard change and a restart, not a rebuild.
 */
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return json(405, { error: "method-not-allowed" });
  }

  const origin = request.headers.get("origin") ?? undefined;
  const host = request.headers.get("host") ?? undefined;
  if (!originAllowed(origin, host)) {
    return json(403, { error: "forbidden" });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "bad-json" });
  }

  const result = await handleAi(body, process.env.GROQ_API_KEY);
  return json(result.status, result.body);
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
