import type { Register } from "./slangDialogues";

/** One screen in a lesson. */
export type Step =
  | {
      kind: "rule";
      id: string;
      title: string;
      titleRu: string;
      body: string;
      bodyRu: string;
      forms?: { short: string; long: string; note?: string; noteRu?: string }[];
    }
  | {
      kind: "chat";
      id: string;
      title: string;
      titleRu: string;
      withWhom: string;
      withWhomRu: string;
      lines: { me?: boolean; text: string; at: string; glossRu?: string }[];
    }
  | {
      kind: "choice";
      id: string;
      prompt: string;
      promptRu: string;
      quote?: string;
      options: string[];
      answer: number;
      whyRu: string;
      teaches?: string[];
    }
  | {
      kind: "match";
      id: string;
      promptRu: string;
      pairs: [string, string][];
      teaches?: string[];
    }
  | {
      kind: "assemble";
      id: string;
      promptRu: string;
      quote?: string;
      answer: string[];
      extra: string[];
      teaches?: string[];
    }
  | {
      kind: "type";
      id: string;
      promptRu: string;
      quote?: string;
      hint?: string;
      answers: string[];
      teaches?: string[];
    }
  | {
      kind: "gap";
      id: string;
      promptRu: string;
      before: string;
      after: string;
      answers: string[];
      teaches?: string[];
    }
  | {
      kind: "register";
      id: string;
      phrase: string;
      rooms: { labelRu: string; ok: boolean }[];
      whyRu: string;
      register: Register;
      teaches?: string[];
    };

export type TrackKind = "chat" | "idiom" | "speech" | "review";

export interface TrackLesson {
  id: string;
  kind: TrackKind;
  title: string;
  titleRu: string;
  subtitleRu: string;
  review?: boolean;
  steps: Step[];
}

export interface TrackModule {
  id: string;
  title: string;
  titleRu: string;
  subtitle: string;
  subtitleRu: string;
  tone: "mint";
  lessons: TrackLesson[];
}

const chatBasics: TrackLesson = {
  id: "chat-basics",
  kind: "chat",
  title: "Short replies that keep a chat moving",
  titleRu: "Короткие реплики в переписке",
  subtitleRu: "nvm · wyd · fr · bet",
  steps: [
    {
      kind: "rule",
      id: "chat-basics-rule",
      title: "Four replies you will meet in any chat",
      titleRu: "Четыре реплики из любого чата",
      body: "These short forms carry a whole reply. Learn them as complete responses, not as letters to decode one by one.",
      bodyRu: "В переписке короткая форма часто заменяет целое предложение. Поэтому важно не только расшифровать буквы, но и понять, что человек хотел сказать и как ему ответить.",
      forms: [
        { short: "nvm", long: "never mind", noteRu: "«Не важно», «забудь» — вопрос или просьба больше не актуальны." },
        { short: "wyd", long: "what are you doing", noteRu: "«Что делаешь?» Часто это просто способ начать разговор." },
        { short: "fr", long: "for real", noteRu: "«Правда», «серьёзно» — подтверждение или удивление." },
        { short: "bet", long: "okay, agreed", noteRu: "«Договорились», «принято». Не обязательно связано со ставкой." },
      ],
    },
    {
      kind: "chat",
      id: "chat-basics-chat",
      title: "A plan appears in six short lines",
      titleRu: "Так рождаются планы на вечер",
      withWhom: "Alex",
      withWhomRu: "Алекс",
      lines: [
        { text: "wyd tonight?", at: "18:42" },
        { me: true, text: "nothing yet, why?", at: "18:43" },
        { text: "a few of us are getting pizza at 8", at: "18:43" },
        { me: true, text: "fr? I'm in", at: "18:44", glossRu: "fr? — серьёзно? · I'm in — я в деле" },
        { text: "bet. I'll send you the address", at: "18:44", glossRu: "bet — договорились" },
        { text: "nvm, found it — it's the place on King Street", at: "18:45", glossRu: "nvm — не важно, уже не нужно" },
      ],
    },
    {
      kind: "choice",
      id: "chat-basics-choice",
      prompt: "What does nvm mean here?",
      promptRu: "Что значит nvm в этом сообщении?",
      quote: "nvm, I found the address",
      options: ["Не важно, я уже нашёл", "Напомни мне адрес", "Я не могу прийти", "Напиши мне позже"],
      answer: 0,
      whyRu: "nvm отменяет предыдущий вопрос или просьбу: помощь больше не нужна.",
      teaches: ["nvm"],
    },
    {
      kind: "match",
      id: "chat-basics-match",
      promptRu: "Соедини сокращение и его смысл",
      pairs: [["wyd", "что делаешь?"], ["fr", "серьёзно"], ["bet", "договорились"], ["nvm", "не важно"]],
      teaches: ["wyd", "fr", "bet", "nvm"],
    },
    {
      kind: "gap",
      id: "chat-basics-gap",
      promptRu: "Ты согласен. Вставь короткий ответ",
      before: "— Meet us at eight. — ",
      after: ", see you there",
      answers: ["bet", "ok", "okay"],
      teaches: ["bet"],
    },
    {
      kind: "register",
      id: "chat-basics-register",
      phrase: "bet",
      rooms: [
        { labelRu: "Друг предлагает встретиться", ok: true },
        { labelRu: "Чат с одногруппниками", ok: true },
        { labelRu: "Ответ клиенту на заказ", ok: false },
        { labelRu: "Официальное подтверждение", ok: false },
      ],
      whyRu: "bet звучит очень неформально. В рабочей переписке лучше написать Sure, Sounds good или Confirmed.",
      register: "veryCasual",
      teaches: ["bet"],
    },
  ],
};

const idiomBasics: TrackLesson = {
  id: "idiom-basics",
  kind: "idiom",
  title: "Three idioms that do not translate literally",
  titleRu: "Идиомы без дословного перевода",
  subtitleRu: "break a leg · piece of cake · under the weather",
  steps: [
    {
      kind: "rule",
      id: "idiom-basics-rule",
      title: "The whole phrase carries the meaning",
      titleRu: "Смысл прячется во всей фразе",
      body: "An idiom works as one unit. Translate its words separately and the sentence stops making sense.",
      bodyRu: "Идиому нельзя собрать по переводу отдельных слов. Воспринимай её как одно целое выражение — с готовым смыслом и ситуацией, в которой оно звучит естественно.",
      forms: [
        { short: "break a leg", long: "good luck", noteRu: "«Удачи!» Обычно перед выступлением, экзаменом или важным событием." },
        { short: "a piece of cake", long: "something very easy", noteRu: "«Проще простого», «раз плюнуть»." },
        { short: "under the weather", long: "slightly ill", noteRu: "«Нездоровится», «не в форме». Обычно о лёгком недомогании." },
      ],
    },
    {
      kind: "chat",
      id: "idiom-basics-chat",
      title: "The idioms inside an ordinary conversation",
      titleRu: "Идиомы в обычном разговоре",
      withWhom: "Jamie",
      withWhomRu: "Джейми",
      lines: [
        { me: true, text: "my presentation starts in ten minutes", at: "09:50" },
        { text: "break a leg! you'll be great", at: "09:50", glossRu: "break a leg — удачи, ни пуха" },
        { me: true, text: "thanks! the slides were a piece of cake, but speaking is scary", at: "09:51", glossRu: "a piece of cake — было легко" },
        { text: "you sound a little under the weather too — get some rest after", at: "09:51", glossRu: "under the weather — немного нездоровится" },
      ],
    },
    {
      kind: "choice",
      id: "idiom-basics-choice",
      prompt: "Why did Jamie write break a leg?",
      promptRu: "Зачем Джейми написал break a leg?",
      options: ["Пожелать удачи", "Посоветовать сделать перерыв", "Пожаловаться на боль", "Предупредить об опасности"],
      answer: 0,
      whyRu: "Перед важным событием break a leg — дружеское пожелание удачи.",
      teaches: ["break a leg"],
    },
    {
      kind: "match",
      id: "idiom-basics-match",
      promptRu: "Соедини идиому и её настоящий смысл",
      pairs: [["break a leg", "удачи"], ["a piece of cake", "очень легко"], ["under the weather", "нездоровится"], ["good luck", "не сдавайся"]],
      teaches: ["break a leg", "a piece of cake", "under the weather"],
    },
    {
      kind: "assemble",
      id: "idiom-basics-assemble",
      promptRu: "Собери фразу: «Тест был проще простого»",
      answer: ["the", "test", "was", "a", "piece", "of", "cake"],
      extra: ["weather", "leg"],
      teaches: ["a piece of cake"],
    },
    {
      kind: "gap",
      id: "idiom-basics-gap",
      promptRu: "Вставь идиому: «Я сегодня немного не в форме»",
      before: "I'm a bit ",
      after: " today, so I'll stay home",
      answers: ["under the weather"],
      teaches: ["under the weather"],
    },
  ],
};

const speechReactions: TrackLesson = {
  id: "speech-reactions",
  kind: "speech",
  title: "React naturally to surprising news",
  titleRu: "Естественно реагировать на новости",
  subtitleRu: "no way · I'm dead · that's wild · fair enough",
  steps: [
    {
      kind: "rule",
      id: "speech-reactions-rule",
      title: "Short reactions carry the emotion",
      titleRu: "Короткая реакция передаёт эмоцию",
      body: "In conversation, a reaction often matters more than a full sentence. These four show surprise, amusement and reluctant agreement.",
      bodyRu: "В живом разговоре не обязательно отвечать полным предложением. Короткая реакция показывает, что ты слушаешь и понимаешь настроение собеседника.",
      forms: [
        { short: "no way", long: "I can't believe it", noteRu: "«Не может быть!», «Да ладно!»" },
        { short: "I'm dead", long: "that's hilarious", noteRu: "«Я умер», «ору» — о чём-то очень смешном, не о здоровье." },
        { short: "that's wild", long: "that's shocking or unbelievable", noteRu: "«Вот это да», «жесть» — без обязательно негативного оттенка." },
        { short: "fair enough", long: "that's reasonable", noteRu: "«Справедливо», «логично», «принимается»." },
      ],
    },
    {
      kind: "chat",
      id: "speech-reactions-chat",
      title: "Four reactions in one story",
      titleRu: "Четыре реакции в одной истории",
      withWhom: "Morgan",
      withWhomRu: "Морган",
      lines: [
        { text: "my brother accidentally joined a dog show yesterday", at: "21:14" },
        { me: true, text: "no way. what happened?", at: "21:14", glossRu: "no way — да ладно, не может быть" },
        { text: "his dog won third place and he hadn't even trained her", at: "21:15" },
        { me: true, text: "I'm dead 😂 that's wild", at: "21:15", glossRu: "I'm dead — ору · that's wild — вот это да" },
        { text: "he says he's a professional trainer now", at: "21:16" },
        { me: true, text: "fair enough", at: "21:16", glossRu: "fair enough — справедливо, логично" },
      ],
    },
    {
      kind: "choice",
      id: "speech-reactions-choice",
      prompt: "What does I'm dead mean in this chat?",
      promptRu: "Что значит I'm dead в этой переписке?",
      quote: "I'm dead 😂",
      options: ["Очень смешно", "Очень страшно", "Я заболел", "Я злюсь"],
      answer: 0,
      whyRu: "В неформальной речи I'm dead значит «я умер от смеха». Эмодзи и контекст помогают считать этот смысл.",
      teaches: ["I'm dead"],
    },
    {
      kind: "match",
      id: "speech-reactions-match",
      promptRu: "Соедини реакцию и эмоцию",
      pairs: [["no way", "не может быть"], ["that's wild", "вот это да"], ["fair enough", "справедливо"], ["I'm dead", "очень смешно"]],
      teaches: ["no way", "that's wild", "fair enough", "I'm dead"],
    },
    {
      kind: "assemble",
      id: "speech-reactions-assemble",
      promptRu: "Собери реакцию: «Вот это да!»",
      answer: ["that's", "wild"],
      extra: ["dead", "fair"],
      teaches: ["that's wild"],
    },
    {
      kind: "register",
      id: "speech-reactions-register",
      phrase: "I'm dead",
      rooms: [
        { labelRu: "Друг прислал смешное видео", ok: true },
        { labelRu: "Чат с близкими", ok: true },
        { labelRu: "Ответ на плохую новость", ok: false },
        { labelRu: "Формальная рабочая переписка", ok: false },
      ],
      whyRu: "I'm dead уместно только как шутливая реакция на смешное. В серьёзном контексте фраза будет звучать грубо или странно.",
      register: "veryCasual",
      teaches: ["I'm dead"],
    },
  ],
};

const cycleOneCheck: TrackLesson = {
  id: "cycle-one-check",
  kind: "review",
  title: "Check yourself: first cycle",
  titleRu: "Проверь себя: первый цикл",
  subtitleRu: "Переписка, идиомы и реакции вперемешку",
  review: true,
  steps: [
    {
      kind: "match",
      id: "cycle-one-match",
      promptRu: "Соедини выражение и его смысл",
      pairs: [["nvm", "не важно"], ["bet", "договорились"], ["break a leg", "удачи"], ["no way", "не может быть"]],
      teaches: ["nvm", "bet", "break a leg", "no way"],
    },
    {
      kind: "choice",
      id: "cycle-one-choice",
      prompt: "Which reply means good luck?",
      promptRu: "Какое выражение означает пожелание удачи?",
      options: ["break a leg", "under the weather", "fair enough", "wyd"],
      answer: 0,
      whyRu: "break a leg — устойчивое пожелание удачи, особенно перед выступлением или важным делом.",
      teaches: ["break a leg"],
    },
    {
      kind: "gap",
      id: "cycle-one-gap",
      promptRu: "Вставь идиому: «Задание было очень лёгким»",
      before: "The task was ",
      after: ".",
      answers: ["a piece of cake", "piece of cake"],
      teaches: ["a piece of cake"],
    },
    {
      kind: "type",
      id: "cycle-one-type",
      promptRu: "Напиши сокращение от what are you doing",
      hint: "w",
      answers: ["wyd"],
      teaches: ["wyd"],
    },
    {
      kind: "assemble",
      id: "cycle-one-assemble",
      promptRu: "Собери фразу: «Справедливо»",
      answer: ["fair", "enough"],
      extra: ["for", "real"],
      teaches: ["fair enough"],
    },
    {
      kind: "choice",
      id: "cycle-one-register",
      prompt: "A friend sends a hilarious video. What fits best?",
      promptRu: "Друг прислал очень смешное видео. Что подойдёт лучше всего?",
      options: ["I'm dead 😂", "under the weather", "by the book", "nvm"],
      answer: 0,
      whyRu: "I'm dead в дружеском чате означает «ору», «очень смешно».",
      teaches: ["I'm dead"],
    },
  ],
};

const chatPlans: TrackLesson = {
  id: "chat-plans",
  kind: "chat",
  title: "Make plans without long messages",
  titleRu: "Договариваться без длинных сообщений",
  subtitleRu: "lmk · ofc · rn · ikr",
  steps: [
    {
      kind: "rule",
      id: "chat-plans-rule",
      title: "Four shortcuts for everyday plans",
      titleRu: "Четыре сокращения для планов",
      body: "These forms ask for an answer, confirm something, talk about the present and agree with another person's feeling.",
      bodyRu: "Эти сокращения помогают быстро уточнить планы, согласиться и поддержать собеседника. Они особенно часты в личных сообщениях и комментариях.",
      forms: [
        { short: "lmk", long: "let me know", noteRu: "«Дай знать», «напиши, когда решишь»." },
        { short: "ofc", long: "of course", noteRu: "«Конечно», «само собой»." },
        { short: "rn", long: "right now", noteRu: "«Прямо сейчас»." },
        { short: "ikr", long: "I know, right", noteRu: "«Вот и я о том же», «да, точно»." },
      ],
    },
    {
      kind: "chat",
      id: "chat-plans-chat",
      title: "Planning a film night",
      titleRu: "Планы на кино",
      withWhom: "Riley",
      withWhomRu: "Райли",
      lines: [
        { text: "do you want to watch something tonight?", at: "20:03" },
        { me: true, text: "ofc, but I'm still at work rn", at: "20:04", glossRu: "ofc — конечно · rn — прямо сейчас" },
        { text: "lmk when you're free", at: "20:04", glossRu: "lmk — дай знать" },
        { me: true, text: "will do. this week has been so long", at: "20:05" },
        { text: "ikr, I need a quiet night too", at: "20:05", glossRu: "ikr — вот и я о том же" },
      ],
    },
    {
      kind: "choice",
      id: "chat-plans-choice",
      prompt: "What does Riley want you to do?",
      promptRu: "Чего от тебя ждёт Райли?",
      quote: "lmk when you're free",
      options: ["Написать, когда освободишься", "Позвонить прямо сейчас", "Отменить встречу", "Выбрать фильм"],
      answer: 0,
      whyRu: "lmk — let me know. Собеседник просит сообщить ему нужную информацию позже.",
      teaches: ["lmk"],
    },
    {
      kind: "match",
      id: "chat-plans-match",
      promptRu: "Соедини сокращение и расшифровку",
      pairs: [["lmk", "let me know"], ["ofc", "of course"], ["rn", "right now"], ["ikr", "I know, right"]],
      teaches: ["lmk", "ofc", "rn", "ikr"],
    },
    {
      kind: "gap",
      id: "chat-plans-gap",
      promptRu: "Вставь сокращение: «Дай знать, что решишь»",
      before: "",
      after: " what you decide",
      answers: ["lmk", "let me know"],
      teaches: ["lmk"],
    },
    {
      kind: "choice",
      id: "chat-plans-ikr",
      prompt: "Your friend writes This week has been endless. Which reply agrees?",
      promptRu: "Друг пишет: «Эта неделя кажется бесконечной». Чем согласиться?",
      options: ["ikr", "ofc", "rn", "nvm"],
      answer: 0,
      whyRu: "ikr буквально собирается из I know, right — «понимаю, правда?», но используется как тёплое согласие.",
      teaches: ["ikr"],
    },
  ],
};

const idiomPeople: TrackLesson = {
  id: "idiom-people",
  kind: "idiom",
  title: "Talk about people, rules and trouble",
  titleRu: "Говорить о людях, правилах и проблемах",
  subtitleRu: "on the same page · by the book · off the hook",
  steps: [
    {
      kind: "rule",
      id: "idiom-people-rule",
      title: "Three useful ways to describe a situation",
      titleRu: "Три способа описать ситуацию",
      body: "These expressions help you talk about agreement, strict rules and escaping blame.",
      bodyRu: "Эти идиомы пригодятся, когда нужно сказать, что вы с человеком понимаете друг друга, что кто-то действует строго по правилам или что проблема уже снята.",
      forms: [
        { short: "on the same page", long: "in agreement", noteRu: "«На одной волне», «одинаково понимать ситуацию»." },
        { short: "by the book", long: "strictly according to the rules", noteRu: "«Строго по правилам», «по инструкции»." },
        { short: "off the hook", long: "no longer in trouble", noteRu: "«Выйти сухим из воды», «тебя больше не винят»." },
      ],
    },
    {
      kind: "chat",
      id: "idiom-people-chat",
      title: "A problem gets sorted out",
      titleRu: "Проблема решена",
      withWhom: "Taylor",
      withWhomRu: "Тейлор",
      lines: [
        { me: true, text: "I thought we were meeting at seven, not eight", at: "17:22" },
        { text: "sorry, I guess we weren't on the same page", at: "17:23", glossRu: "on the same page — одинаково понимали договорённость" },
        { me: true, text: "no worries. can we still get in?", at: "17:23" },
        { text: "yes, the manager checked everything by the book, but you're off the hook", at: "17:24", glossRu: "by the book — по правилам · off the hook — претензий больше нет" },
      ],
    },
    {
      kind: "choice",
      id: "idiom-people-choice",
      prompt: "What does on the same page mean?",
      promptRu: "Что значит on the same page?",
      options: ["Понимать друг друга одинаково", "Читать одну книгу", "Соблюдать все правила", "Оказаться виноватым"],
      answer: 0,
      whyRu: "Быть on the same page — иметь общее понимание плана или ситуации.",
      teaches: ["on the same page"],
    },
    {
      kind: "match",
      id: "idiom-people-match",
      promptRu: "Соедини идиому и её смысл",
      pairs: [["on the same page", "на одной волне"], ["by the book", "строго по правилам"], ["off the hook", "претензий больше нет"], ["a piece of cake", "очень легко"]],
      teaches: ["on the same page", "by the book", "off the hook"],
    },
    {
      kind: "assemble",
      id: "idiom-people-assemble",
      promptRu: "Собери фразу: «Он всё делает по правилам»",
      answer: ["he", "does", "everything", "by", "the", "book"],
      extra: ["same", "hook"],
      teaches: ["by the book"],
    },
    {
      kind: "gap",
      id: "idiom-people-gap",
      promptRu: "Вставь идиому: «Тебя больше не винят»",
      before: "Don't worry, you're ",
      after: ".",
      answers: ["off the hook"],
      teaches: ["off the hook"],
    },
  ],
};

const speechBoundaries: TrackLesson = {
  id: "speech-boundaries",
  kind: "speech",
  title: "Answer a joke or a teasing comment",
  titleRu: "Отвечать на шутки и подколы",
  subtitleRu: "chill out · you wish · give me a break · dude",
  steps: [
    {
      kind: "rule",
      id: "speech-boundaries-rule",
      title: "The tone changes with the situation",
      titleRu: "Тон зависит от ситуации",
      body: "These lines can sound playful between friends and rude between strangers. The words matter, but the relationship matters just as much.",
      bodyRu: "Одна и та же фраза может быть дружеской шуткой или грубостью — всё решают интонация и отношения между людьми. С друзьями эти реплики звучат легко, с незнакомцами лучше быть осторожнее.",
      forms: [
        { short: "chill out", long: "relax", noteRu: "«Расслабься», «остынь». Может звучать раздражённо." },
        { short: "you wish", long: "that is not going to happen", noteRu: "«Мечтай», «не дождёшься» — обычно в шутку." },
        { short: "give me a break", long: "I do not believe it / stop it", noteRu: "«Да брось», «хватит» — по контексту." },
        { short: "dude", long: "an informal way to address someone", noteRu: "«Чувак», «братан». Очень неформальное обращение." },
      ],
    },
    {
      kind: "chat",
      id: "speech-boundaries-chat",
      title: "Friends tease each other",
      titleRu: "Друзья подкалывают друг друга",
      withWhom: "Casey",
      withWhomRu: "Кейси",
      lines: [
        { text: "dude, I beat your high score in one try", at: "22:08" },
        { me: true, text: "give me a break. you practised all week", at: "22:08", glossRu: "give me a break — да брось" },
        { text: "chill out, I'm just better", at: "22:09", glossRu: "chill out — расслабься" },
        { me: true, text: "you wish. rematch tomorrow", at: "22:09", glossRu: "you wish — мечтай" },
      ],
    },
    {
      kind: "choice",
      id: "speech-boundaries-choice",
      prompt: "What does you wish mean in this exchange?",
      promptRu: "Что значит you wish в этом разговоре?",
      quote: "— I'm just better. — You wish.",
      options: ["Мечтай, это не так", "Я желаю тебе успеха", "Ты прав", "Я сдаюсь"],
      answer: 0,
      whyRu: "you wish — ироничный ответ на хвастовство или нереалистичное заявление: «мечтай».",
      teaches: ["you wish"],
    },
    {
      kind: "match",
      id: "speech-boundaries-match",
      promptRu: "Соедини реплику и её оттенок",
      pairs: [["chill out", "остынь"], ["you wish", "мечтай"], ["give me a break", "да брось"], ["dude", "чувак"]],
      teaches: ["chill out", "you wish", "give me a break", "dude"],
    },
    {
      kind: "gap",
      id: "speech-boundaries-gap",
      promptRu: "Вставь реплику: «Да брось, такого не было»",
      before: "",
      after: ", that never happened",
      answers: ["give me a break"],
      teaches: ["give me a break"],
    },
    {
      kind: "register",
      id: "speech-boundaries-register",
      phrase: "chill out",
      rooms: [
        { labelRu: "Шутливый спор с другом", ok: true },
        { labelRu: "Разговор с близким человеком", ok: true },
        { labelRu: "Успокоить расстроенного клиента", ok: false },
        { labelRu: "Ответ преподавателю", ok: false },
      ],
      whyRu: "chill out может прозвучать как «успокойся уже» и усилить раздражение. В нейтральной ситуации безопаснее Take it easy или Let's slow down.",
      register: "veryCasual",
      teaches: ["chill out"],
    },
  ],
};

const cycleTwoCheck: TrackLesson = {
  id: "cycle-two-check",
  kind: "review",
  title: "Check yourself: second cycle",
  titleRu: "Проверь себя: второй цикл",
  subtitleRu: "Новые выражения и повторение первого цикла",
  review: true,
  steps: [
    {
      kind: "match",
      id: "cycle-two-match",
      promptRu: "Соедини выражение и его смысл",
      pairs: [["lmk", "дай знать"], ["ikr", "вот и я о том же"], ["by the book", "по правилам"], ["you wish", "мечтай"]],
      teaches: ["lmk", "ikr", "by the book", "you wish"],
    },
    {
      kind: "choice",
      id: "cycle-two-choice",
      prompt: "Which expression means in agreement?",
      promptRu: "Какая идиома значит «на одной волне»?",
      options: ["on the same page", "off the hook", "under the weather", "that's wild"],
      answer: 0,
      whyRu: "on the same page означает общее понимание ситуации или плана.",
      teaches: ["on the same page"],
    },
    {
      kind: "gap",
      id: "cycle-two-gap",
      promptRu: "Вставь сокращение: «Я сейчас занят»",
      before: "I'm busy ",
      after: ", can we talk later?",
      answers: ["rn", "right now"],
      teaches: ["rn"],
    },
    {
      kind: "type",
      id: "cycle-two-type",
      promptRu: "Напиши идиому: «тебя больше не винят» — you're …",
      hint: "off",
      answers: ["off the hook"],
      teaches: ["off the hook"],
    },
    {
      kind: "assemble",
      id: "cycle-two-assemble",
      promptRu: "Собери реплику: «Дай знать, когда будешь дома»",
      answer: ["lmk", "when", "you're", "home"],
      extra: ["ikr", "now"],
      teaches: ["lmk"],
    },
    {
      kind: "choice",
      id: "cycle-two-review",
      prompt: "Your friend feels a little ill. Which idiom fits?",
      promptRu: "Друг немного плохо себя чувствует. Какая идиома подойдёт?",
      options: ["under the weather", "a piece of cake", "on the same page", "fair enough"],
      answer: 0,
      whyRu: "under the weather — о лёгком недомогании. Так старые выражения возвращаются в новых ситуациях.",
      teaches: ["under the weather"],
    },
  ],
};

const chatHonesty: TrackLesson = {
  id: "chat-honesty",
  kind: "chat",
  title: "Be direct without sounding too formal",
  titleRu: "Говорить прямо, но неформально",
  subtitleRu: "tbh · ngl · smh · irl",
  steps: [
    {
      kind: "rule",
      id: "chat-honesty-rule",
      title: "Shortcuts for opinions and reactions",
      titleRu: "Сокращения для мнений и реакций",
      body: "These forms introduce an honest opinion, show disappointment and separate online life from real life.",
      bodyRu: "Эти сокращения часто стоят перед личным мнением или реакцией. Они задают тон всему сообщению, поэтому важно чувствовать разницу между ними.",
      forms: [
        { short: "tbh", long: "to be honest", noteRu: "«Честно говоря». Вводит откровенное мнение." },
        { short: "ngl", long: "not gonna lie", noteRu: "«Не буду врать», «честно». Очень близко к tbh." },
        { short: "smh", long: "shaking my head", noteRu: "«Качаю головой» — разочарование или недоумение." },
        { short: "irl", long: "in real life", noteRu: "«В реальной жизни», не в интернете или игре." },
      ],
    },
    {
      kind: "chat",
      id: "chat-honesty-chat",
      title: "An honest opinion about a meet-up",
      titleRu: "Честное мнение о встрече",
      withWhom: "Jordan",
      withWhomRu: "Джордан",
      lines: [
        { me: true, text: "tbh I was nervous about meeting everyone irl", at: "23:12", glossRu: "tbh — честно говоря · irl — в реальной жизни" },
        { text: "ngl, I was too. but it was fun", at: "23:13", glossRu: "ngl — не буду врать" },
        { me: true, text: "except Ben arriving two hours late", at: "23:13" },
        { text: "smh, he does that every time", at: "23:14", glossRu: "smh — качаю головой, ну как так можно" },
      ],
    },
    {
      kind: "choice",
      id: "chat-honesty-choice",
      prompt: "What does smh express here?",
      promptRu: "Что выражает smh в этом сообщении?",
      quote: "smh, he does that every time",
      options: ["Разочарование его поведением", "Согласие с ним", "Желание встретиться", "Сильный смех"],
      answer: 0,
      whyRu: "smh — shaking my head. Так реагируют на что-то раздражающее, глупое или разочаровывающее.",
      teaches: ["smh"],
    },
    {
      kind: "match",
      id: "chat-honesty-match",
      promptRu: "Соедини сокращение и расшифровку",
      pairs: [["tbh", "to be honest"], ["ngl", "not gonna lie"], ["smh", "shaking my head"], ["irl", "in real life"]],
      teaches: ["tbh", "ngl", "smh", "irl"],
    },
    {
      kind: "gap",
      id: "chat-honesty-gap",
      promptRu: "Вставь сокращение: «Честно говоря, мне понравилось»",
      before: "",
      after: ", I really liked it",
      answers: ["tbh", "ngl", "to be honest", "not gonna lie"],
      teaches: ["tbh", "ngl"],
    },
    {
      kind: "choice",
      id: "chat-honesty-irl",
      prompt: "Which word means away from the internet?",
      promptRu: "Какое сокращение значит «в реальной жизни»?",
      options: ["irl", "smh", "rn", "ofc"],
      answer: 0,
      whyRu: "irl — in real life. Его используют, когда сравнивают общение или образ человека онлайн и вживую.",
      teaches: ["irl"],
    },
  ],
};

const idiomFeelings: TrackLesson = {
  id: "idiom-feelings",
  kind: "idiom",
  title: "Describe strong feelings naturally",
  titleRu: "Описывать сильные эмоции",
  subtitleRu: "over the moon · on cloud nine · on edge · butterflies",
  steps: [
    {
      kind: "rule",
      id: "idiom-feelings-rule",
      title: "Happiness and nerves in four idioms",
      titleRu: "Радость и волнение в четырёх идиомах",
      body: "Two expressions describe intense happiness, and two describe nervous tension. Context tells you which feeling is meant.",
      bodyRu: "Две идиомы описывают сильную радость, две другие — нервное напряжение. Их можно использовать вместо повторяющихся very happy и very nervous.",
      forms: [
        { short: "over the moon", long: "extremely happy", noteRu: "«На седьмом небе от счастья»." },
        { short: "on cloud nine", long: "blissfully happy", noteRu: "Ещё один образ полного счастья." },
        { short: "on edge", long: "nervous and tense", noteRu: "«На нервах», «в напряжении»." },
        { short: "butterflies in my stomach", long: "nervous excitement", noteRu: "«Бабочки в животе» — приятное волнение или сильное волнение перед событием." },
      ],
    },
    {
      kind: "chat",
      id: "idiom-feelings-chat",
      title: "Good news and first-date nerves",
      titleRu: "Хорошие новости и волнение",
      withWhom: "Emery",
      withWhomRu: "Эмери",
      lines: [
        { text: "I got the job! I'm over the moon", at: "16:40", glossRu: "over the moon — безумно рад" },
        { me: true, text: "that's amazing! you must be on cloud nine", at: "16:41", glossRu: "on cloud nine — на седьмом небе" },
        { text: "I am, but now I'm on edge about my first day", at: "16:41", glossRu: "on edge — на нервах" },
        { me: true, text: "butterflies in your stomach are normal — you'll do great", at: "16:42", glossRu: "butterflies — волнение перед важным событием" },
      ],
    },
    {
      kind: "choice",
      id: "idiom-feelings-choice",
      prompt: "How does Emery feel?",
      promptRu: "Что чувствует Эмери?",
      quote: "I'm over the moon",
      options: ["Очень счастлив", "Очень устал", "Сильно злится", "Немного болен"],
      answer: 0,
      whyRu: "over the moon — очень сильная радость. По смыслу близко к on cloud nine.",
      teaches: ["over the moon"],
    },
    {
      kind: "match",
      id: "idiom-feelings-match",
      promptRu: "Соедини идиому и эмоцию",
      pairs: [["over the moon", "сильная радость"], ["on cloud nine", "полное счастье"], ["on edge", "нервное напряжение"], ["butterflies in my stomach", "бабочки в животе"]],
      teaches: ["over the moon", "on cloud nine", "on edge", "butterflies in my stomach"],
    },
    {
      kind: "assemble",
      id: "idiom-feelings-assemble",
      promptRu: "Собери фразу: «Я на нервах перед собеседованием»",
      answer: ["I'm", "on", "edge", "before", "the", "interview"],
      extra: ["moon", "cloud"],
      teaches: ["on edge"],
    },
    {
      kind: "gap",
      id: "idiom-feelings-gap",
      promptRu: "Вставь идиому: «Я безумно рад»",
      before: "I'm ",
      after: " about the news",
      answers: ["over the moon", "on cloud nine"],
      teaches: ["over the moon", "on cloud nine"],
    },
  ],
};

const speechReductions: TrackLesson = {
  id: "speech-reductions",
  kind: "speech",
  title: "Understand fast, natural speech",
  titleRu: "Понимать быструю живую речь",
  subtitleRu: "gonna · wanna · kinda · gotta",
  steps: [
    {
      kind: "rule",
      id: "speech-reductions-rule",
      title: "How familiar words sound at full speed",
      titleRu: "Как знакомые слова звучат в быстрой речи",
      body: "In relaxed speech, several words often blend into a shorter sound. These written forms imitate that sound in chats and subtitles.",
      bodyRu: "В расслабленной речи носители часто соединяют и сокращают слова. В сообщениях и субтитрах это записывают как gonna, wanna, kinda и gotta. Сначала научись узнавать форму, затем используй её в неформальной речи.",
      forms: [
        { short: "gonna", long: "going to", noteRu: "I'm gonna call — я собираюсь позвонить." },
        { short: "wanna", long: "want to", noteRu: "I wanna go — я хочу пойти." },
        { short: "kinda", long: "kind of", noteRu: "It's kinda late — уже как-то поздновато." },
        { short: "gotta", long: "got to / have to", noteRu: "I gotta run — мне нужно бежать." },
      ],
    },
    {
      kind: "chat",
      id: "speech-reductions-chat",
      title: "Fast speech in written form",
      titleRu: "Быстрая речь в сообщениях",
      withWhom: "Sky",
      withWhomRu: "Скай",
      lines: [
        { text: "wanna grab some food later?", at: "19:32", glossRu: "wanna — want to" },
        { me: true, text: "yeah, but I'm kinda tired", at: "19:33", glossRu: "kinda — kind of" },
        { text: "we don't have to stay long", at: "19:33" },
        { me: true, text: "okay, I'm gonna finish this and then we can go", at: "19:34", glossRu: "gonna — going to" },
        { text: "cool, I gotta charge my phone first", at: "19:34", glossRu: "gotta — have to, нужно" },
      ],
    },
    {
      kind: "choice",
      id: "speech-reductions-choice",
      prompt: "What is gonna short for?",
      promptRu: "Что скрывается за gonna?",
      quote: "I'm gonna finish this",
      options: ["going to", "got to", "want to", "kind of"],
      answer: 0,
      whyRu: "gonna передаёт произношение going to: I'm gonna finish = I'm going to finish.",
      teaches: ["gonna"],
    },
    {
      kind: "match",
      id: "speech-reductions-match",
      promptRu: "Соедини живую форму и полный вариант",
      pairs: [["gonna", "going to"], ["wanna", "want to"], ["kinda", "kind of"], ["gotta", "got to"]],
      teaches: ["gonna", "wanna", "kinda", "gotta"],
    },
    {
      kind: "gap",
      id: "speech-reductions-gap",
      promptRu: "Вставь живую форму want to",
      before: "Do you ",
      after: " come with us?",
      answers: ["wanna", "want to"],
      teaches: ["wanna"],
    },
    {
      kind: "register",
      id: "speech-reductions-register",
      phrase: "gonna / gotta / kinda",
      rooms: [
        { labelRu: "Разговор с другом", ok: true },
        { labelRu: "Личные сообщения", ok: true },
        { labelRu: "Академическое эссе", ok: false },
        { labelRu: "Официальное заявление", ok: false },
      ],
      whyRu: "Эти формы естественны в разговоре, но в официальном письме нужны полные going to, have to и kind of.",
      register: "veryCasual",
      teaches: ["gonna", "gotta", "kinda"],
    },
  ],
};

const cycleThreeCheck: TrackLesson = {
  id: "cycle-three-check",
  kind: "review",
  title: "Check yourself: third cycle",
  titleRu: "Проверь себя: третий цикл",
  subtitleRu: "Финальная проверка стартового пути",
  review: true,
  steps: [
    {
      kind: "match",
      id: "cycle-three-match",
      promptRu: "Соедини выражение и его смысл",
      pairs: [["tbh", "честно говоря"], ["smh", "качаю головой"], ["on edge", "на нервах"], ["wanna", "want to"]],
      teaches: ["tbh", "smh", "on edge", "wanna"],
    },
    {
      kind: "choice",
      id: "cycle-three-choice",
      prompt: "Which idiom means extremely happy?",
      promptRu: "Какая идиома означает сильную радость?",
      options: ["on cloud nine", "on edge", "off the hook", "by the book"],
      answer: 0,
      whyRu: "on cloud nine и over the moon описывают сильное счастье; on edge, наоборот, означает напряжение.",
      teaches: ["on cloud nine"],
    },
    {
      kind: "gap",
      id: "cycle-three-gap",
      promptRu: "Вставь живую форму: «Мне пора идти»",
      before: "I ",
      after: " go now",
      answers: ["gotta", "have got to", "have to"],
      teaches: ["gotta"],
    },
    {
      kind: "type",
      id: "cycle-three-type",
      promptRu: "Напиши сокращение от in real life",
      hint: "i",
      answers: ["irl"],
      teaches: ["irl"],
    },
    {
      kind: "assemble",
      id: "cycle-three-assemble",
      promptRu: "Собери фразу: «Честно говоря, я немного устал»",
      answer: ["tbh", "I'm", "kinda", "tired"],
      extra: ["smh", "gonna"],
      teaches: ["tbh", "kinda"],
    },
    {
      kind: "choice",
      id: "cycle-three-review",
      prompt: "Your friend writes See you at eight. Which reply means agreed?",
      promptRu: "Друг пишет: «Увидимся в восемь». Что значит «договорились»?",
      options: ["bet", "smh", "on edge", "nvm"],
      answer: 0,
      whyRu: "bet в неформальном чате подтверждает договорённость. Финальный вопрос возвращает выражение из самого первого урока.",
      teaches: ["bet"],
    },
  ],
};

const chatNotes: TrackLesson = {
  id: "chat-notes",
  kind: "chat",
  title: "Use shorthand from real messages",
  titleRu: "Сокращения из твоих записей",
  subtitleRu: "idk · aka · btw · idgaf",
  steps: [
    {
      kind: "rule",
      id: "chat-notes-rule",
      title: "Four forms you wrote down",
      titleRu: "Четыре формы из сериала",
      body: "These shortcuts express uncertainty, add a name or side note, and show indifference. One of them is deliberately rude.",
      bodyRu: "Эти сокращения помогают сказать, что ты не знаешь ответа, пояснить имя, сменить тему или показать безразличие. Последнее — грубое, поэтому его важно узнавать, но использовать только в подходящей компании.",
      forms: [
        { short: "idk", long: "I don't know", noteRu: "«Не знаю». Более разговорный полный вариант — I have no idea." },
        { short: "aka", long: "also known as", noteRu: "«Также известный как», «он же»." },
        { short: "btw", long: "by the way", noteRu: "«Кстати». Добавляет мысль или меняет тему." },
        { short: "idgaf", long: "I don't give a fuck", noteRu: "«Мне плевать». Очень грубо и резко." },
      ],
    },
    {
      kind: "chat",
      id: "chat-notes-chat",
      title: "The shorthand in context",
      titleRu: "Сокращения в переписке",
      withWhom: "Max",
      withWhomRu: "Макс",
      lines: [
        { text: "do you know who's coming tonight?", at: "20:11" },
        { me: true, text: "idk, maybe Chris, aka the guy who always brings snacks", at: "20:12", glossRu: "idk — не знаю · aka — он же" },
        { text: "btw, people are still arguing about yesterday", at: "20:12", glossRu: "btw — кстати" },
        { me: true, text: "honestly, idgaf about the drama. I just want pizza", at: "20:13", glossRu: "idgaf — мне плевать, очень грубо" },
      ],
    },
    {
      kind: "choice",
      id: "chat-notes-choice",
      prompt: "What does aka mean?",
      promptRu: "Что значит aka?",
      quote: "Chris, aka the guy who always brings snacks",
      options: ["также известный как", "кстати", "не знаю", "мне всё равно"],
      answer: 0,
      whyRu: "aka — also known as. Так поясняют прозвище, второе имя или узнаваемое описание человека.",
      teaches: ["aka"],
    },
    {
      kind: "match",
      id: "chat-notes-match",
      promptRu: "Соедини сокращение и расшифровку",
      pairs: [["idk", "I don't know"], ["aka", "also known as"], ["btw", "by the way"], ["idgaf", "I don't give a fuck"]],
      teaches: ["idk", "aka", "btw", "idgaf"],
    },
    {
      kind: "register",
      id: "chat-notes-register",
      phrase: "idgaf",
      rooms: [
        { labelRu: "Грубый разговор с близким другом", ok: true },
        { labelRu: "Понять реплику в сериале", ok: true },
        { labelRu: "Ответить преподавателю", ok: false },
        { labelRu: "Написать коллеге в рабочий чат", ok: false },
      ],
      whyRu: "idgaf содержит грубое ругательство и звучит агрессивно. Нейтральный вариант — I don't mind или It doesn't matter to me, а просто «не интересно» — I'm not interested.",
      register: "veryCasual",
      teaches: ["idgaf"],
    },
  ],
};

const idiomActions: TrackLesson = {
  id: "idiom-actions",
  kind: "idiom",
  title: "Listen, take shortcuts and stay unnoticed",
  titleRu: "Слушать, халтурить и затаиться",
  subtitleRu: "all ears · cut corners · get under someone's skin · lie low",
  steps: [
    {
      kind: "rule",
      id: "idiom-actions-rule",
      title: "Four expressions for actions and attitudes",
      titleRu: "Четыре выражения о действиях",
      body: "These idioms describe attention, careless work, irritation and staying out of sight.",
      bodyRu: "Эти идиомы описывают внимание, небрежную работу, раздражение и желание не привлекать к себе внимания. Их смысл не складывается из отдельных слов.",
      forms: [
        { short: "I'm all ears", long: "I'm listening carefully", noteRu: "«Я весь во внимании», «слушаю тебя»." },
        { short: "cut corners", long: "do something cheaply or carelessly", noteRu: "«Халтурить», «экономить в ущерб качеству»." },
        { short: "get under someone's skin", long: "annoy someone", noteRu: "«Действовать на нервы», «раздражать» — не «залезть в душу»." },
        { short: "lie low", long: "stay unnoticed", noteRu: "«Затаиться», «не высовываться»." },
      ],
    },
    {
      kind: "chat",
      id: "idiom-actions-chat",
      title: "A friend tells the whole story",
      titleRu: "Друг рассказывает всю историю",
      withWhom: "Robin",
      withWhomRu: "Робин",
      lines: [
        { text: "can I tell you what happened at work?", at: "18:06" },
        { me: true, text: "sure, I'm all ears", at: "18:07", glossRu: "I'm all ears — слушаю очень внимательно" },
        { text: "the builders cut corners and now the door keeps squeaking", at: "18:07", glossRu: "cut corners — схалтурили" },
        { text: "it's getting under my skin, so I'm staying home. lying low today", at: "18:08", glossRu: "gets under my skin — действует на нервы · lie low — затаиться" },
      ],
    },
    {
      kind: "choice",
      id: "idiom-actions-choice",
      prompt: "What gets under your skin?",
      promptRu: "Что значит get under your skin?",
      options: ["Что-то действует тебе на нервы", "Тебе стало холодно", "Ты всё внимательно слушаешь", "Ты решил спрятаться"],
      answer: 0,
      whyRu: "get under someone's skin означает раздражать или действовать на нервы, обычно постоянно и заметно.",
      teaches: ["get under someone's skin"],
    },
    {
      kind: "match",
      id: "idiom-actions-match",
      promptRu: "Соедини идиому и её смысл",
      pairs: [["all ears", "весь во внимании"], ["cut corners", "халтурить"], ["get under someone's skin", "действовать на нервы"], ["lie low", "затаиться"]],
      teaches: ["all ears", "cut corners", "get under someone's skin", "lie low"],
    },
    {
      kind: "gap",
      id: "idiom-actions-gap",
      promptRu: "Вставь идиому: «Не халтурь»",
      before: "Don't ",
      after: " on this project — quality matters",
      answers: ["cut corners"],
      teaches: ["cut corners"],
    },
  ],
};

const speechLabels: TrackLesson = {
  id: "speech-labels",
  kind: "speech",
  title: "Understand compliments and insults",
  titleRu: "Комплимент или оскорбление",
  subtitleRu: "badass · nerd · douchebag · moron",
  steps: [
    {
      kind: "rule",
      id: "speech-labels-rule",
      title: "Similar words can carry opposite judgements",
      titleRu: "Похожие слова — разные оценки",
      body: "badass is usually praise, nerd depends on tone, and douchebag and moron are insults. Do not translate them all as neutral descriptions.",
      bodyRu: "badass обычно хвалит, nerd может быть и шуткой, и обидным ярлыком, а douchebag и moron — оскорбления. Здесь особенно важно слышать интонацию и понимать отношения между людьми.",
      forms: [
        { short: "badass", long: "impressively tough or skilled", noteRu: "«Крутой», «мастер своего дела». Грубоватый, но чаще комплимент." },
        { short: "nerd", long: "someone very into study or a niche interest", noteRu: "«Ботаник», «фанат своей темы». Может быть ласково или обидно." },
        { short: "douchebag", long: "an unpleasant, arrogant person", noteRu: "Грубое оскорбление: «придурок», «мразь» по силе контекста." },
        { short: "moron", long: "a stupid person", noteRu: "«Идиот», «тупица». Оскорбление." },
      ],
    },
    {
      kind: "chat",
      id: "speech-labels-chat",
      title: "Friends judge a character",
      titleRu: "Друзья обсуждают персонажа",
      withWhom: "Nancy",
      withWhomRu: "Нэнси",
      lines: [
        { text: "she fixed the engine in five minutes. what a badass", at: "22:41", glossRu: "badass — очень крутая, мастер" },
        { me: true, text: "and she knows every comic ever published. total nerd, like us", at: "22:42", glossRu: "nerd — здесь дружеское «фанатка своей темы»" },
        { text: "unlike her brother. he acted like a complete douchebag", at: "22:42", glossRu: "douchebag — грубое оскорбление" },
        { me: true, text: "yeah, only a moron would drive that fast", at: "22:43", glossRu: "moron — идиот" },
      ],
    },
    {
      kind: "choice",
      id: "speech-labels-choice",
      prompt: "Is badass a compliment here?",
      promptRu: "badass здесь — комплимент?",
      quote: "She fixed the engine in five minutes. What a badass.",
      options: ["Да, ею восхищаются", "Нет, её обзывают", "Её обвиняют в поломке", "Её просят уйти"],
      answer: 0,
      whyRu: "badass часто означает восхищение чьей-то смелостью, крутостью или мастерством, хотя само слово неформальное и грубоватое.",
      teaches: ["badass"],
    },
    {
      kind: "match",
      id: "speech-labels-match",
      promptRu: "Соедини слово и его оттенок",
      pairs: [["badass", "крутой, мастер"], ["nerd", "фанат своей темы"], ["douchebag", "грубое оскорбление"], ["moron", "идиот"]],
      teaches: ["badass", "nerd", "douchebag", "moron"],
    },
    {
      kind: "register",
      id: "speech-labels-register",
      phrase: "moron / douchebag",
      rooms: [
        { labelRu: "Понять конфликт в сериале", ok: true },
        { labelRu: "Резкая перепалка с другом", ok: true },
        { labelRu: "Описать коллегу на встрече", ok: false },
        { labelRu: "Обратиться к незнакомому человеку", ok: false },
      ],
      whyRu: "Это прямые оскорбления. Даже в шутку они могут обидеть. Если хочешь описать поступок без ярлыка, скажи That was reckless или That was a stupid thing to do.",
      register: "veryCasual",
      teaches: ["moron", "douchebag"],
    },
  ],
};

const cycleFourCheck: TrackLesson = {
  id: "cycle-four-check",
  kind: "review",
  title: "Check yourself: fourth cycle",
  titleRu: "Проверь себя: четвёртый цикл",
  subtitleRu: "Выражения из твоих записей вперемешку",
  review: true,
  steps: [
    {
      kind: "match",
      id: "cycle-four-match",
      promptRu: "Соедини выражение и его смысл",
      pairs: [["idk", "не знаю"], ["btw", "кстати"], ["all ears", "весь во внимании"], ["badass", "крутой"]],
      teaches: ["idk", "btw", "all ears", "badass"],
    },
    {
      kind: "choice",
      id: "cycle-four-choice",
      prompt: "Which idiom means to annoy someone?",
      promptRu: "Какая идиома значит «действовать на нервы»?",
      options: ["get under someone's skin", "lie low", "cut corners", "break a leg"],
      answer: 0,
      whyRu: "get under someone's skin — раздражать, действовать на нервы.",
      teaches: ["get under someone's skin"],
    },
    {
      kind: "gap",
      id: "cycle-four-gap",
      promptRu: "Вставь сокращение: «Кстати, я уже дома»",
      before: "",
      after: ", I'm already home",
      answers: ["btw", "by the way"],
      teaches: ["btw"],
    },
    {
      kind: "type",
      id: "cycle-four-type",
      promptRu: "Напиши идиому: «затаиться», «не высовываться»",
      hint: "lie",
      answers: ["lie low"],
      teaches: ["lie low"],
    },
    {
      kind: "choice",
      id: "cycle-four-register",
      prompt: "Which expression is safe in a work email?",
      promptRu: "Что уместно в рабочем письме?",
      options: ["by the way", "idgaf", "douchebag", "moron"],
      answer: 0,
      whyRu: "by the way — нейтральное «кстати». Остальные варианты грубые или оскорбительные.",
      teaches: ["btw"],
    },
  ],
};

const chatUncertainty: TrackLesson = {
  id: "chat-uncertainty",
  kind: "chat",
  title: "Say you do not know or disagree",
  titleRu: "Не знать, сомневаться и возражать",
  subtitleRu: "no idea · never mind · I don't think so · what are you talking about",
  steps: [
    {
      kind: "rule",
      id: "chat-uncertainty-rule",
      title: "Four complete replies for a chat",
      titleRu: "Четыре готовых ответа",
      body: "These natural replies let you admit uncertainty, cancel a request, disagree and ask what somebody means.",
      bodyRu: "Эти реплики помогают признать, что ты не знаешь ответа, отменить просьбу, не согласиться или переспросить собеседника. Их можно запомнить целиком.",
      forms: [
        { short: "I have no idea", long: "I don't know", noteRu: "«Понятия не имею». Естественнее в разговоре, чем постоянное I don't know." },
        { short: "never mind", long: "forget it", noteRu: "«Не важно», «забудь». В сообщениях сокращается до nvm." },
        { short: "I don't think so", long: "I doubt it / I disagree", noteRu: "«Не думаю», «по-моему, нет»." },
        { short: "what are you talking about", long: "I do not understand what you mean", noteRu: "«Ты о чём?» Может звучать резко при агрессивной интонации." },
      ],
    },
    {
      kind: "chat",
      id: "chat-uncertainty-chat",
      title: "A confusing message gets cleared up",
      titleRu: "Непонятное сообщение",
      withWhom: "Steve",
      withWhomRu: "Стив",
      lines: [
        { text: "did you take the blue notebook?", at: "16:18" },
        { me: true, text: "I have no idea where it is. what are you talking about?", at: "16:19", glossRu: "I have no idea — понятия не имею · what are you talking about — ты о чём?" },
        { text: "never mind, it was under my bag", at: "16:19", glossRu: "never mind — не важно, уже разобрался" },
        { text: "I thought you'd be angry", at: "16:20" },
        { me: true, text: "I don't think so. I'm just confused", at: "16:20", glossRu: "I don't think so — по-моему, нет" },
      ],
    },
    {
      kind: "choice",
      id: "chat-uncertainty-choice",
      prompt: "Which phrase means I don't know?",
      promptRu: "Что значит «понятия не имею»?",
      options: ["I have no idea", "I don't think so", "never mind", "I'm all ears"],
      answer: 0,
      whyRu: "I have no idea — разговорный способ сказать, что ты совсем не знаешь ответа.",
      teaches: ["I have no idea"],
    },
    {
      kind: "match",
      id: "chat-uncertainty-match",
      promptRu: "Соедини реплику и её смысл",
      pairs: [["I have no idea", "понятия не имею"], ["never mind", "не важно"], ["I don't think so", "по-моему, нет"], ["what are you talking about", "ты о чём?"]],
      teaches: ["I have no idea", "never mind", "I don't think so", "what are you talking about"],
    },
    {
      kind: "gap",
      id: "chat-uncertainty-gap",
      promptRu: "Вставь реплику: «Не важно, я уже нашёл»",
      before: "",
      after: ", I already found it",
      answers: ["never mind", "nvm"],
      teaches: ["never mind"],
    },
  ],
};

const idiomDecisions: TrackLesson = {
  id: "idiom-decisions",
  kind: "idiom",
  title: "Change a decision, calm down and get the best view",
  titleRu: "Передумать, остыть и занять лучшие места",
  subtitleRu: "change my mind · cool off · best seats in the house",
  steps: [
    {
      kind: "rule",
      id: "idiom-decisions-rule",
      title: "Three fixed expressions from conversation",
      titleRu: "Три устойчивых выражения",
      body: "These forms describe a new decision, time to calm down and seats with the best view.",
      bodyRu: "Эти выражения пригодятся, когда ты изменил решение, хочешь предложить паузу или описываешь места с лучшим обзором.",
      forms: [
        { short: "change my mind", long: "make a different decision", noteRu: "«Передумать». Для другого человека: change his / her / their mind." },
        { short: "cool off", long: "calm down after anger or excitement", noteRu: "«Остыть», «успокоиться», «взять паузу»." },
        { short: "the best seats in the house", long: "the seats with the best view", noteRu: "«Лучшие места в зале», часто места в первом ряду." },
      ],
    },
    {
      kind: "chat",
      id: "idiom-decisions-chat",
      title: "A change of plan",
      titleRu: "Планы изменились",
      withWhom: "Dustin",
      withWhomRu: "Дастин",
      lines: [
        { text: "I thought you weren't coming to the show", at: "19:07" },
        { me: true, text: "I changed my mind. and I got us the best seats in the house", at: "19:08", glossRu: "changed my mind — передумал · best seats — лучшие места" },
        { text: "amazing! I need to cool off after that argument anyway", at: "19:08", glossRu: "cool off — остыть, успокоиться" },
      ],
    },
    {
      kind: "choice",
      id: "idiom-decisions-choice",
      prompt: "What happened when you changed your mind?",
      promptRu: "Что произошло, если ты changed your mind?",
      options: ["Ты передумал", "Ты разозлился", "Ты занял лучшее место", "Ты всё забыл"],
      answer: 0,
      whyRu: "change your mind — изменить своё решение или мнение, передумать.",
      teaches: ["change my mind"],
    },
    {
      kind: "match",
      id: "idiom-decisions-match",
      promptRu: "Соедини выражение и его смысл",
      pairs: [["change my mind", "передумать"], ["cool off", "остыть, успокоиться"], ["the best seats in the house", "лучшие места в зале"], ["lie low", "затаиться"]],
      teaches: ["change my mind", "cool off", "the best seats in the house"],
    },
    {
      kind: "gap",
      id: "idiom-decisions-gap",
      promptRu: "Вставь выражение: «Мне нужно остыть»",
      before: "I need to ",
      after: " before we continue this conversation",
      answers: ["cool off"],
      teaches: ["cool off"],
    },
  ],
};

const speechInsults: TrackLesson = {
  id: "speech-insults",
  kind: "speech",
  title: "Recognise strong insults without using them blindly",
  titleRu: "Понимать жёсткие оскорбления",
  subtitleRu: "jackass · dumbass · bastard · son of a bitch",
  steps: [
    {
      kind: "rule",
      id: "speech-insults-rule",
      title: "These are not neutral words",
      titleRu: "Эти слова всегда несут сильный заряд",
      body: "All four expressions can insult a person. son of a bitch can also express anger about a situation. Learn to recognise them before deciding whether to say them.",
      bodyRu: "Все четыре выражения могут оскорбить человека. son of a bitch иногда выражает злость из-за ситуации, а не адресовано человеку. Сначала научись узнавать их в речи — употреблять вслепую не нужно.",
      forms: [
        { short: "jackass", long: "a stupid or annoying person", noteRu: "«Придурок», «идиот». Грубо." },
        { short: "dumbass", long: "a stupid person", noteRu: "«Тупица». Грубое оскорбление." },
        { short: "bastard", long: "a cruel or unpleasant person", noteRu: "«Ублюдок», «сволочь». Очень сильно." },
        { short: "son of a bitch", long: "an insult or an angry exclamation", noteRu: "«Сукин сын» или «чёрт, вот дерьмо» по ситуации. Очень грубо." },
      ],
    },
    {
      kind: "chat",
      id: "speech-insults-chat",
      title: "An argument in a series",
      titleRu: "Перепалка как в сериале",
      withWhom: "Eddie",
      withWhomRu: "Эдди",
      lines: [
        { text: "that jackass took my bike without asking", at: "23:18", glossRu: "jackass — придурок" },
        { me: true, text: "what a dumbass. did he crash it?", at: "23:18", glossRu: "dumbass — тупица" },
        { text: "yes. the bastard didn't even apologise", at: "23:19", glossRu: "bastard — ублюдок, очень грубо" },
        { me: true, text: "son of a bitch. is it damaged?", at: "23:19", glossRu: "здесь это восклицание злости о ситуации" },
      ],
    },
    {
      kind: "choice",
      id: "speech-insults-choice",
      prompt: "What is son of a bitch in the last line?",
      promptRu: "Что выражает son of a bitch в последней реплике?",
      options: ["Злость из-за ситуации", "Нейтральный вопрос", "Комплимент другу", "Просьбу повторить"],
      answer: 0,
      whyRu: "Здесь это восклицание злости, а не буквальное описание человека. Контекст меняет употребление, но выражение остаётся очень грубым.",
      teaches: ["son of a bitch"],
    },
    {
      kind: "match",
      id: "speech-insults-match",
      promptRu: "Соедини выражение и его смысл",
      pairs: [["jackass", "придурок"], ["dumbass", "тупица"], ["bastard", "ублюдок, сволочь"], ["son of a bitch", "сукин сын / грубое восклицание"]],
      teaches: ["jackass", "dumbass", "bastard", "son of a bitch"],
    },
    {
      kind: "register",
      id: "speech-insults-register",
      phrase: "bastard / son of a bitch",
      rooms: [
        { labelRu: "Понимать жёсткую сцену в фильме", ok: true },
        { labelRu: "Очень грубая ссора", ok: true },
        { labelRu: "Разговор с преподавателем", ok: false },
        { labelRu: "Нейтральный рассказ о человеке", ok: false },
      ],
      whyRu: "Эти выражения полезно знать для понимания фильмов, но в обычном общении они могут сразу разрушить разговор. Нейтрально о поступке: That was cruel или That was unacceptable.",
      register: "veryCasual",
      teaches: ["bastard", "son of a bitch"],
    },
  ],
};

const cycleFiveCheck: TrackLesson = {
  id: "cycle-five-check",
  kind: "review",
  title: "Check yourself: fifth cycle",
  titleRu: "Проверь себя: пятый цикл",
  subtitleRu: "Сомнения, решения и жёсткие выражения",
  review: true,
  steps: [
    {
      kind: "match",
      id: "cycle-five-match",
      promptRu: "Соедини выражение и его смысл",
      pairs: [["I have no idea", "понятия не имею"], ["never mind", "не важно"], ["change my mind", "передумать"], ["jackass", "придурок"]],
      teaches: ["I have no idea", "never mind", "change my mind", "jackass"],
    },
    {
      kind: "choice",
      id: "cycle-five-choice",
      prompt: "Which phrase means calm down?",
      promptRu: "Какое выражение значит «остыть, успокоиться»?",
      options: ["cool off", "lie low", "cut corners", "get under my skin"],
      answer: 0,
      whyRu: "cool off — остыть после ссоры или сильных эмоций, взять паузу.",
      teaches: ["cool off"],
    },
    {
      kind: "gap",
      id: "cycle-five-gap",
      promptRu: "Вставь реплику: «По-моему, нет»",
      before: "",
      after: ". We agreed on a different time",
      answers: ["I don't think so"],
      teaches: ["I don't think so"],
    },
    {
      kind: "assemble",
      id: "cycle-five-assemble",
      promptRu: "Собери фразу: «Лучшие места в зале»",
      answer: ["the", "best", "seats", "in", "the", "house"],
      extra: ["cool", "mind"],
      teaches: ["the best seats in the house"],
    },
    {
      kind: "choice",
      id: "cycle-five-register",
      prompt: "Which word is usually praise?",
      promptRu: "Какое слово обычно является комплиментом?",
      options: ["badass", "bastard", "dumbass", "moron"],
      answer: 0,
      whyRu: "badass часто выражает восхищение. Остальные слова — оскорбления.",
      teaches: ["badass"],
    },
  ],
};

const chatAnger: TrackLesson = {
  id: "chat-anger",
  kind: "chat",
  title: "Recognise anger and ask for space",
  titleRu: "Злиться и просить оставить в покое",
  subtitleRu: "damn · what the hell · leave me alone · pissed off",
  steps: [
    {
      kind: "rule",
      id: "chat-anger-rule",
      title: "Four lines charged with emotion",
      titleRu: "Четыре эмоциональные реплики",
      body: "These expressions show frustration, disbelief and anger. Tone can make the same words sound playful or aggressive.",
      bodyRu: "Эти выражения передают досаду, недоумение и злость. Одна и та же фраза может быть шуткой или агрессией — всё решают интонация и ситуация.",
      forms: [
        { short: "damn", long: "an exclamation of frustration or surprise", noteRu: "«Чёрт», «вот блин». Грубовато, но не самое сильное." },
        { short: "what the hell", long: "an angry or shocked question", noteRu: "«Какого чёрта?», «что вообще происходит?»" },
        { short: "leave me alone", long: "stop talking to or bothering me", noteRu: "«Оставь меня в покое». Прямая и часто резкая просьба." },
        { short: "pissed off", long: "very angry", noteRu: "«Взбешён», «сильно раздражён». Грубее, чем angry." },
      ],
    },
    {
      kind: "chat",
      id: "chat-anger-chat",
      title: "Somebody has had enough",
      titleRu: "Терпение закончилось",
      withWhom: "Jonathan",
      withWhomRu: "Джонатан",
      lines: [
        { text: "damn, someone scratched my car again", at: "17:44", glossRu: "damn — чёрт" },
        { me: true, text: "what the hell? was it there this morning?", at: "17:44", glossRu: "what the hell — какого чёрта" },
        { text: "I'm so pissed off. leave me alone for a minute, okay?", at: "17:45", glossRu: "pissed off — взбешён · leave me alone — оставь в покое" },
      ],
    },
    {
      kind: "choice",
      id: "chat-anger-choice",
      prompt: "How does Jonathan feel?",
      promptRu: "Что чувствует Джонатан?",
      quote: "I'm so pissed off",
      options: ["Он очень зол", "Он очень счастлив", "Он заболел", "Он растерян"],
      answer: 0,
      whyRu: "pissed off — очень зол или сильно раздражён. Это грубее, чем просто angry.",
      teaches: ["pissed off"],
    },
    {
      kind: "match",
      id: "chat-anger-match",
      promptRu: "Соедини реплику и эмоцию",
      pairs: [["damn", "чёрт"], ["what the hell", "какого чёрта"], ["leave me alone", "оставь меня в покое"], ["pissed off", "взбешён"]],
      teaches: ["damn", "what the hell", "leave me alone", "pissed off"],
    },
    {
      kind: "gap",
      id: "chat-anger-gap",
      promptRu: "Вставь реплику: «Оставь меня в покое»",
      before: "",
      after: ". I need some space",
      answers: ["leave me alone"],
      teaches: ["leave me alone"],
    },
  ],
};

const idiomConfrontation: TrackLesson = {
  id: "idiom-confrontation",
  kind: "idiom",
  title: "Reject nonsense and talk about winning",
  titleRu: "Не верить чуши и говорить о победе",
  subtitleRu: "stop selling me that crap · kick someone's butt",
  steps: [
    {
      kind: "rule",
      id: "idiom-confrontation-rule",
      title: "Two direct colloquial expressions",
      titleRu: "Два прямых разговорных выражения",
      body: "stop selling me that crap rejects an obvious lie or excuse. kick someone's butt means to defeat someone decisively, usually not literally.",
      bodyRu: "stop selling me that crap — резкий способ сказать, что ты не веришь оправданиям или лжи. kick someone's butt обычно означает решительно победить, а не буквально ударить.",
      forms: [
        { short: "stop selling me that crap", long: "stop trying to make me believe nonsense", noteRu: "«Хватит впаривать мне эту чушь». Очень резко." },
        { short: "kick someone's butt", long: "defeat someone decisively", noteRu: "«Надрать кому-то зад», «разгромить». Часто об игре или соревновании." },
      ],
    },
    {
      kind: "chat",
      id: "idiom-confrontation-chat",
      title: "No patience for excuses",
      titleRu: "Оправдания больше не работают",
      withWhom: "Lucas",
      withWhomRu: "Лукас",
      lines: [
        { text: "I couldn't call because my phone was abducted by aliens", at: "21:02" },
        { me: true, text: "stop selling me that crap. you were playing all night", at: "21:03", glossRu: "не верю этой чуши" },
        { text: "okay, fine. but I kicked everyone's butt", at: "21:03", glossRu: "kicked everyone's butt — всех разгромил" },
      ],
    },
    {
      kind: "choice",
      id: "idiom-confrontation-choice",
      prompt: "What does kick someone's butt mean here?",
      promptRu: "Что значит kick someone's butt в разговоре об игре?",
      options: ["Разгромить соперника", "Буквально ударить", "Позвать на помощь", "Сдаться"],
      answer: 0,
      whyRu: "В разговоре об игре или соревновании kick someone's butt — решительно победить, разгромить.",
      teaches: ["kick someone's butt"],
    },
    {
      kind: "match",
      id: "idiom-confrontation-match",
      promptRu: "Соедини выражение и его смысл",
      pairs: [["stop selling me that crap", "хватит впаривать чушь"], ["kick someone's butt", "разгромить"], ["cool off", "остыть"], ["cut corners", "халтурить"]],
      teaches: ["stop selling me that crap", "kick someone's butt"],
    },
    {
      kind: "register",
      id: "idiom-confrontation-register",
      phrase: "stop selling me that crap",
      rooms: [
        { labelRu: "Резкий спор с близким человеком", ok: true },
        { labelRu: "Понять конфликт в сериале", ok: true },
        { labelRu: "Сомневаться в словах клиента", ok: false },
        { labelRu: "Не согласиться на деловой встрече", ok: false },
      ],
      whyRu: "Фраза звучит обвиняюще и грубо. Нейтральнее сказать I don't think that's true или That doesn't sound right.",
      register: "veryCasual",
      teaches: ["stop selling me that crap"],
    },
  ],
};

const speechProfanity: TrackLesson = {
  id: "speech-profanity",
  kind: "speech",
  title: "Tell praise, complaints and nonsense apart",
  titleRu: "Ругательства и неожиданный комплимент",
  subtitleRu: "asshole · bullshit · bitchin' · bitching",
  steps: [
    {
      kind: "rule",
      id: "speech-profanity-rule",
      title: "One letter can change the meaning",
      titleRu: "Одна буква меняет смысл",
      body: "bitchin' is slang for excellent, while bitching usually means complaining. asshole is an insult and bullshit means nonsense or lies.",
      bodyRu: "bitchin' — разговорное «офигенно», а bitching обычно означает «ныть, жаловаться». asshole — оскорбление, bullshit — «чушь» или «враньё». Ударение на интонацию и написание здесь особенно важны.",
      forms: [
        { short: "asshole", long: "an offensive name for a nasty person", noteRu: "«Мудила», «придурок». Очень грубое оскорбление." },
        { short: "bullshit", long: "nonsense or lies", noteRu: "«Чушь», «бред», «враньё». Вульгарно." },
        { short: "bitchin'", long: "excellent, awesome", noteRu: "«Офигенно», «круто». Сленг, часто пишется без финальной g." },
        { short: "bitching", long: "complaining", noteRu: "«Ныть», «жаловаться»: He's always bitching about work." },
      ],
    },
    {
      kind: "chat",
      id: "speech-profanity-chat",
      title: "Praise and complaints in one conversation",
      titleRu: "Похвала и жалобы в одном разговоре",
      withWhom: "Argyle",
      withWhomRu: "Аргайл",
      lines: [
        { text: "the concert last night was bitchin'", at: "00:16", glossRu: "bitchin' — было офигенно" },
        { me: true, text: "yeah, but Mike kept bitching about the crowd", at: "00:17", glossRu: "kept bitching — всё ныл" },
        { text: "he's just being an asshole", at: "00:17", glossRu: "asshole — грубое оскорбление" },
        { me: true, text: "and his story about backstage was total bullshit", at: "00:18", glossRu: "bullshit — чушь, враньё" },
      ],
    },
    {
      kind: "choice",
      id: "speech-profanity-choice",
      prompt: "What does bitchin' mean in this context?",
      promptRu: "Что значит bitchin' в этой фразе?",
      quote: "The concert was bitchin'",
      options: ["Концерт был офигенный", "На концерте все ныли", "Концерт отменили", "Концерт был скучный"],
      answer: 0,
      whyRu: "bitchin' в неформальной речи означает excellent, awesome — «офигенно». Не путай с bitching — «ныть».",
      teaches: ["bitchin'"],
    },
    {
      kind: "match",
      id: "speech-profanity-match",
      promptRu: "Соедини слово и его смысл",
      pairs: [["asshole", "грубое оскорбление"], ["bullshit", "чушь, враньё"], ["bitchin'", "офигенно"], ["bitching", "ныть, жаловаться"]],
      teaches: ["asshole", "bullshit", "bitchin'", "bitching"],
    },
    {
      kind: "register",
      id: "speech-profanity-register",
      phrase: "bullshit / asshole",
      rooms: [
        { labelRu: "Грубый разговор взрослых друзей", ok: true },
        { labelRu: "Понимать реплики в сериале", ok: true },
        { labelRu: "Обсуждение на уроке", ok: false },
        { labelRu: "Деловая переписка", ok: false },
      ],
      whyRu: "Оба слова вульгарные. Вместо bullshit в нейтральной речи можно сказать nonsense или untrue, а вместо оскорбления описать конкретный поступок.",
      register: "veryCasual",
      teaches: ["bullshit", "asshole"],
    },
  ],
};

const cycleSixCheck: TrackLesson = {
  id: "cycle-six-check",
  kind: "review",
  title: "Check yourself: sixth cycle",
  titleRu: "Проверь себя: шестой цикл",
  subtitleRu: "Финальная проверка выражений с фотографий",
  review: true,
  steps: [
    {
      kind: "match",
      id: "cycle-six-match",
      promptRu: "Соедини выражение и его смысл",
      pairs: [["damn", "чёрт"], ["leave me alone", "оставь в покое"], ["kick someone's butt", "разгромить"], ["bitchin'", "офигенно"]],
      teaches: ["damn", "leave me alone", "kick someone's butt", "bitchin'"],
    },
    {
      kind: "choice",
      id: "cycle-six-choice",
      prompt: "Which word means very angry?",
      promptRu: "Какое слово значит «взбешён»?",
      options: ["pissed off", "all ears", "badass", "on cloud nine"],
      answer: 0,
      whyRu: "pissed off — сильно раздражён или взбешён. Это грубее, чем angry.",
      teaches: ["pissed off"],
    },
    {
      kind: "gap",
      id: "cycle-six-gap",
      promptRu: "Вставь слово: «Это полная чушь»",
      before: "That's total ",
      after: ". It never happened",
      answers: ["bullshit"],
      teaches: ["bullshit"],
    },
    {
      kind: "choice",
      id: "cycle-six-contrast",
      prompt: "He keeps bitching about work. What is he doing?",
      promptRu: "Что делает человек в фразе He keeps bitching about work?",
      options: ["Постоянно жалуется на работу", "Восхищается работой", "Работает очень круто", "Увольняется"],
      answer: 0,
      whyRu: "bitching здесь — «ныть, жаловаться». А bitchin' в другом контексте может значить «офигенно».",
      teaches: ["bitching"],
    },
    {
      kind: "choice",
      id: "cycle-six-review",
      prompt: "Which reply means I don't know?",
      promptRu: "Какая реплика значит «понятия не имею»?",
      options: ["I have no idea", "what the hell", "leave me alone", "stop selling me that crap"],
      answer: 0,
      whyRu: "I have no idea — естественный разговорный способ сказать, что ты не знаешь ответа.",
      teaches: ["I have no idea"],
    },
  ],
};

export const trackModules: TrackModule[] = [
  {
    id: "slang-path",
    title: "Your slang path",
    titleRu: "Твой путь",
    subtitle: "Messaging, idioms and natural speech, one short lesson at a time.",
    subtitleRu: "Переписка, идиомы и живая речь — по одному короткому уроку за раз.",
    tone: "mint",
    lessons: [
      chatBasics,
      idiomBasics,
      speechReactions,
      cycleOneCheck,
      chatPlans,
      idiomPeople,
      speechBoundaries,
      cycleTwoCheck,
      chatHonesty,
      idiomFeelings,
      speechReductions,
      cycleThreeCheck,
      chatNotes,
      idiomActions,
      speechLabels,
      cycleFourCheck,
      chatUncertainty,
      idiomDecisions,
      speechInsults,
      cycleFiveCheck,
      chatAnger,
      idiomConfrontation,
      speechProfanity,
      cycleSixCheck,
    ],
  },
];

export function trackLessons(): { module: TrackModule; lesson: TrackLesson }[] {
  return trackModules.flatMap((module) => module.lessons.map((lesson) => ({ module, lesson })));
}

export function findLesson(id: string) {
  return trackLessons().find((entry) => entry.lesson.id === id) ?? null;
}
