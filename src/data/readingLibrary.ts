import { readingTexts as curated, type ReadingText } from "./readingTexts";
import topicIndex from "./reading/index.json";

/**
 * The reading library, addressed by topic.
 *
 * Texts are no longer one flat list: there are a couple of hundred of them, so
 * the page asks for a topic first and only then loads it. Each topic is a
 * separate JSON chunk pulled in on demand — bundling the whole library into the
 * first page load would cost every visitor a few hundred kilobytes to read one
 * article.
 *
 * The six hand-written texts stay in `readingTexts.ts` and are folded into
 * whichever topic they belong to, so nothing about them depends on the
 * generator having run.
 */

export interface ReadingTopic {
  id: string;
  label: string;
  counts: Record<string, number>;
  total: number;
}

/** The hand-written texts predate the topic ids and carry human labels. */
const CURATED_TOPIC: Record<string, string> = {
  "Daily life": "daily-life",
  Travel: "travel",
  Technology: "technology",
  Communication: "society",
  Science: "science",
  Society: "society",
};

function curatedFor(topicId: string): ReadingText[] {
  return curated
    .filter((text) => (CURATED_TOPIC[text.topic] ?? text.topic) === topicId)
    .map((text) => ({ ...text, topic: topicId }));
}

/** Topic cards, with the curated texts counted in. */
export const readingTopics: ReadingTopic[] = (topicIndex as ReadingTopic[]).map((topic) => {
  const extra = curatedFor(topic.id);
  const counts = { ...topic.counts };
  for (const text of extra) counts[text.level] = (counts[text.level] ?? 0) + 1;
  return { ...topic, counts, total: topic.total + extra.length };
});

export const readingLibrarySize = readingTopics.reduce((sum, topic) => sum + topic.total, 0);

export function findTopic(id: string): ReadingTopic | undefined {
  return readingTopics.find((topic) => topic.id === id);
}

const cache = new Map<string, ReadingText[]>();

/**
 * Loads one topic. A missing chunk is not an error — a topic can exist in the
 * index before anything has been generated for it, and the curated texts should
 * still show up.
 */
export async function loadTopicTexts(topicId: string): Promise<ReadingText[]> {
  const cached = cache.get(topicId);
  if (cached) return cached;

  let generated: ReadingText[] = [];
  try {
    const chunk = await import(`./reading/${topicId}.json`);
    generated = (chunk.default ?? []) as ReadingText[];
  } catch {
    generated = [];
  }

  const texts = [...curatedFor(topicId), ...generated];
  cache.set(topicId, texts);
  return texts;
}

export function wordCount(text: ReadingText): number {
  return text.sentences.reduce((sum, s) => sum + s.text.split(/\s+/).filter(Boolean).length, 0);
}
