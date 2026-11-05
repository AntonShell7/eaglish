import { localize } from "@/i18n/content";
import { cycle, type ExpressionSpec } from "./trackModel";
import { pairSpec } from "./trackPairs";

export const newExpressions: ExpressionSpec[] = [
  {
    "short": "wdym",
    "meaningRu": localize("что ты имеешь в виду?"),
    "noteRu": localize("What do you mean? Вопрос об уточнении; без контекста может звучать резко."),
    "wrong": [
      localize("куда ты идёшь?"),
      localize("я всё понял")
    ],
    "before": "",
    "after": " we have to start again?",
    "gapRu": localize("В смысле нам нужно начинать заново?"),
    "translationRu": localize("Что ты имеешь в виду под «слишком поздно»?"),
    "translationEn": [
      "wdym it's too late?"
    ],
    "fullForm": "what do you mean?"
  },
  {
    "short": "wya",
    "meaningRu": localize("ты где?"),
    "noteRu": localize("Where you at? Неформальное сокращение для чата. В полном стандартном вопросе: Where are you?"),
    "wrong": [
      localize("когда ты придёшь?"),
      localize("чем ты занимаешься?")
    ],
    "before": "I'm outside. ",
    "after": "?",
    "gapRu": localize("Я снаружи. Ты где?"),
    "translationRu": localize("Ты где? Я у входа."),
    "translationEn": [
      "wya? I'm at the entrance."
    ],
    "fullForm": "where you at?"
  },
  {
    "short": "hmu",
    "meaningRu": localize("напиши мне, свяжись со мной"),
    "noteRu": localize("Hit me up. Можно попросить написать или позвонить; это не буквальное «ударь меня»."),
    "wrong": [
      localize("оставь меня в покое"),
      localize("подожди меня")
    ],
    "before": "",
    "after": " when you're free.",
    "gapRu": localize("Напиши мне, когда освободишься."),
    "translationRu": localize("Напиши мне после урока."),
    "translationEn": [
      "hmu after class."
    ],
    "fullForm": "hit me up"
  },
  {
    "short": "dm me",
    "meaningRu": localize("напиши мне в личку"),
    "noteRu": localize("Direct message me. Просьба перейти в личные сообщения, а не публиковать ответ для всех."),
    "wrong": [
      localize("позвони мне"),
      localize("опубликуй это для всех")
    ],
    "before": "Please ",
    "after": " the address.",
    "gapRu": localize("Пожалуйста, пришли мне адрес в личку."),
    "translationRu": localize("Пришли мне подробности в личку."),
    "translationEn": [
      "dm me the details."
    ],
    "fullForm": "direct message me"
  },
  {
    "short": "tbf",
    "meaningRu": localize("справедливости ради"),
    "noteRu": localize("To be fair. Добавляет обстоятельство, которое помогает оценить ситуацию менее односторонне."),
    "wrong": [
      localize("если я правильно помню"),
      localize("мне всё равно")
    ],
    "before": "",
    "after": ", she did warn us.",
    "gapRu": localize("Справедливости ради, она нас предупреждала."),
    "translationRu": localize("Справедливости ради, это был его первый день."),
    "translationEn": [
      "tbf, it was his first day."
    ],
    "fullForm": "to be fair"
  },
  {
    "short": "fwiw",
    "meaningRu": localize("если это имеет значение"),
    "noteRu": localize("For what it's worth. Мягко добавляет мнение или информацию: говорящий не уверен, насколько они помогут."),
    "wrong": [
      localize("сколько это стоит?"),
      localize("я категорически против")
    ],
    "before": "",
    "after": ", I liked your idea.",
    "gapRu": localize("Если моё мнение имеет значение, мне понравилась твоя идея."),
    "translationRu": localize("Если это поможет, я согласен с тобой."),
    "translationEn": [
      "fwiw, I agree with you."
    ],
    "fullForm": "for what it's worth"
  },
  {
    "short": "iow",
    "meaningRu": localize("другими словами"),
    "noteRu": localize("In other words. Переформулирует предыдущую мысль; встречается в письменных обсуждениях."),
    "wrong": [
      localize("тем временем"),
      localize("в первый раз")
    ],
    "before": "",
    "after": ", we need more time.",
    "gapRu": localize("Другими словами, нам нужно больше времени."),
    "translationRu": localize("Другими словами, план изменился."),
    "translationEn": [
      "iow, the plan has changed."
    ],
    "fullForm": "in other words"
  },
  {
    "short": "imho",
    "meaningRu": localize("по моему скромному мнению"),
    "noteRu": localize("In my humble opinion. Вводит личное мнение; слово humble не гарантирует вежливость, иногда звучит иронично."),
    "wrong": [
      localize("это доказанный факт"),
      localize("я не помню")
    ],
    "before": "",
    "after": ", the first version was clearer.",
    "gapRu": localize("По моему скромному мнению, первая версия была понятнее."),
    "translationRu": localize("По моему скромному мнению, нам стоит подождать."),
    "translationEn": [
      "imho, we should wait."
    ],
    "fullForm": "in my humble opinion"
  },
  {
    "short": "tmi",
    "meaningRu": localize("это лишние подробности"),
    "noteRu": localize("Too much information. Часто реакция на слишком личные или неприятные детали. Может прозвучать бесцеремонно."),
    "wrong": [
      localize("расскажи подробнее"),
      localize("я ничего не расслышал")
    ],
    "before": "Okay, ",
    "after": "! I don't need the bathroom details.",
    "gapRu": localize("Ладно, лишние подробности! Мне не нужны детали про туалет."),
    "translationRu": localize("Лишние подробности! Оставь детали при себе."),
    "translationEn": [
      "tmi! Keep the details to yourself."
    ],
    "fullForm": "too much information"
  },
  {
    "short": "nsfw",
    "meaningRu": localize("не стоит открывать при посторонних"),
    "noteRu": localize("Not safe for work. Пометка для откровенного или другого неподходящего для работы контента; не обязательно только сексуального."),
    "wrong": [
      localize("безопасно для детей"),
      localize("ссылка не работает")
    ],
    "before": "That link is ",
    "after": "; don't open it in the office.",
    "gapRu": localize("Эта ссылка содержит неподходящий для работы контент; не открывай её в офисе."),
    "translationRu": localize("Это видео не стоит открывать на работе."),
    "translationEn": [
      "this video is nsfw."
    ],
    "fullForm": "not safe for work"
  },
  {
    "short": "istg",
    "meaningRu": localize("клянусь"),
    "noteRu": localize("I swear to God. Эмоциональное заверение или усиление раздражения; не для официального письма."),
    "wrong": [
      localize("я шучу"),
      localize("я не уверен")
    ],
    "before": "",
    "after": ", I left the keys right here.",
    "gapRu": localize("Клянусь, я оставил ключи прямо здесь."),
    "translationRu": localize("Клянусь, я говорю правду."),
    "translationEn": [
      "istg, I'm telling the truth."
    ],
    "fullForm": "I swear to God"
  },
  {
    "short": "ffs",
    "meaningRu": localize("да сколько можно!"),
    "noteRu": localize("For fuck's sake. Сокращение ругательства: выражает раздражение и может оскорбить адресата. Даже в чате остаётся грубым."),
    "wrong": [
      localize("большое спасибо"),
      localize("я очень рад")
    ],
    "before": "",
    "after": ", the app crashed again!",
    "gapRu": localize("Да сколько можно, приложение опять вылетело!"),
    "translationRu": localize("Да сколько можно, перестань кричать!"),
    "translationEn": [
      "ffs, stop shouting!"
    ],
    "fullForm": "for fuck's sake",
    "register": "veryCasual"
  },
  {
    "short": "nbd",
    "meaningRu": localize("ничего страшного"),
    "noteRu": localize("No big deal. Уменьшает важность проблемы; не используй, чтобы обесценить серьёзные переживания другого."),
    "wrong": [
      localize("это катастрофа"),
      localize("я не согласен")
    ],
    "before": "You spilled some water? ",
    "after": ", I'll wipe it up.",
    "gapRu": localize("Ты пролил немного воды? Ничего страшного, я вытру."),
    "translationRu": localize("Ничего страшного, мы можем попробовать снова."),
    "translationEn": [
      "nbd, we can try again."
    ],
    "fullForm": "no big deal"
  },
  {
    "short": "dw",
    "meaningRu": localize("не переживай"),
    "noteRu": localize("Don't worry. Короткое успокоение в личной переписке."),
    "wrong": [
      localize("не жди меня"),
      localize("не пиши мне")
    ],
    "before": "",
    "after": ", I saved you a seat.",
    "gapRu": localize("Не переживай, я занял тебе место."),
    "translationRu": localize("Не переживай, я тебе помогу."),
    "translationEn": [
      "dw, I'll help you."
    ],
    "fullForm": "don't worry"
  },
  {
    "short": "asap",
    "meaningRu": localize("как можно скорее"),
    "noteRu": localize("As soon as possible. Встречается и в работе; просьба с asap может ощущаться как давление. Для точного срока лучше указать время."),
    "wrong": [
      localize("когда-нибудь потом"),
      localize("как обычно")
    ],
    "before": "Please send the file ",
    "after": ".",
    "gapRu": localize("Пожалуйста, пришли файл как можно скорее."),
    "translationRu": localize("Мне нужен твой ответ как можно скорее."),
    "translationEn": [
      "I need your answer asap."
    ],
    "fullForm": "as soon as possible"
  },
  {
    "short": "ttys",
    "meaningRu": localize("скоро поговорим"),
    "noteRu": localize("Talk to you soon. Неформальное завершение переписки; не обещает конкретного времени звонка."),
    "wrong": [
      localize("ты ещё здесь?"),
      localize("поговорим прямо сейчас")
    ],
    "before": "I have to go. ",
    "after": "!",
    "gapRu": localize("Мне пора. Скоро поговорим!"),
    "translationRu": localize("Спасибо за звонок. Скоро поговорим!"),
    "translationEn": [
      "thanks for the call. ttys!"
    ],
    "fullForm": "talk to you soon"
  },
  {
    "short": "get the wrong end of the stick",
    "meaningRu": localize("неправильно понять ситуацию"),
    "noteRu": localize("Особенно характерно для британского английского. Речь о неверной интерпретации, а не о том, что ты не расслышал слова."),
    "wrong": [
      localize("правильно понять намёк"),
      localize("сознательно обмануть")
    ],
    "before": "Don't ",
    "after": ": I'm not angry with you.",
    "gapRu": localize("Не пойми неправильно: я на тебя не злюсь."),
    "translationRu": localize("Ты неправильно понял ситуацию."),
    "translationEn": [
      "you got the wrong end of the stick."
    ]
  },
  {
    "short": "bark up the wrong tree",
    "meaningRu": localize("искать причину не там"),
    "noteRu": localize("Предпринимать ошибочную попытку или подозревать не того человека. В речи: you're barking up the wrong tree."),
    "wrong": [
      localize("найти правильное решение"),
      localize("громко спорить")
    ],
    "before": "If you blame me, you're going to ",
    "after": ".",
    "gapRu": localize("Если ты обвиняешь меня, то будешь искать виновного не там."),
    "translationRu": localize("Ты ищешь виновного не там."),
    "translationEn": [
      "you're barking up the wrong tree."
    ]
  },
  {
    "short": "twist someone's arm",
    "meaningRu": localize("настойчиво уговаривать"),
    "noteRu": localize("Часто с лёгкой иронией: You twisted my arm — «ладно, уговорил». Не буквальное физическое действие."),
    "wrong": [
      localize("помочь без просьбы"),
      localize("отказаться от приглашения")
    ],
    "before": "Don't ",
    "after": "; let her decide.",
    "gapRu": localize("Не уговаривай её настойчиво; пусть сама решит."),
    "translationRu": localize("Тебе не нужно меня уговаривать."),
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
    "meaningRu": localize("действовать по ситуации"),
    "noteRu": localize("Решать по ходу событий, без заранее установленного плана."),
    "wrong": [
      localize("строго следовать плану"),
      localize("сразу всё отменить")
    ],
    "before": "We haven't booked dinner. Let's ",
    "after": ".",
    "gapRu": localize("Мы не забронировали ужин. Давай решим по ситуации."),
    "translationRu": localize("Давай решим по ситуации завтра."),
    "translationEn": [
      "let's play it by ear tomorrow."
    ]
  },
  {
    "short": "miss the boat",
    "meaningRu": localize("упустить возможность"),
    "noteRu": localize("Речь о шансе, который был доступен раньше; не обязательно о транспорте."),
    "wrong": [
      localize("выиграть время"),
      localize("передумать в последний момент")
    ],
    "before": "Apply today or you'll ",
    "after": ".",
    "gapRu": localize("Подай заявку сегодня, иначе упустишь возможность."),
    "translationRu": localize("Я упустил возможность купить дешёвые билеты."),
    "translationEn": [
      "I missed the boat on cheap tickets."
    ]
  },
  {
    "short": "be in the same boat",
    "meaningRu": localize("быть в одинаковом трудном положении"),
    "noteRu": localize("Обычно о людях с общей проблемой. In the same boat не означает одинаковое мнение."),
    "wrong": [
      localize("полностью соглашаться"),
      localize("соревноваться друг с другом")
    ],
    "before": "If we both fail, we'll ",
    "after": ".",
    "gapRu": localize("Если мы оба провалимся, окажемся в одинаковом трудном положении."),
    "translationRu": localize("Мы в одинаковом положении."),
    "translationEn": [
      "we're in the same boat."
    ]
  },
  {
    "short": "the elephant in the room",
    "meaningRu": localize("проблема, которую все избегают обсуждать"),
    "noteRu": localize("Все знают о важной или неловкой теме, но никто не хочет первым её поднимать."),
    "wrong": [
      localize("неожиданный гость"),
      localize("незначительная деталь")
    ],
    "before": "Let's address ",
    "after": ": we have no budget.",
    "gapRu": localize("Давайте обсудим проблему, которую все обходят: у нас нет бюджета."),
    "translationRu": localize("Нам нужно обсудить проблему, которую все избегают."),
    "translationEn": [
      "we need to address the elephant in the room."
    ]
  },
  {
    "short": "the tip of the iceberg",
    "meaningRu": localize("небольшая видимая часть большой проблемы"),
    "noteRu": localize("Указывает, что скрытая часть ситуации намного больше того, что уже обнаружено."),
    "wrong": [
      localize("окончательное решение"),
      localize("самая трудная часть уже позади")
    ],
    "before": "These two errors are only ",
    "after": ".",
    "gapRu": localize("Эти две ошибки — лишь небольшая видимая часть большой проблемы."),
    "translationRu": localize("Эта жалоба — лишь верхушка айсберга."),
    "translationEn": [
      "this complaint is just the tip of the iceberg."
    ]
  },
  {
    "short": "get cold feet",
    "meaningRu": localize("струсить перед решительным шагом"),
    "noteRu": localize("Перед важным действием начать сомневаться и бояться, хотя раньше собирался его выполнить."),
    "wrong": [
      localize("сильно замёрзнуть"),
      localize("решительно действовать")
    ],
    "before": "I agreed to speak, but I might ",
    "after": " on stage.",
    "gapRu": localize("Я согласился выступить, но могу струсить на сцене."),
    "translationRu": localize("Он струсил перед свадьбой."),
    "translationEn": [
      "he got cold feet before the wedding."
    ]
  },
  {
    "short": "jump the gun",
    "meaningRu": localize("поторопиться, начать раньше времени"),
    "noteRu": localize("Сделать что-то до подходящего момента или прежде, чем появились необходимые сведения."),
    "wrong": [
      localize("слишком долго ждать"),
      localize("победить соперника")
    ],
    "before": "Don't ",
    "after": "; wait for the official result.",
    "gapRu": localize("Не торопись; дождись официального результата."),
    "translationRu": localize("Мы поторопились с объявлением."),
    "translationEn": [
      "we jumped the gun with the announcement."
    ]
  },
  {
    "short": "add fuel to the fire",
    "meaningRu": localize("подлить масла в огонь"),
    "noteRu": localize("Усилить уже существующую ссору, злость или неприятную ситуацию."),
    "wrong": [
      localize("снять напряжение"),
      localize("начать с чистого листа")
    ],
    "before": "Insulting him will only ",
    "after": ".",
    "gapRu": localize("Если оскорбишь его, только подольёшь масла в огонь."),
    "translationRu": localize("Её комментарий подлил масла в огонь."),
    "translationEn": [
      "her comment added fuel to the fire."
    ]
  },
  {
    "short": "the last straw",
    "meaningRu": localize("последняя капля"),
    "noteRu": localize("Последняя из нескольких неприятностей, после которой терпение заканчивается."),
    "wrong": [
      localize("первая попытка"),
      localize("последняя надежда")
    ],
    "before": "When he lied again, that was ",
    "after": ".",
    "gapRu": localize("Когда он снова солгал, это стало последней каплей."),
    "translationRu": localize("Его опоздание стало последней каплей."),
    "translationEn": [
      "his lateness was the last straw."
    ]
  },
  {
    "short": "a silver lining",
    "meaningRu": localize("положительная сторона неприятной ситуации"),
    "noteRu": localize("Хорошее обстоятельство внутри плохой ситуации; не означает, что вся проблема исчезла."),
    "wrong": [
      localize("скрытая опасность"),
      localize("дорогая покупка")
    ],
    "before": "Losing that job had ",
    "after": ": I found a better one.",
    "gapRu": localize("У потери той работы была хорошая сторона: я нашёл работу лучше."),
    "translationRu": localize("В этой задержке есть хорошая сторона."),
    "translationEn": [
      "there's a silver lining to this delay."
    ]
  },
  {
    "short": "the light at the end of the tunnel",
    "meaningRu": localize("надежда на окончание трудного периода"),
    "noteRu": localize("Первые признаки того, что длительные трудности скоро закончатся."),
    "wrong": [
      localize("начало новых проблем"),
      localize("полная потеря надежды")
    ],
    "before": "After months of repairs, we can see ",
    "after": ".",
    "gapRu": localize("После месяцев ремонта мы видим, что трудности скоро закончатся."),
    "translationRu": localize("Наконец я вижу свет в конце туннеля."),
    "translationEn": [
      "I can finally see the light at the end of the tunnel."
    ]
  },
  {
    "short": "go the extra mile",
    "meaningRu": localize("сделать больше ожидаемого"),
    "noteRu": localize("Приложить дополнительные усилия, чтобы помочь или сделать работу особенно хорошо."),
    "wrong": [
      localize("сделать только необходимое"),
      localize("отложить работу")
    ],
    "before": "She always tries to ",
    "after": " for her students.",
    "gapRu": localize("Она всегда старается сделать для учеников больше ожидаемого."),
    "translationRu": localize("Он сделал для нас больше, чем от него ожидали."),
    "translationEn": [
      "he went the extra mile for us."
    ]
  },
  {
    "short": "pull your weight",
    "meaningRu": localize("выполнять свою долю работы"),
    "noteRu": localize("Вносить справедливый вклад в общее дело; не заставлять остальных делать всё за тебя."),
    "wrong": [
      localize("взять всю работу на себя"),
      localize("работать быстрее всех")
    ],
    "before": "This is a team project, so you need to ",
    "after": ".",
    "gapRu": localize("Это командный проект, поэтому тебе нужно выполнять свою долю работы."),
    "translationRu": localize("Тебе нужно выполнять свою долю работы."),
    "translationEn": [
      "you need to pull your weight."
    ]
  },
  {
    "short": "be for real",
    "meaningRu": localize("давай серьёзно"),
    "noteRu": localize("Разговорное требование говорить реалистично или честно. Может звучать раздражённо и не подходит для вежливого несогласия с незнакомым."),
    "wrong": [
      localize("будь собой"),
      localize("хорошо повеселись")
    ],
    "before": "",
    "after": ": you can't finish all that in ten minutes.",
    "gapRu": localize("Давай серьёзно: ты не закончишь всё это за десять минут."),
    "translationRu": localize("Давай серьёзно, этот план не сработает."),
    "translationEn": [
      "be for real, this plan won't work."
    ]
  },
  {
    "short": "you can't be serious",
    "meaningRu": localize("ты же не всерьёз!"),
    "noteRu": localize("Выражает сильное недоверие или возмущение; тон важен."),
    "wrong": [
      localize("ты прав"),
      localize("тебе нужно сосредоточиться")
    ],
    "before": "A hundred pounds for a sandwich? ",
    "after": "!",
    "gapRu": localize("Сто фунтов за сэндвич? Ты же не всерьёз!"),
    "translationRu": localize("Ты же не всерьёз! Это слишком дорого."),
    "translationEn": [
      "you can't be serious! That's too expensive."
    ]
  },
  {
    "short": "I'm game",
    "meaningRu": localize("я готов попробовать"),
    "noteRu": localize("Неформальное согласие участвовать в предложенном деле. Обычно ответ на конкретную идею."),
    "wrong": [
      localize("я играю прямо сейчас"),
      localize("я устал")
    ],
    "before": "A night hike? ",
    "after": "!",
    "gapRu": localize("Ночной поход? Я готов!"),
    "translationRu": localize("Я готов попробовать, если ты тоже."),
    "translationEn": [
      "I'm game if you are."
    ]
  },
  {
    "short": "hard pass",
    "meaningRu": localize("категорически нет"),
    "noteRu": localize("Очень прямой отказ, который может звучать резко. Для мягкого отказа лучше использовать уже знакомое I'll pass."),
    "wrong": [
      localize("я согласен"),
      localize("мне нужно подумать")
    ],
    "before": "Camping in a storm? ",
    "after": ".",
    "gapRu": localize("Ночевать в палатке во время шторма? Категорически нет."),
    "translationRu": localize("Нет уж, я останусь дома."),
    "translationEn": [
      "hard pass. I'm staying home."
    ]
  },
  {
    "short": "what's the catch?",
    "meaningRu": localize("в чём подвох?"),
    "noteRu": localize("Вопрос о скрытом условии у слишком привлекательного предложения."),
    "wrong": [
      localize("когда это начинается?"),
      localize("кто победил?")
    ],
    "before": "Free flights for a year? ",
    "after": "",
    "gapRu": localize("Бесплатные перелёты целый год? В чём подвох?"),
    "translationRu": localize("Звучит отлично. В чём подвох?"),
    "translationEn": [
      "sounds great. What's the catch?"
    ]
  },
  {
    "short": "sounds fishy",
    "meaningRu": localize("звучит подозрительно"),
    "noteRu": localize("Неформальное сомнение в честности или правдоподобности истории, а не описание запаха."),
    "wrong": [
      localize("звучит убедительно"),
      localize("это пахнет рыбой")
    ],
    "before": "That offer ",
    "after": " to me.",
    "gapRu": localize("Это предложение кажется мне подозрительным."),
    "translationRu": localize("Эта история звучит подозрительно."),
    "translationEn": [
      "that story sounds fishy."
    ]
  },
  {
    "short": "that tracks",
    "meaningRu": localize("это логично"),
    "noteRu": localize("Неформальная реакция: информация согласуется с тем, что уже известно. Не связано с отслеживанием местоположения."),
    "wrong": [
      localize("это неправда"),
      localize("я слежу за тобой")
    ],
    "before": "She missed the train? ",
    "after": "; she left late.",
    "gapRu": localize("Она опоздала на поезд? Логично: она поздно вышла."),
    "translationRu": localize("Это логично. Он ненавидит рано вставать."),
    "translationEn": [
      "that tracks. He hates getting up early."
    ]
  },
  {
    "short": "go figure",
    "meaningRu": localize("вот и пойми"),
    "noteRu": localize("Часто ироничная реакция на странность или предсказуемый парадокс. Не просьба посчитать или решить задачу."),
    "wrong": [
      localize("пойди посчитай"),
      localize("отличная работа")
    ],
    "before": "The printer broke right before the deadline. ",
    "after": ".",
    "gapRu": localize("Принтер сломался прямо перед дедлайном. Вот и пойми."),
    "translationRu": localize("Он снова забыл ключи. Кто бы сомневался."),
    "translationEn": [
      "he forgot his keys again. Go figure."
    ]
  },
  {
    "short": "not feeling it",
    "meaningRu": localize("не заходит, нет настроения"),
    "noteRu": localize("О занятии, идее или впечатлении, к которым сейчас не лежит душа. В предложении обычно I'm not feeling it."),
    "wrong": [
      localize("я ничего не чувствую рукой"),
      localize("мне очень нравится")
    ],
    "before": "We could go dancing, but I'm ",
    "after": ".",
    "gapRu": localize("Мы могли бы пойти танцевать, но у меня нет настроения."),
    "translationRu": localize("Сегодня мне это не заходит."),
    "translationEn": [
      "I'm not feeling it today."
    ]
  },
  {
    "short": "a bit much",
    "meaningRu": localize("это уже перебор"),
    "noteRu": localize("О чём-то чрезмерном: цене, требовании или поведении. Bit часто смягчает критику."),
    "wrong": [
      localize("совсем недостаточно"),
      localize("как раз вовремя")
    ],
    "before": "Three calls in five minutes is ",
    "after": ".",
    "gapRu": localize("Три звонка за пять минут — это уже перебор."),
    "translationRu": localize("Это требование — уже перебор."),
    "translationEn": [
      "that request is a bit much."
    ]
  },
  {
    "short": "give it a rest",
    "meaningRu": localize("хватит уже об этом"),
    "noteRu": localize("Раздражённая просьба перестать повторять тему или жаловаться. Не буквальное предложение отдохнуть."),
    "wrong": [
      localize("расскажи ещё"),
      localize("немного отдохни")
    ],
    "before": "You've complained about it all day. ",
    "after": "!",
    "gapRu": localize("Ты жалуешься на это весь день. Хватит уже!"),
    "translationRu": localize("Хватит уже об этом. Мы тебя услышали."),
    "translationEn": [
      "give it a rest. We heard you."
    ]
  },
  {
    "short": "get off my back",
    "meaningRu": localize("хватит на меня давить"),
    "noteRu": localize("Резкое требование перестать придираться, контролировать или торопить. Может обострить спор."),
    "wrong": [
      localize("помоги мне"),
      localize("встань позади меня")
    ],
    "before": "I'll finish it tonight. ",
    "after": "!",
    "gapRu": localize("Я закончу сегодня вечером. Хватит на меня давить!"),
    "translationRu": localize("Отстань, я над этим работаю."),
    "translationEn": [
      "get off my back. I'm working on it."
    ]
  },
  {
    "short": "you dodged a bullet",
    "meaningRu": localize("ты избежал больших неприятностей"),
    "noteRu": localize("О ситуации, которая могла закончиться намного хуже. Не стоит так обесценивать чужую боль сразу после расставания."),
    "wrong": [
      localize("тебе сильно не повезло"),
      localize("ты упустил прекрасный шанс")
    ],
    "before": "They fired half the staff after you declined. ",
    "after": ".",
    "gapRu": localize("После твоего отказа они уволили половину сотрудников. Ты избежал больших неприятностей."),
    "translationRu": localize("Ты избежал больших неприятностей с той работой."),
    "translationEn": [
      "you dodged a bullet with that job."
    ]
  },
  {
    "short": "their loss",
    "meaningRu": localize("они сами потеряли"),
    "noteRu": localize("Поддержка человека, которого отвергли или не оценили: потерял тот, кто отказал."),
    "wrong": [
      localize("ты виноват"),
      localize("мы проиграли")
    ],
    "before": "They didn't hire you? ",
    "after": ".",
    "gapRu": localize("Они тебя не наняли? Они сами потеряли."),
    "translationRu": localize("Они тебя не выбрали? Они сами потеряли."),
    "translationEn": [
      "they didn't choose you? Their loss."
    ]
  },
  {
    "short": "you nailed it",
    "meaningRu": localize("ты отлично справился"),
    "noteRu": localize("Неформальная похвала за точное или очень удачное выполнение задачи."),
    "wrong": [
      localize("ты всё испортил"),
      localize("ты забыл задание")
    ],
    "before": "That presentation was excellent. ",
    "after": "!",
    "gapRu": localize("Презентация была отличной. Ты прекрасно справился!"),
    "translationRu": localize("Ты отлично справился с этим ответом."),
    "translationEn": [
      "you nailed it with that answer."
    ]
  },
  {
    "short": "you blew it",
    "meaningRu": localize("ты всё испортил"),
    "noteRu": localize("Резкая оценка ошибки или упущенной возможности. Для поддержки после неудачи такое не подходит."),
    "wrong": [
      localize("ты отлично справился"),
      localize("ты передумал")
    ],
    "before": "You shared the secret before the launch. ",
    "after": ".",
    "gapRu": localize("Ты раскрыл секрет до запуска. Ты всё испортил."),
    "translationRu": localize("У тебя был шанс, но ты всё испортил."),
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
  ["Be For Real", "Clarify messages and challenge misunderstandings.", localize("Уточняй смысл и разбирайся в недоразумениях.")],
  ["I'm Game", "Get in touch, make plans and choose what to join.", localize("Выходи на связь, строй планы и выбирай, в чём участвовать.")],
  ["What's the Catch?", "Weigh opinions, missed chances and suspicious offers.", localize("Взвешивай мнения, упущенные шансы и подозрительные предложения.")],
  ["That Tracks", "Rephrase ideas and notice what people avoid saying.", localize("Переформулируй мысли и замечай то, о чём молчат.")],
  ["A Bit Much", "Recognise oversharing, hesitation and excess.", localize("Распознавай лишние подробности, сомнения и перебор.")],
  ["The Last Straw", "Understand irritation and the language of conflict.", localize("Понимай раздражение и язык конфликтов.")],
  ["Their Loss", "Reassure a friend and find a way through setbacks.", localize("Поддерживай друзей и находи выход после неудач.")],
  ["Nailed It", "Coordinate work and talk about effort and results.", localize("Договаривайся о работе и обсуждай усилия и результат.")],
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
