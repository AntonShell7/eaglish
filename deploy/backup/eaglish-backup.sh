#!/usr/bin/env bash
#
# One night's copy of the database.
#
# Supabase used to take these. Nobody does now, and the provider's own
# snapshots are not a substitute: they image the whole machine every few days,
# which answers "the server is gone" and not "yesterday's data is wrong". The
# second case is the common one — a bad migration, a mistaken delete, a bug
# that quietly corrupts rows — and recovering from a three-day-old machine
# image means throwing away three days of everyone's work.
#
# Three files per run, because recovery comes in two shapes and they need
# different things:
#
#   globals-*.sql.gz   roles and their grants, which live outside any one
#                      database and are not in a plain pg_dump
#   all-*.sql.gz       plain SQL, every schema including auth — readable by
#                      eye, greppable, and the one to reach for when the
#                      question is "what did this row look like on Tuesday"
#   data-*.dump        custom format, restorable *selectively* with
#                      pg_restore: one table, one schema, data only
#
# The third exists because restoring the plain dump over a running
# supabase/postgres is not reliable — the image runs its own init scripts and
# they collide, which was found by actually trying it rather than assuming.
# The realistic emergency is not "the server is gone" but "one table is wrong
# since yesterday", and pg_restore can put back exactly that table while
# everything else keeps serving.
#
# Unlike the migration dump, this keeps the rows. That dump was moving a
# schema to an empty server; this one exists to put people's work back.

set -euo pipefail

CONTAINER="${CONTAINER:-supabase-db}"
DEST="${DEST:-/var/backups/eaglish}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date -u +%Y%m%d-%H%M%S)"

mkdir -p "$DEST"
# The dumps contain every account and everything anyone has written. Readable
# by root alone, on a machine where root is the only account with a key.
chmod 700 "$DEST"

fail() { echo "[backup] FAILED: $*" >&2; exit 1; }

docker ps --format '{{.Names}}' | grep -qx "$CONTAINER" || fail "container $CONTAINER is not running"

globals="$DEST/globals-$STAMP.sql.gz"
all="$DEST/all-$STAMP.sql.gz"

# Written to a .part first and renamed only on success, so an interrupted run
# cannot leave a truncated file that looks like a backup.
docker exec "$CONTAINER" pg_dumpall -U postgres --globals-only 2>/dev/null \
  | gzip -9 > "$globals.part" || fail "pg_dumpall failed"
mv "$globals.part" "$globals"

docker exec "$CONTAINER" pg_dumpall -U postgres 2>/dev/null \
  | gzip -9 > "$all.part" || fail "pg_dumpall (full) failed"
mv "$all.part" "$all"

# A dump that gzip cannot read is not a backup, and the only moment anyone
# would otherwise find out is the moment they need it.
gzip -t "$globals" || fail "globals archive is corrupt"
gzip -t "$all"     || fail "full archive is corrupt"

# An empty database dumps to a valid, tiny, useless file. These two markers
# mean the structure and the accounts actually arrived.
zgrep -q "CREATE TABLE public.vocabulary_words" "$all" || fail "no application tables in the dump"
zgrep -q "COPY auth.users"                      "$all" || fail "no accounts in the dump"

# Custom format, for putting one table back without touching the rest.
custom="$DEST/data-$STAMP.dump"
docker exec "$CONTAINER" pg_dump -U postgres -Fc -d postgres 2>/dev/null \
  > "$custom.part" || fail "pg_dump (custom) failed"
mv "$custom.part" "$custom"

# pg_restore refuses to list a damaged archive, which makes this a real
# integrity check and not a file-size guess.
# No path argument: pg_restore reads the archive from stdin. Handing it
# /dev/stdin instead fails, because it seeks, and a pipe cannot seek.
toc=$(docker exec -i "$CONTAINER" pg_restore --list < "$custom" 2>/dev/null | grep -c "TABLE DATA") \
  || fail "custom-format archive is not readable by pg_restore"
[ "${toc:-0}" -ge 8 ] || fail "custom-format archive lists only ${toc:-0} tables with data"

size=$(du -h "$all" | cut -f1)
rows=$(docker exec "$CONTAINER" psql -U postgres -tAc "select count(*) from auth.users" 2>/dev/null | tr -d ' ')

# Rotation runs last. If anything above failed the script has already exited,
# so a run that cannot produce a good backup never deletes an old one.
find "$DEST" -name 'all-*.sql.gz'     -mtime "+$KEEP_DAYS" -delete
find "$DEST" -name 'data-*.dump'      -mtime "+$KEEP_DAYS" -delete
find "$DEST" -name 'globals-*.sql.gz' -mtime "+$KEEP_DAYS" -delete
find "$DEST" -name '*.part'           -mtime +1            -delete

kept=$(find "$DEST" -name 'all-*.sql.gz' | wc -l | tr -d ' ')
echo "[backup] ok — $size, $rows accounts, $kept copies kept"
