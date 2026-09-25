import { loadTopicTexts, readingTopics } from "@/data/readingLibrary";
import type { ReadingText } from "@/data/readingTexts";

/**
 * Finds a text by the id carried in a link.
 *
 * The home screen offers a particular text by name and shows a line of it, so
 * following that offer has to land on that text. Dropping the reader on a list
 * of topics instead would make the offer a lie, and an interface that promises
 * something specific and delivers a menu is exactly the friction the home
 * screen exists to remove.
 *
 * The library is split into per-topic chunks loaded on demand, so this looks
 * through them rather than keeping an index in memory — a few hundred
 * kilobytes of JSON is not worth holding for a link that is followed once.
 */
export async function findTextById(id: string): Promise<ReadingText | null> {
  const topics = readingTopics.filter((topic) => topic.total > 0);
  const batches = await Promise.all(topics.map((topic) => loadTopicTexts(topic.id)));
  for (const batch of batches) {
    const found = batch.find((text) => text.id === id);
    if (found) return found;
  }
  return null;
}
