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
  level: "A1" | "A1–A2" | "A2" | "A2–B1" | "B1" | "B1–B2" | "B2" | "B2–C1" | "C1";
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
  {
    id: "when-english-runs-out",
    title: "When your English runs out",
    goal: "Keep a conversation alive when you did not understand, instead of nodding and hoping.",
    goalRu: "Не дать разговору развалиться, когда ты не понял, — вместо того чтобы кивать наугад.",
    level: "A1",
    phrases: [
      {
        phrase: "Sorry, could you say that again?",
        meaning: "Asks someone to repeat. Polite, and works with anyone — a friend, a stranger, your boss.",
        ru: "Извините, вы можете повторить?",
        example: "Sorry, could you say that again? It's loud in here.",
        register: "neutral",
      },
      {
        phrase: "Could you speak more slowly, please?",
        meaning: "Asks for a slower pace. Native speakers almost always slow down when asked — they just forget to.",
        ru: "Можно помедленнее, пожалуйста?",
        example: "I understand better when it's slower — could you speak more slowly, please?",
        register: "neutral",
      },
      {
        phrase: "How do you say ... in English?",
        meaning: "Asks for the English word for something. You can point at the thing, or say it in your own language.",
        ru: "Как будет ... по-английски?",
        example: "How do you say «чайник» in English?",
        register: "neutral",
      },
      {
        phrase: "What does ... mean?",
        meaning: "Asks for the meaning of a word you just heard. Note the word order — not “What means ...”.",
        ru: "Что значит ...?",
        example: "What does “deadline” mean?",
        register: "neutral",
      },
      {
        phrase: "I'm not sure I follow.",
        meaning: "Says you lost the thread, without saying your English failed. Sounds thoughtful rather than lost.",
        ru: "Кажется, я не улавливаю мысль.",
        example: "I'm not sure I follow — do you mean today or tomorrow?",
        register: "neutral",
      },
      {
        phrase: "Let me check I've got this right.",
        meaning: "Introduces your own summary of what was said, so the other person can correct it.",
        ru: "Давайте я проверю, правильно ли понял.",
        example: "Let me check I've got this right — the meeting moved to Friday?",
        register: "neutral",
      },
    ],
    exercises: [
      {
        kind: "gap",
        setup: "A shop assistant says something quickly and you catch about half of it.",
        text: "— Sorry, ___ I didn't catch that.",
        options: ["could you say that again?", "what do you say?", "say again me", "repeat it now"],
        answer: 0,
        why: "“Could you say that again?” is the standard polite request. “Repeat it now” is an order, not a request — grammatically fine, socially wrong.",
      },
      {
        kind: "reply",
        situation: "Someone uses a word you have never heard: “We'll need to reschedule.”",
        options: ["What does “reschedule” mean?", "What means reschedule?", "I don't know this.", "Reschedule is what?"],
        answer: 0,
        why: "English puts the subject before the verb in questions like this: “What does X mean?”. “What means X?” is the single most common way learners give themselves away.",
      },
      {
        kind: "reply",
        situation: "Your colleague explains a plan and you followed roughly half of it.",
        options: [
          "Let me check I've got this right — we start on Monday?",
          "I don't understand anything.",
          "Yes, yes, okay.",
          "Speak English please.",
        ],
        answer: 0,
        why: "Repeating the part you did understand turns a failure into a normal check. Saying “yes, yes” hides the problem until it becomes a bigger one.",
      },
      {
        kind: "register",
        phrase: "Could you speak more slowly, please?",
        answer: "neutral",
        why: "It fits everywhere — a friend, a doctor, an interviewer. There is no situation where asking this politely is out of place.",
      },
    ],
  },
  {
    id: "getting-around",
    title: "Getting around a city",
    goal: "Ask for directions, buy a ticket and survive public transport in a place you do not know.",
    goalRu: "Спросить дорогу, купить билет и разобраться с транспортом в незнакомом городе.",
    level: "A1–A2",
    phrases: [
      {
        phrase: "How do I get to ...?",
        meaning: "The all-purpose question for directions. Works for a street, a building or a whole district.",
        ru: "Как мне добраться до ...?",
        example: "Excuse me, how do I get to the central station?",
        register: "neutral",
      },
      {
        phrase: "Is it walking distance?",
        meaning: "Asks whether you can reasonably walk there instead of taking transport.",
        ru: "Туда можно дойти пешком?",
        example: "Is it walking distance, or should I take the bus?",
        register: "neutral",
      },
      {
        phrase: "Which stop do I get off at?",
        meaning: "Asks where to leave the bus or train. “Get off” is the verb for leaving public transport.",
        ru: "На какой остановке мне выходить?",
        example: "I'm going to the museum — which stop do I get off at?",
        register: "neutral",
      },
      {
        phrase: "Does this one go to ...?",
        meaning: "Checks that the bus or train in front of you is the right one. Shorter than naming the route.",
        ru: "Этот идёт до ...?",
        example: "Sorry, does this one go to the airport?",
        register: "casual",
      },
      {
        phrase: "A single / a return, please.",
        meaning: "One-way or round-trip ticket. In American English: “one-way” and “round trip”.",
        ru: "Билет в одну сторону / туда-обратно, пожалуйста.",
        example: "A return to Oxford, please.",
        register: "neutral",
      },
      {
        phrase: "I think I'm lost.",
        meaning: "Says plainly that you do not know where you are. People help readily — it is not embarrassing.",
        ru: "Кажется, я заблудился.",
        example: "Sorry to bother you — I think I'm lost.",
        register: "neutral",
      },
    ],
    exercises: [
      {
        kind: "gap",
        setup: "You are on a bus and not sure where to leave it.",
        text: "— I need the cathedral. ___",
        options: [
          "Which stop do I get off at?",
          "Where I must go out?",
          "Which station I leave?",
          "How I exit the bus?",
        ],
        answer: 0,
        why: "“Get off” is the fixed verb for leaving a bus, train or plane. The other three are word-for-word translations that no one says.",
      },
      {
        kind: "reply",
        situation: "You ask about a museum and hear: “It's about ten minutes from here.”",
        options: ["Is it walking distance?", "Is it far by foot?", "Can I go legs?", "Ten minutes is much?"],
        answer: 0,
        why: "“Walking distance” is the ready-made English phrase for exactly this question, and the answer tells you whether to walk or ride.",
      },
      {
        kind: "register",
        phrase: "Does this one go to the airport?",
        answer: "casual",
        why: "It is relaxed and slightly clipped — perfect shouted through a bus door, a little brusque in a formal ticket office, where you would say “Does this service go to the airport?”",
      },
    ],
  },
  {
    id: "doctor-and-pharmacy",
    title: "At the doctor and the pharmacy",
    goal: "Describe what hurts and understand what you are told to do about it.",
    goalRu: "Объяснить, что болит, и понять, что с этим делать.",
    level: "A2",
    phrases: [
      {
        phrase: "I've got a sore throat.",
        meaning: "“Sore” means painful from use or illness. Used with throat, back, muscles, eyes.",
        ru: "У меня болит горло.",
        example: "I've got a sore throat and a bit of a fever.",
        register: "neutral",
      },
      {
        phrase: "It's been hurting since ...",
        meaning: "Says how long the pain has lasted — the first thing a doctor asks.",
        ru: "Болит с ... (момент времени)",
        example: "It's been hurting since Tuesday.",
        register: "neutral",
      },
      {
        phrase: "It comes and goes.",
        meaning: "The symptom is not constant: it appears, disappears, returns.",
        ru: "То появляется, то проходит.",
        example: "The headache comes and goes, mostly in the evening.",
        register: "neutral",
      },
      {
        phrase: "Do I need a prescription for this?",
        meaning: "Asks whether a doctor's note is required to buy the medicine.",
        ru: "Для этого нужен рецепт?",
        example: "Do I need a prescription for this, or is it over the counter?",
        register: "neutral",
      },
      {
        phrase: "Twice a day, after meals.",
        meaning: "The standard shape of dosage instructions. Learn it as a pattern: how often, then when.",
        ru: "Два раза в день, после еды.",
        example: "Take one tablet twice a day, after meals.",
        register: "neutral",
      },
      {
        phrase: "I'm allergic to ...",
        meaning: "The single most important sentence to be able to say quickly and clearly.",
        ru: "У меня аллергия на ...",
        example: "I'm allergic to penicillin.",
        register: "neutral",
      },
    ],
    exercises: [
      {
        kind: "gap",
        setup: "The doctor asks how long the pain has lasted.",
        text: "— ___ Saturday, more or less.",
        options: ["It's been hurting since", "It hurts from", "It pains since", "I have pain from"],
        answer: 0,
        why: "English marks “started in the past and still true” with the present perfect: “it's been hurting since”. “It hurts from Saturday” loses that.",
      },
      {
        kind: "reply",
        situation: "The pharmacist asks: “Is it constant, or does it stop sometimes?”",
        options: ["It comes and goes.", "It goes and comes.", "Sometimes it is, sometimes no.", "It is periodical."],
        answer: 0,
        why: "“Comes and goes” is a fixed pair in that order — reversing it sounds as odd to English ears as reversing a Russian fixed phrase does to yours.",
      },
      {
        kind: "register",
        phrase: "I'm allergic to penicillin.",
        answer: "neutral",
        why: "Flat, clear, and identical whether you are talking to a friend or to a surgeon. Some sentences should have exactly one version, and this is one of them.",
      },
    ],
  },
  {
    id: "phone-calls",
    title: "Phone calls and voice messages",
    goal: "Start, hold and end a call in English without the panic of not seeing the other face.",
    goalRu: "Начать, провести и закончить разговор по телефону, не видя лица собеседника.",
    level: "A2–B1",
    phrases: [
      {
        phrase: "Is this a good time?",
        meaning: "Checks the person can talk now. Asked at the start, before the reason for calling.",
        ru: "Тебе сейчас удобно говорить?",
        example: "Hi, it's Anton — is this a good time?",
        register: "neutral",
      },
      {
        phrase: "I'm calling about ...",
        meaning: "States the reason immediately. English phone calls get to the point faster than Russian ones.",
        ru: "Я звоню по поводу ...",
        example: "I'm calling about the appointment on Thursday.",
        register: "neutral",
      },
      {
        phrase: "Could you hold on a second?",
        meaning: "Asks the person to wait briefly without hanging up.",
        ru: "Секунду, не кладите трубку.",
        example: "Could you hold on a second? I'll find the number.",
        register: "neutral",
      },
      {
        phrase: "You're breaking up.",
        meaning: "The connection is cutting the sound into pieces. Said about the line, not the person.",
        ru: "Ты пропадаешь / связь рвётся.",
        example: "Sorry, you're breaking up — can I call you back?",
        register: "casual",
      },
      {
        phrase: "Can I get back to you on that?",
        meaning: "Buys time: you will answer, but later. Far better than inventing an answer now.",
        ru: "Можно я отвечу на это позже?",
        example: "Good question — can I get back to you on that tomorrow?",
        register: "neutral",
      },
      {
        phrase: "Thanks for your time.",
        meaning: "Closes a call cleanly. Signals the end without an abrupt goodbye.",
        ru: "Спасибо, что уделили время.",
        example: "That's everything from me — thanks for your time.",
        register: "neutral",
      },
    ],
    exercises: [
      {
        kind: "gap",
        setup: "You call a colleague who might be in a meeting.",
        text: "— Hi, it's Marta. ___",
        options: ["Is this a good time?", "Are you free now?", "Do you have time?", "Can you speak?"],
        answer: 0,
        why: "All four are understandable, but “Is this a good time?” is the set phrase for a phone call. “Can you speak?” can read as a question about ability, which is faintly comic.",
      },
      {
        kind: "reply",
        situation: "Your manager asks a question on a call and you genuinely do not know the answer.",
        options: [
          "Can I get back to you on that?",
          "I don't know.",
          "Maybe yes, maybe no.",
          "I will think and tell.",
        ],
        answer: 0,
        why: "It promises an answer and sets a time, which is what a manager needs. A bare “I don't know” closes the door without offering the follow-up.",
      },
      {
        kind: "register",
        phrase: "You're breaking up.",
        answer: "casual",
        why: "Fine with friends and colleagues you know. On a formal call you would say “I'm afraid the line is quite poor” — same fact, softer frame.",
      },
    ],
  },
  {
    id: "apologising",
    title: "Apologising and fixing it",
    goal: "Apologise in proportion to the mistake, and move straight to the repair.",
    goalRu: "Извиниться соразмерно ошибке и сразу перейти к тому, как её исправить.",
    level: "B1",
    phrases: [
      {
        phrase: "My bad.",
        meaning: "A light admission of a small mistake. Friendly, informal, and instantly forgettable — which is the point.",
        ru: "Моя вина. (лёгкое, неформальное)",
        example: "— You sent the old file. — Oh, my bad, sending the right one now.",
        register: "veryCasual",
      },
      {
        phrase: "Sorry about that.",
        meaning: "The everyday apology for a minor inconvenience you caused.",
        ru: "Извини за это.",
        example: "Sorry about that — I misread the time.",
        register: "casual",
      },
      {
        phrase: "That's on me.",
        meaning: "Takes responsibility explicitly, without excuses. Strong and respected in a work setting.",
        ru: "Это моя ответственность.",
        example: "The deadline slipped and that's on me.",
        register: "neutral",
      },
      {
        phrase: "I should have ...",
        meaning: "Names what you failed to do. Shows you understand the mistake rather than only regretting it.",
        ru: "Мне следовало ...",
        example: "I should have checked the numbers before sending.",
        register: "neutral",
      },
      {
        phrase: "It won't happen again.",
        meaning: "A promise about the future. Use it rarely — it only means something if it is true.",
        ru: "Такого больше не повторится.",
        example: "I've added a check to the process. It won't happen again.",
        register: "neutral",
      },
      {
        phrase: "I do apologise.",
        meaning: "Formal and emphatic — the “do” adds weight. For real damage, or a customer.",
        ru: "Приношу извинения. (формально)",
        example: "I do apologise for the delay in responding.",
        register: "neutral",
      },
    ],
    exercises: [
      {
        kind: "reply",
        situation: "You are an hour late with a report and your manager asks what happened.",
        options: [
          "That's on me — I should have started earlier. It's with you in ten minutes.",
          "My bad.",
          "The internet was slow and then my laptop and then the meeting.",
          "I do apologise for this catastrophic failure.",
        ],
        answer: 0,
        why: "Responsibility, the specific failure, and the fix — in one breath. “My bad” is too light for an hour; the catastrophic version is too heavy and sounds sarcastic.",
      },
      {
        kind: "gap",
        setup: "You bump into someone in a corridor.",
        text: "— Oh, ___",
        options: ["sorry about that!", "I do apologise for my behaviour.", "that's on me.", "it won't happen again."],
        answer: 0,
        why: "A bump is a two-second event. The formal apology and the promise both treat it as far more serious than it is, which is its own kind of awkward.",
      },
      {
        kind: "register",
        phrase: "My bad.",
        answer: "veryCasual",
        why: "Friends and close colleagues only. Said to a client or a professor it sounds careless — as if the mistake did not matter much to you.",
      },
    ],
  },
  {
    id: "asking-at-work",
    title: "Asking for things at work",
    goal: "Ask a colleague for help, time or a decision without sounding either demanding or apologetic.",
    goalRu: "Попросить коллегу о помощи, времени или решении — не приказывая и не извиняясь без конца.",
    level: "B1",
    phrases: [
      {
        phrase: "Would you mind ...ing?",
        meaning: "A soft request. Note the trap: “no” means yes — “not at all” is agreement.",
        ru: "Тебя не затруднит ...? (осторожно: «no» здесь = согласие)",
        example: "Would you mind taking a look at this before I send it?",
        register: "neutral",
      },
      {
        phrase: "When you get a chance, ...",
        meaning: "Marks the request as non-urgent. Buys goodwill and costs nothing.",
        ru: "Когда будет возможность, ...",
        example: "When you get a chance, could you review the draft?",
        register: "neutral",
      },
      {
        phrase: "Do you have five minutes?",
        meaning: "Asks for a small, bounded amount of time — much easier to say yes to than “can we talk?”.",
        ru: "У тебя есть пять минут?",
        example: "Do you have five minutes this afternoon?",
        register: "neutral",
      },
      {
        phrase: "Just to flag ...",
        meaning: "Raises something without demanding action yet. Common in work email and chat.",
        ru: "Просто обращаю внимание, что ...",
        example: "Just to flag that the deadline is Friday, not Monday.",
        register: "neutral",
      },
      {
        phrase: "Could you point me in the right direction?",
        meaning: "Asks for a hint rather than the whole answer — shows you intend to do the work yourself.",
        ru: "Можешь подсказать, куда копать?",
        example: "I'm stuck on the config — could you point me in the right direction?",
        register: "neutral",
      },
      {
        phrase: "No rush.",
        meaning: "Two words that remove pressure. Only say it if you mean it.",
        ru: "Не срочно.",
        example: "Whenever suits you — no rush.",
        register: "casual",
      },
    ],
    exercises: [
      {
        kind: "reply",
        situation: "A colleague asks: “Would you mind sending me the file?” and you are happy to.",
        options: ["Not at all — sending it now.", "Yes, I mind.", "Yes, of course!", "No, I don't want."],
        answer: 0,
        why: "“Would you mind” literally asks whether it bothers you, so agreement is “not at all”. “Yes, of course” is common in speech but strictly means the opposite — and “yes, I mind” is a refusal.",
      },
      {
        kind: "gap",
        setup: "You need a review, but not today.",
        text: "— ___ could you take a look at the draft? No rush.",
        options: ["When you get a chance,", "Immediately,", "You must now", "I demand that"],
        answer: 0,
        why: "The phrase sets the priority for the other person, which is the information they actually need. Pairing it with “no rush” makes the request easy to accept.",
      },
      {
        kind: "register",
        phrase: "Just to flag that the deadline moved.",
        answer: "neutral",
        why: "Standard workplace English, in writing and in speech. It is not casual — you can send it to a director — and not formal enough to feel stiff among peers.",
      },
    ],
  },
  {
    id: "disagreeing",
    title: "Disagreeing without a fight",
    goal: "Say that you think otherwise, and keep the other person listening.",
    goalRu: "Сказать, что ты думаешь иначе, и при этом не потерять собеседника.",
    level: "B1–B2",
    phrases: [
      {
        phrase: "I see what you mean, but ...",
        meaning: "Shows you understood before you object. The single most useful opener in English disagreement.",
        ru: "Понимаю, о чём ты, но ...",
        example: "I see what you mean, but the numbers point the other way.",
        register: "neutral",
      },
      {
        phrase: "I'm not sure about that.",
        meaning: "A soft “no”. Literally expresses doubt, and everyone hears disagreement.",
        ru: "Я не уверен насчёт этого. (мягкое несогласие)",
        example: "I'm not sure about that — it worked differently last year.",
        register: "neutral",
      },
      {
        phrase: "That's fair, though I'd add ...",
        meaning: "Accepts the point and extends it, rather than knocking it down.",
        ru: "Справедливо, но я бы добавил ...",
        example: "That's fair, though I'd add that the deadline changes things.",
        register: "neutral",
      },
      {
        phrase: "Where I'd push back is ...",
        meaning: "Names precisely the part you object to, leaving the rest agreed. Direct but not aggressive.",
        ru: "Возразил бы вот в чём: ...",
        example: "Where I'd push back is the timeline — two weeks seems short.",
        register: "neutral",
      },
      {
        phrase: "Fair enough.",
        meaning: "Accepts the other person's point, often ending the disagreement without full agreement.",
        ru: "Ну, справедливо. / Принимается.",
        example: "— We simply don't have the budget. — Fair enough.",
        register: "casual",
      },
      {
        phrase: "Let's agree to disagree.",
        meaning: "Ends a discussion that will not resolve, without a loser. Use sparingly — it can sound dismissive.",
        ru: "Давай останемся каждый при своём.",
        example: "We've been round this twice — let's agree to disagree.",
        register: "casual",
      },
    ],
    exercises: [
      {
        kind: "reply",
        situation: "In a meeting someone proposes a plan you think is too slow.",
        options: [
          "I see what you mean, but where I'd push back is the timeline.",
          "No, that's wrong.",
          "I don't agree with you absolutely.",
          "Maybe, I don't know, whatever you think.",
        ],
        answer: 0,
        why: "It concedes the reasoning, then names the one disputed part. A flat “that's wrong” makes the other person defend everything, including what you agreed with.",
      },
      {
        kind: "gap",
        setup: "A colleague explains a constraint you had not known about.",
        text: "— Ah, ___ I hadn't realised the budget was fixed.",
        options: ["fair enough —", "let's agree to disagree —", "I'm not sure about that —", "that's on me —"],
        answer: 0,
        why: "New information has changed your mind, and “fair enough” accepts it gracefully. The other three either continue the argument or apologise for nothing.",
      },
      {
        kind: "register",
        phrase: "Let's agree to disagree.",
        answer: "casual",
        why: "Among peers it closes a conversation kindly. Said to a client or a senior colleague it can read as “I'm done listening”, which is rarely what you want.",
      },
    ],
  },
  {
    id: "hedging",
    title: "Hedging: saying less than you mean",
    goal: "Soften a claim so it invites discussion instead of a fight — the habit that makes English sound native.",
    goalRu: "Смягчать утверждение так, чтобы оно приглашало к разговору, — привычка, которая и делает речь естественной.",
    level: "B2",
    phrases: [
      {
        phrase: "I'd say ...",
        meaning: "Frames a claim as your view rather than a fact. Two words, and the sentence stops sounding like a verdict.",
        ru: "Я бы сказал, что ...",
        example: "I'd say it's more of a design problem than a code problem.",
        register: "neutral",
      },
      {
        phrase: "It tends to ...",
        meaning: "States a pattern with room for exceptions, instead of a rule someone can disprove.",
        ru: "Обычно это ... / Как правило, ...",
        example: "The service tends to slow down in the evening.",
        register: "neutral",
      },
      {
        phrase: "kind of / sort of",
        meaning: "Blurs the edge of a word on purpose. Everywhere in speech, almost absent from formal writing.",
        ru: "как бы / в некотором роде",
        example: "It's kind of a temporary fix.",
        register: "casual",
      },
      {
        phrase: "as far as I know",
        meaning: "Marks the limits of your knowledge, so being wrong later costs you nothing.",
        ru: "насколько я знаю",
        example: "As far as I know, nothing changed on Friday.",
        register: "neutral",
      },
      {
        phrase: "It might be worth ...ing",
        meaning: "Suggests without instructing. The standard way to propose something to someone senior.",
        ru: "Возможно, стоит ...",
        example: "It might be worth checking the logs first.",
        register: "neutral",
      },
      {
        phrase: "correct me if I'm wrong",
        meaning: "Invites correction before you make your claim, which makes the claim easier to hear.",
        ru: "поправь меня, если я ошибаюсь",
        example: "Correct me if I'm wrong, but we agreed on Thursday?",
        register: "neutral",
      },
    ],
    exercises: [
      {
        kind: "reply",
        situation: "You believe the report has an error, but you are not certain, and its author is in the room.",
        options: [
          "Correct me if I'm wrong, but should the total be higher here?",
          "This is wrong.",
          "There is a mistake in your report.",
          "I think maybe possibly perhaps it could be wrong.",
        ],
        answer: 0,
        why: "It raises the doubt while leaving the author room to explain, and you lose nothing if you have misread it. The last option hedges so hard it stops carrying any claim at all.",
      },
      {
        kind: "gap",
        setup: "You are proposing an approach to someone more senior than you.",
        text: "— ___ starting with the smaller case.",
        options: ["It might be worth", "You must be", "I order you to be", "It is obligatory"],
        answer: 0,
        why: "“It might be worth” puts the idea on the table without putting the other person under instruction — which is exactly the register a suggestion upwards needs.",
      },
      {
        kind: "register",
        phrase: "It's kind of a temporary fix.",
        answer: "casual",
        why: "Natural in speech and in chat, out of place in a written report, where the same idea becomes “this is an interim solution”.",
      },
    ],
  },
  {
    id: "interviews",
    title: "Interviews: talking about yourself",
    goal: "Answer the standard interview questions with structure instead of improvisation.",
    goalRu: "Отвечать на типовые вопросы собеседования структурно, а не на импровизации.",
    level: "B2–C1",
    phrases: [
      {
        phrase: "I'd describe myself as ...",
        meaning: "Opens the self-description question with a frame, so the answer does not wander.",
        ru: "Я бы описал себя как ...",
        example: "I'd describe myself as someone who prefers finishing to starting.",
        register: "neutral",
      },
      {
        phrase: "In my last role, I was responsible for ...",
        meaning: "The standard opening for experience. “Responsible for” beats “I did” because it implies ownership.",
        ru: "На прошлой работе я отвечал за ...",
        example: "In my last role, I was responsible for the onboarding flow.",
        register: "neutral",
      },
      {
        phrase: "The situation was ..., so I ..., and as a result ...",
        meaning: "The three-part shape interviewers are trained to listen for: context, action, outcome.",
        ru: "Ситуация была ..., поэтому я ..., и в результате ...",
        example: "The situation was that support was overloaded, so I automated the top three requests, and as a result the queue halved.",
        register: "neutral",
      },
      {
        phrase: "What I took from that is ...",
        meaning: "Turns a failure story into evidence of learning — which is what the question about failure is for.",
        ru: "Что я из этого вынес: ...",
        example: "The launch slipped twice. What I took from that is to cut scope early rather than late.",
        register: "neutral",
      },
      {
        phrase: "I'm keen to ...",
        meaning: "Expresses motivation without gushing. Common in British professional English.",
        ru: "Мне интересно / я хотел бы ...",
        example: "I'm keen to work somewhere the research actually reaches users.",
        register: "neutral",
      },
      {
        phrase: "Could you tell me more about ...?",
        meaning: "Your own question at the end. Not optional — having none reads as indifference.",
        ru: "Расскажите подробнее о ...?",
        example: "Could you tell me more about how the team plans a quarter?",
        register: "neutral",
      },
    ],
    exercises: [
      {
        kind: "reply",
        situation: "“Tell me about a time something went wrong.”",
        options: [
          "We missed a deadline, so I moved the review earlier, and as a result the next two shipped on time.",
          "Nothing has ever gone wrong.",
          "My colleague made a mistake and I had to fix everything.",
          "I don't like to talk about failures.",
        ],
        answer: 0,
        why: "Context, action, outcome — the shape the question is designed to elicit. Claiming nothing went wrong, or blaming a colleague, both answer a different and much worse question about you.",
      },
      {
        kind: "gap",
        setup: "The interviewer asks what you were doing at your previous company.",
        text: "— ___ the reporting tools used by the sales team.",
        options: [
          "In my last role, I was responsible for",
          "In my last work I was making",
          "On my old job I did",
          "Previously I am responsible of",
        ],
        answer: 0,
        why: "“Role” is the professional word for a job's shape, and “responsible for” claims ownership rather than mere activity. The others are understandable but sound junior.",
      },
      {
        kind: "register",
        phrase: "I'm keen to work somewhere with real users.",
        answer: "neutral",
        why: "Professional and warm at once — standard in an interview or a cover letter, while “I'd love to” leans casual and “I aspire to” leans stiff.",
      },
    ],
  },
  {
    id: "indirect-english",
    title: "Reading between the lines",
    goal: "Hear what British English means rather than what it says — and answer the real message.",
    goalRu: "Слышать, что британский английский имеет в виду, а не что говорит, — и отвечать на настоящий смысл.",
    level: "C1",
    phrases: [
      {
        phrase: "That's an interesting approach.",
        meaning: "Very often: I disagree, and I am not going to say so. Tone and pause carry the real meaning.",
        ru: "Часто означает: я не согласен, но прямо не скажу.",
        example: "— We'd skip testing this round. — ... That's an interesting approach.",
        register: "neutral",
      },
      {
        phrase: "With the greatest respect, ...",
        meaning: "Signals sharp disagreement, despite the words. The greater the respect claimed, the sharper the coming objection.",
        ru: "При всём уважении, ... (на деле — резкое возражение)",
        example: "With the greatest respect, that's not what the data shows.",
        register: "neutral",
      },
      {
        phrase: "I might be missing something, but ...",
        meaning: "Usually you are not missing anything, and the speaker knows it. A polite frame for pointing out an error.",
        ru: "Возможно, я чего-то не понимаю, но ... (обычно — вежливое указание на ошибку)",
        example: "I might be missing something, but doesn't this double-count January?",
        register: "neutral",
      },
      {
        phrase: "It's not ideal.",
        meaning: "Understatement. Depending on tone it ranges from mildly awkward to a disaster.",
        ru: "Мягко говоря, не лучший вариант.",
        example: "The server went down during the demo. It's not ideal.",
        register: "neutral",
      },
      {
        phrase: "I'll bear it in mind.",
        meaning: "Often a polite close rather than a promise: the idea has been heard, not adopted.",
        ru: "Буду иметь в виду. (часто — вежливое «нет»)",
        example: "— You could try a different framework. — Thanks, I'll bear it in mind.",
        register: "neutral",
      },
      {
        phrase: "Not bad.",
        meaning: "In British use this is praise, sometimes considerable praise, not lukewarm approval.",
        ru: "Совсем неплохо. (в британском — похвала, а не сдержанность)",
        example: "— We finished a week early. — Not bad at all.",
        register: "casual",
      },
    ],
    exercises: [
      {
        kind: "reply",
        situation: "You propose skipping a review step. Your British manager pauses and says: “That's an interesting approach.”",
        options: [
          "What's worrying you about it?",
          "Thanks! I'll go ahead then.",
          "Yes, I thought it was clever too.",
          "Great, glad you like it.",
        ],
        answer: 0,
        why: "The pause and the word “interesting” are the objection. Asking what the concern is opens the real conversation; the other three mistake a polite warning for approval and proceed.",
      },
      {
        kind: "reply",
        situation: "A senior colleague says: “I might be missing something, but doesn't this double-count January?”",
        options: [
          "Good catch — let me check that.",
          "Yes, you're missing something.",
          "No, it's correct.",
          "You are right that you don't understand.",
        ],
        answer: 0,
        why: "They are almost certainly right and are being gentle about it. Defending the number before checking it is how a small error becomes an argument.",
      },
      {
        kind: "register",
        phrase: "With the greatest respect, that's not what the data shows.",
        answer: "neutral",
        why: "Formally polite, and unmistakably firm — which is exactly the combination it exists for. It belongs in meetings and formal email, never in friendly chat, where it would land as sarcasm.",
      },
    ],
  },
];

export function findLesson(id: string): Lesson | undefined {
  return everydayLessons.find((l) => l.id === id);
}
