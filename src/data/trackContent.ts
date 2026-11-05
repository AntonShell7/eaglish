import { localize } from "@/i18n/content";
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
  thx: localize("Я нашёл твою книгу. Спасибо!"),
  tq: localize("Спасибо за конспекты!"),
  tbh: localize("Честно говоря, концовка меня удивила."),
  "break a leg": localize("Твоё выступление начинается прямо сейчас. Удачи!"),
  "a piece of cake": localize("Не переживай из-за теста. Он проще простого."),
  "piece of shit": localize("Эта дешёвая мышь — полное д*рьмо."),
  idk: localize("Я не знаю, куда она пошла."),
  idgaf: localize("Пусть ненавидит мои посты. Мне совершенно плевать."),
  btw: localize("Кстати, ты свободен завтра?"),
  "all ears": localize("Расскажи мне всё. Я внимательно слушаю."),
  "get under someone's skin": localize("Его постоянные жалобы действительно действуют мне на нервы."),
  "I'm dead": localize("Это видео было уморительным. Я умираю со смеху."),
  "no way": localize("Он снова выиграл? Не может быть!"),
  "that's wild": localize("Она за одну ночь переехала в другую страну? Вот это да!"),
  wyd: localize("Чем занимаешься сегодня вечером?"),
  lmk: localize("Дай мне знать, если сможешь прийти."),
  nvm: localize("Неважно, я уже это нашёл."),
  "on the same page": localize("Давай обсудим ещё раз, чтобы убедиться, что мы одинаково понимаем план."),
  "off the hook": localize("Тебе больше не нужно помогать. Ты свободен от этой обязанности."),
  "fair enough": localize("Тебе не понравилось? Справедливо, принято."),
  dude: localize("Чувак, это было потрясающе."),
  kinda: localize("Шоу было немного скучным."),
  fr: localize("Я уже заплатил, серьёзно."),
  bet: localize("Увидимся в восемь. Договорились."),
  ofc: localize("Можешь мне помочь? Конечно."),
  "by the book": localize("Бухгалтер делает всё строго по правилам."),
  "cut corners": localize("Они схалтурили, и теперь приложение постоянно вылетает."),
  "you wish": localize("Думаешь, что выиграешь? Мечтай."),
  "give me a break": localize("Ты ждёшь, что я в это поверю? Да брось."),
  rn: localize("Я прямо сейчас на работе."),
  ikr: localize("Дэн такой неорганизованный. Да уж, вот именно."),
  smh: localize("Он снова нам солгал. Ну и ну."),
  "over the moon": localize("Услышав новость, она была на седьмом небе от счастья."),
  "on cloud nine": localize("После свадьбы он был в полном восторге."),
  "chill out": localize("С нами всё в порядке. Просто успокойся."),
  bitching: localize("Хватит ныть о погоде."),
  ngl: localize("Если честно, я не ожидал победить."),
  irl: localize("Мы познакомились онлайн, но ни разу не встречались в реальной жизни."),
  aka: localize("Майя, также известная как Мэй, уже здесь."),
  "on edge": localize("Я всё утро на нервах."),
  "butterflies in my stomach": localize("Перед свиданием у меня всегда бабочки в животе."),
  gonna: localize("Я собираюсь позвонить ей сегодня вечером."),
  wanna: localize("Хочешь посмотреть фильм?"),
  gotta: localize("Сначала мне нужно это закончить."),
  "I have no idea": localize("Где он? Понятия не имею."),
  "I don't think so": localize("Будет дождь? Думаю, что нет."),
  "under the weather": localize("Я сегодня немного нездоров."),
  "lie low": localize("После той ссоры он решил затаиться."),
  badass: localize("Она боролась за свою команду. Она очень крутая и бесстрашная."),
  nerd: localize("Мой брат — настоящий фанат науки."),
  "never mind": localize("Неважно, это больше не имеет значения."),
  "what are you talking about": localize("О чём ты вообще? Я этого никогда не говорил."),
  "leave me alone": localize("Мне нужно побыть одному. Оставь меня в покое."),
  "change my mind": localize("Я собирался уйти, но передумал."),
  "cool off": localize("Давай поговорим после того, как мы оба остынем."),
  douchebag: localize("Он вёл себя как настоящий м*дак."),
  damn: localize("Я опоздал на последний поезд. Чёрт."),
  "the best seats in the house": localize("У нас лучшие места в зале!"),
  bullshit: localize("Его объяснение — полная чушь."),
  "say less": localize("Я всё сделаю. Договорились!"),
  "no biggie": localize("Ты забыл ручку? Ничего страшного."),
  "all good": localize("Не переживай. Всё нормально."),
  "on point": localize("Твой образ безупречен."),
  "hits different": localize("Эта песня поздно ночью ощущается совершенно иначе."),
  "full send": localize("Сегодня мы выкладываемся на полную."),
  "built different": localize("Она тренировалась каждый день. Она не такая, как все."),
  lowkey: localize("Я слегка хочу домой."),
  highkey: localize("Мне очень нравится эта песня."),
  "main character": localize("Она ведёт себя как главный герой."),
  "plot twist": localize("В фильме был очень неожиданный поворот."),
  "zero filter": localize("Он говорит всё, что думает. У него совсем нет фильтров."),
  "out of pocket": localize("Это замечание было совершенно неуместным."),
  unhinged: localize("Сегодня он ведёт себя совершенно безбашенно."),
  deadass: localize("Ты выиграл в лотерею? Серьёзно?"),
  "real talk": localize("Если серьёзно, мне нужен перерыв."),
  "no cap": localize("Это был лучший концерт в моей жизни, без вранья."),
  "talk the talk": localize("Он знает сленг и умеет говорить как свои."),
  "know the drill": localize("Я уже делал это раньше. Я знаю, что и как делать."),
  "straight fire": localize("Её новый альбом — просто огонь."),
  "different breed": localize("Он выигрывает каждую игру. Он совсем другого уровня."),
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
  titleRu: localize("Сообщить, отменить просьбу и поблагодарить"),
  subtitleRu: "lmk · nvm · tq",
  ruleTitleRu: localize("Три коротких сообщения с разным смыслом"),
  introRu: localize("Lmk — let me know: попроси сообщить ответ. Nvm — never mind: отмени просьбу, которая больше не нужна. Tq — thank you: поблагодари; это менее распространённый вариант, чем thx. Всё это для неформальной переписки."),
  withWhomRu: localize("Майя"),
  lines: [
    { text: "lmk if you need the notes.", at: "21:04", glossRu: localize("lmk — дай мне знать") },
    { me: true, text: "Yes, please! I can't find mine.", at: "21:04" },
    { me: true, text: "nvm, found them in my bag.", at: "21:05", glossRu: localize("nvm — неважно, уже не нужно") },
    { text: "I'll send you the practice questions instead.", at: "21:05" },
    { me: true, text: "tq! That would help.", at: "21:06", glossRu: localize("tq — спасибо") },
  ],
  expressions: [
    e("lmk", localize("дай мне знать, сообщи мне"), localize("Let me know. Просьба сообщить решение или новость позже."), [localize("не говори мне"), localize("позвони мне")], "", " if you can come.", localize("Дай мне знать, если освободишься."), ["lmk if you're free", "let me know if you're free"], ["let me know"]),
    e("nvm", localize("неважно, уже не нужно"), localize("Never mind. Отменяет предыдущий вопрос или просьбу, а не выражает «ничего страшного» в любой ситуации."), [localize("спасибо"), localize("никогда")], "", ", I found it.", localize("Неважно, я уже всё понял."), ["nvm, I figured it out", "never mind, I figured it out"], ["never mind"]),
    e("tq", localize("спасибо, благодарю"), localize("Сокращение от thank you. Встречается реже, чем thx."), [localize("кстати"), localize("пожалуйста")], "", " for the notes!", localize("Спасибо, что прислал ссылку!"), ["tq for sending the link", "thank you for sending the link"], ["thank you"]),
  ],
  scenario: {
    promptRu: localize("Как отменить просьбу, которая больше не нужна?"),
    quote: localize("Ты попросил друга найти ссылку, но уже нашёл её сам."),
    options: ["nvm, I found it.", "lmk if you find it.", "tq for finding it."],
    answer: 0,
    whyRu: localize("Nvm отменяет предыдущую просьбу. Lmk просит сообщить ответ, а tq благодарит."),
  },
};

const idiomBasics: LessonSpec = {
  id: "idiom-basics",
  kind: "idiom",
  title: "Luck and easy tasks",
  titleRu: localize("Пожелать удачи и назвать задачу лёгкой"),
  subtitleRu: "break a leg · a piece of cake",
  ruleTitleRu: localize("Две идиомы, которые нельзя переводить дословно"),
  introRu: localize("Break a leg не связано с переломом, а a piece of cake — не всегда про торт. Запоминай каждую идиому целиком, как одно выражение."),
  withWhomRu: localize("Лена"),
  lines: [
    { text: "My presentation starts in five minutes!", at: "10:55" },
    { me: true, text: "Break a leg! You'll be great.", at: "10:55", glossRu: localize("break a leg — удачи") },
    { text: "Thanks! Is the demo difficult?", at: "10:56" },
    { me: true, text: "No, it's a piece of cake.", at: "10:56", glossRu: localize("a piece of cake — проще простого") },
  ],
  expressions: [
    e("break a leg", localize("удачи, ни пуха ни пера"), localize("Традиционное пожелание удачи, особенно перед выступлением."), [localize("сломай ногу"), localize("отдохни немного")], "Your performance starts now. ", "!", localize("Удачи на выступлении!"), ["break a leg"]),
    e("a piece of cake", localize("проще простого, раз плюнуть"), localize("Так называют задачу, которую легко выполнить."), [localize("кусок торта"), localize("очень сложная задача")], "Don't worry about the test. It's ", ".", localize("Этот тест — проще простого."), ["this test is a piece of cake", "the test is a piece of cake"]),
  ],
  reviewPairs: [["tq", localize("спасибо, благодарю")]],
  scenario: {
    promptRu: localize("Что ответить другу перед выступлением?"),
    quote: localize("«Я ужасно нервничаю. Через минуту выхожу на сцену»."),
    options: ["Break a leg!", "It's a piece of cake.", "tq!"],
    answer: 0,
    whyRu: localize("Break a leg — естественное пожелание удачи перед выступлением."),
  },
};

const speechTeasing: LessonSpec = {
  id: "speech-teasing",
  kind: "speech",
  title: "React to a broken device",
  titleRu: localize("Реагировать на поломку"),
  subtitleRu: "no way · piece of shit",
  ruleTitleRu: localize("Реагировать на поломку"),
  introRu: localize("No way — «не может быть!», а в другом контексте — категоричное «ни за что». Piece of shit — очень грубая оценка вещи; о человеке это сильное оскорбление. Здесь учимся различать силу реакции."),
  withWhomRu: localize("Бен"),
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
    e("no way", localize("не может быть, да ладно"), localize("Может выражать удивление или категоричный отказ — интонация решает многое."), [localize("конечно"), localize("я знал")], "He won again? ", "!", localize("Он сказал это тебе? Да ладно!"), ["he told you that? No way", "he told you that? no way!"]),
    e("piece of shit", localize("отвратительная вещь, д*рьмо"), localize("О вещи — «полное д*рьмо». О человеке — крайне оскорбительно."), [localize("отличная вещь"), localize("кусок торта")], "This cheap mouse is a ", ".", localize("Этот ноутбук — полное д*рьмо."), ["this laptop is a piece of shit", "the laptop is a piece of shit"], ["a piece of shit"]),
  ],
  reviewPairs: [["a piece of cake", localize("проще простого, раз плюнуть")]],
  scenario: {
    promptRu: localize("Как выразить удивление без грубости?"),
    quote: localize("Друг говорит, что его новый контроллер сломался через день после покупки."),
    options: ["No way! Already?", "It's a piece of shit.", "It's a piece of cake."],
    answer: 0,
    whyRu: localize("No way! здесь означает «не может быть!». Piece of shit — грубая оценка вещи, a piece of cake — лёгкая задача."),
  },
};

const chatNotes: LessonSpec = {
  id: "chat-notes",
  kind: "chat",
  title: "Be honest about what you know and care about",
  titleRu: localize("Не знать, говорить честно и резко отвечать"),
  subtitleRu: "idk · idgaf · tbh",
  ruleTitleRu: localize("Незнание, честность и безразличие"),
  introRu: localize("Idk помогает быстро ответить, idgaf передаёт очень грубое «мне совершенно плевать», а tbh вводит честное мнение. Все три встречаются в неформальной переписке."),
  withWhomRu: localize("Алекс"),
  lines: [
    { text: "Do you know where Sam is?", at: "12:10" },
    { me: true, text: "idk. He didn't answer me.", at: "12:11", glossRu: localize("idk — я не знаю") },
    { text: "He's annoyed that you left.", at: "12:11" },
    { me: true, text: "tbh, idgaf. I needed to leave.", at: "12:12", glossRu: localize("tbh — честно говоря; idgaf — мне совершенно плевать") },
  ],
  expressions: [
    e("idk", localize("я не знаю"), localize("Сокращение от I don't know для личных сообщений."), [localize("мне всё равно"), localize("я согласен")], "", " where she went.", localize("Я не знаю, где он."), ["idk where he is", "I don't know where he is"], ["I don't know"]),
    e("idgaf", localize("мне совершенно плевать, мне пох*й"), localize("Сокращение от I don't give a fuck. Очень грубо: только для близких друзей."), [localize("я не понимаю"), localize("мне очень нравится")], "He can hate my posts. ", "", localize("Мне совершенно плевать, что он думает."), ["idgaf what he thinks", "I don't give a fuck what he thinks"], ["I don't give a fuck"]),
    e("tbh", localize("честно говоря, если честно"), localize("Сокращение от to be honest. Так вводят честное мнение."), [localize("кстати"), localize("я не знаю")], "", ", the ending surprised me.", localize("Честно говоря, мне понравился фильм."), ["tbh, I liked the movie", "tbh I liked the movie", "to be honest, I liked the movie"], ["to be honest"]),
  ],
  reviewPairs: [["lmk", localize("дай мне знать, сообщи мне")], ["tq", localize("спасибо, благодарю")]],
  scenario: {
    promptRu: localize("Как ввести честное мнение без грубости?"),
    quote: localize("Ты хочешь признаться другу: «Честно говоря, мне не понравился фильм»."),
    options: ["tbh, I didn't like the movie.", "idgaf about the movie.", "idk which movie you mean."],
    answer: 0,
    whyRu: localize("Tbh вводит честное мнение. Idgaf — грубое безразличие, idk — незнание."),
  },
};

const idiomActions: LessonSpec = {
  id: "idiom-actions",
  kind: "idiom",
  title: "Listen and get annoyed",
  titleRu: localize("Слушать внимательно и действовать на нервы"),
  subtitleRu: "all ears · get under someone's skin",
  ruleTitleRu: localize("Внимание и раздражение — без дословного перевода"),
  introRu: localize("I'm all ears означает полную готовность слушать. If something gets under your skin, оно сильно или постоянно раздражает либо беспокоит тебя."),
  withWhomRu: localize("Ник"),
  lines: [
    { text: "Can I tell you what happened yesterday?", at: "09:15" },
    { me: true, text: "Sure, I'm all ears.", at: "09:15", glossRu: localize("I'm all ears — я внимательно слушаю") },
    { text: "It's about Dan's constant humming.", at: "09:16" },
    { me: true, text: "Oh, that gets under my skin too.", at: "09:16", glossRu: localize("gets under my skin — действует мне на нервы") },
  ],
  expressions: [
    e("all ears", localize("внимательно слушаю, весь во внимании"), localize("Обычно говорят I'm all ears в ответ на предложение что-то рассказать."), [localize("не слушаю"), localize("оглох")], "Tell me everything. I'm ", ".", localize("Рассказывай, я внимательно слушаю."), ["tell me, I'm all ears", "go ahead, I'm all ears"]),
    e("get under someone's skin", localize("действовать кому-то на нервы"), localize("В речи меняется местоимение: my, your, his, her, their skin."), [localize("спрятаться под кожу"), localize("кого-то вдохновить")], "His constant complaints really ", ".", localize("Его шутки действуют мне на нервы."), ["his jokes get under my skin", "his jokes really get under my skin"], ["get under my skin", "gets under my skin"]),
  ],
  reviewPairs: [["tbh", localize("честно говоря, если честно")], ["break a leg", localize("удачи, ни пуха ни пера")]],
  scenario: {
    promptRu: localize("Что сказать, если ты готов выслушать историю?"),
    quote: localize("Подруга: «У меня есть для тебя новость. Ты сейчас можешь поговорить?»"),
    options: ["I'm all ears.", "Break a leg!", "idk."],
    answer: 0,
    whyRu: localize("I'm all ears — дружелюбный способ сказать «рассказывай, я слушаю»."),
  },
};

const speechReactions: LessonSpec = {
  id: "speech-reactions",
  kind: "speech",
  title: "React to surprising news",
  titleRu: localize("Реагировать на смешное и неожиданное"),
  subtitleRu: "I'm dead · bummer · that's wild",
  ruleTitleRu: localize("Три реакции, которые оживляют разговор"),
  introRu: localize("I'm dead часто означает «я умираю со смеху». Bummer выражает досаду, а that's wild подчёркивает, насколько ситуация странная или невероятная."),
  withWhomRu: localize("Оскар"),
  lines: [
    { text: "Our teacher came to class in a dinosaur costume.", at: "14:02" },
    { me: true, text: "That's wild. Did you get a video?", at: "14:02", glossRu: localize("that's wild — вот это да") },
    { text: "No, my phone was dead. But he roared instead of saying hello.", at: "14:03" },
    { me: true, text: "Bummer about the video. But I'm dead just imagining it.", at: "14:03", glossRu: localize("bummer — облом; I'm dead — умираю со смеху") },
  ],
  expressions: [
    e("I'm dead", localize("я умираю со смеху"), localize("В сообщениях и разговоре — реакция на что-то очень смешное, а не сообщение об опасности."), [localize("я устал"), localize("мне грустно")], "That video was hilarious. ", ".", localize("Я умираю со смеху, это так смешно."), ["I'm dead. That's so funny"]),
    { short: "bummer", meaningRu: localize("вот досада, облом"), noteRu: localize("Неформальная реакция на неприятную новость, без мата."), wrong: [localize("всё отлично"), localize("не знаю")], before: "What a ", after: "! My controller broke.", gapRu: localize("Вот досада! Мой контроллер сломался."), translationRu: localize("Вот досада! Мой контроллер сломался."), translationEn: ["What a bummer! My controller broke."] },
    e("that's wild", localize("вот это да, невероятно"), localize("Реакция на странную, шокирующую или неожиданную ситуацию."), [localize("это скучно"), localize("это нормально")], "She moved to another country overnight? ", ".", localize("Он купил пять котов? Вот это да!"), ["he bought five cats? That's wild", "he bought five cats? that's wild"]),
  ],
  reviewPairs: [["idk", localize("я не знаю")], ["no way", localize("не может быть, да ладно")]],
  scenario: {
    promptRu: localize("Выбери реакцию на очень смешное видео"),
    quote: localize("Друг прислал ролик, из-за которого ты буквально не можешь перестать смеяться."),
    options: ["I'm dead.", "Break a leg!", "idk."],
    answer: 0,
    whyRu: localize("В разговорном английском I'm dead часто означает «я умираю со смеху»."),
  },
};

const chatBasics: LessonSpec = {
  id: "chat-basics",
  kind: "chat",
  title: "Make plans in short messages",
  titleRu: localize("Договариваться короткими сообщениями"),
  subtitleRu: "wyd · btw · thx",
  ruleTitleRu: localize("Планы без длинной переписки"),
  introRu: localize("Wyd — вопрос «чем занимаешься?». Btw добавляет мысль со значением «кстати». Thx — распространённое короткое thanks: теперь сравни его с уже знакомым tq."),
  withWhomRu: localize("Сэм"),
  lines: [
    { text: "wyd tonight?", at: "17:30", glossRu: localize("wyd — чем занимаешься") },
    { me: true, text: "Nothing planned. Why?", at: "17:30" },
    { text: "Come over! btw, I found your charger.", at: "17:31", glossRu: localize("btw — кстати") },
    { me: true, text: "thx! I'll be there at eight.", at: "17:32", glossRu: localize("thx — спасибо") },
  ],
  expressions: [
    e("wyd", localize("чем занимаешься, что делаешь"), localize("What are you doing. Короткий вопрос другу, часто служит началом разговора."), [localize("куда идёшь"), localize("что случилось")], "", " tonight?", localize("Чем занимаешься сегодня вечером?"), ["wyd tonight", "what are you doing tonight"], ["what are you doing"]),
    e("btw", localize("кстати, если что"), localize("Сокращение от by the way. Так добавляют новую мысль или уточнение."), [localize("честно говоря"), localize("прямо сейчас")], "", ", are you free tomorrow?", localize("Кстати, ты свободен сегодня вечером?"), ["btw, are you free tonight", "btw are you free tonight", "by the way, are you free tonight"], ["by the way"]),
    e("thx", localize("спасибо, благодарю"), localize("Неформальный вариант thanks для личной переписки."), [localize("кстати"), localize("пожалуйста")], "I found your book. ", "!", localize("Спасибо за помощь!"), ["thx for your help", "thx for the help", "thanks for your help", "thanks for the help"], ["thanks"]),
  ],
  reviewPairs: [["no way", localize("не может быть, да ладно")]],
  scenario: {
    promptRu: localize("Как добавить новую мысль к сообщению?"),
    quote: localize("Вы уже договорились встретиться. Теперь добавь: «Кстати, возьми зарядку»."),
    options: ["btw, bring a charger.", "wyd, bring a charger.", "thx, bring a charger."],
    answer: 0,
    whyRu: localize("Btw — «кстати»: вводит дополнительную мысль. Wyd задаёт вопрос, а thx благодарит."),
  },
};

const idiomPeople: LessonSpec = {
  id: "idiom-people",
  kind: "idiom",
  title: "Agree and remove responsibility",
  titleRu: localize("Договориться и снять обязанность"),
  subtitleRu: "on the same page · off the hook",
  ruleTitleRu: localize("Когда вы понимаете друг друга и когда ответственность заканчивается"),
  introRu: localize("On the same page означает быть на одной волне и одинаково понимать план. Off the hook — освобождение от обязанности, ответственности или неприятной ситуации."),
  withWhomRu: localize("Анна"),
  lines: [
    { text: "So we present at ten and answer questions after?", at: "08:40" },
    { me: true, text: "Exactly. Just making sure we're on the same page.", at: "08:40", glossRu: localize("on the same page — на одной волне") },
    { text: "Do I need to bring the cables?", at: "08:41" },
    { me: true, text: "No, Sam has them. You're off the hook.", at: "08:41", glossRu: localize("off the hook — тебе это делать не нужно") },
  ],
  expressions: [
    e("on the same page", localize("быть на одной волне, одинаково понимать план"), localize("Часто используется с be: we're on the same page."), [localize("читать одну книгу"), localize("спорить о плане")], "Let's talk again to make sure we're ", ".", localize("Хорошо, что мы понимаем план одинаково."), ["good, we're on the same page", "it's good that we're on the same page"]),
    e("off the hook", localize("свободен от обязанности или ответственности"), localize("You're off the hook — тебе больше не нужно это делать или отвечать за это."), [localize("на телефоне"), localize("в неприятностях")], "You don't have to help anymore. You're ", ".", localize("Тебе не нужно приходить. Ты свободен от этой обязанности."), ["You don't have to come. You're off the hook"]),
  ],
  reviewPairs: [["lmk", localize("дай мне знать, сообщи мне")], ["all ears", localize("внимательно слушаю, весь во внимании")]],
  scenario: {
    promptRu: localize("Что сказать перед началом совместной работы?"),
    quote: localize("Ты хочешь убедиться, что все одинаково понимают план."),
    options: ["Let's make sure we're on the same page.", "Let's get off the hook.", "Let's get under their skin."],
    answer: 0,
    whyRu: localize("On the same page означает одинаковое понимание задачи и договорённостей."),
  },
};

const speechAgreement: LessonSpec = {
  id: "speech-agreement",
  kind: "speech",
  title: "Agree and soften an opinion",
  titleRu: localize("Согласиться и смягчить мнение"),
  subtitleRu: "fair enough · dude · kinda",
  ruleTitleRu: localize("Три маленьких слова с большим разговорным эффектом"),
  introRu: localize("Fair enough признаёт чужую точку зрения разумной. Dude — неформальное обращение. Kinda смягчает оценку: «немного», «вроде»."),
  withWhomRu: localize("Марк"),
  lines: [
    { text: "The movie was kinda slow.", at: "22:10", glossRu: localize("kinda — немного") },
    { me: true, text: "Fair enough. I liked the ending though.", at: "22:10", glossRu: localize("fair enough — справедливо") },
    { text: "You always defend the movies you choose, dude.", at: "22:11", glossRu: localize("dude — чувак") },
  ],
  expressions: [
    e("fair enough", localize("справедливо, принято"), localize("Признание, что чужой аргумент разумен, даже если твоё мнение не изменилось."), [localize("это нечестно"), localize("я полностью согласен")], "You didn't like it? ", ".", localize("Справедливо, я понимаю твою точку зрения."), ["fair enough, I see your point", "fair enough. I see your point"]),
    e("dude", localize("чувак, братан"), localize("Неформальное обращение к человеку, обычно к знакомому. В дружелюбной речи может не зависеть от пола."), [localize("сэр"), localize("малыш")], "", ", that was awesome.", localize("Чувак, это было невероятно."), ["dude, that was insane", "dude that was insane"]),
    e("kinda", localize("немного, слегка, вроде"), localize("Разговорное kind of. Смягчает оценку или описание."), [localize("точно"), localize("очень сильно")], "The show was ", " boring.", localize("Фильм был немного странным."), ["the movie was kinda weird", "the film was kinda weird"], ["kind of"]),
  ],
  reviewPairs: [["nvm", localize("неважно, уже не нужно")], ["I'm dead", localize("я умираю со смеху")]],
  scenario: {
    promptRu: localize("Как признать аргумент собеседника разумным?"),
    quote: localize("Ты не полностью согласен, но понимаешь логику другого человека."),
    options: ["Fair enough.", "kinda.", "nvm."],
    answer: 0,
    whyRu: localize("Fair enough означает «справедливо, принимаю твой аргумент», а не обязательно полное согласие."),
  },
};

const chatPlans: LessonSpec = {
  id: "chat-plans",
  kind: "chat",
  title: "Confirm without long replies",
  titleRu: localize("Подтверждать без длинных ответов"),
  subtitleRu: "fr · bet · ofc",
  ruleTitleRu: localize("Три коротких способа подтвердить"),
  introRu: localize("Fr усиливает честность утверждения. Bet может заменить «договорились», а ofc — «конечно» или «само собой». Все три звучат неформально и подходят для друзей."),
  withWhomRu: localize("Джей"),
  lines: [
    { text: "Are you coming at seven?", at: "16:05" },
    { me: true, text: "ofc. I already bought the tickets, fr.", at: "16:05", glossRu: localize("ofc — конечно; fr — серьёзно") },
    { text: "Bet. See you outside the cinema.", at: "16:06", glossRu: localize("bet — договорились") },
  ],
  expressions: [
    e("fr", localize("правда, серьёзно"), localize("For real. Подтверждает искренность или усиливает утверждение."), [localize("шучу"), localize("возможно")], "I already paid, ", ".", localize("Я правда всё сделал."), ["I did everything, fr", "I did everything fr", "for real, I did everything"], ["for real"]),
    e("bet", localize("договорились, окей"), localize("В переписке часто заменяет okay или sure, а не означает буквальную ставку."), [localize("отказаться"), localize("спорить")], "See you at eight. ", ".", localize("Договорились, увидимся завтра."), ["bet, see you tomorrow", "bet. See you tomorrow"]),
    e("ofc", localize("конечно, само собой"), localize("Of course. Быстрый дружелюбный ответ в неформальной переписке."), [localize("вряд ли"), localize("не знаю")], "Can you help me? ", ".", localize("Конечно, я помогу."), ["ofc, I'll help", "of course, I'll help"], ["of course"]),
  ],
  reviewPairs: [["fair enough", localize("справедливо, принято")]],
  scenario: {
    promptRu: localize("Как коротко ответить «договорились»?"),
    quote: localize("Друг предлагает встретиться у кинотеатра в восемь. Тебя всё устраивает."),
    options: ["Bet.", "kinda.", "nvm."],
    answer: 0,
    whyRu: localize("Bet здесь означает «окей, договорились», а не «делаю ставку»."),
  },
};

const idiomRules: LessonSpec = {
  id: "idiom-rules",
  kind: "idiom",
  title: "Follow rules or cut corners",
  titleRu: localize("Следовать правилам или халтурить"),
  subtitleRu: "by the book · cut corners",
  ruleTitleRu: localize("Два противоположных подхода к работе"),
  introRu: localize("By the book — строго по правилам. Cut corners — сэкономить время или усилия в ущерб качеству, сделать кое-как."),
  withWhomRu: localize("Ира"),
  lines: [
    { text: "Why is this report taking so long?", at: "11:20" },
    { me: true, text: "I'm doing everything by the book.", at: "11:20", glossRu: localize("by the book — строго по правилам") },
    { text: "Good. Don't cut corners this time.", at: "11:21", glossRu: localize("cut corners — схалтурить") },
  ],
  expressions: [
    e("by the book", localize("строго по правилам"), localize("Do something by the book — выполнить задачу так, как предписано."), [localize("без правил"), localize("по книге в буквальном смысле")], "The accountant does everything ", ".", localize("Мы сделали всё строго по правилам."), ["we did everything by the book", "we did it by the book"]),
    e("cut corners", localize("халтурить, экономить в ущерб качеству"), localize("Обычно содержит негативную оценку: результат страдает из-за сокращения работы."), [localize("улучшить качество"), localize("обрезать углы")], "They ", " and now the app keeps crashing.", localize("Не халтурь, когда делаешь этот проект."), ["don't cut corners on this project", "don't cut corners with this project"]),
  ],
  reviewPairs: [["on the same page", localize("быть на одной волне, одинаково понимать план")], ["bet", localize("договорились, окей")]],
  scenario: {
    promptRu: localize("Что сказать о некачественной работе?"),
    quote: localize("Рабочие сэкономили на материалах, и через неделю всё сломалось."),
    options: ["They cut corners.", "They did it by the book.", "They were all ears."],
    answer: 0,
    whyRu: localize("Cut corners означает сократить необходимую работу или расходы в ущерб результату."),
  },
};

const speechBoundaries: LessonSpec = {
  id: "speech-boundaries",
  kind: "speech",
  title: "Answer teasing and nonsense",
  titleRu: localize("Отвечать на подколы и ерунду"),
  subtitleRu: "you wish · give me a break",
  ruleTitleRu: localize("Два дерзких ответа друзьям"),
  introRu: localize("You wish поддевает чью-то несбыточную мечту. Give me a break выражает раздражение или недоверие: «да брось», «хватит нести ерунду»."),
  withWhomRu: localize("Том"),
  lines: [
    { text: "One day I'll beat you at this game.", at: "19:40" },
    { me: true, text: "You wish.", at: "19:40", glossRu: localize("you wish — мечтай") },
    { text: "Hey, I almost won last time!", at: "19:41" },
    { me: true, text: "Give me a break. I wasn't even trying.", at: "19:41", glossRu: localize("give me a break — да брось") },
  ],
  expressions: [
    e("you wish", localize("мечтай, вряд ли"), localize("Дразнящий ответ на завышенные ожидания. Может звучать игриво или снисходительно."), [localize("я тоже хочу"), localize("поздравляю")], "You think you'll win? ", ".", localize("Думаешь, я извинюсь? Мечтай."), ["you think I'll apologize? You wish", "you think I'll apologize? you wish"]),
    e("give me a break", localize("да брось, хватит нести ерунду"), localize("Выражает раздражение или недоверие. Интонация определяет, шутка это или конфликт."), [localize("помоги мне"), localize("поздравляю")], "You expect me to believe that? ", ".", localize("Да брось. Это неправда."), ["Give me a break. That's not true"]),
  ],
  reviewPairs: [["fr", localize("правда, серьёзно")], ["kinda", localize("немного, слегка, вроде")]],
  scenario: {
    promptRu: localize("Выбери игривый ответ на хвастовство"),
    quote: localize("Друг, который всегда проигрывает тебе в игру: «Завтра я стану чемпионом мира»."),
    options: ["You wish.", "I'm all ears.", "Fair enough."],
    answer: 0,
    whyRu: localize("You wish подходит для дружеского подкола: «мечтай, конечно»."),
  },
};

const chatReactions: LessonSpec = {
  id: "chat-reactions",
  kind: "chat",
  title: "React in real time",
  titleRu: localize("Реагировать на события в переписке"),
  subtitleRu: "rn · ikr · smh",
  ruleTitleRu: localize("Здесь, согласие и разочарование"),
  introRu: localize("Rn обозначает текущий момент. Ikr передаёт согласие с чужой реакцией. Smh показывает разочарование или недоумение от чужого поступка."),
  withWhomRu: localize("Ким"),
  lines: [
    { text: "Are you busy rn?", at: "13:12", glossRu: localize("rn — прямо сейчас") },
    { me: true, text: "Yeah, Dan is so disorganized. He forgot the documents again.", at: "13:12" },
    { text: "ikr, he does this every week. smh.", at: "13:13", glossRu: localize("ikr — да уж; smh — ну и ну") },
  ],
  expressions: [
    e("rn", localize("прямо сейчас"), localize("Right now. Показывает, что действие происходит в текущий момент."), [localize("завтра"), localize("недавно")], "I'm at work ", ".", localize("Я прямо сейчас читаю твоё сообщение."), ["I'm reading your message rn", "I am reading your message rn"], ["right now"]),
    e("ikr", localize("да уж, вот именно, понимаю"), localize("I know, right. Согласие с реакцией собеседника, а не просто сообщение о знании."), [localize("я не знал"), localize("ты не прав")], "Yeah, Dan is so disorganized. He forgot the documents again. ", "?", localize("Да уж, это было странно."), ["ikr, that was weird", "I know, right? That was weird"], ["I know, right", "I know right"]),
    e("smh", localize("ну и ну; буквально «качаю головой»"), localize("Shaking my head. Разочарование, недоумение или осуждение чужого поступка."), [localize("я смеюсь"), localize("я счастлив")], "He lied to us again, ", ".", localize("Он опять всё забыл. Ну и ну."), ["he forgot everything again, smh", "he forgot everything again smh"], ["shaking my head"]),
  ],
  reviewPairs: [["give me a break", localize("да брось, хватит нести ерунду")]],
  scenario: {
    promptRu: localize("Как отреагировать на безответственный поступок?"),
    quote: localize("Коллега третий раз подряд забыл документы, и ты обсуждаешь это с другом."),
    options: ["smh.", "bet.", "kinda."],
    answer: 0,
    whyRu: localize("Smh передаёт разочарование: «ну и ну», а буквально — «качаю головой»."),
  },
};

const idiomFeelings: LessonSpec = {
  id: "idiom-feelings",
  kind: "idiom",
  title: "Talk about happiness",
  titleRu: localize("Говорить о сильной радости"),
  subtitleRu: "over the moon · on cloud nine",
  ruleTitleRu: localize("Когда обычного happy недостаточно"),
  introRu: localize("Over the moon и on cloud nine описывают сильное счастье и восторг. Обе идиомы естественно звучат в разговоре о хороших новостях."),
  withWhomRu: localize("Полина"),
  lines: [
    { text: "I got the job!", at: "15:08" },
    { me: true, text: "Congratulations! You must be over the moon.", at: "15:08", glossRu: localize("over the moon — на седьмом небе от счастья") },
    { text: "I am. I've been on cloud nine all day.", at: "15:09", glossRu: localize("on cloud nine — в полном восторге") },
  ],
  expressions: [
    e("over the moon", localize("на седьмом небе от счастья, в полном восторге"), localize("Обычно be over the moon about something — быть в восторге от чего-то."), [localize("очень устать"), localize("злиться")], "She was ", " when she heard the news.", localize("Я на седьмом небе от этой новости."), ["I'm over the moon about this news", "I am over the moon about this news"]),
    e("on cloud nine", localize("в полном восторге, на седьмом небе"), localize("Близко по смыслу к over the moon; часто используется с be."), [localize("в растерянности"), localize("в депрессии")], "He has been ", " since the wedding.", localize("После победы я был на седьмом небе."), ["I was on cloud nine after the win", "I was on cloud nine after the victory"]),
  ],
  reviewPairs: [["rn", localize("прямо сейчас")], ["cut corners", localize("халтурить, экономить в ущерб качеству")]],
  scenario: {
    promptRu: localize("Как описать радость друга?"),
    quote: localize("Друг получил работу мечты и улыбается весь день."),
    options: ["He's over the moon.", "He's all ears.", "He's off the hook."],
    answer: 0,
    whyRu: localize("Over the moon означает сильную радость и восторг."),
  },
};

const speechComplaints: LessonSpec = {
  id: "speech-complaints",
  kind: "speech",
  title: "Complain and calm down",
  titleRu: localize("Жаловаться и снижать накал"),
  subtitleRu: "chill out · a pain · bitching",
  ruleTitleRu: localize("Жаловаться и снижать накал"),
  introRu: localize("Chill out — просьба успокоиться; она может прозвучать снисходительно. Bitching — грубое слово о жалобах. A pain — мягкая разговорная оценка неудобства."),
  withWhomRu: localize("Дэн"),
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
    e("chill out", localize("успокойся, расслабься"), localize("Неформальная просьба снизить эмоциональный накал. На обиженного человека может действовать раздражающе."), [localize("разволнуйся"), localize("поторопись")], "We're fine. Just ", ".", localize("Успокойся. Всё в порядке."), ["Chill out. Everything is fine"], ["chill"]),
    { short: "a pain", meaningRu: localize("морока, неудобство"), noteRu: localize("Разговорно, без мата: о том, что доставляет хлопоты."), wrong: [localize("всё отлично"), localize("не знаю")], before: "Finding parking is ", after: ".", gapRu: localize("Искать парковку — та ещё морока."), translationRu: localize("Искать парковку — та ещё морока."), translationEn: ["Finding parking is a pain."] },
    e("bitching", localize("нытьё, жалобы"), localize("Глагол bitch в значении «жаловаться». Описывает жалобы и недовольство, а не похвалу."), [localize("похвала"), localize("молчание")], "Stop ", " about the weather.", localize("Хватит ныть о работе."), ["stop bitching about work", "stop your bitching about work"]),
  ],
  reviewPairs: [],
  scenario: {
    promptRu: localize("Как назвать неудобство без грубости?"),
    quote: localize("Тебе трудно найти парковку."),
    options: [
      "Finding parking is a pain.",
      "I'm over the moon.",
      "I'm all ears."
    ],
    answer: 0,
    whyRu: localize("A pain — разговорное «морока», без мата.")
  },
};

const chatContext: LessonSpec = {
  id: "chat-context",
  kind: "chat",
  title: "Be honest about real life",
  titleRu: localize("Честно говорить о реальной жизни"),
  subtitleRu: "ngl · irl · aka",
  ruleTitleRu: localize("Откровенность, реальная жизнь и уточнение имени"),
  introRu: localize("Ngl вводит честное мнение. Irl отделяет реальную жизнь от интернета, а aka уточняет имя или прозвище человека."),
  withWhomRu: localize("Мия"),
  lines: [
    { text: "His profile says he's a professional chef.", at: "20:12" },
    { me: true, text: "irl he only knows how to make pasta.", at: "20:12", glossRu: localize("irl — в реальной жизни") },
    { text: "You mean Max, aka the pasta chef?", at: "20:13", glossRu: localize("aka — он же") },
    { me: true, text: "Exactly. ngl, that's basically me too.", at: "20:13", glossRu: localize("ngl — если честно") },
  ],
  expressions: [
    e("ngl", localize("если честно, не буду врать"), localize("Not gonna lie. Вводит откровенное мнение или признание."), [localize("кстати"), localize("я шучу")], "", ", I didn't expect to win.", localize("Если честно, мне это нравится."), ["ngl, I like it", "not gonna lie, I like it"], ["not gonna lie"]),
    e("irl", localize("в реальной жизни, в реале"), localize("In real life. Противопоставляет реальность интернету, игре или онлайн-образу."), [localize("в интернете"), localize("в игре")], "We met online, but we've never met ", ".", localize("Мы впервые встретились в реальной жизни."), ["we met irl for the first time", "we met in real life for the first time"], ["in real life"]),
    e("aka", localize("также известный как, он же"), localize("Also known as. Ставится перед вторым именем, прозвищем или пояснением."), [localize("кстати"), localize("например")], "Maya, ", " May, is here.", localize("Майя, также известная как Мэй, уже здесь."), ["Maya, aka May, is here", "Maya aka May is here"], ["also known as"]),
  ],
  reviewPairs: [["chill out", localize("успокойся, расслабься")]],
  scenario: {
    promptRu: localize("Что написать перед откровенным мнением?"),
    quote: localize("Ты хочешь честно признаться: «Если честно, фильм мне не понравился»."),
    options: ["ngl, I didn't like the movie.", "irl, I didn't like the movie.", "aka, I didn't like the movie."],
    answer: 0,
    whyRu: localize("Ngl означает not gonna lie и вводит честное мнение."),
  },
};

const idiomNerves: LessonSpec = {
  id: "idiom-nerves",
  kind: "idiom",
  title: "Talk about nervousness",
  titleRu: localize("Говорить о нервах и волнении"),
  subtitleRu: "on edge · butterflies in my stomach",
  ruleTitleRu: localize("Два разных оттенка волнения"),
  introRu: localize("On edge — напряжённый и легко раздражаемый. Butterflies in your stomach — трепетное волнение перед свиданием, выступлением или важным событием."),
  withWhomRu: localize("Ева"),
  lines: [
    { text: "Why are you checking your phone every second?", at: "17:45" },
    { me: true, text: "I'm on edge about the interview.", at: "17:45", glossRu: localize("on edge — напряжён") },
    { text: "You'll be fine. Nervous?", at: "17:46" },
    { me: true, text: "Yeah, I have butterflies in my stomach.", at: "17:46", glossRu: localize("butterflies in my stomach — бабочки в животе") },
  ],
  expressions: [
    e("on edge", localize("на нервах, напряжён"), localize("Be on edge — находиться в напряжении, легко вздрагивать или раздражаться."), [localize("спокоен"), localize("счастлив")], "I've been ", " all morning.", localize("Я весь день на нервах."), ["I've been on edge all day", "I have been on edge all day"]),
    e("butterflies in my stomach", localize("бабочки в животе, трепетное волнение"), localize("Меняется местоимение: butterflies in your / his / her stomach."), [localize("боль в животе"), localize("голод")], "I always get ", " before a date.", localize("Перед выступлением у меня бабочки в животе."), ["I have butterflies in my stomach before the performance", "I get butterflies in my stomach before a performance"], ["butterflies in my stomach"]),
  ],
  reviewPairs: [["ngl", localize("если честно, не буду врать")], ["on cloud nine", localize("в полном восторге, на седьмом небе")]],
  scenario: {
    promptRu: localize("Что сказать перед первым свиданием?"),
    quote: localize("Тебе приятно, но от волнения внутри всё сжимается."),
    options: ["I have butterflies in my stomach.", "I'm off the hook.", "I'm by the book."],
    answer: 0,
    whyRu: localize("Butterflies in my stomach описывает именно трепетное волнение, а не обычную боль."),
  },
};

const speechReductions: LessonSpec = {
  id: "speech-reductions",
  kind: "speech",
  title: "Understand fast natural speech",
  titleRu: localize("Понимать быструю живую речь"),
  subtitleRu: "gonna · wanna · gotta",
  ruleTitleRu: localize("Три формы, которые постоянно звучат в разговоре"),
  introRu: localize("Gonna заменяет going to, wanna — want to, gotta — have got to или have to. Это разговорные формы для устной речи и личных сообщений, не для формального письма."),
  withWhomRu: localize("Лиам"),
  lines: [
    { text: "I'm gonna head out. Do you wanna come?", at: "16:20", glossRu: localize("gonna — собираюсь; wanna — хочешь") },
    { me: true, text: "I can't. I gotta study.", at: "16:20", glossRu: localize("gotta — мне нужно") },
    { text: "Okay, next time.", at: "16:21" },
  ],
  expressions: [
    e("gonna", localize("собираюсь что-то сделать"), localize("Разговорное going to. Используется с глаголом: I'm gonna call."), [localize("хочу"), localize("должен")], "I'm ", " call her tonight.", localize("Я собираюсь поспать."), ["I'm gonna sleep", "I am gonna sleep", "I'm going to sleep"], ["going to"]),
    e("wanna", localize("хочу, хочешь"), localize("Разговорное want to. Do you wanna go? — Ты хочешь пойти?"), [localize("должен"), localize("собираюсь")], "Do you ", " watch a movie?", localize("Я хочу остаться дома."), ["I wanna stay home", "I want to stay home"], ["want to"]),
    e("gotta", localize("нужно, должен"), localize("Разговорное have got to / have to. I gotta go — мне пора."), [localize("хочу"), localize("могу")], "I ", " finish this first.", localize("Мне нужно идти."), ["I gotta go", "I have got to go", "I have to go"], ["have got to", "have to"]),
  ],
  reviewPairs: [["on edge", localize("на нервах, напряжён")], ["irl", localize("в реальной жизни, в реале")]],
  scenario: {
    promptRu: localize("Как спросить друга в неформальном разговоре?"),
    quote: localize("Ты хочешь спросить: «Хочешь пойти с нами?»"),
    options: ["Do you wanna come with us?", "Do you gotta come with us?", "Do you gonna come with us?"],
    answer: 0,
    whyRu: localize("Wanna означает want to. Do you gonna грамматически неправильно; gonna нужна форма be."),
  },
};

const chatUncertainty: LessonSpec = {
  id: "chat-uncertainty",
  kind: "chat",
  title: "Say you do not know",
  titleRu: localize("Не знать ответа и мягко возражать"),
  subtitleRu: "I have no idea · I don't think so",
  ruleTitleRu: localize("Когда ответ неизвестен или вызывает сомнение"),
  introRu: localize("I have no idea честно говорит, что ты совсем не знаешь. I don't think so мягко выражает сомнение или несогласие: «думаю, что нет»."),
  withWhomRu: localize("Рита"),
  lines: [
    { text: "Where did I put my sunglasses?", at: "10:05" },
    { me: true, text: "I have no idea. Check your bag.", at: "10:05", glossRu: localize("I have no idea — понятия не имею") },
    { text: "Are they in your car?", at: "10:06" },
    { me: true, text: "I don't think so.", at: "10:06", glossRu: localize("I don't think so — думаю, что нет") },
  ],
  expressions: [
    e("I have no idea", localize("понятия не имею, совсем не знаю"), localize("Естественная разговорная фраза, когда у тебя нет даже предположения."), [localize("я всё знаю"), localize("мне всё равно")], "Where is he? ", ".", localize("Понятия не имею, где она."), ["I have no idea where she is", "I have no idea where she is."]),
    e("I don't think so", localize("думаю, что нет; не думаю"), localize("Мягкое сомнение или несогласие, а не категоричный отказ."), [localize("я уверен"), localize("я согласен")], "Is it going to rain? ", ".", localize("Думаю, он не придёт."), ["I don't think he's coming", "I don't think he is coming", "I don't think so"]),
  ],
  reviewPairs: [["gonna", localize("собираюсь что-то сделать")]],
  scenario: {
    promptRu: localize("Что ответить, если у тебя нет даже предположения?"),
    quote: localize("«Куда делись мои ключи?» — а ты совсем не знаешь."),
    options: ["I have no idea.", "I don't think so.", "Fair enough."],
    answer: 0,
    whyRu: localize("I have no idea означает полное отсутствие ответа или предположения."),
  },
};

const idiomLowKey: LessonSpec = {
  id: "idiom-low-key",
  kind: "idiom",
  title: "Feel sick and keep a low profile",
  titleRu: localize("Плохо себя чувствовать и не высовываться"),
  subtitleRu: "under the weather · lie low",
  ruleTitleRu: localize("Когда нужен спокойный день"),
  introRu: localize("Under the weather — немного нездоров. Lie low — вести себя тихо, не привлекать внимания или временно затаиться."),
  withWhomRu: localize("Олег"),
  lines: [
    { text: "Are you coming to the party?", at: "12:40" },
    { me: true, text: "No, I'm a bit under the weather.", at: "12:40", glossRu: localize("under the weather — плохо себя чувствую") },
    { text: "Got it. Rest today.", at: "12:41" },
    { me: true, text: "Yeah, I'm going to lie low all weekend.", at: "12:41", glossRu: localize("lie low — отсидеться тихо") },
  ],
  expressions: [
    e("under the weather", localize("нездоров, плохо себя чувствую"), localize("Обычно о лёгком недомогании, а не о серьёзной болезни."), [localize("под дождём"), localize("в отличной форме")], "I'm feeling a bit ", " today.", localize("Я немного нездоров сегодня."), ["I'm a bit under the weather today", "I am a bit under the weather today"]),
    e("lie low", localize("затаиться, не привлекать внимания"), localize("Правильная идиома — lie low. Может означать спокойный отдых или намеренное желание остаться незамеченным."), [localize("лежать низко"), localize("хвастаться")], "After that argument, he decided to ", ".", localize("Я решил затаиться на несколько дней."), ["I decided to lie low for a few days", "I decided to lie low for a couple of days"]),
  ],
  reviewPairs: [["I have no idea", localize("понятия не имею, совсем не знаю")], ["wanna", localize("хочу, хочешь")]],
  scenario: {
    promptRu: localize("Как вежливо объяснить отмену планов?"),
    quote: localize("Ты немного заболел и не хочешь идти на вечеринку."),
    options: ["I'm under the weather.", "I'm over the moon.", "I'm on the same page."],
    answer: 0,
    whyRu: localize("Under the weather — естественное описание лёгкого недомогания."),
  },
};

const speechLabels: LessonSpec = {
  id: "speech-labels",
  kind: "speech",
  title: "Praise people and their work",
  titleRu: localize("Хвалить людей и их работу"),
  subtitleRu: "badass · nerd · top-notch",
  ruleTitleRu: localize("Хвалить людей и их работу"),
  introRu: localize("Badass — грубоватый комплимент смелости или крутости. Nerd может быть дружеским самоописанием или обидным ярлыком. Top-notch — отличного качества, без грубости."),
  withWhomRu: localize("Зои"),
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
    e("badass", localize("крутой, дерзкий, бесстрашный"), localize("Неформальный комплимент человеку или поступку. Может быть и существительным, и прилагательным."), [localize("слабый"), localize("скучный")], "She fought for her team. She's a ", ".", localize("Этот трюк был очень крутым."), ["that trick was badass", "the trick was badass"]),
    e("nerd", localize("ботаник, человек, увлечённый темой"), localize("Может быть обидным ярлыком или дружеским самоописанием: a computer nerd."), [localize("чемпион"), localize("дурак")], "My brother is a real science ", ".", localize("Я немного фанатею от истории."), ["I'm a bit of a history nerd", "I am a bit of a history nerd"]),
    { short: "top-notch", meaningRu: localize("первоклассный, отличного качества"), noteRu: localize("Положительная оценка качества без грубости."), wrong: [localize("всё отлично"), localize("не знаю")], before: "Your work is ", after: ".", gapRu: localize("Твоя работа — первоклассная."), translationRu: localize("Твоя работа — первоклассная."), translationEn: ["Your work is top-notch."] },
  ],
  reviewPairs: [],
  scenario: {
    promptRu: localize("Как похвалить качество без грубости?"),
    quote: localize("Друг хорошо собрал компьютер."),
    options: [
      "The build quality is top-notch.",
      "It's under the weather.",
      "It's on edge."
    ],
    answer: 0,
    whyRu: localize("Top-notch означает «первоклассный», без грубого оттенка.")
  },
};

const chatBoundaries: LessonSpec = {
  id: "chat-boundaries",
  kind: "chat",
  title: "Drop a topic and set a boundary",
  titleRu: localize("Закрыть тему и попросить оставить в покое"),
  subtitleRu: "never mind · what are you talking about · leave me alone",
  ruleTitleRu: localize("Когда продолжать разговор не хочется"),
  introRu: localize("Never mind закрывает вопрос или просьбу. What are you talking about выражает недоумение. Leave me alone — прямая просьба оставить в покое или отстать от человека."),
  withWhomRu: localize("Джош"),
  lines: [
    { text: "Are you still upset?", at: "22:30" },
    { me: true, text: "What are you talking about? I wasn't upset.", at: "22:30", glossRu: localize("what are you talking about — о чём ты вообще?") },
    { text: "Okay, never mind.", at: "22:31", glossRu: localize("never mind — неважно") },
    { me: true, text: "Just leave me alone for a bit.", at: "22:31", glossRu: localize("leave me alone — оставь меня в покое") },
  ],
  expressions: [
    e("never mind", localize("неважно, забудь"), localize("Закрывает предыдущий вопрос или просьбу. Не универсальный ответ на извинение."), [localize("помни всегда"), localize("я согласен")], "", ", it doesn't matter anymore.", localize("Неважно, я уже решил проблему."), ["never mind, I solved the problem", "never mind. I solved the problem"]),
    e("what are you talking about", localize("о чём ты вообще, что ты имеешь в виду"), localize("Выражает сильное недоумение или несогласие, иногда звучит конфликтно."), [localize("я всё понимаю"), localize("расскажи подробнее")], "", "? I never said that.", localize("О чём ты? Я этого не делал."), ["what are you talking about? I didn't do that", "what are you talking about? I did not do that"]),
    e("leave me alone", localize("оставь меня в покое, отстань от меня"), localize("Прямая просьба прекратить общение или не трогать человека."), [localize("пойдём со мной"), localize("помоги мне")], "I need some space. ", ".", localize("Пожалуйста, оставь меня в покое."), ["please leave me alone", "leave me alone, please"]),
  ],
  reviewPairs: [["badass", localize("крутой, дерзкий, бесстрашный")], ["lie low", localize("затаиться, не привлекать внимания")]],
  scenario: {
    promptRu: localize("Как прямо попросить не продолжать разговор?"),
    quote: localize("Ты хочешь побыть один и не готов обсуждать проблему."),
    options: ["Leave me alone.", "I'm all ears.", "Give me a break."],
    answer: 0,
    whyRu: localize("Leave me alone — прямая просьба оставить человека в покое."),
  },
};

const idiomDecisions: LessonSpec = {
  id: "idiom-decisions",
  kind: "idiom",
  title: "Change your mind and cool off",
  titleRu: localize("Передумать и остыть после спора"),
  subtitleRu: "change my mind · cool off",
  ruleTitleRu: localize("Решение можно изменить, эмоции — успокоить"),
  introRu: localize("Change your mind означает изменить решение или мнение. Cool off — успокоиться после злости, спора или сильного волнения."),
  withWhomRu: localize("Кейт"),
  lines: [
    { text: "Are you still not talking to Dan?", at: "19:10" },
    { me: true, text: "I need to cool off first.", at: "19:10", glossRu: localize("cool off — остыть") },
    { text: "Are you cancelling the trip too?", at: "19:11" },
    { me: true, text: "Maybe I'll change my mind tomorrow.", at: "19:11", glossRu: localize("change my mind — передумать") },
  ],
  expressions: [
    e("change my mind", localize("передумать, изменить мнение"), localize("Меняется местоимение: change your / his / her mind."), [localize("изменить погоду"), localize("забыть решение")], "I was going to leave, but I ", ".", localize("Я передумал насчёт поездки."), ["I changed my mind about the trip", "I've changed my mind about the trip"], ["change my mind", "changed my mind"]),
    e("cool off", localize("остыть, успокоиться"), localize("Может относиться к эмоциям или буквальному снижению температуры; здесь — эмоции."), [localize("разозлиться"), localize("замёрзнуть")], "Let's talk after we both ", ".", localize("Мне нужно остыть после спора."), ["I need to cool off after the argument", "I need to cool off after our argument"]),
  ],
  reviewPairs: [["never mind", localize("неважно, забудь")], ["top-notch", localize("первоклассный, отличного качества")]],
  scenario: {
    promptRu: localize("Что сказать после эмоционального спора?"),
    quote: localize("Ты не хочешь продолжать разговор, пока не успокоишься."),
    options: ["I need to cool off.", "I need to cut corners.", "I need to lie low."],
    answer: 0,
    whyRu: localize("Cool off означает остыть эмоционально и успокоиться."),
  },
};

const speechInsults: LessonSpec = {
  id: "speech-insults",
  kind: "speech",
  title: "Respond to rude behavior",
  titleRu: localize("Реагировать на невежливое поведение"),
  subtitleRu: "douchebag · not cool · cross the line",
  ruleTitleRu: localize("Реагировать на невежливое поведение"),
  introRu: localize("Douchebag — сильное оскорбление, которое полезно понимать. Not cool осуждает поступок без мата. Cross the line означает перейти границу допустимого."),
  withWhomRu: localize("Макс"),
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
    e("douchebag", localize("м*дак, неприятный самодовольный тип"), localize("Сильное оскорбление поведения и характера, не просто нейтральное «глупый»."), [localize("приятный человек"), localize("скромный человек")], "He acted like a total ", ".", localize("Он вёл себя как настоящий м*дак."), ["he acted like a total douchebag", "he was a total douchebag"]),
    { short: "not cool", meaningRu: localize("так не делают, это нехорошо"), noteRu: localize("Осуждает поступок без оскорбления человека."), wrong: [localize("всё отлично"), localize("не знаю")], before: "Laughing at her was ", after: ".", gapRu: localize("Смеяться над ней было нехорошо."), translationRu: localize("Смеяться над ней было нехорошо."), translationEn: ["Laughing at her was not cool."] },
    { short: "cross the line", meaningRu: localize("перейти границу допустимого"), noteRu: localize("О поведении, которое выходит за допустимые рамки."), wrong: [localize("всё отлично"), localize("не знаю")], before: "Personal insults ", after: ".", gapRu: localize("Личные оскорбления переходят границу допустимого."), translationRu: localize("Личные оскорбления переходят границу допустимого."), translationEn: ["Personal insults cross the line."] },
  ],
  reviewPairs: [["cool off", localize("остыть, успокоиться")]],
  scenario: {
    promptRu: localize("Как осудить поступок без оскорбления?"),
    quote: localize("Человек растолкал людей в очереди."),
    options: [
      "That's not cool.",
      "What a douchebag.",
      "That's top-notch."
    ],
    answer: 0,
    whyRu: localize("Not cool оценивает поступок без грубого ярлыка.")
  },
};

const chatAnger: LessonSpec = {
  id: "chat-anger",
  kind: "chat",
  title: "Express frustration",
  titleRu: localize("Выражать досаду в переписке"),
  subtitleRu: "damn · seriously? · so frustrating",
  ruleTitleRu: localize("Выражать досаду в переписке"),
  introRu: localize("Damn — грубоватое восклицание досады. Seriously? выражает удивление или недоверие без мата. So frustrating описывает раздражающую ситуацию."),
  withWhomRu: localize("Нина"),
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
    e("damn", localize("чёрт, блин"), localize("Грубоватое восклицание досады, злости или удивления."), [localize("отлично"), localize("спасибо")], "I missed the last train. ", ".", localize("Чёрт, я забыл кошелёк."), ["damn, I forgot my wallet", "damn. I forgot my wallet"]),
    { short: "seriously?", meaningRu: localize("серьёзно?"), noteRu: localize("Реакция удивления или недоверия; тон может быть возмущённым."), wrong: [localize("всё отлично"), localize("не знаю")], before: "Wait, ", after: "", gapRu: localize("Погоди, серьёзно?"), translationRu: localize("Погоди, серьёзно?"), translationEn: ["Wait, seriously?"] },
    { short: "so frustrating", meaningRu: localize("так раздражает"), noteRu: localize("О ситуации, вызывающей раздражение; без мата."), wrong: [localize("всё отлично"), localize("не знаю")], before: "This delay is ", after: ".", gapRu: localize("Эта задержка так раздражает."), translationRu: localize("Эта задержка так раздражает."), translationEn: ["This delay is so frustrating."] },
  ],
  reviewPairs: [["not cool", localize("так не делают, это нехорошо")]],
  scenario: {
    promptRu: localize("Как описать раздражение без ругани?"),
    quote: localize("Поезд снова задержали."),
    options: [
      "This is so frustrating.",
      "I'm on cloud nine.",
      "It's top-notch."
    ],
    answer: 0,
    whyRu: localize("So frustrating описывает раздражающую ситуацию без ругани.")
  },
};

const idiomConfrontation: LessonSpec = {
  id: "idiom-confrontation",
  kind: "idiom",
  title: "Enjoy a game and question a claim",
  titleRu: localize("Обсуждать игру и сомневаться в словах"),
  subtitleRu: "the best seats in the house · take it with a grain of salt · come out on top",
  ruleTitleRu: localize("Обсуждать игру и сомневаться в словах"),
  introRu: localize("The best seats in the house — лучшие места в зале. Take it with a grain of salt — относиться к словам скептически. Come out on top — выйти победителем. Все три выражения без мата."),
  withWhomRu: localize("Рой"),
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
    e("the best seats in the house", localize("лучшие места в зале"), localize("House здесь означает зал или площадку, а не частный дом."), [localize("худшие места"), localize("места возле дома")], "We got ", "!", localize("У нас лучшие места в зале."), ["we have the best seats in the house", "we've got the best seats in the house"]),
    { short: "take it with a grain of salt", meaningRu: localize("отнестись к этому скептически"), noteRu: localize("Не принимать сказанное на веру полностью."), wrong: [localize("всё отлично"), localize("не знаю")], before: "That is only a prediction. ", after: ".", gapRu: localize("Это лишь прогноз. Отнесись к нему скептически."), translationRu: localize("Это лишь прогноз. Отнесись к нему скептически."), translationEn: ["That is only a prediction. take it with a grain of salt."] },
    { short: "come out on top", meaningRu: localize("выйти победителем"), noteRu: localize("Победить в соревновании или сложной ситуации."), wrong: [localize("всё отлично"), localize("не знаю")], before: "Our team can ", after: ".", gapRu: localize("Наша команда может выйти победителем."), translationRu: localize("Наша команда может выйти победителем."), translationEn: ["Our team can come out on top."] },
  ],
  reviewPairs: [["leave me alone", localize("оставь меня в покое, отстань от меня")]],
  scenario: {
    promptRu: localize("Как сказать, что команда может победить?"),
    quote: localize("Ты веришь в свою команду."),
    options: [
      "We can come out on top.",
      "We can lie low.",
      "We can cut corners."
    ],
    answer: 0,
    whyRu: localize("Come out on top означает выйти победителем.")
  },
};

const speechProfanity: LessonSpec = {
  id: "speech-profanity",
  kind: "speech",
  title: "Question a dubious explanation",
  titleRu: localize("Сомневаться в чужом объяснении"),
  subtitleRu: "bullshit · that doesn't add up · I'm not buying it",
  ruleTitleRu: localize("Сомневаться в чужом объяснении"),
  introRu: localize("Bullshit — очень грубая оценка слов как чуши или вранья. That doesn’t add up указывает на несостыковку без мата. I’m not buying it — неформальное «я в это не верю»."),
  withWhomRu: localize("Эмма"),
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
    e("bullshit", localize("чушь, враньё, несправедливость"), localize("Очень грубое отрицание слов или ситуации. That's bullshit — это полная чушь."), [localize("правда"), localize("отличная новость")], "His explanation is complete ", ".", localize("Это полная чушь."), ["that's complete bullshit", "this is complete bullshit", "that's bullshit"]),
    { short: "that doesn't add up", meaningRu: localize("что-то не сходится"), noteRu: localize("В объяснении есть несостыковка. Без грубости."), wrong: [localize("всё отлично"), localize("не знаю")], before: "Wait, ", after: ".", gapRu: localize("Погоди, что-то не сходится."), translationRu: localize("Погоди, что-то не сходится."), translationEn: ["Wait, that doesn't add up."] },
    { short: "I'm not buying it", meaningRu: localize("я в это не верю"), noteRu: localize("Разговорное недоверие; речь не о покупке."), wrong: [localize("всё отлично"), localize("не знаю")], before: "Sorry, ", after: ".", gapRu: localize("Извини, я в это не верю."), translationRu: localize("Извини, я в это не верю."), translationEn: ["Sorry, I'm not buying it."] },
  ],
  reviewPairs: [["take it with a grain of salt", localize("отнестись к этому скептически")]],
  scenario: {
    promptRu: localize("Как указать на несостыковку без ругани?"),
    quote: localize("Две части рассказа противоречат друг другу."),
    options: [
      "That doesn't add up.",
      "That's bullshit.",
      "That's top-notch."
    ],
    answer: 0,
    whyRu: localize("That doesn’t add up указывает на противоречие без мата.")
  },
};

const chatReassurance: LessonSpec = {
  id: "chat-reassurance",
  kind: "chat",
  title: "Agree and reassure in a chat",
  titleRu: localize("Согласиться и успокоить в переписке"),
  subtitleRu: "say less · no biggie · all good",
  ruleTitleRu: localize("Три коротких ответа без лишних слов"),
  introRu: localize("Say less показывает согласие и понимание. No biggie и all good успокаивают собеседника: проблемы нет, всё нормально."),
  withWhomRu: localize("Алекс"),
  lines: [
    { text: "I'll pick you up at seven and bring your charger.", at: "18:05" },
    { me: true, text: "Say less. See you at seven.", at: "18:05", glossRu: localize("say less — всё понял") },
    { text: "Sorry, I forgot your coffee.", at: "18:06" },
    { me: true, text: "No biggie. It's all good.", at: "18:06", glossRu: localize("no biggie — ничего страшного; all good — всё нормально") },
  ],
  expressions: [
    e("say less", localize("всё понял, договорились"), localize("Показывает согласие или понимание: дальше объяснять не нужно."), [localize("я не понял"), localize("продолжай объяснять")], "I'll handle everything. ", "!", localize("Договорились, я всё понял."), ["say less, I get it", "say less. I get it"]),
    e("no biggie", localize("ничего страшного, не проблема"), localize("Неформальный ответ на извинение или небольшую ошибку."), [localize("большая проблема"), localize("очень важно")], "You forgot your pen? ", ".", localize("Ничего страшного, я не злюсь."), ["no biggie, I'm not mad", "no biggie. I'm not mad"]),
    e("all good", localize("всё нормально, всё в порядке"), localize("Успокаивает собеседника или подтверждает, что проблемы нет."), [localize("всё плохо"), localize("всё закончено")], "Don't worry. It's ", ".", localize("Не переживай, всё в порядке."), ["don't worry, it's all good", "don't worry. it's all good"]),
  ],
  reviewPairs: [["fair enough", localize("справедливо, принято")]],
  scenario: {
    promptRu: localize("Как ответить на извинение друга?"),
    quote: localize("Друг забыл твой кофе и извинился. Ты не злишься."),
    options: ["No biggie. It's all good.", "I'm on edge.", "You wish."],
    answer: 0,
    whyRu: localize("No biggie и all good естественно показывают, что из-за маленькой ошибки переживать не нужно."),
  },
};

const idiomImpressions: LessonSpec = {
  id: "idiom-impressions",
  kind: "idiom",
  title: "Praise precision and special impressions",
  titleRu: localize("Похвалить точность и особенное впечатление"),
  subtitleRu: "on point · hits different",
  ruleTitleRu: localize("Когда что-то безупречно или особенно заходит"),
  introRu: localize("On point описывает безупречный результат или точный ответ. Hits different означает, что вещь или момент вызывает особенно сильные, необычные ощущения."),
  withWhomRu: localize("Софи"),
  lines: [
    { text: "Your presentation was on point.", at: "13:20", glossRu: localize("on point — безупречно") },
    { me: true, text: "Thanks! Did you like the song I used?", at: "13:20" },
    { text: "Yeah, it hits different at night.", at: "13:21", glossRu: localize("hits different — ощущается совершенно иначе") },
  ],
  expressions: [
    e("on point", localize("безупречный, прямо в точку"), localize("Подходит для образа, выступления, ответа или другого точного результата."), [localize("совсем мимо"), localize("небрежный")], "Your outfit is ", ".", localize("Твой ответ был прямо в точку."), ["your answer was on point"]),
    e("hits different", localize("ощущается совершенно иначе, особенно сильно"), localize("Обычно о положительном или эмоционально особенном впечатлении."), [localize("ничем не отличается"), localize("совсем не нравится")], "This song ", " late at night.", localize("Этот фильм вечером ощущается совершенно иначе."), ["this movie hits different in the evening"]),
  ],
  reviewPairs: [["off the hook", localize("свободен от обязанности")]],
  scenario: {
    promptRu: localize("Как похвалить безупречный образ?"),
    quote: localize("Друг отлично подобрал одежду, и тебе всё в нём нравится."),
    options: ["Your outfit is on point.", "Your outfit is a piece of cake.", "Your outfit is on cloud nine."],
    answer: 0,
    whyRu: localize("On point — естественный комплимент безупречному образу или результату."),
  },
};

const speechBoldEnergy: LessonSpec = {
  id: "speech-bold-energy",
  kind: "speech",
  title: "Go all in and praise confidence",
  titleRu: localize("Выложиться на полную и похвалить уверенность"),
  subtitleRu: "full send · built different",
  ruleTitleRu: localize("Смелое действие и особенный характер"),
  introRu: localize("Full send — действовать на полную, не сдерживаясь. Built different — комплимент человеку, который выделяется способностями, характером или мышлением."),
  withWhomRu: localize("Джейк"),
  lines: [
    { text: "Are you nervous about the final?", at: "09:10" },
    { me: true, text: "No. I'm going full send.", at: "09:10", glossRu: localize("full send — на полную") },
    { text: "You stayed calm through all that?", at: "09:11" },
    { me: true, text: "I'm built different.", at: "09:11", glossRu: localize("built different — не такой, как все") },
  ],
  expressions: [
    e("full send", localize("на полную, без колебаний"), localize("Очень неформальное выражение о решительном действии без сдерживания."), [localize("наполовину"), localize("без интереса")], "We're going ", " tonight.", localize("Давай выкладываться на полную."), ["let's go full send"]),
    e("built different", localize("не такой, как все, особенный"), localize("Неформальный комплимент способностям, характеру или необычному мышлению."), [localize("совсем обычный"), localize("без способностей")], "She trained every day. She's ", ".", localize("Он не такой, как все."), ["he's built different", "he is built different"]),
  ],
  reviewPairs: [["on point", localize("безупречный, в точку")], ["hits different", localize("ощущается иначе")]],
  scenario: {
    promptRu: localize("Как сказать, что ты действуешь на максимум?"),
    quote: localize("Ты не сомневаешься и готов полностью выложиться."),
    options: ["I'm going full send.", "I'm going to lie low.", "I'm under the weather."],
    answer: 0,
    whyRu: localize("Go full send означает действовать решительно и выкладываться на полную."),
  },
};

const chatEmphasis: LessonSpec = {
  id: "chat-emphasis",
  kind: "chat",
  title: "Soften or strengthen an opinion",
  titleRu: localize("Смягчить или усилить мнение"),
  subtitleRu: "lowkey · highkey",
  ruleTitleRu: localize("Два противоположных усилителя для живой речи"),
  introRu: localize("Lowkey смягчает мысль: слегка, втайне или не особенно афишируя. Highkey делает её сильнее: явно, открыто, очень."),
  withWhomRu: localize("Крис"),
  lines: [
    { text: "Did you like the party?", at: "23:40" },
    { me: true, text: "I lowkey loved it.", at: "23:40", glossRu: localize("lowkey — втайне") },
    { text: "I could tell. You were highkey dancing all night.", at: "23:41", glossRu: localize("highkey — вовсю") },
    { me: true, text: "Okay, maybe I was.", at: "23:41" },
  ],
  expressions: [
    e("lowkey", localize("слегка, по-тихому, не афишируя"), localize("Смягчает мысль или показывает, что чувство не выставляют напоказ."), [localize("открыто и явно"), localize("совсем не")], "I ", " want to go home.", localize("Я слегка устал."), ["I'm lowkey tired", "I am lowkey tired"]),
    e("highkey", localize("явно, открыто, очень"), localize("Усиливает мысль и противоположно lowkey по оттенку."), [localize("слегка"), localize("втайне")], "I ", " love this song.", localize("Мне очень нравится это место."), ["I highkey love this place"]),
  ],
  reviewPairs: [["kinda", localize("немного, слегка, вроде")]],
  scenario: {
    promptRu: localize("Как сказать, что тебе немного неловко?"),
    quote: localize("Ты не хочешь делать из этого большую проблему."),
    options: ["I'm lowkey embarrassed.", "I'm highkey embarrassed.", "I'm on point."],
    answer: 0,
    whyRu: localize("Lowkey смягчает признание, а highkey наоборот делает его более сильным и явным."),
  },
};

const idiomStory: LessonSpec = {
  id: "idiom-story",
  kind: "idiom",
  title: "Describe a story and an unexpected turn",
  titleRu: localize("Описать героя и неожиданный поворот"),
  subtitleRu: "main character · plot twist",
  ruleTitleRu: localize("Два выражения из языка историй и мемов"),
  introRu: localize("Main character — главный герой; в разговоре так описывают человека, который ведёт себя как центр истории. Plot twist — неожиданный поворот сюжета или событий."),
  withWhomRu: localize("Ник"),
  lines: [
    { text: "Why is Mia wearing sunglasses indoors?", at: "20:25" },
    { me: true, text: "She thinks she's the main character.", at: "20:25", glossRu: localize("main character — главный герой") },
    { text: "And guess who arrived with her?", at: "20:26" },
    { me: true, text: "Plot twist: her ex is here.", at: "20:26", glossRu: localize("plot twist — неожиданный поворот") },
  ],
  expressions: [
    e("main character", localize("главный герой, центр истории"), localize("Может быть буквальным или шутливым описанием человека, который ведёт себя как герой фильма."), [localize("статист"), localize("зритель")], "She acts like the ", ".", localize("Он ведёт себя как главный герой."), ["he acts like the main character"]),
    e("plot twist", localize("неожиданный поворот"), localize("Подходит для сюжета фильма, книги или неожиданного события в жизни."), [localize("предсказуемый финал"), localize("главный герой")], "The movie had a huge ", ".", localize("Неожиданный поворот: они оказались братьями."), ["plot twist: they were brothers", "plot twist, they were brothers"]),
  ],
  reviewPairs: [["no way", localize("не может быть, да ладно")]],
  scenario: {
    promptRu: localize("Как назвать неожиданную развязку?"),
    quote: localize("В конце фильма главный герой внезапно оказался злодеем."),
    options: ["What a plot twist.", "What a main character.", "What a nerd."],
    answer: 0,
    whyRu: localize("Plot twist — это неожиданный поворот событий или сюжета."),
  },
};

const speechUnfiltered: LessonSpec = {
  id: "speech-unfiltered",
  kind: "speech",
  title: "Describe unfiltered and inappropriate behavior",
  titleRu: localize("Описать прямолинейность и неуместное поведение"),
  subtitleRu: "zero filter · out of pocket · unhinged",
  ruleTitleRu: localize("Когда человек говорит или ведёт себя за гранью"),
  introRu: localize("Zero filter — без внутренней цензуры. Out of pocket — неуместно или за гранью. Unhinged — безбашенно, непредсказуемо, будто без контроля; часто с юмористическим оттенком."),
  withWhomRu: localize("Бен"),
  lines: [
    { text: "Did you hear what Ben said to the teacher?", at: "11:15" },
    { me: true, text: "He has zero filter.", at: "11:15", glossRu: localize("zero filter — говорит всё прямо, без внутренней цензуры") },
    { text: "That joke was completely out of pocket.", at: "11:16", glossRu: localize("out of pocket — неуместно") },
    { me: true, text: "Yeah, he's acting unhinged today.", at: "11:16", glossRu: localize("unhinged — безбашенный") },
  ],
  expressions: [
    e("zero filter", localize("без фильтров, без внутренней цензуры"), localize("О человеке, который сразу говорит то, что думает, даже если это неловко или грубо."), [localize("очень тактичный"), localize("молчаливый")], "He says whatever he thinks. He has ", ".", localize("Она говорит всё без фильтров."), ["she has zero filter"]),
    e("out of pocket", localize("неуместный, за гранью"), localize("Современный сленг о шутке, замечании или поведении, которые нарушают границы."), [localize("очень уместный"), localize("идеально вежливый")], "That comment was completely ", ".", localize("Его шутка была совсем неуместной."), ["his joke was totally out of pocket"]),
    e("unhinged", localize("безбашенный, вышедший из-под контроля"), localize("Может описывать шокирующее или хаотичное поведение; среди друзей часто звучит шутливо."), [localize("спокойный и собранный"), localize("предсказуемый")], "He's acting completely ", " today.", localize("Она сегодня ведёт себя безбашенно."), ["she's acting unhinged today", "she is acting unhinged today"]),
  ],
  reviewPairs: [["no way", localize("не может быть, да ладно")], ["that's wild", localize("вот это да, невероятно")]],
  scenario: {
    promptRu: localize("Как отреагировать на жестокую неуместную шутку?"),
    quote: localize("Друг пошутил над чужой внешностью за официальным ужином."),
    options: ["That was out of pocket.", "That was on point.", "That was a piece of cake."],
    answer: 0,
    whyRu: localize("Out of pocket описывает замечание или поступок, который был неуместным и перешёл границу."),
  },
};

const chatTruth: LessonSpec = {
  id: "chat-truth",
  kind: "chat",
  title: "Emphasize that you are serious",
  titleRu: localize("Подчеркнуть серьёзность и честность"),
  subtitleRu: "deadass · real talk · no cap",
  ruleTitleRu: localize("Три способа сказать «я серьёзно»"),
  introRu: localize("Deadass усиливает серьёзность. Real talk вводит откровенную мысль. No cap подчёркивает, что говорящий не врёт и не преувеличивает."),
  withWhomRu: localize("Джордан"),
  lines: [
    { text: "You really moved to New York?", at: "14:05" },
    { me: true, text: "Deadass. I got here yesterday.", at: "14:05", glossRu: localize("deadass — серьёзно") },
    { text: "How's it going?", at: "14:06" },
    { me: true, text: "Real talk, it's hard. But I love it here, no cap.", at: "14:06", glossRu: localize("real talk — если серьёзно; no cap — без вранья") },
  ],
  expressions: [
    e("deadass", localize("серьёзно, абсолютно серьёзно"), localize("Очень неформальный сленг. Может быть утверждением или вопросом «Deadass?» — «Серьёзно?»."), [localize("я шучу"), localize("понятия не имею")], "You won the lottery? ", "?", localize("Я абсолютно серьёзен."), ["I'm deadass serious", "I am deadass serious"]),
    e("real talk", localize("если серьёзно, без прикрас"), localize("Вводит искреннее мнение или серьёзную часть разговора."), [localize("пошутим"), localize("неважно")], "", ", I need a break.", localize("Если серьёзно, мне нужен отдых."), ["real talk, I need a break"]),
    e("no cap", localize("без вранья, честно"), localize("Ставится в начале или конце утверждения, чтобы подчеркнуть его правдивость."), [localize("я вру"), localize("может быть")], "That was the best concert ever, ", ".", localize("Это лучший фильм, без вранья."), ["this is the best movie, no cap", "this is the best movie no cap"]),
  ],
  reviewPairs: [["tbh", localize("честно говоря, если честно")], ["lowkey", localize("слегка, втайне")]],
  scenario: {
    promptRu: localize("Как подчеркнуть, что ты не врёшь?"),
    quote: localize("Ты действительно видел его там и хочешь добавить «без вранья»."),
    options: ["I saw him there, no cap.", "I saw him there, nvm.", "I saw him there, btw."],
    answer: 0,
    whyRu: localize("No cap добавляет утверждению оттенок «честно, без вранья»."),
  },
};

const idiomConfidence: LessonSpec = {
  id: "idiom-confidence",
  kind: "idiom",
  title: "Sound confident and know the routine",
  titleRu: localize("Говорить уверенно и знать порядок действий"),
  subtitleRu: "talk the talk · know the drill",
  ruleTitleRu: localize("Уверенная речь и знакомая процедура"),
  introRu: localize("Talk the talk — говорить уверенно и как человек, который разбирается в теме. Know the drill — знать знакомый порядок действий, что и как нужно делать."),
  withWhomRu: localize("Эми"),
  lines: [
    { text: "You've done this interview before, right?", at: "10:30" },
    { me: true, text: "Yeah, I know the drill.", at: "10:30", glossRu: localize("know the drill — знаю, что и как делать") },
    { text: "And you can talk the talk in English now.", at: "10:31", glossRu: localize("talk the talk — говорить как свои") },
    { me: true, text: "I'm ready.", at: "10:31" },
  ],
  expressions: [
    e("talk the talk", localize("говорить как свои, уверенно говорить о теме"), localize("О речи человека, который звучит знающе. Само по себе это ещё не доказывает реальных навыков."), [localize("совсем не разбираться"), localize("молчать")], "He knows slang and can ", ".", localize("Она уже говорит как свои."), ["she can talk the talk now"]),
    e("know the drill", localize("знать, что и как делать"), localize("О знакомой процедуре или порядке действий, который объяснять уже не нужно."), [localize("не знать порядок"), localize("делать всё впервые")], "I've done this before. I ", ".", localize("Ты знаешь, что делать."), ["you know the drill"]),
  ],
  reviewPairs: [["break a leg", localize("удачи, ни пуха ни пера")], ["on the same page", localize("быть на одной волне, одинаково понимать план")]],
  scenario: {
    promptRu: localize("Что сказать перед знакомой процедурой?"),
    quote: localize("Ты уже много раз проходил регистрацию и знаешь все шаги."),
    options: ["I know the drill.", "I talk the talk.", "I have no idea."],
    answer: 0,
    whyRu: localize("Know the drill означает, что порядок действий уже знаком и объяснения не нужны."),
  },
};

const speechPraise: LessonSpec = {
  id: "speech-praise",
  kind: "speech",
  title: "Give strong praise",
  titleRu: localize("Восторженно похвалить"),
  subtitleRu: "straight fire · different breed",
  ruleTitleRu: localize("Два ярких комплимента"),
  introRu: localize("Straight fire — восторженное «просто огонь» о музыке, образе или выступлении. Different breed описывает человека совсем другого уровня; оттенок зависит от контекста."),
  withWhomRu: localize("Майя"),
  lines: [
    { text: "Have you heard Maya's new track?", at: "22:10" },
    { me: true, text: "Yeah, it's straight fire.", at: "22:10", glossRu: localize("straight fire — просто огонь") },
    { text: "She wrote it in one night.", at: "22:11" },
    { me: true, text: "She's a different breed.", at: "22:11", glossRu: localize("different breed — совсем другой уровень") },
  ],
  expressions: [
    e("straight fire", localize("просто огонь, потрясающе"), localize("Очень неформальный восторг, особенно о музыке, образах и выступлениях."), [localize("полный провал"), localize("очень скучно")], "Her new album is ", ".", localize("Этот трек — просто огонь."), ["this track is straight fire"]),
    e("different breed", localize("совсем другой уровень, не такой как остальные"), localize("О человеке, который сильно выделяется. Часто это комплимент, но оттенок зависит от контекста."), [localize("совсем обычный"), localize("точная копия")], "He wins every game. He's a ", ".", localize("Она совсем другого уровня."), ["she's a different breed", "she is a different breed"]),
  ],
  reviewPairs: [["on point", localize("безупречный, в точку")], ["built different", localize("не такой, как все, особенный")]],
  scenario: {
    promptRu: localize("Как восторженно оценить новый трек?"),
    quote: localize("Песня тебе очень понравилась, и ты хочешь сказать «просто огонь»."),
    options: ["It's straight fire.", "It's under the weather.", "It's a piece of cake."],
    answer: 0,
    whyRu: localize("Straight fire — очень неформальный способ сказать, что что-то потрясающее."),
  },
};

// Keep stable IDs so existing completion records still point to the same lessons.
export const trackModules = [
  cycle("cycle-one", "The Warm-Up", "The Warm-Up", "Direct messages, useful idioms and bold slang.", localize("Прямые сообщения, полезные идиомы и смелый сленг."), chatHonesty, idiomBasics, speechTeasing),
  cycle("cycle-two", "Lowkey", "Lowkey", "Chat shorthand and natural reactions.", localize("Сокращения из чатов и естественные реакции."), chatNotes, idiomActions, speechReactions),
  cycle("cycle-three", "Big Mood", "Big Mood", "Make plans and respond without sounding formal.", localize("Договаривайся и отвечай без лишней формальности."), chatBasics, idiomPeople, speechAgreement),
  cycle("cycle-ten", "Full Send", "Full Send", "Easy replies, strong impressions and bold energy.", localize("Лёгкие ответы, яркие впечатления и смелая энергия."), chatReassurance, idiomImpressions, speechBoldEnergy),
  cycle("cycle-eleven", "Out of Pocket", "Out of Pocket", "Subtle hints, story moments and unfiltered reactions.", localize("Скрытые намёки, сюжетные повороты и реакции без фильтров."), chatEmphasis, idiomStory, speechUnfiltered),
  cycle("cycle-twelve", "Native Mode", "Native Mode", "Honest emphasis, natural confidence and high praise.", localize("Честные акценты, естественная уверенность и восторженные комплименты."), chatTruth, idiomConfidence, speechPraise),
  cycle("cycle-four", "No Cap", "No Cap", "Confirm, follow rules and answer teasing.", localize("Подтверждай, говори о правилах и отвечай на подколы."), chatPlans, idiomRules, speechBoundaries),
  cycle("cycle-five", "Say Less", "Say Less", "React to news, happiness and annoying situations.", localize("Реагируй на новости, радость и раздражающие ситуации."), chatReactions, idiomFeelings, speechComplaints),
  cycle("cycle-six", "Hits Different", "Hits Different", "Honest messages, nerves and fast spoken English.", localize("Честные сообщения, волнение и быстрая живая речь."), chatContext, idiomNerves, speechReductions),
  cycle("cycle-seven", "Straight Fire", "Straight Fire", "Uncertainty, rest and expressive descriptions.", localize("Неопределённость, отдых и яркие описания людей."), chatUncertainty, idiomLowKey, speechLabels),
  cycle("cycle-eight", "Zero Filter", "Zero Filter", "Close a topic, cool off and set boundaries.", localize("Закрывай тему, остывай и обозначай границы."), chatBoundaries, idiomDecisions, speechInsults),
  cycle("cycle-nine", "Built Different", "Built Different", "Frustration, competition and healthy skepticism.", localize("Досада, соревнование и здоровый скепсис."), chatAnger, idiomConfrontation, speechProfanity),
  ...trackExpansionModules,
];
