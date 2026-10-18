-- Taking money, and turning it into access.
--
-- The whole of this file exists to make one moment safe: a payment provider
-- tells us somebody paid, and an account becomes paid-for. Everything that can
-- go wrong there is either "we believed something that did not happen" or "we
-- did it twice".
--
-- The first is handled in the webhook, not here: it never trusts the body it
-- was sent, and instead fetches the payment from the provider's own API by id
-- and believes only that. A forged notification is then worth nothing.
--
-- The second is handled here, by `confirm_payment` being the only way a
-- subscription is extended by money, and by it refusing to act twice on the
-- same payment. Notifications are retried — that is normal and not a fault —
-- so "already done" has to be a successful answer rather than an error.

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  provider text not null default 'yookassa',
  /* The provider's own id. Unique, because it is what makes a retried
     notification land on the row it already landed on. */
  provider_payment_id text unique,
  amount_rub integer not null check (amount_rub > 0),
  cycle text not null check (cycle in ('monthly', 'yearly')),
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'canceled')),
  /* The address the receipt goes to. Kept on the row rather than looked up
     later, because an account can change its email and a receipt belongs to
     the payment, not to the current state of the account. */
  email text,
  /* 422-ФЗ requires a receipt per payment. Until the provider is confirmed to
     register them automatically, they are issued by hand in «Мой налог», and
     this is how the owner's console knows which ones still need one. A column
     rather than an assumption: "I think I did that one" is not a record. */
  receipt_issued boolean not null default false,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists payments_user_idx on public.payments (user_id, created_at desc);
create index if not exists payments_unreceipted_idx
  on public.payments (paid_at)
  where status = 'succeeded' and receipt_issued = false;

alter table public.payments enable row level security;

-- Read your own payments; write nothing. Same reasoning as `subscriptions`:
-- a row here is a claim about money, and a claim about money that the claimant
-- can edit is not a record of anything.
drop policy if exists "read own payments" on public.payments;
create policy "read own payments" on public.payments
  for select to authenticated using (auth.uid() = user_id);

/* ── Money becomes access ─────────────────────────────────────────────── */

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

  new_expires := coalesce(base, now()) + make_interval(days => add_days);

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

-- Only the service key may call this. It is the one function in the schema
-- that grants paid access, and nothing holding a browser token should be able
-- to reach it under any circumstances.
revoke execute on function public.confirm_payment(text) from public, anon, authenticated;

/* Marking a payment as cancelled, for the same webhook. Separate from the
   above so that the function which grants access does exactly one thing. */
create or replace function public.cancel_payment(p_provider_payment_id text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.payments
  set status = 'canceled'
  where provider_payment_id = p_provider_payment_id and status = 'pending';

  return jsonb_build_object('ok', true);
end;
$$;

revoke execute on function public.cancel_payment(text) from public, anon, authenticated;
