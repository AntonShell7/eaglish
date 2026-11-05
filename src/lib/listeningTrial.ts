import { supabase } from "./supabase";
import { FREE_LISTENING_FRAGMENTS } from "./freeAccess";

/** The server owns the lifetime allowance; replaying a fragment is idempotent. */
export async function listeningTrial(fragment: string | null, demo: boolean): Promise<number> {
  if (demo) {
    const key = "demoListeningTrial";
    const completed: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    if (fragment && !completed.includes(fragment) && completed.length < FREE_LISTENING_FRAGMENTS) {
      completed.push(fragment);
      localStorage.setItem(key, JSON.stringify(completed));
    }
    return completed.length;
  }
  if (!supabase) throw new Error("Listening trial unavailable");
  const { data, error } = await supabase.rpc("listening_trial", { p_fragment: fragment });
  if (error || typeof data !== "number") throw new Error("Listening trial unavailable");
  return data;
}
