# Eaglish

English for Russian speakers: reading, dictation, a vocabulary that schedules
its own reviews, writing with feedback, and spoken English. React 19 +
TypeScript + Vite, Tailwind v4, i18next (ru/en), Supabase for auth and data.

Interface language is Russian. Code, comments and commit messages are English.

---

## Deploying — read this first

**The site is not served from Vercel any more.** On 20 Oct 2026 `eaglish.ru`
pointing at a foreign address stopped working from Russian networks: small
responses arrived, anything over about ten kilobytes died. The identical file
over `eaglish.vercel.app` came back in 1.5 seconds. It was the hostname.

| Part | Where | How it ships |
| --- | --- | --- |
| Site, bundle, 92 MB of audio | St Petersburg VPS, nginx | **build + rsync** |
| `api/ai`, `api/pay`, `api/pay-webhook` | Vercel | `git push` |
| Supabase (auth + database) | St Petersburg, `db.eaglish.ru` | migrations by hand |

**A `git push` does not update what visitors see.** It deploys the serverless
functions and nothing else. Forgetting the rsync means shipping nothing.

```bash
ANON=$(ssh root@89.111.170.134 'grep "^ANON_KEY=" /opt/supabase/docker/.env | cut -d= -f2-')
VITE_SUPABASE_URL="https://db.eaglish.ru" VITE_SUPABASE_ANON_KEY="$ANON" \
VITE_ADMIN_IDS="6a17fd54-f32e-4b08-afcf-d59db5372907" VITE_DEMO_MODE="false" \
VITE_API_BASE="https://eaglish.vercel.app" npm run build
rsync -az --delete dist/ root@89.111.170.134:/var/www/eaglish/
```

The values come from the server because **`.env.local` holds the anon key of
the old hosted Supabase project** (`sb_publishable_…`). It is dead. Do not edit
that file — Anton asked for `.env*` to be left alone.

`api/` stays abroad because it calls OpenAI, and the Russian box gets 403 from
`api.openai.com` — tested. `src/lib/apiBase.ts` is the client half.

Verify a deploy from the server, not from Anton's Mac, which routes through a
VPN and iProxy and will cheerfully lie to you:

```bash
ssh root@89.111.170.134 'B=$(curl -s --resolve eaglish.ru:443:127.0.0.1 https://eaglish.ru/ | grep -oE "assets/index-[A-Za-z0-9_-]+\.js" | head -1); curl -s --resolve eaglish.ru:443:127.0.0.1 -o /dev/null -w "%{http_code} %{size_download}\n" "https://eaglish.ru/$B"'
```

## What Claude may not run

Anything that **activates** something on production is refused by the auto-mode
classifier: `psql` against the live database, `docker compose restart`. `scp`
and `git push` go through. So: stage every file, then hand Anton the one or two
commands in a fenced `bash` block. Saying "разрешаю" in chat does not lift it.

Migrations live in `supabase/migrations/`, are applied in one transaction, and
are **not** tracked by any tool — the numbering is the only record:

```bash
ssh root@89.111.170.134 'cd /opt/supabase/docker && docker compose exec -T db psql -U postgres --single-transaction -v ON_ERROR_STOP=1 -f /dev/stdin < /root/00N.sql'
```

---

## Commands

```bash
npm run dev            # Vite, port 5173
npx tsc -b             # types — includes api/ via tsconfig.api.json
npm run lint           # oxlint; warnings are pre-existing, errors are not
npm run build          # tsc -b && vite build
```

## Conventions

- **Every new string goes into both `src/i18n/locales/ru.json` and `en.json`.**
  Russian plurals need `_one` / `_few` / `_many`.
- `VITE_DEMO_MODE` must be `false` before any commit. It is a local testing
  switch that fakes a signed-in user; demo mode cannot reach the AI.
- Never paste API keys, the Google client secret or SMTP passwords into chat.
  The repository is **public**: github.com/AntonShell7/eaglish.
- Database dumps must never enter the repo. `deploy/.gitignore` covers it.
- No new dependencies without a reason worth stating.
- **Texts may name real people, clubs and companies, and may invent nothing
  about them.** Facts are not anybody's property and a text about why a club
  plays the way it does is what people actually open; a made-up quote, a
  made-up transfer fee or a line about somebody's private life is a different
  thing entirely. Nothing is copied either — articles, interviews and books are
  under copyright, and a commercial site that reprints them is a takedown
  waiting to happen. Verbatim material may come only from the public domain
  (expired copyright, US federal publications) or an open licence, with its
  terms honoured. Facts are free; the sentences are ours.

## Things that have bitten us

- **CSS order beats specificity.** A mobile override inside a media query
  placed *above* the rule it overrides silently loses. Put breakpoint blocks
  after the base rules — `landing.css` has one at the end for this reason.
- **`api/` was outside the typecheck** until `tsconfig.api.json` existed. If a
  new top-level folder appears, check it is in a project reference.
- **The landing hero distributes its four blocks with `space-between`**, so
  every margin between them must stay zero. Adding one back makes the gaps
  unequal and the fix is not obvious from looking.
- **Fonts are self-hosted** in `public/fonts/`, not loaded from Google. The
  front page should not depend on a host somebody else can throttle. Manrope
  still comes from Google and is worth moving for the same reason.
- Verify in the browser with measurements (JS reading `getBoundingClientRect`),
  not screenshots. Screenshots cost a hundred times more and answer less. Take
  one when the question is genuinely "how does it look".

## Layout

```
src/pages/          one file per route, plus its own .css
src/components/     access/ auth/ layout/ reading/ dictation/ …
src/lib/            everything with no JSX: stores, scheduling, API clients
src/data/legal.ts   privacy policy, terms, public offer — one source for both languages
api/                Vercel functions; _-prefixed files are shared, not routes
supabase/migrations/ numbered SQL, applied by hand
deploy/             nginx configs, backup script, the migration runbook
```

## Current state

Live and working: reading, dictation, slang, vocabulary with FSRS scheduling,
writing with feedback, handwriting, onboarding, admin console with access
codes, pricing page, paywall on three sections, public offer.

Built but switched off: payments. `PAYMENTS_LIVE` in `src/lib/plans.ts` flips
them on once ЮKassa keys exist. `SUPABASE_SERVICE_ROLE_KEY` is not yet on
Vercel and payments will silently refuse without it.

Open: Roskomnadzor notification (parked by Anton), a lawyer reading the offer,
off-site backups — the nightly dumps sit on the same disk as the database.
