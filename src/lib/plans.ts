/** Shared prices and plan features. Reading and vocabulary stay free;
 * Slang includes the first block, listening includes ten lifetime fragments,
 * and Smart repetition requires Pro from the start.
 */

export type PlanId = "free" | "pro";

/**
 * The sections a paid plan opens.
 *
 * These are route segments, matched against the first part of the path, and
 * they are the authority for both the router guard and the lock marks in the
 * navigation.
 */
export const PRO_SECTIONS = ["dictation", "writing", "slang"] as const;
export type ProSection = (typeof PRO_SECTIONS)[number];

/** Whether a path needs a paid plan. */
export function sectionOf(pathname: string): ProSection | null {
  const first = pathname.split("/").filter(Boolean)[0];
  return PRO_SECTIONS.find((section) => section === first) ?? null;
}

/**
 * Prices, in roubles.
 *
 * **These are for display.** The amount actually charged is decided by
 * `api/_pay.ts`, which holds its own copy because the serverless functions are
 * compiled separately and do not resolve this project's path aliases. Change
 * one and change the other in the same commit: a mismatch shows one price and
 * charges another.
 *
 * `yearly` is deliberately not twelve times `monthly`: paying for a year is
 * worth a discount to us as well as to the learner, because a year of language
 * learning is the unit that actually works and a month is the unit that gets
 * abandoned in week three.
 */
/** Base prices displayed alongside the current launch offer. */
export const STANDARD_PRICES = {
  monthly: 399,
  yearly: 2900,
} as const;

/** Launch prices apply to all purchases while the offer is published. */
export const PRICES = {
  monthly: 199,
  yearly: 1999,
} as const;

/** Arabic storefront display prices. Checkout remains governed by api/_pay.ts
 * until the international payment integration is connected. */
const ARABIC_PRICES = { monthly: 4, yearly: 48 } as const;
const ARABIC_STANDARD_PRICES = { monthly: 5, yearly: 60 } as const;

export function displayPrices(language: string) {
  const usd = language.split("-")[0] === "ar";
  return {
    prices: usd ? ARABIC_PRICES : PRICES,
    standard: usd ? ARABIC_STANDARD_PRICES : STANDARD_PRICES,
    usd,
    format: (amount: number) => usd ? `$${amount.toLocaleString("en-US")}` : `${amount.toLocaleString("ru-RU")} ₽`,
  };
}

/** How much the yearly plan saves, as a whole-rouble figure, for the badge. */
export const YEARLY_SAVING = PRICES.monthly * 12 - PRICES.yearly;

/** Live checkout is enabled after verifying the payment provider connection. */
export const PAYMENTS_LIVE = true;

/**
 * The model allowance each plan gets per day.
 *
 * These numbers mirror `claim_ai_call` in migration 005 and exist here only to
 * be *shown*. The server does not consult this file, and nothing in the client
 * should treat these as a limit it enforces — they are copy, and the database
 * is the authority.
 */
export const DAILY_AI_CALLS: Record<PlanId, number> = {
  free: 40,
  pro: 300,
};

/**
 * What each plan includes, as locale keys.
 *
 * Keys rather than text, so the Russian and English pages stay in step, and a
 * list rather than prose so the two columns can be read against each other —
 * which is the only reason a pricing table beats a paragraph.
 */
export const PLAN_FEATURES: Record<PlanId, readonly string[]> = {
  free: ["slangTrial", "listeningTrial", "readingAll", "vocabulary", "schedule", "progress", "aiFree"],
  pro: ["slang", "listening", "writing", "everythingFree", "handwriting", "aiPro"],
} as const;

/** Whether a plan is still in force. `null` expiry means it never runs out. */
export function isCurrent(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return true;
  const at = Date.parse(expiresAt);
  return Number.isFinite(at) ? at > Date.now() : true;
}
