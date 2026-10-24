export interface GlossaryEntry {
  translation: string;
  partOfSpeech?: string;
}

export interface ReadingSentence {
  text: string;
  translationRu: string;
}

export interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[];
  /** Index into `options`. */
  answer: number;
  explanation: string;
}

export interface ReadingText {
  id: string;
  level: "A1-A2" | "B1-B2" | "C1-C2";
  /**
   * Shown first on its shelf.
   *
   * The library grew in waves, and the newest wave is the one written about
   * things a reader already half-knows — clubs, studios, phone launches. Those
   * are what somebody opens; the older general texts are good and are not what
   * gets clicked first. So the shelf leads with them rather than leaving the
   * order to how the files happened to be written.
   */
  featured?: boolean;
  /**
   * Written to a register rather than to a band.
   *
   * "Advanced" is not a CEFR level: it is idiom and literary vocabulary, which
   * a confident B1 reader gets as much from as a C2 one. Carried beside the
   * level rather than inside it, because flattening the two loses the half
   * that matters — these are hard words in easy syntax.
   */
  register?: "advanced";
  /** Topic id in the library taxonomy; the six curated texts still use labels. */
  topic: string;
  /** True for machine-generated texts, so they can be audited or replaced. */
  generated?: boolean;
  title: string;
  sentences: ReadingSentence[];
  glossary: Record<string, GlossaryEntry>;
  questions: ComprehensionQuestion[];
}

/*
 * Emptied deliberately.
 *
 * These six predate the rewrite and were written to a different brief.
 * Leaving them beside the new texts would have meant two standards on one
 * shelf, and the older one setting the reader's expectations first. The
 * array stays so the type and every import of it survive; the library is
 * now entirely the topic files.
 */
export const readingTexts: ReadingText[] = [];
