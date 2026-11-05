create or replace function public.subscription_report(excluded uuid[])
returns jsonb language sql stable security definer set search_path = '' as $$
with people as (
  select id from auth.users where not (id = any(coalesce(excluded,'{}'::uuid[])))
), active as (
  select s.user_id from public.subscriptions s join people p on p.id=s.user_id
  where s.plan='pro' and (s.expires_at is null or s.expires_at>now())
), buyers as (
  select distinct p.user_id,p.cycle from public.payments p join people u on u.id=p.user_id
  where p.status='succeeded'
)
select jsonb_build_object(
  'users',(select count(*) from people),
  'activePro',(select count(*) from active),
  'buyers',(select count(distinct user_id) from buyers),
  'monthly',(select count(*) from buyers where cycle='monthly'),
  'yearly',(select count(*) from buyers where cycle='yearly')
);
$$;
revoke all on function public.subscription_report(uuid[]) from public,anon,authenticated;
grant execute on function public.subscription_report(uuid[]) to service_role;
