export interface WritingTopic {
  id: string;
  title: string;
  format: "Email" | "Essay" | "Review" | "Story";
  level: "A2-B1" | "B1-B2" | "B2-C1";
  prompt: string;
  minWords: number;
  maxWords: number;
  /** Step-by-step shape of this kind of text: what goes in each part. */
  structure: { heading: string; detail: string }[];
  /** Ready-made phrases the learner can lean on. */
  phrases: string[];
  /** A full worked example, hidden until the learner asks for it. */
  sample: string;
}

export const writingTopics: WritingTopic[] = [
  {
    id: "weekend-trip-email",
    title: "Invite a friend on a trip",
    format: "Email",
    level: "A2-B1",
    prompt:
      "Write a short email to a friend inviting them to join you on a weekend trip. Mention where you want to go, when, and why you think they'll enjoy it.",
    minWords: 60,
    maxWords: 120,
    structure: [
      { heading: "Greeting", detail: "Start informally: Hi Sam, / Hey Anna, — a friend's email never opens with Dear Sir." },
      { heading: "Opening line", detail: "One friendly sentence before the point: ask how they are, or mention something recent." },
      { heading: "The invitation", detail: "Say clearly what you're proposing, where and when. Don't bury it — friends skim." },
      { heading: "Why they'll enjoy it", detail: "Give one or two concrete reasons tied to that person: something they like." },
      { heading: "Call to action", detail: "Ask a direct question so they know what to reply: Can you make it? Let me know by Friday." },
      { heading: "Sign-off", detail: "Informal close: See you soon, / Take care, + your name." },
    ],
    phrases: [
      "How have you been?",
      "I was wondering if you'd like to…",
      "Are you free on the weekend of…?",
      "I think you'd really enjoy it because…",
      "Let me know what you think.",
      "Hope to hear from you soon!",
    ],
    sample:
      "Hi Sam,\n\nHow have you been? It feels like ages since we last met up.\n\nI'm planning a trip to the lake next weekend, from Friday evening to Sunday, and I was wondering if you'd like to come along. My uncle has a small cabin there, so we wouldn't have to pay for a place to stay.\n\nI think you'd really enjoy it — you're always saying you want to get out of the city, and the water is perfect for swimming in September. We could also do the forest walk you mentioned last summer.\n\nLet me know by Wednesday so I can book the train tickets. Hope you can make it!\n\nTake care,\nAlex",
  },
  {
    id: "technology-essay",
    title: "A technology that changed your life",
    format: "Essay",
    level: "B1-B2",
    prompt:
      "Describe one piece of technology that changed your daily life. Explain what it does and why it matters to you, with a specific example.",
    minWords: 120,
    maxWords: 220,
    structure: [
      { heading: "Introduction", detail: "Name the technology and state your main point in one sentence — the reader should know your position immediately." },
      { heading: "What it does", detail: "Explain it plainly, as if to someone who has never used it. Avoid listing features." },
      { heading: "A specific example", detail: "One real moment where it mattered. Specifics are what make an essay convincing." },
      { heading: "Why it matters", detail: "Move from your example to the wider point: what changed for you, and what that suggests." },
      { heading: "Conclusion", detail: "One or two sentences. Don't repeat the intro word for word — add a small final thought." },
    ],
    phrases: [
      "The technology that changed my life most is…",
      "In simple terms, it allows you to…",
      "For example, last year I…",
      "What struck me was…",
      "This matters because…",
      "Looking back, I realise that…",
    ],
    sample:
      "The technology that changed my daily life most is the offline translation app on my phone. In simple terms, it lets you point your camera at any text and read it in your own language, without an internet connection.\n\nFor example, last summer I travelled alone for the first time and got lost in a small town where almost no one spoke English. The station signs were meaningless to me. I used the app on a timetable board and, within a few seconds, understood which platform I needed. What struck me was not the technology itself but how quickly my panic disappeared.\n\nThis matters because independence, for me, has always depended on language. Before, I avoided travelling anywhere I could not read. Now I plan trips without that fear, and I have started learning the languages I once found intimidating.\n\nLooking back, I realise the app did not just translate words — it removed a limit I had quietly accepted for years.",
  },
  {
    id: "complaint-email",
    title: "Write a polite complaint",
    format: "Email",
    level: "B1-B2",
    prompt:
      "You bought something online and it arrived damaged. Write a polite but firm email to the shop explaining the problem and what you want them to do.",
    minWords: 90,
    maxWords: 160,
    structure: [
      { heading: "Formal greeting", detail: "Dear Sir or Madam, — or the person's name if you know it. Never Hi there in a complaint." },
      { heading: "Reason for writing", detail: "State it in the first line: I am writing to complain about… Business readers want the point fast." },
      { heading: "The facts", detail: "Order number, date, what arrived. Keep it neutral — facts persuade more than anger." },
      { heading: "The problem", detail: "Describe the damage clearly and specifically." },
      { heading: "What you want", detail: "Be explicit: a refund, a replacement, or a repair. A complaint without a request is just a story." },
      { heading: "Formal close", detail: "I look forward to your reply. + Yours faithfully / Yours sincerely." },
    ],
    phrases: [
      "I am writing to complain about…",
      "I ordered … on … (order number …).",
      "Unfortunately, when the item arrived…",
      "I would therefore like to request…",
      "I trust you will resolve this matter promptly.",
      "I look forward to your reply.",
    ],
    sample:
      "Dear Sir or Madam,\n\nI am writing to complain about an order I received from your online shop this week.\n\nOn 3 August I ordered a pair of desk speakers (order number 48219). The parcel arrived on 9 August, but when I opened it, the casing of the left speaker was cracked and the fabric cover had come away from the frame. The outer box showed no damage, so the item appears to have been faulty or badly packed before dispatch.\n\nI have attached photographs showing the damage clearly.\n\nI would therefore like to request a replacement, or a full refund if the item is out of stock. I have kept the original packaging and can return the speakers whenever it suits you.\n\nI trust you will resolve this matter promptly. I look forward to your reply.\n\nYours faithfully,\nAnton Sheludko",
  },
  {
    id: "place-review",
    title: "Review a place you visited",
    format: "Review",
    level: "B1-B2",
    prompt:
      "Write a review of a café, restaurant or place you have visited. Say what was good, what was not, and who you would recommend it to.",
    minWords: 90,
    maxWords: 170,
    structure: [
      { heading: "Set the scene", detail: "Where, when and why you went. One or two sentences." },
      { heading: "What was good", detail: "Be specific — the coffee, the light, the staff. Amazing on its own tells the reader nothing." },
      { heading: "What was not", detail: "A review with no criticism reads as fake. Name one honest weakness." },
      { heading: "Recommendation", detail: "Say who it suits: students, families, someone who needs to work quietly." },
    ],
    phrases: [
      "I visited … last …",
      "What impressed me most was…",
      "On the downside, …",
      "It's worth mentioning that…",
      "I'd recommend it to anyone who…",
      "Overall, it's well worth a visit.",
    ],
    sample:
      "I visited Kestrel Coffee, a small café near the river, on a rainy Saturday afternoon when I needed somewhere quiet to study.\n\nWhat impressed me most was the atmosphere. The tables are wide enough for a laptop and notebooks, every seat has a socket, and the staff never once made me feel rushed even though I stayed for three hours. The filter coffee was excellent — bright and not bitter — and at half the price of the chain cafés on the main street.\n\nOn the downside, the food menu is very limited: two sandwiches and a soup, and the soup had run out by two o'clock. The music was also a little loud for a place that clearly attracts students.\n\nI'd recommend it to anyone who needs to work for a few hours without being pushed out the door. If you're looking for a proper lunch, though, eat first and come here afterwards.\n\nOverall, it's well worth a visit.",
  },
];
