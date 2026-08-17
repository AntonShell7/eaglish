/**
 * Placement test items, tagged by CEFR band.
 *
 * No AI here on purpose: a level check has to be instant, identical for
 * everyone and incapable of inventing a question. Each item has exactly one
 * defensible answer, and the distractors are mistakes learners at that band
 * actually make — that is what makes a wrong answer informative.
 *
 * Difficulty labels are authored, not empirically calibrated on real test-taker
 * data, so a band here means "typical of that level in a coursebook", not a
 * measured value. The items are deliberately plain: the point is to find a
 * level, not to catch anyone out with rarities. Eight per band gives the
 * adaptive ladder room to sit at one difficulty for several questions without
 * repeating itself.
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
    note: "\"An\" goes before a vowel sound: an apple, an hour — but a university.",
  },
  {
    id: "a1-do",
    band: "A1",
    text: "___ you like pizza?",
    options: ["Do", "Are", "Does", "Is"],
    answer: 0,
    note: "Questions in present simple use do/does. \"Are\" would need an adjective or an -ing form.",
  },
  {
    id: "a1-have",
    band: "A1",
    text: "My sister ___ a dog and two cats.",
    options: ["has", "have", "is have", "haves"],
    answer: 0,
    note: "He, she and it take \"has\": she has a dog, they have a dog.",
  },
  {
    id: "a1-prep",
    band: "A1",
    text: "Your keys are ___ the table.",
    options: ["on", "in", "at", "to"],
    answer: 0,
    note: "\"On\" is for surfaces, \"in\" for closed spaces: on the table, in the drawer.",
  },
  {
    id: "a1-can",
    band: "A1",
    text: "Sorry, I ___ swim.",
    options: ["can't", "don't can", "not can", "am not can"],
    answer: 0,
    note: "Can is a modal verb: it makes its own negative (can't) with no \"do\".",
  },

  /* ── A2 ──────────────────────────────────────────────────────────────── */
  {
    id: "a2-past",
    band: "A2",
    text: "We ___ to the cinema yesterday.",
    options: ["went", "gone", "go", "was going"],
    answer: 0,
    note: "\"Yesterday\" puts the action in the finished past, so past simple: went.",
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
    note: "Good → better → best. A superlative compares against everything, not just one thing.",
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
    options: ["usually", "use to", "usual", "used"],
    answer: 0,
    note: "Adverbs of frequency sit before the main verb: he usually works, she never eats meat.",
  },
  {
    id: "a2-must",
    band: "A2",
    text: "You ___ wear a helmet here — it's the rule.",
    options: ["must", "can", "would", "may not"],
    answer: 0,
    note: "\"Must\" states an obligation. \"Can\" would only offer permission.",
  },
  {
    id: "a2-continuous",
    band: "A2",
    text: "Look! It ___ outside.",
    options: ["is raining", "rains", "rain", "raining"],
    answer: 0,
    note: "Something happening right now takes present continuous: it is raining.",
  },
  {
    id: "a2-quantifier",
    band: "A2",
    text: "There isn't ___ milk left.",
    options: ["much", "many", "a lot", "few"],
    answer: 0,
    note: "Milk is uncountable, so it takes \"much\"; \"many\" belongs with countable nouns.",
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
    id: "b1-since",
    band: "B1",
    text: "They ___ in this city since 2019.",
    options: ["have lived", "live", "lived", "are living"],
    answer: 0,
    note: "\"Since\" plus a situation that is still true calls for present perfect.",
  },
  {
    id: "b1-reported",
    band: "B1",
    text: "He asked me where I ___ from.",
    options: ["came", "come", "am coming", "will come"],
    answer: 0,
    note: "Reported speech shifts the tense back a step: \"Where do you come from?\" → where I came from.",
  },
  {
    id: "b1-usedto",
    band: "B1",
    text: "I ___ play tennis every weekend, but I stopped last year.",
    options: ["used to", "use to", "am used to", "was used"],
    answer: 0,
    note: "\"Used to + verb\" is a past habit that has ended. \"Be used to\" means something feels normal.",
  },
  {
    id: "b1-passive",
    band: "B1",
    text: "The newsletter ___ every Monday.",
    options: ["is sent", "sends", "is sending", "has sent"],
    answer: 0,
    note: "The newsletter doesn't act, it receives the action — so present simple passive: is sent.",
  },
  {
    id: "b1-relative",
    band: "B1",
    text: "That's the woman ___ helped me at the station.",
    options: ["who", "which", "what", "whose"],
    answer: 0,
    note: "\"Who\" is for people, \"which\" for things. \"What\" never introduces a relative clause here.",
  },
  {
    id: "b1-gerund",
    band: "B1",
    text: "I'm looking forward ___ from you.",
    options: ["to hearing", "to hear", "hearing", "for hearing"],
    answer: 0,
    note: "\"Look forward to\" ends in a preposition, so the verb after it takes -ing: to hearing.",
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
    id: "b2-third",
    band: "B2",
    text: "If she had studied, she ___ the exam.",
    options: ["would have passed", "would pass", "had passed", "will have passed"],
    answer: 0,
    note: "Third conditional: if + past perfect, then would have + participle. It's about a changed past.",
  },
  {
    id: "b2-wish",
    band: "B2",
    text: "I wish I ___ more languages.",
    options: ["spoke", "speak", "will speak", "would speaking"],
    answer: 0,
    note: "\"Wish\" about the present takes a past form: I wish I spoke, I wish I had more time.",
  },
  {
    id: "b2-despite",
    band: "B2",
    text: "___ having little experience, she got the job.",
    options: ["Despite", "Although", "However", "Even"],
    answer: 0,
    note: "Despite is followed by a noun or -ing; \"although\" would need a full clause after it.",
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
    id: "b2-deny",
    band: "B2",
    text: "He denied ___ the money.",
    options: ["taking", "to take", "take", "that taking"],
    answer: 0,
    note: "Some verbs take -ing rather than an infinitive: deny, admit, avoid, suggest.",
  },
  {
    id: "b2-causative",
    band: "B2",
    text: "I'm having my laptop ___ tomorrow.",
    options: ["repaired", "repair", "to repair", "repairing"],
    answer: 0,
    note: "Causative \"have something done\": someone else does the work for you.",
  },
  {
    id: "b2-futurepassive",
    band: "B2",
    text: "The bridge ___ next year, according to the council.",
    options: ["will be rebuilt", "will rebuild", "is rebuilding", "rebuilds"],
    answer: 0,
    note: "The bridge receives the action, so the future needs a passive: will be rebuilt.",
  },

  /* ── C1 ──────────────────────────────────────────────────────────────── */
  {
    id: "c1-inversion",
    band: "C1",
    text: "Little ___ that the deal would collapse a week later.",
    options: ["did he suspect", "he suspected", "he did suspect", "suspected he"],
    answer: 0,
    note: "A negative adverbial at the front inverts subject and auxiliary: little did he suspect.",
  },
  {
    id: "c1-butfor",
    band: "C1",
    text: "___ for the strike, the project would have finished on time.",
    options: ["But", "If not", "Unless", "Except"],
    answer: 0,
    note: "\"But for X\" means \"if X hadn't happened\" — a fixed, formal structure.",
  },
  {
    id: "c1-collocation",
    band: "C1",
    text: "The report makes ___ reference to the missing funds.",
    options: ["scant", "scarce", "rare", "thin"],
    answer: 0,
    note: "\"Scant reference\" is the established collocation; scarce and rare describe availability instead.",
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
    note: "After insist, demand and require, formal English uses the base form: that the clause be removed.",
  },
  {
    id: "c1-magnitude",
    band: "C1",
    text: "Only later did we grasp the ___ of the decision.",
    options: ["magnitude", "bigness", "largeness", "greatness"],
    answer: 0,
    note: "\"Magnitude\" is the register-appropriate noun for scale or seriousness in formal writing.",
  },
  {
    id: "c1-dubious",
    band: "C1",
    text: "Her conclusions rest on a ___ assumption about the sample.",
    options: ["dubious", "doubting", "doubtful of", "doubted"],
    answer: 0,
    note: "\"Dubious\" describes the thing you distrust; \"doubtful\" usually describes the person who doubts.",
  },
  {
    id: "c1-concessive",
    band: "C1",
    text: "___ as it may seem, the theory still holds.",
    options: ["Strange", "Strangely", "It is strange", "As strange"],
    answer: 0,
    note: "Concessive inversion uses a bare adjective: strange as it may seem, hard as she tried.",
  },
];
