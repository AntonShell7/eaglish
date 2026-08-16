export interface SlangEntry {
  phrase: string;
  meaning: string;
  example: string;
  category: "Idiom" | "Slang" | "Abbreviation";
}

export const everydayEnglish: SlangEntry[] = [
  {
    phrase: "Break the ice",
    meaning: "To do or say something that makes people feel more relaxed in a new situation.",
    example: "She told a joke to break the ice before the meeting.",
    category: "Idiom",
  },
  {
    phrase: "Hit the books",
    meaning: "To start studying, usually seriously.",
    example: "I have a test tomorrow, so I need to hit the books tonight.",
    category: "Idiom",
  },
  {
    phrase: "It's a piece of cake",
    meaning: "Something that is very easy to do.",
    example: "Don't worry about the exam — it's a piece of cake.",
    category: "Idiom",
  },
  {
    phrase: "Low-key",
    meaning: "Slightly, or without wanting to admit it too openly.",
    example: "I'm low-key excited about this weekend.",
    category: "Slang",
  },
  {
    phrase: "No cap",
    meaning: "Used to say you are being completely honest.",
    example: "That movie was actually amazing, no cap.",
    category: "Slang",
  },
  {
    phrase: "Ghost someone",
    meaning: "To suddenly stop replying to someone without explanation.",
    example: "He just ghosted me after our last conversation.",
    category: "Slang",
  },
  {
    phrase: "IMO",
    meaning: "In My Opinion — used when sharing a personal view.",
    example: "IMO, the book was better than the movie.",
    category: "Abbreviation",
  },
  {
    phrase: "BRB",
    meaning: "Be Right Back — used to say you'll return shortly.",
    example: "BRB, someone's at the door.",
    category: "Abbreviation",
  },
  {
    phrase: "Once in a blue moon",
    meaning: "Something that happens very rarely.",
    example: "We only meet up once in a blue moon these days.",
    category: "Idiom",
  },
  {
    phrase: "My bad",
    meaning: "A casual way of admitting you made a mistake.",
    example: "Oh, my bad — I sent that to the wrong person.",
    category: "Slang",
  },
];
