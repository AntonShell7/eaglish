/** Empty sets have no vocabulary row yet; keep their names per account locally.
 * Populated sets continue to travel through the existing vocabulary sync. */
export function readFolderNames(userId: string): string[] {
  try {
    const names: unknown = JSON.parse(localStorage.getItem(`eaglish:folders:${userId}`) ?? "[]");
    return Array.isArray(names) ? names.filter((name): name is string => typeof name === "string" && !!name.trim()) : [];
  } catch { return []; }
}
export function writeFolderNames(userId: string, names: string[]) {
  localStorage.setItem(`eaglish:folders:${userId}`, JSON.stringify([...new Set(names)]));
}
