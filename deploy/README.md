# Moving the database into Russia

152-ФЗ requires personal data of Russian citizens to be first recorded in a
database located in Russia. Email addresses and learning history are personal
data, and the obligation applies already, at zero revenue — but it becomes
sharp the moment money is taken, because a public offer carries a real name
and ИНН and turns an anonymous side project into an identifiable business.

This moves **only the database**. Nothing else needs to change.

---

## What stays where, and why that matters

The site loads in Russia without a VPN — checked on a phone on a Russian
network — so Vercel is not a reach problem and there is no reason to leave it.

| Part | Where | Why |
| --- | --- | --- |
| The built site | Vercel | reachable, free, already works |
| `api/` functions | Vercel | **they call OpenAI and Groq** |
| Supabase: Postgres + Auth | Russian VPS | this is where personal data lives |

That second row is the whole argument for this shape. OpenAI refuses Russian
addresses. If the API functions moved too, word lookup, handwriting and
generated texts would all break and would need replacing with a Russian model
plus a relay abroad. Leaving them on Vercel means the model calls still
originate outside Russia and nothing about the AI has to change.

Personal data does not pass through those functions in a way that stores it
abroad: they forward a word and its sentence to a model and return the
answer. The record of what the learner saved is written to the database in
Russia.

> Not legal advice. A lawyer should confirm this split against your actual
> data flows before you take money — in particular whether sending a learner's
> sentence to a foreign model counts as cross-border transfer in your case,
> and what has to be written in the Roskomnadzor notification because of it.

---

## What to buy

One VPS in Russia. **Timeweb Cloud** is the straightforward choice for a solo
project; **Selectel** if you want something more serious; **reg.ru** has VPS
too and the domain account already exists there.

- **4 GB RAM, 2 vCPU.** The stack is Postgres, GoTrue, PostgREST and Kong.
  Two gigabytes runs until Postgres and something else want memory at once.
- **40–50 GB disk.** The static build and the 4,973 audio clips stay on
  Vercel, so this only holds Postgres, Docker images and backups.
- **Ubuntu 24.04.**

Roughly 700–1200 ₽ a month.

---

## What this costs you beyond money

Supabase was running backups, patching Postgres and watching the stack. After
this, nobody is. That work becomes yours: a nightly dump somewhere off the
server, security updates, and noticing when something stops.

At fifteen users that is half an hour a month. It is worth saying out loud
before rather than discovering it after.

---

## Before anything: the repo cannot rebuild the schema

The hosted project has **ten applied migrations**; `supabase/migrations/`
holds **four files**. Six exist only inside the hosting account — the
`ai_usage` quota table, the `daily_activity` minute columns, the vocabulary
soft-delete among them.

So the schema has no copy outside Supabase today, and rebuilding a new server
from the repo would silently produce a *different* database. Everything below
works from a dump of the live project instead.

**Run `export-from-supabase.sh` tonight even if you do nothing else.** It
takes fifteen minutes and turns "no backup exists" into "a backup exists".

---

## The order

Nothing here touches the live site until step 7.

### 1. Server

```bash
ssh root@<ip>
adduser eaglish && usermod -aG sudo eaglish
apt update && apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx git
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw enable
```

Postgres must **not** be exposed to the internet. The firewall above opens
only SSH and HTTP/S; the database is reached through Kong, which nginx
terminates TLS for.

### 2. A subdomain

In reg.ru, add an `A` record: `db.eaglish.ru` → the server's address.

The browser talks to Supabase directly, so it needs a real certificate on a
real name. A subdomain of the domain you already own costs nothing and keeps
everything under one name.

### 3. Supabase, from the official stack

Start from `supabase/docker` rather than a hand-written compose file: it is
maintained, and its image versions are known to work together.

```bash
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env
```

Values that matter in `.env`:

| Key | What to put |
| --- | --- |
| `POSTGRES_PASSWORD` | long and random |
| `JWT_SECRET` | 40+ random characters — **this signs every session** |
| `ANON_KEY`, `SERVICE_ROLE_KEY` | generated from `JWT_SECRET`; the self-hosting guide has the generator |
| `SITE_URL` | `https://eaglish.ru` |
| `API_EXTERNAL_URL` | `https://db.eaglish.ru` |
| `SUPABASE_PUBLIC_URL` | `https://db.eaglish.ru` |
| `ADDITIONAL_REDIRECT_URLS` | `https://eaglish.vercel.app` — keeps the Vercel preview working |
| `DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD` | your own; Studio sits behind these |
| `SMTP_*` | the same provider already configured in the hosted project |
| `ENABLE_EMAIL_AUTOCONFIRM` | `false` — confirmation stays on |

Realtime and Storage can be left out: the app uses neither. Do that only
after the stack has come up once intact, so a failure is never ambiguous.

```bash
docker compose up -d
docker compose ps        # healthy, not restarting
```

### 4. TLS

```bash
sudo cp deploy/nginx/db.eaglish.conf /etc/nginx/sites-available/db.eaglish
sudo ln -s /etc/nginx/sites-available/db.eaglish /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d db.eaglish.ru
```

### 5. Export and restore

From your own machine, with the hosted project still alive:

```bash
export DB_URL='postgresql://postgres.<ref>:<password>@<host>:5432/postgres'
bash deploy/export-from-supabase.sh
```

Use the **direct** connection on port 5432, not the pooler on 6543 — a pooled
connection cannot hold the locks `pg_dump` needs and fails partway through,
leaving a dump that looks complete.

```bash
scp -r deploy/dump deploy/restore-to-selfhost.sh eaglish@<ip>:~/supabase/docker/
ssh eaglish@<ip> 'cd supabase/docker && bash restore-to-selfhost.sh ./dump'
```

It prints row counts. **Compare them against the old project before going
further** — a restore that half-worked looks exactly like one that worked.

### 6. Google sign-in

Google Cloud Console → Credentials → the OAuth client → add the redirect URI
`https://db.eaglish.ru/auth/v1/callback`.

**Add, do not replace.** The old one staying in place is what makes the
rollback work.

### 7. Point the app at it

In Vercel → Project → Settings → Environment Variables:

- `VITE_SUPABASE_URL` → `https://db.eaglish.ru`
- `VITE_SUPABASE_ANON_KEY` → the new anon key

Redeploy. That is the whole application-side change.

Everyone signs in once after this: sessions are signed with the old
`JWT_SECRET` and the new server cannot verify them. Carrying them over would
fail in a far more confusing way.

### 8. Keep the way back for a week

Leave the hosted Supabase running and paid. If something is wrong, the two
environment variables go back and the old database is still there with its
data. Delete nothing until the new one has carried real users for days.

---

## Then, and only then

The Roskomnadzor notification asks where the database is. Submitting it after
the move means answering correctly once, rather than filing an amendment.

---

## Honest about effort

An evening if nothing misbehaves, a day and a half if SMTP, the certificate
or Google each take their turn. Not something to do on the night the link
goes out to friends.
