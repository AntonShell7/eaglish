/**
 * What the visitor agreed to store.
 *
 * The honest position first, because it shapes the UI: Eaglish keeps a theme, an
 * interface language, a sign-in session and the learning progress itself. All of
 * that is strictly necessary — under GDPR it needs no consent at all, and a
 * banner that pretends otherwise is theatre. What the banner is really for is
 * the analytics slot: nothing is connected today, and if anything ever is, it
 * stays off until someone turns it on here.
 *
 * `version` exists so that adding a genuinely new purpose later re-asks rather
 * than silently inheriting a decision made about something else.
 */

export const CONSENT_VERSION = 1;

export interface Consent {
  version: number;
  /** Always true — the app cannot run without it, and we say so plainly. */
  necessary: true;
  analytics: boolean;
  decidedAt: number;
}

const STORAGE_KEY = "consent";
/** Fired when the decision changes, so the shell can react without a reload. */
export const CONSENT_EVENT = "eaglish:consent";

export function getConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Consent;
    return parsed.version === CONSENT_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

export function saveConsent(analytics: boolean): Consent {
  const consent: Consent = { version: CONSENT_VERSION, necessary: true, analytics, decidedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new Event(CONSENT_EVENT));
  return consent;
}

/** Lets the footer reopen the panel after a decision has been made. */
export const CONSENT_REOPEN = "eaglish:consent-reopen";

export function openConsentSettings() {
  window.dispatchEvent(new Event(CONSENT_REOPEN));
}

/**
 * When the account holder accepted the terms and the privacy policy.
 *
 * Local for now, which is honest but weak evidence — it belongs in the profile
 * row once the learner_profile migration is applied server-side.
 */
export function recordLegalAcceptance() {
  localStorage.setItem(
    "legalAcceptedAt",
    JSON.stringify({ at: Date.now(), privacy: CONSENT_VERSION, terms: CONSENT_VERSION }),
  );
}

/**
 * The inventory shown in the details view. Keeping it in code rather than in
 * prose means it can be checked against what the app actually writes.
 */
export const STORAGE_INVENTORY = [
  { key: "themeMode", purpose: "theme" as const },
  { key: "interfaceLanguage", purpose: "language" as const },
  { key: "sb-…-auth-token", purpose: "session" as const },
  { key: "vocabularyWords, activityLog, …", purpose: "progress" as const },
  { key: "consent", purpose: "consent" as const },
];
