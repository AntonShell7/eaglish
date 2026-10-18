/**
 * Privacy policy, terms, and the public offer.
 *
 * Kept as data, not as prose inside a component, so both languages stay in step
 * and the page can render a summary, a table of contents and the body from one
 * source. The content describes what the app actually does — the third parties
 * named here are the ones the code really talks to (Google, Groq, OpenAI, the host) —
 * because a policy that describes a different product is worse than none.
 */

import { PRICES } from "@/lib/plans";

/**
 * The address a reader can actually write to: it appears in both documents as
 * the contact for questions and for account deletion, so it has to be a mailbox
 * someone reads. When the domain is live this becomes hello@<domain> and the
 * Gmail one keeps working as a forward.
 */
export const CONTACT_EMAIL = "eaglish@yandex.ru";

export const LAST_UPDATED = "2026-10-18";

export interface LegalSection {
  id: string;
  h: string;
  p: string[];
}

export interface LegalDoc {
  title: string;
  /** Three lines a reader can stop after and still know the important part. */
  summary: string[];
  sections: LegalSection[];
}

export const privacyDoc: Record<"ru" | "en", LegalDoc> = {
  ru: {
    title: "Политика конфиденциальности",
    summary: [
      "Мы храним только то, без чего сервис не работает: аккаунт и твой учебный прогресс.",
      "Мы не продаём данные, не показываем рекламу и не ставим трекеры.",
      "Тексты, которые ты отправляешь на проверку, и слова, которые ты переводишь, уходят в стороннюю ИИ-модель — иначе проверить и перевести их нечем.",
    ],
    sections: [
      {
        id: "who",
        h: "Кто обрабатывает данные",
        p: [
          "Оператор персональных данных — Шелудько Антон Павлович, самозанятый, ИНН 253715678005.",
          `По любым вопросам о данных пиши на ${CONTACT_EMAIL}: это тот же адрес, по которому можно потребовать удалить аккаунт.`,
        ],
      },
      {
        id: "what",
        h: "Какие данные мы собираем",
        p: [
          "Данные аккаунта: адрес электронной почты и пароль. Пароль мы не видим — он хранится в виде хеша.",
          "Если ты входишь через Google, Google передаёт нам имя и ссылку на фотографию профиля вместе с адресом почты. Это происходит один раз, при первом входе, и отказаться от передачи этих полей, оставив вход через Google, нельзя. Регистрация по почте их не требует.",
          "Учебные данные: сохранённые слова и расписание их повторений, отправленные тексты и оценки к ним, открытые тексты и результаты вопросов, ежедневная активность и настройки из онбординга (уровень, цель, темы, дневная норма).",
          "Когда ты сообщаешь о проблеме, вместе с сообщением сохраняется страница, с которой оно отправлено, и строка с описанием браузера — без них отчёт невозможно воспроизвести.",
          "Локальные настройки в браузере: тема оформления, язык интерфейса, согласие на этой странице и копия учебного прогресса, чтобы приложение работало без интернета.",
          "Мы не собираем возраст, номер телефона, платёжные данные и не запрашиваем доступ к камере, микрофону или геолокации.",
        ],
      },
      {
        id: "why",
        h: "Зачем",
        p: [
          "Аккаунт нужен, чтобы прогресс переезжал между устройствами и не терялся при чистке браузера. Учебные данные нужны самому обучению: без истории повторений интервальные повторения не работают, а без результатов не построить статистику.",
          "Юридическое основание для этого — исполнение договора с тобой: ты просишь сервис учить тебя английскому, и без этих данных он этого сделать не может.",
        ],
      },
      {
        id: "third-parties",
        h: "Кому передаются данные",
        p: [
          "Google — только если ты выбрал вход через Google. Google узнаёт, что ты пользуешься Eaglish, и передаёт нам почту, имя и ссылку на фотографию.",
          "Groq и OpenAI — обработка текста нейросетью. Туда уходит слово с предложением, в котором ты его встретил, текст, отправленный на проверку письма, и снимок рукописной страницы, если ты пользуешься письмом от руки. Не отправляй в эти поля персональные данные — свои или чужие.",
          "Хостинг сайта — отдача файлов приложения и техничеcкие журналы запросов у провайдера.",
          "Больше никому. Мы не передаём данные рекламным сетям, не продаём их и не обмениваем.",
        ],
      },
      {
        id: "where",
        h: "Где хранятся данные",
        p: [
          "База данных находится в России, в дата-центре в Санкт-Петербурге. Там лежат аккаунт, учебный прогресс и всё остальное, что ты сохранил.",
          "За пределы России уходит только одно: текст, который ты отправляешь нейросети. Это слово с предложением, в котором ты его встретил, текст на проверку письма или снимок рукописной страницы. Серверы Groq и OpenAI находятся за рубежом, и такая передача по закону считается трансграничной.",
          "Сами по себе эти запросы не содержат твоего имени или адреса почты — уходит только текст. Но текст пишешь ты, поэтому в поля проверки письма не стоит вносить ничего, что ты не готов отправить за границу.",
          "Ответы нейросети возвращаются и сохраняются уже здесь, в российской базе.",
        ],
      },
      {
        id: "cookies",
        h: "Cookie и хранилище браузера",
        p: [
          "Аналитики и рекламных cookie у нас нет. Всё, что мы пишем в браузер, — это твоя сессия входа, тема, язык, согласие и копия прогресса. Полный список показан в окне согласия — его можно открыть в любой момент ссылкой в подвале сайта.",
          "Если аналитика когда-нибудь появится, она будет выключена по умолчанию и включится только твоим переключателем.",
        ],
      },
      {
        id: "who-sees",
        h: "Кто внутри сервиса видит твои данные",
        p: [
          "У Eaglish есть служебная страница, к которой имеет доступ только владелец сервиса. На ней видно: список аккаунтов с адресами почты, дата регистрации и последнего входа, выбранный уровень, сколько слов сохранено и сколько повторений сделано. По отдельному аккаунту можно открыть и сам список сохранённых слов с переводами и датами.",
          "Это нужно, чтобы понимать, работает ли обучение, и чинить то, что сломалось. Мы не читаем эти данные ради любопытства и не передаём их наружу — ограничения из раздела «Кому передаются данные» действуют и здесь.",
          "Чего там нет: твоего пароля — он хранится только в виде необратимого хеша, и его не видит никто, включая нас.",
        ],
      },
      {
        id: "retention",
        h: "Сколько мы храним данные",
        p: [
          "Пока существует аккаунт. Напиши нам — и мы удалим аккаунт вместе с учебными данными; это необратимо.",
          "Локальные данные в браузере ты можешь стереть сам, очистив данные сайта в настройках браузера.",
        ],
      },
      {
        id: "rights",
        h: "Твои права",
        p: [
          "Ты можешь запросить копию своих данных, исправить их, удалить аккаунт или отозвать согласие на необязательные цели. Для всего этого достаточно письма на указанный адрес.",
          "Если тебе меньше 16 лет, пользуйся сервисом с ведома родителей или опекунов.",
        ],
      },
      {
        id: "changes",
        h: "Изменения",
        p: [
          "Если поменяется то, какие данные мы собираем или кому передаём, мы обновим эту страницу и заново спросим согласие там, где оно требуется. Дата последнего изменения указана вверху.",
        ],
      },
    ],
  },

  en: {
    title: "Privacy policy",
    summary: [
      "We store only what the service needs: your account and your learning progress.",
      "We don't sell data, run ads, or install trackers.",
      "Text you submit for assessment and words you look up are sent to a third-party AI model — there is no other way to assess or translate them.",
    ],
    sections: [
      {
        id: "who",
        h: "Who handles your data",
        p: [
          "The data controller is Anton Pavlovich Sheludko, registered in Russia under the professional income tax regime, INN 253715678005.",
          `For anything about your data, write to ${CONTACT_EMAIL} — the same address that deletes an account on request.`,
        ],
      },
      {
        id: "what",
        h: "What we collect",
        p: [
          "Account data: your email address and a password. We never see the password itself; only a hash of it is stored.",
          "If you sign in with Google, Google passes us your name and a link to your profile picture along with your email address. This happens once, at first sign-in, and there is no way to keep Google sign-in while declining those fields. Signing up with an email address does not involve them.",
          "Learning data: saved words and their review schedule, submitted texts and their scores, which texts you opened and how you answered their questions, daily activity, and your onboarding answers (level, goal, topics, daily target).",
          "When you report a problem, the page you sent it from and a line describing your browser are stored with the message — a report cannot be reproduced without them.",
          "Local settings in your browser: theme, interface language, the consent recorded on this page, and a copy of your progress so the app works offline.",
          "We do not collect your age, phone number or payment details, and we never ask for camera, microphone or location access.",
        ],
      },
      {
        id: "why",
        h: "Why",
        p: [
          "The account exists so progress follows you between devices and survives a cleared browser. The learning data is the learning: spaced repetition cannot schedule anything without a review history, and there are no statistics without results.",
          "The legal basis is performance of our agreement with you — you asked the service to teach you English, and it cannot do that without this data.",
        ],
      },
      {
        id: "third-parties",
        h: "Who else sees it",
        p: [
          "Google — only if you chose to sign in with Google. Google learns that you use Eaglish, and passes us your email, your name and a link to your picture.",
          "Groq and OpenAI — AI text processing. A word plus the sentence you met it in is sent for translation, a piece of writing is sent when you ask for an assessment, and an image of a handwritten page is sent if you write by hand. Please don't type personal data — yours or anyone else's — into those fields.",
          "Our hosting provider — serving the application files, plus ordinary request logs.",
          "Nobody else. We do not share data with ad networks, sell it, or trade it.",
        ],
      },
      {
        id: "where",
        h: "Where the data lives",
        p: [
          "The database is in Russia, in a data centre in St Petersburg. Your account, your progress and everything you have saved are there.",
          "One thing leaves Russia: the text you send to the AI. That is a word with the sentence you met it in, a piece of writing submitted for assessment, or an image of a handwritten page. Groq's and OpenAI's servers are abroad, and under Russian law that counts as a cross-border transfer.",
          "Those requests do not carry your name or email — only the text. But you write the text, so do not put anything into the writing fields that you would not want sent abroad.",
          "The AI's answers come back and are stored here, in the Russian database.",
        ],
      },
      {
        id: "cookies",
        h: "Cookies and browser storage",
        p: [
          "There are no analytics or advertising cookies. What we write to your browser is your sign-in session, theme, language, consent record and a copy of your progress. The full list is shown in the consent panel, which you can reopen any time from the footer.",
          "If analytics is ever added, it will be off by default and will only run once you switch it on.",
        ],
      },
      {
        id: "who-sees",
        h: "Who inside the service can see your data",
        p: [
          "Eaglish has an internal page that only the owner of the service can open. It shows a list of accounts with their email addresses, sign-up and last sign-in dates, the chosen level, how many words are saved and how many reviews have been done. For an individual account it can also show the saved words themselves, with translations and dates.",
          "This exists so we can tell whether the teaching works and fix what breaks. We do not read it out of curiosity and we do not pass it on — the limits in the sharing section above apply here too.",
          "What it does not show: your password. That is held only as an irreversible hash, and nobody sees it, including us.",
        ],
      },
      {
        id: "retention",
        h: "How long we keep it",
        p: [
          "For as long as the account exists. Write to us and we will delete the account together with its learning data; that cannot be undone.",
          "Local data in your browser is yours to clear at any time through your browser's site-data settings.",
        ],
      },
      {
        id: "rights",
        h: "Your rights",
        p: [
          "You can request a copy of your data, correct it, delete your account, or withdraw consent for optional purposes. An email to the address above is enough for all of it.",
          "If you are under 16, use the service with the knowledge of a parent or guardian.",
        ],
      },
      {
        id: "changes",
        h: "Changes",
        p: [
          "If what we collect or who we share it with changes, we will update this page and ask again where consent is required. The date at the top is the last change.",
        ],
      },
    ],
  },
};

export const termsDoc: Record<"ru" | "en", LegalDoc> = {
  ru: {
    title: "Условия использования",
    summary: [
      "Eaglish бесплатен и предоставляется как есть — это учебный проект, а не аккредитованная школа.",
      "Тексты и оценки создаёт нейросеть: они полезны как ориентир, но могут содержать ошибки.",
      "Отвечай за свой аккаунт и не ломай сервис — остальное на нашей стороне.",
    ],
    sections: [
      {
        id: "service",
        h: "Что это за сервис",
        p: [
          "Eaglish — платформа для самостоятельного изучения английского: чтение с переводом по клику, письмо с обратной связью, словарь с интервальными повторениями и уроки разговорного английского.",
          "Пользоваться можно бесплатно. Мы можем менять состав разделов, добавлять и убирать материалы.",
        ],
      },
      {
        id: "account",
        h: "Аккаунт",
        p: [
          "Для сохранения прогресса между устройствами нужен аккаунт. Указывай настоящий адрес почты — на него приходит подтверждение и восстановление пароля.",
          "Отвечай за сохранность пароля и за всё, что происходит под твоим аккаунтом. Если заметил чужой вход — сразу смени пароль и напиши нам.",
        ],
      },
      {
        id: "use",
        h: "Как можно и нельзя пользоваться",
        p: [
          "Можно: учиться, копировать материалы для личного использования, делиться ссылками.",
          "Нельзя: пытаться сломать или перегрузить сервис, обходить ограничения, автоматически выкачивать материалы, использовать чужие персональные данные в полях ввода, выдавать материалы сервиса за свои в коммерческих целях.",
        ],
      },
      {
        id: "content",
        h: "Материалы и оценки",
        p: [
          "Большая часть текстов для чтения создана нейросетью и проверена автоматическими правилами: в них возможны неточности, особенно в русских переводах. Тексты не являются справочным источником по описываемым темам.",
          "Оценка письма — учебный ориентир, а не экзаменационный результат. Она не гарантирует балл на IELTS, TOEFL или школьном экзамене.",
          "Уровень, определённый тестом, — приблизительная оценка, которую ты можешь изменить вручную.",
        ],
      },
      {
        id: "availability",
        h: "Доступность",
        p: [
          "Сервис предоставляется как есть, без гарантий бесперебойной работы. Мы можем временно останавливать его для обновлений, а также прекратить работу проекта — в этом случае мы постараемся предупредить заранее.",
          "Мы не отвечаем за убытки, возникшие из-за недоступности сервиса или ошибок в материалах, в пределах, допустимых применимым правом.",
        ],
      },
      {
        id: "termination",
        h: "Прекращение доступа",
        p: [
          "Ты можешь в любой момент попросить удалить аккаунт. Мы можем ограничить доступ, если аккаунт используется для атак на сервис или нарушает эти условия.",
        ],
      },
      {
        id: "changes",
        h: "Изменения условий",
        p: [
          "Условия могут меняться вместе с сервисом. Существенные изменения мы отметим на этой странице и обновим дату вверху. Продолжая пользоваться сервисом, ты принимаешь новую редакцию.",
        ],
      },
      {
        id: "contact",
        h: "Связь",
        p: [`Вопросы, жалобы, удаление аккаунта: ${CONTACT_EMAIL}.`],
      },
    ],
  },

  en: {
    title: "Terms of use",
    summary: [
      "Eaglish is free and provided as is — a study project, not an accredited school.",
      "Texts and scores are produced by an AI model: useful as guidance, but capable of being wrong.",
      "Look after your account and don't attack the service; the rest is on us.",
    ],
    sections: [
      {
        id: "service",
        h: "What this is",
        p: [
          "Eaglish is a self-study English platform: reading with tap-to-translate, writing with feedback, a vocabulary trained by spaced repetition, and everyday-English lessons.",
          "It is free to use. We may change which sections exist and add or remove material.",
        ],
      },
      {
        id: "account",
        h: "Your account",
        p: [
          "An account is what carries progress between devices. Use a real email address — confirmation and password recovery go there.",
          "You are responsible for your password and for what happens under your account. If you see a sign-in that wasn't you, change the password and tell us.",
        ],
      },
      {
        id: "use",
        h: "Fair use",
        p: [
          "Allowed: studying, copying material for your own use, sharing links.",
          "Not allowed: attacking or overloading the service, circumventing limits, scraping material automatically, entering other people's personal data into the input fields, or passing our material off as your own commercially.",
        ],
      },
      {
        id: "content",
        h: "Material and scores",
        p: [
          "Most reading texts are machine-generated and checked by automated rules: inaccuracies are possible, particularly in the Russian translations. They are not a reference source on the subjects they describe.",
          "A writing score is study guidance, not an exam result. It does not predict an IELTS, TOEFL or school exam grade.",
          "The level from the placement test is an estimate you can override by hand.",
        ],
      },
      {
        id: "availability",
        h: "Availability",
        p: [
          "The service is provided as is, with no guarantee of uninterrupted operation. We may pause it for updates, and we may stop running the project — in which case we will try to give notice.",
          "To the extent permitted by applicable law, we are not liable for losses caused by downtime or by errors in the material.",
        ],
      },
      {
        id: "termination",
        h: "Ending access",
        p: [
          "You can ask us to delete your account at any time. We may restrict access to an account used to attack the service or to break these terms.",
        ],
      },
      {
        id: "changes",
        h: "Changes to these terms",
        p: [
          "Terms change as the service does. We will note material changes on this page and update the date at the top. Continuing to use the service accepts the new version.",
        ],
      },
      {
        id: "contact",
        h: "Contact",
        p: [`Questions, complaints, account deletion: ${CONTACT_EMAIL}.`],
      },
    ],
  },
};

/* ── Публичная оферта ──────────────────────────────────────────────────── */

/**
 * Who is selling, in the sense the law means.
 *
 * A public offer without a real name and a real taxpayer number is not an
 * offer — it is a web page. A payment provider's moderator checks exactly
 * these three fields, and so does anyone deciding whether to hand over money
 * to a stranger's website.
 *
 * These have to match what is registered in «Мой налог» exactly; a name that
 * differs from the registration is the kind of discrepancy that turns a
 * three-day moderation into three weeks.
 *
 * The tax number's two check digits were verified before it was written down.
 * A transposed pair reads as a perfectly ordinary number and is only caught
 * by whoever rejects the application a week later.
 */
export const OPERATOR = {
  /** Фамилия Имя Отчество, exactly as registered. */
  fullName: "Шелудько Антон Павлович",
  /**
   * The same name in the genitive.
   *
   * Russian needs it for the one sentence that matters most — "настоящий
   * документ является публичной офертой <кого>" — and a template that drops
   * the nominative in there produces "офертой Шелудько Антон Павлович", which
   * is the kind of thing that makes a reader doubt everything after it.
   * Шелудько does not decline; the given name and patronymic do.
   */
  fullNameGenitive: "Шелудько Антона Павловича",
  /** For the English translation, which should not be half in Cyrillic. */
  fullNameLatin: "Anton Pavlovich Sheludko",
  status: "Самозанятый (плательщик налога на профессиональный доход)",
  /** ИНН, twelve digits. */
  inn: "253715678005",
  email: CONTACT_EMAIL,
} as const;

/** True once the requisites above have been replaced with real ones. */
export const OPERATOR_READY = !OPERATOR.fullName.startsWith("—") && !OPERATOR.inn.startsWith("—");

const MONTHLY = PRICES.monthly.toLocaleString("ru-RU");
const YEARLY = PRICES.yearly.toLocaleString("ru-RU");

/**
 * The public offer.
 *
 * Russian law, Russian audience, so the Russian text is the document and the
 * English one is a courtesy translation that says so about itself.
 *
 * Two decisions inside it are worth naming because they are design choices,
 * not boilerplate:
 *
 * **No automatic renewal.** A subscription is paid once for a period and ends
 * when the period ends. This is simpler to build — no stored cards, no
 * recurring mandate — and it removes the single largest source of consumer
 * complaints and of regulatory attention in subscription businesses. Somebody
 * who wants another year will pay for another year.
 *
 * **A refund rule that is actually usable.** Russian consumer law (ст. 32
 * ЗоЗПП) already lets a customer walk away at any time and get back what was
 * not yet rendered, so a document pretending otherwise would be void anyway.
 * Saying it plainly costs nothing and is one of the few places a document
 * like this can earn trust rather than spend it.
 *
 * Not legal advice, and not a substitute for a lawyer reading it before money
 * moves.
 */
export const offerDoc: Record<"ru" | "en", LegalDoc> = {
  ru: {
    title: "Публичная оферта",
    summary: [
      "Это договор между тобой и исполнителем. Оплачивая подписку, ты его принимаешь.",
      "Подписка не продлевается сама: оплатил период — он закончился — доступ вернулся к бесплатному.",
      "Передумал — напиши на почту, вернём деньги за неиспользованную часть.",
    ],
    sections: [
      {
        id: "general",
        h: "Общие положения",
        p: [
          `Настоящий документ является публичной офертой ${OPERATOR.fullNameGenitive} (далее — «Исполнитель») в соответствии со статьёй 437 Гражданского кодекса Российской Федерации.`,
          "Оферта адресована любому дееспособному физическому лицу (далее — «Пользователь»), желающему приобрести доступ к платным разделам сервиса Eaglish, размещённого по адресу eaglish.ru.",
          "Договор считается заключённым с момента оплаты (акцепта). Отдельный документ на бумаге не составляется и не подписывается.",
        ],
      },
      {
        id: "subject",
        h: "Предмет договора",
        p: [
          "Исполнитель предоставляет Пользователю доступ к платным разделам сервиса: упражнениям на восприятие речи на слух, письменным заданиям с автоматической проверкой, материалам разговорного английского и распознаванию рукописного текста.",
          "Сервис предоставляет материалы и инструменты для самостоятельного изучения английского языка. Это не образовательная организация, обучение не ведётся по образовательной программе, документ об образовании не выдаётся.",
          "Часть сервиса — чтение, личный словарь, расписание повторений и статистика — доступна бесплатно и не является предметом настоящего договора.",
        ],
      },
      {
        id: "acceptance",
        h: "Как заключается договор",
        p: [
          "Акцептом оферты является оплата подписки любым из предложенных на сайте способов.",
          "Совершая оплату, Пользователь подтверждает, что ознакомился с настоящей офертой, условиями использования и политикой конфиденциальности, согласен с ними и обладает необходимой дееспособностью.",
          "Доступ открывается автоматически после поступления подтверждения об оплате от платёжного сервиса — как правило, в течение нескольких минут.",
        ],
      },
      {
        id: "price",
        h: "Стоимость и оплата",
        p: [
          `Стоимость подписки: ${MONTHLY} ₽ за один месяц доступа или ${YEARLY} ₽ за один год доступа.`,
          "Цены указаны в рублях Российской Федерации и включают все применимые налоги. Исполнитель применяет специальный налоговый режим «Налог на профессиональный доход», НДС не облагается.",
          "Оплата производится через платёжный сервис. Исполнитель не получает и не хранит данные банковских карт Пользователя.",
          "После оплаты Исполнитель формирует чек в соответствии с Федеральным законом № 422-ФЗ и направляет его на адрес электронной почты, указанный при оплате.",
          "Исполнитель вправе изменить стоимость подписки. Изменение не затрагивает уже оплаченные периоды.",
        ],
      },
      {
        id: "term",
        h: "Срок подписки",
        p: [
          "Подписка действует с момента открытия доступа и до окончания оплаченного периода.",
          "Автоматическое продление не производится, деньги повторно не списываются. По окончании периода аккаунт возвращается к бесплатному доступу; сохранённые слова, расписание повторений и вся статистика остаются у Пользователя в полном объёме.",
          "Чтобы продолжить, Пользователь оплачивает следующий период самостоятельно.",
        ],
      },
      {
        id: "refund",
        h: "Возврат денежных средств",
        p: [
          "Пользователь вправе отказаться от договора в любой момент на основании статьи 32 Закона «О защите прав потребителей».",
          "При отказе Исполнитель возвращает стоимость неиспользованной части подписки, рассчитанную пропорционально оставшимся дням оплаченного периода.",
          `Для возврата достаточно написать на ${OPERATOR.email} с адреса почты, на который зарегистрирован аккаунт, и указать причину — она нужна нам, чтобы стать лучше, и не влияет на решение.`,
          "Возврат производится тем же способом, которым была произведена оплата, в течение десяти рабочих дней с момента получения обращения.",
          "Если сервис не работал по вине Исполнителя более трёх суток подряд, подписка продлевается на срок простоя либо возвращается полностью — по выбору Пользователя.",
        ],
      },
      {
        id: "duties",
        h: "Права и обязанности",
        p: [
          "Исполнитель обязуется обеспечивать работоспособность сервиса, устранять неисправности в разумный срок и уведомлять о плановых работах заранее, когда это возможно.",
          "Пользователь обязуется не передавать доступ к аккаунту третьим лицам, не копировать и не распространять материалы сервиса, не предпринимать действий, нарушающих его работу.",
          "Доступ предоставляется одному человеку. При обнаружении одновременного использования аккаунта несколькими лицами Исполнитель вправе приостановить доступ, уведомив Пользователя и вернув стоимость неиспользованной части.",
          "Исключительные права на материалы сервиса принадлежат Исполнителю. Подписка даёт право пользоваться ими лично, но не передаёт никаких прав на сами материалы.",
        ],
      },
      {
        id: "liability",
        h: "Ответственность и ограничения",
        p: [
          "Проверка письменных работ, переводы и часть учебных материалов формируются автоматически с использованием языковых моделей. Они полезны как ориентир, но могут содержать ошибки, и Исполнитель не гарантирует их безошибочность.",
          "Исполнитель не гарантирует достижения Пользователем конкретного уровня владения языком: результат зависит от регулярности и объёма самостоятельной работы.",
          "Исполнитель не несёт ответственности за недоступность сервиса, вызванную обстоятельствами вне его контроля: сбоями у хостинг-провайдера, у операторов связи, действиями третьих лиц.",
          "Ответственность Исполнителя в любом случае ограничена стоимостью оплаченной подписки.",
        ],
      },
      {
        id: "data",
        h: "Персональные данные",
        p: [
          "Обработка персональных данных Пользователя осуществляется в соответствии с политикой конфиденциальности, размещённой на сайте, и Федеральным законом № 152-ФЗ.",
          "Принимая настоящую оферту, Пользователь подтверждает согласие на обработку своих персональных данных на условиях, изложенных в политике конфиденциальности.",
        ],
      },
      {
        id: "changes",
        h: "Изменение оферты и разрешение споров",
        p: [
          "Исполнитель вправе изменить настоящую оферту. Новая редакция вступает в силу с момента публикации на сайте и не распространяется на уже оплаченные периоды.",
          "Все споры стороны стремятся разрешить путём переговоров. Претензия направляется на адрес электронной почты Исполнителя и рассматривается в течение десяти рабочих дней.",
          "При недостижении согласия спор подлежит разрешению в соответствии с законодательством Российской Федерации.",
        ],
      },
      {
        id: "requisites",
        h: "Реквизиты Исполнителя",
        p: [
          OPERATOR.fullName,
          OPERATOR.status,
          `ИНН: ${OPERATOR.inn}`,
          `Электронная почта: ${OPERATOR.email}`,
        ],
      },
    ],
  },
  en: {
    title: "Public offer",
    summary: [
      "This is the contract between you and the provider. Paying for a subscription accepts it.",
      "A subscription does not renew itself: the period you paid for ends, and the account returns to the free plan.",
      "Changed your mind? Write to us and we refund the part you did not use.",
    ],
    sections: [
      {
        id: "general",
        h: "Note on this translation",
        p: [
          "The Russian text of this offer is the binding document. This translation exists so that a reader who does not read Russian knows what they are agreeing to; where the two differ, the Russian version governs.",
          `The offer is made by ${OPERATOR.fullNameLatin}, registered in Russia under the professional income tax regime, INN ${OPERATOR.inn}.`,
        ],
      },
      {
        id: "subject",
        h: "What is being sold",
        p: [
          "Access to the paid sections of Eaglish: listening exercises, written work with automatic feedback, spoken-English material and handwriting recognition.",
          "Eaglish provides materials and tools for studying English on your own. It is not an accredited school, teaches no certified programme and issues no diploma.",
          "Reading, your own dictionary, the review schedule and the statistics are free and are not covered by this contract.",
        ],
      },
      {
        id: "price",
        h: "Price and payment",
        p: [
          `${MONTHLY} ₽ for one month of access, or ${YEARLY} ₽ for one year.`,
          "Prices are in Russian roubles and include all applicable taxes. Payment is handled by a payment service; we never receive or store your card details.",
          "A receipt is issued after payment and sent to the email address given at checkout.",
        ],
      },
      {
        id: "term",
        h: "How long it lasts",
        p: [
          "Access runs until the paid period ends. There is no automatic renewal and nothing is charged again.",
          "When the period ends the account returns to the free plan. Every saved word, the review schedule and all statistics remain yours in full.",
        ],
      },
      {
        id: "refund",
        h: "Refunds",
        p: [
          "You may end this contract at any time under article 32 of the Russian consumer protection law.",
          "We refund the unused part of the subscription, calculated by the days remaining.",
          `Write to ${OPERATOR.email} from the address your account uses. Refunds are made by the original payment method within ten working days.`,
          "If the service was down through our fault for more than three days running, we extend the subscription by that time or refund it in full, whichever you prefer.",
        ],
      },
      {
        id: "liability",
        h: "Limits",
        p: [
          "Written feedback, translations and some study material are generated automatically by language models. They are useful as a guide and can be wrong.",
          "We do not promise that you will reach any particular level: that depends on how much work you do.",
          "Our liability is limited to the amount you paid.",
        ],
      },
      {
        id: "requisites",
        h: "Provider",
        p: [
          OPERATOR.fullNameLatin,
          OPERATOR.status,
          `INN: ${OPERATOR.inn}`,
          `Email: ${OPERATOR.email}`,
        ],
      },
    ],
  },
};
