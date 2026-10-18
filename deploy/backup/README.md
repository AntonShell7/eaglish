# Backups

Supabase used to take these. Nobody does now.

The provider's own snapshots are not a substitute. They image the whole
machine every few days, which answers "the server is gone" and not
"yesterday's data is wrong" — and the second is the common emergency. A bad
migration, a mistaken delete, a bug that quietly corrupts rows: recovering
from a three-day-old machine image means throwing away three days of
everyone's work.

## What runs

`eaglish-backup.sh` is installed at `/usr/local/bin/eaglish-backup` on the
server and fired nightly at 03:17 UTC by `eaglish-backup.timer`, with up to
five minutes of jitter and `Persistent=true` so a server that was off at
three in the morning takes its copy on the next boot rather than skipping a
day.

Output goes to `/var/backups/eaglish`, mode 700 — the files hold every
account and everything anyone has written.

Three files per run, kept 14 days:

| File | What it is for |
| --- | --- |
| `globals-*.sql.gz` | roles and grants, which live outside any one database |
| `all-*.sql.gz` | plain SQL, every schema. Readable by eye and greppable — reach for this to answer "what did this row look like on Tuesday" |
| `data-*.dump` | custom format, restorable **selectively** with `pg_restore` |

## Restoring one table, with the app still running

This is the realistic emergency, and the reason the custom-format file
exists. Restore into a scratch database first, look at what you got, and only
then copy rows across — `pg_restore` straight onto a live table would replace
good data with old data on the strength of a guess.

```bash
f=$(ls -t /var/backups/eaglish/data-*.dump | head -1)
docker exec supabase-db psql -U postgres -c "create database drill;"
docker exec -i supabase-db pg_restore -U postgres -d drill \
  --schema=public --no-owner --no-privileges < "$f"
docker exec supabase-db psql -U postgres -d drill -c "select count(*) from vocabulary_words;"
```

Errors about `schema "auth" does not exist` are expected here: the foreign
keys point at a schema this scratch database does not have. The data arrives
regardless. Drop the scratch database when finished.

## Restoring everything, onto a new server

**Do not pipe `all-*.sql.gz` into a fresh `supabase/postgres` container.** It
does not work, and it fails in a way that looks like it worked: the image
runs its own init scripts, they collide with the dump, the container exits
partway through, and `auth.users` ends up empty while `public` looks fine.
That was found by trying it, not by reasoning about it.

Instead: bring the stack up normally and let it finish initialising, then
restore the application data from the custom-format file with
`pg_restore --data-only`, and the accounts from the `COPY auth.users` block
of the plain dump.

## Checks the script makes before it keeps a copy

A backup nobody has verified is a guess, and the moment you find out is the
moment you need it. Each run refuses to finish unless:

- both gzip archives pass `gzip -t`
- the plain dump contains `CREATE TABLE public.vocabulary_words`
- the plain dump contains `COPY auth.users` — an empty database produces a
  valid, tiny, useless file otherwise
- `pg_restore --list` reads the custom archive and finds at least eight
  tables with data

Rotation runs **last**. A run that cannot produce a good backup exits before
deleting an old one.

Each file is written to `.part` and renamed only on success, so an
interrupted run cannot leave a truncated file that looks like a backup.

## Still missing

These sit on the same disk as the database. The provider snapshots the
machine every few days, so they do leave the server eventually — but a true
off-site copy, to object storage or elsewhere, needs a destination and
credentials that do not exist yet.
