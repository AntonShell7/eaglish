import type { Register } from "./slangDialogues";

/**
 * The track: colloquial English as a path, not a library.
 *
 * The rest of this section was nine rooms holding forty-two items — under five
 * a room, which reads as an empty shop however the shelves are arranged. More
 * than that, browsing is the wrong verb here. Nobody browses the way people
 * actually text; they accumulate it, a handful of expressions at a time, and
 * meet the same ones again a few days later or lose them.
 *
 * So this is a sequence. One short lesson at a time, three or four expressions
 * in each, worked from every side — recognised, matched, typed, placed in a
 * real message — and then met again two and five lessons later without being
 * announced. A module ends with a check over everything it taught.
 *
 * The content is data. Adding a module is writing one object; nothing in the
 * player or the path knows what is in them.
 */

/** A step is one screen. Eight kinds, each doing a job the others cannot. */
export type Step =
  /**
   * The teaching screen, and the only one that does not ask for anything.
   *
   * Duolingo drills first and explains in a tooltip, which works when the
   * thing being taught is a word with a picture. "TQ" has no picture and the
   * rule is one sentence long — withholding it to make the learner guess
   * wastes the one screen where they are actually paying attention.
   */
  | {
      kind: "rule";
      id: string;
      /** Two or three characters drawn as the badge. Not an emoji. */
      glyph: string;
      title: string;
      titleRu: string;
      body: string;
      bodyRu: string;
      /** The forms themselves, listed under the explanation. */
      forms?: { short: string; long: string; note?: string; noteRu?: string }[];
    }
  /**
   * The expression where it lives: a messenger thread.
   *
   * An abbreviation explained in a definition box is a fact; the same
   * abbreviation at the end of someone's reply about homework is the thing
   * being learnt. This is the screen the section exists for.
   */
  | {
      kind: "chat";
      id: string;
      title: string;
      titleRu: string;
      /** Who the learner is talking to, shown at the top. */
      withWhom: string;
      withWhomRu: string;
      lines: { me?: boolean; text: string; at: string; glossRu?: string }[];
    }
  /** One question, three or four answers, one right. */
  | {
      kind: "choice";
      id: string;
      prompt: string;
      promptRu: string;
      /** Shown above the question in a bubble, when the question is about a line. */
      quote?: string;
      options: string[];
      answer: number;
      whyRu: string;
      teaches?: string[];
    }
  /** Tap left, tap right, they lock together. Four pairs is the comfortable size. */
  | {
      kind: "match";
      id: string;
      promptRu: string;
      pairs: [string, string][];
      teaches?: string[];
    }
  /** Build the reply out of tiles. Tests word order without asking for spelling. */
  | {
      kind: "assemble";
      id: string;
      promptRu: string;
      quote?: string;
      /** The right answer, in order. Distractor tiles are added to this. */
      answer: string[];
      extra: string[];
      teaches?: string[];
    }
  /**
   * Type it. The hardest format and the one that proves it is known.
   *
   * Several answers are accepted because several are right: "np" and "no
   * problem" are the same reply, and marking one of them wrong teaches
   * nothing except that the app is stupid.
   */
  | {
      kind: "type";
      id: string;
      promptRu: string;
      quote?: string;
      /** Shown greyed in the field. A first letter or two, when it would otherwise be a guess. */
      hint?: string;
      answers: string[];
      teaches?: string[];
    }
  /** A line from a thread with one word taken out. */
  | {
      kind: "gap";
      id: string;
      promptRu: string;
      before: string;
      after: string;
      answers: string[];
      teaches?: string[];
    }
  /**
   * Where you can say it — the question learners actually get wrong.
   *
   * The phrase is usually right and the room is wrong: "gtg" to a friend is
   * normal and "gtg" to a client is a small disaster. Every expression in this
   * app already carries a register, so this format costs nothing to write and
   * no competitor has it.
   */
  | {
      kind: "register";
      id: string;
      phrase: string;
      /** Each room, and whether the phrase belongs in it. */
      rooms: { labelRu: string; ok: boolean }[];
      whyRu: string;
      register: Register;
      teaches?: string[];
    };

export interface TrackLesson {
  id: string;
  title: string;
  titleRu: string;
  /** One line under the title on the path bubble. */
  subtitleRu: string;
  /** The character drawn in the node. */
  glyph: string;
  /** A check over the whole module: no new rules, everything mixed. */
  review?: boolean;
  steps: Step[];
}

export interface TrackModule {
  id: string;
  titleRu: string;
  subtitleRu: string;
  /** Which of the section's colours this module runs in. */
  tone: "mint" | "sky" | "gold" | "violet";
  lessons: TrackLesson[];
  /** Written but not yet filled: shown on the path, not openable. */
  soon?: boolean;
}

/* ── Module one ──────────────────────────────────────────────────────────── */

const thanks: TrackLesson = {
  id: "thanks",
  title: "Thank you in three letters",
  titleRu: "Спасибо в три буквы",
  subtitleRu: "TQ, THX, TY, TYSM",
  glyph: "TQ",
  steps: [
    {
      kind: "rule",
      id: "thanks-rule",
      glyph: "TQ",
      title: "Short thanks",
      titleRu: "Короткое спасибо",
      body: "In chat, thank you is almost never written out. It is shortened, and the shortening is not lazy — it is what the register sounds like.",
      bodyRu:
        "В переписке thank you почти никогда не пишут целиком. Его сокращают, и это не лень, а то, как звучит сам регистр. Написать полностью «Thank you very much» другу в чате — примерно как сказать «благодарю вас» приятелю.",
      forms: [
        { short: "TQ", long: "thank you", note: "The Q is the sound, not a letter of the word.", noteRu: "Q — это звук «кью», а не буква из слова." },
        { short: "THX · THNX · TNX", long: "thanks", noteRu: "Самое частое из всех." },
        { short: "TY", long: "thank you" },
        { short: "TYSM", long: "thank you so much", noteRu: "Когда правда выручили." },
      ],
    },
    {
      kind: "chat",
      id: "thanks-chat",
      title: "What was the maths homework?",
      titleRu: "Что задали по математике",
      withWhom: "Sam",
      withWhomRu: "Сэм",
      lines: [
        { text: "hey, do you know what we got for maths?", at: "19:04" },
        { me: true, text: "page 5, number 3", at: "19:06" },
        { me: true, text: "and the two tables on page 6", at: "19:06" },
        { text: "tq!! you saved me", at: "19:07", glossRu: "tq = thank you" },
        { me: true, text: "np", at: "19:07", glossRu: "np = no problem" },
      ],
    },
    {
      kind: "choice",
      id: "thanks-q1",
      prompt: "What does TQ mean?",
      promptRu: "Что значит TQ?",
      quote: "tq!! you saved me",
      options: ["thank you", "take care", "that's quick", "the question"],
      answer: 0,
      whyRu: "Q читается как «кью» и заменяет всё слово you. Буквы из thank you тут только T.",
      teaches: ["tq"],
    },
    {
      kind: "match",
      id: "thanks-match",
      promptRu: "Соедините сокращение и то, что за ним стоит",
      pairs: [
        ["TQ", "thank you"],
        ["THX", "thanks"],
        ["TYSM", "thank you so much"],
        ["NP", "no problem"],
      ],
      teaches: ["tq", "thx", "tysm", "np"],
    },
    {
      kind: "gap",
      id: "thanks-gap",
      promptRu: "Допишите сообщение",
      before: "got it, ",
      after: " for sending the photos",
      answers: ["thx", "thnx", "tnx", "ty", "tq", "thanks"],
      teaches: ["thx"],
    },
    {
      kind: "register",
      id: "thanks-register",
      phrase: "TQ",
      rooms: [
        { labelRu: "Друг в мессенджере", ok: true },
        { labelRu: "Одноклассник", ok: true },
        { labelRu: "Письмо начальнику", ok: false },
        { labelRu: "Резюме", ok: false },
      ],
      whyRu:
        "TQ — это регистр чата. В рабочей почте оно читается как небрежность, даже если отношения хорошие. Там пишут Thanks — целиком, одним словом.",
      register: "veryCasual",
      teaches: ["tq"],
    },
  ],
};

const replies: TrackLesson = {
  id: "replies",
  title: "Answering thanks",
  titleRu: "Ответ на спасибо",
  subtitleRu: "np, yw, anytime",
  glyph: "np",
  steps: [
    {
      kind: "rule",
      id: "replies-rule",
      glyph: "np",
      title: "You're welcome, shortened",
      titleRu: "Пожалуйста, короткое",
      body: "There is no single reply to thanks in English chat. There are four, and they differ in how much the favour is being played down.",
      bodyRu:
        "Единого «пожалуйста» в английском чате нет. Их четыре, и отличаются они тем, насколько сильно отмахиваешься от услуги. You're welcome — самое нейтральное и самое «взрослое»; в переписке подростков его почти не встретить.",
      forms: [
        { short: "np", long: "no problem", noteRu: "Самое частое. Дословно «не проблема»." },
        { short: "yw", long: "you're welcome", noteRu: "Нейтральное, чуть более formal." },
        { short: "no worries", long: "no worries", noteRu: "Британское и австралийское, очень тёплое." },
        { short: "anytime", long: "anytime", noteRu: "«Обращайся». Намёк, что готов помочь ещё." },
      ],
    },
    {
      kind: "chat",
      id: "replies-chat",
      title: "Thanks for the charger",
      titleRu: "Спасибо за зарядку",
      withWhom: "Mia",
      withWhomRu: "Мия",
      lines: [
        { text: "thanks for lending me your charger yesterday", at: "08:12" },
        { text: "my phone was on 2%", at: "08:12" },
        { me: true, text: "no worries, I had a spare", at: "08:20", glossRu: "no worries = не за что" },
        { text: "still, tysm", at: "08:21" },
        { me: true, text: "anytime", at: "08:21", glossRu: "anytime = обращайся" },
      ],
    },
    {
      kind: "choice",
      id: "replies-q1",
      prompt: "She writes tysm. What do you reply?",
      promptRu: "Вам написали tysm. Что ответить?",
      options: ["anytime", "thank you too", "of course not", "yes please"],
      answer: 0,
      whyRu:
        "Anytime — «обращайся». Thank you too выглядит так, будто вы не поняли, за что вас благодарят, и благодарите в ответ на всякий случай.",
      teaches: ["anytime"],
    },
    {
      kind: "assemble",
      id: "replies-assemble",
      promptRu: "Соберите ответ: «да не за что вообще»",
      answer: ["no", "worries", "at", "all"],
      extra: ["not", "any"],
      teaches: ["no worries"],
    },
    {
      kind: "type",
      id: "replies-type",
      promptRu: "Напишите «не проблема» двумя буквами",
      hint: "n",
      answers: ["np"],
      teaches: ["np"],
    },
    {
      kind: "match",
      id: "replies-match",
      promptRu: "Соедините ответ и его смысл",
      pairs: [
        ["np", "не проблема"],
        ["yw", "пожалуйста"],
        ["anytime", "обращайся"],
        ["no worries", "да брось, пустяки"],
      ],
      teaches: ["np", "yw", "anytime", "no worries"],
    },
  ],
};

const goodbyes: TrackLesson = {
  id: "goodbyes",
  title: "Leaving a chat",
  titleRu: "Как попрощаться",
  subtitleRu: "brb, gtg, ttyl, cya",
  glyph: "cya",
  steps: [
    {
      kind: "rule",
      id: "goodbyes-rule",
      glyph: "brb",
      title: "Going, and coming back",
      titleRu: "Ухожу и вернусь",
      body: "Two of these mean goodbye and one does not. Reading brb as goodbye and disappearing is the mistake everyone makes once.",
      bodyRu:
        "Два из них значат «пока», а одно — нет. Прочитать brb как прощание и уйти — ошибка, которую делают один раз. Brb значит, что человек отошёл на минуту и вернётся, и ответ на него — не «пока», а ничего или «ok».",
      forms: [
        { short: "brb", long: "be right back", noteRu: "Отошёл, вернусь. Не прощание!" },
        { short: "gtg · g2g", long: "got to go", noteRu: "Всё, убегаю. Вот это прощание." },
        { short: "ttyl", long: "talk to you later", noteRu: "Спишемся позже." },
        { short: "cya · see ya", long: "see you", noteRu: "Увидимся. Самое лёгкое из всех." },
      ],
    },
    {
      kind: "chat",
      id: "goodbyes-chat",
      title: "Someone is at the door",
      titleRu: "Кто-то в дверь",
      withWhom: "Jack",
      withWhomRu: "Джек",
      lines: [
        { text: "so are you coming on saturday or not", at: "21:30" },
        { me: true, text: "yeah I think so", at: "21:31" },
        { text: "brb someone's at the door", at: "21:31", glossRu: "brb = сейчас вернусь" },
        { text: "ok back", at: "21:36" },
        { text: "anyway I gtg, early start tomorrow. ttyl", at: "21:38", glossRu: "gtg = убегаю · ttyl = спишемся" },
        { me: true, text: "cya", at: "21:38" },
      ],
    },
    {
      kind: "choice",
      id: "goodbyes-q1",
      prompt: "Your friend writes brb. What happened?",
      promptRu: "Друг написал brb. Что произошло?",
      quote: "brb someone's at the door",
      options: [
        "Отошёл на минуту и вернётся",
        "Попрощался и ушёл",
        "Просит перезвонить",
        "Не понял вопроса",
      ],
      answer: 0,
      whyRu:
        "Be right back — «сейчас вернусь». Отвечать на него «bye» не нужно: человек никуда не делся, он через минуту напишет «back».",
      teaches: ["brb"],
    },
    {
      kind: "match",
      id: "goodbyes-match",
      promptRu: "Соедините сокращение и расшифровку",
      pairs: [
        ["brb", "be right back"],
        ["gtg", "got to go"],
        ["ttyl", "talk to you later"],
        ["cya", "see you"],
      ],
      teaches: ["brb", "gtg", "ttyl", "cya"],
    },
    {
      kind: "gap",
      id: "goodbyes-gap",
      promptRu: "Вам пора. Допишите сообщение",
      before: "ok I ",
      after: ", my bus is here",
      answers: ["gtg", "g2g", "got to go", "gotta go"],
      teaches: ["gtg"],
    },
    {
      kind: "register",
      id: "goodbyes-register",
      phrase: "gtg",
      rooms: [
        { labelRu: "Друг в мессенджере", ok: true },
        { labelRu: "Чат игры", ok: true },
        { labelRu: "Клиент по работе", ok: false },
        { labelRu: "Рабочий созвон в чате", ok: false },
      ],
      whyRu:
        "С клиентом то же самое пишется целиком и с причиной: «Sorry, I have to run — I'll come back to you this afternoon.» Gtg там читается как «мне некогда с вами разговаривать».",
      register: "veryCasual",
      teaches: ["gtg"],
    },
  ],
};

const check: TrackLesson = {
  id: "chat-check",
  title: "Module check",
  titleRu: "Срез по модулю",
  subtitleRu: "Всё, что было в модуле",
  glyph: "✦",
  review: true,
  steps: [
    {
      kind: "match",
      id: "check-match",
      promptRu: "Соедините сокращение и расшифровку",
      pairs: [
        ["TYSM", "thank you so much"],
        ["np", "no problem"],
        ["ttyl", "talk to you later"],
        ["brb", "be right back"],
      ],
      teaches: ["tysm", "np", "ttyl", "brb"],
    },
    {
      kind: "choice",
      id: "check-q1",
      prompt: "Which of these is not goodbye?",
      promptRu: "Что из этого не прощание?",
      options: ["brb", "gtg", "ttyl", "cya"],
      answer: 0,
      whyRu: "Brb — «сейчас вернусь». Остальные три — прощания разной степени окончательности.",
      teaches: ["brb"],
    },
    {
      kind: "gap",
      id: "check-gap",
      promptRu: "Вас поблагодарили. Ответьте одним словом",
      before: "— tysm for the help!\n— ",
      after: "",
      answers: ["np", "yw", "anytime", "no worries", "no problem"],
      teaches: ["np", "yw", "anytime"],
    },
    {
      kind: "type",
      id: "check-type",
      promptRu: "Напишите сокращение от «talk to you later»",
      hint: "t",
      answers: ["ttyl"],
      teaches: ["ttyl"],
    },
    {
      kind: "assemble",
      id: "check-assemble",
      promptRu: "Соберите: «убегаю, спишемся позже»",
      answer: ["gtg,", "ttyl"],
      extra: ["brb,", "cya"],
      teaches: ["gtg", "ttyl"],
    },
    {
      kind: "register",
      id: "check-register",
      phrase: "TYSM",
      rooms: [
        { labelRu: "Подруга", ok: true },
        { labelRu: "Чат курса", ok: true },
        { labelRu: "Письмо в банк", ok: false },
        { labelRu: "Сопроводительное письмо", ok: false },
      ],
      whyRu:
        "Чем официальнее комната, тем длиннее спасибо. В письме — «Thank you very much for your help», и это не вежливее, это просто другой язык.",
      register: "veryCasual",
      teaches: ["tysm"],
    },
  ],
};

export const trackModules: TrackModule[] = [
  {
    id: "chat",
    titleRu: "Переписка",
    subtitleRu: "Сокращения, без которых чат не читается",
    tone: "mint",
    lessons: [thanks, replies, goodbyes, check],
  },
  {
    id: "idioms",
    titleRu: "Идиомы",
    subtitleRu: "Длинные обороты: по три за урок",
    tone: "gold",
    soon: true,
    lessons: [],
  },
  {
    id: "street",
    titleRu: "Живая речь",
    subtitleRu: "Как говорят, когда не стараются",
    tone: "violet",
    soon: true,
    lessons: [],
  },
];

/** Every lesson in order, which is what the path and the scheduler walk. */
export function trackLessons(): { module: TrackModule; lesson: TrackLesson }[] {
  return trackModules.flatMap((module) =>
    module.lessons.map((lesson) => ({ module, lesson })),
  );
}

export function findLesson(id: string) {
  return trackLessons().find((entry) => entry.lesson.id === id) ?? null;
}
