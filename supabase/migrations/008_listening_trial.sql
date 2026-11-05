-- Lifetime introductory allowance, shared by all devices for an account.
begin;
create table if not exists public.listening_trials (
  user_id uuid primary key references auth.users(id) on delete cascade,
  fragments text[] not null default '{}',
  constraint listening_trial_limit check (cardinality(fragments) <= 10)
);
alter table public.listening_trials enable row level security;
revoke all on public.listening_trials from anon, authenticated;

create or replace function public.listening_trial(p_fragment text default null)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  completed text[];
begin
  if uid is null then raise exception 'Authentication required'; end if;
  if p_fragment is not null and (length(p_fragment) = 0 or length(p_fragment) > 200) then
    raise exception 'Invalid fragment';
  end if;
  insert into public.listening_trials(user_id) values (uid) on conflict do nothing;
  select fragments into completed from public.listening_trials where user_id = uid for update;
  if p_fragment is not null and not (p_fragment = any(completed)) and cardinality(completed) < 10 then
    completed := array_append(completed, p_fragment);
    update public.listening_trials set fragments = completed where user_id = uid;
  end if;
  return cardinality(completed);
end;
$$;
revoke all on function public.listening_trial(text) from public, anon;
grant execute on function public.listening_trial(text) to authenticated;
notify pgrst, 'reload schema';
commit;
