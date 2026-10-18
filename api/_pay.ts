/**
 * Everything that knows the payment provider's name.
 *
 * Kept in one file on purpose. Choosing a provider before the business exists
 * is a guess — ЮKassa is the guess here, because it is the best documented of
 * the Russian options, supports both cards and СБП, and works with a
 * self-employed trader. If its moderation refuses the site, or its terms turn
 * out wrong, the thing to rewrite is this file and nothing else.
 *
 * The rest of the system talks about payments, not about ЮKassa.
 */

/* ── What a subscription costs ────────────────────────────────────────── */

/**
 * The authoritative prices.
 *
 * The browser sends a cycle, never an amount — otherwise the amount is simply
 * a number chosen by whoever is paying. So the figure charged is decided here
 * and nowhere else.
 *
 * `src/lib/plans.ts` holds a second copy for display. **They must be changed
 * together**, and the duplication is deliberate rather than lazy: `api/` is
 * compiled separately by the host and does not resolve the application's path
 * aliases, so importing the shared file would work locally and fail on deploy.
 * A mismatch here shows a learner one price and charges another, which is the
 * one bug in this file worth being afraid of.
 */
export const PRICES: Record<Cycle, number> = {
  monthly: 390,
  yearly: 2900,
};

export type Cycle = "monthly" | "yearly";

export function isCycle(value: unknown): value is Cycle {
  return value === "monthly" || value === "yearly";
}

/* ── The provider ─────────────────────────────────────────────────────── */

const API = "https://api.yookassa.ru/v3";

export interface ProviderPayment {
  id: string;
  status: "pending" | "waiting_for_capture" | "succeeded" | "canceled";
  /** Where to send the browser to actually pay. Only present on creation. */
  confirmationUrl?: string;
  amountRub: number;
}

function credentials(env: NodeJS.ProcessEnv): string | null {
  const shop = env.YOOKASSA_SHOP_ID;
  const secret = env.YOOKASSA_SECRET_KEY;
  if (!shop || !secret) return null;
  return Buffer.from(`${shop}:${secret}`).toString("base64");
}

export function paymentsConfigured(env: NodeJS.ProcessEnv): boolean {
  return credentials(env) !== null;
}

/**
 * Start a payment.
 *
 * The idempotence key is the provider's protection against a double charge:
 * send the same key twice and the second call returns the first payment
 * instead of making another. It is our own payment row's id, which is already
 * unique and already written down before this is called — so a retry anywhere
 * in this request cannot produce two payments for one intent.
 */
export async function createPayment(
  env: NodeJS.ProcessEnv,
  options: {
    idempotenceKey: string;
    amountRub: number;
    description: string;
    returnUrl: string;
    email: string | null;
    metadata: Record<string, string>;
  },
): Promise<ProviderPayment | null> {
  const auth = credentials(env);
  if (!auth) return null;

  const response = await fetch(`${API}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Idempotence-Key": options.idempotenceKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: { value: options.amountRub.toFixed(2), currency: "RUB" },
      capture: true,
      confirmation: { type: "redirect", return_url: options.returnUrl },
      description: options.description,
      metadata: options.metadata,
      ...(options.email ? { receipt_email: options.email } : {}),
    }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    id?: string;
    status?: string;
    confirmation?: { confirmation_url?: string };
    amount?: { value?: string };
  };

  if (!data.id || !data.status) return null;

  return {
    id: data.id,
    status: data.status as ProviderPayment["status"],
    confirmationUrl: data.confirmation?.confirmation_url,
    amountRub: Number(data.amount?.value ?? 0),
  };
}

/**
 * Ask the provider what really happened to a payment.
 *
 * This is the whole security model of the webhook. ЮKassa does not sign its
 * notifications, so the body of an incoming request proves nothing: anyone who
 * knows the URL can post "payment succeeded" to it. Rather than guarding the
 * endpoint with an address allowlist — which breaks the day the provider adds
 * a server — the notification is treated as a *rumour*. It supplies an id and
 * nothing else; the status comes from here, over a connection authenticated
 * with our own secret.
 */
export async function getPayment(env: NodeJS.ProcessEnv, id: string): Promise<ProviderPayment | null> {
  const auth = credentials(env);
  if (!auth) return null;

  const response = await fetch(`${API}/payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    id?: string;
    status?: string;
    amount?: { value?: string };
  };

  if (!data.id || !data.status) return null;

  return {
    id: data.id,
    status: data.status as ProviderPayment["status"],
    amountRub: Number(data.amount?.value ?? 0),
  };
}

/* ── The database, with the service key ───────────────────────────────── */

export interface ServiceConfig {
  url: string;
  serviceKey: string;
}

export function serviceConfig(env: NodeJS.ProcessEnv): ServiceConfig | null {
  const url = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  return url && serviceKey ? { url: url.replace(/\/+$/, ""), serviceKey } : null;
}

/**
 * Who is making this request.
 *
 * Asked of Supabase rather than decoded here, for the same reason the model
 * quota is: this needs no signing secret, cannot drift out of step with the
 * project's auth settings, and a session revoked a minute ago stops working
 * now rather than when its token would have expired.
 */
export async function whoIs(
  config: ServiceConfig,
  token: string,
): Promise<{ id: string; email: string | null } | null> {
  let response: Response;
  try {
    response = await fetch(`${config.url}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: config.serviceKey },
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  const user = (await response.json()) as { id?: string; email?: string };
  return user.id ? { id: user.id, email: user.email ?? null } : null;
}

/** Insert, update or call, as the service role. */
export async function serviceFetch(
  config: ServiceConfig,
  path: string,
  init: { method: string; body?: unknown; prefer?: string },
): Promise<Response | null> {
  try {
    return await fetch(`${config.url}${path}`, {
      method: init.method,
      headers: {
        apikey: config.serviceKey,
        Authorization: `Bearer ${config.serviceKey}`,
        "Content-Type": "application/json",
        ...(init.prefer ? { Prefer: init.prefer } : {}),
      },
      ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
    });
  } catch {
    return null;
  }
}
