-- Section progress that was only ever on the device.
--
-- Three stores never left the browser they were written in: which dictation
-- lessons have been finished, how far each slang dialogue got, and the words
-- marked "I already know this". All three are real work, and all three
-- silently reset when the learner opened the app anywhere else — a phone, a
-- second laptop, the same machine after clearing site data.
--
-- The last of them matters most. "Already know" is the single most valuable
-- tap in the app: one word of ground truth is worth more than a level's worth
-- of assumption, and it keeps the review queue free of words that were never
-- a problem. Losing that list means the learner is asked to study words they
-- have already told us they know, which is the fastest way to teach somebody
-- that the app does not listen.
--
-- One JSONB column rather than three tables. These are small, read and
-- written as a whole, and never queried by their contents, so a column keeps
-- the sync a single round trip. If any of them ever needs to be queried
-- field-by-field it can be promoted to a table then.

alter table public.profiles
  add column if not exists section_progress jsonb not null default '{}'::jsonb;

comment on column public.profiles.section_progress is
  'Per-device learning progress merged across devices: dictation lessons, slang dialogues and known words. Shape: {dictation:{}, slang:{}, knownWords:[], updatedAt:number}.';

-- No policy changes are needed: profiles already restricts every operation to
-- auth.uid() = id, and this column rides along with the row it belongs to.
-- Stated rather than assumed, because a new column on an RLS-protected table
-- is exactly where a silent leak would come from.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
  ) then
    raise exception 'profiles has no RLS policies — refusing to add a column that would be world-readable';
  end if;
end $$;
