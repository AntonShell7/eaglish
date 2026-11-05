import { localize } from "@/i18n/content";
import { cycle, type ExpressionSpec, type LessonSpec } from "./trackModel";

type ExpressionOptions = {
  aliases?: string[];
  fullForm?: string;
  gapAnswers?: string[];
};

function e(
  short: string,
  meaningRu: string,
  noteRu: string,
  wrong: [string, string],
  before: string,
  after: string,
  gapRu: string,
  translationRu: string,
  translationEn: string[],
  options: ExpressionOptions = {},
): ExpressionSpec {
  return {
    short,
    meaningRu,
    noteRu,
    wrong,
    before,
    after,
    gapRu,
    gapAnswers: options.gapAnswers,
    translationRu,
    translationEn,
    aliases: options.aliases,
    fullForm: options.fullForm,
  };
}

const chatMeetups: LessonSpec = {
  id: "chat-meetups",
  kind: "chat",
  title: "Coordinate arrivals in a chat",
  titleRu: localize("Договариваться о встрече в переписке"),
  subtitleRu: "omw · eta · hbu",
  ruleTitleRu: localize("Сообщить, что ты в пути, и уточнить планы"),
  introRu: localize("Omw сообщает, что ты уже в пути. Eta — ожидаемое время прибытия; так спрашивают или сообщают, когда кто-то будет на месте. Hbu возвращает собеседнику тот же вопрос: «а ты?»."),
  withWhomRu: localize("Майя"),
  lines: [
    { text: "I'm at the café. hbu?", at: "17:42", glossRu: localize("hbu — а ты?") },
    { me: true, text: "omw! eta 10 minutes.", at: "17:42", glossRu: localize("omw — уже в пути; eta — ожидаемое время прибытия") },
    { text: "Perfect. I'll get us a table.", at: "17:43" },
  ],
  expressions: [
    e("omw", localize("уже в пути"), localize("Сообщает, что человек вышел и направляется к месту встречи. Для личной переписки."), [localize("уже на месте"), localize("не приду")], "I'm ", "! See you soon.", localize("Я уже в пути! Скоро увидимся."), localize("Я уже в пути. Буду через пять минут."), ["omw. I'll be there in five minutes"], { fullForm: "on my way" }),
    e("eta", localize("ожидаемое время прибытия"), localize("Используется в вопросе «What's your eta?» или в ответе «eta 10 minutes»."), [localize("время отправления"), localize("место встречи")], "Traffic is heavy. My ", " is 20 minutes.", localize("Пробки. Я буду примерно через двадцать минут."), localize("Моё ожидаемое время прибытия — 18:30."), ["my eta is 6:30 pm", "my eta is 6:30"], { aliases: ["eta?"], fullForm: "estimated time of arrival" }),
    e("hbu", localize("а ты?"), localize("Коротко возвращает собеседнику вопрос, который только что задали тебе."), [localize("а где ты?"), localize("а когда?")], "I'm already here. ", "?", localize("Я уже здесь. А ты?"), localize("Я уже в кафе. А ты?"), ["I'm already at the café. hbu?", "I'm already at the cafe. hbu?"], { fullForm: "how about you?" }),
  ],
  scenario: {
    promptRu: localize("Как сообщить, что ты вышел и скоро будешь?"),
    quote: localize("Друг ждёт тебя в кафе и спрашивает, где ты."),
    options: ["omw! eta 10 minutes.", "hbu?", "eta?"],
    answer: 0,
    whyRu: localize("Omw означает «уже в пути», а eta 10 minutes сообщает ожидаемое время прибытия."),
  },
};

const idiomIntroductions: LessonSpec = {
  id: "idiom-introductions",
  kind: "idiom",
  title: "Start a conversation and connect",
  titleRu: localize("Начать общение и найти контакт"),
  subtitleRu: "break the ice · hit it off · get off on the wrong foot",
  ruleTitleRu: localize("Первое знакомство без дословного перевода"),
  introRu: localize("Break the ice — снять неловкость и начать общение. Hit it off — сразу поладить. Get off on the wrong foot — неудачно начать знакомство или сотрудничество."),
  withWhomRu: localize("Лена"),
  lines: [
    { text: "I never know how to start talking to new people.", at: "19:05" },
    { me: true, text: "Ask about the music. It helps break the ice.", at: "19:05", glossRu: localize("break the ice — снять неловкость") },
    { text: "I tried it with Sam, and we hit it off immediately.", at: "19:06", glossRu: localize("hit it off — сразу поладить") },
    { me: true, text: "Nice! I got off on the wrong foot with his brother.", at: "19:06", glossRu: localize("get off on the wrong foot — неудачно начать знакомство") },
  ],
  expressions: [
    e("break the ice", localize("снять неловкость, начать общение"), localize("Так описывают первую фразу, вопрос или шутку, после которой общаться становится легче."), [localize("усилить неловкость"), localize("закончить разговор")], "He told a joke to ", ".", localize("Он пошутил, чтобы снять неловкость."), localize("Она задала вопрос, чтобы начать общение."), ["she asked a question to break the ice"]),
    e("hit it off", localize("сразу поладить"), localize("О двух людях, которым с первой встречи легко и приятно общаться друг с другом."), [localize("поссориться"), localize("не найти общих тем")], "We met yesterday and ", " immediately.", localize("Мы познакомились вчера и сразу поладили."), localize("Мы сразу поладили на вечеринке."), ["we hit it off at the party"]),
    e("get off on the wrong foot", localize("неудачно начать знакомство или сотрудничество"), localize("О плохом первом впечатлении или неудачном начале отношений, а не о буквальном шаге."), [localize("отлично начать"), localize("сразу поладить")], "I don't want to ", " with my new teammate.", localize("Я не хочу неудачно начать сотрудничество с новым коллегой."), localize("Я неудачно начал знакомство с соседом."), ["I got off on the wrong foot with my neighbor"]),
  ],
  scenario: {
    promptRu: localize("Что помогает снять неловкость при знакомстве?"),
    quote: localize("На вечеринке все молчат. Ты задаёшь лёгкий вопрос, и разговор начинается."),
    options: ["I broke the ice.", "I hit it off.", "I got off on the wrong foot."],
    answer: 0,
    whyRu: localize("Break the ice означает снять первоначальную неловкость и начать общение."),
  },
};

const speechPlans: LessonSpec = {
  id: "speech-plans",
  kind: "speech",
  title: "Accept or decline an invitation",
  titleRu: localize("Принять или отклонить приглашение"),
  subtitleRu: "I'm down · count me in · maybe some other time",
  ruleTitleRu: localize("Присоединиться к плану или отказаться"),
  introRu: localize("I'm down — неформальное «я за». Count me in подтверждает участие: «рассчитывайте на меня». Maybe some other time — мягкий отказ с предложением перенести планы."),
  withWhomRu: localize("Бен"),
  lines: [
    { text: "We're getting dinner tomorrow. Want to join?", at: "16:20" },
    { me: true, text: "I'm down. Count me in!", at: "16:20", glossRu: localize("I'm down — я за; count me in — я участвую") },
    { text: "We're also hiking on Saturday.", at: "16:21" },
    { me: true, text: "Maybe some other time. I need to rest.", at: "16:21", glossRu: localize("maybe some other time — может, в другой раз") },
  ],
  expressions: [
    e("I'm down", localize("я за, с удовольствием"), localize("Неформально выражает готовность присоединиться к предложению."), [localize("я против"), localize("я не могу")], "Pizza tonight? ", "!", localize("Пицца вечером? Я за!"), localize("Я за. Давай встретимся в семь."), ["I'm down. Let's meet at seven", "I am down. Let's meet at seven"], { aliases: ["I am down"] }),
    e("count me in", localize("я участвую, рассчитывайте на меня"), localize("Подтверждает, что говорящий хочет быть включённым в план."), [localize("меня не будет"), localize("я ещё подумаю")], "We're booking five tickets. ", "!", localize("Мы бронируем пять билетов. Рассчитывай на меня!"), localize("Я участвую. Добавь меня в список."), ["count me in. Add me to the list"]),
    e("maybe some other time", localize("может, в другой раз"), localize("Мягко отклоняет предложение, не закрывая возможность встретиться позже."), [localize("точно сейчас"), localize("я уже в пути")], "I can't make it today. ", ".", localize("Сегодня не получится. Может, в другой раз."), localize("Может, в другой раз. Сегодня я занят."), ["maybe some other time. I'm busy today", "maybe some other time. I am busy today"]),
  ],
  scenario: {
    promptRu: localize("Как сразу согласиться на приглашение?"),
    quote: localize("Друзья зовут тебя ужинать, и ты точно хочешь пойти."),
    options: ["I'm down. Count me in.", "Maybe some other time.", "hbu?"],
    answer: 0,
    whyRu: localize("I'm down и count me in оба выражают согласие присоединиться к плану."),
  },
};

const chatMistakes: LessonSpec = {
  id: "chat-mistakes",
  kind: "chat",
  title: "Explain a messaging mistake",
  titleRu: localize("Объяснить ошибку в переписке"),
  subtitleRu: "wrong chat · sent too soon · autocorrect strikes again",
  ruleTitleRu: localize("Когда сообщение ушло не так"),
  introRu: localize("Wrong chat — сообщение попало не в тот чат. Sent too soon — его отправили раньше времени, например не закончив мысль. Autocorrect strikes again — шутливое объяснение очередной странной автозамены."),
  withWhomRu: localize("Алекс"),
  lines: [
    { text: "Why did you send me a shopping list?", at: "11:12" },
    { me: true, text: "wrong chat! Sorry.", at: "11:12", glossRu: localize("wrong chat — не в тот чат") },
    { text: "Your last message ended mid-sentence.", at: "11:13" },
    { me: true, text: "sent too soon. And that weird word? autocorrect strikes again.", at: "11:13", glossRu: localize("sent too soon — отправил раньше времени; autocorrect strikes again — автозамена опять отличилась") },
  ],
  expressions: [
    e("wrong chat", localize("не в тот чат"), localize("Быстрое объяснение, что сообщение предназначалось другому человеку или группе."), [localize("не в то время"), localize("не то слово")], "That message was for Maya. ", ".", localize("Это сообщение для Майи. Не в тот чат."), localize("Не в тот чат. Прости."), ["wrong chat. Sorry"]),
    e("sent too soon", localize("отправил раньше времени"), localize("О сообщении, которое ушло случайно или до того, как его закончили."), [localize("отправил слишком поздно"), localize("не отправил вообще")], "I hit send by accident. ", ".", localize("Я случайно нажал «отправить». Отправил раньше времени."), localize("Отправил раньше времени. Я ещё не закончил."), ["sent too soon. I wasn't finished", "sent too soon. I was not finished"]),
    e("autocorrect strikes again", localize("автозамена опять отличилась"), localize("Шутливый комментарий к новой ошибке автозамены, особенно если она сильно изменила слово."), [localize("сообщение удалено"), localize("клавиатура отключилась")], "That strange word wasn't my fault. ", ".", localize("Это странное слово не моя вина. Автозамена опять отличилась."), localize("Автозамена опять отличилась. Я не это написал."), ["autocorrect strikes again. That's not what I typed", "autocorrect strikes again. That is not what I typed"]),
  ],
  scenario: {
    promptRu: localize("Что написать, если сообщение попало не туда?"),
    quote: localize("Ты отправил личное сообщение в общий чат."),
    options: ["wrong chat!", "sent too soon!", "autocorrect strikes again!"],
    answer: 0,
    whyRu: localize("Wrong chat прямо объясняет, что сообщение попало не в тот чат."),
  },
};

const idiomSetbacks: LessonSpec = {
  id: "idiom-setbacks",
  kind: "idiom",
  title: "Talk about setbacks and lessons",
  titleRu: localize("Говорить о неудачах и извлечённых уроках"),
  subtitleRu: "back to square one · learn the hard way · a blessing in disguise",
  ruleTitleRu: localize("Начать заново и увидеть пользу в неудаче"),
  introRu: localize("Back to square one — снова оказаться в исходной точке. Learn the hard way — научиться на горьком опыте. A blessing in disguise — неприятность, которая в итоге обернулась благом."),
  withWhomRu: localize("Лена"),
  lines: [
    { text: "Our app crashed again. The fix didn't work.", at: "14:18" },
    { me: true, text: "Back to square one, then.", at: "14:18", glossRu: localize("back to square one — снова в исходной точке") },
    { text: "I guess we'll learn the hard way not to skip tests.", at: "14:19", glossRu: localize("learn the hard way — научиться на горьком опыте") },
    { me: true, text: "Maybe the crash was a blessing in disguise. It showed us the real problem.", at: "14:19", glossRu: localize("a blessing in disguise — неприятность, которая обернулась благом") },
  ],
  expressions: [
    e("back to square one", localize("снова в исходной точке"), localize("О ситуации, когда прежняя работа не дала результата и приходится начинать заново."), [localize("перейти на новый уровень"), localize("завершить работу")], "The plan failed, so we're ", ".", localize("План не сработал, и мы снова в исходной точке."), localize("Придётся начать заново."), ["we're back to square one", "we are back to square one"]),
    e("learn the hard way", localize("научиться на горьком опыте"), localize("О знании, которое пришло через собственную неприятную ошибку, а не через совет или инструкцию."), [localize("выучить легко"), localize("научиться по учебнику")], "I didn't back up my files and lost everything. I ", ".", localize("Я не сохранил копию и всё потерял. Научился на горьком опыте."), localize("Я научился на горьком опыте не пропускать проверку."), ["I learned the hard way not to skip testing"], { gapAnswers: ["learned the hard way"] }),
    e("a blessing in disguise", localize("неприятность, которая обернулась благом"), localize("Сначала событие кажется плохим, но позже оказывается полезным или удачным."), [localize("очевидная удача"), localize("бесполезный подарок")], "Losing that job was difficult, but it was ", ".", localize("Потерять работу было тяжело, но эта неприятность обернулась благом."), localize("Та неприятность обернулась благом."), ["it was a blessing in disguise"]),
  ],
  scenario: {
    promptRu: localize("Что сказать, если приходится начинать заново?"),
    quote: localize("Решение не сработало, и вся предыдущая работа больше не помогает."),
    options: ["We're back to square one.", "We learned the hard way.", "It was a blessing in disguise."],
    answer: 0,
    whyRu: localize("Back to square one означает вернуться в исходную точку и начать заново."),
  },
};

const speechApologies: LessonSpec = {
  id: "speech-apologies",
  kind: "speech",
  title: "Admit a mistake and move on",
  titleRu: localize("Признать ошибку и не держать обиду"),
  subtitleRu: "my bad · that's on me · no hard feelings",
  ruleTitleRu: localize("Взять ответственность и сохранить отношения"),
  introRu: localize("My bad — короткое «мой косяк, виноват». That's on me переносит вину или ответственность на говорящего. No hard feelings означает «без обид» и показывает, что злости не осталось."),
  withWhomRu: localize("Ник"),
  lines: [
    { text: "You gave me the wrong address.", at: "20:08" },
    { me: true, text: "my bad. That's on me.", at: "20:08", glossRu: localize("my bad — мой косяк; that's on me — это моя вина") },
    { text: "I was annoyed, but it's okay now.", at: "20:09" },
    { me: true, text: "Good. No hard feelings?", at: "20:09", glossRu: localize("no hard feelings — без обид") },
  ],
  expressions: [
    e("my bad", localize("мой косяк, виноват"), localize("Неформальное признание собственной ошибки; короче и менее официально, чем полное извинение."), [localize("твоя ошибка"), localize("ничего не произошло")], "I forgot your coffee. ", ".", localize("Я забыл твой кофе. Мой косяк."), localize("Мой косяк. Я неправильно понял."), ["my bad. I misunderstood"]),
    e("that's on me", localize("это моя вина или ответственность"), localize("Говорящий признаёт свою ответственность за ошибку или последствия."), [localize("это твоя вина"), localize("никто не виноват")], "I gave you the wrong information. ", ".", localize("Я дал тебе неверную информацию. Это моя вина."), localize("Это моя вина. Я всё исправлю."), ["that's on me. I'll fix it", "that is on me. I will fix it"], { aliases: ["that is on me"] }),
    e("no hard feelings", localize("без обид"), localize("Показывает отсутствие злости после ошибки, спора или отказа."), [localize("я очень обижен"), localize("мы больше не общаемся")], "I forgive you. ", ".", localize("Я тебя прощаю. Без обид."), localize("Без обид. Я понимаю, почему ты так поступил."), ["no hard feelings. I understand why you did it"]),
  ],
  scenario: {
    promptRu: localize("Как коротко признать свою ошибку?"),
    quote: localize("Ты дал другу неверный адрес и хочешь взять вину на себя."),
    options: ["my bad. That's on me.", "No hard feelings.", "wrong chat."],
    answer: 0,
    whyRu: localize("My bad и that's on me означают, что говорящий признаёт ошибку и свою ответственность."),
  },
};

const chatAvailability: LessonSpec = {
  id: "chat-availability",
  kind: "chat",
  title: "Step away or leave a chat",
  titleRu: localize("Ненадолго отойти или выйти из переписки"),
  subtitleRu: "brb · afk · gtg",
  ruleTitleRu: localize("Три сокращения о паузе и уходе"),
  introRu: localize("Brb обещает скоро вернуться. Afk сообщает, что человек отошёл от компьютера. Gtg предупреждает, что пора заканчивать разговор и уходить."),
  withWhomRu: localize("Ник"),
  lines: [
    { text: "Are you still there?", at: "21:15" },
    { me: true, text: "brb. I need to grab my charger.", at: "21:15", glossRu: localize("brb — скоро вернусь") },
    { text: "No rush. I'll be afk for five minutes too.", at: "21:16", glossRu: localize("afk — отошёл от компьютера") },
    { me: true, text: "Back now, but gtg soon.", at: "21:22", glossRu: localize("gtg — мне пора") },
  ],
  expressions: [
    e("brb", localize("скоро вернусь"), localize("Сообщает о короткой паузе с намерением продолжить разговор."), [localize("не вернусь"), localize("мне пора")], "I need to answer the door. ", ".", localize("Мне нужно открыть дверь. Скоро вернусь."), localize("Скоро вернусь. Не уходи."), ["brb. Don't go", "brb. Do not go"], { fullForm: "be right back" }),
    e("afk", localize("отошёл от компьютера"), localize("Буквально «away from keyboard»; в чатах и играх сообщает, что человека временно нет за компьютером."), [localize("печатаю ответ"), localize("вернулся")], "I won't answer for ten minutes. I'll be ", ".", localize("Я не буду отвечать десять минут. Отойду от компьютера."), localize("Я отошёл от компьютера. Напишу позже."), ["I was afk. I'll reply later", "I was afk. I will reply later"], { fullForm: "away from keyboard" }),
    e("gtg", localize("мне пора"), localize("Коротко сообщает, что нужно уходить или завершать разговор."), [localize("я вернулся"), localize("я ненадолго отойду")], "It's getting late. ", ".", localize("Уже поздно. Мне пора."), localize("Мне пора. Поговорим завтра."), ["gtg. Talk to you tomorrow"], { fullForm: "got to go" }),
  ],
  scenario: {
    promptRu: localize("Как предупредить о короткой паузе?"),
    quote: localize("Тебе нужно на минуту открыть дверь, после чего ты продолжишь переписку."),
    options: ["brb.", "afk.", "gtg."],
    answer: 0,
    whyRu: localize("Brb означает «скоро вернусь», поэтому подходит для короткой паузы."),
  },
};

const idiomWorkload: LessonSpec = {
  id: "idiom-workload",
  kind: "idiom",
  title: "Describe pressure and too much work",
  titleRu: localize("Описать давление и слишком большую нагрузку"),
  subtitleRu: "under the gun · have a lot on your plate · bite off more than you can chew",
  ruleTitleRu: localize("Когда дел слишком много"),
  introRu: localize("Under the gun — под сильным давлением, часто из-за срока. Have a lot on your plate — иметь много дел и обязательств. Bite off more than you can chew — взять на себя больше, чем можешь выполнить."),
  withWhomRu: localize("Софи"),
  lines: [
    { text: "Why are you working so late?", at: "22:05" },
    { me: true, text: "I'm under the gun to finish this report, and I have a lot on my plate.", at: "22:05", glossRu: localize("under the gun — под сильным давлением; have a lot on your plate — иметь много дел") },
    { text: "You should ask for help.", at: "22:06" },
    { me: true, text: "You're right. I bit off more than I can chew.", at: "22:06", glossRu: localize("bite off more than you can chew — взять на себя слишком много") },
  ],
  expressions: [
    e("under the gun", localize("под сильным давлением"), localize("О необходимости сделать что-то срочно или в сложных условиях, а не о буквальном оружии."), [localize("в полном спокойствии"), localize("без обязательств")], "With the deadline tomorrow, I'm ", ".", localize("Дедлайн завтра, и я под сильным давлением."), localize("Я под сильным давлением из-за дедлайна."), ["I'm under the gun because of the deadline", "I am under the gun because of the deadline"]),
    e("have a lot on your plate", localize("иметь много дел и обязательств"), localize("О большой загрузке делами, работой или заботами, а не о еде."), [localize("иметь мало дел"), localize("отдыхать")], "I can't take another task. I ", ".", localize("Я не могу взять ещё одну задачу. У меня и так много дел."), localize("У меня сейчас много дел и обязательств."), ["I have a lot on my plate right now"]),
    e("bite off more than you can chew", localize("взять на себя слишком много"), localize("О задаче или количестве обязательств, с которыми человек не справляется."), [localize("взять посильную задачу"), localize("отказаться от работы")], "I took on three projects and ", ".", localize("Я взял три проекта и взял на себя слишком много."), localize("Я взял на себя слишком много."), ["I bit off more than I can chew"], { gapAnswers: ["bit off more than I can chew"] }),
  ],
  scenario: {
    promptRu: localize("Что сказать о работе с жёстким сроком?"),
    quote: localize("Отчёт нужно закончить к утру, и ты работаешь под сильным давлением."),
    options: ["I'm under the gun.", "I have a lot on my plate.", "I bit off more than I can chew."],
    answer: 0,
    whyRu: localize("Under the gun описывает сильное давление, особенно из-за срочного срока."),
  },
};

const speechSupport: LessonSpec = {
  id: "speech-support",
  kind: "speech",
  title: "Show sympathy and encouragement",
  titleRu: localize("Поддержать и проявить сочувствие"),
  subtitleRu: "I feel you · that sucks · you've got this",
  ruleTitleRu: localize("Понять чувства и приободрить"),
  introRu: localize("I feel you показывает, что ты понимаешь чувства собеседника. That sucks — неформальное сочувствие неприятной ситуации. You've got this — уверенное «ты справишься»."),
  withWhomRu: localize("Джейк"),
  lines: [
    { text: "I studied all weekend and still failed.", at: "18:40" },
    { me: true, text: "That sucks. I feel you.", at: "18:40", glossRu: localize("that sucks — как неприятно; I feel you — понимаю тебя") },
    { text: "The retake is tomorrow. I'm nervous.", at: "18:41" },
    { me: true, text: "You've got this.", at: "18:41", glossRu: localize("you've got this — ты справишься") },
  ],
  expressions: [
    e("I feel you", localize("понимаю тебя, понимаю твои чувства"), localize("Выражает сочувствие и эмоциональное понимание, а не буквальное прикосновение."), [localize("не понимаю тебя"), localize("слышу тебя плохо")], "I know how disappointing that feels. ", ".", localize("Я знаю, как это обидно. Понимаю тебя."), localize("Понимаю твои чувства. Это действительно тяжело."), ["I feel you. That's really hard", "I feel you. That is really hard"]),
    e("that sucks", localize("отстой, как неприятно"), localize("Неформальная реакция сочувствия на плохую новость или несправедливую ситуацию."), [localize("это замечательно"), localize("ты виноват")], "You missed the last bus? ", ".", localize("Ты пропустил последний автобус? Как неприятно."), localize("Отстой. Мне жаль, что так вышло."), ["that sucks. I'm sorry that happened", "that sucks. I am sorry that happened"]),
    e("you've got this", localize("ты справишься"), localize("Поддерживает человека перед трудной задачей и выражает уверенность в нём."), [localize("у тебя не получится"), localize("ты уже закончил")], "Don't give up. ", ".", localize("Не сдавайся. Ты справишься."), localize("Ты справишься. Я в тебя верю."), ["you've got this. I believe in you", "you have got this. I believe in you"], { aliases: ["you have got this"] }),
  ],
  scenario: {
    promptRu: localize("Как приободрить друга перед пересдачей?"),
    quote: localize("Друг нервничает, но хорошо подготовился и может справиться."),
    options: ["You've got this.", "That sucks.", "I feel you."],
    answer: 0,
    whyRu: localize("You've got this — естественная поддержка «ты справишься»."),
  },
};

const chatOpinions: LessonSpec = {
  id: "chat-opinions",
  kind: "chat",
  title: "Qualify knowledge and opinions",
  titleRu: localize("Уточнить знания и выразить мнение"),
  subtitleRu: "afaik · iirc · imo",
  ruleTitleRu: localize("Говорить точно о том, что знаешь и думаешь"),
  introRu: localize("Afaik ограничивает утверждение тем, что тебе известно. Iirc показывает, что ты полагаешься на память. Imo обозначает личное мнение, а не установленный факт."),
  withWhomRu: localize("Крис"),
  lines: [
    { text: "Is the shop open on Sunday?", at: "10:10" },
    { me: true, text: "afaik, it closes at six. iirc, they changed the schedule.", at: "10:10", glossRu: localize("afaik — насколько мне известно; iirc — если правильно помню") },
    { text: "Should we go early?", at: "10:11" },
    { me: true, text: "imo, before lunch is best.", at: "10:11", glossRu: localize("imo — по моему мнению") },
  ],
  expressions: [
    e("afaik", localize("насколько мне известно"), localize("Подчёркивает, что говорящий не гарантирует полноту или свежесть информации."), [localize("я абсолютно уверен"), localize("по моему мнению")], ", the museum is closed on Mondays.", "", localize("Насколько мне известно, музей по понедельникам закрыт."), localize("Насколько мне известно, магазин открыт."), ["afaik, the shop is open", "afaik the shop is open"], { fullForm: "as far as I know" }),
    e("iirc", localize("если правильно помню"), localize("Показывает, что утверждение основано на памяти и может требовать проверки."), [localize("если я забыл"), localize("насколько мне известно")], ", the meeting starts at nine.", "", localize("Если правильно помню, встреча начинается в девять."), localize("Если правильно помню, её зовут Анна."), ["iirc, her name is Anna", "iirc her name is Anna"], { fullForm: "if I recall correctly" }),
    e("imo", localize("по моему мнению"), localize("Вводит субъективную оценку или мнение говорящего."), [localize("это доказанный факт"), localize("если правильно помню")], ", the first option is better.", "", localize("По моему мнению, первый вариант лучше."), localize("По моему мнению, нам стоит подождать."), ["imo, we should wait", "imo we should wait"], { fullForm: "in my opinion" }),
  ],
  scenario: {
    promptRu: localize("Как обозначить личное мнение?"),
    quote: localize("Ты считаешь, что лучше поехать утром, но это твоя субъективная оценка."),
    options: ["imo, we should go in the morning.", "afaik, we should go in the morning.", "iirc, we should go in the morning."],
    answer: 0,
    whyRu: localize("Imo означает «по моему мнению» и вводит именно субъективную оценку."),
  },
};

const idiomDeciding: LessonSpec = {
  id: "idiom-deciding",
  kind: "idiom",
  title: "Decide, hesitate or take a risk",
  titleRu: localize("Решиться, колебаться или рискнуть"),
  subtitleRu: "take the plunge · sit on the fence · go out on a limb",
  ruleTitleRu: localize("Три идиомы о выборе и риске"),
  introRu: localize("Take the plunge — решиться на важный шаг. Sit on the fence — не выбирать сторону и уклоняться от решения. Go out on a limb — рискнуть, высказав мнение или поддержав кого-то."),
  withWhomRu: localize("Эми"),
  lines: [
    { text: "Are you finally starting your own business?", at: "12:30" },
    { me: true, text: "Yes. I'm ready to take the plunge.", at: "12:30", glossRu: localize("take the plunge — решиться на важный шаг") },
    { text: "I kept sitting on the fence for months.", at: "12:31", glossRu: localize("sit on the fence — не выбирать сторону") },
    { me: true, text: "Same. Then Sam went out on a limb and supported my idea.", at: "12:31", glossRu: localize("go out on a limb — рискнуть и поддержать кого-то") },
  ],
  expressions: [
    e("take the plunge", localize("решиться на важный шаг"), localize("О решении сделать что-то значимое или рискованное после сомнений."), [localize("отложить решение"), localize("отказаться навсегда")], "After months of doubt, she decided to ", ".", localize("После месяцев сомнений она решилась на важный шаг."), localize("Я решился на важный шаг и переехал."), ["I took the plunge and moved"]),
    e("sit on the fence", localize("не выбирать сторону, уклоняться от решения"), localize("О нерешительности или намеренном отказе поддержать одну из сторон."), [localize("сделать окончательный выбор"), localize("активно помочь")], "He won't choose a side. He keeps ", ".", localize("Он не выбирает сторону и продолжает уклоняться от решения."), localize("Хватит уклоняться от решения."), ["stop sitting on the fence"], { gapAnswers: ["sitting on the fence"] }),
    e("go out on a limb", localize("рискнуть, высказав мнение или поддержав кого-то"), localize("О поступке, при котором человек рискует репутацией или положением ради мнения, идеи или другого человека."), [localize("действовать безопасно"), localize("изменить своё мнение")], "She supported my unusual idea and ", ".", localize("Она рискнула и поддержала мою необычную идею."), localize("Он рискнул и поддержал мою идею."), ["he went out on a limb and supported my idea"], { gapAnswers: ["went out on a limb"] }),
  ],
  scenario: {
    promptRu: localize("Как сказать о решении начать своё дело?"),
    quote: localize("После долгих сомнений ты наконец готов сделать важный шаг."),
    options: ["I'm ready to take the plunge.", "I'm sitting on the fence.", "I'm going out on a limb."],
    answer: 0,
    whyRu: localize("Take the plunge означает решиться на важный или рискованный шаг."),
  },
};

const speechRefusals: LessonSpec = {
  id: "speech-refusals",
  kind: "speech",
  title: "Decline and leave the choice to someone",
  titleRu: localize("Отказаться и оставить выбор собеседнику"),
  subtitleRu: "not my thing · I'll pass · suit yourself",
  ruleTitleRu: localize("Отказ без лишних объяснений"),
  introRu: localize("Not my thing — это не соответствует твоим вкусам или интересам. I'll pass — вежливое неформальное «я откажусь». Suit yourself означает «как хочешь», но может звучать равнодушно или раздражённо в зависимости от интонации и контекста."),
  withWhomRu: localize("Бен"),
  lines: [
    { text: "Do you want to try karaoke?", at: "20:15" },
    { me: true, text: "Karaoke is not my thing. I'll pass.", at: "20:15", glossRu: localize("not my thing — это не моё; I'll pass — я откажусь") },
    { text: "Fine. I'm going anyway.", at: "20:16" },
    { me: true, text: "Suit yourself.", at: "20:16", glossRu: localize("suit yourself — как хочешь; может звучать равнодушно или раздражённо") },
  ],
  expressions: [
    e("not my thing", localize("это не моё"), localize("Спокойно объясняет, что занятие или вещь не нравится или не интересна говорящему."), [localize("это моё любимое занятие"), localize("я не умею это делать")], "I don't enjoy horror movies. They're ", ".", localize("Я не люблю фильмы ужасов. Это не моё."), localize("Караоке — не моё."), ["karaoke is not my thing"]),
    e("I'll pass", localize("я откажусь, я воздержусь"), localize("Неформально отклоняет предложение без подробных объяснений."), [localize("я согласен"), localize("я участвую")], "Another slice? No, thanks. ", ".", localize("Ещё кусок? Нет, спасибо. Я откажусь."), localize("Я откажусь. Может, в следующий раз."), ["I'll pass. Maybe next time", "I will pass. Maybe next time"], { aliases: ["I will pass"] }),
    e("suit yourself", localize("как хочешь, дело твоё"), localize("Оставляет решение собеседнику. Часто звучит равнодушно или раздражённо, поэтому важны интонация и отношения."), [localize("я настаиваю"), localize("сделай это для меня")], "You don't want to come? ", ".", localize("Не хочешь идти? Как хочешь."), localize("Как хочешь. Я пойду без тебя."), ["suit yourself. I'll go without you", "suit yourself. I will go without you"]),
  ],
  scenario: {
    promptRu: localize("Как коротко отказаться от предложения?"),
    quote: localize("Тебе предлагают ещё один десерт, но ты не хочешь."),
    options: ["I'll pass.", "Suit yourself.", "Not my thing."],
    answer: 0,
    whyRu: localize("I'll pass — естественный короткий отказ «я откажусь»."),
  },
};

const chatInformation: LessonSpec = {
  id: "chat-information",
  kind: "chat",
  title: "Share information and summarize",
  titleRu: localize("Поделиться информацией и кратко резюмировать"),
  subtitleRu: "fyi · icymi · tl;dr",
  ruleTitleRu: localize("Сообщить важное и выделить главное"),
  introRu: localize("Fyi вводит информацию к сведению. Icymi помогает поделиться тем, что собеседник мог пропустить. Tl;dr может означать «слишком длинно, не читал», а также обозначать краткое резюме или просьбу о нём. В конструкции «tl;dr: …» после двоеточия идёт главное."),
  withWhomRu: localize("Майя"),
  lines: [
    { text: "Did you see the schedule?", at: "09:25" },
    { me: true, text: "icymi, practice moved to seven.", at: "09:25", glossRu: localize("icymi — если ты пропустил") },
    { text: "I missed that. The post was huge. tl;dr?", at: "09:26", glossRu: localize("tl;dr — здесь просьба о кратком резюме") },
    { me: true, text: "fyi, the coach posted the rules. tl;dr: bring your own shoes.", at: "09:26", glossRu: localize("fyi — к сведению; tl;dr — краткое резюме") },
  ],
  expressions: [
    e("fyi", localize("к сведению"), localize("Добавляет полезную информацию, не требуя немедленного ответа или действия."), [localize("как твоё мнение"), localize("если ты согласен")], ", the entrance is on the other side.", "", localize("К сведению, вход с другой стороны."), localize("К сведению, встреча начинается в восемь."), ["fyi, the meeting starts at eight", "fyi the meeting starts at eight"], { fullForm: "for your information" }),
    e("icymi", localize("если ты пропустил"), localize("Предваряет новость или сообщение, которое собеседник мог не увидеть."), [localize("если ты согласен"), localize("к твоему сведению")], ", the deadline has changed.", "", localize("Если ты пропустил, дедлайн изменился."), localize("Если ты пропустил, урок перенесён."), ["icymi, the class was moved", "icymi the class was moved"], { fullForm: "in case you missed it" }),
    e("tl;dr", localize("краткое резюме; «слишком длинно, не читал»"), localize("Может быть реакцией на слишком длинный текст, названием краткого резюме или просьбой изложить главное."), [localize("очень подробный текст"), localize("я всё прочитал")], "", ": we need to arrive at eight.", localize("Кратко: нам нужно прийти к восьми."), localize("Краткое резюме: встреча в пятницу."), ["tl;dr: the meeting is on Friday"], { aliases: ["tldr"], fullForm: "too long; didn't read" }),
  ],
  scenario: {
    promptRu: localize("Как попросить изложить главное из длинного текста?"),
    quote: localize("Друг прислал огромный пост, а тебе сейчас нужно только краткое резюме."),
    options: ["tl;dr?", "fyi?", "icymi?"],
    answer: 0,
    whyRu: localize("Tl;dr? используется как просьба дать краткое резюме длинного текста."),
  },
};

const idiomInformation: LessonSpec = {
  id: "idiom-information",
  kind: "idiom",
  title: "Reveal, hide and infer information",
  titleRu: localize("Выдать, скрыть и понять скрытое"),
  subtitleRu: "spill the beans · keep someone in the dark · read between the lines",
  ruleTitleRu: localize("Секреты и скрытый смысл"),
  introRu: localize("Spill the beans — выдать секрет. Keep someone in the dark — держать кого-то в неведении. Read between the lines — понимать скрытый смысл, который не выражен прямо."),
  withWhomRu: localize("Ник"),
  lines: [
    { text: "Who told you about the surprise party?", at: "17:35" },
    { me: true, text: "Sam spilled the beans.", at: "17:35", glossRu: localize("spill the beans — выдать секрет") },
    { text: "I can't believe they kept me in the dark for weeks.", at: "17:36", glossRu: localize("keep someone in the dark — держать кого-то в неведении") },
    { me: true, text: "There were hints. You just didn't read between the lines.", at: "17:36", glossRu: localize("read between the lines — читать между строк") },
  ],
  expressions: [
    e("spill the beans", localize("выдать секрет"), localize("Неформально описывает случайное или намеренное раскрытие тайны."), [localize("сохранить секрет"), localize("приготовить еду")], "The surprise is ruined because Sam ", ".", localize("Сюрприз испорчен, потому что Сэм выдал секрет."), localize("Он случайно выдал секрет."), ["he accidentally spilled the beans"], { gapAnswers: ["spilled the beans"] }),
    e("keep someone in the dark", localize("держать кого-то в неведении"), localize("Намеренно не сообщать человеку важную информацию."), [localize("посвятить во все детали"), localize("открыть секрет")], "They didn't tell her anything. They ", ".", localize("Ей ничего не сказали. Её держали в неведении."), localize("Не держи меня в неведении."), ["don't keep me in the dark", "do not keep me in the dark"], { gapAnswers: ["kept her in the dark"] }),
    e("read between the lines", localize("читать между строк"), localize("Понимать намёки и скрытый смысл, а не только буквальные слова."), [localize("понимать только буквально"), localize("читать вслух")], "She didn't say she was upset, but I could ", ".", localize("Она не сказала, что расстроена, но я понял это по намёкам."), localize("Она поняла скрытый смысл."), ["she read between the lines"]),
  ],
  scenario: {
    promptRu: localize("Что сказать, если кто-то раскрыл тайну?"),
    quote: localize("Сэм рассказал о вечеринке-сюрпризе до того, как её должны были объявить."),
    options: ["Sam spilled the beans.", "Sam kept me in the dark.", "Sam read between the lines."],
    answer: 0,
    whyRu: localize("Spill the beans означает выдать секрет."),
  },
};

const speechClarification: LessonSpec = {
  id: "speech-clarification",
  kind: "speech",
  title: "Ask for repetition and explanation",
  titleRu: localize("Попросить повторить и объяснить"),
  subtitleRu: "come again? · what do you mean by that? · walk me through it",
  ruleTitleRu: localize("Уточнить непонятное"),
  introRu: localize("Come again? просит повторить сказанное. What do you mean by that? уточняет смысл реплики. Walk me through it просит объяснить процесс по шагам."),
  withWhomRu: localize("Алекс"),
  lines: [
    { text: "You need to reverse the polarity.", at: "13:50" },
    { me: true, text: "Come again? What do you mean by that?", at: "13:50", glossRu: localize("come again? — повтори, пожалуйста; what do you mean by that? — что ты имеешь в виду?") },
    { text: "I'll show you the settings.", at: "13:51" },
    { me: true, text: "Thanks. Walk me through it.", at: "13:51", glossRu: localize("walk me through it — объясни мне по шагам") },
  ],
  expressions: [
    e("come again?", localize("повтори, пожалуйста; что ты сказал?"), localize("Просьба повторить реплику, которую не расслышали или не поняли. В некоторых контекстах может звучать удивлённо."), [localize("не повторяй"), localize("объясни по шагам")], "Sorry, ", "", localize("Прости, повтори, пожалуйста."), localize("Повтори, пожалуйста. Я не расслышал."), ["come again? I didn't hear you", "come again? I did not hear you"]),
    e("what do you mean by that?", localize("что ты имеешь в виду?"), localize("Просит объяснить смысл или намерение конкретной реплики; интонация влияет на оттенок."), [localize("повтори громче"), localize("я всё понял")], "I don't understand your last comment. ", "", localize("Я не понимаю твоё последнее замечание. Что ты имеешь в виду?"), localize("Что ты имеешь в виду под «позже»?"), ["what do you mean by later?"]),
    e("walk me through it", localize("объясни мне по шагам"), localize("Просьба последовательно объяснить процесс, решение или инструкцию."), [localize("не объясняй ничего"), localize("повтори последнее слово")], "This looks complicated. ", ".", localize("Это выглядит сложно. Объясни мне по шагам."), localize("Объясни мне это по шагам."), ["walk me through it"]),
  ],
  scenario: {
    promptRu: localize("Как попросить повторить нерасслышанную фразу?"),
    quote: localize("Из-за шума ты не расслышал последнее предложение собеседника."),
    options: ["Come again?", "What do you mean by that?", "Walk me through it."],
    answer: 0,
    whyRu: localize("Come again? используется, когда нужно повторить сказанное."),
  },
};

const chatLaughter: LessonSpec = {
  id: "chat-laughter",
  kind: "chat",
  title: "Laugh and soften a joke",
  titleRu: localize("Смеяться и смягчать шутку"),
  subtitleRu: "lol · lmao · jk",
  ruleTitleRu: localize("Реакции на смешное в переписке"),
  introRu: localize("Lol передаёт смех или «смешно», а иногда просто смягчает тон сообщения. Lmao означает «очень смешно» и содержит грубое слово в расшифровке. Jk показывает, что предыдущая реплика была шуткой."),
  withWhomRu: localize("Крис"),
  lines: [
    { text: "I just waved at someone who wasn't waving at me.", at: "22:45" },
    { me: true, text: "lmao. I'd hide too, lol.", at: "22:45", glossRu: localize("lmao — очень смешно, грубовато; lol — здесь смягчает тон") },
    { text: "Not funny.", at: "22:46" },
    { me: true, text: "jk, it happens to everyone.", at: "22:46", glossRu: localize("jk — шучу") },
  ],
  expressions: [
    e("lol", localize("смеюсь, смешно; также смягчает тон сообщения"), localize("Не всегда обозначает буквальный смех: в конце реплики может делать её мягче и дружелюбнее."), [localize("очень грустно"), localize("я серьёзен")], "That was awkward, ", ".", localize("Было неловко, но сообщение звучит легко благодаря lol."), localize("Смешно. Я тоже так делал."), ["lol. I've done that too", "lol. I have done that too"], { fullForm: "laughing out loud" }),
    e("lmao", localize("очень смешно"), localize("Сильнее, чем lol. Расшифровка содержит грубое слово, поэтому сокращение не подходит для формального общения."), [localize("совсем не смешно"), localize("я обижен")], "That video was so funny. ", ".", localize("Это видео очень смешное. Я умираю со смеху."), localize("Очень смешно. Не могу перестать смеяться."), ["lmao. I can't stop laughing", "lmao. I cannot stop laughing"], { fullForm: "laughing my ass off" }),
    e("jk", localize("шучу"), localize("Быстро показывает, что сказанное не нужно воспринимать серьёзно."), [localize("я серьёзно"), localize("я не знаю")], "I didn't mean it seriously. ", ".", localize("Я не говорил это серьёзно. Шучу."), localize("Шучу. Я не это имел в виду."), ["jk. I didn't mean it", "jk. I did not mean it"], { fullForm: "just kidding" }),
  ],
  scenario: {
    promptRu: localize("Как показать, что предыдущая реплика была шуткой?"),
    quote: localize("Собеседник принял твою шутку всерьёз, и ты хочешь сразу это прояснить."),
    options: ["jk.", "lol.", "lmao."],
    answer: 0,
    whyRu: localize("Jk — сокращение от just kidding, то есть «шучу»."),
  },
};

const idiomMoney: LessonSpec = {
  id: "idiom-money",
  kind: "idiom",
  title: "Talk about prices and spending",
  titleRu: localize("Говорить о ценах и расходах"),
  subtitleRu: "cost an arm and a leg · make ends meet · tighten your belt",
  ruleTitleRu: localize("Три идиомы о деньгах"),
  introRu: localize("Cost an arm and a leg — стоить очень дорого. Make ends meet — сводить концы с концами, иметь достаточно денег на основные нужды. Tighten your belt — затянуть пояс и сократить расходы."),
  withWhomRu: localize("Софи"),
  lines: [
    { text: "How much was the concert?", at: "19:30" },
    { me: true, text: "It cost an arm and a leg. I'm tightening my belt this month.", at: "19:30", glossRu: localize("cost an arm and a leg — стоить очень дорого; tighten your belt — сократить расходы") },
    { text: "Same. I can barely make ends meet.", at: "19:31", glossRu: localize("make ends meet — сводить концы с концами") },
  ],
  expressions: [
    e("cost an arm and a leg", localize("стоить очень дорого"), localize("Подчёркивает чрезмерно высокую цену, а не буквальную плату частями тела."), [localize("стоить очень дёшево"), localize("быть бесплатным")], "This apartment is beautiful, but it ", ".", localize("Квартира красивая, но стоит очень дорого."), localize("Этот телефон стоит очень дорого."), ["this phone costs an arm and a leg"], { gapAnswers: ["costs an arm and a leg"] }),
    e("make ends meet", localize("сводить концы с концами"), localize("Иметь достаточно денег на необходимые расходы, часто с трудом."), [localize("тратить без ограничений"), localize("накопить много денег")], "With two part-time jobs, he can barely ", ".", localize("Даже с двумя подработками он с трудом сводит концы с концами."), localize("Мне хватает денег только на основные нужды."), ["I can barely make ends meet"]),
    e("tighten your belt", localize("затянуть пояс, сократить расходы"), localize("Начать экономить и тратить меньше из-за финансовых ограничений."), [localize("увеличить расходы"), localize("купить новый ремень")], "I need to spend less and ", ".", localize("Мне нужно меньше тратить и сократить расходы."), localize("Мне нужно сократить расходы в этом месяце."), ["I need to tighten my belt this month"], { gapAnswers: ["tighten my belt"] }),
  ],
  scenario: {
    promptRu: localize("Как сказать, что вещь стоила очень дорого?"),
    quote: localize("Билет на концерт оказался непомерно дорогим."),
    options: ["It cost an arm and a leg.", "It made ends meet.", "It tightened my belt."],
    answer: 0,
    whyRu: localize("Cost an arm and a leg означает стоить очень дорого."),
  },
};

const speechContractions: LessonSpec = {
  id: "speech-contractions",
  kind: "speech",
  title: "Understand reduced spoken forms",
  titleRu: localize("Понимать сокращённую разговорную речь"),
  subtitleRu: "lemme · gimme · dunno",
  ruleTitleRu: localize("Как полные формы звучат в быстрой речи"),
  introRu: localize("Lemme — разговорная форма let me, gimme — give me, dunno — don't know. Они помогают понимать короткие реплики, но не подходят для формального письма; в нём используй полные формы."),
  withWhomRu: localize("Бен"),
  lines: [
    { text: "Do you know where my keys are?", at: "08:20" },
    { me: true, text: "dunno. lemme check the kitchen.", at: "08:20", glossRu: localize("dunno — не знаю; lemme — позволь мне") },
    { text: "Found them. Hand me my wallet too.", at: "08:21" },
    { me: true, text: "Okay. gimme a second.", at: "08:21", glossRu: localize("gimme — дай мне; эти три формы не для формального письма") },
  ],
  expressions: [
    e("lemme", localize("дай мне / позволь мне"), localize("Разговорная форма let me. Подходит для устной речи и личных чатов, но не для формального письма."), [localize("оставь меня"), localize("я не знаю")], "", " see that photo.", localize("Позволь мне посмотреть фотографию."), localize("Позволь мне помочь тебе."), ["lemme help you"], { fullForm: "let me" }),
    e("gimme", localize("дай мне"), localize("Разговорная форма give me. Звучит неформально и не подходит для формального письма."), [localize("возьми у меня"), localize("позволь тебе")], "", " a minute to finish.", localize("Дай мне минуту закончить."), localize("Дай мне секунду."), ["gimme a second"], { fullForm: "give me" }),
    e("dunno", localize("не знаю"), localize("Разговорная форма don't know. Для формального письма нужна полная форма."), [localize("знаю точно"), localize("не понимаю")], "Where is Sam? ", ".", localize("Где Сэм? Не знаю."), localize("Я не знаю, где мои ключи."), ["dunno where my keys are"], { aliases: ["I dunno"], fullForm: "don't know" }),
  ],
  scenario: {
    promptRu: localize("Как в разговоре попросить показать фотографию?"),
    quote: localize("Ты общаешься с другом и хочешь сказать «позволь мне посмотреть» короткой разговорной формой."),
    options: ["lemme see.", "gimme see.", "dunno."],
    answer: 0,
    whyRu: localize("Lemme — разговорная форма let me, поэтому lemme see означает «дай / позволь мне посмотреть»."),
  },
};

export const trackExpansionModules = [
  cycle("cycle-thirteen", "Count Me In", "Count Me In", "Meet people, make plans and join in.", localize("Знакомься, договаривайся о встречах и присоединяйся к планам."), chatMeetups, idiomIntroductions, speechPlans),
  cycle("cycle-fourteen", "My Bad", "My Bad", "Fix mistakes, apologize and start again.", localize("Исправляй ошибки, извиняйся и начинай заново."), chatMistakes, idiomSetbacks, speechApologies),
  cycle("cycle-fifteen", "You've Got This", "You've Got This", "Talk about pressure, take breaks and support friends.", localize("Говори о нагрузке, бери паузу и поддерживай друзей."), chatAvailability, idiomWorkload, speechSupport),
  cycle("cycle-sixteen", "Your Call", "Your Call", "Share opinions, make decisions and say no.", localize("Выражай мнение, принимай решения и отказывайся без лишних объяснений."), chatOpinions, idiomDeciding, speechRefusals),
  cycle("cycle-seventeen", "Between the Lines", "Between the Lines", "Share information, notice hints and ask for clarity.", localize("Делись информацией, замечай намёки и уточняй непонятное."), chatInformation, idiomInformation, speechClarification),
  cycle("cycle-eighteen", "Everyday Mode", "Everyday Mode", "Discuss spending, joke in chats and understand reduced speech.", localize("Обсуждай повседневные траты, шути в чатах и понимай сокращённую устную речь."), chatLaughter, idiomMoney, speechContractions),
];
