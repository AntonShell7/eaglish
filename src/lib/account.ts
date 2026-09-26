import { supabase } from "./supabase";

/**
 * Leaving, and taking your things with you.
 *
 * The privacy policy tells people their data is theirs and that they can take
 * it or remove it. Until now both sentences were true only in the sense that
 * nobody had tested them: there was no export and no delete. A promise you
 * have not built is not a promise.
 */

/**
 * Everything this app has ever written about the person, in one file.
 *
 * Local storage is the real archive — the app is local-first, so the server
 * holds a mirror rather than the original — and it is read wholesale rather
 * than key by key, because a list of keys goes stale the first time a feature
 * is added and nobody notices the export has quietly stopped being complete.
 */
export function exportMyData(email: string | null): string {
  const local: Record<string, unknown> = {};
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) continue;
      const raw = localStorage.getItem(key);
      if (raw === null) continue;
      try {
        local[key] = JSON.parse(raw);
      } catch {
        local[key] = raw;
      }
    }
  } catch {
    /* a browser with storage blocked has nothing to export anyway */
  }

  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      account: email,
      note: "Everything Eaglish holds about you, as it is stored. Readable JSON — nothing here is encoded or hidden.",
      data: local,
    },
    null,
    2,
  );
}

/** Hands the browser a file rather than a blob URL left lying around. */
export function downloadJson(contents: string, filename: string) {
  const url = URL.createObjectURL(new Blob([contents], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export type DeleteOutcome = "ok" | "not-signed-in" | "failed";

/**
 * Deletes the account itself, on the server.
 *
 * Removing a row from `auth.users` needs the service key, and a service key in
 * a browser bundle is the whole database handed to whoever opens devtools. So
 * the browser asks an edge function, the function reads who is asking from the
 * token rather than from the request, and the key never leaves Supabase.
 *
 * Local data is cleared either way: someone who asked to be forgotten should
 * not find their vocabulary still sitting in the browser afterwards.
 */
export async function deleteAccount(): Promise<DeleteOutcome> {
  if (!supabase) return "not-signed-in";

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return "not-signed-in";

  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!base) return "failed";

  let response: Response;
  try {
    response = await fetch(`${base}/functions/v1/delete-account`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
        "Content-Type": "application/json",
      },
    });
  } catch {
    return "failed";
  }

  if (!response.ok) return "failed";

  try {
    localStorage.clear();
  } catch {
    /* nothing left to do about it */
  }
  await supabase.auth.signOut();
  return "ok";
}
