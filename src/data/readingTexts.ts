export interface GlossaryEntry {
  translation: string;
  partOfSpeech?: string;
}

export interface ReadingSentence {
  text: string;
  translationRu: string;
}

export interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[];
  /** Index into `options`. */
  answer: number;
  explanation: string;
}

export interface ReadingText {
  id: string;
  level: "A1-A2" | "B1-B2" | "C1-C2";
  /** Topic id in the library taxonomy; the six curated texts still use labels. */
  topic: string;
  /** True for machine-generated texts, so they can be audited or replaced. */
  generated?: boolean;
  title: string;
  sentences: ReadingSentence[];
  glossary: Record<string, GlossaryEntry>;
  questions: ComprehensionQuestion[];
}

export const readingTexts: ReadingText[] = [
  {
    id: "morning-routine",
    level: "A1-A2",
    topic: "Daily life",
    title: "A Morning Routine",
    sentences: [
      { text: "Every morning, Mia wakes up at seven o'clock.", translationRu: "Каждое утро Миа просыпается в семь часов." },
      { text: "She drinks a cup of tea and checks her messages.", translationRu: "Она пьёт чашку чая и проверяет сообщения." },
      { text: "Then she walks to the kitchen and makes breakfast for her little brother.", translationRu: "Затем она идёт на кухню и готовит завтрак для своего младшего брата." },
      { text: "On her way to school, she listens to a podcast about animals.", translationRu: "По пути в школу она слушает подкаст о животных." },
      { text: "Mia says that small habits make her day feel calm and organized.", translationRu: "Миа говорит, что маленькие привычки делают её день спокойным и организованным." },
    ],
    glossary: {
      wakes: { translation: "просыпается", partOfSpeech: "verb" },
      routine: { translation: "распорядок дня", partOfSpeech: "noun" },
      checks: { translation: "проверяет", partOfSpeech: "verb" },
      breakfast: { translation: "завтрак", partOfSpeech: "noun" },
      podcast: { translation: "подкаст", partOfSpeech: "noun" },
      habits: { translation: "привычки", partOfSpeech: "noun" },
      calm: { translation: "спокойный", partOfSpeech: "adjective" },
      organized: { translation: "организованный", partOfSpeech: "adjective" },
    },
    questions: [
      {
        id: "q1",
        question: "What does Mia do right after she wakes up?",
        options: ["She makes breakfast", "She drinks tea and checks messages", "She listens to a podcast", "She walks to school"],
        answer: 1,
        explanation: "The text says she drinks a cup of tea and checks her messages before anything else.",
      },
      {
        id: "q2",
        question: "Who does Mia make breakfast for?",
        options: ["Her mother", "Herself only", "Her little brother", "Her classmates"],
        answer: 2,
        explanation: "She makes breakfast for her little brother.",
      },
      {
        id: "q3",
        question: "Why does Mia like her routine?",
        options: ["It saves money", "It makes her day feel calm and organized", "It helps her sleep longer", "It impresses her friends"],
        answer: 1,
        explanation: "In the last sentence she says small habits make her day feel calm and organized.",
      },
    ],
  },
  {
    id: "night-market",
    level: "A1-A2",
    topic: "Travel",
    title: "The Night Market",
    sentences: [
      { text: "On Friday evenings, the small square near my house becomes a night market.", translationRu: "По вечерам в пятницу небольшая площадь рядом с моим домом превращается в ночной рынок." },
      { text: "Sellers put up bright lights and cook food on the street.", translationRu: "Продавцы вешают яркие огни и готовят еду прямо на улице." },
      { text: "My favourite stall sells warm bread with cheese for very little money.", translationRu: "Мой любимый прилавок продаёт тёплый хлеб с сыром совсем недорого." },
      { text: "Families walk slowly, talk to neighbours, and listen to live music.", translationRu: "Семьи медленно гуляют, разговаривают с соседями и слушают живую музыку." },
      { text: "The market closes at midnight, but nobody wants to go home early.", translationRu: "Рынок закрывается в полночь, но никто не хочет уходить домой рано." },
    ],
    glossary: {
      square: { translation: "площадь", partOfSpeech: "noun" },
      sellers: { translation: "продавцы", partOfSpeech: "noun" },
      stall: { translation: "прилавок, ларёк", partOfSpeech: "noun" },
      neighbours: { translation: "соседи", partOfSpeech: "noun" },
      midnight: { translation: "полночь", partOfSpeech: "noun" },
      bright: { translation: "яркий", partOfSpeech: "adjective" },
    },
    questions: [
      {
        id: "q1",
        question: "When does the square become a night market?",
        options: ["Every evening", "On Friday evenings", "On Sunday mornings", "At midnight only"],
        answer: 1,
        explanation: "The first sentence says it happens on Friday evenings.",
      },
      {
        id: "q2",
        question: "What does the writer's favourite stall sell?",
        options: ["Live music", "Bright lights", "Warm bread with cheese", "Fresh fish"],
        answer: 2,
        explanation: "The favourite stall sells warm bread with cheese for very little money.",
      },
      {
        id: "q3",
        question: "What does the last sentence suggest about the market?",
        options: ["People enjoy it and stay late", "It is usually empty", "It is too expensive", "It closes earlier than planned"],
        answer: 0,
        explanation: "Nobody wanting to go home early suggests people enjoy being there.",
      },
    ],
  },
  {
    id: "future-of-cities",
    level: "B1-B2",
    topic: "Technology",
    title: "The Future of Cities",
    sentences: [
      { text: "Many architects believe that cities will look very different in twenty years.", translationRu: "Многие архитекторы считают, что через двадцать лет города будут выглядеть совсем иначе." },
      { text: "Streets may be filled with electric vehicles instead of traditional cars.", translationRu: "Улицы могут заполнить электромобили вместо традиционных машин." },
      { text: "Rooftops could be covered with gardens that cool the air and grow food.", translationRu: "Крыши могут покрыть сады, которые охлаждают воздух и выращивают еду." },
      { text: "Some engineers are already testing buildings that generate their own electricity.", translationRu: "Некоторые инженеры уже тестируют здания, которые сами вырабатывают электричество." },
      { text: "These changes are not just about technology; they are about making daily life more sustainable.", translationRu: "Эти изменения не только о технологиях — они о том, чтобы сделать повседневную жизнь более экологичной." },
    ],
    glossary: {
      architects: { translation: "архитекторы", partOfSpeech: "noun" },
      vehicles: { translation: "транспортные средства", partOfSpeech: "noun" },
      rooftops: { translation: "крыши", partOfSpeech: "noun" },
      engineers: { translation: "инженеры", partOfSpeech: "noun" },
      generate: { translation: "вырабатывать", partOfSpeech: "verb" },
      sustainable: { translation: "экологичный, устойчивый", partOfSpeech: "adjective" },
      traditional: { translation: "традиционный", partOfSpeech: "adjective" },
      electricity: { translation: "электричество", partOfSpeech: "noun" },
    },
    questions: [
      {
        id: "q1",
        question: "What might replace traditional cars on future streets?",
        options: ["Bicycles only", "Electric vehicles", "Trains", "Nothing at all"],
        answer: 1,
        explanation: "The text says streets may be filled with electric vehicles instead of traditional cars.",
      },
      {
        id: "q2",
        question: "What two benefits of rooftop gardens are mentioned?",
        options: ["Cooling the air and growing food", "Saving money and time", "Making noise and light", "Storing water and fuel"],
        answer: 0,
        explanation: "Rooftop gardens are described as cooling the air and growing food.",
      },
      {
        id: "q3",
        question: "According to the last sentence, what are these changes mainly about?",
        options: ["Selling more technology", "Making daily life more sustainable", "Building taller towers", "Reducing the population"],
        answer: 1,
        explanation: "The writer says the changes are about making daily life more sustainable, not just technology.",
      },
    ],
  },
  {
    id: "art-of-listening",
    level: "B1-B2",
    topic: "Communication",
    title: "The Art of Listening",
    sentences: [
      { text: "Most people think they are good listeners, but research suggests otherwise.", translationRu: "Большинство людей считают себя хорошими слушателями, но исследования говорят об обратном." },
      { text: "While someone is speaking, we are often preparing our own reply instead of paying attention.", translationRu: "Пока кто-то говорит, мы часто готовим свой ответ вместо того, чтобы слушать." },
      { text: "Genuine listening requires patience and a willingness to be changed by what you hear.", translationRu: "Настоящее слушание требует терпения и готовности измениться под влиянием услышанного." },
      { text: "Skilled listeners ask questions that invite the speaker to say more.", translationRu: "Умелые слушатели задают вопросы, которые побуждают собеседника рассказать больше." },
      { text: "In both friendships and business, this habit builds trust faster than clever arguments.", translationRu: "И в дружбе, и в бизнесе эта привычка строит доверие быстрее, чем умные аргументы." },
    ],
    glossary: {
      research: { translation: "исследование", partOfSpeech: "noun" },
      otherwise: { translation: "иначе, наоборот", partOfSpeech: "adverb" },
      reply: { translation: "ответ", partOfSpeech: "noun" },
      genuine: { translation: "настоящий, искренний", partOfSpeech: "adjective" },
      patience: { translation: "терпение", partOfSpeech: "noun" },
      willingness: { translation: "готовность", partOfSpeech: "noun" },
      skilled: { translation: "умелый", partOfSpeech: "adjective" },
      trust: { translation: "доверие", partOfSpeech: "noun" },
    },
    questions: [
      {
        id: "q1",
        question: "What do people often do while someone else is speaking?",
        options: ["Take detailed notes", "Prepare their own reply", "Repeat every word", "Leave the room"],
        answer: 1,
        explanation: "The text says we are often preparing our own reply instead of paying attention.",
      },
      {
        id: "q2",
        question: "What do skilled listeners do?",
        options: ["Ask questions that invite the speaker to say more", "Give advice immediately", "Change the subject", "Speak louder"],
        answer: 0,
        explanation: "Skilled listeners ask questions that invite the speaker to say more.",
      },
      {
        id: "q3",
        question: "What builds trust faster than clever arguments?",
        options: ["Speaking confidently", "Winning debates", "Genuine listening", "Staying silent"],
        answer: 2,
        explanation: "The final sentence says this habit — genuine listening — builds trust faster than clever arguments.",
      },
    ],
  },
  {
    id: "science-of-memory",
    level: "C1-C2",
    topic: "Science",
    title: "The Science of Memory",
    sentences: [
      { text: "Human memory does not work like a video recording of the past.", translationRu: "Человеческая память не работает как видеозапись прошлого." },
      { text: "Instead, the brain reconstructs each memory slightly differently every time it is recalled.", translationRu: "Вместо этого мозг каждый раз немного по-разному воссоздаёт воспоминание, когда его вспоминают." },
      { text: "This explains why two people can remember the same event in strikingly different ways.", translationRu: "Это объясняет, почему два человека могут помнить одно и то же событие совершенно по-разному." },
      { text: "Researchers argue that this flexibility, while sometimes unreliable, allows the brain to update old information with new experience.", translationRu: "Исследователи утверждают, что эта гибкость, хоть иногда и ненадёжная, позволяет мозгу обновлять старую информацию новым опытом." },
      { text: "Understanding this process has changed how psychologists think about eyewitness testimony.", translationRu: "Понимание этого процесса изменило то, как психологи относятся к показаниям очевидцев." },
    ],
    glossary: {
      reconstructs: { translation: "воссоздаёт, восстанавливает", partOfSpeech: "verb" },
      recalled: { translation: "вспомнен, извлечён из памяти", partOfSpeech: "verb" },
      strikingly: { translation: "поразительно", partOfSpeech: "adverb" },
      flexibility: { translation: "гибкость", partOfSpeech: "noun" },
      unreliable: { translation: "ненадёжный", partOfSpeech: "adjective" },
      researchers: { translation: "исследователи", partOfSpeech: "noun" },
      testimony: { translation: "показания", partOfSpeech: "noun" },
      eyewitness: { translation: "очевидец", partOfSpeech: "noun" },
    },
    questions: [
      {
        id: "q1",
        question: "How does the writer describe human memory?",
        options: ["As an exact video recording", "As something the brain reconstructs each time", "As permanently fixed at birth", "As identical between people"],
        answer: 1,
        explanation: "The brain reconstructs each memory slightly differently every time it is recalled.",
      },
      {
        id: "q2",
        question: "What benefit of memory's flexibility do researchers point out?",
        options: ["It makes memories permanent", "It allows updating old information with new experience", "It prevents forgetting entirely", "It speeds up reading"],
        answer: 1,
        explanation: "Researchers argue flexibility lets the brain update old information with new experience.",
      },
      {
        id: "q3",
        question: "Which field has been affected by this understanding?",
        options: ["Architecture", "Agriculture", "Views on eyewitness testimony", "Space exploration"],
        answer: 2,
        explanation: "The last sentence mentions how psychologists think about eyewitness testimony.",
      },
    ],
  },
  {
    id: "cost-of-attention",
    level: "C1-C2",
    topic: "Society",
    title: "The Cost of Attention",
    sentences: [
      { text: "Attention has quietly become one of the most valuable commodities of the modern economy.", translationRu: "Внимание незаметно стало одним из самых ценных ресурсов современной экономики." },
      { text: "Platforms are engineered not to inform us, but to keep us scrolling for as long as possible.", translationRu: "Платформы созданы не для того, чтобы информировать нас, а чтобы удерживать нас в ленте как можно дольше." },
      { text: "Critics contend that this design erodes our capacity for sustained, difficult thought.", translationRu: "Критики утверждают, что такой дизайн подрывает нашу способность к длительному, трудному мышлению." },
      { text: "Defenders reply that users are not passive victims and can exercise deliberate restraint.", translationRu: "Защитники отвечают, что пользователи не пассивные жертвы и могут проявлять осознанную сдержанность." },
      { text: "What both sides concede is that attention, once spent, cannot be recovered.", translationRu: "Обе стороны признают одно: потраченное внимание вернуть невозможно." },
    ],
    glossary: {
      commodities: { translation: "товары, ресурсы", partOfSpeech: "noun" },
      engineered: { translation: "сконструированы", partOfSpeech: "verb" },
      contend: { translation: "утверждают", partOfSpeech: "verb" },
      erodes: { translation: "подрывает, размывает", partOfSpeech: "verb" },
      sustained: { translation: "длительный, устойчивый", partOfSpeech: "adjective" },
      deliberate: { translation: "осознанный, намеренный", partOfSpeech: "adjective" },
      restraint: { translation: "сдержанность", partOfSpeech: "noun" },
      concede: { translation: "признают", partOfSpeech: "verb" },
    },
    questions: [
      {
        id: "q1",
        question: "What are platforms primarily engineered to do, according to the text?",
        options: ["Inform users accurately", "Keep users scrolling as long as possible", "Reduce screen time", "Sell physical products"],
        answer: 1,
        explanation: "The text states platforms are engineered to keep us scrolling, not to inform us.",
      },
      {
        id: "q2",
        question: "What is the critics' main concern?",
        options: ["That platforms cost too much money", "That design erodes our capacity for sustained thought", "That users read too slowly", "That there are too few platforms"],
        answer: 1,
        explanation: "Critics contend the design erodes our capacity for sustained, difficult thought.",
      },
      {
        id: "q3",
        question: "What do both sides of the argument agree on?",
        options: ["Attention, once spent, cannot be recovered", "Platforms should be banned", "Users are passive victims", "Technology always improves life"],
        answer: 0,
        explanation: "The final sentence says what both sides concede: spent attention cannot be recovered.",
      },
    ],
  },
];
