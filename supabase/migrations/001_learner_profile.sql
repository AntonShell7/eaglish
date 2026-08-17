-- Onboarding answers: level, goal, interests and daily goal.
--
-- Stored as one jsonb blob rather than a column per answer: the shape is read
-- and written only by the client, and every future question would otherwise be
-- another migration to remember. Until this runs, the profile simply stays on
-- the device — the app detects the missing column and stops trying to sync it.
--
-- Run once: Supabase Dashboard -> SQL Editor -> New query -> Run.
alter table profiles add column if not exists learner_profile jsonb;
