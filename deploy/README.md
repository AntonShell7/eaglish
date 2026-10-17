# Moving Eaglish into Russia

Two separate reasons, one move.

**Reach.** The site is on Vercel, whose address ranges are filtered in Russia,
so the audience it is written for needs a VPN to open it. That is not a
polish problem — it is the product being unreachable for most of the people
it is for.

**152-ФЗ.** Personal data of Russian citizens must first be recorded in a
database located in Russia. Email addresses and learning history are personal
data, and this obligation applies already, at zero revenue, before any
payment question arises.

Both are answered by the same move, and the move is cheapest now: the
database holds 47 rows across seven tables and two accounts. The same
migration at five hundred users is a project with downtime and a rollback
plan. Today it is an evening.

---

## What is actually being moved

Not Postgres. The application calls `supabase.auth` fifteen times and
`supabase.from` fourteen — Supabase is holding **sign-in**, not just storage:
registration, email confirmation, Google, password reset, token issuing, and
the row-level policies that hang off those tokens.

So the stack moves whole, self-hosted. The application changes in two places
— the API URL and the anon key — and keeps its client library, its policies
and its auth code untouched.

The alternative, writing a backend by hand, is weeks of work whose most
expensive bugs land in authentication, which is the one area where a bug
costs people their accounts. It is not worth considering at this size.

---

## Before anything: the repo cannot rebuild the schema

The hosted project has **ten applied migrations**. `supabase/migrations/`
holds **four files**. Six exist only inside the hosting account — among them
the `ai_usage` quota table, the `daily_activity` minute columns and the
vocabulary soft-delete.

This matters twice. It means the schema has no off-site copy today, and it
means replaying the repo onto a new server would silently build a *different*
database. Everything below therefore works from a dump of the live project,
which cannot disagree with the live project.

---

## What to buy

One VPS in Russia. Timeweb Cloud, Selectel, Beget or reg.ru — the account for
the domain is already there, which is one fewer login to manage.

- **4 GB RAM minimum, 8 GB comfortable.** The stack is Postgres, GoTrue,
  PostgREST and Kong; at 2 GB it runs until Postgres and a build compete for
  memory and the OOM killer picks one.
- **80 GB disk.** The build is 95 MB, most of it 4,973 dictation clips, and
  Docker images and backups need room beside it.
- **Ubuntu 22.04 or 24.04.**

Roughly 800–2500 ₽ a month.

---

## The order

Nothing here touches the live site until step 8. The old pair stays up as the
way back.

### 1. Server

```bash
ssh root@<ip>
adduser eaglish && usermod -aG sudo eaglish
apt update && apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx git
```

### 2. Supabase, from the official stack

Start from `supabase/docker` rather than a hand-written compose file: it is
maintained, its image versions are known to work together, and a stack
assembled by hand tends to fail on a version mismatch at 2am.

```bash
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env
```

Then edit `.env`. The values that matter:

| Key | What to put |
| --- | --- |
| `POSTGRES_PASSWORD` | a long random string |
| `JWT_SECRET` | 40+ random characters — **this is what signs every session** |
| `ANON_KEY`, `SERVICE_ROLE_KEY` | generated from `JWT_SECRET`; the Supabase self-hosting guide has the generator |
| `SITE_URL` | `https://eaglish.ru` |
| `API_EXTERNAL_URL` | `https://eaglish.ru` |
| `SUPABASE_PUBLIC_URL` | `https://eaglish.ru` |
| `DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD` | your own; Studio is behind this |
| `SMTP_*` | the same provider already configured in the hosted project |
| `ENABLE_EMAIL_AUTOCONFIRM` | `false` — confirmation stays on |

Two services can be dropped: the app uses neither Realtime nor Storage.
Leaving them out frees roughly a gigabyte on a 4 GB box. Comment them out of
`docker-compose.yml` only after the stack has come up once intact, so a
failure is never ambiguous about its cause.

```bash
docker compose up -d
docker compose ps        # every service should be healthy, not restarting
```

### 3. Export from the hosted project

From your own machine, with the old project still alive:

```bash
export DB_URL='postgresql://postgres.<ref>:<password>@<host>:5432/postgres'
bash deploy/export-from-supabase.sh
```

Use the **direct** connection on port 5432, not the pooler on 6543 — a pooled
connection cannot hold the locks `pg_dump` needs and fails partway through,
leaving a dump that looks complete.

### 4. Restore

```bash
scp -r deploy/dump deploy/restore-to-selfhost.sh eaglish@<ip>:~/supabase/docker/
ssh eaglish@<ip>
cd supabase/docker && bash restore-to-selfhost.sh ./dump
```

It prints row counts at the end. **Compare them against the old project
before going further.** A restore that half-worked looks exactly like one
that worked.

Everyone will have to sign in once after the move: sessions and refresh
tokens are bound to the old project's `JWT_SECRET`, so they are deliberately
not carried over. Carrying them would hand every device a token the new
server cannot verify, which fails in a far more confusing way.

### 5. The app's API

`api/` holds what were Vercel's serverless functions. On the server they are
one small Node process on port 3001, which is what the nginx config proxies
`/api/` to. Keep it alive with systemd or `pm2`.

Its environment needs `SUPABASE_URL=https://eaglish.ru`, the new
`SUPABASE_ANON_KEY`, and the model keys.

> **`api/_ai.ts` will not work from this server as written.** OpenAI refuses
> Russian addresses, and Groq is unreliable from them. This is the one thing
> the move genuinely breaks: word lookup, handwriting and generated texts.
> Already-generated dictation audio is static files and is unaffected. The
> agreed answer is GigaChat or YandexGPT as the primary provider with a small
> relay abroad as fallback — a separate piece of work, to be done before the
> cut-over, not after.

### 6. Build and serve

```bash
npm ci && npm run build          # with VITE_DEMO_MODE=false
scp -r dist/* eaglish@<ip>:/var/www/eaglish/
sudo cp deploy/nginx/eaglish.conf /etc/nginx/sites-available/eaglish
sudo ln -s /etc/nginx/sites-available/eaglish /etc/nginx/sites-enabled/
sudo nginx -t
```

The certificate needs DNS pointing at the server first, so this waits for
step 8 — or use a temporary subdomain for the rehearsal.

### 7. Google sign-in

In Google Cloud Console → Credentials → the OAuth client, add the redirect
URI `https://eaglish.ru/auth/v1/callback`. **Add, do not replace**: leaving
the old one in place is what makes the rollback work.

### 8. Cut over

In reg.ru, point the `A` record for `eaglish.ru` at the server's address, and
`www` likewise. Then:

```bash
sudo certbot --nginx -d eaglish.ru -d www.eaglish.ru
```

Propagation is usually minutes, occasionally hours.

### 9. Keep the way back for a week

Leave the Vercel project and the hosted Supabase running and paid. If
anything is wrong, the `A` record goes back and the old pair is still there
with its data. Do not delete either until the new one has carried real users
for several days.

---

## After the move, not before

- **Backups are yours now.** Supabase was taking them; nobody is. A nightly
  `pg_dump` to object storage, and one restore actually rehearsed — an
  untested backup is a guess.
- **Roskomnadzor notification.** Required of a data operator, free, online.
- **A lawyer**, on 152-ФЗ specifically, before taking any money.

---

## Honest about effort

A day and a half of evenings, not one evening. The commands are quick; DNS
propagation, the certificate, SMTP and Google each have their own way of
going wrong, and the AI provider swap is real work on its own.

Do not do this on the night the link goes to friends.
