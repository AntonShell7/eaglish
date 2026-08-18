/**
 * Privacy policy and terms.
 *
 * Kept as data, not as prose inside a component, so both languages stay in step
 * and the page can render a summary, a table of contents and the body from one
 * source. The content describes what the app actually does — the third parties
 * named here are the ones the code really talks to (Supabase, Groq, the host) —
 * because a policy that describes a different product is worse than none.
 */

/**
 * The address a reader can actually write to: it appears in both documents as
 * the contact for questions and for account deletion, so it has to be a mailbox
 * someone reads. When the domain is live this becomes hello@<domain> and the
 * Gmail one keeps working as a forward.
 */
export const CONTACT_EMAIL = "eaglish.hello@gmail.com";

export const LAST_UPDATED = "2026-08-18";

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
          `Eaglish — учебный проект, который ведёт частное лицо. По любым вопросам о данных пиши на ${CONTACT_EMAIL}: это тот же адрес, по которому можно потребовать удалить аккаунт.`,
        ],
      },
      {
        id: "what",
        h: "Какие данные мы собираем",
        p: [
          "Данные аккаунта: адрес электронной почты и пароль. Пароль мы не видим — он хранится в виде хеша у нашего провайдера аутентификации.",
          "Учебные данные: сохранённые слова и расписание их повторений, отправленные тексты и оценки к ним, открытые тексты и результаты вопросов, ежедневная активность и настройки из онбординга (уровень, цель, темы, дневная норма).",
          "Локальные настройки в браузере: тема оформления, язык интерфейса, согласие на этой странице и копия учебного прогресса, чтобы приложение работало без интернета.",
          "Мы не собираем имя, возраст, номер телефона, платёжные данные и не запрашиваем доступ к камере, микрофону или геолокации.",
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
          "Supabase — хранение базы данных и аутентификация. Там лежат аккаунт и учебные данные.",
          "Groq — обработка текста нейросетью. Туда уходит слово с предложением, в котором ты его встретил (для перевода), и текст, который ты отправил на проверку письма. Не отправляй в эти поля персональные данные — свои или чужие.",
          "Хостинг сайта — отдача файлов приложения и техничеcкие журналы запросов у провайдера.",
          "Больше никому. Мы не передаём данные рекламным сетям, не продаём их и не обмениваем.",
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
          `Eaglish is a study project run by an individual. For anything about your data, write to ${CONTACT_EMAIL} — the same address that deletes an account on request.`,
        ],
      },
      {
        id: "what",
        h: "What we collect",
        p: [
          "Account data: your email address and a password. We never see the password itself; our authentication provider stores a hash of it.",
          "Learning data: saved words and their review schedule, submitted texts and their scores, which texts you opened and how you answered their questions, daily activity, and your onboarding answers (level, goal, topics, daily target).",
          "Local settings in your browser: theme, interface language, the consent recorded on this page, and a copy of your progress so the app works offline.",
          "We do not collect your name, age, phone number or payment details, and we never ask for camera, microphone or location access.",
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
          "Supabase — database storage and authentication. Your account and learning data live there.",
          "Groq — AI text processing. A word plus the sentence you met it in is sent for translation, and a piece of writing is sent when you ask for an assessment. Please don't type personal data — yours or anyone else's — into those fields.",
          "Our hosting provider — serving the application files, plus ordinary request logs.",
          "Nobody else. We do not share data with ad networks, sell it, or trade it.",
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
