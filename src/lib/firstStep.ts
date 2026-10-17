import { loadTopicTexts, readingTopics, wordCount } from "@/data/readingLibrary";
import type { ReadingText } from "@/data/readingTexts";
import { getLearnerProfile } from "./learnerProfile";

/**
 * One text, chosen for this learner, to be the first thing they do.
 *
 * A new account used to finish onboarding and arrive at a dashboard offering
 * four sections, three practice buttons and a checklist — which is a menu,
 * and a menu is a decision. The work of deciding what to study is the work
 * people are worst at and least willing to do, and asking it of somebody in
 * their first thirty seconds is how a first session becomes the only session.
 *
 * So the screen names one text and offers one button.
 *
 * The library rather than the generated desk: the desk is written around
 * words the learner has saved, and a learner who has just arrived has saved
 * none — it also needs a model call, which can be slow or unavailable, and
 * the first screen cannot be contingent on either.
 */

export interface FirstStep {
  text: ReadingText;
  topicId: string;
  minutes: number;
}

/** A reading pace for a learner, not for a native. */
const WORDS_PER_MINUTE = 110;

/** The bands a text may carry, loosest first, so a near match still counts. */
function matchesBand(level: string, band: string | null): boolean {
  if (!band) return true;
  if (level === band) return true;
  /* "A1-A2" should accept an A1 text and an A2 text alike. Bands in the
     library are sometimes ranges and sometimes exact, and demanding an exact
     string match would reject most of the shelf. */
  return band.split("-").some((part) => level.includes(part)) || level.split("-").some((part) => band.includes(part));
}

/**
 * Pick it.
 *
 * Preference order: a topic the learner said they were interested in, then
 * any topic; within that, a text at their level, then any text; and among
 * those, the shortest — because the first one has to be finishable. Two
 * minutes of reading that ends is worth more than ten that does not.
 */
export async function pickFirstStep(): Promise<FirstStep | null> {
  const profile = getLearnerProfile();
  const band = profile?.level ?? null;
  const interests = profile?.interests ?? [];

  const preferred = readingTopics.filter(
    (topic) => topic.total > 0 && (interests.includes(topic.id) || interests.includes(topic.label)),
  );
  const fallback = readingTopics.filter((topic) => topic.total > 0);
  const order = [...preferred, ...fallback.filter((topic) => !preferred.includes(topic))];

  for (const topic of order.slice(0, 4)) {
    let texts: ReadingText[];
    try {
      texts = await loadTopicTexts(topic.id);
    } catch {
      continue;
    }
    if (texts.length === 0) continue;

    const atLevel = texts.filter((text) => matchesBand(text.level, band));
    const pool = atLevel.length > 0 ? atLevel : texts;
    const shortest = [...pool].sort((a, b) => wordCount(a) - wordCount(b))[0];
    if (!shortest) continue;

    return {
      text: shortest,
      topicId: topic.id,
      minutes: Math.max(1, Math.round(wordCount(shortest) / WORDS_PER_MINUTE)),
    };
  }

  return null;
}
