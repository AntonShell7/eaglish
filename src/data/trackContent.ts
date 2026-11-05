import { cycle, type ExpressionSpec, type LessonSpec } from "./trackModel";
import { trackExpansionModules } from "./trackExpansionContent";

const fullForms: Record<string, string> = {
  thx: "thanks",
  tq: "thank you",
  tbh: "to be honest",
  idgaf: "I don't give a fuck",
  idk: "I don't know",
  aka: "also known as",
  btw: "by the way",
  wyd: "what are you doing",
  lmk: "let me know",
  nvm: "never mind",
  fr: "for real",
  ofc: "of course",
  rn: "right now",
  ikr: "I know, right",
  smh: "shaking my head",
  ngl: "not gonna lie",
  irl: "in real life",
  kinda: "kind of",
  gonna: "going to",
  wanna: "want to",
  gotta: "have got to / have to",
};

/** The translation of the exact gap sentence, not of the separate typing task. */
const gapTranslations: Record<string, string> = {
  thx: "Я нашёл твою книгу. Спасибо!",
  tq: "Спасибо за конспекты!",
  tbh: "Честно говоря, концовка меня удивила.",
  "break a leg": "Твоё выступление начинается прямо сейчас. Удачи!",
  "a piece of cake": "Не переживай из-за теста. Он проще простого.",
  "piece of shit": "Эта дешёвая мышь — полное д*рьмо.",
  idk: "Я не знаю, куда она пошла.",
  idgaf: "Пусть ненавидит мои посты. Мне совершенно плевать.",
  btw: "Кстати, ты свободен завтра?",
  "all ears": "Расскажи мне всё. Я внимательно слушаю.",
  "get under someone's skin": "Его постоянные жалобы действительно действуют мне на нервы.",
  "I'm dead": "Это видео было уморительным. Я умираю со смеху.",
  "no way": "Он снова выиграл? Не может быть!",
  "that's wild": "Она за одну ночь переехала в другую страну? Вот это да!",
  wyd: "Чем занимаешься сегодня вечером?",
  lmk: "Дай мне знать, если сможешь прийти.",
  nvm: "Неважно, я уже это нашёл.",
  "on the same page": "Давай обсудим ещё раз, чтобы убедиться, что мы одинаково понимаем план.",
  "off the hook": "Тебе больше не нужно помогать. Ты свободен от этой обязанности.",
  "fair enough": "Тебе не понравилось? Справедливо, принято.",
  dude: "Чувак, это было потрясающе.",
  kinda: "Шоу было немного скучным.",
  fr: "Я уже заплатил, серьёзно.",
  bet: "Увидимся в восемь. Договорились.",
  ofc: "Можешь мне помочь? Конечно.",
  "by the book": "Бухгалтер делает всё строго по правилам.",
  "cut corners": "Они схалтурили, и теперь приложение постоянно вылетает.",
  "you wish": "Думаешь, что выиграешь? Мечтай.",
  "give me a break": "Ты ждёшь, что я в это поверю? Да брось.",
  rn: "Я прямо сейчас на работе.",
  ikr: "Дэн такой неорганизованный. Да уж, вот именно.",
  smh: "Он снова нам солгал. Ну и ну.",
  "over the moon": "Услышав новость, она была на седьмом небе от счастья.",
  "on cloud nine": "После свадьбы он был в полном восторге.",
  "chill out": "С нами всё в порядке. Просто успокойся.",
  bitching: "Хватит ныть о погоде.",
  ngl: "Если честно, я не ожидал победить.",
  irl: "Мы познакомились онлайн, но ни разу не встречались в реальной жизни.",
  aka: "Майя, также известная как Мэй, уже здесь.",
  "on edge": "Я всё утро на нервах.",
  "butterflies in my stomach": "Перед свиданием у меня всегда бабочки в животе.",
  gonna: "Я собираюсь позвонить ей сегодня вечером.",
  wanna: "Хочешь посмотреть фильм?",
  gotta: "Сначала мне нужно это закончить.",
  "I have no idea": "Где он? Понятия не имею.",
  "I don't think so": "Будет дождь? Думаю, что нет.",
  "under the weather": "Я сегодня немного нездоров.",
  "lie low": "После той ссоры он решил затаиться.",
  badass: "Она боролась за свою команду. Она очень крутая и бесстрашная.",
  nerd: "Мой брат — настоящий фанат науки.",
  "never mind": "Неважно, это больше не имеет значения.",
  "what are you talking about": "О чём ты вообще? Я этого никогда не говорил.",
  "leave me alone": "Мне нужно побыть одному. Оставь меня в покое.",
  "change my mind": "Я собирался уйти, но передумал.",
  "cool off": "Давай поговорим после того, как мы оба остынем.",
  douchebag: "Он вёл себя как настоящий м*дак.",
  damn: "Я опоздал на последний поезд. Чёрт.",
  "the best seats in the house": "У нас лучшие места в зале!",
  bullshit: "Его объяснение — полная чушь.",
  "say less": "Я всё сделаю. Договорились!",
  "no biggie": "Ты забыл ручку? Ничего страшного.",
  "all good": "Не переживай. Всё нормально.",
  "on point": "Твой образ безупречен.",
  "hits different": "Эта песня поздно ночью ощущается совершенно иначе.",
  "full send": "Сегодня мы выкладываемся на полную.",
  "built different": "Она тренировалась каждый день. Она не такая, как все.",
  lowkey: "Я слегка хочу домой.",
  highkey: "Мне очень нравится эта песня.",
  "main character": "Она ведёт себя как главный герой.",
  "plot twist": "В фильме был очень неожиданный поворот.",
  "zero filter": "Он говорит всё, что думает. У него совсем нет фильтров.",
  "out of pocket": "Это замечание было совершенно неуместным.",
  unhinged: "Сегодня он ведёт себя совершенно безбашенно.",
  deadass: "Ты выиграл в лотерею? Серьёзно?",
  "real talk": "Если серьёзно, мне нужен перерыв.",
  "no cap": "Это был лучший концерт в моей жизни, без вранья.",
  "talk the talk": "Он знает сленг и умеет говорить как свои.",
  "know the drill": "Я уже делал это раньше. Я знаю, что и как делать.",
  "straight fire": "Её новый альбом — просто огонь.",
  "different breed": "Он выигрывает каждую игру. Он совсем другого уровня.",
};

const gapAnswerOverrides: Record<string, string[]> = {
  "get under someone's skin": ["get under my skin"],
  "change my mind": ["changed my mind"],
};

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
  return {
    short,
    meaningRu,
    noteRu,
    wrong,
    before,
    after,
    gapRu: gapTranslations[short],
    gapAnswers: gapAnswerOverrides[short],
    translationRu,
    translationEn,
    aliases,
    fullForm: fullForms[short],
  };
}

const chatHonesty: LessonSpec = {
  id: "chat-honesty",
  kind: "chat",
  title: "Keep a chat moving",
  titleRu: "Сообщить, отменить просьбу и поблагодарить",
  subtitleRu: "lmk · nvm · tq",
  ruleTitleRu: "Три коротких сообщения с разным смыслом",
  introRu: "Lmk — let me know: попроси сообщить ответ. Nvm — never mind: отмени просьбу, которая больше не нужна. Tq — thank you: поблагодари; это менее распространённый вариант, чем thx. Всё это для неформальной переписки.",
  withWhomRu: "Майя",
  lines: [
    { text: "lmk if you need the notes.", at: "21:04", glossRu: "lmk — дай мне знать" },
    { me: true, text: "Yes, please! I can't find mine.", at: "21:04" },
    { me: true, text: "nvm, found them in my bag.", at: "21:05", glossRu: "nvm — неважно, уже не нужно" },
    { text: "I'll send you the practice questions instead.", at: "21:05" },
    { me: true, text: "tq! That would help.", at: "21:06", glossRu: "tq — спасибо" },
  ],
  expressions: [
    e("lmk", "дай мне знать, сообщи мне", "Let me know. Просьба сообщить решение или новость позже.", ["не говори мне", "позвони мне"], "", " if you can come.", "Дай мне знать, если освободишься.", ["lmk if you're free", "let me know if you're free"], ["let me know"]),
    e("nvm", "неважно, уже не нужно", "Never mind. Отменяет предыдущий вопрос или просьбу, а не выражает «ничего страшного» в любой ситуации.", ["спасибо", "никогда"], "", ", I found it.", "Неважно, я уже всё понял.", ["nvm, I figured it out", "never mind, I figured it out"], ["never mind"]),
    e("tq", "спасибо, благодарю", "Сокращение от thank you. Встречается реже, чем thx.", ["кстати", "пожалуйста"], "", " for the notes!", "Спасибо, что прислал ссылку!", ["tq for sending the link", "thank you for sending the link"], ["thank you"]),
  ],
  scenario: {
    promptRu: "Как отменить просьбу, которая больше не нужна?",
    quote: "Ты попросил друга найти ссылку, но уже нашёл её сам.",
    options: ["nvm, I found it.", "lmk if you find it.", "tq for finding it."],
    answer: 0,
    whyRu: "Nvm отменяет предыдущую просьбу. Lmk просит сообщить ответ, а tq благодарит.",
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
    { me: true, text: "Break a leg! You'll be great.", at: "10:55", glossRu: "break a leg — удачи" },
    { text: "Thanks! Is the demo difficult?", at: "10:56" },
    { me: true, text: "No, it's a piece of cake.", at: "10:56", glossRu: "a piece of cake — проще простого" },
  ],
  expressions: [
    e("break a leg", "удачи, ни пуха ни пера", "Традиционное пожелание удачи, особенно перед выступлением.", ["сломай ногу", "отдохни немного"], "Your performance starts now. ", "!", "Удачи на выступлении!", ["break a leg"]),
    e("a piece of cake", "проще простого, раз плюнуть", "Так называют задачу, которую легко выполнить.", ["кусок торта", "очень сложная задача"], "Don't worry about the test. It's ", ".", "Этот тест — проще простого.", ["this test is a piece of cake", "the test is a piece of cake"]),
  ],
  reviewPairs: [["tq", "спасибо, благодарю"]],
  scenario: {
    promptRu: "Что ответить другу перед выступлением?",
    quote: "«Я ужасно нервничаю. Через минуту выхожу на сцену».",
    options: ["Break a leg!", "It's a piece of cake.", "tq!"],
    answer: 0,
    whyRu: "Break a leg — естественное пожелание удачи перед выступлением.",
  },
};

const speechTeasing: LessonSpec = {
  id: "speech-teasing",
  kind: "speech",
  title: "React to a broken device",
  titleRu: "Реагировать на поломку",
  subtitleRu: "no way · piece of shit",
  ruleTitleRu: "Реагировать на поломку",
  introRu: "No way — «не может быть!», а в другом контексте — категоричное «ни за что». Piece of shit — очень грубая оценка вещи; о человеке это сильное оскорбление. Здесь учимся различать силу реакции.",
  withWhomRu: "Бен",
  lines: [
    {
      text: "My controller broke again.",
      at: "18:20"
    },
    {
      text: "No way! You only bought it yesterday.",
      at: "18:21",
      me: true
    },
    {
      text: "No. It's a piece of shit.",
      at: "18:22"
    },
    {
      text: "Let's use mine.",
      at: "18:23",
      me: true
    }
  ],
  expressions: [
    e("no way", "не может быть, да ладно", "Может выражать удивление или категоричный отказ — интонация решает многое.", ["конечно", "я знал"], "He won again? ", "!", "Он сказал это тебе? Да ладно!", ["he told you that? No way", "he told you that? no way!"]),
    e("piece of shit", "отвратительная вещь, д*рьмо", "О вещи — «полное д*рьмо». О человеке — крайне оскорбительно.", ["отличная вещь", "кусок торта"], "This cheap mouse is a ", ".", "Этот ноутбук — полное д*рьмо.", ["this laptop is a piece of shit", "the laptop is a piece of shit"], ["a piece of shit"]),
  ],
  reviewPairs: [["a piece of cake", "проще простого, раз плюнуть"]],
  scenario: {
    promptRu: "Как выразить удивление без грубости?",
    quote: "Друг говорит, что его новый контроллер сломался через день после покупки.",
    options: ["No way! Already?", "It's a piece of shit.", "It's a piece of cake."],
    answer: 0,
    whyRu: "No way! здесь означает «не может быть!». Piece of shit — грубая оценка вещи, a piece of cake — лёгкая задача.",
  },
};

const chatNotes: LessonSpec = {
  id: "chat-notes",
  kind: "chat",
  title: "Be honest about what you know and care about",
  titleRu: "Не знать, говорить честно и резко отвечать",
  subtitleRu: "idk · idgaf · tbh",
  ruleTitleRu: "Незнание, честность и безразличие",
  introRu: "Idk помогает быстро ответить, idgaf передаёт очень грубое «мне совершенно плевать», а tbh вводит честное мнение. Все три встречаются в неформальной переписке.",
  withWhomRu: "Алекс",
  lines: [
    { text: "Do you know where Sam is?", at: "12:10" },
    { me: true, text: "idk. He didn't answer me.", at: "12:11", glossRu: "idk — я не знаю" },
    { text: "He's annoyed that you left.", at: "12:11" },
    { me: true, text: "tbh, idgaf. I needed to leave.", at: "12:12", glossRu: "tbh — честно говоря; idgaf — мне совершенно плевать" },
  ],
  expressions: [
    e("idk", "я не знаю", "Сокращение от I don't know для личных сообщений.", ["мне всё равно", "я согласен"], "", " where she went.", "Я не знаю, где он.", ["idk where he is", "I don't know where he is"], ["I don't know"]),
    e("idgaf", "мне совершенно плевать, мне пох*й", "Сокращение от I don't give a fuck. Очень грубо: только для близких друзей.", ["я не понимаю", "мне очень нравится"], "He can hate my posts. ", "", "Мне совершенно плевать, что он думает.", ["idgaf what he thinks", "I don't give a fuck what he thinks"], ["I don't give a fuck"]),
    e("tbh", "честно говоря, если честно", "Сокращение от to be honest. Так вводят честное мнение.", ["кстати", "я не знаю"], "", ", the ending surprised me.", "Честно говоря, мне понравился фильм.", ["tbh, I liked the movie", "tbh I liked the movie", "to be honest, I liked the movie"], ["to be honest"]),
  ],
  reviewPairs: [["lmk", "дай мне знать, сообщи мне"], ["tq", "спасибо, благодарю"]],
  scenario: {
    promptRu: "Как ввести честное мнение без грубости?",
    quote: "Ты хочешь признаться другу: «Честно говоря, мне не понравился фильм».",
    options: ["tbh, I didn't like the movie.", "idgaf about the movie.", "idk which movie you mean."],
    answer: 0,
    whyRu: "Tbh вводит честное мнение. Idgaf — грубое безразличие, idk — незнание.",
  },
};

const idiomActions: LessonSpec = {
  id: "idiom-actions",
  kind: "idiom",
  title: "Listen and get annoyed",
  titleRu: "Слушать внимательно и действовать на нервы",
  subtitleRu: "all ears · get under someone's skin",
  ruleTitleRu: "Внимание и раздражение — без дословного перевода",
  introRu: "I'm all ears означает полную готовность слушать. If something gets under your skin, оно сильно или постоянно раздражает либо беспокоит тебя.",
  withWhomRu: "Ник",
  lines: [
    { text: "Can I tell you what happened yesterday?", at: "09:15" },
    { me: true, text: "Sure, I'm all ears.", at: "09:15", glossRu: "I'm all ears — я внимательно слушаю" },
    { text: "It's about Dan's constant humming.", at: "09:16" },
    { me: true, text: "Oh, that gets under my skin too.", at: "09:16", glossRu: "gets under my skin — действует мне на нервы" },
  ],
  expressions: [
    e("all ears", "внимательно слушаю, весь во внимании", "Обычно говорят I'm all ears в ответ на предложение что-то рассказать.", ["не слушаю", "оглох"], "Tell me everything. I'm ", ".", "Рассказывай, я внимательно слушаю.", ["tell me, I'm all ears", "go ahead, I'm all ears"]),
    e("get under someone's skin", "действовать кому-то на нервы", "В речи меняется местоимение: my, your, his, her, their skin.", ["спрятаться под кожу", "кого-то вдохновить"], "His constant complaints really ", ".", "Его шутки действуют мне на нервы.", ["his jokes get under my skin", "his jokes really get under my skin"], ["get under my skin", "gets under my skin"]),
  ],
  reviewPairs: [["tbh", "честно говоря, если честно"], ["break a leg", "удачи, ни пуха ни пера"]],
  scenario: {
    promptRu: "Что сказать, если ты готов выслушать историю?",
    quote: "Подруга: «У меня есть для тебя новость. Ты сейчас можешь поговорить?»",
    options: ["I'm all ears.", "Break a leg!", "idk."],
    answer: 0,
    whyRu: "I'm all ears — дружелюбный способ сказать «рассказывай, я слушаю».",
  },
};

const speechReactions: LessonSpec = {
  id: "speech-reactions",
  kind: "speech",
  title: "React to surprising news",
  titleRu: "Реагировать на смешное и неожиданное",
  subtitleRu: "I'm dead · bummer · that's wild",
  ruleTitleRu: "Три реакции, которые оживляют разговор",
  introRu: "I'm dead часто означает «я умираю со смеху». Bummer выражает досаду, а that's wild подчёркивает, насколько ситуация странная или невероятная.",
  withWhomRu: "Оскар",
  lines: [
    { text: "Our teacher came to class in a dinosaur costume.", at: "14:02" },
    { me: true, text: "That's wild. Did you get a video?", at: "14:02", glossRu: "that's wild — вот это да" },
    { text: "No, my phone was dead. But he roared instead of saying hello.", at: "14:03" },
    { me: true, text: "Bummer about the video. But I'm dead just imagining it.", at: "14:03", glossRu: "bummer — облом; I'm dead — умираю со смеху" },
  ],
  expressions: [
    e("I'm dead", "я умираю со смеху", "В сообщениях и разговоре — реакция на что-то очень смешное, а не сообщение об опасности.", ["я устал", "мне грустно"], "That video was hilarious. ", ".", "Я умираю со смеху, это так смешно.", ["I'm dead. That's so funny"]),
    { short: "bummer", meaningRu: "вот досада, облом", noteRu: "Неформальная реакция на неприятную новость, без мата.", wrong: ["всё отлично", "не знаю"], before: "What a ", after: "! My controller broke.", gapRu: "Вот досада! Мой контроллер сломался.", translationRu: "Вот досада! Мой контроллер сломался.", translationEn: ["What a bummer! My controller broke."] },
    e("that's wild", "вот это да, невероятно", "Реакция на странную, шокирующую или неожиданную ситуацию.", ["это скучно", "это нормально"], "She moved to another country overnight? ", ".", "Он купил пять котов? Вот это да!", ["he bought five cats? That's wild", "he bought five cats? that's wild"]),
  ],
  reviewPairs: [["idk", "я не знаю"], ["no way", "не может быть, да ладно"]],
  scenario: {
    promptRu: "Выбери реакцию на очень смешное видео",
    quote: "Друг прислал ролик, из-за которого ты буквально не можешь перестать смеяться.",
    options: ["I'm dead.", "Break a leg!", "idk."],
    answer: 0,
    whyRu: "В разговорном английском I'm dead часто означает «я умираю со смеху».",
  },
};

const chatBasics: LessonSpec = {
  id: "chat-basics",
  kind: "chat",
  title: "Make plans in short messages",
  titleRu: "Договариваться короткими сообщениями",
  subtitleRu: "wyd · btw · thx",
  ruleTitleRu: "Планы без длинной переписки",
  introRu: "Wyd — вопрос «чем занимаешься?». Btw добавляет мысль со значением «кстати». Thx — распространённое короткое thanks: теперь сравни его с уже знакомым tq.",
  withWhomRu: "Сэм",
  lines: [
    { text: "wyd tonight?", at: "17:30", glossRu: "wyd — чем занимаешься" },
    { me: true, text: "Nothing planned. Why?", at: "17:30" },
    { text: "Come over! btw, I found your charger.", at: "17:31", glossRu: "btw — кстати" },
    { me: true, text: "thx! I'll be there at eight.", at: "17:32", glossRu: "thx — спасибо" },
  ],
  expressions: [
    e("wyd", "чем занимаешься, что делаешь", "What are you doing. Короткий вопрос другу, часто служит началом разговора.", ["куда идёшь", "что случилось"], "", " tonight?", "Чем занимаешься сегодня вечером?", ["wyd tonight", "what are you doing tonight"], ["what are you doing"]),
    e("btw", "кстати, если что", "Сокращение от by the way. Так добавляют новую мысль или уточнение.", ["честно говоря", "прямо сейчас"], "", ", are you free tomorrow?", "Кстати, ты свободен сегодня вечером?", ["btw, are you free tonight", "btw are you free tonight", "by the way, are you free tonight"], ["by the way"]),
    e("thx", "спасибо, благодарю", "Неформальный вариант thanks для личной переписки.", ["кстати", "пожалуйста"], "I found your book. ", "!", "Спасибо за помощь!", ["thx for your help", "thx for the help", "thanks for your help", "thanks for the help"], ["thanks"]),
  ],
  reviewPairs: [["no way", "не может быть, да ладно"]],
  scenario: {
    promptRu: "Как добавить новую мысль к сообщению?",
    quote: "Вы уже договорились встретиться. Теперь добавь: «Кстати, возьми зарядку».",
    options: ["btw, bring a charger.", "wyd, bring a charger.", "thx, bring a charger."],
    answer: 0,
    whyRu: "Btw — «кстати»: вводит дополнительную мысль. Wyd задаёт вопрос, а thx благодарит.",
  },
};

const idiomPeople: LessonSpec = {
  id: "idiom-people",
  kind: "idiom",
  title: "Agree and remove responsibility",
  titleRu: "Договориться и снять обязанность",
  subtitleRu: "on the same page · off the hook",
  ruleTitleRu: "Когда вы понимаете друг друга и когда ответственность заканчивается",
  introRu: "On the same page означает быть на одной волне и одинаково понимать план. Off the hook — освобождение от обязанности, ответственности или неприятной ситуации.",
  withWhomRu: "Анна",
  lines: [
    { text: "So we present at ten and answer questions after?", at: "08:40" },
    { me: true, text: "Exactly. Just making sure we're on the same page.", at: "08:40", glossRu: "on the same page — на одной волне" },
    { text: "Do I need to bring the cables?", at: "08:41" },
    { me: true, text: "No, Sam has them. You're off the hook.", at: "08:41", glossRu: "off the hook — тебе это делать не нужно" },
  ],
  expressions: [
    e("on the same page", "быть на одной волне, одинаково понимать план", "Часто используется с be: we're on the same page.", ["читать одну книгу", "спорить о плане"], "Let's talk again to make sure we're ", ".", "Хорошо, что мы понимаем план одинаково.", ["good, we're on the same page", "it's good that we're on the same page"]),
    e("off the hook", "свободен от обязанности или ответственности", "You're off the hook — тебе больше не нужно это делать или отвечать за это.", ["на телефоне", "в неприятностях"], "You don't have to help anymore. You're ", ".", "Тебе не нужно приходить. Ты свободен от этой обязанности.", ["You don't have to come. You're off the hook"]),
  ],
  reviewPairs: [["lmk", "дай мне знать, сообщи мне"], ["all ears", "внимательно слушаю, весь во внимании"]],
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
    { text: "The movie was kinda slow.", at: "22:10", glossRu: "kinda — немного" },
    { me: true, text: "Fair enough. I liked the ending though.", at: "22:10", glossRu: "fair enough — справедливо" },
    { text: "You always defend the movies you choose, dude.", at: "22:11", glossRu: "dude — чувак" },
  ],
  expressions: [
    e("fair enough", "справедливо, принято", "Признание, что чужой аргумент разумен, даже если твоё мнение не изменилось.", ["это нечестно", "я полностью согласен"], "You didn't like it? ", ".", "Справедливо, я понимаю твою точку зрения.", ["fair enough, I see your point", "fair enough. I see your point"]),
    e("dude", "чувак, братан", "Неформальное обращение к человеку, обычно к знакомому. В дружелюбной речи может не зависеть от пола.", ["сэр", "малыш"], "", ", that was awesome.", "Чувак, это было невероятно.", ["dude, that was insane", "dude that was insane"]),
    e("kinda", "немного, слегка, вроде", "Разговорное kind of. Смягчает оценку или описание.", ["точно", "очень сильно"], "The show was ", " boring.", "Фильм был немного странным.", ["the movie was kinda weird", "the film was kinda weird"], ["kind of"]),
  ],
  reviewPairs: [["nvm", "неважно, уже не нужно"], ["I'm dead", "я умираю со смеху"]],
  scenario: {
    promptRu: "Как признать аргумент собеседника разумным?",
    quote: "Ты не полностью согласен, но понимаешь логику другого человека.",
    options: ["Fair enough.", "kinda.", "nvm."],
    answer: 0,
    whyRu: "Fair enough означает «справедливо, принимаю твой аргумент», а не обязательно полное согласие.",
  },
};

const chatPlans: LessonSpec = {
  id: "chat-plans",
  kind: "chat",
  title: "Confirm without long replies",
  titleRu: "Подтверждать без длинных ответов",
  subtitleRu: "fr · bet · ofc",
  ruleTitleRu: "Три коротких способа подтвердить",
  introRu: "Fr усиливает честность утверждения. Bet может заменить «договорились», а ofc — «конечно» или «само собой». Все три звучат неформально и подходят для друзей.",
  withWhomRu: "Джей",
  lines: [
    { text: "Are you coming at seven?", at: "16:05" },
    { me: true, text: "ofc. I already bought the tickets, fr.", at: "16:05", glossRu: "ofc — конечно; fr — серьёзно" },
    { text: "Bet. See you outside the cinema.", at: "16:06", glossRu: "bet — договорились" },
  ],
  expressions: [
    e("fr", "правда, серьёзно", "For real. Подтверждает искренность или усиливает утверждение.", ["шучу", "возможно"], "I already paid, ", ".", "Я правда всё сделал.", ["I did everything, fr", "I did everything fr", "for real, I did everything"], ["for real"]),
    e("bet", "договорились, окей", "В переписке часто заменяет okay или sure, а не означает буквальную ставку.", ["отказаться", "спорить"], "See you at eight. ", ".", "Договорились, увидимся завтра.", ["bet, see you tomorrow", "bet. See you tomorrow"]),
    e("ofc", "конечно, само собой", "Of course. Быстрый дружелюбный ответ в неформальной переписке.", ["вряд ли", "не знаю"], "Can you help me? ", ".", "Конечно, я помогу.", ["ofc, I'll help", "of course, I'll help"], ["of course"]),
  ],
  reviewPairs: [["fair enough", "справедливо, принято"]],
  scenario: {
    promptRu: "Как коротко ответить «договорились»?",
    quote: "Друг предлагает встретиться у кинотеатра в восемь. Тебя всё устраивает.",
    options: ["Bet.", "kinda.", "nvm."],
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
    { text: "Good. Don't cut corners this time.", at: "11:21", glossRu: "cut corners — схалтурить" },
  ],
  expressions: [
    e("by the book", "строго по правилам", "Do something by the book — выполнить задачу так, как предписано.", ["без правил", "по книге в буквальном смысле"], "The accountant does everything ", ".", "Мы сделали всё строго по правилам.", ["we did everything by the book", "we did it by the book"]),
    e("cut corners", "халтурить, экономить в ущерб качеству", "Обычно содержит негативную оценку: результат страдает из-за сокращения работы.", ["улучшить качество", "обрезать углы"], "They ", " and now the app keeps crashing.", "Не халтурь, когда делаешь этот проект.", ["don't cut corners on this project", "don't cut corners with this project"]),
  ],
  reviewPairs: [["on the same page", "быть на одной волне, одинаково понимать план"], ["bet", "договорились, окей"]],
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
    { me: true, text: "You wish.", at: "19:40", glossRu: "you wish — мечтай" },
    { text: "Hey, I almost won last time!", at: "19:41" },
    { me: true, text: "Give me a break. I wasn't even trying.", at: "19:41", glossRu: "give me a break — да брось" },
  ],
  expressions: [
    e("you wish", "мечтай, вряд ли", "Дразнящий ответ на завышенные ожидания. Может звучать игриво или снисходительно.", ["я тоже хочу", "поздравляю"], "You think you'll win? ", ".", "Думаешь, я извинюсь? Мечтай.", ["you think I'll apologize? You wish", "you think I'll apologize? you wish"]),
    e("give me a break", "да брось, хватит нести ерунду", "Выражает раздражение или недоверие. Интонация определяет, шутка это или конфликт.", ["помоги мне", "поздравляю"], "You expect me to believe that? ", ".", "Да брось. Это неправда.", ["Give me a break. That's not true"]),
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
    { me: true, text: "Yeah, Dan is so disorganized. He forgot the documents again.", at: "13:12" },
    { text: "ikr, he does this every week. smh.", at: "13:13", glossRu: "ikr — да уж; smh — ну и ну" },
  ],
  expressions: [
    e("rn", "прямо сейчас", "Right now. Показывает, что действие происходит в текущий момент.", ["завтра", "недавно"], "I'm at work ", ".", "Я прямо сейчас читаю твоё сообщение.", ["I'm reading your message rn", "I am reading your message rn"], ["right now"]),
    e("ikr", "да уж, вот именно, понимаю", "I know, right. Согласие с реакцией собеседника, а не просто сообщение о знании.", ["я не знал", "ты не прав"], "Yeah, Dan is so disorganized. He forgot the documents again. ", "?", "Да уж, это было странно.", ["ikr, that was weird", "I know, right? That was weird"], ["I know, right", "I know right"]),
    e("smh", "ну и ну; буквально «качаю головой»", "Shaking my head. Разочарование, недоумение или осуждение чужого поступка.", ["я смеюсь", "я счастлив"], "He lied to us again, ", ".", "Он опять всё забыл. Ну и ну.", ["he forgot everything again, smh", "he forgot everything again smh"], ["shaking my head"]),
  ],
  reviewPairs: [["give me a break", "да брось, хватит нести ерунду"]],
  scenario: {
    promptRu: "Как отреагировать на безответственный поступок?",
    quote: "Коллега третий раз подряд забыл документы, и ты обсуждаешь это с другом.",
    options: ["smh.", "bet.", "kinda."],
    answer: 0,
    whyRu: "Smh передаёт разочарование: «ну и ну», а буквально — «качаю головой».",
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
    e("over the moon", "на седьмом небе от счастья, в полном восторге", "Обычно be over the moon about something — быть в восторге от чего-то.", ["очень устать", "злиться"], "She was ", " when she heard the news.", "Я на седьмом небе от этой новости.", ["I'm over the moon about this news", "I am over the moon about this news"]),
    e("on cloud nine", "в полном восторге, на седьмом небе", "Близко по смыслу к over the moon; часто используется с be.", ["в растерянности", "в депрессии"], "He has been ", " since the wedding.", "После победы я был на седьмом небе.", ["I was on cloud nine after the win", "I was on cloud nine after the victory"]),
  ],
  reviewPairs: [["rn", "прямо сейчас"], ["cut corners", "халтурить, экономить в ущерб качеству"]],
  scenario: {
    promptRu: "Как описать радость друга?",
    quote: "Друг получил работу мечты и улыбается весь день.",
    options: ["He's over the moon.", "He's all ears.", "He's off the hook."],
    answer: 0,
    whyRu: "Over the moon означает сильную радость и восторг.",
  },
};

const speechComplaints: LessonSpec = {
  id: "speech-complaints",
  kind: "speech",
  title: "Complain and calm down",
  titleRu: "Жаловаться и снижать накал",
  subtitleRu: "chill out · a pain · bitching",
  ruleTitleRu: "Жаловаться и снижать накал",
  introRu: "Chill out — просьба успокоиться; она может прозвучать снисходительно. Bitching — грубое слово о жалобах. A pain — мягкая разговорная оценка неудобства.",
  withWhomRu: "Дэн",
  lines: [
    {
      text: "Finding parking here is a pain.",
      at: "18:20"
    },
    {
      text: "Chill out. We still have plenty of time.",
      at: "18:21",
      me: true
    },
    {
      text: "I know. I'll stop bitching about it.",
      at: "18:22"
    }
  ],
  expressions: [
    e("chill out", "успокойся, расслабься", "Неформальная просьба снизить эмоциональный накал. На обиженного человека может действовать раздражающе.", ["разволнуйся", "поторопись"], "We're fine. Just ", ".", "Успокойся. Всё в порядке.", ["Chill out. Everything is fine"], ["chill"]),
    { short: "a pain", meaningRu: "морока, неудобство", noteRu: "Разговорно, без мата: о том, что доставляет хлопоты.", wrong: ["всё отлично", "не знаю"], before: "Finding parking is ", after: ".", gapRu: "Искать парковку — та ещё морока.", translationRu: "Искать парковку — та ещё морока.", translationEn: ["Finding parking is a pain."] },
    e("bitching", "нытьё, жалобы", "Глагол bitch в значении «жаловаться». Описывает жалобы и недовольство, а не похвалу.", ["похвала", "молчание"], "Stop ", " about the weather.", "Хватит ныть о работе.", ["stop bitching about work", "stop your bitching about work"]),
  ],
  reviewPairs: [],
  scenario: {
    promptRu: "Как назвать неудобство без грубости?",
    quote: "Тебе трудно найти парковку.",
    options: [
      "Finding parking is a pain.",
      "I'm over the moon.",
      "I'm all ears."
    ],
    answer: 0,
    whyRu: "A pain — разговорное «морока», без мата."
  },
};

const chatContext: LessonSpec = {
  id: "chat-context",
  kind: "chat",
  title: "Be honest about real life",
  titleRu: "Честно говорить о реальной жизни",
  subtitleRu: "ngl · irl · aka",
  ruleTitleRu: "Откровенность, реальная жизнь и уточнение имени",
  introRu: "Ngl вводит честное мнение. Irl отделяет реальную жизнь от интернета, а aka уточняет имя или прозвище человека.",
  withWhomRu: "Мия",
  lines: [
    { text: "His profile says he's a professional chef.", at: "20:12" },
    { me: true, text: "irl he only knows how to make pasta.", at: "20:12", glossRu: "irl — в реальной жизни" },
    { text: "You mean Max, aka the pasta chef?", at: "20:13", glossRu: "aka — он же" },
    { me: true, text: "Exactly. ngl, that's basically me too.", at: "20:13", glossRu: "ngl — если честно" },
  ],
  expressions: [
    e("ngl", "если честно, не буду врать", "Not gonna lie. Вводит откровенное мнение или признание.", ["кстати", "я шучу"], "", ", I didn't expect to win.", "Если честно, мне это нравится.", ["ngl, I like it", "not gonna lie, I like it"], ["not gonna lie"]),
    e("irl", "в реальной жизни, в реале", "In real life. Противопоставляет реальность интернету, игре или онлайн-образу.", ["в интернете", "в игре"], "We met online, but we've never met ", ".", "Мы впервые встретились в реальной жизни.", ["we met irl for the first time", "we met in real life for the first time"], ["in real life"]),
    e("aka", "также известный как, он же", "Also known as. Ставится перед вторым именем, прозвищем или пояснением.", ["кстати", "например"], "Maya, ", " May, is here.", "Майя, также известная как Мэй, уже здесь.", ["Maya, aka May, is here", "Maya aka May is here"], ["also known as"]),
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
    { me: true, text: "I'm on edge about the interview.", at: "17:45", glossRu: "on edge — напряжён" },
    { text: "You'll be fine. Nervous?", at: "17:46" },
    { me: true, text: "Yeah, I have butterflies in my stomach.", at: "17:46", glossRu: "butterflies in my stomach — бабочки в животе" },
  ],
  expressions: [
    e("on edge", "на нервах, напряжён", "Be on edge — находиться в напряжении, легко вздрагивать или раздражаться.", ["спокоен", "счастлив"], "I've been ", " all morning.", "Я весь день на нервах.", ["I've been on edge all day", "I have been on edge all day"]),
    e("butterflies in my stomach", "бабочки в животе, трепетное волнение", "Меняется местоимение: butterflies in your / his / her stomach.", ["боль в животе", "голод"], "I always get ", " before a date.", "Перед выступлением у меня бабочки в животе.", ["I have butterflies in my stomach before the performance", "I get butterflies in my stomach before a performance"], ["butterflies in my stomach"]),
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
    { me: true, text: "I can't. I gotta study.", at: "16:20", glossRu: "gotta — мне нужно" },
    { text: "Okay, next time.", at: "16:21" },
  ],
  expressions: [
    e("gonna", "собираюсь что-то сделать", "Разговорное going to. Используется с глаголом: I'm gonna call.", ["хочу", "должен"], "I'm ", " call her tonight.", "Я собираюсь поспать.", ["I'm gonna sleep", "I am gonna sleep", "I'm going to sleep"], ["going to"]),
    e("wanna", "хочу, хочешь", "Разговорное want to. Do you wanna go? — Ты хочешь пойти?", ["должен", "собираюсь"], "Do you ", " watch a movie?", "Я хочу остаться дома.", ["I wanna stay home", "I want to stay home"], ["want to"]),
    e("gotta", "нужно, должен", "Разговорное have got to / have to. I gotta go — мне пора.", ["хочу", "могу"], "I ", " finish this first.", "Мне нужно идти.", ["I gotta go", "I have got to go", "I have to go"], ["have got to", "have to"]),
  ],
  reviewPairs: [["on edge", "на нервах, напряжён"], ["irl", "в реальной жизни, в реале"]],
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
    { me: true, text: "Yeah, I'm going to lie low all weekend.", at: "12:41", glossRu: "lie low — отсидеться тихо" },
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
  title: "Praise people and their work",
  titleRu: "Хвалить людей и их работу",
  subtitleRu: "badass · nerd · top-notch",
  ruleTitleRu: "Хвалить людей и их работу",
  introRu: "Badass — грубоватый комплимент смелости или крутости. Nerd может быть дружеским самоописанием или обидным ярлыком. Top-notch — отличного качества, без грубости.",
  withWhomRu: "Зои",
  lines: [
    {
      text: "Mia built her own computer in one night.",
      at: "18:20"
    },
    {
      text: "She's a computer nerd, and she's badass.",
      at: "18:21",
      me: true
    },
    {
      text: "The build quality is top-notch.",
      at: "18:22"
    }
  ],
  expressions: [
    e("badass", "крутой, дерзкий, бесстрашный", "Неформальный комплимент человеку или поступку. Может быть и существительным, и прилагательным.", ["слабый", "скучный"], "She fought for her team. She's a ", ".", "Этот трюк был очень крутым.", ["that trick was badass", "the trick was badass"]),
    e("nerd", "ботаник, человек, увлечённый темой", "Может быть обидным ярлыком или дружеским самоописанием: a computer nerd.", ["чемпион", "дурак"], "My brother is a real science ", ".", "Я немного фанатею от истории.", ["I'm a bit of a history nerd", "I am a bit of a history nerd"]),
    { short: "top-notch", meaningRu: "первоклассный, отличного качества", noteRu: "Положительная оценка качества без грубости.", wrong: ["всё отлично", "не знаю"], before: "Your work is ", after: ".", gapRu: "Твоя работа — первоклассная.", translationRu: "Твоя работа — первоклассная.", translationEn: ["Your work is top-notch."] },
  ],
  reviewPairs: [],
  scenario: {
    promptRu: "Как похвалить качество без грубости?",
    quote: "Друг хорошо собрал компьютер.",
    options: [
      "The build quality is top-notch.",
      "It's under the weather.",
      "It's on edge."
    ],
    answer: 0,
    whyRu: "Top-notch означает «первоклассный», без грубого оттенка."
  },
};

const chatBoundaries: LessonSpec = {
  id: "chat-boundaries",
  kind: "chat",
  title: "Drop a topic and set a boundary",
  titleRu: "Закрыть тему и попросить оставить в покое",
  subtitleRu: "never mind · what are you talking about · leave me alone",
  ruleTitleRu: "Когда продолжать разговор не хочется",
  introRu: "Never mind закрывает вопрос или просьбу. What are you talking about выражает недоумение. Leave me alone — прямая просьба оставить в покое или отстать от человека.",
  withWhomRu: "Джош",
  lines: [
    { text: "Are you still upset?", at: "22:30" },
    { me: true, text: "What are you talking about? I wasn't upset.", at: "22:30", glossRu: "what are you talking about — о чём ты вообще?" },
    { text: "Okay, never mind.", at: "22:31", glossRu: "never mind — неважно" },
    { me: true, text: "Just leave me alone for a bit.", at: "22:31", glossRu: "leave me alone — оставь меня в покое" },
  ],
  expressions: [
    e("never mind", "неважно, забудь", "Закрывает предыдущий вопрос или просьбу. Не универсальный ответ на извинение.", ["помни всегда", "я согласен"], "", ", it doesn't matter anymore.", "Неважно, я уже решил проблему.", ["never mind, I solved the problem", "never mind. I solved the problem"]),
    e("what are you talking about", "о чём ты вообще, что ты имеешь в виду", "Выражает сильное недоумение или несогласие, иногда звучит конфликтно.", ["я всё понимаю", "расскажи подробнее"], "", "? I never said that.", "О чём ты? Я этого не делал.", ["what are you talking about? I didn't do that", "what are you talking about? I did not do that"]),
    e("leave me alone", "оставь меня в покое, отстань от меня", "Прямая просьба прекратить общение или не трогать человека.", ["пойдём со мной", "помоги мне"], "I need some space. ", ".", "Пожалуйста, оставь меня в покое.", ["please leave me alone", "leave me alone, please"]),
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
    { me: true, text: "I need to cool off first.", at: "19:10", glossRu: "cool off — остыть" },
    { text: "Are you cancelling the trip too?", at: "19:11" },
    { me: true, text: "Maybe I'll change my mind tomorrow.", at: "19:11", glossRu: "change my mind — передумать" },
  ],
  expressions: [
    e("change my mind", "передумать, изменить мнение", "Меняется местоимение: change your / his / her mind.", ["изменить погоду", "забыть решение"], "I was going to leave, but I ", ".", "Я передумал насчёт поездки.", ["I changed my mind about the trip", "I've changed my mind about the trip"], ["change my mind", "changed my mind"]),
    e("cool off", "остыть, успокоиться", "Может относиться к эмоциям или буквальному снижению температуры; здесь — эмоции.", ["разозлиться", "замёрзнуть"], "Let's talk after we both ", ".", "Мне нужно остыть после спора.", ["I need to cool off after the argument", "I need to cool off after our argument"]),
  ],
  reviewPairs: [["never mind", "неважно, забудь"], ["top-notch", "первоклассный, отличного качества"]],
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
  title: "Respond to rude behavior",
  titleRu: "Реагировать на невежливое поведение",
  subtitleRu: "douchebag · not cool · cross the line",
  ruleTitleRu: "Реагировать на невежливое поведение",
  introRu: "Douchebag — сильное оскорбление, которое полезно понимать. Not cool осуждает поступок без мата. Cross the line означает перейти границу допустимого.",
  withWhomRu: "Макс",
  lines: [
    {
      text: "That douchebag pushed past the whole queue.",
      at: "18:20"
    },
    {
      text: "That's not cool.",
      at: "18:21",
      me: true
    },
    {
      text: "Then he laughed at a woman who fell.",
      at: "18:22"
    },
    {
      text: "Personal insults and cruel jokes cross the line.",
      at: "18:23",
      me: true
    }
  ],
  expressions: [
    e("douchebag", "м*дак, неприятный самодовольный тип", "Сильное оскорбление поведения и характера, не просто нейтральное «глупый».", ["приятный человек", "скромный человек"], "He acted like a total ", ".", "Он вёл себя как настоящий м*дак.", ["he acted like a total douchebag", "he was a total douchebag"]),
    { short: "not cool", meaningRu: "так не делают, это нехорошо", noteRu: "Осуждает поступок без оскорбления человека.", wrong: ["всё отлично", "не знаю"], before: "Laughing at her was ", after: ".", gapRu: "Смеяться над ней было нехорошо.", translationRu: "Смеяться над ней было нехорошо.", translationEn: ["Laughing at her was not cool."] },
    { short: "cross the line", meaningRu: "перейти границу допустимого", noteRu: "О поведении, которое выходит за допустимые рамки.", wrong: ["всё отлично", "не знаю"], before: "Personal insults ", after: ".", gapRu: "Личные оскорбления переходят границу допустимого.", translationRu: "Личные оскорбления переходят границу допустимого.", translationEn: ["Personal insults cross the line."] },
  ],
  reviewPairs: [["cool off", "остыть, успокоиться"]],
  scenario: {
    promptRu: "Как осудить поступок без оскорбления?",
    quote: "Человек растолкал людей в очереди.",
    options: [
      "That's not cool.",
      "What a douchebag.",
      "That's top-notch."
    ],
    answer: 0,
    whyRu: "Not cool оценивает поступок без грубого ярлыка."
  },
};

const chatAnger: LessonSpec = {
  id: "chat-anger",
  kind: "chat",
  title: "Express frustration",
  titleRu: "Выражать досаду в переписке",
  subtitleRu: "damn · seriously? · so frustrating",
  ruleTitleRu: "Выражать досаду в переписке",
  introRu: "Damn — грубоватое восклицание досады. Seriously? выражает удивление или недоверие без мата. So frustrating описывает раздражающую ситуацию.",
  withWhomRu: "Нина",
  lines: [
    {
      text: "The train has been cancelled again.",
      at: "18:20"
    },
    {
      text: "Seriously? Damn, I needed to get home.",
      at: "18:21",
      me: true
    },
    {
      text: "This is so frustrating.",
      at: "18:22"
    }
  ],
  expressions: [
    e("damn", "чёрт, блин", "Грубоватое восклицание досады, злости или удивления.", ["отлично", "спасибо"], "I missed the last train. ", ".", "Чёрт, я забыл кошелёк.", ["damn, I forgot my wallet", "damn. I forgot my wallet"]),
    { short: "seriously?", meaningRu: "серьёзно?", noteRu: "Реакция удивления или недоверия; тон может быть возмущённым.", wrong: ["всё отлично", "не знаю"], before: "Wait, ", after: "", gapRu: "Погоди, серьёзно?", translationRu: "Погоди, серьёзно?", translationEn: ["Wait, seriously?"] },
    { short: "so frustrating", meaningRu: "так раздражает", noteRu: "О ситуации, вызывающей раздражение; без мата.", wrong: ["всё отлично", "не знаю"], before: "This delay is ", after: ".", gapRu: "Эта задержка так раздражает.", translationRu: "Эта задержка так раздражает.", translationEn: ["This delay is so frustrating."] },
  ],
  reviewPairs: [["not cool", "так не делают, это нехорошо"]],
  scenario: {
    promptRu: "Как описать раздражение без ругани?",
    quote: "Поезд снова задержали.",
    options: [
      "This is so frustrating.",
      "I'm on cloud nine.",
      "It's top-notch."
    ],
    answer: 0,
    whyRu: "So frustrating описывает раздражающую ситуацию без ругани."
  },
};

const idiomConfrontation: LessonSpec = {
  id: "idiom-confrontation",
  kind: "idiom",
  title: "Enjoy a game and question a claim",
  titleRu: "Обсуждать игру и сомневаться в словах",
  subtitleRu: "the best seats in the house · take it with a grain of salt · come out on top",
  ruleTitleRu: "Обсуждать игру и сомневаться в словах",
  introRu: "The best seats in the house — лучшие места в зале. Take it with a grain of salt — относиться к словам скептически. Come out on top — выйти победителем. Все три выражения без мата.",
  withWhomRu: "Рой",
  lines: [
    {
      text: "The seller says these are the best seats in the house.",
      at: "18:20"
    },
    {
      text: "Take it with a grain of salt. Let's check the seating plan.",
      at: "18:21",
      me: true
    },
    {
      text: "Do you think our team will win?",
      at: "18:22"
    },
    {
      text: "I think we can come out on top.",
      at: "18:23",
      me: true
    }
  ],
  expressions: [
    e("the best seats in the house", "лучшие места в зале", "House здесь означает зал или площадку, а не частный дом.", ["худшие места", "места возле дома"], "We got ", "!", "У нас лучшие места в зале.", ["we have the best seats in the house", "we've got the best seats in the house"]),
    { short: "take it with a grain of salt", meaningRu: "отнестись к этому скептически", noteRu: "Не принимать сказанное на веру полностью.", wrong: ["всё отлично", "не знаю"], before: "That is only a prediction. ", after: ".", gapRu: "Это лишь прогноз. Отнесись к нему скептически.", translationRu: "Это лишь прогноз. Отнесись к нему скептически.", translationEn: ["That is only a prediction. take it with a grain of salt."] },
    { short: "come out on top", meaningRu: "выйти победителем", noteRu: "Победить в соревновании или сложной ситуации.", wrong: ["всё отлично", "не знаю"], before: "Our team can ", after: ".", gapRu: "Наша команда может выйти победителем.", translationRu: "Наша команда может выйти победителем.", translationEn: ["Our team can come out on top."] },
  ],
  reviewPairs: [["leave me alone", "оставь меня в покое, отстань от меня"]],
  scenario: {
    promptRu: "Как сказать, что команда может победить?",
    quote: "Ты веришь в свою команду.",
    options: [
      "We can come out on top.",
      "We can lie low.",
      "We can cut corners."
    ],
    answer: 0,
    whyRu: "Come out on top означает выйти победителем."
  },
};

const speechProfanity: LessonSpec = {
  id: "speech-profanity",
  kind: "speech",
  title: "Question a dubious explanation",
  titleRu: "Сомневаться в чужом объяснении",
  subtitleRu: "bullshit · that doesn't add up · I'm not buying it",
  ruleTitleRu: "Сомневаться в чужом объяснении",
  introRu: "Bullshit — очень грубая оценка слов как чуши или вранья. That doesn’t add up указывает на несостыковку без мата. I’m not buying it — неформальное «я в это не верю».",
  withWhomRu: "Эмма",
  lines: [
    {
      text: "He says he was at home, but I saw him at the party.",
      at: "18:20"
    },
    {
      text: "That doesn't add up.",
      at: "18:21",
      me: true
    },
    {
      text: "He says you saw someone else.",
      at: "18:22"
    },
    {
      text: "I'm not buying it. That explanation is bullshit.",
      at: "18:23",
      me: true
    }
  ],
  expressions: [
    e("bullshit", "чушь, враньё, несправедливость", "Очень грубое отрицание слов или ситуации. That's bullshit — это полная чушь.", ["правда", "отличная новость"], "His explanation is complete ", ".", "Это полная чушь.", ["that's complete bullshit", "this is complete bullshit", "that's bullshit"]),
    { short: "that doesn't add up", meaningRu: "что-то не сходится", noteRu: "В объяснении есть несостыковка. Без грубости.", wrong: ["всё отлично", "не знаю"], before: "Wait, ", after: ".", gapRu: "Погоди, что-то не сходится.", translationRu: "Погоди, что-то не сходится.", translationEn: ["Wait, that doesn't add up."] },
    { short: "I'm not buying it", meaningRu: "я в это не верю", noteRu: "Разговорное недоверие; речь не о покупке.", wrong: ["всё отлично", "не знаю"], before: "Sorry, ", after: ".", gapRu: "Извини, я в это не верю.", translationRu: "Извини, я в это не верю.", translationEn: ["Sorry, I'm not buying it."] },
  ],
  reviewPairs: [["take it with a grain of salt", "отнестись к этому скептически"]],
  scenario: {
    promptRu: "Как указать на несостыковку без ругани?",
    quote: "Две части рассказа противоречат друг другу.",
    options: [
      "That doesn't add up.",
      "That's bullshit.",
      "That's top-notch."
    ],
    answer: 0,
    whyRu: "That doesn’t add up указывает на противоречие без мата."
  },
};

const chatReassurance: LessonSpec = {
  id: "chat-reassurance",
  kind: "chat",
  title: "Agree and reassure in a chat",
  titleRu: "Согласиться и успокоить в переписке",
  subtitleRu: "say less · no biggie · all good",
  ruleTitleRu: "Три коротких ответа без лишних слов",
  introRu: "Say less показывает согласие и понимание. No biggie и all good успокаивают собеседника: проблемы нет, всё нормально.",
  withWhomRu: "Алекс",
  lines: [
    { text: "I'll pick you up at seven and bring your charger.", at: "18:05" },
    { me: true, text: "Say less. See you at seven.", at: "18:05", glossRu: "say less — всё понял" },
    { text: "Sorry, I forgot your coffee.", at: "18:06" },
    { me: true, text: "No biggie. It's all good.", at: "18:06", glossRu: "no biggie — ничего страшного; all good — всё нормально" },
  ],
  expressions: [
    e("say less", "всё понял, договорились", "Показывает согласие или понимание: дальше объяснять не нужно.", ["я не понял", "продолжай объяснять"], "I'll handle everything. ", "!", "Договорились, я всё понял.", ["say less, I get it", "say less. I get it"]),
    e("no biggie", "ничего страшного, не проблема", "Неформальный ответ на извинение или небольшую ошибку.", ["большая проблема", "очень важно"], "You forgot your pen? ", ".", "Ничего страшного, я не злюсь.", ["no biggie, I'm not mad", "no biggie. I'm not mad"]),
    e("all good", "всё нормально, всё в порядке", "Успокаивает собеседника или подтверждает, что проблемы нет.", ["всё плохо", "всё закончено"], "Don't worry. It's ", ".", "Не переживай, всё в порядке.", ["don't worry, it's all good", "don't worry. it's all good"]),
  ],
  reviewPairs: [["fair enough", "справедливо, принято"]],
  scenario: {
    promptRu: "Как ответить на извинение друга?",
    quote: "Друг забыл твой кофе и извинился. Ты не злишься.",
    options: ["No biggie. It's all good.", "I'm on edge.", "You wish."],
    answer: 0,
    whyRu: "No biggie и all good естественно показывают, что из-за маленькой ошибки переживать не нужно.",
  },
};

const idiomImpressions: LessonSpec = {
  id: "idiom-impressions",
  kind: "idiom",
  title: "Praise precision and special impressions",
  titleRu: "Похвалить точность и особенное впечатление",
  subtitleRu: "on point · hits different",
  ruleTitleRu: "Когда что-то безупречно или особенно заходит",
  introRu: "On point описывает безупречный результат или точный ответ. Hits different означает, что вещь или момент вызывает особенно сильные, необычные ощущения.",
  withWhomRu: "Софи",
  lines: [
    { text: "Your presentation was on point.", at: "13:20", glossRu: "on point — безупречно" },
    { me: true, text: "Thanks! Did you like the song I used?", at: "13:20" },
    { text: "Yeah, it hits different at night.", at: "13:21", glossRu: "hits different — ощущается совершенно иначе" },
  ],
  expressions: [
    e("on point", "безупречный, прямо в точку", "Подходит для образа, выступления, ответа или другого точного результата.", ["совсем мимо", "небрежный"], "Your outfit is ", ".", "Твой ответ был прямо в точку.", ["your answer was on point"]),
    e("hits different", "ощущается совершенно иначе, особенно сильно", "Обычно о положительном или эмоционально особенном впечатлении.", ["ничем не отличается", "совсем не нравится"], "This song ", " late at night.", "Этот фильм вечером ощущается совершенно иначе.", ["this movie hits different in the evening"]),
  ],
  reviewPairs: [["off the hook", "свободен от обязанности"]],
  scenario: {
    promptRu: "Как похвалить безупречный образ?",
    quote: "Друг отлично подобрал одежду, и тебе всё в нём нравится.",
    options: ["Your outfit is on point.", "Your outfit is a piece of cake.", "Your outfit is on cloud nine."],
    answer: 0,
    whyRu: "On point — естественный комплимент безупречному образу или результату.",
  },
};

const speechBoldEnergy: LessonSpec = {
  id: "speech-bold-energy",
  kind: "speech",
  title: "Go all in and praise confidence",
  titleRu: "Выложиться на полную и похвалить уверенность",
  subtitleRu: "full send · built different",
  ruleTitleRu: "Смелое действие и особенный характер",
  introRu: "Full send — действовать на полную, не сдерживаясь. Built different — комплимент человеку, который выделяется способностями, характером или мышлением.",
  withWhomRu: "Джейк",
  lines: [
    { text: "Are you nervous about the final?", at: "09:10" },
    { me: true, text: "No. I'm going full send.", at: "09:10", glossRu: "full send — на полную" },
    { text: "You stayed calm through all that?", at: "09:11" },
    { me: true, text: "I'm built different.", at: "09:11", glossRu: "built different — не такой, как все" },
  ],
  expressions: [
    e("full send", "на полную, без колебаний", "Очень неформальное выражение о решительном действии без сдерживания.", ["наполовину", "без интереса"], "We're going ", " tonight.", "Давай выкладываться на полную.", ["let's go full send"]),
    e("built different", "не такой, как все, особенный", "Неформальный комплимент способностям, характеру или необычному мышлению.", ["совсем обычный", "без способностей"], "She trained every day. She's ", ".", "Он не такой, как все.", ["he's built different", "he is built different"]),
  ],
  reviewPairs: [["on point", "безупречный, в точку"], ["hits different", "ощущается иначе"]],
  scenario: {
    promptRu: "Как сказать, что ты действуешь на максимум?",
    quote: "Ты не сомневаешься и готов полностью выложиться.",
    options: ["I'm going full send.", "I'm going to lie low.", "I'm under the weather."],
    answer: 0,
    whyRu: "Go full send означает действовать решительно и выкладываться на полную.",
  },
};

const chatEmphasis: LessonSpec = {
  id: "chat-emphasis",
  kind: "chat",
  title: "Soften or strengthen an opinion",
  titleRu: "Смягчить или усилить мнение",
  subtitleRu: "lowkey · highkey",
  ruleTitleRu: "Два противоположных усилителя для живой речи",
  introRu: "Lowkey смягчает мысль: слегка, втайне или не особенно афишируя. Highkey делает её сильнее: явно, открыто, очень.",
  withWhomRu: "Крис",
  lines: [
    { text: "Did you like the party?", at: "23:40" },
    { me: true, text: "I lowkey loved it.", at: "23:40", glossRu: "lowkey — втайне" },
    { text: "I could tell. You were highkey dancing all night.", at: "23:41", glossRu: "highkey — вовсю" },
    { me: true, text: "Okay, maybe I was.", at: "23:41" },
  ],
  expressions: [
    e("lowkey", "слегка, по-тихому, не афишируя", "Смягчает мысль или показывает, что чувство не выставляют напоказ.", ["открыто и явно", "совсем не"], "I ", " want to go home.", "Я слегка устал.", ["I'm lowkey tired", "I am lowkey tired"]),
    e("highkey", "явно, открыто, очень", "Усиливает мысль и противоположно lowkey по оттенку.", ["слегка", "втайне"], "I ", " love this song.", "Мне очень нравится это место.", ["I highkey love this place"]),
  ],
  reviewPairs: [["kinda", "немного, слегка, вроде"]],
  scenario: {
    promptRu: "Как сказать, что тебе немного неловко?",
    quote: "Ты не хочешь делать из этого большую проблему.",
    options: ["I'm lowkey embarrassed.", "I'm highkey embarrassed.", "I'm on point."],
    answer: 0,
    whyRu: "Lowkey смягчает признание, а highkey наоборот делает его более сильным и явным.",
  },
};

const idiomStory: LessonSpec = {
  id: "idiom-story",
  kind: "idiom",
  title: "Describe a story and an unexpected turn",
  titleRu: "Описать героя и неожиданный поворот",
  subtitleRu: "main character · plot twist",
  ruleTitleRu: "Два выражения из языка историй и мемов",
  introRu: "Main character — главный герой; в разговоре так описывают человека, который ведёт себя как центр истории. Plot twist — неожиданный поворот сюжета или событий.",
  withWhomRu: "Ник",
  lines: [
    { text: "Why is Mia wearing sunglasses indoors?", at: "20:25" },
    { me: true, text: "She thinks she's the main character.", at: "20:25", glossRu: "main character — главный герой" },
    { text: "And guess who arrived with her?", at: "20:26" },
    { me: true, text: "Plot twist: her ex is here.", at: "20:26", glossRu: "plot twist — неожиданный поворот" },
  ],
  expressions: [
    e("main character", "главный герой, центр истории", "Может быть буквальным или шутливым описанием человека, который ведёт себя как герой фильма.", ["статист", "зритель"], "She acts like the ", ".", "Он ведёт себя как главный герой.", ["he acts like the main character"]),
    e("plot twist", "неожиданный поворот", "Подходит для сюжета фильма, книги или неожиданного события в жизни.", ["предсказуемый финал", "главный герой"], "The movie had a huge ", ".", "Неожиданный поворот: они оказались братьями.", ["plot twist: they were brothers", "plot twist, they were brothers"]),
  ],
  reviewPairs: [["no way", "не может быть, да ладно"]],
  scenario: {
    promptRu: "Как назвать неожиданную развязку?",
    quote: "В конце фильма главный герой внезапно оказался злодеем.",
    options: ["What a plot twist.", "What a main character.", "What a nerd."],
    answer: 0,
    whyRu: "Plot twist — это неожиданный поворот событий или сюжета.",
  },
};

const speechUnfiltered: LessonSpec = {
  id: "speech-unfiltered",
  kind: "speech",
  title: "Describe unfiltered and inappropriate behavior",
  titleRu: "Описать прямолинейность и неуместное поведение",
  subtitleRu: "zero filter · out of pocket · unhinged",
  ruleTitleRu: "Когда человек говорит или ведёт себя за гранью",
  introRu: "Zero filter — без внутренней цензуры. Out of pocket — неуместно или за гранью. Unhinged — безбашенно, непредсказуемо, будто без контроля; часто с юмористическим оттенком.",
  withWhomRu: "Бен",
  lines: [
    { text: "Did you hear what Ben said to the teacher?", at: "11:15" },
    { me: true, text: "He has zero filter.", at: "11:15", glossRu: "zero filter — говорит всё прямо, без внутренней цензуры" },
    { text: "That joke was completely out of pocket.", at: "11:16", glossRu: "out of pocket — неуместно" },
    { me: true, text: "Yeah, he's acting unhinged today.", at: "11:16", glossRu: "unhinged — безбашенный" },
  ],
  expressions: [
    e("zero filter", "без фильтров, без внутренней цензуры", "О человеке, который сразу говорит то, что думает, даже если это неловко или грубо.", ["очень тактичный", "молчаливый"], "He says whatever he thinks. He has ", ".", "Она говорит всё без фильтров.", ["she has zero filter"]),
    e("out of pocket", "неуместный, за гранью", "Современный сленг о шутке, замечании или поведении, которые нарушают границы.", ["очень уместный", "идеально вежливый"], "That comment was completely ", ".", "Его шутка была совсем неуместной.", ["his joke was totally out of pocket"]),
    e("unhinged", "безбашенный, вышедший из-под контроля", "Может описывать шокирующее или хаотичное поведение; среди друзей часто звучит шутливо.", ["спокойный и собранный", "предсказуемый"], "He's acting completely ", " today.", "Она сегодня ведёт себя безбашенно.", ["she's acting unhinged today", "she is acting unhinged today"]),
  ],
  reviewPairs: [["no way", "не может быть, да ладно"], ["that's wild", "вот это да, невероятно"]],
  scenario: {
    promptRu: "Как отреагировать на жестокую неуместную шутку?",
    quote: "Друг пошутил над чужой внешностью за официальным ужином.",
    options: ["That was out of pocket.", "That was on point.", "That was a piece of cake."],
    answer: 0,
    whyRu: "Out of pocket описывает замечание или поступок, который был неуместным и перешёл границу.",
  },
};

const chatTruth: LessonSpec = {
  id: "chat-truth",
  kind: "chat",
  title: "Emphasize that you are serious",
  titleRu: "Подчеркнуть серьёзность и честность",
  subtitleRu: "deadass · real talk · no cap",
  ruleTitleRu: "Три способа сказать «я серьёзно»",
  introRu: "Deadass усиливает серьёзность. Real talk вводит откровенную мысль. No cap подчёркивает, что говорящий не врёт и не преувеличивает.",
  withWhomRu: "Джордан",
  lines: [
    { text: "You really moved to New York?", at: "14:05" },
    { me: true, text: "Deadass. I got here yesterday.", at: "14:05", glossRu: "deadass — серьёзно" },
    { text: "How's it going?", at: "14:06" },
    { me: true, text: "Real talk, it's hard. But I love it here, no cap.", at: "14:06", glossRu: "real talk — если серьёзно; no cap — без вранья" },
  ],
  expressions: [
    e("deadass", "серьёзно, абсолютно серьёзно", "Очень неформальный сленг. Может быть утверждением или вопросом «Deadass?» — «Серьёзно?».", ["я шучу", "понятия не имею"], "You won the lottery? ", "?", "Я абсолютно серьёзен.", ["I'm deadass serious", "I am deadass serious"]),
    e("real talk", "если серьёзно, без прикрас", "Вводит искреннее мнение или серьёзную часть разговора.", ["пошутим", "неважно"], "", ", I need a break.", "Если серьёзно, мне нужен отдых.", ["real talk, I need a break"]),
    e("no cap", "без вранья, честно", "Ставится в начале или конце утверждения, чтобы подчеркнуть его правдивость.", ["я вру", "может быть"], "That was the best concert ever, ", ".", "Это лучший фильм, без вранья.", ["this is the best movie, no cap", "this is the best movie no cap"]),
  ],
  reviewPairs: [["tbh", "честно говоря, если честно"], ["lowkey", "слегка, втайне"]],
  scenario: {
    promptRu: "Как подчеркнуть, что ты не врёшь?",
    quote: "Ты действительно видел его там и хочешь добавить «без вранья».",
    options: ["I saw him there, no cap.", "I saw him there, nvm.", "I saw him there, btw."],
    answer: 0,
    whyRu: "No cap добавляет утверждению оттенок «честно, без вранья».",
  },
};

const idiomConfidence: LessonSpec = {
  id: "idiom-confidence",
  kind: "idiom",
  title: "Sound confident and know the routine",
  titleRu: "Говорить уверенно и знать порядок действий",
  subtitleRu: "talk the talk · know the drill",
  ruleTitleRu: "Уверенная речь и знакомая процедура",
  introRu: "Talk the talk — говорить уверенно и как человек, который разбирается в теме. Know the drill — знать знакомый порядок действий, что и как нужно делать.",
  withWhomRu: "Эми",
  lines: [
    { text: "You've done this interview before, right?", at: "10:30" },
    { me: true, text: "Yeah, I know the drill.", at: "10:30", glossRu: "know the drill — знаю, что и как делать" },
    { text: "And you can talk the talk in English now.", at: "10:31", glossRu: "talk the talk — говорить как свои" },
    { me: true, text: "I'm ready.", at: "10:31" },
  ],
  expressions: [
    e("talk the talk", "говорить как свои, уверенно говорить о теме", "О речи человека, который звучит знающе. Само по себе это ещё не доказывает реальных навыков.", ["совсем не разбираться", "молчать"], "He knows slang and can ", ".", "Она уже говорит как свои.", ["she can talk the talk now"]),
    e("know the drill", "знать, что и как делать", "О знакомой процедуре или порядке действий, который объяснять уже не нужно.", ["не знать порядок", "делать всё впервые"], "I've done this before. I ", ".", "Ты знаешь, что делать.", ["you know the drill"]),
  ],
  reviewPairs: [["break a leg", "удачи, ни пуха ни пера"], ["on the same page", "быть на одной волне, одинаково понимать план"]],
  scenario: {
    promptRu: "Что сказать перед знакомой процедурой?",
    quote: "Ты уже много раз проходил регистрацию и знаешь все шаги.",
    options: ["I know the drill.", "I talk the talk.", "I have no idea."],
    answer: 0,
    whyRu: "Know the drill означает, что порядок действий уже знаком и объяснения не нужны.",
  },
};

const speechPraise: LessonSpec = {
  id: "speech-praise",
  kind: "speech",
  title: "Give strong praise",
  titleRu: "Восторженно похвалить",
  subtitleRu: "straight fire · different breed",
  ruleTitleRu: "Два ярких комплимента",
  introRu: "Straight fire — восторженное «просто огонь» о музыке, образе или выступлении. Different breed описывает человека совсем другого уровня; оттенок зависит от контекста.",
  withWhomRu: "Майя",
  lines: [
    { text: "Have you heard Maya's new track?", at: "22:10" },
    { me: true, text: "Yeah, it's straight fire.", at: "22:10", glossRu: "straight fire — просто огонь" },
    { text: "She wrote it in one night.", at: "22:11" },
    { me: true, text: "She's a different breed.", at: "22:11", glossRu: "different breed — совсем другой уровень" },
  ],
  expressions: [
    e("straight fire", "просто огонь, потрясающе", "Очень неформальный восторг, особенно о музыке, образах и выступлениях.", ["полный провал", "очень скучно"], "Her new album is ", ".", "Этот трек — просто огонь.", ["this track is straight fire"]),
    e("different breed", "совсем другой уровень, не такой как остальные", "О человеке, который сильно выделяется. Часто это комплимент, но оттенок зависит от контекста.", ["совсем обычный", "точная копия"], "He wins every game. He's a ", ".", "Она совсем другого уровня.", ["she's a different breed", "she is a different breed"]),
  ],
  reviewPairs: [["on point", "безупречный, в точку"], ["built different", "не такой, как все, особенный"]],
  scenario: {
    promptRu: "Как восторженно оценить новый трек?",
    quote: "Песня тебе очень понравилась, и ты хочешь сказать «просто огонь».",
    options: ["It's straight fire.", "It's under the weather.", "It's a piece of cake."],
    answer: 0,
    whyRu: "Straight fire — очень неформальный способ сказать, что что-то потрясающее.",
  },
};

// Keep stable IDs so existing completion records still point to the same lessons.
export const trackModules = [
  cycle("cycle-one", "The Warm-Up", "The Warm-Up", "Direct messages, useful idioms and bold slang.", "Прямые сообщения, полезные идиомы и смелый сленг.", chatHonesty, idiomBasics, speechTeasing),
  cycle("cycle-two", "Lowkey", "Lowkey", "Chat shorthand and natural reactions.", "Сокращения из чатов и естественные реакции.", chatNotes, idiomActions, speechReactions),
  cycle("cycle-three", "Big Mood", "Big Mood", "Make plans and respond without sounding formal.", "Договаривайся и отвечай без лишней формальности.", chatBasics, idiomPeople, speechAgreement),
  cycle("cycle-ten", "Full Send", "Full Send", "Easy replies, strong impressions and bold energy.", "Лёгкие ответы, яркие впечатления и смелая энергия.", chatReassurance, idiomImpressions, speechBoldEnergy),
  cycle("cycle-eleven", "Out of Pocket", "Out of Pocket", "Subtle hints, story moments and unfiltered reactions.", "Скрытые намёки, сюжетные повороты и реакции без фильтров.", chatEmphasis, idiomStory, speechUnfiltered),
  cycle("cycle-twelve", "Native Mode", "Native Mode", "Honest emphasis, natural confidence and high praise.", "Честные акценты, естественная уверенность и восторженные комплименты.", chatTruth, idiomConfidence, speechPraise),
  cycle("cycle-four", "No Cap", "No Cap", "Confirm, follow rules and answer teasing.", "Подтверждай, говори о правилах и отвечай на подколы.", chatPlans, idiomRules, speechBoundaries),
  cycle("cycle-five", "Say Less", "Say Less", "React to news, happiness and annoying situations.", "Реагируй на новости, радость и раздражающие ситуации.", chatReactions, idiomFeelings, speechComplaints),
  cycle("cycle-six", "Hits Different", "Hits Different", "Honest messages, nerves and fast spoken English.", "Честные сообщения, волнение и быстрая живая речь.", chatContext, idiomNerves, speechReductions),
  cycle("cycle-seven", "Straight Fire", "Straight Fire", "Uncertainty, rest and expressive descriptions.", "Неопределённость, отдых и яркие описания людей.", chatUncertainty, idiomLowKey, speechLabels),
  cycle("cycle-eight", "Zero Filter", "Zero Filter", "Close a topic, cool off and set boundaries.", "Закрывай тему, остывай и обозначай границы.", chatBoundaries, idiomDecisions, speechInsults),
  cycle("cycle-nine", "Built Different", "Built Different", "Frustration, competition and healthy skepticism.", "Досада, соревнование и здоровый скепсис.", chatAnger, idiomConfrontation, speechProfanity),
  ...trackExpansionModules,
];
