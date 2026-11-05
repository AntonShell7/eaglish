import { localize, localizeTemplate } from "@/i18n/content";
/**
 * Privacy policy, terms, and the public offer.
 *
 * Kept as data, not as prose inside a component, so both languages stay in step
 * and the page can render a summary, a table of contents and the body from one
 * source. The content describes what the app actually does — the third parties
 * named here are the ones the code really talks to (Google, Groq, OpenAI, the host) —
 * because a policy that describes a different product is worse than none.
 */

import { PRICES, STANDARD_PRICES } from "@/lib/plans";

/**
 * The address a reader can actually write to: it appears in both documents as
 * the contact for questions and for account deletion, so it has to be a mailbox
 * someone reads. When the domain is live this becomes hello@<domain> and the
 * Gmail one keeps working as a forward.
 */
export const CONTACT_EMAIL = "eaglish@yandex.ru";

export const LAST_UPDATED = "2026-11-02";

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
    title: localize("Политика конфиденциальности"),
    summary: [
      localize("Аккаунт и учебный прогресс используются для работы Eaglish."),
      localize("Мы не продаём персональные данные и не используем рекламные трекеры."),
      localize("Управлять аккаунтом можно в профиле, а обратиться по вопросам данных — по электронной почте.")
    ],
    sections: [
      {
        id: "who",
        h: localize("Оператор данных"),
        p: [
          localize("Оператор — Шелудько Антон Павлович, самозанятый, ИНН 253715678005."),
          localize("Контакт по вопросам обработки данных: eaglish@yandex.ru.")
        ],
      },
      {
        id: "what",
        h: localize("Какие данные обрабатываются"),
        p: [
          localize("Аккаунт: электронная почта, идентификатор, даты регистрации и входа. Пароль хранится в виде хеша. При входе через Google могут передаваться имя и изображение профиля."),
          localize("Учебные данные: слова и наборы, история повторений, предложения и результаты заданий, активность и время занятий, настройки обучения. Стрик и заморозки рассчитываются по истории занятий."),
          localize("Технические данные: IP-адрес, сведения о браузере, сессия входа и журналы запросов. В поддержку передаются текст обращения и сведения для разбора проблемы."),
          localize("При оплате обрабатываются сумма, статус платежа, период доступа и сведения для чека. Данные банковской карты обрабатывает платёжный сервис.")
        ],
      },
      {
        id: "why",
        h: localize("Цели и основания"),
        p: [
          localize("Данные нужны для регистрации, предоставления доступа, синхронизации прогресса, повторения слов, проверки заданий и поддержки. Основание — заключение и исполнение договора с пользователем."),
          localize("Платёжные и учётные сведения также обрабатываются для исполнения обязанностей по закону. Когда требуется согласие, оно оформляется отдельно; принятие оферты не заменяет такое согласие.")
        ],
      },
      {
        id: "third-parties",
        h: localize("Сервисы обработки"),
        p: [
          localize("Хостинг-провайдер и Vercel обеспечивают работу сайта и API, обрабатывая технические запросы и данные авторизации. Google участвует при выборе входа через Google."),
          localize("API Groq и OpenAI используются для переводов, создания материалов, разбора предложений и распознавания рукописного ввода. Они получают содержимое соответствующего запроса: текст, контекст или изображение. Приложение не добавляет сведения аккаунта как отдельные поля запроса к модели."),
          localize("ЮKassa обрабатывает платежи при подключённой оплате и получает сведения для платежа и чека. Мы не продаём данные и не передаём их рекламным сетям.")
        ],
      },
      {
        id: "where",
        h: localize("Хранение и обработка"),
        p: [
          localize("Основная база аккаунтов и учебного прогресса размещена в России."),
          localize("Перечисленные внешние сервисы могут обрабатывать запросы за пределами России. Если запрос содержит персональные данные, применяются требования к трансграничной передаче. Не включайте в учебные задания конфиденциальные сведения и персональные данные третьих лиц.")
        ],
      },
      {
        id: "cookies",
        h: localize("Cookie и хранилище браузера"),
        p: [
          localize("В браузере сохраняются сессия входа, тема, язык, настройки и локальная копия прогресса. Некоторые настройки и названия пустых наборов могут храниться только на текущем устройстве."),
          localize("Рекламные трекеры и сторонняя аналитика посещений не подключены. Сведения о локальном хранении доступны через «Настройки cookie» внизу страницы.")
        ],
      },
      {
        id: "who-sees",
        h: localize("Доступ и защита"),
        p: [
          localize("Владелец сервиса может просматривать сведения об аккаунте, учебной активности и сохранённых словах для поддержки и администрирования."),
          localize("Используются HTTPS, авторизация и ограничения доступа к данным. Пароли не отображаются в административном интерфейсе.")
        ],
      },
      {
        id: "retention",
        h: localize("Хранение и удаление"),
        p: [
          localize("Учебные данные хранятся для работы аккаунта до его удаления или прекращения соответствующей цели обработки. Сведения, необходимые для исполнения обязанностей по закону, сохраняются на предусмотренные законом сроки."),
          localize("Удалить аккаунт можно в профиле после отдельного подтверждения или по запросу на eaglish@yandex.ru. Удаление аккаунта и учебного прогресса необратимо. Локальные копии на других устройствах можно удалить в настройках браузера.")
        ],
      },
      {
        id: "rights",
        h: localize("Права пользователя"),
        p: [
          localize("Вы можете запросить сведения об обработке и копию данных, потребовать уточнения, ограничения или удаления в предусмотренных законом случаях, а также отозвать согласие на обработку, основанную на согласии. Обращения: eaglish@yandex.ru."),
          localize("Для защиты прав можно обратиться в Роскомнадзор или суд.")
        ],
      },
      {
        id: "changes",
        h: localize("Обновления"),
        p: [
          localize("При изменении обработки мы обновляем политику и дату её редакции. Если для новой цели требуется согласие, оно запрашивается отдельно.")
        ],
      },
    ],
  },

  en: {
    title: "Privacy policy",
    summary: [
      "Your account and learning progress support the Eaglish service.",
      "We do not sell personal data or use advertising trackers.",
      "Manage your account in Profile or contact us by email about your data."
    ],
    sections: [
      {
        id: "who",
        h: "Data controller",
        p: [
          "The controller is Anton Pavlovich Sheludko, registered in Russia under the professional income tax regime, INN 253715678005.",
          "Data enquiries: eaglish@yandex.ru."
        ],
      },
      {
        id: "what",
        h: "Data we process",
        p: [
          "Account data: email, identifier, registration and sign-in dates. Passwords are stored as hashes. Google sign-in may provide a name and profile image.",
          "Learning data: words and sets, review history, sentences and exercise results, activity, study time and preferences. Streaks and freezes are calculated from practice history.",
          "Technical data: IP address, browser information, sign-in session and request logs. Support requests include your message and information needed to investigate the issue.",
          "Payments involve the amount, status, access period and receipt details. Card details are processed by the payment service."
        ],
      },
      {
        id: "why",
        h: "Purposes and legal bases",
        p: [
          "Data supports registration, access, progress sync, word reviews, exercise feedback and support. The legal basis is entering into and performing our agreement with you.",
          "Payment and accounting information also serves legal obligations. Where consent is required, it is obtained separately; accepting the offer does not replace consent."
        ],
      },
      {
        id: "third-parties",
        h: "Processing services",
        p: [
          "Our hosting provider and Vercel operate the website and API, processing technical requests and authentication data. Google is involved when you choose Google sign-in.",
          "Groq and OpenAI APIs support translations, material generation, sentence feedback and handwriting recognition. They receive the relevant text, context or image. The app does not add account details as separate fields in model requests.",
          "YooKassa processes payments when checkout is enabled and receives payment and receipt information. We do not sell data or share it with advertising networks."
        ],
      },
      {
        id: "where",
        h: "Storage and processing",
        p: [
          "The primary account and learning-progress database is hosted in Russia.",
          "The listed external services may process requests outside Russia. Cross-border transfer requirements apply where a request contains personal data. Do not include confidential information or other people’s personal data in exercises."
        ],
      },
      {
        id: "cookies",
        h: "Cookies and browser storage",
        p: [
          "The browser stores your session, theme, language, preferences and a local copy of progress. Some preferences and empty-set names may exist only on the current device.",
          "Advertising trackers and third-party visitor analytics are not enabled. Local-storage information is available under Cookie settings in the footer."
        ],
      },
      {
        id: "who-sees",
        h: "Access and protection",
        p: [
          "The service owner can view account information, learning activity and saved words for support and administration.",
          "HTTPS, authentication and data-access restrictions are used. Passwords are not displayed in the administration interface."
        ],
      },
      {
        id: "retention",
        h: "Retention and deletion",
        p: [
          "Learning data is retained to operate your account until deletion or the end of its processing purpose. Records needed to meet legal obligations are retained for the legally required periods.",
          "Delete your account in Profile after a separate confirmation, or request deletion at eaglish@yandex.ru. Account and learning-progress deletion is irreversible. Clear local copies on other devices in browser settings."
        ],
      },
      {
        id: "rights",
        h: "Your rights",
        p: [
          "You may request processing information and a copy of your data, ask for correction, restriction or deletion where provided by law, and withdraw consent for consent-based processing. Contact: eaglish@yandex.ru.",
          "You may contact Roskomnadzor or a court to protect your rights."
        ],
      },
      {
        id: "changes",
        h: "Updates",
        p: [
          "We update this policy and its revision date when processing changes. Consent is requested separately where required for a new purpose."
        ],
      },
    ],
  },
};

export const termsDoc: Record<"ru" | "en", LegalDoc> = {
  ru: {
    title: localize("Условия использования"),
    summary: [
      localize("Сленг, английский на слух и умное повторение доступны в Pro."),
      localize("Чтение, словарь, обычные повторения и прогресс доступны бесплатно."),
      localize("Оплата и возвраты регулируются публичной офертой.")
    ],
    sections: [
      {
        id: "service",
        h: localize("Возможности сервиса"),
        p: [
          localize("Eaglish — сервис для самостоятельной практики английского. Раздел «Сленг» посвящён современным выражениям, диалогам и их употреблению."),
          localize("Pro открывает «Сленг», «Английский на слух» и «Умное повторение»: составление предложений со словами из личного словаря и автоматический разбор."),
          localize("Чтение, словарь, создание и редактирование наборов, обычные повторения и статистика доступны бесплатно. Рукописный ввод зависит от устройства и доступности режима."),
          localize("Сервис не выдаёт документы об образовании и не гарантирует определённый языковой уровень.")
        ],
      },
      {
        id: "account",
        h: localize("Аккаунт"),
        p: [
          localize("Для сохранения прогресса между устройствами нужен аккаунт. Указывай настоящий адрес почты — на него приходит подтверждение и восстановление пароля."),
          localize("Отвечай за сохранность пароля и за всё, что происходит под твоим аккаунтом. Если заметил чужой вход — сразу смени пароль и напиши нам."),
        ],
      },
      {
        id: "subscription",
        h: localize("Подписка и доступ"),
        p: [
          localize("Pro предоставляется на оплаченный период или по условиям кода доступа. Стоимость и состав тарифа указаны на странице «Тарифы», условия оплаты и возвратов — в оферте."),
          localize("Автопродления и повторных автоматических списаний нет. После окончания Pro бесплатные разделы и сохранённый прогресс остаются доступны."),
          localize("Для автоматических функций действуют дневные и технические ограничения, указанные в тарифах и интерфейсе.")
        ],
      },
      {
        id: "use",
        h: localize("Как можно и нельзя пользоваться"),
        p: [
          localize("Можно: учиться, копировать материалы для личного использования, делиться ссылками."),
          localize("Нельзя: пытаться сломать или перегрузить сервис, обходить ограничения, автоматически выкачивать материалы, использовать чужие персональные данные в полях ввода, выдавать материалы сервиса за свои в коммерческих целях."),
        ],
      },
      {
        id: "content",
        h: localize("Результаты и серия занятий"),
        p: [
          localize("Переводы, подсказки и разборы могут создаваться нейросетью и содержать неточности. Результаты заданий и оценка уровня служат для практики и не заменяют экзамен или сертификат."),
          localize("Стрик учитывает дни с выполненными заданиями. В запасе две заморозки: одна сохраняет серию за пропущенный день, не увеличивая число дней занятий. За каждые семь дней занятий начисляется одна заморозка, максимум — две. Правила действуют с 2 ноября 2026 года и не восстанавливают ранее прерванные серии.")
        ],
      },
      {
        id: "availability",
        h: localize("Работа сервиса"),
        p: [
          localize("Возможны технические перерывы и обновления. По вопросам недоступности обращайтесь на eaglish@yandex.ru."),
          localize("Условия не ограничивают права пользователя и ответственность исполнителя, установленные обязательными нормами закона. Для оплаченного доступа действуют также условия оферты.")
        ],
      },
      {
        id: "termination",
        h: localize("Прекращение доступа"),
        p: [
          localize("Удалить аккаунт можно в профиле после подтверждения или через поддержку. Для возврата за оплаченный период направьте отдельное обращение по правилам оферты."),
          localize("При нарушении правил доступ может быть ограничен с учётом требований закона и прав пользователя на оплаченные услуги.")
        ],
      },
      {
        id: "changes",
        h: localize("Изменения условий"),
        p: [
          localize("Актуальная редакция публикуется на этой странице. Изменения не ухудшают условия уже оплаченного периода и не отменяют установленные законом права пользователя.")
        ],
      },
      {
        id: "contact",
        h: localize("Связь"),
        p: [localizeTemplate("Вопросы, жалобы, удаление аккаунта: {{p0}}.", [CONTACT_EMAIL])],
      },
    ],
  },

  en: {
    title: "Terms of use",
    summary: [
      "Pro includes Slang, Listening and Smart repetition.",
      "Reading, Vocabulary, standard reviews and Progress are free.",
      "Payments and refunds are governed by the public offer."
    ],
    sections: [
      {
        id: "service",
        h: "Service features",
        p: [
          "Eaglish supports self-study English practice. Slang focuses on modern expressions, dialogues and usage.",
          "Pro unlocks Slang, Listening and Smart repetition: building sentences with saved words and receiving automatic feedback.",
          "Reading, Vocabulary, creating and editing sets, standard reviews and statistics are free. Handwriting input depends on the device and available mode.",
          "The service does not issue educational qualifications or guarantee a particular language level."
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
        id: "subscription",
        h: "Subscription and access",
        p: [
          "Pro is provided for the purchased period or under an access code’s terms. Prices and features appear on Plans; payments and refunds are governed by the offer.",
          "There is no automatic renewal or automatic repeat charge. Free sections and saved progress remain available after Pro expires.",
          "Automatic features have daily and technical limits shown in the plans and interface."
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
        h: "Results and streaks",
        p: [
          "Translations, hints and feedback may be generated by AI and contain inaccuracies. Exercise results and level estimates support practice and do not replace exams or certificates.",
          "Streaks count days with completed tasks. Two freezes are available initially: one protects a missed day without adding a practice day. Earn one every seven practice days, up to two. These rules apply from 2 November 2026 and do not restore previously broken streaks."
        ],
      },
      {
        id: "availability",
        h: "Service availability",
        p: [
          "Technical interruptions and updates may occur. Report access issues to eaglish@yandex.ru.",
          "These terms do not limit statutory user rights or mandatory provider liability. Paid access is also governed by the offer."
        ],
      },
      {
        id: "termination",
        h: "Ending access",
        p: [
          "Delete your account in Profile after confirmation or contact support. Request a refund for a paid period separately under the offer.",
          "Access may be restricted for violations, subject to the law and your rights regarding paid services."
        ],
      },
      {
        id: "changes",
        h: "Changes to these terms",
        p: [
          "The current version is published on this page. Changes do not reduce the terms of an already paid period or remove statutory user rights."
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
  fullName: localize("Шелудько Антон Павлович"),
  /**
   * The same name in the genitive.
   *
   * Russian needs it for the one sentence that matters most — "настоящий
   * документ является публичной офертой <кого>" — and a template that drops
   * the nominative in there produces "офертой Шелудько Антон Павлович", which
   * is the kind of thing that makes a reader doubt everything after it.
   * Шелудько does not decline; the given name and patronymic do.
   */
  fullNameGenitive: localize("Шелудько Антона Павловича"),
  /** For the English translation, which should not be half in Cyrillic. */
  fullNameLatin: "Anton Pavlovich Sheludko",
  status: localize("Самозанятый (плательщик налога на профессиональный доход)"),
  /** ИНН, twelve digits. */
  inn: "253715678005",
  email: CONTACT_EMAIL,
} as const;

/** True once the requisites above have been replaced with real ones. */
export const OPERATOR_READY = !OPERATOR.fullName.startsWith("—") && !OPERATOR.inn.startsWith("—");

const MONTHLY = PRICES.monthly.toLocaleString("ru-RU");
const YEARLY = PRICES.yearly.toLocaleString("ru-RU");
const STANDARD_MONTHLY = STANDARD_PRICES.monthly.toLocaleString("ru-RU");
const STANDARD_YEARLY = STANDARD_PRICES.yearly.toLocaleString("ru-RU");

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
    title: localize("Публичная оферта"),
    summary: [
      localize("Pro открывает сленг, английский на слух и умное повторение."),
      localize("Оплата производится за выбранный период, без автопродления."),
      localize("Возврат за неиспользованный период можно запросить по электронной почте.")
    ],
    sections: [
      {
        id: "general",
        h: localize("Общие положения"),
        p: [
          localizeTemplate("Настоящий документ является публичной офертой {{p0}} (далее — «Исполнитель») в соответствии со статьёй 437 Гражданского кодекса Российской Федерации.", [OPERATOR.fullNameGenitive]),
          localize("Оферта адресована любому дееспособному физическому лицу (далее — «Пользователь»), желающему приобрести доступ к платным разделам сервиса Eaglish, размещённого по адресу eaglish.ru."),
          localize("Договор считается заключённым с момента оплаты (акцепта). Отдельный документ на бумаге не составляется и не подписывается."),
        ],
      },
      {
        id: "subject",
        h: localize("Предмет договора"),
        p: [
          localize("Исполнитель предоставляет доступ к Pro: разделам «Сленг», «Английский на слух» и «Умное повторение». Они включают практику современных выражений, диктанты и составление предложений со словами из личного словаря с автоматическим разбором."),
          localize("Состав тарифа и ограничения функций указаны на странице «Тарифы». Рукописный ввод доступен в поддерживаемых режимах и зависит от устройства."),
          localize("Чтение, личный словарь, наборы слов, обычные повторения и статистика доступны бесплатно. Сервис предназначен для самостоятельной практики и не выдаёт документов об образовании.")
        ],
      },
      {
        id: "acceptance",
        h: localize("Как заключается договор"),
        p: [
          localize("Акцептом оферты является оплата подписки любым из предложенных на сайте способов."),
          localize("Совершая оплату, Пользователь подтверждает, что ознакомился с настоящей офертой, условиями использования и политикой конфиденциальности, согласен с ними и обладает необходимой дееспособностью."),
          localize("Доступ открывается автоматически после поступления подтверждения об оплате от платёжного сервиса — как правило, в течение нескольких минут."),
        ],
      },
      {
        id: "price",
        h: localize("Стоимость и оплата"),
        p: [
          localizeTemplate("Стартовая цена полного доступа Pro для первых пользователей: {{p0}} ₽ за месяц или {{p1}} ₽ за год. Базовая цена — {{p2}} ₽ за месяц или {{p3}} ₽ за год.", [MONTHLY, YEARLY, STANDARD_MONTHLY, STANDARD_YEARLY]),
          localize("Стартовое предложение доступно пользователям, оформляющим подписку, пока оно опубликовано на странице «Тарифы». Скидка применяется автоматически к выбранному периоду, промокод не нужен. Для следующей покупки действует цена, указанная на момент её оформления; автопродления нет."),
          localize("Цены указаны в рублях Российской Федерации и включают все применимые налоги. Исполнитель применяет специальный налоговый режим «Налог на профессиональный доход», НДС не облагается."),
          localize("Оплата производится через платёжный сервис. Исполнитель не получает и не хранит данные банковских карт Пользователя."),
          localize("После оплаты Исполнитель формирует чек в соответствии с Федеральным законом № 422-ФЗ и направляет его на адрес электронной почты, указанный при оплате."),
          localize("Исполнитель вправе изменить стоимость подписки. Изменение не затрагивает уже оплаченные периоды."),
        ],
      },
      {
        id: "term",
        h: localize("Срок подписки"),
        p: [
          localize("Подписка действует с момента открытия доступа и до окончания оплаченного периода."),
          localize("Автоматическое продление не производится, деньги повторно не списываются. По окончании периода аккаунт возвращается к бесплатному доступу; сохранённые слова, расписание повторений и вся статистика остаются у Пользователя в полном объёме."),
          localize("Чтобы продолжить, Пользователь оплачивает следующий период самостоятельно."),
        ],
      },
      {
        id: "refund",
        h: localize("Возврат средств"),
        p: [
          localize("Пользователь вправе отказаться от договора в любое время в соответствии со статьёй 32 Закона «О защите прав потребителей»."),
          localize("По условиям оферты возвращается стоимость неиспользованного периода пропорционально оставшимся дням. Это не ограничивает иные требования пользователя, предусмотренные законом, в том числе при недостатках услуги."),
          localize("Направьте запрос на eaglish@yandex.ru с почты аккаунта и укажите платёж. Объяснять причину отказа не требуется. Возврат производится тем же способом в течение десяти календарных дней с получения обращения, если законом не предусмотрен более короткий срок."),
          localize("Если сервис не работал по вине Исполнителя более трёх суток подряд, подписка продлевается на срок простоя либо возвращается полностью — по выбору Пользователя.")
        ],
      },
      {
        id: "duties",
        h: localize("Права и обязанности"),
        p: [
          localize("Исполнитель обеспечивает предоставление оплаченного доступа и рассматривает обращения. Пользователь соблюдает правила сервиса и использует аккаунт для личного обучения."),
          localize("Права на материалы принадлежат Исполнителю или соответствующим правообладателям. Оплата даёт право личного использования сервиса, а не перепродажи или распространения материалов.")
        ],
      },
      {
        id: "liability",
        h: localize("Ответственность"),
        p: [
          localize("Автоматические переводы и разборы могут содержать неточности. Результат зависит от самостоятельной практики; определённый уровень или экзаменационный балл не гарантируется."),
          localize("Стороны несут ответственность по законодательству Российской Федерации. Оферта не исключает обязательную ответственность Исполнителя и установленные законом права потребителя.")
        ],
      },
      {
        id: "data",
        h: localize("Персональные данные"),
        p: [
          localize("Цели, состав данных, используемые сервисы и права пользователя описаны в политике конфиденциальности. Обработка для исполнения договора и обязанностей по закону осуществляется на соответствующих основаниях."),
          localize("Принятие оферты не заменяет отдельное согласие в случаях, когда оно требуется.")
        ],
      },
      {
        id: "changes",
        h: localize("Изменение оферты и разрешение споров"),
        p: [
          localize("Исполнитель вправе изменить настоящую оферту. Новая редакция вступает в силу с момента публикации на сайте и не распространяется на уже оплаченные периоды."),
          localize("Все споры стороны стремятся разрешить путём переговоров. Претензия направляется на адрес электронной почты Исполнителя и рассматривается в течение десяти рабочих дней."),
          localize("При недостижении согласия спор подлежит разрешению в соответствии с законодательством Российской Федерации."),
        ],
      },
      {
        id: "requisites",
        h: localize("Реквизиты Исполнителя"),
        p: [
          OPERATOR.fullName,
          OPERATOR.status,
          localizeTemplate("ИНН: {{p0}}", [OPERATOR.inn]),
          localizeTemplate("Электронная почта: {{p0}}", [OPERATOR.email]),
        ],
      },
    ],
  },
  en: {
    title: "Public offer",
    summary: [
      "Pro unlocks Slang, Listening and Smart repetition.",
      "Pay for a selected period with no automatic renewal.",
      "Request a refund for the unused period by email."
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
        h: "What Pro includes",
        p: [
          "Pro provides access to Slang, Listening and Smart repetition: modern-expression practice, dictation and sentence building with saved words and automatic feedback.",
          "Features and limits are listed on Plans. Handwriting input is available in supported modes and depends on the device.",
          "Reading, Vocabulary, word sets, standard reviews and statistics are free. The service supports self-study and does not issue educational qualifications."
        ],
      },
      {
        id: "price",
        h: "Price and payment",
        p: [
          `Launch offer for early users: full Pro access for ${MONTHLY} ₽ for one month or ${YEARLY} ₽ for one year. Base prices are ${STANDARD_MONTHLY} ₽ per month or ${STANDARD_YEARLY} ₽ per year.`,
          "The launch offer is available to users purchasing a subscription while it is displayed on Plans. The discount applies automatically to the selected period; no promo code is required. A later purchase uses the price displayed at that time. There is no automatic renewal.",
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
          "You may withdraw at any time under article 32 of the Russian consumer protection law.",
          "Under this offer, the unused period is refunded in proportion to the days remaining. This does not limit other statutory remedies, including for deficient service.",
          "Email eaglish@yandex.ru from your account address and identify the payment. No reason is required. Refunds use the original method within ten calendar days of the request, unless the law requires a shorter period.",
          "If the service was down through our fault for more than three consecutive days, choose an extension covering the outage or a full refund."
        ],
      },
      {
        id: "liability",
        h: "Responsibility",
        p: [
          "Automatic translations and feedback may contain inaccuracies. Learning outcomes depend on personal practice; no specific level or exam score is guaranteed.",
          "The parties are responsible under Russian law. This offer does not exclude mandatory provider liability or statutory consumer rights."
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
