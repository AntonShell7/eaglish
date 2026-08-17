/**
 * Placement test items, tagged by CEFR band.
 *
 * No AI here on purpose: a level check has to be instant, identical for
 * everyone and impossible to hallucinate. Each item has exactly one defensible
 * answer, and the distractors are the mistakes learners at that band actually
 * make — that is what makes a wrong answer informative.
 */

export type Band = "A1" | "A2" | "B1" | "B2" | "C1";

export const BANDS: Band[] = ["A1", "A2", "B1", "B2", "C1"];

export interface PlacementItem {
  id: string;
  band: Band;
  /** The sentence with a `___` gap. */
  text: string;
  options: string[];
  answer: number;
  /** Shown in the review afterwards, so a wrong answer still teaches. */
  note: string;
}

export const placementItems: PlacementItem[] = [
  /* ── A1 ──────────────────────────────────────────────────────────────── */
  {
    id: "a1-be",
    band: "A1",
    text: "Hi! ___ from Poland.",
    options: ["I'm", "I are", "I be", "Me is"],
    answer: 0,
    note: "\"I am\" shortens to \"I'm\". The verb changes with the person: I am, you are, he is.",
  },
  {
    id: "a1-s",
    band: "A1",
    text: "She ___ coffee every morning.",
    options: ["drinks", "drink", "is drink", "drinking"],
    answer: 0,
    note: "Present simple adds -s after he, she and it: she drinks, he works.",
  },
  {
    id: "a1-there",
    band: "A1",
    text: "There ___ two books on the table.",
    options: ["are", "is", "be", "has"],
    answer: 0,
    note: "Plural subject, plural verb: there is one book, there are two books.",
  },
  {
    id: "a1-article",
    band: "A1",
    text: "Can I have ___ apple, please?",
    options: ["an", "a", "the one", "some a"],
    answer: 0,
    note: "\"An\" goes before a vowel sound: an apple, an hour, but a university.",
  },
  {
    id: "a1-do",
    band: "A1",
    text: "___ you like pizza?",
    options: ["Do", "Are", "Does", "Is"],
    answer: 0,
    note: "Questions in present simple use do/does — \"are\" would need an adjective or -ing form.",
  },

  /* ── A2 ──────────────────────────────────────────────────────────────── */
  {
    id: "a2-past",
    band: "A2",
    text: "We ___ to the cinema yesterday.",
    options: ["went", "gone", "go", "were going"],
    answer: 0,
    note: "\"Yesterday\" fixes the action in the finished past, so past simple: went.",
  },
  {
    id: "a2-any",
    band: "A2",
    text: "Sorry, I don't have ___ money with me.",
    options: ["any", "some", "no any", "much of"],
    answer: 0,
    note: "\"Any\" is the one that works in negatives and questions; \"some\" belongs in statements.",
  },
  {
    id: "a2-super",
    band: "A2",
    text: "That's the ___ film I've ever seen.",
    options: ["best", "better", "goodest", "most good"],
    answer: 0,
    note: "Good → better → best. Superlatives compare against everything, not just one thing.",
  },
  {
    id: "a2-going",
    band: "A2",
    text: "We ___ going to visit our grandparents tomorrow.",
    options: ["are", "is", "be", "will"],
    answer: 0,
    note: "\"Be going to\" needs the right form of be: we are going to, he is going to.",
  },
  {
    id: "a2-frequency",
    band: "A2",
    text: "He ___ works late on Fridays.",
    options: ["usually", "use to", "used", "usual"],
    answer: 0,
    note: "Adverbs of frequency sit before the main verb: he usually works, she never eats.",
  },

  /* ── B1 ──────────────────────────────────────────────────────────────── */
  {
    id: "b1-continuous",
    band: "B1",
    text: "She ___ TV when the phone rang.",
    options: ["was watching", "watched", "watches", "has watched"],
    answer: 0,
    note: "The longer background action takes past continuous; the interruption takes past simple.",
  },
  {
    id: "b1-conditional",
    band: "B1",
    text: "If I ___ more time, I'd learn Japanese.",
    options: ["had", "have", "would have", "will have"],
    answer: 0,
    note: "Second conditional: if + past simple, then would. It describes something unreal now.",
  },
  {
    id: "b1-usedto",
    band: "B1",
    text: "I'm not used ___ up this early.",
    options: ["to getting", "to get", "get", "for getting"],
    answer: 0,
    note: "\"Be used to\" is followed by a noun or -ing: used to getting up. \"Used to get up\" means a past habit.",
  },
  {
    id: "b1-reported",
    band: "B1",
    text: "He asked me where I ___ from.",
    options: ["came", "come", "am coming", "will come"],
    answer: 0,
    note: "Reported speech shifts the tense back one step: \"Where do you come from?\" → where I came from.",
  },
  {
    id: "b1-since",
    band: "B1",
    text: "They ___ in this city since 2019.",
    options: ["have lived", "live", "lived", "are living"],
    answer: 0,
    note: "\"Since\" plus a still-true situation calls for present perfect: have lived.",
  },

  /* ── B2 ──────────────────────────────────────────────────────────────── */
  {
    id: "b2-pastperfect",
    band: "B2",
    text: "By the time we arrived, the meeting ___.",
    options: ["had already finished", "already finished", "has already finished", "was already finish"],
    answer: 0,
    note: "Past perfect marks the earlier of two past events — it finished before we arrived.",
  },
  {
    id: "b2-rather",
    band: "B2",
    text: "I'd rather you ___ tell anyone about this.",
    options: ["didn't", "don't", "won't", "not"],
    answer: 0,
    note: "\"I'd rather you\" takes a past form even about the present: I'd rather you didn't.",
  },
  {
    id: "b2-despite",
    band: "B2",
    text: "___ having little experience, she got the job.",
    options: ["Despite", "Although", "However", "Even"],
    answer: 0,
    note: "Despite is followed by a noun or -ing; \"although\" would need a full clause: although she had little experience.",
  },
  {
    id: "b2-phrasal",
    band: "B2",
    text: "The proposal was turned ___ by the committee.",
    options: ["down", "off", "over", "out"],
    answer: 0,
    note: "\"Turn down\" = reject. Turn off is for devices, turn over is to flip something.",
  },
  {
    id: "b2-passive",
    band: "B2",
    text: "The bridge ___ next year, according to the council.",
    options: ["will be rebuilt", "will rebuild", "is rebuilding", "rebuilds"],
    answer: 0,
    note: "The bridge receives the action, so it needs a passive: will be rebuilt.",
  },

  /* ── C1 ──────────────────────────────────────────────────────────────── */
  {
    id: "c1-inversion",
    band: "C1",
    text: "Little ___ that the deal would collapse a week later.",
    options: ["did he suspect", "he suspected", "he did suspect", "suspected he"],
    answer: 0,
    note: "A negative adverbial at the front inverts the subject and auxiliary: little did he suspect.",
  },
  {
    id: "c1-butfor",
    band: "C1",
    text: "___ for the strike, the project would have finished on time.",
    options: ["But", "If not", "Unless", "Except"],
    answer: 0,
    note: "\"But for X\" means \"if X hadn't happened\" — a fixed formal structure.",
  },
  {
    id: "c1-collocation",
    band: "C1",
    text: "The report makes ___ reference to the missing funds.",
    options: ["scant", "scarce", "rare", "thin"],
    answer: 0,
    note: "\"Scant reference\" is the established collocation; scarce and rare describe availability, not attention.",
  },
  {
    id: "c1-tentative",
    band: "C1",
    text: "After months of talks they reached a ___ agreement.",
    options: ["tentative", "tender", "timid", "tenuous"],
    answer: 0,
    note: "A tentative agreement is provisional. Tenuous means weak or barely holding — a different claim.",
  },
  {
    id: "c1-subjunctive",
    band: "C1",
    text: "The board insisted that the clause ___ removed before signing.",
    options: ["be", "was", "is", "would be"],
    answer: 0,
    note: "After insist/demand/require, formal English uses the base form: that the clause be removed.",
  },
];
