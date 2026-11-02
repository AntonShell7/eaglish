/** Freeze rules start at launch; earlier missed days are never rewritten. */
export const FREEZES_START = "2026-11-02";
export const MAX_FREEZES = 2;
export const REFILL_DAYS = 7;
const DAY = 86_400_000;

function ordinal(key: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const time = Date.parse(`${key}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === key ? time / DAY : null;
}

/** Derived from synced activity, so devices cannot spend the same freeze twice.
 * A frozen day keeps the run alive but never counts as a day of practice.
 * Today remains open until local midnight. No writes or synthetic activity.
 */
export function calculateStreak(activityDates: string[], today: string) {
  const end = ordinal(today);
  const launch = ordinal(FREEZES_START)!;
  const days = [...new Set(activityDates.map(ordinal).filter((d): d is number => d !== null && end !== null && d <= end))].sort((a, b) => a - b);
  let current = 0;
  let best = 0;
  let freezes = MAX_FREEZES;
  let refillProgress = 0;
  const frozenDates: string[] = [];
  const practicedToday = end !== null && days.includes(end);

  function gap(from: number, to: number) {
    if (!current || from > to) return;
    // The part before launch obeys the old uninterrupted streak rules.
    if (from < launch) { current = 0; return; }
    const missed = to - from + 1;
    const protectedCount = Math.min(missed, freezes);
    for (let n = 0; n < protectedCount; n++) frozenDates.push(new Date((from + n) * DAY).toISOString().slice(0, 10));
    freezes -= protectedCount;
    if (missed > protectedCount) current = 0;
  }

  days.forEach((day, index) => {
    if (index > 0) gap(days[index - 1] + 1, day - 1);
    current++;
    best = Math.max(best, current);
    if (day >= launch) {
      refillProgress++;
      if (refillProgress === REFILL_DAYS) {
        freezes = Math.min(MAX_FREEZES, freezes + 1);
        refillProgress = 0;
      }
    }
  });
  if (end !== null && days.length) gap(days[days.length - 1] + 1, end - 1);
  return { current, best, freezes, refillProgress, frozenDates, practicedToday };
}
