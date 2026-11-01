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
  titleRu: "Договариваться о встрече в переписке",
  subtitleRu: "omw · eta · hbu",
  ruleTitleRu: "Сообщить, что ты в пути, и уточнить планы",
  introRu: "Omw сообщает, что ты уже в пути. Eta — ожидаемое время прибытия; так спрашивают или сообщают, когда кто-то будет на месте. Hbu возвращает собеседнику тот же вопрос: «а ты?».",
  withWhomRu: "Майя",
  lines: [
    { text: "I'm at the café. hbu?", at: "17:42", glossRu: "hbu — а ты?" },
    { me: true, text: "omw! eta 10 minutes.", at: "17:42", glossRu: "omw — уже в пути; eta — ожидаемое время прибытия" },
    { text: "Perfect. I'll get us a table.", at: "17:43" },
  ],
  expressions: [
    e("omw", "уже в пути", "Сообщает, что человек вышел и направляется к месту встречи. Для личной переписки.", ["уже на месте", "не приду"], "I'm ", "! See you soon.", "Я уже в пути! Скоро увидимся.", "Я уже в пути. Буду через пять минут.", ["omw. I'll be there in five minutes"], { fullForm: "on my way" }),
    e("eta", "ожидаемое время прибытия", "Используется в вопросе «What's your eta?» или в ответе «eta 10 minutes».", ["время отправления", "место встречи"], "Traffic is heavy. My ", " is 20 minutes.", "Пробки. Я буду примерно через двадцать минут.", "Моё ожидаемое время прибытия — 18:30.", ["my eta is 6:30 pm", "my eta is 6:30"], { aliases: ["eta?"], fullForm: "estimated time of arrival" }),
    e("hbu", "а ты?", "Коротко возвращает собеседнику вопрос, который только что задали тебе.", ["а где ты?", "а когда?"], "I'm already here. ", "?", "Я уже здесь. А ты?", "Я уже в кафе. А ты?", ["I'm already at the café. hbu?", "I'm already at the cafe. hbu?"], { fullForm: "how about you?" }),
  ],
  scenario: {
    promptRu: "Как сообщить, что ты вышел и скоро будешь?",
    quote: "Друг ждёт тебя в кафе и спрашивает, где ты.",
    options: ["omw! eta 10 minutes.", "hbu?", "eta?"],
    answer: 0,
    whyRu: "Omw означает «уже в пути», а eta 10 minutes сообщает ожидаемое время прибытия.",
  },
};

const idiomIntroductions: LessonSpec = {
  id: "idiom-introductions",
  kind: "idiom",
  title: "Start a conversation and connect",
  titleRu: "Начать общение и найти контакт",
  subtitleRu: "break the ice · hit it off · get off on the wrong foot",
  ruleTitleRu: "Первое знакомство без дословного перевода",
  introRu: "Break the ice — снять неловкость и начать общение. Hit it off — сразу поладить. Get off on the wrong foot — неудачно начать знакомство или сотрудничество.",
  withWhomRu: "Лена",
  lines: [
    { text: "I never know how to start talking to new people.", at: "19:05" },
    { me: true, text: "Ask about the music. It helps break the ice.", at: "19:05", glossRu: "break the ice — снять неловкость" },
    { text: "I tried it with Sam, and we hit it off immediately.", at: "19:06", glossRu: "hit it off — сразу поладить" },
    { me: true, text: "Nice! I got off on the wrong foot with his brother.", at: "19:06", glossRu: "get off on the wrong foot — неудачно начать знакомство" },
  ],
  expressions: [
    e("break the ice", "снять неловкость, начать общение", "Так описывают первую фразу, вопрос или шутку, после которой общаться становится легче.", ["усилить неловкость", "закончить разговор"], "He told a joke to ", ".", "Он пошутил, чтобы снять неловкость.", "Она задала вопрос, чтобы начать общение.", ["she asked a question to break the ice"]),
    e("hit it off", "сразу поладить", "О двух людях, которым с первой встречи легко и приятно общаться друг с другом.", ["поссориться", "не найти общих тем"], "We met yesterday and ", " immediately.", "Мы познакомились вчера и сразу поладили.", "Мы сразу поладили на вечеринке.", ["we hit it off at the party"]),
    e("get off on the wrong foot", "неудачно начать знакомство или сотрудничество", "О плохом первом впечатлении или неудачном начале отношений, а не о буквальном шаге.", ["отлично начать", "сразу поладить"], "I don't want to ", " with my new teammate.", "Я не хочу неудачно начать сотрудничество с новым коллегой.", "Я неудачно начал знакомство с соседом.", ["I got off on the wrong foot with my neighbor"]),
  ],
  scenario: {
    promptRu: "Что помогает снять неловкость при знакомстве?",
    quote: "На вечеринке все молчат. Ты задаёшь лёгкий вопрос, и разговор начинается.",
    options: ["I broke the ice.", "I hit it off.", "I got off on the wrong foot."],
    answer: 0,
    whyRu: "Break the ice означает снять первоначальную неловкость и начать общение.",
  },
};

const speechPlans: LessonSpec = {
  id: "speech-plans",
  kind: "speech",
  title: "Accept or decline an invitation",
  titleRu: "Принять или отклонить приглашение",
  subtitleRu: "I'm down · count me in · maybe some other time",
  ruleTitleRu: "Присоединиться к плану или отказаться",
  introRu: "I'm down — неформальное «я за». Count me in подтверждает участие: «рассчитывайте на меня». Maybe some other time — мягкий отказ с предложением перенести планы.",
  withWhomRu: "Бен",
  lines: [
    { text: "We're getting dinner tomorrow. Want to join?", at: "16:20" },
    { me: true, text: "I'm down. Count me in!", at: "16:20", glossRu: "I'm down — я за; count me in — я участвую" },
    { text: "We're also hiking on Saturday.", at: "16:21" },
    { me: true, text: "Maybe some other time. I need to rest.", at: "16:21", glossRu: "maybe some other time — может, в другой раз" },
  ],
  expressions: [
    e("I'm down", "я за, с удовольствием", "Неформально выражает готовность присоединиться к предложению.", ["я против", "я не могу"], "Pizza tonight? ", "!", "Пицца вечером? Я за!", "Я за. Давай встретимся в семь.", ["I'm down. Let's meet at seven", "I am down. Let's meet at seven"], { aliases: ["I am down"] }),
    e("count me in", "я участвую, рассчитывайте на меня", "Подтверждает, что говорящий хочет быть включённым в план.", ["меня не будет", "я ещё подумаю"], "We're booking five tickets. ", "!", "Мы бронируем пять билетов. Рассчитывай на меня!", "Я участвую. Добавь меня в список.", ["count me in. Add me to the list"]),
    e("maybe some other time", "может, в другой раз", "Мягко отклоняет предложение, не закрывая возможность встретиться позже.", ["точно сейчас", "я уже в пути"], "I can't make it today. ", ".", "Сегодня не получится. Может, в другой раз.", "Может, в другой раз. Сегодня я занят.", ["maybe some other time. I'm busy today", "maybe some other time. I am busy today"]),
  ],
  scenario: {
    promptRu: "Как сразу согласиться на приглашение?",
    quote: "Друзья зовут тебя ужинать, и ты точно хочешь пойти.",
    options: ["I'm down. Count me in.", "Maybe some other time.", "hbu?"],
    answer: 0,
    whyRu: "I'm down и count me in оба выражают согласие присоединиться к плану.",
  },
};

const chatMistakes: LessonSpec = {
  id: "chat-mistakes",
  kind: "chat",
  title: "Explain a messaging mistake",
  titleRu: "Объяснить ошибку в переписке",
  subtitleRu: "wrong chat · sent too soon · autocorrect strikes again",
  ruleTitleRu: "Когда сообщение ушло не так",
  introRu: "Wrong chat — сообщение попало не в тот чат. Sent too soon — его отправили раньше времени, например не закончив мысль. Autocorrect strikes again — шутливое объяснение очередной странной автозамены.",
  withWhomRu: "Алекс",
  lines: [
    { text: "Why did you send me a shopping list?", at: "11:12" },
    { me: true, text: "wrong chat! Sorry.", at: "11:12", glossRu: "wrong chat — не в тот чат" },
    { text: "Your last message ended mid-sentence.", at: "11:13" },
    { me: true, text: "sent too soon. And that weird word? autocorrect strikes again.", at: "11:13", glossRu: "sent too soon — отправил раньше времени; autocorrect strikes again — автозамена опять отличилась" },
  ],
  expressions: [
    e("wrong chat", "не в тот чат", "Быстрое объяснение, что сообщение предназначалось другому человеку или группе.", ["не в то время", "не то слово"], "That message was for Maya. ", ".", "Это сообщение для Майи. Не в тот чат.", "Не в тот чат. Прости.", ["wrong chat. Sorry"]),
    e("sent too soon", "отправил раньше времени", "О сообщении, которое ушло случайно или до того, как его закончили.", ["отправил слишком поздно", "не отправил вообще"], "I hit send by accident. ", ".", "Я случайно нажал «отправить». Отправил раньше времени.", "Отправил раньше времени. Я ещё не закончил.", ["sent too soon. I wasn't finished", "sent too soon. I was not finished"]),
    e("autocorrect strikes again", "автозамена опять отличилась", "Шутливый комментарий к новой ошибке автозамены, особенно если она сильно изменила слово.", ["сообщение удалено", "клавиатура отключилась"], "That strange word wasn't my fault. ", ".", "Это странное слово не моя вина. Автозамена опять отличилась.", "Автозамена опять отличилась. Я не это написал.", ["autocorrect strikes again. That's not what I typed", "autocorrect strikes again. That is not what I typed"]),
  ],
  scenario: {
    promptRu: "Что написать, если сообщение попало не туда?",
    quote: "Ты отправил личное сообщение в общий чат.",
    options: ["wrong chat!", "sent too soon!", "autocorrect strikes again!"],
    answer: 0,
    whyRu: "Wrong chat прямо объясняет, что сообщение попало не в тот чат.",
  },
};

const idiomSetbacks: LessonSpec = {
  id: "idiom-setbacks",
  kind: "idiom",
  title: "Talk about setbacks and lessons",
  titleRu: "Говорить о неудачах и извлечённых уроках",
  subtitleRu: "back to square one · learn the hard way · a blessing in disguise",
  ruleTitleRu: "Начать заново и увидеть пользу в неудаче",
  introRu: "Back to square one — снова оказаться в исходной точке. Learn the hard way — научиться на горьком опыте. A blessing in disguise — неприятность, которая в итоге обернулась благом.",
  withWhomRu: "Лена",
  lines: [
    { text: "Our app crashed again. The fix didn't work.", at: "14:18" },
    { me: true, text: "Back to square one, then.", at: "14:18", glossRu: "back to square one — снова в исходной точке" },
    { text: "I guess we'll learn the hard way not to skip tests.", at: "14:19", glossRu: "learn the hard way — научиться на горьком опыте" },
    { me: true, text: "Maybe the crash was a blessing in disguise. It showed us the real problem.", at: "14:19", glossRu: "a blessing in disguise — неприятность, которая обернулась благом" },
  ],
  expressions: [
    e("back to square one", "снова в исходной точке", "О ситуации, когда прежняя работа не дала результата и приходится начинать заново.", ["перейти на новый уровень", "завершить работу"], "The plan failed, so we're ", ".", "План не сработал, и мы снова в исходной точке.", "Придётся начать заново.", ["we're back to square one", "we are back to square one"]),
    e("learn the hard way", "научиться на горьком опыте", "О знании, которое пришло через собственную неприятную ошибку, а не через совет или инструкцию.", ["выучить легко", "научиться по учебнику"], "I didn't back up my files and lost everything. I ", ".", "Я не сохранил копию и всё потерял. Научился на горьком опыте.", "Я научился на горьком опыте не пропускать проверку.", ["I learned the hard way not to skip testing"], { gapAnswers: ["learned the hard way"] }),
    e("a blessing in disguise", "неприятность, которая обернулась благом", "Сначала событие кажется плохим, но позже оказывается полезным или удачным.", ["очевидная удача", "бесполезный подарок"], "Losing that job was difficult, but it was ", ".", "Потерять работу было тяжело, но эта неприятность обернулась благом.", "Та неприятность обернулась благом.", ["it was a blessing in disguise"]),
  ],
  scenario: {
    promptRu: "Что сказать, если приходится начинать заново?",
    quote: "Решение не сработало, и вся предыдущая работа больше не помогает.",
    options: ["We're back to square one.", "We learned the hard way.", "It was a blessing in disguise."],
    answer: 0,
    whyRu: "Back to square one означает вернуться в исходную точку и начать заново.",
  },
};

const speechApologies: LessonSpec = {
  id: "speech-apologies",
  kind: "speech",
  title: "Admit a mistake and move on",
  titleRu: "Признать ошибку и не держать обиду",
  subtitleRu: "my bad · that's on me · no hard feelings",
  ruleTitleRu: "Взять ответственность и сохранить отношения",
  introRu: "My bad — короткое «мой косяк, виноват». That's on me переносит вину или ответственность на говорящего. No hard feelings означает «без обид» и показывает, что злости не осталось.",
  withWhomRu: "Ник",
  lines: [
    { text: "You gave me the wrong address.", at: "20:08" },
    { me: true, text: "my bad. That's on me.", at: "20:08", glossRu: "my bad — мой косяк; that's on me — это моя вина" },
    { text: "I was annoyed, but it's okay now.", at: "20:09" },
    { me: true, text: "Good. No hard feelings?", at: "20:09", glossRu: "no hard feelings — без обид" },
  ],
  expressions: [
    e("my bad", "мой косяк, виноват", "Неформальное признание собственной ошибки; короче и менее официально, чем полное извинение.", ["твоя ошибка", "ничего не произошло"], "I forgot your coffee. ", ".", "Я забыл твой кофе. Мой косяк.", "Мой косяк. Я неправильно понял.", ["my bad. I misunderstood"]),
    e("that's on me", "это моя вина или ответственность", "Говорящий признаёт свою ответственность за ошибку или последствия.", ["это твоя вина", "никто не виноват"], "I gave you the wrong information. ", ".", "Я дал тебе неверную информацию. Это моя вина.", "Это моя вина. Я всё исправлю.", ["that's on me. I'll fix it", "that is on me. I will fix it"], { aliases: ["that is on me"] }),
    e("no hard feelings", "без обид", "Показывает отсутствие злости после ошибки, спора или отказа.", ["я очень обижен", "мы больше не общаемся"], "I forgive you. ", ".", "Я тебя прощаю. Без обид.", "Без обид. Я понимаю, почему ты так поступил.", ["no hard feelings. I understand why you did it"]),
  ],
  scenario: {
    promptRu: "Как коротко признать свою ошибку?",
    quote: "Ты дал другу неверный адрес и хочешь взять вину на себя.",
    options: ["my bad. That's on me.", "No hard feelings.", "wrong chat."],
    answer: 0,
    whyRu: "My bad и that's on me означают, что говорящий признаёт ошибку и свою ответственность.",
  },
};

const chatAvailability: LessonSpec = {
  id: "chat-availability",
  kind: "chat",
  title: "Step away or leave a chat",
  titleRu: "Ненадолго отойти или выйти из переписки",
  subtitleRu: "brb · afk · gtg",
  ruleTitleRu: "Три сокращения о паузе и уходе",
  introRu: "Brb обещает скоро вернуться. Afk сообщает, что человек отошёл от компьютера. Gtg предупреждает, что пора заканчивать разговор и уходить.",
  withWhomRu: "Ник",
  lines: [
    { text: "Are you still there?", at: "21:15" },
    { me: true, text: "brb. I need to grab my charger.", at: "21:15", glossRu: "brb — скоро вернусь" },
    { text: "No rush. I'll be afk for five minutes too.", at: "21:16", glossRu: "afk — отошёл от компьютера" },
    { me: true, text: "Back now, but gtg soon.", at: "21:22", glossRu: "gtg — мне пора" },
  ],
  expressions: [
    e("brb", "скоро вернусь", "Сообщает о короткой паузе с намерением продолжить разговор.", ["не вернусь", "мне пора"], "I need to answer the door. ", ".", "Мне нужно открыть дверь. Скоро вернусь.", "Скоро вернусь. Не уходи.", ["brb. Don't go", "brb. Do not go"], { fullForm: "be right back" }),
    e("afk", "отошёл от компьютера", "Буквально «away from keyboard»; в чатах и играх сообщает, что человека временно нет за компьютером.", ["печатаю ответ", "вернулся"], "I won't answer for ten minutes. I'll be ", ".", "Я не буду отвечать десять минут. Отойду от компьютера.", "Я отошёл от компьютера. Напишу позже.", ["I was afk. I'll reply later", "I was afk. I will reply later"], { fullForm: "away from keyboard" }),
    e("gtg", "мне пора", "Коротко сообщает, что нужно уходить или завершать разговор.", ["я вернулся", "я ненадолго отойду"], "It's getting late. ", ".", "Уже поздно. Мне пора.", "Мне пора. Поговорим завтра.", ["gtg. Talk to you tomorrow"], { fullForm: "got to go" }),
  ],
  scenario: {
    promptRu: "Как предупредить о короткой паузе?",
    quote: "Тебе нужно на минуту открыть дверь, после чего ты продолжишь переписку.",
    options: ["brb.", "afk.", "gtg."],
    answer: 0,
    whyRu: "Brb означает «скоро вернусь», поэтому подходит для короткой паузы.",
  },
};

const idiomWorkload: LessonSpec = {
  id: "idiom-workload",
  kind: "idiom",
  title: "Describe pressure and too much work",
  titleRu: "Описать давление и слишком большую нагрузку",
  subtitleRu: "under the gun · have a lot on your plate · bite off more than you can chew",
  ruleTitleRu: "Когда дел слишком много",
  introRu: "Under the gun — под сильным давлением, часто из-за срока. Have a lot on your plate — иметь много дел и обязательств. Bite off more than you can chew — взять на себя больше, чем можешь выполнить.",
  withWhomRu: "Софи",
  lines: [
    { text: "Why are you working so late?", at: "22:05" },
    { me: true, text: "I'm under the gun to finish this report, and I have a lot on my plate.", at: "22:05", glossRu: "under the gun — под сильным давлением; have a lot on your plate — иметь много дел" },
    { text: "You should ask for help.", at: "22:06" },
    { me: true, text: "You're right. I bit off more than I can chew.", at: "22:06", glossRu: "bite off more than you can chew — взять на себя слишком много" },
  ],
  expressions: [
    e("under the gun", "под сильным давлением", "О необходимости сделать что-то срочно или в сложных условиях, а не о буквальном оружии.", ["в полном спокойствии", "без обязательств"], "With the deadline tomorrow, I'm ", ".", "Дедлайн завтра, и я под сильным давлением.", "Я под сильным давлением из-за дедлайна.", ["I'm under the gun because of the deadline", "I am under the gun because of the deadline"]),
    e("have a lot on your plate", "иметь много дел и обязательств", "О большой загрузке делами, работой или заботами, а не о еде.", ["иметь мало дел", "отдыхать"], "I can't take another task. I ", ".", "Я не могу взять ещё одну задачу. У меня и так много дел.", "У меня сейчас много дел и обязательств.", ["I have a lot on my plate right now"]),
    e("bite off more than you can chew", "взять на себя слишком много", "О задаче или количестве обязательств, с которыми человек не справляется.", ["взять посильную задачу", "отказаться от работы"], "I took on three projects and ", ".", "Я взял три проекта и взял на себя слишком много.", "Я взял на себя слишком много.", ["I bit off more than I can chew"], { gapAnswers: ["bit off more than I can chew"] }),
  ],
  scenario: {
    promptRu: "Что сказать о работе с жёстким сроком?",
    quote: "Отчёт нужно закончить к утру, и ты работаешь под сильным давлением.",
    options: ["I'm under the gun.", "I have a lot on my plate.", "I bit off more than I can chew."],
    answer: 0,
    whyRu: "Under the gun описывает сильное давление, особенно из-за срочного срока.",
  },
};

const speechSupport: LessonSpec = {
  id: "speech-support",
  kind: "speech",
  title: "Show sympathy and encouragement",
  titleRu: "Поддержать и проявить сочувствие",
  subtitleRu: "I feel you · that sucks · you've got this",
  ruleTitleRu: "Понять чувства и приободрить",
  introRu: "I feel you показывает, что ты понимаешь чувства собеседника. That sucks — неформальное сочувствие неприятной ситуации. You've got this — уверенное «ты справишься».",
  withWhomRu: "Джейк",
  lines: [
    { text: "I studied all weekend and still failed.", at: "18:40" },
    { me: true, text: "That sucks. I feel you.", at: "18:40", glossRu: "that sucks — как неприятно; I feel you — понимаю тебя" },
    { text: "The retake is tomorrow. I'm nervous.", at: "18:41" },
    { me: true, text: "You've got this.", at: "18:41", glossRu: "you've got this — ты справишься" },
  ],
  expressions: [
    e("I feel you", "понимаю тебя, понимаю твои чувства", "Выражает сочувствие и эмоциональное понимание, а не буквальное прикосновение.", ["не понимаю тебя", "слышу тебя плохо"], "I know how disappointing that feels. ", ".", "Я знаю, как это обидно. Понимаю тебя.", "Понимаю твои чувства. Это действительно тяжело.", ["I feel you. That's really hard", "I feel you. That is really hard"]),
    e("that sucks", "отстой, как неприятно", "Неформальная реакция сочувствия на плохую новость или несправедливую ситуацию.", ["это замечательно", "ты виноват"], "You missed the last bus? ", ".", "Ты пропустил последний автобус? Как неприятно.", "Отстой. Мне жаль, что так вышло.", ["that sucks. I'm sorry that happened", "that sucks. I am sorry that happened"]),
    e("you've got this", "ты справишься", "Поддерживает человека перед трудной задачей и выражает уверенность в нём.", ["у тебя не получится", "ты уже закончил"], "Don't give up. ", ".", "Не сдавайся. Ты справишься.", "Ты справишься. Я в тебя верю.", ["you've got this. I believe in you", "you have got this. I believe in you"], { aliases: ["you have got this"] }),
  ],
  scenario: {
    promptRu: "Как приободрить друга перед пересдачей?",
    quote: "Друг нервничает, но хорошо подготовился и может справиться.",
    options: ["You've got this.", "That sucks.", "I feel you."],
    answer: 0,
    whyRu: "You've got this — естественная поддержка «ты справишься».",
  },
};

const chatOpinions: LessonSpec = {
  id: "chat-opinions",
  kind: "chat",
  title: "Qualify knowledge and opinions",
  titleRu: "Уточнить знания и выразить мнение",
  subtitleRu: "afaik · iirc · imo",
  ruleTitleRu: "Говорить точно о том, что знаешь и думаешь",
  introRu: "Afaik ограничивает утверждение тем, что тебе известно. Iirc показывает, что ты полагаешься на память. Imo обозначает личное мнение, а не установленный факт.",
  withWhomRu: "Крис",
  lines: [
    { text: "Is the shop open on Sunday?", at: "10:10" },
    { me: true, text: "afaik, it closes at six. iirc, they changed the schedule.", at: "10:10", glossRu: "afaik — насколько мне известно; iirc — если правильно помню" },
    { text: "Should we go early?", at: "10:11" },
    { me: true, text: "imo, before lunch is best.", at: "10:11", glossRu: "imo — по моему мнению" },
  ],
  expressions: [
    e("afaik", "насколько мне известно", "Подчёркивает, что говорящий не гарантирует полноту или свежесть информации.", ["я абсолютно уверен", "по моему мнению"], ", the museum is closed on Mondays.", "", "Насколько мне известно, музей по понедельникам закрыт.", "Насколько мне известно, магазин открыт.", ["afaik, the shop is open", "afaik the shop is open"], { fullForm: "as far as I know" }),
    e("iirc", "если правильно помню", "Показывает, что утверждение основано на памяти и может требовать проверки.", ["если я забыл", "насколько мне известно"], ", the meeting starts at nine.", "", "Если правильно помню, встреча начинается в девять.", "Если правильно помню, её зовут Анна.", ["iirc, her name is Anna", "iirc her name is Anna"], { fullForm: "if I recall correctly" }),
    e("imo", "по моему мнению", "Вводит субъективную оценку или мнение говорящего.", ["это доказанный факт", "если правильно помню"], ", the first option is better.", "", "По моему мнению, первый вариант лучше.", "По моему мнению, нам стоит подождать.", ["imo, we should wait", "imo we should wait"], { fullForm: "in my opinion" }),
  ],
  scenario: {
    promptRu: "Как обозначить личное мнение?",
    quote: "Ты считаешь, что лучше поехать утром, но это твоя субъективная оценка.",
    options: ["imo, we should go in the morning.", "afaik, we should go in the morning.", "iirc, we should go in the morning."],
    answer: 0,
    whyRu: "Imo означает «по моему мнению» и вводит именно субъективную оценку.",
  },
};

const idiomDeciding: LessonSpec = {
  id: "idiom-deciding",
  kind: "idiom",
  title: "Decide, hesitate or take a risk",
  titleRu: "Решиться, колебаться или рискнуть",
  subtitleRu: "take the plunge · sit on the fence · go out on a limb",
  ruleTitleRu: "Три идиомы о выборе и риске",
  introRu: "Take the plunge — решиться на важный шаг. Sit on the fence — не выбирать сторону и уклоняться от решения. Go out on a limb — рискнуть, высказав мнение или поддержав кого-то.",
  withWhomRu: "Эми",
  lines: [
    { text: "Are you finally starting your own business?", at: "12:30" },
    { me: true, text: "Yes. I'm ready to take the plunge.", at: "12:30", glossRu: "take the plunge — решиться на важный шаг" },
    { text: "I kept sitting on the fence for months.", at: "12:31", glossRu: "sit on the fence — не выбирать сторону" },
    { me: true, text: "Same. Then Sam went out on a limb and supported my idea.", at: "12:31", glossRu: "go out on a limb — рискнуть и поддержать кого-то" },
  ],
  expressions: [
    e("take the plunge", "решиться на важный шаг", "О решении сделать что-то значимое или рискованное после сомнений.", ["отложить решение", "отказаться навсегда"], "After months of doubt, she decided to ", ".", "После месяцев сомнений она решилась на важный шаг.", "Я решился на важный шаг и переехал.", ["I took the plunge and moved"]),
    e("sit on the fence", "не выбирать сторону, уклоняться от решения", "О нерешительности или намеренном отказе поддержать одну из сторон.", ["сделать окончательный выбор", "активно помочь"], "He won't choose a side. He keeps ", ".", "Он не выбирает сторону и продолжает уклоняться от решения.", "Хватит уклоняться от решения.", ["stop sitting on the fence"], { gapAnswers: ["sitting on the fence"] }),
    e("go out on a limb", "рискнуть, высказав мнение или поддержав кого-то", "О поступке, при котором человек рискует репутацией или положением ради мнения, идеи или другого человека.", ["действовать безопасно", "изменить своё мнение"], "She supported my unusual idea and ", ".", "Она рискнула и поддержала мою необычную идею.", "Он рискнул и поддержал мою идею.", ["he went out on a limb and supported my idea"], { gapAnswers: ["went out on a limb"] }),
  ],
  scenario: {
    promptRu: "Как сказать о решении начать своё дело?",
    quote: "После долгих сомнений ты наконец готов сделать важный шаг.",
    options: ["I'm ready to take the plunge.", "I'm sitting on the fence.", "I'm going out on a limb."],
    answer: 0,
    whyRu: "Take the plunge означает решиться на важный или рискованный шаг.",
  },
};

const speechRefusals: LessonSpec = {
  id: "speech-refusals",
  kind: "speech",
  title: "Decline and leave the choice to someone",
  titleRu: "Отказаться и оставить выбор собеседнику",
  subtitleRu: "not my thing · I'll pass · suit yourself",
  ruleTitleRu: "Отказ без лишних объяснений",
  introRu: "Not my thing — это не соответствует твоим вкусам или интересам. I'll pass — вежливое неформальное «я откажусь». Suit yourself означает «как хочешь», но может звучать равнодушно или раздражённо в зависимости от интонации и контекста.",
  withWhomRu: "Бен",
  lines: [
    { text: "Do you want to try karaoke?", at: "20:15" },
    { me: true, text: "Karaoke is not my thing. I'll pass.", at: "20:15", glossRu: "not my thing — это не моё; I'll pass — я откажусь" },
    { text: "Fine. I'm going anyway.", at: "20:16" },
    { me: true, text: "Suit yourself.", at: "20:16", glossRu: "suit yourself — как хочешь; может звучать равнодушно или раздражённо" },
  ],
  expressions: [
    e("not my thing", "это не моё", "Спокойно объясняет, что занятие или вещь не нравится или не интересна говорящему.", ["это моё любимое занятие", "я не умею это делать"], "I don't enjoy horror movies. They're ", ".", "Я не люблю фильмы ужасов. Это не моё.", "Караоке — не моё.", ["karaoke is not my thing"]),
    e("I'll pass", "я откажусь, я воздержусь", "Неформально отклоняет предложение без подробных объяснений.", ["я согласен", "я участвую"], "Another slice? No, thanks. ", ".", "Ещё кусок? Нет, спасибо. Я откажусь.", "Я откажусь. Может, в следующий раз.", ["I'll pass. Maybe next time", "I will pass. Maybe next time"], { aliases: ["I will pass"] }),
    e("suit yourself", "как хочешь, дело твоё", "Оставляет решение собеседнику. Часто звучит равнодушно или раздражённо, поэтому важны интонация и отношения.", ["я настаиваю", "сделай это для меня"], "You don't want to come? ", ".", "Не хочешь идти? Как хочешь.", "Как хочешь. Я пойду без тебя.", ["suit yourself. I'll go without you", "suit yourself. I will go without you"]),
  ],
  scenario: {
    promptRu: "Как коротко отказаться от предложения?",
    quote: "Тебе предлагают ещё один десерт, но ты не хочешь.",
    options: ["I'll pass.", "Suit yourself.", "Not my thing."],
    answer: 0,
    whyRu: "I'll pass — естественный короткий отказ «я откажусь».",
  },
};

const chatInformation: LessonSpec = {
  id: "chat-information",
  kind: "chat",
  title: "Share information and summarize",
  titleRu: "Поделиться информацией и кратко резюмировать",
  subtitleRu: "fyi · icymi · tl;dr",
  ruleTitleRu: "Сообщить важное и выделить главное",
  introRu: "Fyi вводит информацию к сведению. Icymi помогает поделиться тем, что собеседник мог пропустить. Tl;dr может означать «слишком длинно, не читал», а также обозначать краткое резюме или просьбу о нём. В конструкции «tl;dr: …» после двоеточия идёт главное.",
  withWhomRu: "Майя",
  lines: [
    { text: "Did you see the schedule?", at: "09:25" },
    { me: true, text: "icymi, practice moved to seven.", at: "09:25", glossRu: "icymi — если ты пропустил" },
    { text: "I missed that. The post was huge. tl;dr?", at: "09:26", glossRu: "tl;dr — здесь просьба о кратком резюме" },
    { me: true, text: "fyi, the coach posted the rules. tl;dr: bring your own shoes.", at: "09:26", glossRu: "fyi — к сведению; tl;dr — краткое резюме" },
  ],
  expressions: [
    e("fyi", "к сведению", "Добавляет полезную информацию, не требуя немедленного ответа или действия.", ["как твоё мнение", "если ты согласен"], ", the entrance is on the other side.", "", "К сведению, вход с другой стороны.", "К сведению, встреча начинается в восемь.", ["fyi, the meeting starts at eight", "fyi the meeting starts at eight"], { fullForm: "for your information" }),
    e("icymi", "если ты пропустил", "Предваряет новость или сообщение, которое собеседник мог не увидеть.", ["если ты согласен", "к твоему сведению"], ", the deadline has changed.", "", "Если ты пропустил, дедлайн изменился.", "Если ты пропустил, урок перенесён.", ["icymi, the class was moved", "icymi the class was moved"], { fullForm: "in case you missed it" }),
    e("tl;dr", "краткое резюме; «слишком длинно, не читал»", "Может быть реакцией на слишком длинный текст, названием краткого резюме или просьбой изложить главное.", ["очень подробный текст", "я всё прочитал"], "", ": we need to arrive at eight.", "Кратко: нам нужно прийти к восьми.", "Краткое резюме: встреча в пятницу.", ["tl;dr: the meeting is on Friday"], { aliases: ["tldr"], fullForm: "too long; didn't read" }),
  ],
  scenario: {
    promptRu: "Как попросить изложить главное из длинного текста?",
    quote: "Друг прислал огромный пост, а тебе сейчас нужно только краткое резюме.",
    options: ["tl;dr?", "fyi?", "icymi?"],
    answer: 0,
    whyRu: "Tl;dr? используется как просьба дать краткое резюме длинного текста.",
  },
};

const idiomInformation: LessonSpec = {
  id: "idiom-information",
  kind: "idiom",
  title: "Reveal, hide and infer information",
  titleRu: "Выдать, скрыть и понять скрытое",
  subtitleRu: "spill the beans · keep someone in the dark · read between the lines",
  ruleTitleRu: "Секреты и скрытый смысл",
  introRu: "Spill the beans — выдать секрет. Keep someone in the dark — держать кого-то в неведении. Read between the lines — понимать скрытый смысл, который не выражен прямо.",
  withWhomRu: "Ник",
  lines: [
    { text: "Who told you about the surprise party?", at: "17:35" },
    { me: true, text: "Sam spilled the beans.", at: "17:35", glossRu: "spill the beans — выдать секрет" },
    { text: "I can't believe they kept me in the dark for weeks.", at: "17:36", glossRu: "keep someone in the dark — держать кого-то в неведении" },
    { me: true, text: "There were hints. You just didn't read between the lines.", at: "17:36", glossRu: "read between the lines — читать между строк" },
  ],
  expressions: [
    e("spill the beans", "выдать секрет", "Неформально описывает случайное или намеренное раскрытие тайны.", ["сохранить секрет", "приготовить еду"], "The surprise is ruined because Sam ", ".", "Сюрприз испорчен, потому что Сэм выдал секрет.", "Он случайно выдал секрет.", ["he accidentally spilled the beans"], { gapAnswers: ["spilled the beans"] }),
    e("keep someone in the dark", "держать кого-то в неведении", "Намеренно не сообщать человеку важную информацию.", ["посвятить во все детали", "открыть секрет"], "They didn't tell her anything. They ", ".", "Ей ничего не сказали. Её держали в неведении.", "Не держи меня в неведении.", ["don't keep me in the dark", "do not keep me in the dark"], { gapAnswers: ["kept her in the dark"] }),
    e("read between the lines", "читать между строк", "Понимать намёки и скрытый смысл, а не только буквальные слова.", ["понимать только буквально", "читать вслух"], "She didn't say she was upset, but I could ", ".", "Она не сказала, что расстроена, но я понял это по намёкам.", "Она поняла скрытый смысл.", ["she read between the lines"]),
  ],
  scenario: {
    promptRu: "Что сказать, если кто-то раскрыл тайну?",
    quote: "Сэм рассказал о вечеринке-сюрпризе до того, как её должны были объявить.",
    options: ["Sam spilled the beans.", "Sam kept me in the dark.", "Sam read between the lines."],
    answer: 0,
    whyRu: "Spill the beans означает выдать секрет.",
  },
};

const speechClarification: LessonSpec = {
  id: "speech-clarification",
  kind: "speech",
  title: "Ask for repetition and explanation",
  titleRu: "Попросить повторить и объяснить",
  subtitleRu: "come again? · what do you mean by that? · walk me through it",
  ruleTitleRu: "Уточнить непонятное",
  introRu: "Come again? просит повторить сказанное. What do you mean by that? уточняет смысл реплики. Walk me through it просит объяснить процесс по шагам.",
  withWhomRu: "Алекс",
  lines: [
    { text: "You need to reverse the polarity.", at: "13:50" },
    { me: true, text: "Come again? What do you mean by that?", at: "13:50", glossRu: "come again? — повтори, пожалуйста; what do you mean by that? — что ты имеешь в виду?" },
    { text: "I'll show you the settings.", at: "13:51" },
    { me: true, text: "Thanks. Walk me through it.", at: "13:51", glossRu: "walk me through it — объясни мне по шагам" },
  ],
  expressions: [
    e("come again?", "повтори, пожалуйста; что ты сказал?", "Просьба повторить реплику, которую не расслышали или не поняли. В некоторых контекстах может звучать удивлённо.", ["не повторяй", "объясни по шагам"], "Sorry, ", "", "Прости, повтори, пожалуйста.", "Повтори, пожалуйста. Я не расслышал.", ["come again? I didn't hear you", "come again? I did not hear you"]),
    e("what do you mean by that?", "что ты имеешь в виду?", "Просит объяснить смысл или намерение конкретной реплики; интонация влияет на оттенок.", ["повтори громче", "я всё понял"], "I don't understand your last comment. ", "", "Я не понимаю твоё последнее замечание. Что ты имеешь в виду?", "Что ты имеешь в виду под «позже»?", ["what do you mean by later?"]),
    e("walk me through it", "объясни мне по шагам", "Просьба последовательно объяснить процесс, решение или инструкцию.", ["не объясняй ничего", "повтори последнее слово"], "This looks complicated. ", ".", "Это выглядит сложно. Объясни мне по шагам.", "Объясни мне это по шагам.", ["walk me through it"]),
  ],
  scenario: {
    promptRu: "Как попросить повторить нерасслышанную фразу?",
    quote: "Из-за шума ты не расслышал последнее предложение собеседника.",
    options: ["Come again?", "What do you mean by that?", "Walk me through it."],
    answer: 0,
    whyRu: "Come again? используется, когда нужно повторить сказанное.",
  },
};

const chatLaughter: LessonSpec = {
  id: "chat-laughter",
  kind: "chat",
  title: "Laugh and soften a joke",
  titleRu: "Смеяться и смягчать шутку",
  subtitleRu: "lol · lmao · jk",
  ruleTitleRu: "Реакции на смешное в переписке",
  introRu: "Lol передаёт смех или «смешно», а иногда просто смягчает тон сообщения. Lmao означает «очень смешно» и содержит грубое слово в расшифровке. Jk показывает, что предыдущая реплика была шуткой.",
  withWhomRu: "Крис",
  lines: [
    { text: "I just waved at someone who wasn't waving at me.", at: "22:45" },
    { me: true, text: "lmao. I'd hide too, lol.", at: "22:45", glossRu: "lmao — очень смешно, грубовато; lol — здесь смягчает тон" },
    { text: "Not funny.", at: "22:46" },
    { me: true, text: "jk, it happens to everyone.", at: "22:46", glossRu: "jk — шучу" },
  ],
  expressions: [
    e("lol", "смеюсь, смешно; также смягчает тон сообщения", "Не всегда обозначает буквальный смех: в конце реплики может делать её мягче и дружелюбнее.", ["очень грустно", "я серьёзен"], "That was awkward, ", ".", "Было неловко, но сообщение звучит легко благодаря lol.", "Смешно. Я тоже так делал.", ["lol. I've done that too", "lol. I have done that too"], { fullForm: "laughing out loud" }),
    e("lmao", "очень смешно", "Сильнее, чем lol. Расшифровка содержит грубое слово, поэтому сокращение не подходит для формального общения.", ["совсем не смешно", "я обижен"], "That video was so funny. ", ".", "Это видео очень смешное. Я умираю со смеху.", "Очень смешно. Не могу перестать смеяться.", ["lmao. I can't stop laughing", "lmao. I cannot stop laughing"], { fullForm: "laughing my ass off" }),
    e("jk", "шучу", "Быстро показывает, что сказанное не нужно воспринимать серьёзно.", ["я серьёзно", "я не знаю"], "I didn't mean it seriously. ", ".", "Я не говорил это серьёзно. Шучу.", "Шучу. Я не это имел в виду.", ["jk. I didn't mean it", "jk. I did not mean it"], { fullForm: "just kidding" }),
  ],
  scenario: {
    promptRu: "Как показать, что предыдущая реплика была шуткой?",
    quote: "Собеседник принял твою шутку всерьёз, и ты хочешь сразу это прояснить.",
    options: ["jk.", "lol.", "lmao."],
    answer: 0,
    whyRu: "Jk — сокращение от just kidding, то есть «шучу».",
  },
};

const idiomMoney: LessonSpec = {
  id: "idiom-money",
  kind: "idiom",
  title: "Talk about prices and spending",
  titleRu: "Говорить о ценах и расходах",
  subtitleRu: "cost an arm and a leg · make ends meet · tighten your belt",
  ruleTitleRu: "Три идиомы о деньгах",
  introRu: "Cost an arm and a leg — стоить очень дорого. Make ends meet — сводить концы с концами, иметь достаточно денег на основные нужды. Tighten your belt — затянуть пояс и сократить расходы.",
  withWhomRu: "Софи",
  lines: [
    { text: "How much was the concert?", at: "19:30" },
    { me: true, text: "It cost an arm and a leg. I'm tightening my belt this month.", at: "19:30", glossRu: "cost an arm and a leg — стоить очень дорого; tighten your belt — сократить расходы" },
    { text: "Same. I can barely make ends meet.", at: "19:31", glossRu: "make ends meet — сводить концы с концами" },
  ],
  expressions: [
    e("cost an arm and a leg", "стоить очень дорого", "Подчёркивает чрезмерно высокую цену, а не буквальную плату частями тела.", ["стоить очень дёшево", "быть бесплатным"], "This apartment is beautiful, but it ", ".", "Квартира красивая, но стоит очень дорого.", "Этот телефон стоит очень дорого.", ["this phone costs an arm and a leg"], { gapAnswers: ["costs an arm and a leg"] }),
    e("make ends meet", "сводить концы с концами", "Иметь достаточно денег на необходимые расходы, часто с трудом.", ["тратить без ограничений", "накопить много денег"], "With two part-time jobs, he can barely ", ".", "Даже с двумя подработками он с трудом сводит концы с концами.", "Мне хватает денег только на основные нужды.", ["I can barely make ends meet"]),
    e("tighten your belt", "затянуть пояс, сократить расходы", "Начать экономить и тратить меньше из-за финансовых ограничений.", ["увеличить расходы", "купить новый ремень"], "I need to spend less and ", ".", "Мне нужно меньше тратить и сократить расходы.", "Мне нужно сократить расходы в этом месяце.", ["I need to tighten my belt this month"], { gapAnswers: ["tighten my belt"] }),
  ],
  scenario: {
    promptRu: "Как сказать, что вещь стоила очень дорого?",
    quote: "Билет на концерт оказался непомерно дорогим.",
    options: ["It cost an arm and a leg.", "It made ends meet.", "It tightened my belt."],
    answer: 0,
    whyRu: "Cost an arm and a leg означает стоить очень дорого.",
  },
};

const speechContractions: LessonSpec = {
  id: "speech-contractions",
  kind: "speech",
  title: "Understand reduced spoken forms",
  titleRu: "Понимать сокращённую разговорную речь",
  subtitleRu: "lemme · gimme · dunno",
  ruleTitleRu: "Как полные формы звучат в быстрой речи",
  introRu: "Lemme — разговорная форма let me, gimme — give me, dunno — don't know. Они помогают понимать короткие реплики, но не подходят для формального письма; в нём используй полные формы.",
  withWhomRu: "Бен",
  lines: [
    { text: "Do you know where my keys are?", at: "08:20" },
    { me: true, text: "dunno. lemme check the kitchen.", at: "08:20", glossRu: "dunno — не знаю; lemme — позволь мне" },
    { text: "Found them. Hand me my wallet too.", at: "08:21" },
    { me: true, text: "Okay. gimme a second.", at: "08:21", glossRu: "gimme — дай мне; эти три формы не для формального письма" },
  ],
  expressions: [
    e("lemme", "дай мне / позволь мне", "Разговорная форма let me. Подходит для устной речи и личных чатов, но не для формального письма.", ["оставь меня", "я не знаю"], "", " see that photo.", "Позволь мне посмотреть фотографию.", "Позволь мне помочь тебе.", ["lemme help you"], { fullForm: "let me" }),
    e("gimme", "дай мне", "Разговорная форма give me. Звучит неформально и не подходит для формального письма.", ["возьми у меня", "позволь тебе"], "", " a minute to finish.", "Дай мне минуту закончить.", "Дай мне секунду.", ["gimme a second"], { fullForm: "give me" }),
    e("dunno", "не знаю", "Разговорная форма don't know. Для формального письма нужна полная форма.", ["знаю точно", "не понимаю"], "Where is Sam? ", ".", "Где Сэм? Не знаю.", "Я не знаю, где мои ключи.", ["dunno where my keys are"], { aliases: ["I dunno"], fullForm: "don't know" }),
  ],
  scenario: {
    promptRu: "Как в разговоре попросить показать фотографию?",
    quote: "Ты общаешься с другом и хочешь сказать «позволь мне посмотреть» короткой разговорной формой.",
    options: ["lemme see.", "gimme see.", "dunno."],
    answer: 0,
    whyRu: "Lemme — разговорная форма let me, поэтому lemme see означает «дай / позволь мне посмотреть».",
  },
};

export const trackExpansionModules = [
  cycle("cycle-thirteen", "Count Me In", "Count Me In", "Meet people, make plans and join in.", "Знакомься, договаривайся о встречах и присоединяйся к планам.", chatMeetups, idiomIntroductions, speechPlans),
  cycle("cycle-fourteen", "My Bad", "My Bad", "Fix mistakes, apologize and start again.", "Исправляй ошибки, извиняйся и начинай заново.", chatMistakes, idiomSetbacks, speechApologies),
  cycle("cycle-fifteen", "You've Got This", "You've Got This", "Talk about pressure, take breaks and support friends.", "Говори о нагрузке, бери паузу и поддерживай друзей.", chatAvailability, idiomWorkload, speechSupport),
  cycle("cycle-sixteen", "Your Call", "Your Call", "Share opinions, make decisions and say no.", "Выражай мнение, принимай решения и отказывайся без лишних объяснений.", chatOpinions, idiomDeciding, speechRefusals),
  cycle("cycle-seventeen", "Between the Lines", "Between the Lines", "Share information, notice hints and ask for clarity.", "Делись информацией, замечай намёки и уточняй непонятное.", chatInformation, idiomInformation, speechClarification),
  cycle("cycle-eighteen", "Everyday Mode", "Everyday Mode", "Discuss spending, joke in chats and understand reduced speech.", "Обсуждай повседневные траты, шути в чатах и понимай сокращённую устную речь.", chatLaughter, idiomMoney, speechContractions),
];
