import { createClient } from "npm:@supabase/supabase-js@2";
// npm, not jsr. jsr.io does not resolve from the Russian host this now
// runs on — the request hangs until it times out, and Deno blocks on the
// first import without printing anything, so the runtime looks dead
// rather than stuck. registry.npmjs.org answers fine and carries the
// same package.

/**
 * Deleting an account, properly.
 *
 * A privacy policy that promises someone control over their data and offers no
 * way to leave is not a policy, it is a sentence. So this exists — and it has
 * to exist on the server, because removing a row from `auth.users` needs the
 * service key, and a service key in a browser bundle is the whole database
 * handed to anyone who opens devtools.
 *
 * The key never leaves this function: it arrives as an environment variable,
 * so it is not in the repository, not in the build, and not in anyone's chat
 * history.
 *
 * The account is identified from the caller's own token and never from the
 * request body. That is the difference between "delete me" and "delete
 * whoever I name", and it is one line.
 */

const ALLOWED_ORIGINS = new Set([
  "https://eaglish.ru",
  "https://www.eaglish.ru",
  "https://eaglish.vercel.app",
  "http://localhost:5173",
]);

function cors(origin: string | null): Record<string, string> {
  const allow = origin && (ALLOWED_ORIGINS.has(origin) || /^https:\/\/eaglish-[a-z0-9-]+\.vercel\.app$/.test(origin));
  return {
    "Access-Control-Allow-Origin": allow ? (origin as string) : "null",
    "Access-Control-Allow-Headers": "authorization, content-type, apikey",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const headers = { ...cors(origin), "Content-Type": "application/json" };

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method-not-allowed" }), { status: 405, headers });
  }

  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return new Response(JSON.stringify({ error: "no-token" }), { status: 401, headers });
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Who is asking — read from the token itself, never from the body.
  const asUser = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: me, error: whoError } = await asUser.auth.getUser();
  if (whoError || !me.user) {
    return new Response(JSON.stringify({ error: "not-signed-in" }), { status: 401, headers });
  }

  const admin = createClient(url, serviceKey);

  // Feedback is the one table that outlives the account: it carries no
  // personal data beyond the id, and a bug report losing its context when
  // someone leaves would make the reports useless. The link is cut instead.
  await admin.from("feedback").update({ user_id: null }).eq("user_id", me.user.id);

  // Everything else is cascaded by the foreign keys on auth.users.
  const { error } = await admin.auth.admin.deleteUser(me.user.id);
  if (error) {
    return new Response(JSON.stringify({ error: "delete-failed" }), { status: 500, headers });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
});
