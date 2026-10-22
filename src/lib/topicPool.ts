import pool from "@/data/topicPool.json";

/**
 * Subjects for "pick one for me", dealt rather than drawn.
 *
 * The button shipped picking at random from twenty, which is not a small pool
 * but a broken one: five clicks on twenty subjects repeat about half the time,
 * and a button that shows you the same thing twice in a row reads as fake. Two
 * things fix it and both are needed. The pool is a few hundred now. And it is
 * dealt from a shuffled deck without replacement, so a repeat is not unlikely,
 * it is impossible until every other subject has been offered.
 *
 * The deck's position lives on the device, which is the right scope: it is a
 * fact about what this person has already been shown, not about the account.
 * A regenerated pool is a different size, which reshuffles — so topping the
 * pool up never leaves somebody stranded at the end of an old deck.
 */

interface Subject {
  ru: string;
  en: string;
}

const SUBJECTS = pool as Subject[];
const DECK_KEY = "subjectDeck";

interface Deck {
  order: number[];
  at: number;
  size: number;
}

function shuffled(length: number): number[] {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function readDeck(): Deck | null {
  try {
    const raw = localStorage.getItem(DECK_KEY);
    return raw ? (JSON.parse(raw) as Deck) : null;
  } catch {
    return null;
  }
}

function store(deck: Deck) {
  try {
    localStorage.setItem(DECK_KEY, JSON.stringify(deck));
  } catch {
    /* Storage disabled. The deck then restarts each time, which still beats
       drawing with replacement — it only loses the memory between sessions. */
  }
}

export const subjectCount = SUBJECTS.length;

/** The next subject this device has not been offered, in the given language. */
export function nextSubject(language: string): string {
  if (SUBJECTS.length === 0) return "";

  let deck = readDeck();
  if (!deck || deck.size !== SUBJECTS.length || deck.at >= deck.order.length) {
    deck = { order: shuffled(SUBJECTS.length), at: 0, size: SUBJECTS.length };
  }

  const subject = SUBJECTS[deck.order[deck.at]];
  store({ ...deck, at: deck.at + 1 });
  return language.startsWith("ru") ? subject.ru : subject.en;
}
