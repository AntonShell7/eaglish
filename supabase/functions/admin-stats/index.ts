import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * The numbers behind the product, for the person who owns it.
 *
 * This lives on the server, and not for tidiness. Row-level security stops any
 * signed-in browser reading another account's rows — by design — so an admin
 * page built in the client would be looking at exactly one person's data: its
 * own. Aggregates need the service key, and a service key in a bundle is the
 * whole database handed to whoever opens devtools.
 *
 * Two gates, both here, because a check the browser performs is a check the
 * browser can be told to skip: the caller must be on the allowlist, identified
 * from their own signed token; and they must know a passcode that exists only
 * in this function's environment. Both refusals answer identically, so a
 * stranger cannot learn they have found a real admin account.
 */

const ALLOWED_ORIGINS = new Set([
  "https://eaglish.ru",
  "https://www.eaglish.ru",
  "https://eaglish.vercel.app",
  "http://localhost:5173",
]);

function cors(origin: string | null): Record<string, string> {
  const ok = origin && (ALLOWED_ORIGINS.has(origin) || /^https:\/\/eaglish-[a-z0-9-]+\.vercel\.app$/.test(origin));
  return {
    "Access-Control-Allow-Origin": ok ? (origin as string) : "null",
    "Access-Control-Allow-Headers": "authorization, content-type, apikey",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

/** Compared without short-circuiting, so the passcode cannot be guessed a character at a time. */
function same(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const DAY = 86400000;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const headers = { ...cors(origin), "Content-Type": "application/json" };

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method-not-allowed" }), { status: 405, headers });
  }

  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return new Response(JSON.stringify({ error: "no-token" }), { status: 401, headers });

  const url = Deno.env.get("SUPABASE_URL")!;

  const asUser = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: me, error: whoError } = await asUser.auth.getUser();
  if (whoError || !me.user) {
    return new Response(JSON.stringify({ error: "not-signed-in" }), { status: 401, headers });
  }

  const allowed = (Deno.env.get("ADMIN_IDS") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!allowed.includes(me.user.id)) {
    return new Response(JSON.stringify({ error: "denied" }), { status: 403, headers });
  }

  let body: { passcode?: string; action?: string; userId?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* an empty body simply fails the passcode check below */
  }

  const expected = Deno.env.get("ADMIN_PASSCODE") ?? "";
  if (!expected || !same(body.passcode ?? "", expected)) {
    return new Response(JSON.stringify({ error: "denied" }), { status: 403, headers });
  }

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  /* ── One person, in detail ──────────────────────────────────────────── */
  if (body.action === "user" && body.userId) {
    const id = body.userId;
    const [person, activity, words, reads, writing, quizzes] = await Promise.all([
      admin.auth.admin.getUserById(id),
      admin.from("daily_activity").select("*").eq("user_id", id).order("day", { ascending: false }).limit(120),
      admin.from("vocabulary_words").select("word, translation, added_at, review_count, stability").eq("user_id", id).order("added_at", { ascending: false }).limit(300),
      admin.from("reading_sessions").select("text_id, opened_at").eq("user_id", id).order("opened_at", { ascending: false }).limit(300),
      admin.from("writing_submissions").select("topic_id, overall, submitted_at").eq("user_id", id).order("submitted_at", { ascending: false }).limit(100),
      admin.from("quiz_results").select("correct, total, answered_at").eq("user_id", id).limit(300),
    ]);

    const rows = activity.data ?? [];

    /* Section totals, summed from the per-day json. A learner who spends every
       evening in the vocabulary and never opens a text is a different problem
       from one who reads and never reviews, and only this split shows it. */
    const bySection: Record<string, number> = {};
    for (const row of rows) {
      const split = (row.minutes_by_section ?? {}) as Record<string, number>;
      for (const [section, minutes] of Object.entries(split)) {
        bySection[section] = (bySection[section] ?? 0) + (minutes ?? 0);
      }
    }

    const quizTotals = (quizzes.data ?? []).reduce(
      (acc, q) => ({ correct: acc.correct + ((q.correct as number) ?? 0), total: acc.total + ((q.total as number) ?? 0) }),
      { correct: 0, total: 0 },
    );

    const u = person.data?.user;
    return new Response(
      JSON.stringify({
        profile: {
          id,
          email: u?.email ?? null,
          provider: (u?.app_metadata as Record<string, unknown>)?.provider ?? null,
          createdAt: u?.created_at ?? null,
          lastSignInAt: u?.last_sign_in_at ?? null,
        },
        days: rows.map((r) => ({
          day: r.day,
          minutes: r.minutes ?? 0,
          reading: r.reading ?? 0,
          listening: r.listening ?? 0,
          writing: r.writing ?? 0,
          vocabulary: r.vocabulary ?? 0,
          quiz: r.quiz ?? 0,
          slang: r.slang ?? 0,
        })),
        bySection,
        totals: {
          minutes: rows.reduce((sum, r) => sum + ((r.minutes as number) ?? 0), 0),
          activeDays: rows.length,
          words: (words.data ?? []).length,
          texts: new Set((reads.data ?? []).map((r) => r.text_id)).size,
          writingPieces: (writing.data ?? []).length,
          quiz: quizTotals,
        },
        words: words.data ?? [],
        reads: reads.data ?? [],
        writing: writing.data ?? [],
      }),
      { status: 200, headers },
    );
  }

  /* ── Everyone, in summary ───────────────────────────────────────────── */
  const since30 = dayKey(new Date(Date.now() - 30 * DAY));
  const since7 = dayKey(new Date(Date.now() - 7 * DAY));

  const [users, activity, words, sessions, writing, quizzes] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("daily_activity").select("user_id, day, minutes, minutes_by_section").gte("day", since30),
    admin.from("vocabulary_words").select("user_id"),
    admin.from("reading_sessions").select("user_id, text_id"),
    admin.from("writing_submissions").select("user_id"),
    admin.from("quiz_results").select("correct, total"),
  ]);

  const people = users.data?.users ?? [];
  const rows = activity.data ?? [];
  const vocab = words.data ?? [];
  const reads = sessions.data ?? [];

  const signupsByDay: Record<string, number> = {};
  for (const person of people) {
    const key = (person.created_at ?? "").slice(0, 10);
    if (key) signupsByDay[key] = (signupsByDay[key] ?? 0) + 1;
  }

  const perUser: Record<string, { minutes: number; days: number; words: number; texts: Set<string> }> = {};
  const touch = (id: string) => (perUser[id] ??= { minutes: 0, days: 0, words: 0, texts: new Set<string>() });

  for (const row of rows) {
    const u = touch(row.user_id as string);
    u.minutes += (row.minutes as number) ?? 0;
    u.days += 1;
  }
  for (const w of vocab) touch(w.user_id as string).words += 1;
  for (const r of reads) touch(r.user_id as string).texts.add(r.text_id as string);

  const active7 = new Set(rows.filter((r) => (r.day as string) >= since7).map((r) => r.user_id as string));
  const active30 = new Set(rows.map((r) => r.user_id as string));

  /* Where everyone's time goes in aggregate — which section is carrying the
     product and which one nobody opens. */
  const sectionTotals: Record<string, number> = {};
  for (const row of rows) {
    const split = (row.minutes_by_section ?? {}) as Record<string, number>;
    for (const [section, minutes] of Object.entries(split)) {
      sectionTotals[section] = (sectionTotals[section] ?? 0) + (minutes ?? 0);
    }
  }

  const byText: Record<string, number> = {};
  const readersByText: Record<string, Set<string>> = {};
  for (const r of reads) {
    const id = r.text_id as string;
    byText[id] = (byText[id] ?? 0) + 1;
    (readersByText[id] ??= new Set()).add(r.user_id as string);
  }
  const texts = Object.entries(byText)
    .sort((a, b) => b[1] - a[1])
    .map(([textId, opens]) => ({ textId, opens, readers: readersByText[textId]?.size ?? 0 }));

  const quizTotals = (quizzes.data ?? []).reduce(
    (acc, q) => ({ correct: acc.correct + ((q.correct as number) ?? 0), total: acc.total + ((q.total as number) ?? 0) }),
    { correct: 0, total: 0 },
  );

  const roster = people
    .map((p) => {
      const u = perUser[p.id];
      return {
        id: p.id,
        email: p.email ?? null,
        provider: (p.app_metadata as Record<string, unknown>)?.provider ?? null,
        createdAt: p.created_at,
        lastSignInAt: p.last_sign_in_at ?? null,
        minutes: u?.minutes ?? 0,
        activeDays: u?.days ?? 0,
        words: u?.words ?? 0,
        textsRead: u?.texts.size ?? 0,
      };
    })
    .sort((a, b) => b.minutes - a.minutes);

  return new Response(
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      users: { total: people.length, active7: active7.size, active30: active30.size, signupsByDay },
      totals: {
        words: vocab.length,
        textOpens: reads.length,
        writingPieces: (writing.data ?? []).length,
        quiz: quizTotals,
        minutes: rows.reduce((sum, r) => sum + ((r.minutes as number) ?? 0), 0),
      },
      sectionTotals,
      texts,
      roster,
      // No billing system exists, so there is nothing truthful to report about
      // paying or trialling users. Saying so beats inventing a zero that looks
      // like a measurement.
      billing: null,
    }),
    { status: 200, headers },
  );
});
