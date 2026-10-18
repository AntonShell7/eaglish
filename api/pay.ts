import type { IncomingMessage, ServerResponse } from "node:http";
import { corsOrigin, originAllowed } from "./_ai.js";
import {
  createPayment,
  isCycle,
  paymentsConfigured,
  PRICES,
  serviceConfig,
  serviceFetch,
  whoIs,
} from "./_pay.js";

/**
 * POST /api/pay — start a subscription payment.
 *
 * The order of operations is the interesting part, and it is deliberate:
 * write our own row first, then ask the provider for a payment, using the row
 * id as the idempotence key. Done the other way round — provider first, row
 * second — a failure between the two leaves a real payment in the world that
 * nothing here has a record of, which is the worst of the available outcomes
 * because the learner has been charged and the webhook will arrive referring
 * to a payment we cannot recognise.
 *
 * This way the failure mode is a `pending` row that never becomes anything,
 * which costs nobody money and can be read in the console.
 *
 * The amount is never taken from the request. The browser says "monthly" or
 * "yearly"; the price comes from PRICES here. The alternative is letting the
 * payer name their price.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const origin = header(req, "origin");
  const host = header(req, "host");
  const allowed = corsOrigin(origin, host);

  if (allowed) {
    res.setHeader("Access-Control-Allow-Origin", allowed);
    res.setHeader("Vary", "Origin");
  }

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "86400");
    res.statusCode = allowed ? 204 : 403;
    res.end();
    return;
  }

  if (req.method !== "POST") return send(res, 405, { error: "method-not-allowed" });
  if (!originAllowed(origin, host)) return send(res, 403, { error: "forbidden" });

  if (!paymentsConfigured(process.env)) {
    /* No provider keys yet. Said distinctly rather than as a generic failure,
       because "payments are not switched on" and "payment failed" send the
       learner to two completely different places. */
    return send(res, 503, { error: "payments-off" });
  }

  const config = serviceConfig(process.env);
  if (!config) return send(res, 503, { error: "payments-off" });

  const token = bearer(header(req, "authorization"));
  if (!token) return send(res, 401, { error: "unauthenticated" });

  const who = await whoIs(config, token);
  if (!who) return send(res, 401, { error: "unauthenticated" });

  let body: { cycle?: unknown };
  try {
    body = JSON.parse(await readBody(req)) as { cycle?: unknown };
  } catch {
    return send(res, 400, { error: "bad-json" });
  }

  if (!isCycle(body.cycle)) return send(res, 400, { error: "bad-cycle" });
  const cycle = body.cycle;
  const amountRub = PRICES[cycle];

  /* Our record, before anything exists at the provider. */
  const created = await serviceFetch(config, "/rest/v1/payments", {
    method: "POST",
    prefer: "return=representation",
    body: {
      user_id: who.id,
      provider: "yookassa",
      amount_rub: amountRub,
      cycle,
      status: "pending",
      email: who.email,
    },
  });

  if (!created || !created.ok) return send(res, 503, { error: "unavailable" });

  const rows = (await created.json()) as { id?: string }[];
  const rowId = rows[0]?.id;
  if (!rowId) return send(res, 503, { error: "unavailable" });

  const site = siteUrl(origin, host);

  const payment = await createPayment(process.env, {
    /* Our row id. Unique, and written down before this call, so a retry of
       this request cannot produce a second charge. */
    idempotenceKey: rowId,
    amountRub,
    description:
      cycle === "yearly" ? "Eaglish — полный доступ на год" : "Eaglish — полный доступ на месяц",
    returnUrl: `${site}/profile`,
    email: who.email,
    metadata: { paymentRowId: rowId, userId: who.id },
  });

  if (!payment?.confirmationUrl) {
    /* The provider refused. Close our row so it does not sit pending for
       ever, pretending something is in flight. */
    await serviceFetch(config, `/rest/v1/payments?id=eq.${rowId}`, {
      method: "PATCH",
      body: { status: "canceled" },
    });
    return send(res, 503, { error: "unavailable" });
  }

  /* Now the two records know about each other, and the webhook — which only
     ever receives a provider id — can find this row. */
  await serviceFetch(config, `/rest/v1/payments?id=eq.${rowId}`, {
    method: "PATCH",
    body: { provider_payment_id: payment.id },
  });

  send(res, 200, { url: payment.confirmationUrl });
}

/** The site this request came from, for the address the payer returns to. */
function siteUrl(origin: string | undefined, host: string | undefined): string {
  if (origin && /^https?:\/\//.test(origin)) return origin.replace(/\/+$/, "");
  return host ? `https://${host}` : "https://eaglish.ru";
}

function bearer(value: string | undefined): string | null {
  if (!value) return null;
  const match = /^Bearer\s+(.+)$/i.exec(value.trim());
  const token = match?.[1]?.trim();
  return token && token.length > 20 ? token : null;
}

function header(req: IncomingMessage, name: string): string | undefined {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function send(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}
