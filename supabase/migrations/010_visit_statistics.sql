create table if not exists public.site_visit_events (
  visitor uuid not null,
  kind text not null check (kind in ('open','signup','lesson')),
  source varchar(80) not null default '',
  at timestamptz not null default now()
);
create index if not exists site_visit_time on public.site_visit_events(at);
create unique index if not exists site_visit_milestones on public.site_visit_events(visitor,kind) where kind <> 'open';
alter table public.site_visit_events enable row level security;
revoke all on public.site_visit_events from public, anon, authenticated;

create or replace function public.track_visit(browser_id uuid, event_kind text, entry_source text default '')
returns void language sql security definer set search_path = '' as $$
  insert into public.site_visit_events(visitor,kind,source)
  values(browser_id,event_kind,left(coalesce(entry_source,''),80)) on conflict do nothing;
$$;
revoke all on function public.track_visit(uuid,text,text) from public;
grant execute on function public.track_visit(uuid,text,text) to anon,authenticated;

create or replace function public.visit_report(period text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  local_day timestamptz := date_trunc('day',now(),'Europe/Moscow');
  finish timestamptz := now();
  start_at timestamptz;
  step interval;
begin
  case period
    when 'night' then
      start_at := local_day;
      finish := least(finish,local_day + interval '8 hours');
    when 'today' then start_at := local_day;
    when '24h' then start_at := finish - interval '24 hours';
    when 'week' then start_at := finish - interval '7 days';
    when 'month' then start_at := finish - interval '30 days';
    else raise exception 'Invalid period';
  end case;
  step := case when period in ('month','week') then interval '1 day' else interval '1 hour' end;
  return (with entries as (
    select * from public.site_visit_events where kind='open' and at >= start_at and at < finish
  ), cohort as (
    select visitor,min(at) as entered from entries group by visitor
  ), funnel as (
    select c.visitor,s.at as signup,l.at as lesson from cohort c
    left join public.site_visit_events s on s.visitor=c.visitor and s.kind='signup' and s.at between c.entered and finish
    left join public.site_visit_events l on l.visitor=c.visitor and l.kind='lesson' and l.at between s.at and finish
  ), buckets as (
    select b, count(e.visitor) as n from generate_series(start_at,finish - interval '1 microsecond',step) b
    left join entries e on e.at>=b and e.at<b+step group by b
  ), sources as (
    select source,count(*) as n from entries group by source order by n desc,source limit 10
  )
  select jsonb_build_object('opens',(select count(*) from entries),'visitors',count(*),
    'signups',count(signup),'lessons',count(lesson),'start',start_at,'end',finish,
    'buckets',coalesce((select jsonb_agg(jsonb_build_object('at',b,'n',n) order by b) from buckets),'[]'::jsonb),
    'sources',coalesce((select jsonb_agg(jsonb_build_object('source',source,'n',n) order by n desc,source) from sources),'[]'::jsonb))
  from funnel);
end $$;
revoke all on function public.visit_report(text) from public,anon,authenticated;
grant execute on function public.visit_report(text) to service_role;
