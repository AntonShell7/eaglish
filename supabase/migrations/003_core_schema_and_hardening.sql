-- The core tables, written down at last.
--
-- Until now they existed only in the live database: created by hand, never in
-- version control, and therefore impossible to review, to rebuild or to stand
-- a second environment up from. Everything below is idempotent, so running it
-- against the existing project changes only what was missing.

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  interface_language text default 'en',
  theme_preference text default 'system',
  english_level text,
  learner_profile jsonb,
  created_at timestamptz default now()
);

create table if not exists public.vocabulary_words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  word text not null,
  translation text not null,
  source_text text,
  added_at timestamptz default now(),
  interval_days integer default 0,
  ease_factor real default 2.5,
  due_at timestamptz default now(),
  review_count integer default 0
);

create table if not exists public.writing_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  topic_id text not null,
  word_count integer not null,
  grammar integer not null,
  vocabulary integer not null,
  coherence integer not null,
  overall integer not null,
  submitted_at timestamptz default now()
);

create table if not exists public.reading_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  text_id text not null,
  opened_at timestamptz default now()
);

create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  text_id text not null,
  correct integer not null,
  total integer not null,
  answered_at timestamptz default now()
);

create table if not exists public.daily_activity (
  user_id uuid not null references auth.users on delete cascade,
  day date not null,
  reading integer not null default 0,
  writing integer not null default 0,
  vocabulary integer not null default 0,
  quiz integer not null default 0,
  primary key (user_id, day)
);

-- Two whole sections were being dropped on the way to the server: dictation
-- has been a section for months and slang since this week, and neither had a
-- column to land in. A second device saw a learner who had never listened to
-- anything.
alter table public.daily_activity add column if not exists listening integer not null default 0;
alter table public.daily_activity add column if not exists slang integer not null default 0;

-- The memory model replaced interval-and-ease locally, but the server still
-- held only the old pair — so signing in on a second device threw away every
-- word's measured stability and rebuilt an estimate from the fallback.
alter table public.vocabulary_words add column if not exists stability real;
alter table public.vocabulary_words add column if not exists difficulty real;
alter table public.vocabulary_words add column if not exists lapses integer default 0;
alter table public.vocabulary_words add column if not exists last_reviewed_at timestamptz;
-- The sentence a word was met in is what makes it a memory rather than an
-- entry, and it was staying on whichever device saw it first.
alter table public.vocabulary_words add column if not exists sentence text;

alter table public.profiles enable row level security;
alter table public.vocabulary_words enable row level security;
alter table public.writing_submissions enable row level security;
alter table public.reading_sessions enable row level security;
alter table public.quiz_results enable row level security;
alter table public.daily_activity enable row level security;

-- One rule, stated per table rather than assumed: you reach your own rows and
-- nobody else's. Written down so it can be reviewed in a diff instead of in a
-- dashboard nobody opens.
do $$
declare
  t text;
begin
  foreach t in array array['vocabulary_words','writing_submissions','reading_sessions','quiz_results','daily_activity']
  loop
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format(
      'create policy "own rows" on public.%I for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      t);
  end loop;
end $$;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- The profile trigger, hardened. Three problems at once: an unqualified
-- search_path on a SECURITY DEFINER function is the classic way to have one
-- hijacked; it was reachable as an RPC by anyone, signed in or not; and a
-- duplicate insert raised instead of doing nothing, which is exactly what a
-- retried sign-up produces.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Accounts created before the trigger existed have no profile row, so they had
-- nowhere to store a level.
insert into public.profiles (id)
select u.id from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- Time is measured on the device and never left it, so the only place that
-- could answer "how long do people actually stay" was one browser's local
-- storage. One column fixes that, and it rides along with the activity row
-- that is already pushed every day.
alter table public.daily_activity add column if not exists minutes integer not null default 0;
