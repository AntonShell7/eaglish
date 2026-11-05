-- Per-account learning records. No email or credentials are stored here.
create table if not exists public.learning_records (
 user_id uuid not null references auth.users(id) on delete cascade,
 category text not null,
 item_id text not null,
 data jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now(),
 primary key(user_id,category,item_id)
);
alter table public.learning_records enable row level security;
revoke all on public.learning_records from public,anon,authenticated;
grant select on public.learning_records to authenticated;
grant all on public.learning_records to service_role;
create policy "read own learning records" on public.learning_records for select to authenticated using(user_id=auth.uid());
create table if not exists public.slang_award_catalog(lesson_id text primary key);
alter table public.slang_award_catalog enable row level security;
revoke all on public.slang_award_catalog from public,anon,authenticated;
grant all on public.slang_award_catalog to service_role;
insert into public.slang_award_catalog(lesson_id) values
('chat-honesty-pair'),
('idiom-basics'),
('speech-teasing'),
('cycle-one-check'),
('chat-notes-pair'),
('idiom-actions'),
('speech-reactions-pair'),
('cycle-two-check'),
('chat-basics-pair'),
('idiom-people'),
('speech-agreement-pair'),
('cycle-three-check'),
('chat-reassurance-pair'),
('idiom-impressions'),
('speech-bold-energy'),
('cycle-ten-check'),
('chat-emphasis'),
('idiom-story'),
('speech-unfiltered-pair'),
('cycle-eleven-check'),
('chat-truth-pair'),
('idiom-confidence'),
('speech-praise'),
('cycle-twelve-check'),
('chat-plans-pair'),
('idiom-rules'),
('speech-boundaries'),
('cycle-four-check'),
('chat-reactions-pair'),
('idiom-feelings'),
('speech-complaints-pair'),
('cycle-five-check'),
('chat-context-pair'),
('idiom-nerves'),
('speech-reductions-pair'),
('cycle-six-check'),
('chat-uncertainty'),
('idiom-low-key'),
('speech-labels-pair'),
('cycle-seven-check'),
('chat-boundaries-pair'),
('idiom-decisions'),
('speech-insults-pair'),
('cycle-eight-check'),
('chat-anger-pair'),
('idiom-confrontation-pair'),
('speech-profanity-pair'),
('cycle-nine-check'),
('chat-meetups-pair'),
('idiom-introductions-pair'),
('speech-plans-pair'),
('cycle-thirteen-check'),
('chat-mistakes-pair'),
('idiom-setbacks-pair'),
('speech-apologies-pair'),
('cycle-fourteen-check'),
('chat-availability-pair'),
('idiom-workload-pair'),
('speech-support-pair'),
('cycle-fifteen-check'),
('chat-opinions-pair'),
('idiom-deciding-pair'),
('speech-refusals-pair'),
('cycle-sixteen-check'),
('chat-information-pair'),
('idiom-information-pair'),
('speech-clarification-pair'),
('cycle-seventeen-check'),
('chat-laughter-pair'),
('idiom-money-pair'),
('speech-contractions-pair'),
('cycle-eighteen-check'),
('regroup-1-chat'),
('regroup-1-idiom'),
('regroup-1-speech'),
('regroup-pairs-1-check'),
('regroup-2-chat'),
('regroup-2-idiom'),
('regroup-2-speech'),
('regroup-pairs-2-check'),
('regroup-3-chat'),
('regroup-3-idiom'),
('regroup-3-speech'),
('regroup-pairs-3-check'),
('regroup-4-chat'),
('regroup-4-idiom'),
('regroup-4-speech'),
('regroup-pairs-4-check'),
('regroup-5-chat'),
('regroup-5-idiom'),
('regroup-5-speech'),
('regroup-pairs-5-check'),
('regroup-6-chat'),
('regroup-6-idiom'),
('regroup-6-speech'),
('regroup-pairs-6-check'),
('regroup-7-chat'),
('regroup-7-idiom'),
('regroup-7-speech'),
('regroup-pairs-7-check'),
('regroup-8-chat'),
('regroup-8-idiom'),
('regroup-8-speech'),
('regroup-pairs-8-check'),
('new-1-chat'),
('new-1-idiom'),
('new-1-speech'),
('new-pairs-1-check'),
('new-2-chat'),
('new-2-idiom'),
('new-2-speech'),
('new-pairs-2-check'),
('new-3-chat'),
('new-3-idiom'),
('new-3-speech'),
('new-pairs-3-check'),
('new-4-chat'),
('new-4-idiom'),
('new-4-speech'),
('new-pairs-4-check'),
('new-5-chat'),
('new-5-idiom'),
('new-5-speech'),
('new-pairs-5-check'),
('new-6-chat'),
('new-6-idiom'),
('new-6-speech'),
('new-pairs-6-check'),
('new-7-chat'),
('new-7-idiom'),
('new-7-speech'),
('new-pairs-7-check'),
('new-8-chat'),
('new-8-idiom'),
('new-8-speech'),
('new-pairs-8-check') on conflict do nothing;
create or replace function public.save_learning_record(p_category text,p_item text,p_data jsonb)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare who uuid:=auth.uid(); old jsonb; merged jsonb;
begin
 if who is null then raise exception 'authentication required'; end if;
 if p_category not in ('slang','slang-review','reading','listening','practice') or length(p_item) not between 1 and 200 or jsonb_typeof(p_data)<>'object' or octet_length(p_data::text)>200000 then raise exception 'invalid learning record'; end if;
 perform pg_advisory_xact_lock(hashtextextended(who::text,0));
 select data into old from public.learning_records where user_id=who and category=p_category and item_id=p_item;
 old:=coalesce(old,'{}'::jsonb); merged:=old||p_data;
 -- Monotone fields: stale device snapshots cannot erase accomplishments.
 if old->>'completed'='true' then merged:=merged||jsonb_build_object('completed',true,'completedAt',old->'completedAt'); end if;
 if p_category in ('reading','listening','practice') then
  merged:=merged||jsonb_build_object('seconds',greatest(coalesce((old->>'seconds')::numeric,0),least(31536000,greatest(0,coalesce((p_data->>'seconds')::numeric,0)))),'furthest',greatest(coalesce((old->>'furthest')::numeric,0),least(10000,greatest(0,coalesce((p_data->>'furthest')::numeric,0)))));
 end if;
 if p_category='slang-review' and coalesce((old->>'round')::int,0)>coalesce((p_data->>'round')::int,0) then merged:=old; end if;
 if p_category='slang' and merged->>'completed'='true' then merged:=merged||jsonb_build_object('draft',null); end if;
 insert into public.learning_records values(who,p_category,p_item,merged,now()) on conflict(user_id,category,item_id) do update set data=excluded.data,updated_at=excluded.updated_at;
 if p_category='slang' and merged->>'completed'='true' and not exists(select 1 from public.slang_award_catalog c where not exists(select 1 from public.learning_records r where r.user_id=who and r.category='slang' and r.item_id=c.lesson_id and r.data->>'completed'='true')) then
  insert into public.learning_records values(who,'achievement','slang-2026-11',jsonb_build_object('completed',true,'completedAt',now(),'total',(select count(*) from public.slang_award_catalog)),now()) on conflict do nothing;
 end if;
end $$;
revoke all on function public.save_learning_record(text,text,jsonb) from public,anon;
grant execute on function public.save_learning_record(text,text,jsonb) to authenticated;
notify pgrst,'reload schema';
