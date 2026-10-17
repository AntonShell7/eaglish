#!/usr/bin/env bash
#
# Put the dump into the self-hosted stack.
#
# Run this ON THE SERVER, after `docker compose up -d` has brought the stack
# up once and Postgres is accepting connections. Order matters: the stack has
# to create its own schemas first, and this fills them.
#
# The schema is restored; the rows are not.
#
# Those are two different things and only one of them is worth carrying. The
# old database holds eleven vocabulary words, eighteen reading sessions and
# two accounts, all of them the owner's own testing — nothing anyone would
# miss. The schema is the opposite: ten migrations were applied to the hosted
# project and only four exist as files in the repo, so six live nowhere else.
# Rebuilding from the repo would silently produce a different database.
#
# Leaving the rows behind also removes a whole class of problem. No accounts
# move, so no sessions signed with the old JWT secret, no password hashes
# crossing GoTrue versions, no identity rows to reconcile. The new database
# starts empty and everyone registers once.
#
# Pass WITH_DATA=1 to load data.sql as well, if that ever becomes the right
# call for a database whose contents actually matter.
#
# Usage, from the supabase/docker directory with deploy/dump copied beside it:
#   bash restore-to-selfhost.sh ./dump
#
set -euo pipefail

DUMP="${1:?Usage: restore-to-selfhost.sh <path-to-dump-dir>}"
CONTAINER="${CONTAINER:-supabase-db}"
WITH_DATA="${WITH_DATA:-0}"

for f in roles.sql schema.sql; do
  [ -f "$DUMP/$f" ] || { echo "Missing $DUMP/$f" >&2; exit 1; }
done

docker ps --format '{{.Names}}' | grep -qx "$CONTAINER" || {
  echo "Container '$CONTAINER' is not running. Start the stack first, or set CONTAINER=." >&2
  exit 1
}

run() {
  # ON_ERROR_STOP so a failed statement stops the restore instead of leaving a
  # half-populated database that looks like it worked.
  docker exec -i "$CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres
}

echo "→ roles (errors about roles that already exist are expected and harmless)"
run < "$DUMP/roles.sql" || true

echo "→ schema"
run < "$DUMP/schema.sql"

if [ "$WITH_DATA" = "1" ]; then
  echo "→ data (WITH_DATA=1)"
  run < "$DUMP/data.sql"
else
  echo "→ data skipped — the new database starts empty (WITH_DATA=1 to change)"
fi

echo
echo "→ checking what arrived"
docker exec -i "$CONTAINER" psql -U postgres -d postgres -c "
  select 'auth.users' as t, count(*) from auth.users
  union all select 'profiles', count(*) from public.profiles
  union all select 'vocabulary_words', count(*) from public.vocabulary_words
  union all select 'daily_activity', count(*) from public.daily_activity
  union all select 'reading_sessions', count(*) from public.reading_sessions
  union all select 'quiz_results', count(*) from public.quiz_results;"

echo
echo "Expect zeros: the schema is here and the rows deliberately are not."
echo "What matters is that every table exists and none of them errored above."
