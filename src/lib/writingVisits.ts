/** Count actual page mounts, scoped to the learner on this browser. */
export function recordWritingVisit(storage: Pick<Storage, "getItem" | "setItem">, userId: string): boolean {
  try {
    const key = `eaglish:writing-intro:${userId}`;
    const raw = Number(storage.getItem(key) ?? 0);
    const visits = Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
    storage.setItem(key, String(Math.min(3, visits + 1)));
    return visits < 2;
  } catch {
    return true;
  }
}
