/**
 * Where the serverless functions live, as far as the browser is concerned.
 *
 * Empty by default, which means "this same site" — the normal arrangement, and
 * the one that holds when the whole thing is served from Vercel.
 *
 * It stops holding the moment the site itself moves to Russian hosting, which
 * is what happened on 20 Oct 2026. `eaglish.ru` on a foreign address turned
 * out to be filtered: the TLS handshake carries the hostname in clear, small
 * responses passed, and anything substantial — the 1.7 MB bundle, the
 * stylesheet — died at about ten kilobytes. The same files over
 * `eaglish.vercel.app` arrived in a second and a half.
 *
 * So the site is served from the St Petersburg box, and the functions stay
 * where they are, because they call OpenAI and OpenAI refuses Russian
 * addresses. The browser therefore talks to two places: everything it displays
 * comes from Russia, and the handful of model calls go abroad under a hostname
 * that is not filtered.
 *
 * Those calls are small — a word and its sentence out, a translation back — so
 * they pass comfortably under whatever ceiling is being applied.
 *
 * Set `VITE_API_BASE` at build time for the Russian build. Leaving it unset
 * keeps same-origin behaviour, which is what local development and any
 * Vercel-served build want.
 */
const RAW = (import.meta.env.VITE_API_BASE ?? "").trim();

/** No trailing slash, so joining a path can never produce a double one. */
export const API_BASE = RAW.replace(/\/+$/, "");

/** An absolute URL for a function, or the bare path when the base is unset. */
export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
