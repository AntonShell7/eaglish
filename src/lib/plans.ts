/**
 * What is free, what is paid, and what it costs.
 *
 * One file, because these facts are needed by the pricing page, the paywall,
 * the navigation and the route guards, and a price that lives in four places
 * is a price that will disagree with itself. Change a number here and every
 * screen follows.
 *
 * The boundary is drawn on purpose rather than by what was easiest to lock.
 * Reading is free and complete — all of it, every text — because reading is
 * where words come from, and the whole product is built on the claim that you
 * learn a word by meeting it in something you wanted to read. A free tier that
 * rations that has nothing to sell later: nobody buys a vocabulary tool before
 * they have a vocabulary. So the free account does the collecting, and the
 * paid account does everything that *uses* what was collected — listening,
 * writing, and the spoken English the textbooks leave out.
 *
 * The dictionary and the review schedule are free forever, in both tiers. They
 * are where somebody's own work accumulates, and holding that hostage is the
 * one thing that would make the paywall feel like a trap instead of a price.
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
export const PRICES = {
  monthly: 390,
  yearly: 2900,
} as const;

/** How much the yearly plan saves, as a whole-rouble figure, for the badge. */
export const YEARLY_SAVING = PRICES.monthly * 12 - PRICES.yearly;

/**
 * Whether money can actually be taken yet.
 *
 * It cannot: that needs a registered sole trader, a published offer, a payment
 * provider's moderation and automatic receipts under 54-ФЗ. Weeks, not days.
 *
 * The page exists before any of that for two reasons. A provider will not even
 * review a site that has no prices, no offer and no contacts — so this has to
 * be live *before* the application, not after. And the people arriving first
 * have codes, which need somewhere to be typed.
 *
 * So the prices are shown and stated as what they will be, with no button that
 * pretends to charge. Flip this to true when the provider is connected and the
 * page turns itself into a real checkout.
 */
export const PAYMENTS_LIVE = false;

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
  free: ["readingAll", "vocabulary", "schedule", "progress", "aiFree"],
  pro: ["everythingFree", "listening", "writing", "slang", "handwriting", "aiPro"],
} as const;

/** Whether a plan is still in force. `null` expiry means it never runs out. */
export function isCurrent(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return true;
  const at = Date.parse(expiresAt);
  return Number.isFinite(at) ? at > Date.now() : true;
}
