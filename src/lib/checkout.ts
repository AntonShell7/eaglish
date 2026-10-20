import { supabase } from "./supabase";
import { apiUrl } from "./apiBase";

/**
 * Sending somebody off to pay.
 *
 * Deliberately thin. The browser knows which period was chosen and nothing
 * else — not the amount, not the provider, not what happens afterwards. It
 * asks the server to start a payment and follows wherever it is sent.
 *
 * In particular it never learns whether the payment succeeded. The learner
 * comes back to the site from the provider's page, which proves nothing: they
 * may have paid, abandoned it, or pressed back. Access is granted by the
 * webhook, server to server, and the returning browser simply re-reads its
 * plan. Treating the return as proof of payment is the classic way to hand out
 * subscriptions for free.
 */

export type CheckoutError = "payments-off" | "unauthenticated" | "unavailable" | "failed";

export type CheckoutResult = { ok: true; url: string } | { ok: false; error: CheckoutError };

export async function startCheckout(cycle: "monthly" | "yearly"): Promise<CheckoutResult> {
  if (!supabase) return { ok: false, error: "unavailable" };

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { ok: false, error: "unauthenticated" };

  let response: Response;
  try {
    response = await fetch(apiUrl("/api/pay"), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ cycle }),
    });
  } catch {
    return { ok: false, error: "failed" };
  }

  if (response.status === 401) return { ok: false, error: "unauthenticated" };
  if (response.status === 503) {
    /* Two different 503s: no provider keys at all, or the provider refused
       this payment. The first is "we have not opened yet" and the second is
       "try again", and telling somebody the wrong one wastes their time. */
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: body?.error === "payments-off" ? "payments-off" : "unavailable" };
  }
  if (!response.ok) return { ok: false, error: "failed" };

  const body = (await response.json().catch(() => null)) as { url?: string } | null;
  return body?.url ? { ok: true, url: body.url } : { ok: false, error: "failed" };
}
