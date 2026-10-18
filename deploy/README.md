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

**The schema is restored and the rows are not**, which is the right call
here: the old database holds eleven vocabulary words, eighteen reading
sessions and two accounts, all of it the owner's own testing. The schema is
the opposite — six of its ten migrations exist nowhere but the hosted
project.

Leaving the rows behind also removes a whole class of problem: no accounts
move, so no sessions signed with the old JWT secret, no password hashes
crossing GoTrue versions, nothing to reconcile. The new database starts
empty and everyone registers once.

The script prints row counts at the end. **Expect zeros.** What matters is
that every table exists and nothing errored on the way — a restore that
half-worked looks exactly like one that worked.

`WITH_DATA=1` loads the rows too, for the day the contents actually matter.

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

The new database has no accounts in it, so register again from the live site
once this is pointed at the new server.

**Then update `VITE_ADMIN_IDS`.** It holds user UUIDs, and a fresh
registration produces a new one — leave it and the admin page quietly stops
recognising you, with nothing on screen to explain why. The new id is visible
in Studio under `auth.users`.

### 8. Keep the way back for a week

Leave the hosted Supabase running and paid. If something is wrong, the two
environment variables go back and the old database is still there with its
data. Delete nothing until the new one has carried real users for days.

---

## What the subdomain exposes

`db.eaglish.ru` proxies three path groups and answers 404 to everything
else: `/auth/v1/`, `/rest/v1/` and `/functions/v1/`. That is the whole of
what the application asks for.

It used to proxy everything, and Supabase serves **Studio** at `/` — the
database's own console, where every row of every table can be read and
edited. The only thing in the way was a password, and a password on the open
internet can be guessed at around the clock with nobody the wiser.

Studio still runs. It is reached through a tunnel instead:

```bash
ssh -N -L 8000:127.0.0.1:8000 root@89.111.170.134
```

and then `http://127.0.0.1:8000` in a browser. Leave that command running
while you use it; Ctrl-C closes the tunnel.

Unknown paths answer 404 rather than 403, because a refusal tells you there
is something there to refuse.

---

## Edge functions, and the import that hangs

`delete-account` and `admin-stats` run on this server too, from
`volumes/functions/`. Two things about them are not obvious:

**`jsr.io` stalls partway through from this host.** Not a clean block: DNS
resolves, TLS completes, ALPN negotiates h2 and the first `meta.json` comes
back — then the next request hangs and never returns. Deno blocks on the
import and the runtime never boots, while printing *nothing at all*, in the
container or in the foreground, which makes it look dead rather than stuck.

That silence is the thing to recognise. A crash leaves a message; this leaves
none. A runtime that can report errors and reports nothing is waiting.

`registry.npmjs.org` answers normally from the same host, so every import uses
an `npm:` specifier. A function added later with a `jsr:` import will fail the
same silent way.

**Three of those edits live in files the Supabase repo owns** —
`volumes/functions/main/index.ts` and `volumes/functions/deno.jsonc`. A
`git pull` in `/opt/supabase` reverts them and the runtime goes quiet again.
The two application functions are kept in this repo under
`supabase/functions/` and can be copied back; the router and the import map
have to be re-patched by hand:

```
sed -i 's|jsr:@panva/jose@6|npm:jose@6|' volumes/functions/main/index.ts
sed -i 's|jsr:@supabase/functions-js@\^2|npm:@supabase/functions-js@^2|' volumes/functions/deno.jsonc
```

`ADMIN_IDS` and `ADMIN_PASSCODE` reach the runtime through
`docker-compose.override.yml`, which also carries the Google provider. That
file is referenced from `COMPOSE_FILE` in `.env`, because setting that
variable stops Compose picking up an override automatically.

---

## Then, and only then

The Roskomnadzor notification asks where the database is. Submitting it after
the move means answering correctly once, rather than filing an amendment.

---

## Honest about effort

An evening if nothing misbehaves, a day and a half if SMTP, the certificate
or Google each take their turn. Not something to do on the night the link
goes out to friends.
