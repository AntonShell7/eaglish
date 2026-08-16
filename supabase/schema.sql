-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Mirrors the localStorage-based stores used before Supabase was connected,
-- so migrating client code from localStorage to these tables is a 1:1 swap.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  interface_language text default 'en',
  theme_preference text default 'system',
  english_level text,
  created_at timestamptz default now()
);

create table if not exists vocabulary_words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  word text not null,
  translation text not null,
  source_text text,
  added_at timestamptz default now(),
  interval_days integer default 0,
  ease_factor real default 2.5,
  due_at timestamptz default now(),
  review_count integer default 0
);

create table if not exists writing_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text not null,
  word_count integer not null,
  grammar integer not null,
  vocabulary integer not null,
  coherence integer not null,
  overall integer not null,
  submitted_at timestamptz default now()
);

create table if not exists reading_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text_id text not null,
  opened_at timestamptz default now()
);

-- Row Level Security: every user can only ever see and modify their own rows.
alter table profiles enable row level security;
alter table vocabulary_words enable row level security;
alter table writing_submissions enable row level security;
alter table reading_sessions enable row level security;

create policy "Users manage their own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users manage their own vocabulary" on vocabulary_words
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own writing submissions" on writing_submissions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage their own reading sessions" on reading_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a profile row whenever a new user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
