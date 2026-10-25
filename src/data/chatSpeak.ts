/**
 * The abbreviations messages are actually made of.
 *
 * These are the one class of word the lookup cannot send to a model and hope.
 * "tq" is two letters that happen to be a word in several languages and a
 * ticker symbol; "np" is a chemical element; "cya" is nothing at all. Asked
 * cold, a model guesses, and a learner who looked up a word in a real message
 * gets a confident wrong answer — which is worse than no answer, because they
 * have no way to tell.
 *
 * There are about forty of them in common use and they do not change quickly,
 * so they are written down. The lookup consults this before anything else,
 * which also means the answer is instant and costs nothing.
 *
 * `note` is what distinguishes these from an ordinary translation: the learner
 * needs to be told not only what it means but that it is chat shorthand, since
 * writing "gtg" to a client is the mistake this whole section exists to
 * prevent.
 */
export interface ChatSpeak {
  /** The Russian meaning. */
  ru: string;
  /** What it stands for, written out. */
  long?: string;
  /** Russian, shown in brackets: what kind of thing this is. */
  note: string;
}

const CHAT = "сокращение в переписке";
const SLANG = "разговорное";

export const chatSpeak: Record<string, ChatSpeak> = {
  tq: { ru: "спасибо", long: "thank you", note: CHAT },
  ty: { ru: "спасибо", long: "thank you", note: CHAT },
  thx: { ru: "спасибо", long: "thanks", note: CHAT },
  thnx: { ru: "спасибо", long: "thanks", note: CHAT },
  tnx: { ru: "спасибо", long: "thanks", note: CHAT },
  tysm: { ru: "огромное спасибо", long: "thank you so much", note: CHAT },
  np: { ru: "не за что", long: "no problem", note: `${CHAT}, ответ на спасибо` },
  yw: { ru: "пожалуйста", long: "you're welcome", note: `${CHAT}, ответ на спасибо` },
  "no worries": { ru: "не за что, пустяки", note: `${SLANG}, ответ на спасибо` },
  anytime: { ru: "обращайся", note: `${SLANG}, ответ на спасибо` },

  brb: { ru: "сейчас вернусь", long: "be right back", note: `${CHAT}, не прощание` },
  gtg: { ru: "мне пора", long: "got to go", note: CHAT },
  g2g: { ru: "мне пора", long: "got to go", note: CHAT },
  ttyl: { ru: "спишемся позже", long: "talk to you later", note: CHAT },
  cya: { ru: "увидимся", long: "see you", note: CHAT },
  "see ya": { ru: "увидимся", note: SLANG },
  laters: { ru: "до скорого", note: SLANG },

  idk: { ru: "не знаю", long: "I don't know", note: CHAT },
  idc: { ru: "мне всё равно", long: "I don't care", note: CHAT },
  imo: { ru: "по-моему", long: "in my opinion", note: CHAT },
  imho: { ru: "на мой скромный взгляд", long: "in my humble opinion", note: CHAT },
  btw: { ru: "кстати", long: "by the way", note: CHAT },
  omw: { ru: "уже еду", long: "on my way", note: CHAT },
  asap: { ru: "как можно скорее", long: "as soon as possible", note: "сокращение, бывает и в деловой переписке" },
  fyi: { ru: "к сведению", long: "for your information", note: "сокращение, бывает и в деловой переписке" },
  tbh: { ru: "честно говоря", long: "to be honest", note: CHAT },
  nvm: { ru: "забудь, неважно", long: "never mind", note: CHAT },
  rn: { ru: "прямо сейчас", long: "right now", note: CHAT },
  ikr: { ru: "вот и я о том же", long: "I know, right?", note: CHAT },
  lmk: { ru: "дай знать", long: "let me know", note: CHAT },
  jk: { ru: "шучу", long: "just kidding", note: CHAT },
  ofc: { ru: "конечно", long: "of course", note: CHAT },
  pls: { ru: "пожалуйста", long: "please", note: CHAT },
  plz: { ru: "пожалуйста", long: "please", note: CHAT },
  sry: { ru: "извини", long: "sorry", note: CHAT },
  wyd: { ru: "чем занят?", long: "what are you doing?", note: CHAT },
  hbu: { ru: "а ты?", long: "how about you?", note: CHAT },
  wbu: { ru: "а ты?", long: "what about you?", note: CHAT },
  lol: { ru: "смешно", long: "laughing out loud", note: CHAT },
  lmao: { ru: "очень смешно", note: `${CHAT}, грубоватое` },
  omg: { ru: "боже мой", long: "oh my god", note: CHAT },
  smh: { ru: "ну что тут скажешь", long: "shaking my head", note: CHAT },
  tldr: { ru: "если коротко", long: "too long; didn't read", note: CHAT },
  afaik: { ru: "насколько я знаю", long: "as far as I know", note: CHAT },
  dm: { ru: "личное сообщение", long: "direct message", note: CHAT },
  irl: { ru: "в реальной жизни", long: "in real life", note: CHAT },
};

/** The entry for what somebody typed, or nothing. */
export function chatSpeakFor(raw: string): ChatSpeak | null {
  const key = raw.trim().toLowerCase().replace(/[^a-z'\s]/g, "").replace(/\s+/g, " ");
  return chatSpeak[key] ?? null;
}
