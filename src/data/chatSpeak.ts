import { isArabic, localize, localizeTemplate } from "@/i18n/content";
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

const CHAT = localize("сокращение в переписке");
const SLANG = localize("разговорное");

export const chatSpeak: Record<string, ChatSpeak> = {
  tq: { ru: localize("спасибо"), long: "thank you", note: CHAT },
  ty: { ru: localize("спасибо"), long: "thank you", note: CHAT },
  thx: { ru: localize("спасибо"), long: "thanks", note: CHAT },
  thnx: { ru: localize("спасибо"), long: "thanks", note: CHAT },
  tnx: { ru: localize("спасибо"), long: "thanks", note: CHAT },
  tysm: { ru: localize("огромное спасибо"), long: "thank you so much", note: CHAT },
  np: { ru: localize("не за что"), long: "no problem", note: localizeTemplate("{{p0}}, ответ на спасибо", [CHAT]) },
  yw: { ru: isArabic() ? "على الرحب والسعة" : localize("пожалуйста"), long: "you're welcome", note: localizeTemplate("{{p0}}, ответ на спасибо", [CHAT]) },
  "no worries": { ru: localize("не за что, пустяки"), note: localizeTemplate("{{p0}}, ответ на спасибо", [SLANG]) },
  anytime: { ru: localize("обращайся"), note: localizeTemplate("{{p0}}, ответ на спасибо", [SLANG]) },

  brb: { ru: localize("сейчас вернусь"), long: "be right back", note: localizeTemplate("{{p0}}, не прощание", [CHAT]) },
  gtg: { ru: localize("мне пора"), long: "got to go", note: CHAT },
  g2g: { ru: localize("мне пора"), long: "got to go", note: CHAT },
  ttyl: { ru: localize("спишемся позже"), long: "talk to you later", note: CHAT },
  cya: { ru: localize("увидимся"), long: "see you", note: CHAT },
  "see ya": { ru: localize("увидимся"), note: SLANG },
  laters: { ru: localize("до скорого"), note: SLANG },

  idk: { ru: localize("не знаю"), long: "I don't know", note: CHAT },
  idc: { ru: localize("мне всё равно"), long: "I don't care", note: CHAT },
  imo: { ru: localize("по-моему"), long: "in my opinion", note: CHAT },
  imho: { ru: localize("на мой скромный взгляд"), long: "in my humble opinion", note: CHAT },
  btw: { ru: localize("кстати"), long: "by the way", note: CHAT },
  omw: { ru: localize("уже еду"), long: "on my way", note: CHAT },
  asap: { ru: localize("как можно скорее"), long: "as soon as possible", note: localize("сокращение, бывает и в деловой переписке") },
  fyi: { ru: localize("к сведению"), long: "for your information", note: localize("сокращение, бывает и в деловой переписке") },
  tbh: { ru: localize("честно говоря"), long: "to be honest", note: CHAT },
  nvm: { ru: localize("забудь, неважно"), long: "never mind", note: CHAT },
  rn: { ru: localize("прямо сейчас"), long: "right now", note: CHAT },
  ikr: { ru: localize("вот и я о том же"), long: "I know, right?", note: CHAT },
  lmk: { ru: localize("дай знать"), long: "let me know", note: CHAT },
  jk: { ru: localize("шучу"), long: "just kidding", note: CHAT },
  ofc: { ru: localize("конечно"), long: "of course", note: CHAT },
  pls: { ru: isArabic() ? "من فضلك" : localize("пожалуйста"), long: "please", note: CHAT },
  plz: { ru: isArabic() ? "من فضلك" : localize("пожалуйста"), long: "please", note: CHAT },
  sry: { ru: localize("извини"), long: "sorry", note: CHAT },
  wyd: { ru: localize("чем занят?"), long: "what are you doing?", note: CHAT },
  hbu: { ru: localize("а ты?"), long: "how about you?", note: CHAT },
  wbu: { ru: localize("а ты?"), long: "what about you?", note: CHAT },
  lol: { ru: localize("смешно"), long: "laughing out loud", note: CHAT },
  lmao: { ru: localize("очень смешно"), note: localizeTemplate("{{p0}}, грубоватое", [CHAT]) },
  omg: { ru: localize("боже мой"), long: "oh my god", note: CHAT },
  smh: { ru: localize("ну что тут скажешь"), long: "shaking my head", note: CHAT },
  tldr: { ru: localize("если коротко"), long: "too long; didn't read", note: CHAT },
  afaik: { ru: localize("насколько я знаю"), long: "as far as I know", note: CHAT },
  dm: { ru: localize("личное сообщение"), long: "direct message", note: CHAT },
  irl: { ru: localize("в реальной жизни"), long: "in real life", note: CHAT },
};

/** The entry for what somebody typed, or nothing. */
export function chatSpeakFor(raw: string): ChatSpeak | null {
  const key = raw.trim().toLowerCase().replace(/[^a-z'\s]/g, "").replace(/\s+/g, " ");
  return chatSpeak[key] ?? null;
}
