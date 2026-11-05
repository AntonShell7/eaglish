import { CONSENT_EVENT, getConsent } from "./consent";
import { supabase } from "./supabase";

const key = "visitBrowser";
let counted = false;

function entrySource() {
  const campaign = new URLSearchParams(location.search).get("utm_source");
  if (campaign && /^[\p{L}\d._ -]{1,80}$/u.test(campaign)) return campaign;
  if (!document.referrer) return "";
  const host = new URL(document.referrer).hostname;
  return host === location.hostname ? location.hostname : host;
}

export function trackVisit(kind: "open" | "signup" | "lesson") {
  if (!supabase || !getConsent()?.analytics || import.meta.env.VITE_DEMO_MODE === "true") return;
  try {
    const visitor = localStorage.getItem(key) || crypto.randomUUID();
    localStorage.setItem(key, visitor);
    void supabase.rpc("track_visit", {
      browser_id: visitor, event_kind: kind, entry_source: kind === "open" ? entrySource() : "",
    }).then(() => {}, () => {});
  } catch { /* Storage can be disabled in private browsing. */ }
}

export function startVisitAnalytics() {
  const sync = () => {
    if (!getConsent()?.analytics) {
      counted = false;
      try { localStorage.removeItem(key); } catch { /* Storage unavailable. */ }
    } else if (!counted && !location.pathname.startsWith("/admin")) {
      counted = true;
      trackVisit("open");
    }
  };
  sync();
  window.addEventListener(CONSENT_EVENT, sync);
  window.addEventListener("storage", sync);
}
