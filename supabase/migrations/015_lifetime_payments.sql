-- Apply before enabling PAYMENTS_LIFETIME_ENABLED on the server.
begin;
alter table public.payments drop constraint if exists payments_cycle_check;
alter table public.payments add constraint payments_cycle_check check (cycle in ('monthly','yearly','lifetime'));
create or replace function public.confirm_payment(p_provider_payment_id text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  rec public.payments;
  add_days integer;
  base timestamptz;
  new_expires timestamptz;
begin
  select * into rec
  from public.payments
  where provider_payment_id = p_provider_payment_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'unknown-payment');
  end if;

  -- Already handled. A success, not a failure: providers retry notifications
  -- by design, and answering with an error would make them retry harder.
  if rec.status = 'succeeded' then
    return jsonb_build_object('ok', true, 'already', true);
  end if;

  if rec.status = 'canceled' then
    return jsonb_build_object('ok', false, 'error', 'canceled');
  end if;

  update public.payments
  set status = 'succeeded', paid_at = now()
  where id = rec.id;

  add_days := case rec.cycle when 'yearly' then 365 else 30 end;

  /* Extend from whichever is later: now, or the end of what they already
     have. Paying for a second month in the middle of the first must add a
     month to the end, not reset the clock to today — that would quietly
     charge somebody for days they already owned. */
  select greatest(now(), coalesce(s.expires_at, now()))
  into base
  from public.subscriptions s
  where s.user_id = rec.user_id;

  new_expires := case when rec.cycle = 'lifetime' then null else coalesce(base, now()) + make_interval(days => add_days) end;

  insert into public.subscriptions (user_id, plan, source, granted_at, expires_at, updated_at)
  values (rec.user_id, 'pro', 'payment', now(), new_expires, now())
  on conflict (user_id) do update set
    plan = 'pro',
    source = 'payment',
    granted_at = coalesce(subscriptions.granted_at, now()),
    -- A lifetime grant outranks a purchase. Somebody who already has access
    -- forever and pays anyway must not be downgraded to a year.
    expires_at = case
      when subscriptions.expires_at is null then null
      else new_expires
    end,
    updated_at = now();

  return jsonb_build_object('ok', true, 'expiresAt', new_expires, 'userId', rec.user_id);
end;
$$;


commit;
