-- Match the owner's stable auth account, including requests from older clients.
create or replace function public.track_visit(browser_id uuid, event_kind text, entry_source text default '')
returns void language sql security definer set search_path = '' as $$
  insert into public.site_visit_events(visitor,kind,source)
  select browser_id,event_kind,left(coalesce(entry_source,''),80)
  where auth.uid() is distinct from '6a17fd54-f32e-4b08-afcf-d59db5372907'::uuid
  on conflict do nothing;
$$;
