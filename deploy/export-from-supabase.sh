#!/usr/bin/env bash
#
# Take everything out of the hosted Supabase project.
#
# Run this from your own machine, with the project still alive. It produces
# three files in deploy/dump/, and those three files are the whole migration:
# nothing else from the hosted project is needed afterwards.
#
#   roles.sql     — database roles, so ownership and grants survive the move
#   schema.sql    — every table, policy, function and trigger, including the
#                   auth schema, which is where the accounts themselves live
#   data.sql      — the rows, including auth.users
#
# Why pg_dump rather than replaying supabase/migrations: that folder is
# incomplete. The hosted project has ten applied migrations and the repo has
# four files, so six exist only inside the hosting account — among them the
# ai_usage quota table, the daily_activity minute columns and the vocabulary
# soft-delete. Replaying the repo would silently build a different schema. A
# dump of the live database cannot disagree with the live database.
#
# Usage:
#   export DB_URL='postgresql://postgres.<ref>:<password>@<host>:5432/postgres'
#   bash deploy/export-from-supabase.sh
#
# The connection string is in the Supabase dashboard under Project Settings →
# Database → Connection string → URI. Use the direct connection on port 5432,
# not the pooler on 6543: a pooled connection cannot hold the locks pg_dump
# needs and will fail partway through.

set -euo pipefail

: "${DB_URL:?Set DB_URL to the direct Postgres connection string of the project}"

OUT="$(cd "$(dirname "$0")" && pwd)/dump"
mkdir -p "$OUT"

command -v pg_dump >/dev/null || {
  echo "pg_dump not found. On macOS: brew install libpq && brew link --force libpq" >&2
  exit 1
}

# The server is Postgres 17; a pg_dump older than the server refuses to run.
echo "Local pg_dump: $(pg_dump --version)"

echo "→ roles"
pg_dumpall --database="$DB_URL" --roles-only --no-role-passwords > "$OUT/roles.sql"

# auth and storage carry the accounts and the buckets. public is the app.
# Supabase's own internal schemas (extensions, graphql, vault, _realtime …)
# are recreated by the self-hosted stack itself and must NOT be carried over,
# or the restore collides with what the new stack has already built.
echo "→ schema"
pg_dump "$DB_URL" \
  --schema-only --no-owner --no-privileges \
  --schema=public --schema=auth --schema=storage \
  > "$OUT/schema.sql"

echo "→ data"
pg_dump "$DB_URL" \
  --data-only --no-owner --no-privileges \
  --schema=public --schema=auth --schema=storage \
  --exclude-table-data='auth.refresh_tokens' \
  --exclude-table-data='auth.sessions' \
  --exclude-table-data='auth.audit_log_entries' \
  > "$OUT/data.sql"

# Sessions and refresh tokens are deliberately left behind: they are bound to
# the old project's JWT secret, so carrying them over would hand every device
# a token the new server cannot verify. Everyone signs in once after the move,
# which is the correct outcome and worth stating in advance.

echo
echo "Done. In $OUT:"
ls -lh "$OUT"
echo
echo "Check schema.sql contains your tables before going further:"
echo "  grep -c 'CREATE TABLE' $OUT/schema.sql"
