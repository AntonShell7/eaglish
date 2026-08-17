/**
 * Everyday English lessons.
 *
 * A phrasebook tells you what a phrase means; it never tells you whether you
 * can say it to a professor. So every phrase here carries a *register* — the
 * thing textbooks skip and learners get wrong — and every lesson ends in
 * exercises where the phrase has to be chosen in a situation, not recognised
 * in a list.
 *
 * The material stays in English. Russian appears only as the bridge (`ru`),
 * the same role the word-lookup popup plays while reading.
 */

/** How formal a phrase is — what decides if it fits the room. */
export type Register = "neutral" | "casual" | "veryCasual";

export interface Phrase {
  phrase: string;
  /** English definition — the learner should meet the idea in English first. */
  meaning: string;
  /** Russian bridge, for when the definition alone doesn't land. */
  ru: string;
  example: string;
  register: Register;
}

/** A gap in a short exchange: the most honest test of "would you say this here?". */
export interface GapExercise {
  kind: "gap";
  setup: string;
  /** The line with a `___` where the phrase belongs. */
  text: string;
  options: string[];
  answer: number;
  why: string;
}

/** A situation, four possible replies, one that a native would actually pick. */
export interface ReplyExercise {
  kind: "reply";
  situation: string;
  options: string[];
  answer: number;
  why: string;
}

/** Same phrase, wrong room — the mistake that makes learners sound off. */
export interface RegisterExercise {
  kind: "register";
  phrase: string;
  answer: Register;
  why: string;
}

export type Exercise = GapExercise | ReplyExercise | RegisterExercise;

export interface Lesson {
  id: string;
  title: string;
  /** What the learner can do afterwards, stated as a promise. */
  goal: string;
  goalRu: string;
  level: "A2" | "A2–B1" | "B1" | "B1–B2";
  phrases: Phrase[];
  exercises: Exercise[];
}

export const everydayLessons: Lesson[] = [
  {
    id: "small-talk",
    title: "Small talk without the awkward pause",
    goal: "Open, hold and end a short conversation with someone you barely know.",
    goalRu: "Начать, поддержать и закончить короткий разговор с человеком, которого почти не знаешь.",
    level: "A2",
    phrases: [
      {
        phrase: "How's it going?",
        meaning: "A relaxed way to ask how someone is. The answer is short — nobody wants details.",
        ru: "Как дела? (неформально, ответ ожидается коротким)",
        example: "— Hey, how's it going? — Good, thanks. You?",
        register: "casual",
      },
      {
        phrase: "What have you been up to?",
        meaning: "Asks what someone has been doing lately, usually since you last met.",
        ru: "Чем занимался(ась) в последнее время?",
        example: "So what have you been up to since graduation?",
        register: "casual",
      },
      {
        phrase: "Long time no see",
        meaning: "Said when you meet someone you haven't seen for a while. Deliberately broken grammar — it's a fixed phrase.",
        ru: "Сколько лет, сколько зим!",
        example: "Anna! Long time no see. You look great.",
        register: "casual",
      },
      {
        phrase: "Same here",
        meaning: "Agrees that the thing is true for you too. Shorter and warmer than repeating the sentence.",
        ru: "И я тоже. / У меня так же.",
        example: "— I'm exhausted this week. — Same here.",
        register: "casual",
      },
      {
        phrase: "Anyway, ...",
        meaning: "Signals you're steering the conversation somewhere else, or starting to wrap it up.",
        ru: "В общем... / Ладно... (сигнал смены темы или конца разговора)",
        example: "Anyway, I should probably get back to work.",
        register: "neutral",
      },
      {
        phrase: "I'll let you go",
        meaning: "A polite way to end a conversation: you frame it as freeing *them*, not escaping yourself.",
        ru: "Не буду тебя задерживать. (вежливый способ закончить разговор)",
        example: "It was great catching up — I'll let you go.",
        register: "neutral",
      },
    ],
    exercises: [
      {
        kind: "gap",
        setup: "You bump into a former classmate at the station.",
        text: "— Mark? ___ How have you been?",
        options: ["Long time no see!", "Nice to meet you!", "How do you do?", "Who are you?"],
        answer: 0,
        why: "You already know Mark, so \"nice to meet you\" is wrong — that's for a first meeting. \"Long time no see\" is exactly the greeting for someone you haven't seen in ages.",
      },
      {
        kind: "reply",
        situation: "A colleague says: \"I've been so busy this month, I barely sleep.\"",
        options: ["Same here.", "Congratulations!", "I'll let you go.", "Long time no see."],
        answer: 0,
        why: "\"Same here\" quietly says \"me too\" and keeps the conversation going. It's the most natural two-word answer in English small talk.",
      },
      {
        kind: "gap",
        setup: "You've been chatting for ten minutes and your bus is coming.",
        text: "___ I should run — my bus is here.",
        options: ["Anyway,", "Because,", "Suddenly,", "Instead,"],
        answer: 0,
        why: "\"Anyway\" is the standard signal that you're closing the conversation. Native speakers hear it and expect a goodbye next.",
      },
      {
        kind: "register",
        phrase: "How's it going?",
        answer: "casual",
        why: "Fine with classmates, colleagues and shop staff, but in a formal interview you'd choose \"How are you?\" instead.",
      },
    ],
  },

  {
    id: "making-plans",
    title: "Making plans — and moving them",
    goal: "Suggest a time, agree to it, and postpone politely when life happens.",
    goalRu: "Предложить время, согласиться и вежливо перенести встречу, когда планы срываются.",
    level: "A2–B1",
    phrases: [
      {
        phrase: "Are you free on Friday?",
        meaning: "The standard way to ask if someone is available. \"Free\" beats \"do you have time\" — it sounds lighter.",
        ru: "Ты свободен(на) в пятницу?",
        example: "Are you free on Friday evening? There's a film I want to see.",
        register: "neutral",
      },
      {
        phrase: "I'm down",
        meaning: "\"I'm up for it, count me in.\" Agreeing enthusiastically to a plan.",
        ru: "Я за. / Я в деле.",
        example: "— Pizza after class? — I'm down.",
        register: "veryCasual",
      },
      {
        phrase: "Let's say seven",
        meaning: "Proposes a specific time as a gentle suggestion rather than a demand.",
        ru: "Давай в семь. (мягкое предложение точного времени)",
        example: "The place opens at six — let's say seven, to be safe.",
        register: "casual",
      },
      {
        phrase: "Something came up",
        meaning: "A polite, deliberately vague reason for cancelling. Nobody expects you to explain further.",
        ru: "Кое-что произошло / появились дела. (вежливая причина отмены без подробностей)",
        example: "I'm sorry, I can't make it tonight — something came up.",
        register: "neutral",
      },
      {
        phrase: "Can we push it to Saturday?",
        meaning: "Asks to move a plan to a later time. \"Push it\" is the everyday verb for rescheduling.",
        ru: "Можем перенести на субботу?",
        example: "I'm still at work — can we push it to eight?",
        register: "casual",
      },
      {
        phrase: "Rain check",
        meaning: "\"Not now, but I do want to — another time.\" Usually \"can I take a rain check?\"",
        ru: "Давай в другой раз (но я правда хочу).",
        example: "I'd love to, but I'm wiped out. Can I take a rain check?",
        register: "casual",
      },
    ],
    exercises: [
      {
        kind: "gap",
        setup: "A friend invites you to a concert on a night you're already busy.",
        text: "That sounds amazing, but I've got plans. Can I ___?",
        options: ["take a rain check", "push the rain", "check the rain", "make a rain plan"],
        answer: 0,
        why: "The fixed phrase is \"take a rain check\". It softens a no by promising a yes later — the other three don't exist in English.",
      },
      {
        kind: "reply",
        situation: "Your friend texts: \"Free tonight? Thinking food + a film.\"",
        options: ["I'm down. What time?", "I am free of charge.", "Something came up.", "Let's say never."],
        answer: 0,
        why: "\"I'm down\" is a short, warm yes to a casual plan — and asking the time immediately shows you actually mean it.",
      },
      {
        kind: "gap",
        setup: "You're stuck in a meeting that's running long and you'll be late.",
        text: "Sorry — the meeting is overrunning. ___ half past eight?",
        options: ["Can we push it to", "Can we cancel to", "Can we free it to", "Can we down it to"],
        answer: 0,
        why: "\"Push it to + time\" is the everyday phrase for moving a plan later. \"Cancel\" would kill the plan instead of moving it.",
      },
      {
        kind: "register",
        phrase: "I'm down",
        answer: "veryCasual",
        why: "Great with friends, wrong with a professor or a client — there you'd say \"That works for me\" or \"I'd be glad to\".",
      },
    ],
  },

  {
    id: "cafes-and-shops",
    title: "Cafés, shops and checkouts",
    goal: "Order, pay and browse without rehearsing the sentence in your head first.",
    goalRu: "Заказать, заплатить и просто посмотреть товар, не репетируя фразу заранее.",
    level: "A2",
    phrases: [
      {
        phrase: "Can I get a flat white, please?",
        meaning: "The normal way to order in English-speaking cafés. \"I want\" sounds blunt; \"can I get\" is what people actually say.",
        ru: "Можно мне флэт-уайт, пожалуйста?",
        example: "Hi — can I get a large flat white, please?",
        register: "casual",
      },
      {
        phrase: "For here or to go?",
        meaning: "The staff asking whether you'll eat in or take it away. In the UK you'll also hear \"eat in or takeaway?\".",
        ru: "Здесь или с собой?",
        example: "— For here or to go? — To go, please.",
        register: "neutral",
      },
      {
        phrase: "Do you take card?",
        meaning: "Asks whether card payment is accepted. Note: no article — \"take card\", not \"take a card\".",
        ru: "Вы принимаете карту?",
        example: "I don't have cash on me — do you take card?",
        register: "neutral",
      },
      {
        phrase: "I'm just browsing, thanks",
        meaning: "Tells a shop assistant you don't need help — you're only looking. Friendly, not a brush-off.",
        ru: "Спасибо, я просто смотрю.",
        example: "— Are you looking for anything in particular? — I'm just browsing, thanks.",
        register: "neutral",
      },
      {
        phrase: "Keep the change",
        meaning: "Tells the server to keep the difference as a tip.",
        ru: "Сдачи не надо.",
        example: "Here's twenty — keep the change.",
        register: "casual",
      },
      {
        phrase: "That's all, thanks",
        meaning: "Signals your order is finished, so the person can total it up.",
        ru: "Это всё, спасибо.",
        example: "A croissant and an orange juice. That's all, thanks.",
        register: "neutral",
      },
    ],
    exercises: [
      {
        kind: "gap",
        setup: "You're at the counter of a busy coffee shop.",
        text: "Hi — ___ a cappuccino and a croissant, please?",
        options: ["can I get", "I want", "give me", "I will take"],
        answer: 0,
        why: "\"Can I get\" is the default ordering formula. \"I want\" and \"give me\" are grammatically fine but land as rude to an English ear.",
      },
      {
        kind: "reply",
        situation: "A shop assistant asks: \"Can I help you find anything?\" — you'd rather look on your own.",
        options: [
          "I'm just browsing, thanks.",
          "No. Go away.",
          "Keep the change.",
          "For here or to go?",
        ],
        answer: 0,
        why: "\"I'm just browsing, thanks\" declines help while staying friendly — it's the phrase assistants expect to hear.",
      },
      {
        kind: "gap",
        setup: "You've finished your order and the server is waiting.",
        text: "— Anything else? — No, ___.",
        options: ["that's all, thanks", "it is finished", "no more of it", "I am ready to go"],
        answer: 0,
        why: "\"That's all, thanks\" is the standard closing line for an order. The others are understandable but not what anyone says.",
      },
      {
        kind: "register",
        phrase: "Do you take card?",
        answer: "neutral",
        why: "Safe absolutely anywhere — a market stall or a hotel. Neutral phrases are the ones worth learning first.",
      },
    ],
  },

  {
    id: "reacting",
    title: "Reacting like a native",
    goal: "Show surprise, sympathy and agreement in two or three words instead of freezing.",
    goalRu: "Выразить удивление, сочувствие и согласие в два-три слова, а не молчать в ответ.",
    level: "B1",
    phrases: [
      {
        phrase: "No way!",
        meaning: "Strong surprise or disbelief — good news or bad. Tone carries the meaning.",
        ru: "Да ну! / Не может быть!",
        example: "— I got the scholarship. — No way! That's amazing.",
        register: "casual",
      },
      {
        phrase: "That's rough",
        meaning: "Sympathy for something hard but not tragic — a bad exam, a lost phone.",
        ru: "Это тяжело / неприятно. (сочувствие)",
        example: "— I failed the driving test again. — Oh, that's rough.",
        register: "casual",
      },
      {
        phrase: "Fair enough",
        meaning: "Accepts someone's reason even if you don't fully agree. Ends a small disagreement peacefully.",
        ru: "Ну ладно, справедливо. / Понимаю.",
        example: "— I'd rather stay in tonight. — Fair enough.",
        register: "neutral",
      },
      {
        phrase: "I know, right?",
        meaning: "Enthusiastic agreement — \"exactly what I was thinking\". The question mark is part of the phrase.",
        ru: "Вот именно! / И правда же?",
        example: "— This place got so expensive. — I know, right?",
        register: "veryCasual",
      },
      {
        phrase: "Good for you",
        meaning: "Genuine praise for someone's decision or success. Careful: a flat, dry tone turns it sarcastic.",
        ru: "Молодец! / Рад за тебя.",
        example: "— I quit and started my own thing. — Good for you.",
        register: "casual",
      },
      {
        phrase: "Oh, come on",
        meaning: "Friendly protest — you think someone is exaggerating, being unfair, or giving up too soon.",
        ru: "Да ладно тебе / брось. (дружеский протест)",
        example: "— I'm terrible at this. — Oh, come on, you just started.",
        register: "casual",
      },
    ],
    exercises: [
      {
        kind: "reply",
        situation: "A friend says: \"My laptop died the night before the deadline.\"",
        options: ["Oh, that's rough.", "Good for you.", "I know, right?", "Fair enough."],
        answer: 0,
        why: "\"That's rough\" is sympathy sized for a bad day. \"Good for you\" would sound cruel, and \"fair enough\" answers an argument, not bad news.",
      },
      {
        kind: "gap",
        setup: "Someone tells you they've just been accepted to their dream university.",
        text: "___ That's incredible — congratulations!",
        options: ["No way!", "That's rough.", "Fair enough.", "Anyway."],
        answer: 0,
        why: "\"No way!\" carries surprise in both directions; with good news and a bright tone it reads as delighted disbelief.",
      },
      {
        kind: "gap",
        setup: "You suggest going out; your friend explains they're broke this week.",
        text: "___ Let's do something free instead.",
        options: ["Fair enough.", "No way!", "Good for you.", "I know, right?"],
        answer: 0,
        why: "\"Fair enough\" accepts their reason without argument, which is exactly what closes this kind of small disagreement.",
      },
      {
        kind: "register",
        phrase: "I know, right?",
        answer: "veryCasual",
        why: "Pure friend-to-friend English. In a seminar you'd say \"That's a good point\" or \"I agree\" instead.",
      },
    ],
  },

  {
    id: "texting",
    title: "Texting: short forms that aren't lazy",
    goal: "Read and write real messages — the abbreviations natives use every day.",
    goalRu: "Понимать и писать настоящие сообщения — сокращения, которые носители используют каждый день.",
    level: "A2–B1",
    phrases: [
      {
        phrase: "otw",
        meaning: "On my way — I've left and I'm coming.",
        ru: "Уже в пути / выхожу.",
        example: "otw, 10 mins",
        register: "veryCasual",
      },
      {
        phrase: "lmk",
        meaning: "Let me know — tell me when you've decided or found out.",
        ru: "Дай знать.",
        example: "lmk if you need a ride",
        register: "veryCasual",
      },
      {
        phrase: "idk",
        meaning: "I don't know.",
        ru: "Не знаю.",
        example: "idk, maybe ask Sam?",
        register: "veryCasual",
      },
      {
        phrase: "nvm",
        meaning: "Never mind — forget what I just said, it's sorted.",
        ru: "Забей / неважно.",
        example: "nvm, found it",
        register: "veryCasual",
      },
      {
        phrase: "np",
        meaning: "No problem — a light \"you're welcome\" or \"sure\".",
        ru: "Не вопрос / без проблем.",
        example: "— thanks for covering me — np",
        register: "veryCasual",
      },
      {
        phrase: "ttyl",
        meaning: "Talk to you later — a soft goodbye that promises a next message.",
        ru: "Поговорим позже.",
        example: "gotta run, ttyl",
        register: "veryCasual",
      },
    ],
    exercises: [
      {
        kind: "gap",
        setup: "You're already walking to the meeting point and your friend asks where you are.",
        text: "___, be there in five",
        options: ["otw", "idk", "nvm", "np"],
        answer: 0,
        why: "\"otw\" = on my way. It answers \"where are you?\" in three letters, which is why it's everywhere in messages.",
      },
      {
        kind: "reply",
        situation: "You text a question, then find the answer yourself thirty seconds later.",
        options: ["nvm, found it", "np, found it", "lmk, found it", "ttyl, found it"],
        answer: 0,
        why: "\"nvm\" cancels your own previous message. \"np\" answers a thank-you, so it wouldn't make sense here.",
      },
      {
        kind: "gap",
        setup: "A friend is deciding whether to come to your place tonight.",
        text: "no pressure — just ___ by 6 so I know how much food to buy",
        options: ["lmk", "idk", "otw", "ttyl"],
        answer: 0,
        why: "\"lmk\" asks them to report back later. It's the everyday short form of \"let me know\".",
      },
      {
        kind: "register",
        phrase: "idk",
        answer: "veryCasual",
        why: "Messages and group chats only. In an email to a teacher, write \"I'm not sure\" — abbreviations there read as careless.",
      },
    ],
  },

  {
    id: "saying-no",
    title: "Saying no without sounding rude",
    goal: "Refuse, disagree and set a limit while keeping the relationship intact.",
    goalRu: "Отказать, не согласиться и обозначить границу, не испортив отношения.",
    level: "B1–B2",
    phrases: [
      {
        phrase: "I'd rather not, if that's okay",
        meaning: "A clear refusal wrapped in politeness. You give no reason, and none is expected.",
        ru: "Я бы предпочёл(ла) не делать этого, если можно.",
        example: "— Can you present instead of me? — I'd rather not, if that's okay.",
        register: "neutral",
      },
      {
        phrase: "That's not really my thing",
        meaning: "Says something doesn't suit you personally, without judging it or the person offering.",
        ru: "Это не совсем моё.",
        example: "Karaoke? That's not really my thing, but I'll come along.",
        register: "casual",
      },
      {
        phrase: "I see your point, but ...",
        meaning: "Acknowledges the other side before disagreeing — the standard way to argue without a fight.",
        ru: "Понимаю твою мысль, но...",
        example: "I see your point, but the deadline makes that impossible.",
        register: "neutral",
      },
      {
        phrase: "Let me get back to you",
        meaning: "Buys time instead of forcing an instant yes or no. Implies you really will answer.",
        ru: "Я вернусь к тебе с ответом. / Дай подумать.",
        example: "Sounds interesting — let me get back to you tomorrow.",
        register: "neutral",
      },
      {
        phrase: "To be honest, ...",
        meaning: "Flags that a franker opinion is coming, so it lands as sincerity rather than an attack.",
        ru: "Честно говоря...",
        example: "To be honest, I don't think the design is finished.",
        register: "casual",
      },
      {
        phrase: "Maybe another time",
        meaning: "A soft no to an invitation that keeps the door open for later.",
        ru: "Может, в другой раз.",
        example: "I can't tonight — maybe another time?",
        register: "casual",
      },
    ],
    exercises: [
      {
        kind: "gap",
        setup: "In a seminar you disagree with a classmate's conclusion but want to stay collegial.",
        text: "___ the data only covers one city, so we can't generalise yet.",
        options: ["I see your point, but", "You are wrong, so", "No way, and", "Fair enough, but"],
        answer: 0,
        why: "Naming the other side's point first is what makes disagreement sound thoughtful instead of combative — the standard academic move.",
      },
      {
        kind: "reply",
        situation: "A colleague asks you to take over their weekend shift. You don't want to.",
        options: [
          "I'd rather not, if that's okay.",
          "That's not really my thing.",
          "No way!",
          "Good for you.",
        ],
        answer: 0,
        why: "It's a clear no that stays polite. \"Not really my thing\" is for tastes and hobbies, not for a request like this.",
      },
      {
        kind: "gap",
        setup: "You're offered an internship on the spot and need to think it over.",
        text: "Thank you — that's a great offer. Can I ___ by Friday?",
        options: ["get back to you", "come back for you", "return you", "answer you back"],
        answer: 0,
        why: "\"Get back to you\" is the fixed business phrase for \"I'll answer later\". The alternatives sound translated.",
      },
      {
        kind: "register",
        phrase: "I'd rather not, if that's okay",
        answer: "neutral",
        why: "Works with a boss, a landlord or a friend. That range is exactly why it's the most useful refusal in English.",
      },
    ],
  },
];

export function findLesson(id: string): Lesson | undefined {
  return everydayLessons.find((l) => l.id === id);
}
