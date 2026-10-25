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
 * ── On the writing ──────────────────────────────────────────────────────────
 *
 * Every line of Russian in this file is read by somebody who is mid-lesson and
 * wants to get on with it, so it is written to be understood at the speed it
 * is glanced at. Three rules came out of getting it wrong the first time:
 *
 * A title says what you will be able to do, not what the thing is called.
 * "Короткое спасибо" is a label on a drawer — it makes the reader stop and
 * work out what the drawer holds. "Как носители пишут спасибо" is the lesson.
 *
 * No vocabulary the lesson has not taught. The first draft explained chat
 * abbreviations with the phrase "так звучит сам регистр", which asks a learner
 * to already know a linguistics term in order to be told about "thx".
 *
 * No analogies that need unpacking. An explanation that arrives as a riddle —
 * "примерно как сказать «благодарю вас» приятелю" — costs more attention than
 * the point it was carrying.
 */

/** A step is one screen. Eight kinds, each doing a job the others cannot. */
export type Step =
  /**
   * The teaching screen, and the only one that does not ask for anything.
   *
   * Duolingo drills first and explains in a tooltip, which works when the
   * thing being taught is a word with a picture. "thx" has no picture and the
   * rule is two sentences long — withholding it to make the learner guess
   * wastes the one screen where they are actually paying attention.
   */
  | {
      kind: "rule";
      id: string;
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
   * abbreviation at the end of someone's reply is the thing being learnt. This
   * is the screen the section exists for.
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
   * Where you can say it — the question learners of this register get wrong.
   *
   * The phrase is usually right and the room is wrong: "gtg" to a friend is
   * normal and "gtg" to a client is a small disaster. Every expression in this
   * app already carries a register, so this format costs nothing to write and
   * no competitor has it.
   *
   * Only the rooms where it fits are ticked. There were crosses as well at
   * first — eight taps to answer a four-line question, and the learner had to
   * state the obvious half as explicitly as the interesting half. Ticking what
   * fits and leaving the rest alone is both quicker and closer to how the
   * question is actually thought about.
   */
  | {
      kind: "register";
      id: string;
      phrase: string;
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

/* ── Module one: the abbreviations other people's messages are made of ───── */

const thanks: TrackLesson = {
  id: "thanks",
  title: "How people write thanks",
  titleRu: "Как носители пишут спасибо",
  subtitleRu: "tq · thx · tysm · np",
  steps: [
    {
      kind: "rule",
      id: "thanks-rule",
      title: "Thanks is almost always shortened",
      titleRu: "Спасибо в чате почти всегда сокращают",
      body: "Thank you is rarely written out in a message. Two or three letters take its place, and everybody writes that way.",
      bodyRu:
        "Thank you целиком в сообщениях пишут редко — вместо него две-три буквы, и так пишут все: школьники, студенты, коллеги по работе.\n\nЗнать их стоит по двум причинам. Без них чужие сообщения наполовину превращаются в набор букв. А когда начинаешь писать так сам, разница слышна сразу: с человеком говорят на его языке, а не переводят ему каждую фразу.",
      forms: [
        { short: "tq", long: "thank you", noteRu: "Q читается как «кью» и стоит вместо целого слова you." },
        { short: "thx · thnx · tnx", long: "thanks", noteRu: "Встречается чаще остальных." },
        { short: "tysm", long: "thank you so much", noteRu: "Когда действительно сильно выручили." },
        { short: "np", long: "no problem", noteRu: "Это уже ответ на спасибо — то же, что «не вопрос»." },
      ],
    },
    {
      kind: "chat",
      id: "thanks-chat",
      title: "How it looks in a real thread",
      titleRu: "Так это выглядит в переписке",
      withWhom: "Sam",
      withWhomRu: "Сэм",
      lines: [
        { text: "hey do you have the link for tomorrow?", at: "19:04" },
        { me: true, text: "yeah, one sec", at: "19:06" },
        { me: true, text: "just sent it to you", at: "19:06" },
        { text: "tq!! you saved me", at: "19:07", glossRu: "tq — thank you" },
        { me: true, text: "np", at: "19:07", glossRu: "np — no problem, то же, что «да не за что»" },
      ],
    },
    {
      kind: "choice",
      id: "thanks-q1",
      prompt: "What does tq mean?",
      promptRu: "Что значит tq?",
      quote: "tq!! you saved me",
      options: ["thank you", "take care", "that's quick", "the question"],
      answer: 0,
      whyRu: "Q читается как «кью» и стоит вместо целого слова you. От thank you осталась одна буква.",
      teaches: ["tq"],
    },
    {
      kind: "match",
      id: "thanks-match",
      promptRu: "Соедините сокращение и его расшифровку",
      pairs: [
        ["tq", "thank you"],
        ["thx", "thanks"],
        ["tysm", "thank you so much"],
        ["np", "no problem"],
      ],
      teaches: ["tq", "thx", "tysm", "np"],
    },
    {
      kind: "gap",
      id: "thanks-gap",
      promptRu: "Вставьте пропущенное слово",
      before: "got it, ",
      after: " for sending the photos",
      answers: ["thx", "thnx", "tnx", "tq", "thanks"],
      teaches: ["thx"],
    },
    {
      kind: "register",
      id: "thanks-register",
      phrase: "tq",
      rooms: [
        { labelRu: "Друг в мессенджере", ok: true },
        { labelRu: "Чат одногруппников", ok: true },
        { labelRu: "Письмо начальнику", ok: false },
        { labelRu: "Резюме", ok: false },
      ],
      whyRu:
        "tq живёт в чатах. В рабочем письме оно выглядит небрежно, даже если отношения с человеком хорошие: там пишут Thanks, целиком.",
      register: "veryCasual",
      teaches: ["tq"],
    },
  ],
};

const replies: TrackLesson = {
  id: "replies",
  title: "Answering thanks",
  titleRu: "Что отвечают на спасибо",
  subtitleRu: "np · yw · no worries · anytime",
  steps: [
    {
      kind: "rule",
      id: "replies-rule",
      title: "Four answers, and the difference is audible",
      titleRu: "Ответов четыре, и они не взаимозаменяемы",
      body: "There is no single you're welcome in English chat. The four replies differ in how much the favour is being played down.",
      bodyRu:
        "Одного «пожалуйста» в английской переписке нет. Есть четыре ответа, и отличаются они тем, насколько сильно ты отмахиваешься от услуги: от «не вопрос» до «обращайся ещё».\n\nYou're welcome тоже никуда не делось, но звучит заметно строже и взрослее. В переписке друзей его почти не увидишь.",
      forms: [
        { short: "np", long: "no problem", noteRu: "Самый частый. Дословно — «не проблема»." },
        { short: "yw", long: "you're welcome", noteRu: "Нейтральный, чуть строже остальных." },
        { short: "no worries", long: "no worries", noteRu: "Британское и австралийское, очень тёплое." },
        { short: "anytime", long: "anytime", noteRu: "«Обращайся». Намёк, что поможешь и в следующий раз." },
      ],
    },
    {
      kind: "chat",
      id: "replies-chat",
      title: "And this is how people answer",
      titleRu: "А так на него отвечают",
      withWhom: "Mia",
      withWhomRu: "Мия",
      lines: [
        { text: "thanks for lending me your charger yesterday", at: "08:12" },
        { text: "my phone was on 2%", at: "08:12" },
        { me: true, text: "no worries, I had a spare", at: "08:20", glossRu: "no worries — не за что, пустяки" },
        { text: "still, tysm", at: "08:21" },
        { me: true, text: "anytime", at: "08:21", glossRu: "anytime — обращайся" },
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
        "anytime — «обращайся». А thank you too выглядит так, будто вы не поняли, за что вас благодарят, и на всякий случай поблагодарили в ответ.",
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
      promptRu: "Соедините ответ и то, что он на самом деле значит",
      pairs: [
        ["np", "не проблема"],
        ["yw", "пожалуйста"],
        ["anytime", "обращайся ещё"],
        ["no worries", "да брось, пустяки"],
      ],
      teaches: ["np", "yw", "anytime", "no worries"],
    },
  ],
};

const goodbyes: TrackLesson = {
  id: "goodbyes",
  title: "Leaving a conversation",
  titleRu: "Как выходят из разговора",
  subtitleRu: "brb · gtg · ttyl · cya",
  steps: [
    {
      kind: "rule",
      id: "goodbyes-rule",
      title: "Two of these are goodbye and one is not",
      titleRu: "Два из них — прощание, а одно нет",
      body: "brb means somebody stepped away and is coming back. Reading it as goodbye and leaving is the mistake everybody makes once.",
      bodyRu:
        "brb значит, что человек отошёл на минуту и вернётся. Прочитать его как «пока» и уйти — ошибка, которую делают ровно один раз: собеседник возвращается через две минуты, пишет «back», а тебя уже нет.\n\nОстальные три — настоящие прощания, от короткого «увидимся» до «спишемся позже».",
      forms: [
        { short: "brb", long: "be right back", noteRu: "Отошёл, скоро вернусь. Отвечать «пока» не нужно." },
        { short: "gtg · g2g", long: "got to go", noteRu: "Всё, убегаю. Вот это уже прощание." },
        { short: "ttyl", long: "talk to you later", noteRu: "Спишемся позже." },
        { short: "cya · see ya", long: "see you", noteRu: "Увидимся. Самое лёгкое из всех." },
      ],
    },
    {
      kind: "chat",
      id: "goodbyes-chat",
      title: "How a thread ends",
      titleRu: "Так разговор заканчивается",
      withWhom: "Jack",
      withWhomRu: "Джек",
      lines: [
        { text: "so are you coming on saturday or not", at: "21:30" },
        { me: true, text: "yeah I think so", at: "21:31" },
        { text: "brb someone's at the door", at: "21:31", glossRu: "brb — сейчас вернусь" },
        { text: "ok back", at: "21:36" },
        { text: "anyway I gtg, early start tomorrow. ttyl", at: "21:38", glossRu: "gtg — убегаю · ttyl — спишемся позже" },
        { me: true, text: "cya", at: "21:38" },
      ],
    },
    {
      kind: "choice",
      id: "goodbyes-q1",
      prompt: "Your friend writes brb. What happened?",
      promptRu: "Друг написал brb. Что это значит?",
      quote: "brb someone's at the door",
      options: [
        "Отошёл на минуту и вернётся",
        "Попрощался и ушёл",
        "Просит перезвонить",
        "Не понял вопроса",
      ],
      answer: 0,
      whyRu:
        "be right back — «сейчас вернусь». Прощаться в ответ не нужно: человек никуда не делся и через минуту напишет «back».",
      teaches: ["brb"],
    },
    {
      kind: "match",
      id: "goodbyes-match",
      promptRu: "Соедините сокращение и его расшифровку",
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
      promptRu: "Вам пора. Вставьте пропущенное слово",
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
        { labelRu: "Чат в игре", ok: true },
        { labelRu: "Переписка с клиентом", ok: false },
        { labelRu: "Рабочий чат с руководством", ok: false },
      ],
      whyRu:
        "Клиенту то же самое пишут целиком и с причиной: «Sorry, I have to run — I'll come back to you this afternoon». gtg там читается как «мне некогда с вами разговаривать».",
      register: "veryCasual",
      teaches: ["gtg"],
    },
  ],
};

const check: TrackLesson = {
  id: "chat-check",
  title: "What stayed",
  titleRu: "Проверим, что осталось",
  subtitleRu: "Весь модуль вперемешку",
  review: true,
  steps: [
    {
      kind: "match",
      id: "check-match",
      promptRu: "Соедините сокращение и его расшифровку",
      pairs: [
        ["tysm", "thank you so much"],
        ["np", "no problem"],
        ["ttyl", "talk to you later"],
        ["brb", "be right back"],
      ],
      teaches: ["tysm", "np", "ttyl", "brb"],
    },
    {
      kind: "choice",
      id: "check-q1",
      prompt: "Which one is not goodbye?",
      promptRu: "Что из этого не прощание?",
      options: ["brb", "gtg", "ttyl", "cya"],
      answer: 0,
      whyRu: "brb — «сейчас вернусь». Остальные три прощания, просто разной степени окончательности.",
      teaches: ["brb"],
    },
    {
      kind: "gap",
      id: "check-gap",
      promptRu: "Вас поблагодарили. Вставьте пропущенное слово",
      before: "tysm for the help! — ",
      after: ", glad it worked",
      answers: ["np", "yw", "anytime", "no worries", "no problem"],
      teaches: ["np", "yw", "anytime"],
    },
    {
      kind: "type",
      id: "check-type",
      promptRu: "Напишите сокращение от talk to you later",
      hint: "t",
      answers: ["ttyl"],
      teaches: ["ttyl"],
    },
    {
      kind: "assemble",
      id: "check-assemble",
      promptRu: "Соберите фразу: «убегаю, спишемся позже»",
      answer: ["gtg,", "ttyl"],
      extra: ["brb,", "cya"],
      teaches: ["gtg", "ttyl"],
    },
    {
      kind: "register",
      id: "check-register",
      phrase: "tysm",
      rooms: [
        { labelRu: "Подруга", ok: true },
        { labelRu: "Чат курса", ok: true },
        { labelRu: "Письмо в банк", ok: false },
        { labelRu: "Сопроводительное письмо", ok: false },
      ],
      whyRu:
        "Чем официальнее переписка, тем длиннее спасибо. В письме это Thank you very much for your help — и дело не в вежливости, это просто другой язык.",
      register: "veryCasual",
      teaches: ["tysm"],
    },
  ],
};

export const trackModules: TrackModule[] = [
  {
    id: "chat",
    titleRu: "Переписка",
    subtitleRu: "Сокращения, без которых чужие сообщения не читаются",
    tone: "mint",
    lessons: [thanks, replies, goodbyes, check],
  },
  {
    id: "idioms",
    titleRu: "Идиомы",
    subtitleRu: "Длинные обороты — по три за урок",
    tone: "gold",
    soon: true,
    lessons: [],
  },
  {
    id: "street",
    titleRu: "Живая речь",
    subtitleRu: "Как говорят, когда не стараются говорить правильно",
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
