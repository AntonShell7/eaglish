#!/usr/bin/env bash
#
# Put the dump into the self-hosted stack.
#
# Run this ON THE SERVER, after `docker compose up -d` has brought the stack
# up once and Postgres is accepting connections. Order matters: the stack has
# to create its own schemas first, and this fills them.
#
# Usage, from the supabase/docker directory with deploy/dump copied beside it:
#   bash restore-to-selfhost.sh ./dump
#
set -euo pipefail

DUMP="${1:?Usage: restore-to-selfhost.sh <path-to-dump-dir>}"
CONTAINER="${CONTAINER:-supabase-db}"

for f in roles.sql schema.sql data.sql; do
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

echo "→ data"
run < "$DUMP/data.sql"

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
echo "Compare those counts against the old project before switching DNS."
