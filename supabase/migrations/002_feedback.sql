-- Feedback from testers, and the learner profile column from 001.
--
-- The launch to friends exists to collect reports, so they need somewhere to
-- land that isn't a chat message someone forgets to relay. Anyone may insert —
-- a signed-out visitor hitting a bug is exactly who we want to hear from — and
-- nobody may read through the API; reports are read in the dashboard.
--
-- Applied to the project on 2026-08-18.
alter table profiles add column if not exists learner_profile jsonb;

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  message text not null,
  page text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table feedback enable row level security;

drop policy if exists "Anyone can send feedback" on feedback;
create policy "Anyone can send feedback" on feedback
  for insert to anon, authenticated with check (true);
