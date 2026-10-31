import { cycle, type ExpressionSpec, type LessonSpec } from "./trackModel";

function e(
  short: string,
  meaningRu: string,
  noteRu: string,
  wrong: [string, string],
  before: string,
  after: string,
  translationRu: string,
  translationEn: string[],
  aliases?: string[],
): ExpressionSpec {
  return { short, meaningRu, noteRu, wrong, before, after, translationRu, translationEn, aliases };
}

const chatHonesty: LessonSpec = {
  id: "chat-honesty",
  kind: "chat",
  title: "Be direct in a chat",
  titleRu: "Говорить прямо в переписке",
  subtitleRu: "idgaf · tbh",
  ruleTitleRu: "Два сокращения для честного ответа",
  introRu: "Так пишут близким друзьям, когда не хотят смягчать реакцию. Сначала — честное мнение, затем — насколько сильно тебе всё равно.",
  withWhomRu: "Майя",
  lines: [
    { text: "Did you tell Max his joke wasn't funny?", at: "21:04" },
    { me: true, text: "Yeah. tbh, it was awkward.", at: "21:04", glossRu: "tbh — честно говоря" },
    { text: "He looks annoyed.", at: "21:05" },
    { me: true, text: "idgaf.", at: "21:05", glossRu: "idgaf — мне абсолютно наплевать; очень грубо" },
  ],
  expressions: [
    e("idgaf", "мне абсолютно наплевать", "I don't give a fuck. Очень грубо: для близких друзей, не для работы и незнакомых людей.", ["я не понимаю", "мне очень нравится"], "He can hate my posts. ", "", "Мне наплевать, что он думает.", ["idgaf what he thinks", "I don't give a fuck what he thinks"], ["I don't give a fuck"]),
    e("tbh", "честно говоря", "To be honest. Нейтральное разговорное сокращение для сообщений.", ["кстати", "я не знаю"], "", ", I didn't like his attitude.", "Честно говоря, я не шучу.", ["tbh, I'm not joking", "tbh I'm not joking", "to be honest, I'm not joking"], ["to be honest"]),
  ],
  scenario: {
    promptRu: "Выбери самый прямой и грубый ответ",
    quote: "Друг спрашивает: «Тебя правда совершенно не волнует его мнение?»",
    options: ["idgaf.", "btw.", "idk."],
    answer: 0,
    whyRu: "idgaf прямо передаёт «мне наплевать». Это намеренно грубый ответ, поэтому важно понимать обстановку.",
  },
};

const idiomBasics: LessonSpec = {
  id: "idiom-basics",
  kind: "idiom",
  title: "Luck and easy tasks",
  titleRu: "Пожелать удачи и назвать задачу лёгкой",
  subtitleRu: "break a leg · a piece of cake",
  ruleTitleRu: "Две идиомы, которые нельзя переводить дословно",
  introRu: "Break a leg не связано с переломом, а a piece of cake — не всегда про торт. Запоминай каждую идиому целиком, как одно выражение.",
  withWhomRu: "Лена",
  lines: [
    { text: "My presentation starts in five minutes!", at: "10:55" },
    { me: true, text: "Break a leg! You'll be great.", at: "10:55", glossRu: "Break a leg! — Удачи!" },
    { text: "Thanks! Is the demo difficult?", at: "10:56" },
    { me: true, text: "No, it's a piece of cake.", at: "10:56", glossRu: "a piece of cake — проще простого" },
  ],
  expressions: [
    e("break a leg", "удачи, ни пуха ни пера", "Традиционное пожелание удачи, особенно перед выступлением.", ["сломай ногу", "отдохни немного"], "Your performance starts now. ", "!", "Удачи на выступлении!", ["break a leg on stage", "break a leg"]),
    e("a piece of cake", "проще простого", "Так называют задачу, которую легко выполнить.", ["кусок торта", "очень сложная задача"], "Don't worry about the test. It's ", ".", "Этот тест — проще простого.", ["this test is a piece of cake", "the test is a piece of cake"]),
  ],
  reviewPairs: [["tbh", "честно говоря"]],
  scenario: {
    promptRu: "Что ответить другу перед выступлением?",
    quote: "«Я ужасно нервничаю. Через минуту выхожу на сцену».",
    options: ["Break a leg!", "You're off the hook.", "I'm all ears."],
    answer: 0,
    whyRu: "Break a leg — естественное пожелание удачи перед выступлением.",
  },
};

const speechTeasing: LessonSpec = {
  id: "speech-teasing",
  kind: "speech",
  title: "Tease and complain",
  titleRu: "Поддеть друга и пожаловаться на вещь",
  subtitleRu: "dumbass · piece of shit",
  ruleTitleRu: "Живой сленг с сильным оттенком",
  introRu: "Dumbass называет человека идиотом. A piece of shit может описывать ужасную вещь, а про человека звучит как очень сильное оскорбление. Оба выражения грубые.",
  withWhomRu: "Бен",
  lines: [
    { text: "Bro, you walked right past the exit.", at: "18:20" },
    { me: true, text: "I'm such a dumbass. I didn't see it.", at: "18:20", glossRu: "dumbass — идиот; здесь говорящий поддевает сам себя" },
    { text: "And why does your controller keep disconnecting?", at: "18:21" },
    { me: true, text: "Because it's a piece of shit.", at: "18:21", glossRu: "a piece of shit — отвратительная вещь" },
  ],
  expressions: [
    e("dumbass", "идиот, тупица", "Грубое обращение к человеку. Между друзьями может звучать как поддразнивание, но легко обидеть.", ["гений", "храбрец"], "I forgot my own password. I'm such a ", ".", "Я забыл ключи. Ну я и идиот.", ["I forgot my keys. I'm such a dumbass", "I forgot my keys, I'm such a dumbass"]),
    e("piece of shit", "отвратительная вещь, дерьмо", "О вещи — «полное дерьмо». О человеке — крайне оскорбительно.", ["отличная вещь", "кусок торта"], "This cheap mouse is a ", ".", "Этот ноутбук — полное дерьмо.", ["this laptop is a piece of shit", "the laptop is a piece of shit"], ["a piece of shit"]),
  ],
  reviewPairs: [["a piece of cake", "проще простого"]],
  scenario: {
    promptRu: "Выбери выражение, которое подходит именно вещи",
    quote: "«Эта мышь постоянно отключается. Она просто ужасная».",
    options: ["It's a piece of shit.", "It's a dumbass.", "It's all ears."],
    answer: 0,
    whyRu: "A piece of shit может описывать неработающую вещь. Dumbass относится к человеку.",
  },
};

const chatNotes: LessonSpec = {
  id: "chat-notes",
  kind: "chat",
  title: "Use common chat shorthand",
  titleRu: "Сокращения из настоящих сообщений",
  subtitleRu: "idk · aka · btw",
  ruleTitleRu: "Три сокращения, которые везде в чатах",
  introRu: "Idk помогает быстро ответить, aka уточняет имя или прозвище, а btw добавляет побочную мысль. Все три пишут строчными в неформальной переписке.",
  withWhomRu: "Алекс",
  lines: [
    { text: "Do you know Alex, aka the guy from my old job?", at: "12:10", glossRu: "aka — также известный как" },
    { me: true, text: "Yeah, but idk his new number.", at: "12:11", glossRu: "idk — я не знаю" },
    { text: "No problem. btw, he's coming tonight.", at: "12:11", glossRu: "btw — кстати" },
  ],
  expressions: [
    e("idk", "я не знаю", "I don't know. Одно из самых частых сокращений в личных сообщениях.", ["мне всё равно", "я согласен"], "", ", where she went.", "Я не знаю, где он.", ["idk where he is", "I don't know where he is"], ["I don't know"]),
    e("aka", "также известный как", "Also known as. Ставится перед вторым именем, прозвищем или пояснением.", ["кстати", "например"], "Maya, ", " the girl from my class, is here.", "Макс, также известный как наш лучший игрок, уже здесь.", ["Max, aka our best player, is here", "Max aka our best player is here"], ["also known as"]),
    e("btw", "кстати", "By the way. Вводит дополнительную или слегка меняющую тему мысль.", ["честно говоря", "прямо сейчас"], "", ", are you free tomorrow?", "Кстати, ты свободен сегодня вечером?", ["btw, are you free tonight", "btw are you free tonight", "by the way, are you free tonight"], ["by the way"]),
  ],
  reviewPairs: [["idgaf", "мне абсолютно наплевать"]],
  scenario: {
    promptRu: "Как начать сообщение с дополнительной мысли?",
    quote: "Ты уже договорился о встрече и хочешь добавить: «Кстати, возьми зарядку».",
    options: ["btw, bring a charger.", "aka, bring a charger.", "idk, bring a charger."],
    answer: 0,
    whyRu: "Btw означает «кстати» и естественно вводит дополнительную мысль.",
  },
};

const idiomActions: LessonSpec = {
  id: "idiom-actions",
  kind: "idiom",
  title: "Listen and get annoyed",
  titleRu: "Слушать внимательно и действовать на нервы",
  subtitleRu: "all ears · get under someone's skin",
  ruleTitleRu: "Внимание и раздражение — без дословного перевода",
  introRu: "I'm all ears означает полную готовность слушать. If something gets under your skin, оно раздражает сильнее, чем ты хотел бы показать.",
  withWhomRu: "Ник",
  lines: [
    { text: "Can I tell you what happened yesterday?", at: "09:15" },
    { me: true, text: "Sure, I'm all ears.", at: "09:15", glossRu: "I'm all ears — я внимательно слушаю" },
    { text: "It's about Dan's constant humming.", at: "09:16" },
    { me: true, text: "Oh, that gets under my skin too.", at: "09:16", glossRu: "get under my skin — действовать мне на нервы" },
  ],
  expressions: [
    e("all ears", "внимательно слушаю, весь во внимании", "Обычно говорят I'm all ears в ответ на предложение что-то рассказать.", ["не слушаю", "оглох"], "Tell me everything. I'm ", ".", "Рассказывай, я внимательно слушаю.", ["tell me, I'm all ears", "go ahead, I'm all ears"]),
    e("get under someone's skin", "действовать кому-то на нервы", "В речи меняется местоимение: my, your, his, her, their skin.", ["спрятаться под кожу", "кого-то вдохновить"], "His constant complaints really ", ".", "Его шутки действуют мне на нервы.", ["his jokes get under my skin", "his jokes really get under my skin"], ["get under my skin", "gets under my skin"]),
  ],
  reviewPairs: [["btw", "кстати"], ["break a leg", "удачи, ни пуха ни пера"]],
  scenario: {
    promptRu: "Что сказать, если ты готов выслушать историю?",
    quote: "Подруга: «У меня есть для тебя новость. Ты сейчас можешь поговорить?»",
    options: ["I'm all ears.", "I'm on edge.", "I'm off the hook."],
    answer: 0,
    whyRu: "I'm all ears — дружелюбный способ сказать «рассказывай, я слушаю».",
  },
};

const speechReactions: LessonSpec = {
  id: "speech-reactions",
  kind: "speech",
  title: "React to surprising news",
  titleRu: "Реагировать на смешное и неожиданное",
  subtitleRu: "I'm dead · no way · that's wild",
  ruleTitleRu: "Три реакции, которые оживляют разговор",
  introRu: "I'm dead часто означает «я умираю со смеху». No way выражает удивление, а that's wild подчёркивает, насколько ситуация странная или невероятная.",
  withWhomRu: "Оскар",
  lines: [
    { text: "Our teacher came to class in a dinosaur costume.", at: "14:02" },
    { me: true, text: "No way!", at: "14:02", glossRu: "No way! — Не может быть!" },
    { text: "And he roared instead of saying hello.", at: "14:03" },
    { me: true, text: "I'm dead. That's wild.", at: "14:03", glossRu: "I'm dead — я умираю со смеху; that's wild — ну и невероятно" },
  ],
  expressions: [
    e("I'm dead", "я умираю со смеху", "В сообщениях и разговоре — реакция на что-то очень смешное, а не сообщение об опасности.", ["я устал", "мне грустно"], "That video was hilarious. ", ".", "Я умираю со смеху, это так смешно.", ["I'm dead, that's so funny", "I'm dead. That's so funny"]),
    e("no way", "не может быть, да ладно", "Может выражать удивление или категоричный отказ — интонация решает многое.", ["конечно", "я знал"], "He won again? ", "!", "Он сказал это тебе? Да ладно!", ["he told you that? No way", "he told you that? no way!"]),
    e("that's wild", "это невероятно, вот это да", "Реакция на странную, шокирующую или неожиданную ситуацию.", ["это скучно", "это нормально"], "She moved to another country overnight? ", ".", "Он купил пять котов? Это невероятно.", ["he bought five cats? That's wild", "he bought five cats? that's wild"]),
  ],
  reviewPairs: [["idk", "я не знаю"], ["dumbass", "идиот, тупица"]],
  scenario: {
    promptRu: "Выбери реакцию на очень смешное видео",
    quote: "Друг прислал ролик, из-за которого ты буквально не можешь перестать смеяться.",
    options: ["I'm dead.", "I'm all ears.", "I'm off the hook."],
    answer: 0,
    whyRu: "В разговорном английском I'm dead часто означает «я умираю со смеху».",
  },
};

const chatBasics: LessonSpec = {
  id: "chat-basics",
  kind: "chat",
  title: "Make plans in short messages",
  titleRu: "Договариваться короткими сообщениями",
  subtitleRu: "wyd · lmk · nvm",
  ruleTitleRu: "Планы без длинной переписки",
  introRu: "Wyd спрашивает, чем человек занят. Lmk просит сообщить ответ позже. Nvm отменяет предыдущую просьбу или вопрос, когда они больше не нужны.",
  withWhomRu: "Сэм",
  lines: [
    { text: "wyd?", at: "17:30", glossRu: "wyd — чем занимаешься?" },
    { me: true, text: "Trying to find my keys.", at: "17:30" },
    { text: "lmk if you need help.", at: "17:31", glossRu: "lmk — дай мне знать" },
    { me: true, text: "nvm, they were in my bag.", at: "17:32", glossRu: "nvm — неважно, помощь уже не нужна" },
  ],
  expressions: [
    e("wyd", "чем занимаешься", "What are you doing. Короткий вопрос другу, часто служит началом разговора.", ["куда идёшь", "что случилось"], "", " tonight?", "Чем занимаешься сейчас?", ["wyd rn", "wyd", "what are you doing right now"], ["what are you doing"]),
    e("lmk", "дай мне знать", "Let me know. Просьба сообщить решение или новость позже.", ["не говори мне", "позвони мне"], "", " if you can come.", "Дай мне знать, если освободишься.", ["lmk if you're free", "let me know if you're free"], ["let me know"]),
    e("nvm", "неважно, уже не нужно", "Never mind. Отменяет предыдущий вопрос или просьбу, а не выражает «ничего страшного» в любой ситуации.", ["спасибо", "никогда"], "", ", I found it.", "Неважно, я уже всё понял.", ["nvm, I figured it out", "never mind, I figured it out"], ["never mind"]),
  ],
  reviewPairs: [["no way", "не может быть, да ладно"]],
  scenario: {
    promptRu: "Выбери уместное использование nvm",
    quote: "Ты попросил друга найти ссылку, но через секунду нашёл её сам.",
    options: ["nvm, I found it.", "nvm, thanks for the link.", "nvm, send it to me."],
    answer: 0,
    whyRu: "Nvm отменяет уже ненужную просьбу. Если друг прислал ссылку, вместо него нужно сказать спасибо.",
  },
};

const idiomPeople: LessonSpec = {
  id: "idiom-people",
  kind: "idiom",
  title: "Agree and remove responsibility",
  titleRu: "Договориться и снять обязанность",
  subtitleRu: "on the same page · off the hook",
  ruleTitleRu: "Когда вы понимаете друг друга и когда ответственность заканчивается",
  introRu: "On the same page означает общее понимание плана. Off the hook — освобождение от обязанности, ответственности или неприятной ситуации.",
  withWhomRu: "Анна",
  lines: [
    { text: "So we present at ten and answer questions after?", at: "08:40" },
    { me: true, text: "Exactly. Just making sure we're on the same page.", at: "08:40", glossRu: "on the same page — одинаково понимаем план" },
    { text: "Do I need to bring the cables?", at: "08:41" },
    { me: true, text: "No, Sam has them. You're off the hook.", at: "08:41", glossRu: "off the hook — тебе это делать не нужно" },
  ],
  expressions: [
    e("on the same page", "одинаково понимать ситуацию или план", "Часто используется с be: we're on the same page.", ["читать одну книгу", "спорить о плане"], "Let's talk again to make sure we're ", ".", "Хорошо, что мы понимаем план одинаково.", ["good, we're on the same page", "it's good that we're on the same page"]),
    e("off the hook", "свободен от обязанности или ответственности", "You're off the hook — тебе больше не нужно это делать или отвечать за это.", ["на телефоне", "в неприятностях"], "You don't have to help anymore. You're ", ".", "Тебе не нужно приходить, ты свободен от этой обязанности.", ["you don't have to come, you're off the hook", "you don't have to come. You're off the hook"]),
  ],
  reviewPairs: [["lmk", "дай мне знать"], ["all ears", "внимательно слушаю, весь во внимании"]],
  scenario: {
    promptRu: "Что сказать перед началом совместной работы?",
    quote: "Ты хочешь убедиться, что все одинаково понимают план.",
    options: ["Let's make sure we're on the same page.", "Let's get off the hook.", "Let's get under their skin."],
    answer: 0,
    whyRu: "On the same page означает одинаковое понимание задачи и договорённостей.",
  },
};

const speechAgreement: LessonSpec = {
  id: "speech-agreement",
  kind: "speech",
  title: "Agree and soften an opinion",
  titleRu: "Согласиться и смягчить мнение",
  subtitleRu: "fair enough · dude · kinda",
  ruleTitleRu: "Три маленьких слова с большим разговорным эффектом",
  introRu: "Fair enough признаёт чужую точку зрения разумной. Dude — неформальное обращение. Kinda смягчает оценку: «немного», «вроде».",
  withWhomRu: "Марк",
  lines: [
    { text: "The movie was kinda slow.", at: "22:10", glossRu: "kinda — немного, слегка" },
    { me: true, text: "Fair enough. I liked the ending though.", at: "22:10", glossRu: "fair enough — логично, справедливо" },
    { text: "You always defend the movies you choose, dude.", at: "22:11", glossRu: "dude — чувак, братан" },
  ],
  expressions: [
    e("fair enough", "логично, справедливо, принято", "Признание, что чужой аргумент разумен, даже если твоё мнение не изменилось.", ["это нечестно", "я полностью согласен"], "You didn't like it? ", ".", "Логично, я понимаю твою точку зрения.", ["fair enough, I see your point", "fair enough. I see your point"]),
    e("dude", "чувак, братан", "Неформальное обращение к человеку, обычно к знакомому. В дружелюбной речи может не зависеть от пола.", ["сэр", "малыш"], "", ", that was awesome.", "Чувак, это было невероятно.", ["dude, that was insane", "dude that was insane"]),
    e("kinda", "немного, слегка, вроде", "Разговорное kind of. Смягчает оценку или описание.", ["точно", "очень сильно"], "The show was ", " boring.", "Фильм был немного странным.", ["the movie was kinda weird", "the film was kinda weird"], ["kind of"]),
  ],
  reviewPairs: [["nvm", "неважно, уже не нужно"], ["I'm dead", "я умираю со смеху"]],
  scenario: {
    promptRu: "Как признать аргумент собеседника разумным?",
    quote: "Ты не полностью согласен, но понимаешь логику другого человека.",
    options: ["Fair enough.", "No way.", "You wish."],
    answer: 0,
    whyRu: "Fair enough означает «логично, принимаю твой аргумент», а не обязательно полное согласие.",
  },
};

const chatPlans: LessonSpec = {
  id: "chat-plans",
  kind: "chat",
  title: "Confirm without long replies",
  titleRu: "Подтверждать без длинных ответов",
  subtitleRu: "fr · bet · ofc",
  ruleTitleRu: "Три коротких способа подтвердить",
  introRu: "Fr усиливает честность утверждения. Bet может заменить «договорились», а ofc — «конечно». Все три звучат неформально и подходят для друзей.",
  withWhomRu: "Джей",
  lines: [
    { text: "Are you coming at seven?", at: "16:05" },
    { me: true, text: "ofc. I already bought the tickets, fr.", at: "16:05", glossRu: "ofc — конечно; fr — правда, серьёзно" },
    { text: "Bet. See you outside the cinema.", at: "16:06", glossRu: "Bet — договорились, окей" },
  ],
  expressions: [
    e("fr", "правда, серьёзно", "For real. Подтверждает искренность или усиливает утверждение.", ["шучу", "возможно"], "I already paid, ", ".", "Я правда всё сделал.", ["I did everything, fr", "I did everything fr", "for real, I did everything"], ["for real"]),
    e("bet", "договорились, окей", "В переписке часто заменяет okay или sure, а не означает буквальную ставку.", ["отказаться", "спорить"], "See you at eight. ", ".", "Договорились, увидимся завтра.", ["bet, see you tomorrow", "bet. See you tomorrow"]),
    e("ofc", "конечно", "Of course. Быстрый дружелюбный ответ в неформальной переписке.", ["вряд ли", "не знаю"], "Can you help me? ", ".", "Конечно, я помогу.", ["ofc, I'll help", "of course, I'll help"], ["of course"]),
  ],
  reviewPairs: [["fair enough", "логично, справедливо, принято"]],
  scenario: {
    promptRu: "Как коротко ответить «договорились»?",
    quote: "Друг предлагает встретиться у кинотеатра в восемь. Тебя всё устраивает.",
    options: ["Bet.", "smh.", "idk."],
    answer: 0,
    whyRu: "Bet здесь означает «окей, договорились», а не «делаю ставку».",
  },
};

const idiomRules: LessonSpec = {
  id: "idiom-rules",
  kind: "idiom",
  title: "Follow rules or cut corners",
  titleRu: "Следовать правилам или халтурить",
  subtitleRu: "by the book · cut corners",
  ruleTitleRu: "Два противоположных подхода к работе",
  introRu: "By the book — строго по правилам. Cut corners — сэкономить время или усилия в ущерб качеству, сделать кое-как.",
  withWhomRu: "Ира",
  lines: [
    { text: "Why is this report taking so long?", at: "11:20" },
    { me: true, text: "I'm doing everything by the book.", at: "11:20", glossRu: "by the book — строго по правилам" },
    { text: "Good. Don't cut corners this time.", at: "11:21", glossRu: "cut corners — схалтурить, сэкономить за счёт качества" },
  ],
  expressions: [
    e("by the book", "строго по правилам", "Do something by the book — выполнить задачу так, как предписано.", ["без правил", "по книге в буквальном смысле"], "The accountant does everything ", ".", "Мы сделали всё строго по правилам.", ["we did everything by the book", "we did it by the book"]),
    e("cut corners", "халтурить, экономить в ущерб качеству", "Обычно содержит негативную оценку: результат страдает из-за сокращения работы.", ["улучшить качество", "обрезать углы"], "They ", " and now the app keeps crashing.", "Не халтурь, когда делаешь этот проект.", ["don't cut corners on this project", "don't cut corners with this project"]),
  ],
  reviewPairs: [["on the same page", "одинаково понимать ситуацию или план"], ["bet", "договорились, окей"]],
  scenario: {
    promptRu: "Что сказать о некачественной работе?",
    quote: "Рабочие сэкономили на материалах, и через неделю всё сломалось.",
    options: ["They cut corners.", "They did it by the book.", "They were all ears."],
    answer: 0,
    whyRu: "Cut corners означает сократить необходимую работу или расходы в ущерб результату.",
  },
};

const speechBoundaries: LessonSpec = {
  id: "speech-boundaries",
  kind: "speech",
  title: "Answer teasing and nonsense",
  titleRu: "Отвечать на подколы и ерунду",
  subtitleRu: "you wish · give me a break",
  ruleTitleRu: "Два дерзких ответа друзьям",
  introRu: "You wish поддевает чью-то несбыточную мечту. Give me a break выражает раздражение или недоверие: «да брось», «хватит нести ерунду».",
  withWhomRu: "Том",
  lines: [
    { text: "One day I'll beat you at this game.", at: "19:40" },
    { me: true, text: "You wish.", at: "19:40", glossRu: "You wish — мечтай, вряд ли" },
    { text: "Hey, I almost won last time!", at: "19:41" },
    { me: true, text: "Give me a break. I wasn't even trying.", at: "19:41", glossRu: "Give me a break — да брось" },
  ],
  expressions: [
    e("you wish", "мечтай, вряд ли", "Дразнящий ответ на завышенные ожидания. Может звучать игриво или снисходительно.", ["я тоже хочу", "поздравляю"], "You think you'll win? ", ".", "Думаешь, я извинюсь? Мечтай.", ["you think I'll apologize? You wish", "you think I'll apologize? you wish"]),
    e("give me a break", "да брось, хватит нести ерунду", "Выражает раздражение или недоверие. Интонация определяет, шутка это или конфликт.", ["помоги мне", "поздравляю"], "You expect me to believe that? ", ".", "Да брось, это неправда.", ["give me a break, that's not true", "give me a break. That's not true"]),
  ],
  reviewPairs: [["fr", "правда, серьёзно"], ["kinda", "немного, слегка, вроде"]],
  scenario: {
    promptRu: "Выбери игривый ответ на хвастовство",
    quote: "Друг, который всегда проигрывает тебе в игру: «Завтра я стану чемпионом мира».",
    options: ["You wish.", "I'm all ears.", "Fair enough."],
    answer: 0,
    whyRu: "You wish подходит для дружеского подкола: «мечтай, конечно».",
  },
};

const chatReactions: LessonSpec = {
  id: "chat-reactions",
  kind: "chat",
  title: "React in real time",
  titleRu: "Реагировать на события в переписке",
  subtitleRu: "rn · ikr · smh",
  ruleTitleRu: "Здесь, согласие и разочарование",
  introRu: "Rn обозначает текущий момент. Ikr передаёт согласие с чужой реакцией. Smh показывает разочарование или недоумение от чужого поступка.",
  withWhomRu: "Ким",
  lines: [
    { text: "Are you busy rn?", at: "13:12", glossRu: "rn — прямо сейчас" },
    { me: true, text: "Yeah, Dan forgot the documents again.", at: "13:12" },
    { text: "ikr, he does this every week. smh.", at: "13:13", glossRu: "ikr — да уж, понимаю; smh — ну и ну" },
  ],
  expressions: [
    e("rn", "прямо сейчас", "Right now. Показывает, что действие происходит в текущий момент.", ["завтра", "недавно"], "I'm at work ", ".", "Я прямо сейчас читаю твоё сообщение.", ["I'm reading your message rn", "I am reading your message rn"], ["right now"]),
    e("ikr", "да уж, вот именно, понимаю", "I know, right. Согласие с реакцией собеседника, а не просто сообщение о знании.", ["я не знал", "ты не прав"], "This place is expensive. ", "?", "Да уж, это было странно.", ["ikr, that was weird", "I know, right? That was weird"], ["I know, right", "I know right"]),
    e("smh", "ну и ну, качая головой", "Shaking my head. Разочарование, недоумение или осуждение чужого поступка.", ["я смеюсь", "я счастлив"], "He lied to us again, ", ".", "Он опять всё забыл. Ну и ну.", ["he forgot everything again, smh", "he forgot everything again smh"], ["shaking my head"]),
  ],
  reviewPairs: [["give me a break", "да брось, хватит нести ерунду"]],
  scenario: {
    promptRu: "Как отреагировать на безответственный поступок?",
    quote: "Коллега третий раз подряд забыл документы, и ты обсуждаешь это с другом.",
    options: ["smh.", "bet.", "aka."],
    answer: 0,
    whyRu: "Smh передаёт разочарование: «ну и ну, просто качая головой».",
  },
};

const idiomFeelings: LessonSpec = {
  id: "idiom-feelings",
  kind: "idiom",
  title: "Talk about happiness",
  titleRu: "Говорить о сильной радости",
  subtitleRu: "over the moon · on cloud nine",
  ruleTitleRu: "Когда обычного happy недостаточно",
  introRu: "Over the moon и on cloud nine описывают сильное счастье и восторг. Обе идиомы естественно звучат в разговоре о хороших новостях.",
  withWhomRu: "Полина",
  lines: [
    { text: "I got the job!", at: "15:08" },
    { me: true, text: "Congratulations! You must be over the moon.", at: "15:08", glossRu: "over the moon — на седьмом небе от счастья" },
    { text: "I am. I've been on cloud nine all day.", at: "15:09", glossRu: "on cloud nine — в полном восторге" },
  ],
  expressions: [
    e("over the moon", "на седьмом небе от счастья", "Обычно be over the moon about something — быть в восторге от чего-то.", ["очень устать", "злиться"], "She was ", " when she heard the news.", "Я на седьмом небе от этой новости.", ["I'm over the moon about this news", "I am over the moon about this news"]),
    e("on cloud nine", "в полном восторге, на седьмом небе", "Близко по смыслу к over the moon; часто используется с be.", ["в растерянности", "в депрессии"], "He has been ", " since the wedding.", "После победы я был на седьмом небе.", ["I was on cloud nine after the win", "I was on cloud nine after the victory"]),
  ],
  reviewPairs: [["rn", "прямо сейчас"], ["cut corners", "халтурить, экономить в ущерб качеству"]],
  scenario: {
    promptRu: "Как описать радость друга?",
    quote: "Друг получил работу мечты и улыбается весь день.",
    options: ["He's over the moon.", "He's on edge.", "He's off the hook."],
    answer: 0,
    whyRu: "Over the moon означает сильную радость и восторг.",
  },
};

const speechComplaints: LessonSpec = {
  id: "speech-complaints",
  kind: "speech",
  title: "Complain and calm someone down",
  titleRu: "Жаловаться, злиться и успокаивать",
  subtitleRu: "chill out · moron · bitching",
  ruleTitleRu: "Когда разговор становится эмоциональным",
  introRu: "Chill out — просьба успокоиться. Moron — грубое «идиот». Bitching — нытьё и жалобы; не путай с bitchin', которое означает «офигенно».",
  withWhomRu: "Дэн",
  lines: [
    { text: "Some moron cut me off on the way home!", at: "18:50", glossRu: "moron — идиот, придурок" },
    { me: true, text: "Chill out. You're home safely now.", at: "18:50", glossRu: "chill out — успокойся" },
    { text: "I'm not bitching, he almost hit my car!", at: "18:51", glossRu: "bitching — нытьё, жалобы" },
  ],
  expressions: [
    e("chill out", "успокойся, расслабься", "Неформальная просьба снизить эмоциональный накал. На обиженного человека может действовать раздражающе.", ["разволнуйся", "поторопись"], "We're fine. Just ", ".", "Успокойся, всё в порядке.", ["chill out, everything is fine", "chill out. Everything is fine"], ["chill"]),
    e("moron", "идиот, придурок", "Оскорбление человека. Грубее, чем просто silly, и не подходит для нейтрального описания.", ["гений", "друг"], "Some ", " parked across two spaces.", "Этот идиот опять кричит.", ["this moron is shouting again", "that moron is shouting again"]),
    e("bitching", "нытьё, жалобы", "Глагол bitch в значении «жаловаться». Не означает «офигенно» — это bitchin'.", ["похвала", "молчание"], "Stop ", " about the weather.", "Хватит ныть о работе.", ["stop bitching about work", "stop your bitching about work"]),
  ],
  reviewPairs: [["over the moon", "на седьмом небе от счастья"], ["smh", "ну и ну, качая головой"]],
  scenario: {
    promptRu: "Выбери правильное значение bitching",
    quote: "Друг уже десять минут жалуется на холод, очередь и плохой кофе.",
    options: ["He's bitching.", "He's bitchin'.", "He's all ears."],
    answer: 0,
    whyRu: "Bitching — нытьё и жалобы. Bitchin' без g в разговорном сленге может значить «офигенный».",
  },
};

const chatContext: LessonSpec = {
  id: "chat-context",
  kind: "chat",
  title: "Be honest about real life",
  titleRu: "Честно говорить о реальной жизни",
  subtitleRu: "ngl · irl",
  ruleTitleRu: "Откровенность и жизнь вне интернета",
  introRu: "Ngl вводит честное, иногда неудобное мнение. Irl отделяет реальную жизнь от профиля, игры или разговора в сети.",
  withWhomRu: "Мия",
  lines: [
    { text: "His profile says he's a professional chef.", at: "20:12" },
    { me: true, text: "irl he only knows how to make pasta.", at: "20:12", glossRu: "irl — в реальной жизни" },
    { text: "ngl, that's basically me too.", at: "20:13", glossRu: "ngl — если честно, не буду врать" },
  ],
  expressions: [
    e("ngl", "если честно, не буду врать", "Not gonna lie. Вводит откровенное мнение или признание.", ["кстати", "я шучу"], "", ", I didn't expect to win.", "Если честно, мне это нравится.", ["ngl, I like it", "not gonna lie, I like it"], ["not gonna lie"]),
    e("irl", "в реальной жизни", "In real life. Противопоставляет реальность интернету, игре или онлайн-образу.", ["в интернете", "в игре"], "We met online, but we've never met ", ".", "Мы впервые встретились в реальной жизни.", ["we met irl for the first time", "we met in real life for the first time"], ["in real life"]),
  ],
  reviewPairs: [["chill out", "успокойся, расслабься"]],
  scenario: {
    promptRu: "Что написать перед откровенным мнением?",
    quote: "Ты хочешь честно признаться: «Если честно, фильм мне не понравился».",
    options: ["ngl, I didn't like the movie.", "irl, I didn't like the movie.", "aka, I didn't like the movie."],
    answer: 0,
    whyRu: "Ngl означает not gonna lie и вводит честное мнение.",
  },
};

const idiomNerves: LessonSpec = {
  id: "idiom-nerves",
  kind: "idiom",
  title: "Talk about nervousness",
  titleRu: "Говорить о нервах и волнении",
  subtitleRu: "on edge · butterflies in my stomach",
  ruleTitleRu: "Два разных оттенка волнения",
  introRu: "On edge — напряжённый и легко раздражаемый. Butterflies in your stomach — трепетное волнение перед свиданием, выступлением или важным событием.",
  withWhomRu: "Ева",
  lines: [
    { text: "Why are you checking your phone every second?", at: "17:45" },
    { me: true, text: "I'm on edge about the interview.", at: "17:45", glossRu: "on edge — напряжён, на нервах" },
    { text: "You'll be fine. Nervous?", at: "17:46" },
    { me: true, text: "Yeah, I have butterflies in my stomach.", at: "17:46", glossRu: "butterflies in my stomach — волнительный трепет" },
  ],
  expressions: [
    e("on edge", "на нервах, напряжён", "Be on edge — находиться в напряжении, легко вздрагивать или раздражаться.", ["спокоен", "счастлив"], "I've been ", " all morning.", "Я весь день на нервах.", ["I've been on edge all day", "I have been on edge all day"]),
    e("butterflies in my stomach", "трепет и волнение внутри", "Меняется местоимение: butterflies in your / his / her stomach.", ["боль в животе", "голод"], "I always get ", " before a date.", "Перед выступлением у меня всё сжимается от волнения.", ["I have butterflies in my stomach before the performance", "I get butterflies in my stomach before a performance"], ["butterflies in my stomach"]),
  ],
  reviewPairs: [["ngl", "если честно, не буду врать"], ["on cloud nine", "в полном восторге, на седьмом небе"]],
  scenario: {
    promptRu: "Что сказать перед первым свиданием?",
    quote: "Тебе приятно, но от волнения внутри всё сжимается.",
    options: ["I have butterflies in my stomach.", "I'm off the hook.", "I'm by the book."],
    answer: 0,
    whyRu: "Butterflies in my stomach описывает именно трепетное волнение, а не обычную боль.",
  },
};

const speechReductions: LessonSpec = {
  id: "speech-reductions",
  kind: "speech",
  title: "Understand fast natural speech",
  titleRu: "Понимать быструю живую речь",
  subtitleRu: "gonna · wanna · gotta",
  ruleTitleRu: "Три формы, которые постоянно звучат в разговоре",
  introRu: "Gonna заменяет going to, wanna — want to, gotta — have got to или have to. Это разговорные формы для устной речи и личных сообщений, не для формального письма.",
  withWhomRu: "Лиам",
  lines: [
    { text: "I'm gonna head out. Do you wanna come?", at: "16:20", glossRu: "gonna — собираюсь; wanna — хочешь" },
    { me: true, text: "I can't. I gotta study.", at: "16:20", glossRu: "gotta — мне нужно, я должен" },
    { text: "Okay, next time.", at: "16:21" },
  ],
  expressions: [
    e("gonna", "собираюсь что-то сделать", "Разговорное going to. Используется с глаголом: I'm gonna call.", ["хочу", "должен"], "I'm ", " call her tonight.", "Я собираюсь поспать.", ["I'm gonna sleep", "I am gonna sleep", "I'm going to sleep"], ["going to"]),
    e("wanna", "хочу, хочешь", "Разговорное want to. Do you wanna go? — Ты хочешь пойти?", ["должен", "собираюсь"], "Do you ", " watch a movie?", "Я хочу остаться дома.", ["I wanna stay home", "I want to stay home"], ["want to"]),
    e("gotta", "нужно, должен", "Разговорное have got to / have to. I gotta go — мне пора.", ["хочу", "могу"], "I ", " finish this first.", "Мне нужно идти.", ["I gotta go", "I have got to go", "I have to go"], ["have got to", "have to"]),
  ],
  reviewPairs: [["on edge", "на нервах, напряжён"], ["irl", "в реальной жизни"]],
  scenario: {
    promptRu: "Как спросить друга в неформальном разговоре?",
    quote: "Ты хочешь спросить: «Хочешь пойти с нами?»",
    options: ["Do you wanna come with us?", "Do you gotta come with us?", "Do you gonna come with us?"],
    answer: 0,
    whyRu: "Wanna означает want to. Do you gonna грамматически неправильно; gonna нужна форма be.",
  },
};

const chatUncertainty: LessonSpec = {
  id: "chat-uncertainty",
  kind: "chat",
  title: "Say you do not know",
  titleRu: "Не знать ответа и мягко возражать",
  subtitleRu: "I have no idea · I don't think so",
  ruleTitleRu: "Когда ответ неизвестен или вызывает сомнение",
  introRu: "I have no idea честно говорит, что ты совсем не знаешь. I don't think so мягко выражает сомнение или несогласие: «думаю, что нет».",
  withWhomRu: "Рита",
  lines: [
    { text: "Where did I put my sunglasses?", at: "10:05" },
    { me: true, text: "I have no idea. Check your bag.", at: "10:05", glossRu: "I have no idea — понятия не имею" },
    { text: "Are they in your car?", at: "10:06" },
    { me: true, text: "I don't think so.", at: "10:06", glossRu: "I don't think so — думаю, что нет" },
  ],
  expressions: [
    e("I have no idea", "понятия не имею, совсем не знаю", "Естественная разговорная фраза, когда у тебя нет даже предположения.", ["я всё знаю", "мне всё равно"], "Where is he? ", ".", "Понятия не имею, где она.", ["I have no idea where she is", "I have no idea where she is."]),
    e("I don't think so", "думаю, что нет; не думаю", "Мягкое сомнение или несогласие, а не категоричный отказ.", ["я уверен", "я согласен"], "Is it going to rain? ", ".", "Думаю, он не придёт.", ["I don't think he's coming", "I don't think he is coming", "I don't think so"]),
  ],
  reviewPairs: [["gonna", "собираюсь что-то сделать"]],
  scenario: {
    promptRu: "Что ответить, если у тебя нет даже предположения?",
    quote: "«Куда делись мои ключи?» — а ты совсем не знаешь.",
    options: ["I have no idea.", "I don't think so.", "Fair enough."],
    answer: 0,
    whyRu: "I have no idea означает полное отсутствие ответа или предположения.",
  },
};

const idiomLowKey: LessonSpec = {
  id: "idiom-low-key",
  kind: "idiom",
  title: "Feel sick and keep a low profile",
  titleRu: "Плохо себя чувствовать и не высовываться",
  subtitleRu: "under the weather · lie low",
  ruleTitleRu: "Когда нужен спокойный день",
  introRu: "Under the weather — немного нездоров. Lie low — вести себя тихо, не привлекать внимания или временно затаиться.",
  withWhomRu: "Олег",
  lines: [
    { text: "Are you coming to the party?", at: "12:40" },
    { me: true, text: "No, I'm a bit under the weather.", at: "12:40", glossRu: "under the weather — плохо себя чувствую" },
    { text: "Got it. Rest today.", at: "12:41" },
    { me: true, text: "Yeah, I'm going to lie low all weekend.", at: "12:41", glossRu: "lie low — отсидеться тихо, никуда не высовываться" },
  ],
  expressions: [
    e("under the weather", "нездоров, плохо себя чувствую", "Обычно о лёгком недомогании, а не о серьёзной болезни.", ["под дождём", "в отличной форме"], "I'm feeling a bit ", " today.", "Я немного нездоров сегодня.", ["I'm a bit under the weather today", "I am a bit under the weather today"]),
    e("lie low", "затаиться, не привлекать внимания", "Правильная идиома — lie low. Может означать спокойный отдых или намеренное желание остаться незамеченным.", ["лежать низко", "хвастаться"], "After that argument, he decided to ", ".", "Я решил затаиться на несколько дней.", ["I decided to lie low for a few days", "I decided to lie low for a couple of days"]),
  ],
  reviewPairs: [["I have no idea", "понятия не имею, совсем не знаю"], ["wanna", "хочу, хочешь"]],
  scenario: {
    promptRu: "Как вежливо объяснить отмену планов?",
    quote: "Ты немного заболел и не хочешь идти на вечеринку.",
    options: ["I'm under the weather.", "I'm over the moon.", "I'm on the same page."],
    answer: 0,
    whyRu: "Under the weather — естественное описание лёгкого недомогания.",
  },
};

const speechLabels: LessonSpec = {
  id: "speech-labels",
  kind: "speech",
  title: "Describe people and praise things",
  titleRu: "Описывать людей и хвалить вещи",
  subtitleRu: "badass · nerd · bitchin'",
  ruleTitleRu: "Комплимент, увлечённость и разговорное «офигенно»",
  introRu: "Badass — крутой и дерзкий человек. Nerd — человек, глубоко увлечённый учёбой или темой. Bitchin' — грубое разговорное «офигенный», не путать с bitching.",
  withWhomRu: "Зои",
  lines: [
    { text: "Mia built her own computer in one night.", at: "21:15" },
    { me: true, text: "She's a total nerd, and honestly, she's badass.", at: "21:15", glossRu: "nerd — увлечённый техникой человек; badass — очень крутая" },
    { text: "And the lighting on it looks bitchin'.", at: "21:16", glossRu: "bitchin' — офигенно выглядит" },
  ],
  expressions: [
    e("badass", "крутой, дерзкий, бесстрашный", "Неформальный комплимент человеку или поступку. Может быть и существительным, и прилагательным.", ["слабый", "скучный"], "She fought for her team. She's a ", ".", "Этот трюк был очень крутым.", ["that trick was badass", "the trick was badass"]),
    e("nerd", "человек, глубоко увлечённый темой", "Может быть обидным ярлыком или дружеским самоописанием: a computer nerd.", ["чемпион", "дурак"], "My brother is a real science ", ".", "Я немного фанатею от истории.", ["I'm a bit of a history nerd", "I am a bit of a history nerd"]),
    e("bitchin'", "офигенный, потрясающий", "Грубый сленг с положительным значением. Bitching с g — нытьё, значение противоположное.", ["отвратительный", "жалующийся"], "Your new bike looks ", ".", "Эта песня офигенная.", ["this song is bitchin'", "this song is bitchin"]),
  ],
  reviewPairs: [["under the weather", "нездоров, плохо себя чувствую"], ["gotta", "нужно, должен"]],
  scenario: {
    promptRu: "Выбери положительный комплимент",
    quote: "Ты восхищён новым мотоциклом друга.",
    options: ["It looks bitchin'.", "It's bitching.", "It's a moron."],
    answer: 0,
    whyRu: "Bitchin' означает «офигенный». Bitching — это нытьё, а не комплимент.",
  },
};

const chatBoundaries: LessonSpec = {
  id: "chat-boundaries",
  kind: "chat",
  title: "Drop a topic and set a boundary",
  titleRu: "Закрыть тему и попросить оставить в покое",
  subtitleRu: "never mind · what are you talking about · leave me alone",
  ruleTitleRu: "Когда продолжать разговор не хочется",
  introRu: "Never mind закрывает вопрос или просьбу. What are you talking about выражает недоумение. Leave me alone — прямая просьба оставить в покое.",
  withWhomRu: "Джош",
  lines: [
    { text: "Are you still upset?", at: "22:30" },
    { me: true, text: "What are you talking about? I wasn't upset.", at: "22:30", glossRu: "What are you talking about? — О чём ты вообще?" },
    { text: "Okay, never mind.", at: "22:31", glossRu: "Never mind — неважно, забудь" },
    { me: true, text: "Just leave me alone for a bit.", at: "22:31", glossRu: "Leave me alone — оставь меня в покое" },
  ],
  expressions: [
    e("never mind", "неважно, забудь", "Закрывает предыдущий вопрос или просьбу. Не универсальный ответ на извинение.", ["помни всегда", "я согласен"], "", ", it doesn't matter anymore.", "Неважно, я уже решил проблему.", ["never mind, I solved the problem", "never mind. I solved the problem"]),
    e("what are you talking about", "о чём ты вообще, что ты имеешь в виду", "Выражает сильное недоумение или несогласие, иногда звучит конфликтно.", ["я всё понимаю", "расскажи подробнее"], "", "? I never said that.", "О чём ты? Я этого не делал.", ["what are you talking about? I didn't do that", "what are you talking about? I did not do that"]),
    e("leave me alone", "оставь меня в покое", "Прямая просьба прекратить общение или не трогать человека.", ["пойдём со мной", "помоги мне"], "I need some space. ", ".", "Пожалуйста, оставь меня в покое.", ["please leave me alone", "leave me alone, please"]),
  ],
  reviewPairs: [["badass", "крутой, дерзкий, бесстрашный"], ["lie low", "затаиться, не привлекать внимания"]],
  scenario: {
    promptRu: "Как прямо попросить не продолжать разговор?",
    quote: "Ты хочешь побыть один и не готов обсуждать проблему.",
    options: ["Leave me alone.", "I'm all ears.", "Give me a break."],
    answer: 0,
    whyRu: "Leave me alone — прямая просьба оставить человека в покое.",
  },
};

const idiomDecisions: LessonSpec = {
  id: "idiom-decisions",
  kind: "idiom",
  title: "Change your mind and cool off",
  titleRu: "Передумать и остыть после спора",
  subtitleRu: "change my mind · cool off",
  ruleTitleRu: "Решение можно изменить, эмоции — успокоить",
  introRu: "Change your mind означает изменить решение или мнение. Cool off — успокоиться после злости, спора или сильного волнения.",
  withWhomRu: "Кейт",
  lines: [
    { text: "Are you still not talking to Dan?", at: "19:10" },
    { me: true, text: "I need to cool off first.", at: "19:10", glossRu: "cool off — остыть, успокоиться" },
    { text: "Are you cancelling the trip too?", at: "19:11" },
    { me: true, text: "Maybe I'll change my mind tomorrow.", at: "19:11", glossRu: "change my mind — передумать" },
  ],
  expressions: [
    e("change my mind", "передумать, изменить мнение", "Меняется местоимение: change your / his / her mind.", ["изменить погоду", "забыть решение"], "I was going to leave, but I ", ".", "Я передумал насчёт поездки.", ["I changed my mind about the trip", "I've changed my mind about the trip"], ["change my mind", "changed my mind"]),
    e("cool off", "остыть, успокоиться", "Может относиться к эмоциям или буквальному снижению температуры; здесь — эмоции.", ["разозлиться", "замёрзнуть"], "Let's talk after we both ", ".", "Мне нужно остыть после спора.", ["I need to cool off after the argument", "I need to cool off after our argument"]),
  ],
  reviewPairs: [["never mind", "неважно, забудь"], ["bitchin'", "офигенный, потрясающий"]],
  scenario: {
    promptRu: "Что сказать после эмоционального спора?",
    quote: "Ты не хочешь продолжать разговор, пока не успокоишься.",
    options: ["I need to cool off.", "I need to cut corners.", "I need to lie low."],
    answer: 0,
    whyRu: "Cool off означает остыть эмоционально и успокоиться.",
  },
};

const speechInsults: LessonSpec = {
  id: "speech-insults",
  kind: "speech",
  title: "Understand strong insults",
  titleRu: "Понимать жёсткие оскорбления",
  subtitleRu: "douchebag · jackass · bastard",
  ruleTitleRu: "Три оскорбления с разными оттенками",
  introRu: "Douchebag — неприятный, самодовольный человек. Jackass — идиот или человек, ведущий себя глупо. Bastard — очень грубое оскорбление жестокого или подлого человека.",
  withWhomRu: "Макс",
  lines: [
    { text: "That douchebag pushed past the whole queue.", at: "17:05", glossRu: "douchebag — мудак, неприятный тип" },
    { me: true, text: "What a jackass.", at: "17:05", glossRu: "jackass — придурок, идиот" },
    { text: "Then he laughed at the woman who fell.", at: "17:06" },
    { me: true, text: "He sounds like a real bastard.", at: "17:06", glossRu: "bastard — подлец, мудак; очень грубо" },
  ],
  expressions: [
    e("douchebag", "мудак, неприятный самодовольный тип", "Сильное оскорбление поведения и характера, не просто нейтральное «глупый».", ["приятный человек", "скромный человек"], "He acted like a total ", ".", "Он вёл себя как настоящий мудак.", ["he acted like a total douchebag", "he was a total douchebag"]),
    e("jackass", "придурок, идиот", "Грубое оскорбление, особенно за глупый или опасный поступок.", ["умница", "герой"], "Don't be a ", ".", "Ты вёл себя как придурок.", ["you acted like a jackass", "you were a jackass"]),
    e("bastard", "подлец, мудак", "Очень грубо. Есть буквальное значение «внебрачный ребёнок», но в сленге чаще это сильное оскорбление.", ["друг", "ангел"], "He lied to everyone. What a ", ".", "Он оказался настоящим подлецом.", ["he turned out to be a real bastard", "he was a real bastard"]),
  ],
  reviewPairs: [["cool off", "остыть, успокоиться"], ["what are you talking about", "о чём ты вообще, что ты имеешь в виду"]],
  scenario: {
    promptRu: "Выбери оскорбление для глупого опасного поступка",
    quote: "Водитель чуть не сбил человека и ещё посмеялся над этим.",
    options: ["What a jackass.", "What a nerd.", "What a piece of cake."],
    answer: 0,
    whyRu: "Jackass подходит для грубого осуждения глупого или опасного поведения.",
  },
};

const chatAnger: LessonSpec = {
  id: "chat-anger",
  kind: "chat",
  title: "Express anger and frustration",
  titleRu: "Выразить злость и досаду",
  subtitleRu: "damn · what the hell · pissed off",
  ruleTitleRu: "Когда ситуация действительно бесит",
  introRu: "Damn передаёт досаду или удивление. What the hell усиливает вопрос. Pissed off — очень зол или раздражён; более грубо, чем angry.",
  withWhomRu: "Нина",
  lines: [
    { text: "What the hell happened to your car?", at: "08:15", glossRu: "What the hell — что, чёрт возьми, случилось" },
    { me: true, text: "Someone hit it and drove away. Damn.", at: "08:15", glossRu: "Damn — чёрт, вот блин" },
    { text: "You must be pissed off.", at: "08:16", glossRu: "pissed off — очень зол" },
  ],
  expressions: [
    e("damn", "чёрт, блин", "Грубоватое восклицание досады, злости или удивления.", ["отлично", "спасибо"], "I missed the last train. ", ".", "Чёрт, я забыл кошелёк.", ["damn, I forgot my wallet", "damn. I forgot my wallet"]),
    e("what the hell", "что за чёрт, что вообще происходит", "Усиливает вопрос и добавляет злость или шок. Неформально и грубовато.", ["всё понятно", "как дела"], "", " are you doing?", "Что за чёрт здесь происходит?", ["what the hell is happening here", "what the hell is going on here"]),
    e("pissed off", "очень зол, взбешён", "Грубее, чем angry. Be pissed off about something — злиться из-за чего-то.", ["доволен", "расслаблен"], "I'm really ", " about the delay.", "Я очень зол из-за этого.", ["I'm really pissed off about this", "I am really pissed off about this"]),
  ],
  reviewPairs: [["jackass", "придурок, идиот"], ["change my mind", "передумать, изменить мнение"]],
  scenario: {
    promptRu: "Как сказать, что ты очень зол?",
    quote: "Кто-то повредил твою машину и скрылся.",
    options: ["I'm pissed off.", "I'm over the moon.", "I'm all ears."],
    answer: 0,
    whyRu: "Pissed off — грубоватый разговорный способ сказать «я очень зол».",
  },
};

const idiomConfrontation: LessonSpec = {
  id: "idiom-confrontation",
  kind: "idiom",
  title: "Challenge nonsense and expect a win",
  titleRu: "Не верить чуши и настраиваться на победу",
  subtitleRu: "the best seats in the house · stop selling me that crap · kick someone's butt",
  ruleTitleRu: "Перед игрой и в споре",
  introRu: "The best seats in the house — лучшие места в зале. Stop selling me that crap — резкое «не рассказывай мне эту чушь». Kick someone's butt — разгромить кого-то.",
  withWhomRu: "Рой",
  lines: [
    { text: "The seller claims these tickets cost a thousand dollars.", at: "18:30" },
    { me: true, text: "Stop selling me that crap.", at: "18:30", glossRu: "stop selling me that crap — не рассказывай мне эту чушь" },
    { text: "But look, they're the best seats in the house!", at: "18:31", glossRu: "the best seats in the house — лучшие места в зале" },
    { me: true, text: "Fine. Let's go kick their butt.", at: "18:31", glossRu: "kick their butt — разгромить их" },
  ],
  expressions: [
    e("the best seats in the house", "лучшие места в зале", "House здесь означает зал или площадку, а не частный дом.", ["худшие места", "места возле дома"], "We got ", "!", "У нас лучшие места в зале.", ["we have the best seats in the house", "we've got the best seats in the house"]),
    e("stop selling me that crap", "не рассказывай мне эту чушь", "Очень резкое недоверие к словам продавца или собеседника, не нейтральная просьба.", ["расскажи подробнее", "продай мне это"], "", ". I know you're lying.", "Не рассказывай мне эту чушь, я тебе не верю.", ["stop selling me that crap, I don't believe you", "stop selling me that crap. I don't believe you"]),
    e("kick someone's butt", "разгромить кого-то, надрать кому-то зад", "В спорте обычно означает уверенно победить. Буквально — угроза драки, поэтому контекст важен.", ["проиграть", "помочь кому-то"], "We're going to ", " tonight.", "Мы разгромим их в этой игре.", ["we're going to kick their butt in this game", "we're gonna kick their butt in this game"], ["kick their butt", "kick your butt"]),
  ],
  reviewPairs: [["pissed off", "очень зол, взбешён"], ["leave me alone", "оставь меня в покое"]],
  scenario: {
    promptRu: "Что сказать перед важной игрой?",
    quote: "Ты уверен, что твоя команда уверенно победит соперников.",
    options: ["We're gonna kick their butt.", "We're gonna lie low.", "We're gonna cut corners."],
    answer: 0,
    whyRu: "Kick their butt в спортивном контексте означает разгромить соперников.",
  },
};

const speechProfanity: LessonSpec = {
  id: "speech-profanity",
  kind: "speech",
  title: "Understand profanity in arguments",
  titleRu: "Понимать грубую речь в конфликте",
  subtitleRu: "son of a bitch · asshole · bullshit",
  ruleTitleRu: "Сильные выражения, которые важно распознавать",
  introRu: "Asshole и son of a bitch оскорбляют человека. Bullshit называет слова чушью, враньём или несправедливостью. Все три выражения очень грубые.",
  withWhomRu: "Эмма",
  lines: [
    { text: "That asshole hit my car and blamed me.", at: "16:55", glossRu: "asshole — мудак; очень грубо" },
    { me: true, text: "That's bullshit.", at: "16:55", glossRu: "That's bullshit — это чушь, это несправедливо" },
    { text: "And then he drove away, the son of a bitch.", at: "16:56", glossRu: "son of a bitch — сукин сын" },
  ],
  expressions: [
    e("son of a bitch", "сукин сын, мудак", "Очень сильное оскорбление. Иногда восклицание злости, но не нейтральная фраза.", ["хороший человек", "сын друга"], "He stole my money, the ", ".", "Этот сукин сын меня обманул.", ["that son of a bitch tricked me", "the son of a bitch tricked me"]),
    e("asshole", "мудак, засранец", "Очень грубое оскорбление неприятного или жестокого человека.", ["приятный человек", "глупенький"], "Stop acting like an ", ".", "Не веди себя как мудак.", ["don't act like an asshole", "don't be an asshole"]),
    e("bullshit", "чушь, враньё, несправедливость", "Очень грубое отрицание слов или ситуации. That's bullshit — это полная чушь.", ["правда", "отличная новость"], "His explanation is complete ", ".", "Это полная чушь.", ["that's complete bullshit", "this is complete bullshit", "that's bullshit"]),
  ],
  reviewPairs: [["what the hell", "что за чёрт, что вообще происходит"], ["kick someone's butt", "разгромить кого-то, надрать кому-то зад"]],
  scenario: {
    promptRu: "Выбери грубую реакцию на явное враньё",
    quote: "Собеседник придумал объяснение, которому ты совершенно не веришь.",
    options: ["That's bullshit.", "That's fair enough.", "That's a piece of cake."],
    answer: 0,
    whyRu: "Bullshit грубо называет утверждение чушью или враньём.",
  },
};

export const trackModules = [
  cycle("cycle-one", "No formalities", "Без формальностей", "Direct messages, useful idioms and bold slang.", "Прямые сообщения, полезные идиомы и смелый сленг.", chatHonesty, idiomBasics, speechTeasing),
  cycle("cycle-two", "Messages and reactions", "Сообщения и реакции", "Chat shorthand and natural reactions.", "Сокращения из чатов и естественные реакции.", chatNotes, idiomActions, speechReactions),
  cycle("cycle-three", "Plans and agreements", "Планы и договорённости", "Make plans and respond without sounding formal.", "Договаривайся и отвечай без лишней формальности.", chatBasics, idiomPeople, speechAgreement),
  cycle("cycle-four", "Quick answers", "Быстрые ответы", "Confirm, follow rules and answer teasing.", "Подтверждай, говори о правилах и отвечай на подколы.", chatPlans, idiomRules, speechBoundaries),
  cycle("cycle-five", "Emotions out loud", "Эмоции наружу", "React to news, happiness and annoying situations.", "Реагируй на новости, радость и раздражающие ситуации.", chatReactions, idiomFeelings, speechComplaints),
  cycle("cycle-six", "Real life, real speech", "Реальная жизнь и речь", "Honest messages, nerves and fast spoken English.", "Честные сообщения, волнение и быстрая живая речь.", chatContext, idiomNerves, speechReductions),
  cycle("cycle-seven", "People and low-key days", "Люди и спокойные дни", "Uncertainty, rest and expressive descriptions.", "Неопределённость, отдых и яркие описания людей.", chatUncertainty, idiomLowKey, speechLabels),
  cycle("cycle-eight", "Boundaries and conflict", "Границы и конфликт", "Close a topic, cool off and understand insults.", "Закрывай тему, остывай и понимай жёсткие оскорбления.", chatBoundaries, idiomDecisions, speechInsults),
  cycle("cycle-nine", "Bold English", "Смелый английский", "Anger, confrontation and strong profanity.", "Злость, противостояние и сильная грубая речь.", chatAnger, idiomConfrontation, speechProfanity),
];
