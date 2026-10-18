import type { IncomingMessage, ServerResponse } from "node:http";
import { getPayment, serviceConfig, serviceFetch } from "./_pay.js";

/**
 * POST /api/pay-webhook — the provider says something happened.
 *
 * **Nothing in the request body is believed.** ЮKassa does not sign its
 * notifications, so a POST claiming a payment succeeded proves only that
 * somebody knows this URL. The body is read for one thing — an id — and the
 * status is then fetched from the provider's own API over a connection
 * authenticated with our secret. A forged notification therefore achieves
 * exactly nothing: either the id does not exist, or it does and the provider
 * tells us its real state.
 *
 * That is why there is no address allowlist here. An allowlist is a second
 * thing to maintain, it breaks silently the day the provider adds a server,
 * and it would be the only thing standing between a stranger and free
 * subscriptions. This way the endpoint is safe to leave open.
 *
 * It answers 200 to almost everything on purpose. A webhook that returns an
 * error is retried, often for days; the only thing worth being retried is a
 * failure on our side that might succeed later.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end();
    return;
  }

  const config = serviceConfig(process.env);
  if (!config) {
    /* Our own misconfiguration. Worth retrying, so say so. */
    res.statusCode = 503;
    res.end();
    return;
  }

  let event: { event?: unknown; object?: { id?: unknown } };
  try {
    event = JSON.parse(await readBody(req)) as { event?: unknown; object?: { id?: unknown } };
  } catch {
    return ok(res);
  }

  const id = typeof event.object?.id === "string" ? event.object.id : null;
  if (!id) return ok(res);

  /* The only statement that counts. */
  const payment = await getPayment(process.env, id);
  if (!payment) {
    /* Either the id is invented, or the provider is unreachable. The second
       is worth a retry and the two are indistinguishable from here, so ask
       to be told again. */
    res.statusCode = 503;
    res.end();
    return;
  }

  if (payment.status === "succeeded") {
    const response = await serviceFetch(config, "/rest/v1/rpc/confirm_payment", {
      method: "POST",
      body: { p_provider_payment_id: payment.id },
    });

    /* A database that could not be reached is the one case where being asked
       again genuinely helps — somebody has paid and does not yet have what
       they paid for. */
    if (!response || !response.ok) {
      res.statusCode = 503;
      res.end();
      return;
    }

    return ok(res);
  }

  if (payment.status === "canceled") {
    await serviceFetch(config, "/rest/v1/rpc/cancel_payment", {
      method: "POST",
      body: { p_provider_payment_id: payment.id },
    });
    return ok(res);
  }

  /* Still in flight. Nothing to do; another notification will follow. */
  return ok(res);
}

function ok(res: ServerResponse): void {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ ok: true }));
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
