-- Paid plans, and the codes that hand out access without money changing hands.
--
-- Three things live here: who has what plan, the codes that grant one, and the
-- single place where a plan actually changes what the server will do.
--
-- The honest shape of the problem first, because it decides the design.
--
-- This is a static site. Every reading text, every dictation and every slang
-- dialogue is compiled into the JavaScript bundle and sent to anyone who opens
-- the page, signed in or not. No row-level policy can take that back. So the
-- gate on a *section* is a gate in the interface: it decides what the app
-- offers, and someone willing to read the bundle can get past it. That is a
-- speed bump and is written down as one rather than described as security.
--
-- What cannot be got past is the model. Every call to a provider goes through
-- `claim_ai_call`, which runs here, counts against the caller's own identity
-- and cannot be reasoned with from a browser. Translation beyond the offline
-- dictionary, sentence checking, handwriting, generated texts — all of it is
-- metered here. So the plan is enforced where the money actually goes.
--
-- Hence: interface gating for the sections, server gating for the model.

/* ── Who has what ─────────────────────────────────────────────────────── */

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  -- How it was granted: 'code', 'payment' or 'grant'. Worth keeping, because
  -- "why does this person have pro" is otherwise unanswerable later.
  source text,
  granted_at timestamptz,
  -- null means it does not run out. A lifetime grant and a paid month are the
  -- same row with a different value here.
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

-- Read your own row; write nothing.
--
-- This is the whole reason the plan is not a column on `profiles`. That table
-- has a `for all` policy — a learner can update their own profile row, which
-- is correct for a display name and catastrophic for an entitlement. Anyone
-- could have granted themselves pro with one PostgREST call. Here there is no
-- insert, update or delete policy at all, so the only thing that can change a
-- plan is a definer function or someone with the service key.
drop policy if exists "read own subscription" on public.subscriptions;
create policy "read own subscription" on public.subscriptions
  for select to authenticated using (auth.uid() = user_id);

/* ── The codes ────────────────────────────────────────────────────────── */

create table if not exists public.access_codes (
  -- Stored normalised: upper case, letters and digits only. Whoever types it
  -- will use lower case, or spaces, or dashes.
  code text primary key,
  plan text not null default 'pro' check (plan in ('free', 'pro')),
  -- How long the access lasts once redeemed. null means forever, which is what
  -- the codes going to friends are.
  days integer,
  max_uses integer not null default 1 check (max_uses > 0),
  uses integer not null default 0,
  -- Who it was for. The only way to answer "which code did I give Dima".
  note text,
  created_at timestamptz not null default now(),
  -- When the code itself stops working, redeemed or not.
  expires_at timestamptz
);

-- RLS on, and deliberately **no policy**.
--
-- Not an omission. A table with RLS enabled and no policy is readable by
-- nobody through PostgREST, which is exactly right: a code anyone can list is
-- not a code. Only the definer function below and the service key can see
-- this table.
alter table public.access_codes enable row level security;

/* ── Guessing ─────────────────────────────────────────────────────────── */

-- Codes are short enough to type, which means short enough to guess at if
-- guessing is free. This makes it not free.
create table if not exists public.access_code_attempts (
  id bigserial primary key,
  user_id uuid not null references auth.users on delete cascade,
  at timestamptz not null default now()
);

alter table public.access_code_attempts enable row level security;

create index if not exists access_code_attempts_user_idx
  on public.access_code_attempts (user_id, at);

/* ── Redeeming ────────────────────────────────────────────────────────── */

create or replace function public.redeem_access_code(raw_code text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  normalised text;
  rec public.access_codes;
  recent integer;
  new_expires timestamptz;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  -- "eagl-2026 " and "EAGL2026" are the same code. Normalising on the way in
  -- means the person typing it never has to care.
  normalised := upper(regexp_replace(coalesce(raw_code, ''), '[^A-Za-z0-9]', '', 'g'));

  if length(normalised) < 4 then
    return jsonb_build_object('ok', false, 'error', 'not-found');
  end if;

  -- Housekeeping before counting, so the table does not grow without bound.
  delete from public.access_code_attempts where at < now() - interval '1 hour';

  select count(*) into recent
  from public.access_code_attempts
  where user_id = uid and at > now() - interval '1 hour';

  if recent >= 10 then
    return jsonb_build_object('ok', false, 'error', 'too-many');
  end if;

  -- `for update` because max_uses is checked and then incremented, and two
  -- people redeeming a single-use code at the same moment would otherwise
  -- both pass the check.
  select * into rec from public.access_codes where code = normalised for update;

  if not found then
    -- Only a wrong code counts as an attempt. A real code that has run out is
    -- not a guess, and rate-limiting it would punish the honest case.
    insert into public.access_code_attempts (user_id) values (uid);
    return jsonb_build_object('ok', false, 'error', 'not-found');
  end if;

  if rec.expires_at is not null and rec.expires_at < now() then
    return jsonb_build_object('ok', false, 'error', 'expired');
  end if;

  if rec.uses >= rec.max_uses then
    return jsonb_build_object('ok', false, 'error', 'used-up');
  end if;

  new_expires := case
    when rec.days is null then null
    else now() + make_interval(days => rec.days)
  end;

  insert into public.subscriptions (user_id, plan, source, granted_at, expires_at, updated_at)
  values (uid, rec.plan, 'code', now(), new_expires, now())
  on conflict (user_id) do update set
    plan = rec.plan,
    source = 'code',
    granted_at = now(),
    -- A second code extends and never shortens, and "forever" always wins.
    -- Somebody who already has a lifetime grant and then types a thirty-day
    -- code must not end up with thirty days.
    expires_at = case
      when new_expires is null or subscriptions.expires_at is null then null
      else greatest(subscriptions.expires_at, new_expires)
    end,
    updated_at = now();

  update public.access_codes set uses = uses + 1 where code = normalised;

  return jsonb_build_object(
    'ok', true,
    'plan', rec.plan,
    'expiresAt', new_expires
  );
end;
$$;

-- Executable by a signed-in learner and nobody else. Functions are granted to
-- PUBLIC by default, which would leave this callable with the anon key.
revoke execute on function public.redeem_access_code(text) from public, anon;
grant execute on function public.redeem_access_code(text) to authenticated;

/* ── The plan, as the server sees it ──────────────────────────────────── */

create or replace function public.current_plan()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (select plan from public.subscriptions
      where user_id = auth.uid()
        and (expires_at is null or expires_at > now())),
    'free');
$$;

revoke execute on function public.current_plan() from public, anon;
grant execute on function public.current_plan() to authenticated;

/* ── Where the plan actually bites ────────────────────────────────────── */

-- `claim_ai_call` took its limits as arguments, which was fine while there was
-- one tier and is not fine now: the arguments arrive from the caller, and a
-- learner holds a token that can call this function directly. Passing
-- `hourly_limit => 99999` was previously harmless — it only let someone burn
-- their own counter faster — but with tiers it would be the way around paying.
--
-- So the ceiling is decided here, from the subscription table, and the
-- arguments are demoted to an upper bound the caller may lower but never
-- raise. The signature and the returned columns are unchanged, so the Vercel
-- function needs no edit.
create or replace function public.claim_ai_call(hourly_limit integer default 60, daily_limit integer default 300)
returns table(allowed boolean, used_hour integer, used_day integer, retry_after integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  bucket timestamptz := date_trunc('hour', now());
  plan text;
  hour_ceiling integer;
  day_ceiling integer;
  eff_hour integer;
  eff_day integer;
  in_hour integer;
  in_day integer;
begin
  -- No session, no call. This is what makes the endpoint private: a request
  -- without a valid token never reaches the model provider.
  if uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  plan := public.current_plan();

  -- Free is a real allowance, not a teaser. A lookup tries the text's glossary,
  -- then a local cache, then 661 offline words before it ever costs a call, so
  -- forty a day is a great deal of reading. It is the sections that are paid
  -- for, not the dictionary.
  if plan = 'pro' then
    hour_ceiling := 60;
    day_ceiling := 300;
  else
    hour_ceiling := 15;
    day_ceiling := 40;
  end if;

  eff_hour := least(coalesce(hourly_limit, hour_ceiling), hour_ceiling);
  eff_day := least(coalesce(daily_limit, day_ceiling), day_ceiling);

  select coalesce(sum(calls), 0) into in_day
  from public.ai_usage
  where user_id = uid and hour > now() - interval '24 hours';

  select coalesce(calls, 0) into in_hour
  from public.ai_usage
  where user_id = uid and hour = bucket;

  if in_hour >= eff_hour then
    return query select false, in_hour, in_day,
      greatest(1, ceil(extract(epoch from (bucket + interval '1 hour' - now())))::integer);
    return;
  end if;

  if in_day >= eff_day then
    return query select false, in_hour, in_day, 3600;
    return;
  end if;

  -- Counted before the model is called rather than after. A request that fails
  -- upstream still cost an attempt, and counting only successes would let a
  -- script spin on errors for free.
  insert into public.ai_usage (user_id, hour, calls)
  values (uid, bucket, 1)
  on conflict (user_id, hour) do update set calls = public.ai_usage.calls + 1
  returning calls into in_hour;

  return query select true, in_hour, in_day + 1, 0;
end;
$$;

/* ── The accounts that already exist ──────────────────────────────────── */

-- Everyone registered before this migration gets pro, permanently.
--
-- At the time of writing that is the owner and a test account, so this is
-- nearly a no-op — but it is the right rule regardless of the number. Shipping
-- a paywall must never take away something somebody already had, and whoever
-- was using this before it had a price was doing the work of finding out
-- whether it was any good.
insert into public.subscriptions (user_id, plan, source, granted_at, expires_at)
select u.id, 'pro', 'grant', now(), null
from auth.users u
on conflict (user_id) do nothing;

/* ── Making codes ─────────────────────────────────────────────────────── */

-- There is no interface for this yet. Until there is, codes are made here —
-- through the Studio tunnel (see deploy/README.md) or psql on the server.
--
-- One lifetime code for one friend:
--
--   insert into public.access_codes (code, plan, days, max_uses, note)
--   values ('DIMA2026', 'pro', null, 1, 'Дима, запуск для друзей');
--
-- Ten codes at once, named and lifetime, each usable once:
--
--   insert into public.access_codes (code, plan, days, max_uses, note)
--   select 'EAGL' || upper(substr(md5(random()::text), 1, 6)), 'pro', null, 1, 'friends launch'
--   from generate_series(1, 10);
--
--   select code, note from public.access_codes where note = 'friends launch';
--
-- A thirty-day trial code that thirty different people may use:
--
--   insert into public.access_codes (code, plan, days, max_uses, note)
--   values ('TRY30', 'pro', 30, 30, 'тридцать дней, общий код');
--
-- Who has what, and where it came from:
--
--   select s.plan, s.source, s.expires_at, u.email
--   from public.subscriptions s join auth.users u on u.id = s.user_id
--   order by s.updated_at desc;
--
-- Avoid characters that are read wrong when a code is spoken or copied from a
-- screenshot: O and 0, I and 1, S and 5. The generator above uses md5, whose
-- alphabet is 0-9a-f, so it produces 0 and 1 — fine when the code is sent as
-- text, worth avoiding if it will ever be read aloud.
