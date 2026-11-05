import { cycle, type ExpressionSpec } from "./trackModel";
import { pairSpec } from "./trackPairs";

export const newExpressions: ExpressionSpec[] = [
  {
    "short": "wdym",
    "meaningRu": "что ты имеешь в виду?",
    "noteRu": "What do you mean? Вопрос об уточнении; без контекста может звучать резко.",
    "wrong": [
      "куда ты идёшь?",
      "я всё понял"
    ],
    "before": "",
    "after": " we have to start again?",
    "gapRu": "В смысле нам нужно начинать заново?",
    "translationRu": "Что ты имеешь в виду под «слишком поздно»?",
    "translationEn": [
      "wdym it's too late?"
    ],
    "fullForm": "what do you mean?"
  },
  {
    "short": "wya",
    "meaningRu": "ты где?",
    "noteRu": "Where you at? Неформальное сокращение для чата. В полном стандартном вопросе: Where are you?",
    "wrong": [
      "когда ты придёшь?",
      "чем ты занимаешься?"
    ],
    "before": "I'm outside. ",
    "after": "?",
    "gapRu": "Я снаружи. Ты где?",
    "translationRu": "Ты где? Я у входа.",
    "translationEn": [
      "wya? I'm at the entrance."
    ],
    "fullForm": "where you at?"
  },
  {
    "short": "hmu",
    "meaningRu": "напиши мне, свяжись со мной",
    "noteRu": "Hit me up. Можно попросить написать или позвонить; это не буквальное «ударь меня».",
    "wrong": [
      "оставь меня в покое",
      "подожди меня"
    ],
    "before": "",
    "after": " when you're free.",
    "gapRu": "Напиши мне, когда освободишься.",
    "translationRu": "Напиши мне после урока.",
    "translationEn": [
      "hmu after class."
    ],
    "fullForm": "hit me up"
  },
  {
    "short": "dm me",
    "meaningRu": "напиши мне в личку",
    "noteRu": "Direct message me. Просьба перейти в личные сообщения, а не публиковать ответ для всех.",
    "wrong": [
      "позвони мне",
      "опубликуй это для всех"
    ],
    "before": "Please ",
    "after": " the address.",
    "gapRu": "Пожалуйста, пришли мне адрес в личку.",
    "translationRu": "Пришли мне подробности в личку.",
    "translationEn": [
      "dm me the details."
    ],
    "fullForm": "direct message me"
  },
  {
    "short": "tbf",
    "meaningRu": "справедливости ради",
    "noteRu": "To be fair. Добавляет обстоятельство, которое помогает оценить ситуацию менее односторонне.",
    "wrong": [
      "если я правильно помню",
      "мне всё равно"
    ],
    "before": "",
    "after": ", she did warn us.",
    "gapRu": "Справедливости ради, она нас предупреждала.",
    "translationRu": "Справедливости ради, это был его первый день.",
    "translationEn": [
      "tbf, it was his first day."
    ],
    "fullForm": "to be fair"
  },
  {
    "short": "fwiw",
    "meaningRu": "если это имеет значение",
    "noteRu": "For what it's worth. Мягко добавляет мнение или информацию: говорящий не уверен, насколько они помогут.",
    "wrong": [
      "сколько это стоит?",
      "я категорически против"
    ],
    "before": "",
    "after": ", I liked your idea.",
    "gapRu": "Если моё мнение имеет значение, мне понравилась твоя идея.",
    "translationRu": "Если это поможет, я согласен с тобой.",
    "translationEn": [
      "fwiw, I agree with you."
    ],
    "fullForm": "for what it's worth"
  },
  {
    "short": "iow",
    "meaningRu": "другими словами",
    "noteRu": "In other words. Переформулирует предыдущую мысль; встречается в письменных обсуждениях.",
    "wrong": [
      "тем временем",
      "в первый раз"
    ],
    "before": "",
    "after": ", we need more time.",
    "gapRu": "Другими словами, нам нужно больше времени.",
    "translationRu": "Другими словами, план изменился.",
    "translationEn": [
      "iow, the plan has changed."
    ],
    "fullForm": "in other words"
  },
  {
    "short": "imho",
    "meaningRu": "по моему скромному мнению",
    "noteRu": "In my humble opinion. Вводит личное мнение; слово humble не гарантирует вежливость, иногда звучит иронично.",
    "wrong": [
      "это доказанный факт",
      "я не помню"
    ],
    "before": "",
    "after": ", the first version was clearer.",
    "gapRu": "По моему скромному мнению, первая версия была понятнее.",
    "translationRu": "По моему скромному мнению, нам стоит подождать.",
    "translationEn": [
      "imho, we should wait."
    ],
    "fullForm": "in my humble opinion"
  },
  {
    "short": "tmi",
    "meaningRu": "это лишние подробности",
    "noteRu": "Too much information. Часто реакция на слишком личные или неприятные детали. Может прозвучать бесцеремонно.",
    "wrong": [
      "расскажи подробнее",
      "я ничего не расслышал"
    ],
    "before": "Okay, ",
    "after": "! I don't need the bathroom details.",
    "gapRu": "Ладно, лишние подробности! Мне не нужны детали про туалет.",
    "translationRu": "Лишние подробности! Оставь детали при себе.",
    "translationEn": [
      "tmi! Keep the details to yourself."
    ],
    "fullForm": "too much information"
  },
  {
    "short": "nsfw",
    "meaningRu": "не стоит открывать при посторонних",
    "noteRu": "Not safe for work. Пометка для откровенного или другого неподходящего для работы контента; не обязательно только сексуального.",
    "wrong": [
      "безопасно для детей",
      "ссылка не работает"
    ],
    "before": "That link is ",
    "after": "; don't open it in the office.",
    "gapRu": "Эта ссылка содержит неподходящий для работы контент; не открывай её в офисе.",
    "translationRu": "Это видео не стоит открывать на работе.",
    "translationEn": [
      "this video is nsfw."
    ],
    "fullForm": "not safe for work"
  },
  {
    "short": "istg",
    "meaningRu": "клянусь",
    "noteRu": "I swear to God. Эмоциональное заверение или усиление раздражения; не для официального письма.",
    "wrong": [
      "я шучу",
      "я не уверен"
    ],
    "before": "",
    "after": ", I left the keys right here.",
    "gapRu": "Клянусь, я оставил ключи прямо здесь.",
    "translationRu": "Клянусь, я говорю правду.",
    "translationEn": [
      "istg, I'm telling the truth."
    ],
    "fullForm": "I swear to God"
  },
  {
    "short": "ffs",
    "meaningRu": "да сколько можно!",
    "noteRu": "For fuck's sake. Сокращение ругательства: выражает раздражение и может оскорбить адресата. Даже в чате остаётся грубым.",
    "wrong": [
      "большое спасибо",
      "я очень рад"
    ],
    "before": "",
    "after": ", the app crashed again!",
    "gapRu": "Да сколько можно, приложение опять вылетело!",
    "translationRu": "Да сколько можно, перестань кричать!",
    "translationEn": [
      "ffs, stop shouting!"
    ],
    "fullForm": "for fuck's sake",
    "register": "veryCasual"
  },
  {
    "short": "nbd",
    "meaningRu": "ничего страшного",
    "noteRu": "No big deal. Уменьшает важность проблемы; не используй, чтобы обесценить серьёзные переживания другого.",
    "wrong": [
      "это катастрофа",
      "я не согласен"
    ],
    "before": "You spilled some water? ",
    "after": ", I'll wipe it up.",
    "gapRu": "Ты пролил немного воды? Ничего страшного, я вытру.",
    "translationRu": "Ничего страшного, мы можем попробовать снова.",
    "translationEn": [
      "nbd, we can try again."
    ],
    "fullForm": "no big deal"
  },
  {
    "short": "dw",
    "meaningRu": "не переживай",
    "noteRu": "Don't worry. Короткое успокоение в личной переписке.",
    "wrong": [
      "не жди меня",
      "не пиши мне"
    ],
    "before": "",
    "after": ", I saved you a seat.",
    "gapRu": "Не переживай, я занял тебе место.",
    "translationRu": "Не переживай, я тебе помогу.",
    "translationEn": [
      "dw, I'll help you."
    ],
    "fullForm": "don't worry"
  },
  {
    "short": "asap",
    "meaningRu": "как можно скорее",
    "noteRu": "As soon as possible. Встречается и в работе; просьба с asap может ощущаться как давление. Для точного срока лучше указать время.",
    "wrong": [
      "когда-нибудь потом",
      "как обычно"
    ],
    "before": "Please send the file ",
    "after": ".",
    "gapRu": "Пожалуйста, пришли файл как можно скорее.",
    "translationRu": "Мне нужен твой ответ как можно скорее.",
    "translationEn": [
      "I need your answer asap."
    ],
    "fullForm": "as soon as possible"
  },
  {
    "short": "ttys",
    "meaningRu": "скоро поговорим",
    "noteRu": "Talk to you soon. Неформальное завершение переписки; не обещает конкретного времени звонка.",
    "wrong": [
      "ты ещё здесь?",
      "поговорим прямо сейчас"
    ],
    "before": "I have to go. ",
    "after": "!",
    "gapRu": "Мне пора. Скоро поговорим!",
    "translationRu": "Спасибо за звонок. Скоро поговорим!",
    "translationEn": [
      "thanks for the call. ttys!"
    ],
    "fullForm": "talk to you soon"
  },
  {
    "short": "get the wrong end of the stick",
    "meaningRu": "неправильно понять ситуацию",
    "noteRu": "Особенно характерно для британского английского. Речь о неверной интерпретации, а не о том, что ты не расслышал слова.",
    "wrong": [
      "правильно понять намёк",
      "сознательно обмануть"
    ],
    "before": "Don't ",
    "after": ": I'm not angry with you.",
    "gapRu": "Не пойми неправильно: я на тебя не злюсь.",
    "translationRu": "Ты неправильно понял ситуацию.",
    "translationEn": [
      "you got the wrong end of the stick."
    ]
  },
  {
    "short": "bark up the wrong tree",
    "meaningRu": "искать причину не там",
    "noteRu": "Предпринимать ошибочную попытку или подозревать не того человека. В речи: you're barking up the wrong tree.",
    "wrong": [
      "найти правильное решение",
      "громко спорить"
    ],
    "before": "If you blame me, you're going to ",
    "after": ".",
    "gapRu": "Если ты обвиняешь меня, то будешь искать виновного не там.",
    "translationRu": "Ты ищешь виновного не там.",
    "translationEn": [
      "you're barking up the wrong tree."
    ]
  },
  {
    "short": "twist someone's arm",
    "meaningRu": "настойчиво уговаривать",
    "noteRu": "Часто с лёгкой иронией: You twisted my arm — «ладно, уговорил». Не буквальное физическое действие.",
    "wrong": [
      "помочь без просьбы",
      "отказаться от приглашения"
    ],
    "before": "Don't ",
    "after": "; let her decide.",
    "gapRu": "Не уговаривай её настойчиво; пусть сама решит.",
    "translationRu": "Тебе не нужно меня уговаривать.",
    "translationEn": [
      "you don't need to twist my arm."
    ],
    "gapAnswers": [
      "twist her arm"
    ],
    "aliases": [
      "twist my arm",
      "twist her arm"
    ]
  },
  {
    "short": "play it by ear",
    "meaningRu": "действовать по ситуации",
    "noteRu": "Решать по ходу событий, без заранее установленного плана.",
    "wrong": [
      "строго следовать плану",
      "сразу всё отменить"
    ],
    "before": "We haven't booked dinner. Let's ",
    "after": ".",
    "gapRu": "Мы не забронировали ужин. Давай решим по ситуации.",
    "translationRu": "Давай решим по ситуации завтра.",
    "translationEn": [
      "let's play it by ear tomorrow."
    ]
  },
  {
    "short": "miss the boat",
    "meaningRu": "упустить возможность",
    "noteRu": "Речь о шансе, который был доступен раньше; не обязательно о транспорте.",
    "wrong": [
      "выиграть время",
      "передумать в последний момент"
    ],
    "before": "Apply today or you'll ",
    "after": ".",
    "gapRu": "Подай заявку сегодня, иначе упустишь возможность.",
    "translationRu": "Я упустил возможность купить дешёвые билеты.",
    "translationEn": [
      "I missed the boat on cheap tickets."
    ]
  },
  {
    "short": "be in the same boat",
    "meaningRu": "быть в одинаковом трудном положении",
    "noteRu": "Обычно о людях с общей проблемой. In the same boat не означает одинаковое мнение.",
    "wrong": [
      "полностью соглашаться",
      "соревноваться друг с другом"
    ],
    "before": "If we both fail, we'll ",
    "after": ".",
    "gapRu": "Если мы оба провалимся, окажемся в одинаковом трудном положении.",
    "translationRu": "Мы в одинаковом положении.",
    "translationEn": [
      "we're in the same boat."
    ]
  },
  {
    "short": "the elephant in the room",
    "meaningRu": "проблема, которую все избегают обсуждать",
    "noteRu": "Все знают о важной или неловкой теме, но никто не хочет первым её поднимать.",
    "wrong": [
      "неожиданный гость",
      "незначительная деталь"
    ],
    "before": "Let's address ",
    "after": ": we have no budget.",
    "gapRu": "Давайте обсудим проблему, которую все обходят: у нас нет бюджета.",
    "translationRu": "Нам нужно обсудить проблему, которую все избегают.",
    "translationEn": [
      "we need to address the elephant in the room."
    ]
  },
  {
    "short": "the tip of the iceberg",
    "meaningRu": "небольшая видимая часть большой проблемы",
    "noteRu": "Указывает, что скрытая часть ситуации намного больше того, что уже обнаружено.",
    "wrong": [
      "окончательное решение",
      "самая трудная часть уже позади"
    ],
    "before": "These two errors are only ",
    "after": ".",
    "gapRu": "Эти две ошибки — лишь небольшая видимая часть большой проблемы.",
    "translationRu": "Эта жалоба — лишь верхушка айсберга.",
    "translationEn": [
      "this complaint is just the tip of the iceberg."
    ]
  },
  {
    "short": "get cold feet",
    "meaningRu": "струсить перед решительным шагом",
    "noteRu": "Перед важным действием начать сомневаться и бояться, хотя раньше собирался его выполнить.",
    "wrong": [
      "сильно замёрзнуть",
      "решительно действовать"
    ],
    "before": "I agreed to speak, but I might ",
    "after": " on stage.",
    "gapRu": "Я согласился выступить, но могу струсить на сцене.",
    "translationRu": "Он струсил перед свадьбой.",
    "translationEn": [
      "he got cold feet before the wedding."
    ]
  },
  {
    "short": "jump the gun",
    "meaningRu": "поторопиться, начать раньше времени",
    "noteRu": "Сделать что-то до подходящего момента или прежде, чем появились необходимые сведения.",
    "wrong": [
      "слишком долго ждать",
      "победить соперника"
    ],
    "before": "Don't ",
    "after": "; wait for the official result.",
    "gapRu": "Не торопись; дождись официального результата.",
    "translationRu": "Мы поторопились с объявлением.",
    "translationEn": [
      "we jumped the gun with the announcement."
    ]
  },
  {
    "short": "add fuel to the fire",
    "meaningRu": "подлить масла в огонь",
    "noteRu": "Усилить уже существующую ссору, злость или неприятную ситуацию.",
    "wrong": [
      "снять напряжение",
      "начать с чистого листа"
    ],
    "before": "Insulting him will only ",
    "after": ".",
    "gapRu": "Если оскорбишь его, только подольёшь масла в огонь.",
    "translationRu": "Её комментарий подлил масла в огонь.",
    "translationEn": [
      "her comment added fuel to the fire."
    ]
  },
  {
    "short": "the last straw",
    "meaningRu": "последняя капля",
    "noteRu": "Последняя из нескольких неприятностей, после которой терпение заканчивается.",
    "wrong": [
      "первая попытка",
      "последняя надежда"
    ],
    "before": "When he lied again, that was ",
    "after": ".",
    "gapRu": "Когда он снова солгал, это стало последней каплей.",
    "translationRu": "Его опоздание стало последней каплей.",
    "translationEn": [
      "his lateness was the last straw."
    ]
  },
  {
    "short": "a silver lining",
    "meaningRu": "положительная сторона неприятной ситуации",
    "noteRu": "Хорошее обстоятельство внутри плохой ситуации; не означает, что вся проблема исчезла.",
    "wrong": [
      "скрытая опасность",
      "дорогая покупка"
    ],
    "before": "Losing that job had ",
    "after": ": I found a better one.",
    "gapRu": "У потери той работы была хорошая сторона: я нашёл работу лучше.",
    "translationRu": "В этой задержке есть хорошая сторона.",
    "translationEn": [
      "there's a silver lining to this delay."
    ]
  },
  {
    "short": "the light at the end of the tunnel",
    "meaningRu": "надежда на окончание трудного периода",
    "noteRu": "Первые признаки того, что длительные трудности скоро закончатся.",
    "wrong": [
      "начало новых проблем",
      "полная потеря надежды"
    ],
    "before": "After months of repairs, we can see ",
    "after": ".",
    "gapRu": "После месяцев ремонта мы видим, что трудности скоро закончатся.",
    "translationRu": "Наконец я вижу свет в конце туннеля.",
    "translationEn": [
      "I can finally see the light at the end of the tunnel."
    ]
  },
  {
    "short": "go the extra mile",
    "meaningRu": "сделать больше ожидаемого",
    "noteRu": "Приложить дополнительные усилия, чтобы помочь или сделать работу особенно хорошо.",
    "wrong": [
      "сделать только необходимое",
      "отложить работу"
    ],
    "before": "She always tries to ",
    "after": " for her students.",
    "gapRu": "Она всегда старается сделать для учеников больше ожидаемого.",
    "translationRu": "Он сделал для нас больше, чем от него ожидали.",
    "translationEn": [
      "he went the extra mile for us."
    ]
  },
  {
    "short": "pull your weight",
    "meaningRu": "выполнять свою долю работы",
    "noteRu": "Вносить справедливый вклад в общее дело; не заставлять остальных делать всё за тебя.",
    "wrong": [
      "взять всю работу на себя",
      "работать быстрее всех"
    ],
    "before": "This is a team project, so you need to ",
    "after": ".",
    "gapRu": "Это командный проект, поэтому тебе нужно выполнять свою долю работы.",
    "translationRu": "Тебе нужно выполнять свою долю работы.",
    "translationEn": [
      "you need to pull your weight."
    ]
  },
  {
    "short": "be for real",
    "meaningRu": "давай серьёзно",
    "noteRu": "Разговорное требование говорить реалистично или честно. Может звучать раздражённо и не подходит для вежливого несогласия с незнакомым.",
    "wrong": [
      "будь собой",
      "хорошо повеселись"
    ],
    "before": "",
    "after": ": you can't finish all that in ten minutes.",
    "gapRu": "Давай серьёзно: ты не закончишь всё это за десять минут.",
    "translationRu": "Давай серьёзно, этот план не сработает.",
    "translationEn": [
      "be for real, this plan won't work."
    ]
  },
  {
    "short": "you can't be serious",
    "meaningRu": "ты же не всерьёз!",
    "noteRu": "Выражает сильное недоверие или возмущение; тон важен.",
    "wrong": [
      "ты прав",
      "тебе нужно сосредоточиться"
    ],
    "before": "A hundred pounds for a sandwich? ",
    "after": "!",
    "gapRu": "Сто фунтов за сэндвич? Ты же не всерьёз!",
    "translationRu": "Ты же не всерьёз! Это слишком дорого.",
    "translationEn": [
      "you can't be serious! That's too expensive."
    ]
  },
  {
    "short": "I'm game",
    "meaningRu": "я готов попробовать",
    "noteRu": "Неформальное согласие участвовать в предложенном деле. Обычно ответ на конкретную идею.",
    "wrong": [
      "я играю прямо сейчас",
      "я устал"
    ],
    "before": "A night hike? ",
    "after": "!",
    "gapRu": "Ночной поход? Я готов!",
    "translationRu": "Я готов попробовать, если ты тоже.",
    "translationEn": [
      "I'm game if you are."
    ]
  },
  {
    "short": "hard pass",
    "meaningRu": "категорически нет",
    "noteRu": "Очень прямой отказ, который может звучать резко. Для мягкого отказа лучше использовать уже знакомое I'll pass.",
    "wrong": [
      "я согласен",
      "мне нужно подумать"
    ],
    "before": "Camping in a storm? ",
    "after": ".",
    "gapRu": "Ночевать в палатке во время шторма? Категорически нет.",
    "translationRu": "Нет уж, я останусь дома.",
    "translationEn": [
      "hard pass. I'm staying home."
    ]
  },
  {
    "short": "what's the catch?",
    "meaningRu": "в чём подвох?",
    "noteRu": "Вопрос о скрытом условии у слишком привлекательного предложения.",
    "wrong": [
      "когда это начинается?",
      "кто победил?"
    ],
    "before": "Free flights for a year? ",
    "after": "",
    "gapRu": "Бесплатные перелёты целый год? В чём подвох?",
    "translationRu": "Звучит отлично. В чём подвох?",
    "translationEn": [
      "sounds great. What's the catch?"
    ]
  },
  {
    "short": "sounds fishy",
    "meaningRu": "звучит подозрительно",
    "noteRu": "Неформальное сомнение в честности или правдоподобности истории, а не описание запаха.",
    "wrong": [
      "звучит убедительно",
      "это пахнет рыбой"
    ],
    "before": "That offer ",
    "after": " to me.",
    "gapRu": "Это предложение кажется мне подозрительным.",
    "translationRu": "Эта история звучит подозрительно.",
    "translationEn": [
      "that story sounds fishy."
    ]
  },
  {
    "short": "that tracks",
    "meaningRu": "это логично",
    "noteRu": "Неформальная реакция: информация согласуется с тем, что уже известно. Не связано с отслеживанием местоположения.",
    "wrong": [
      "это неправда",
      "я слежу за тобой"
    ],
    "before": "She missed the train? ",
    "after": "; she left late.",
    "gapRu": "Она опоздала на поезд? Логично: она поздно вышла.",
    "translationRu": "Это логично. Он ненавидит рано вставать.",
    "translationEn": [
      "that tracks. He hates getting up early."
    ]
  },
  {
    "short": "go figure",
    "meaningRu": "вот и пойми",
    "noteRu": "Часто ироничная реакция на странность или предсказуемый парадокс. Не просьба посчитать или решить задачу.",
    "wrong": [
      "пойди посчитай",
      "отличная работа"
    ],
    "before": "The printer broke right before the deadline. ",
    "after": ".",
    "gapRu": "Принтер сломался прямо перед дедлайном. Вот и пойми.",
    "translationRu": "Он снова забыл ключи. Кто бы сомневался.",
    "translationEn": [
      "he forgot his keys again. Go figure."
    ]
  },
  {
    "short": "not feeling it",
    "meaningRu": "не заходит, нет настроения",
    "noteRu": "О занятии, идее или впечатлении, к которым сейчас не лежит душа. В предложении обычно I'm not feeling it.",
    "wrong": [
      "я ничего не чувствую рукой",
      "мне очень нравится"
    ],
    "before": "We could go dancing, but I'm ",
    "after": ".",
    "gapRu": "Мы могли бы пойти танцевать, но у меня нет настроения.",
    "translationRu": "Сегодня мне это не заходит.",
    "translationEn": [
      "I'm not feeling it today."
    ]
  },
  {
    "short": "a bit much",
    "meaningRu": "это уже перебор",
    "noteRu": "О чём-то чрезмерном: цене, требовании или поведении. Bit часто смягчает критику.",
    "wrong": [
      "совсем недостаточно",
      "как раз вовремя"
    ],
    "before": "Three calls in five minutes is ",
    "after": ".",
    "gapRu": "Три звонка за пять минут — это уже перебор.",
    "translationRu": "Это требование — уже перебор.",
    "translationEn": [
      "that request is a bit much."
    ]
  },
  {
    "short": "give it a rest",
    "meaningRu": "хватит уже об этом",
    "noteRu": "Раздражённая просьба перестать повторять тему или жаловаться. Не буквальное предложение отдохнуть.",
    "wrong": [
      "расскажи ещё",
      "немного отдохни"
    ],
    "before": "You've complained about it all day. ",
    "after": "!",
    "gapRu": "Ты жалуешься на это весь день. Хватит уже!",
    "translationRu": "Хватит уже об этом. Мы тебя услышали.",
    "translationEn": [
      "give it a rest. We heard you."
    ]
  },
  {
    "short": "get off my back",
    "meaningRu": "хватит на меня давить",
    "noteRu": "Резкое требование перестать придираться, контролировать или торопить. Может обострить спор.",
    "wrong": [
      "помоги мне",
      "встань позади меня"
    ],
    "before": "I'll finish it tonight. ",
    "after": "!",
    "gapRu": "Я закончу сегодня вечером. Хватит на меня давить!",
    "translationRu": "Отстань, я над этим работаю.",
    "translationEn": [
      "get off my back. I'm working on it."
    ]
  },
  {
    "short": "you dodged a bullet",
    "meaningRu": "ты избежал больших неприятностей",
    "noteRu": "О ситуации, которая могла закончиться намного хуже. Не стоит так обесценивать чужую боль сразу после расставания.",
    "wrong": [
      "тебе сильно не повезло",
      "ты упустил прекрасный шанс"
    ],
    "before": "They fired half the staff after you declined. ",
    "after": ".",
    "gapRu": "После твоего отказа они уволили половину сотрудников. Ты избежал больших неприятностей.",
    "translationRu": "Ты избежал больших неприятностей с той работой.",
    "translationEn": [
      "you dodged a bullet with that job."
    ]
  },
  {
    "short": "their loss",
    "meaningRu": "они сами потеряли",
    "noteRu": "Поддержка человека, которого отвергли или не оценили: потерял тот, кто отказал.",
    "wrong": [
      "ты виноват",
      "мы проиграли"
    ],
    "before": "They didn't hire you? ",
    "after": ".",
    "gapRu": "Они тебя не наняли? Они сами потеряли.",
    "translationRu": "Они тебя не выбрали? Они сами потеряли.",
    "translationEn": [
      "they didn't choose you? Their loss."
    ]
  },
  {
    "short": "you nailed it",
    "meaningRu": "ты отлично справился",
    "noteRu": "Неформальная похвала за точное или очень удачное выполнение задачи.",
    "wrong": [
      "ты всё испортил",
      "ты забыл задание"
    ],
    "before": "That presentation was excellent. ",
    "after": "!",
    "gapRu": "Презентация была отличной. Ты прекрасно справился!",
    "translationRu": "Ты отлично справился с этим ответом.",
    "translationEn": [
      "you nailed it with that answer."
    ]
  },
  {
    "short": "you blew it",
    "meaningRu": "ты всё испортил",
    "noteRu": "Резкая оценка ошибки или упущенной возможности. Для поддержки после неудачи такое не подходит.",
    "wrong": [
      "ты отлично справился",
      "ты передумал"
    ],
    "before": "You shared the secret before the launch. ",
    "after": ".",
    "gapRu": "Ты раскрыл секрет до запуска. Ты всё испортил.",
    "translationRu": "У тебя был шанс, но ты всё испортил.",
    "translationEn": [
      "you had a chance, but you blew it."
    ]
  }
];

const conversations: string[][] = [
  ["Meet me by the old entrance.", "wdym old entrance?", "The one near the café. wya?", "I'm by the library."],
  ["I heard you're leaving the team.", "You got the wrong end of the stick. I'm just taking Friday off.", "So I shouldn't ask you about a replacement?", "You'd be barking up the wrong tree. Ask the manager about hiring."],
  ["I can learn the whole course tonight.", "Be for real. There are twenty chapters.", "I'll just read them on the bus.", "You can't be serious. The exam starts at nine."],
  ["Want help setting up the new app?", "Yes! hmu when you're free.", "I'm free now. dm me the error message.", "Sending it now."],
  ["Are you coming to dinner?", "You don't have to twist my arm. Of course!", "Should we choose a restaurant now?", "Let's play it by ear when we get there."],
  ["Want to try the new climbing wall?", "I'm game. Is there a beginner route?", "Yes. Or we could jump straight onto the hardest one.", "Hard pass. Let's start small."],
  ["That presentation went badly.", "tbf, the projector stopped working.", "I still feel embarrassed.", "fwiw, I thought you explained the idea clearly."],
  ["The discounted tickets sold out.", "I missed the boat too.", "So neither of us can afford the trip?", "We're in the same boat. Let's look for another date."],
  ["They're offering a free laptop if I pay a small fee first.", "What's the catch?", "They also want my bank password.", "That sounds fishy. Don't send it."],
  ["The venue isn't available, so the event can't happen there.", "iow, we need a new location.", "Should we cancel instead?", "imho, we should ask the library first."],
  ["We keep discussing the decorations.", "But the elephant in the room is that we have no venue.", "And the catering company hasn't replied.", "That may be the tip of the iceberg. Let's check every booking."],
  ["Nina missed the early train. She was up until three.", "That tracks. She must be exhausted.", "And her coffee machine broke this morning.", "The one day she needed it. Go figure."],
  ["Want every detail of my stomach bug?", "tmi! Just tell me if you're better.", "I am. I'll send you that comedy clip instead, but it's nsfw.", "Thanks for the warning. I'll watch it at home."],
  ["I agreed to perform, but now I'm getting cold feet.", "You can still do it. We have time to rehearse.", "Should I tell everyone I'm cancelling?", "Don't jump the gun. Try one rehearsal first."],
  ["Shall we go to that club tonight?", "I'm not feeling it. I'd rather stay in.", "They also want fifty pounds just to get in.", "That's a bit much for one evening."],
  ["Did you send the file?", "istg, I sent it an hour ago.", "It isn't here. Maybe the upload failed.", "ffs, the app crashed again. I'll resend it."],
  ["He was already angry, so I made a joke about him.", "That only added fuel to the fire.", "Then he found out I'd shared his message.", "That was the last straw. You need to apologise."],
  ["You've mentioned the broken printer ten times.", "Fine, I'll give it a rest.", "And when will your report be ready? I've asked all morning.", "Get off my back. I'm finishing it now."],
  ["I'm sorry I spilled water on the table.", "nbd, it's easy to clean.", "Are your notes okay?", "dw, they're in my bag."],
  ["The repairs have taken months.", "There is a silver lining: the flat will be much warmer.", "They say the last room will be finished on Friday.", "Finally, the light at the end of the tunnel."],
  ["I didn't get that job, but now the company is closing.", "You dodged a bullet.", "Another team rejected me yesterday too.", "Their loss. Your portfolio is strong."],
  ["Can you send the final draft asap?", "Yes, I'll send it in ten minutes.", "Thanks. I need to join a call now.", "Okay, ttys!"],
  ["Mia stayed late to help me practise my presentation.", "She really went the extra mile.", "I feel bad that she's doing so much for the group.", "Then make sure you pull your weight on the next task."],
  ["How was my presentation?", "You nailed it. Your examples were really clear.", "I accidentally sent the private feedback to the whole team afterwards.", "Oh no, you blew it with that email. Tell them what happened."],
];

const moduleNames = [
  ["Be For Real", "Clarify messages and challenge misunderstandings.", "Уточняй смысл и разбирайся в недоразумениях."],
  ["I'm Game", "Get in touch, make plans and choose what to join.", "Выходи на связь, строй планы и выбирай, в чём участвовать."],
  ["What's the Catch?", "Weigh opinions, missed chances and suspicious offers.", "Взвешивай мнения, упущенные шансы и подозрительные предложения."],
  ["That Tracks", "Rephrase ideas and notice what people avoid saying.", "Переформулируй мысли и замечай то, о чём молчат."],
  ["A Bit Much", "Recognise oversharing, hesitation and excess.", "Распознавай лишние подробности, сомнения и перебор."],
  ["The Last Straw", "Understand irritation and the language of conflict.", "Понимай раздражение и язык конфликтов."],
  ["Their Loss", "Reassure a friend and find a way through setbacks.", "Поддерживай друзей и находи выход после неудач."],
  ["Nailed It", "Coordinate work and talk about effort and results.", "Договаривайся о работе и обсуждай усилия и результат."],
];

export const newTrackModules = moduleNames.map(([title, subtitle, subtitleRu], index) => {
  const specs = (["chat", "idiom", "speech"] as const).map((kind, kindIndex) => {
    const offset = kindIndex * 16 + index * 2;
    const pair: [ExpressionSpec, ExpressionSpec] = [newExpressions[offset], newExpressions[offset + 1]];
    return pairSpec(`new-${index + 1}-${kind}`, kind, pair, {
      lines: conversations[index * 3 + kindIndex].map((text, lineIndex) => ({
        text, me: lineIndex % 2 === 1, at: `18:0${lineIndex}`,
      })),
    });
  });
  return cycle(`new-pairs-${index + 1}`, title, title, subtitle, subtitleRu, specs[0], specs[1], specs[2]);
});
