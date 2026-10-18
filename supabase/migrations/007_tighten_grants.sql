-- Hardening found by auditing the live database before the first real users.
--
-- Nothing here fixes a leak: every table was probed with the public key and
-- every one of them returned nothing, every write was refused, and the
-- function that grants paid access could not be called at all. What follows
-- removes capabilities that are currently unreachable but should not exist,
-- and closes one thing that *was* reachable.

/* ── 1. Anyone at all could write feedback ────────────────────────────────
 *
 * The one genuinely open door. The policy allowed `anon` to insert with no
 * condition, and the anon key ships in the page by design — so anybody could
 * write unlimited rows into the table, until the disk filled.
 *
 * Nothing is lost by closing it: the feedback button renders only for a
 * signed-in user (`{user && <FeedbackButton />}` in Layout), so no real
 * submission has ever come from an anonymous caller.
 *
 * The check does two more things. A row may carry the caller's own id or no
 * id at all, which stops one account filing feedback as another — the client
 * sends null in demo mode, so both have to be allowed. And the message is
 * capped: unbounded text in an open-ish endpoint is a disk-filling tool with
 * extra steps. */
drop policy if exists "Anyone can send feedback" on public.feedback;

create policy "signed-in people can send feedback" on public.feedback
  for insert to authenticated
  with check (
    (user_id is null or user_id = auth.uid())
    and length(message) between 1 and 4000
  );

/* ── 2. anon and authenticated could TRUNCATE every table ─────────────────
 *
 * Stock Supabase grants ALL on every table in `public` to both roles and
 * leans on row-level security to make that safe. For reads and writes that
 * works, and the probes confirm it.
 *
 * **TRUNCATE is not subject to row-level security.** No policy can refuse it.
 * It is not reachable today — PostgREST only ever issues select, insert,
 * update, delete and function calls, and Postgres is not exposed outside the
 * Docker network — so this is defence in depth rather than a fix. But it is
 * the one privilege in the list that no policy can take back, and it is
 * granted to a role whose key is published in the page.
 *
 * REFERENCES and TRIGGER go too: neither is reachable through the API and
 * both let a role attach things to a table it does not own. */
do $$
declare
  t record;
begin
  for t in
    select c.relname
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
  loop
    execute format(
      'revoke truncate, references, trigger on public.%I from anon, authenticated',
      t.relname);
  end loop;
end $$;

/* ── 3. Functions callable by roles that have no business calling them ────
 *
 * Neither is exploitable. `claim_ai_call` raises on a null `auth.uid()`
 * before touching anything, and `handle_new_user` is a trigger function that
 * Postgres refuses to run directly and PostgREST cannot even find.
 *
 * They are tightened anyway because the reasoning that makes them safe lives
 * in their bodies, and a later edit to either body would silently remove it.
 * Migration 003 already revoked `handle_new_user`; this database was built
 * from a dump of the hosted project rather than by replaying the migrations,
 * so that revoke never reached it. */
revoke execute on function public.claim_ai_call(integer, integer) from public, anon;
grant execute on function public.claim_ai_call(integer, integer) to authenticated;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

/* ── Deliberately not done ────────────────────────────────────────────────
 *
 * Several tables carry two policies that say the same thing: one named
 * "own rows" granted to `authenticated`, and an older one granted to
 * `public` left over from the hosted project. Policies are OR-ed, both test
 * `auth.uid() = user_id`, and for an anonymous caller `auth.uid()` is null,
 * so the pair grants exactly what one would. There is no exposure.
 *
 * Dropping the duplicates is tidying, and tidying the rules that govern every
 * learner's access to their own data, hours before the first real users
 * arrive, is a bad trade. It is written down here instead, to be done on a
 * quiet day with time to check it. */
