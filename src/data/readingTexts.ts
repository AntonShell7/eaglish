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
