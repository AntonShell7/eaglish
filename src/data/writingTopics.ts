/** What the piece is for — the axis the writing hub is organised by. */
export type WritingCategory = "exam" | "work" | "study" | "life";

export interface WritingTopic {
  id: string;
  title: string;
  format: "Email" | "Letter" | "Essay" | "Review" | "Story" | "Summary";
  category: WritingCategory;
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
    category: "life",
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
    category: "study",
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
    category: "work",
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
    category: "life",
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

  /* ── Exams ──────────────────────────────────────────────────────────── */
  {
    id: "opinion-essay-automation",
    title: "Opinion essay: automation and jobs",
    category: "exam",
    format: "Essay",
    level: "B2-C1",
    prompt:
      "Some people believe automation will create more jobs than it destroys. To what extent do you agree? Give reasons and examples. Write in the style of an exam opinion essay.",
    minWords: 220,
    maxWords: 300,
    structure: [
      { heading: "Position", detail: "State your answer in the first two sentences. Examiners look for a clear stance, not suspense." },
      { heading: "Strongest argument", detail: "One paragraph, one idea, developed: claim → why → concrete example." },
      { heading: "Second argument", detail: "A different angle, not a restatement. Economic, social, personal — pick a new axis." },
      { heading: "Concession", detail: "Name the best counter-argument and answer it. This is what separates a 7 from a 6." },
      { heading: "Conclusion", detail: "Restate the position in new words and add the consequence. Never introduce a new argument here." },
    ],
    phrases: [
      "While it is true that…, the more important point is…",
      "This argument rests on the assumption that…",
      "A clear example of this is…",
      "Critics would counter that…",
      "On balance, the evidence suggests…",
    ],
    sample:
      "Automation is often presented as a straightforward threat to employment, but the historical record is more ambiguous. In my view, it does create new work, though rarely for the people whose jobs disappear first.\n\nThe strongest argument for optimism is that automation lowers costs and therefore expands demand. When cash machines spread in the 1980s, the number of bank branches actually grew, because branches became cheaper to run and banks used tellers for advice rather than transactions. New roles appeared where nobody had planned them.\n\nHowever, the distribution matters more than the total. A warehouse worker replaced by a sorting system does not become a robotics technician; the new jobs demand qualifications that take years to obtain, and often exist in different cities. The aggregate figure hides that displacement entirely.\n\nCritics would counter that retraining programmes solve this, and in some countries they partly do. But their success depends on public investment that is usually announced after the jobs have already gone.\n\nOn balance, automation is likely to leave the labour market larger and less forgiving at the same time — which is why the policy question is not how many jobs, but whose.",
  },
  {
    id: "discussion-essay-tuition",
    title: "Both sides: free university tuition",
    category: "exam",
    format: "Essay",
    level: "B2-C1",
    prompt:
      "Discuss the advantages and disadvantages of making university education free for all students, then give your own view.",
    minWords: 220,
    maxWords: 300,
    structure: [
      { heading: "Frame the debate", detail: "One sentence on why the question is contested. No dictionary definitions." },
      { heading: "Advantages", detail: "Two linked benefits, each with a mechanism: not just 'fairer', but fairer how." },
      { heading: "Disadvantages", detail: "Give the opposing case its full strength. A weak straw man costs marks." },
      { heading: "Your view", detail: "Say what you actually think and what would change your mind." },
      { heading: "Conclusion", detail: "The trade-off in one sentence, plus the condition under which it works." },
    ],
    phrases: [
      "The case for… rests on two claims.",
      "The most obvious benefit is…, since…",
      "Set against this is the fact that…",
      "It is worth distinguishing between… and…",
      "My own view is that…, provided that…",
    ],
    sample:
      "Free tuition is one of those policies that sounds unarguable until the funding question arrives, which is why it remains contested in almost every country that has tried it.\n\nThe clearest advantage is access. When fees disappear, students from low-income families stop calculating whether a degree is worth a decade of debt, and the applicant pool widens. A second benefit is mobility: countries with free higher education tend to see graduates choose lower-paid public-sector work — teaching, medicine in rural areas — because their choices are not dictated by repayments.\n\nSet against this is cost. Free tuition is funded from general taxation, which means people who never attend university subsidise those who do, and graduates on average earn more. There is also a quality risk: when funding per student is capped politically, institutions respond by enlarging seminar groups.\n\nMy own view is that tuition should be free, provided the funding is tied to student numbers rather than fixed in advance. Otherwise access improves while the education itself quietly degrades.\n\nThe trade-off, then, is not fairness against cost but access against quality — and only stable funding keeps both.",
  },
  {
    id: "formal-request-letter",
    title: "Formal letter: request information",
    category: "exam",
    format: "Letter",
    level: "B1-B2",
    prompt:
      "Write a formal letter to a language school asking for information about their summer courses: dates, price, accommodation and what level the classes assume.",
    minWords: 120,
    maxWords: 180,
    structure: [
      { heading: "Salutation", detail: "Dear Sir or Madam, if you have no name. Never 'Hello' in a formal letter." },
      { heading: "Reason for writing", detail: "First sentence states the purpose: I am writing to enquire about…" },
      { heading: "Your questions", detail: "Group them logically, one per sentence. Numbered lists are fine and easy to answer." },
      { heading: "Any relevant detail", detail: "Give the information they will need to answer you: your level, dates, situation." },
      { heading: "Close", detail: "I look forward to hearing from you. Yours faithfully, + full name." },
    ],
    phrases: [
      "I am writing to enquire about…",
      "I would be grateful if you could tell me…",
      "Could you also confirm whether…",
      "Please could you send me details of…",
      "I look forward to hearing from you.",
    ],
    sample:
      "Dear Sir or Madam,\n\nI am writing to enquire about the summer English courses advertised on your website for July and August.\n\nI would be grateful if you could tell me the exact start and end dates of the four-week course, and whether places are still available for July. Could you also confirm the total fee, and whether it includes course materials?\n\nI would like to ask about accommodation as well. If homestay places are offered, please could you send me details of the cost per week and how far the host families usually live from the school.\n\nFinally, I would appreciate information about the level required. I have recently been assessed at B1 and would like to know which class this would place me in.\n\nI look forward to hearing from you.\n\nYours faithfully,\nAnton Sheludko",
  },

  /* ── Work ───────────────────────────────────────────────────────────── */
  {
    id: "application-email",
    title: "Apply for a job or internship",
    category: "work",
    format: "Email",
    level: "B1-B2",
    prompt:
      "Write an email applying for an internship you saw advertised. Say what you are applying for, why you are a good fit, and what you are attaching.",
    minWords: 120,
    maxWords: 200,
    structure: [
      { heading: "Subject line", detail: "Name the role and your name. 'Application: Marketing Intern — Anna Petrova'." },
      { heading: "Opening", detail: "State the role and where you saw it in one sentence. Recruiters read dozens of these." },
      { heading: "Why you", detail: "Two or three concrete claims with evidence. 'I built X, which did Y' beats 'I am motivated'." },
      { heading: "Why them", detail: "One specific reason it is this company. Anything reusable across applications is wasted." },
      { heading: "Close", detail: "Say what is attached and offer availability. Keep it short and confident." },
    ],
    phrases: [
      "I am writing to apply for the position of…",
      "I came across the advertisement on…",
      "Over the past year I have…",
      "What draws me to your team specifically is…",
      "I have attached my CV and would be glad to…",
    ],
    sample:
      "Subject: Application: Data Analyst Intern — Anton Sheludko\n\nDear Ms Ivanova,\n\nI am writing to apply for the Data Analyst Internship advertised on your careers page last week.\n\nI am in my final year of school and have spent the past year building a web application that tracks reading progress for language learners. I designed the database, wrote the analytics that turn daily activity into progress charts, and now have around forty regular users. Working on it taught me more about cleaning messy data than any course did.\n\nWhat draws me to your team specifically is your public work on education analytics — the report you published in March on drop-off rates was the reason I changed how my own app measures progress.\n\nI have attached my CV and a link to the project. I would be glad to talk through any part of it, and I am available for interviews any weekday after 3 p.m.\n\nThank you for your time.\n\nBest regards,\nAnton Sheludko",
  },
  {
    id: "meeting-followup",
    title: "Follow up after a meeting",
    category: "work",
    format: "Email",
    level: "B1-B2",
    prompt:
      "Write a follow-up email after a meeting: summarise what was agreed, list who does what by when, and flag one open question.",
    minWords: 90,
    maxWords: 160,
    structure: [
      { heading: "Thank and anchor", detail: "One line: thanks, and which meeting you mean. Date and topic, so it is searchable." },
      { heading: "What was agreed", detail: "Short bullets. Write decisions, not discussion — nobody rereads the debate." },
      { heading: "Actions", detail: "Name, task, date. Every line answers 'who does what by when'." },
      { heading: "Open question", detail: "Flag the one thing still undecided, and say who should decide it." },
      { heading: "Close", detail: "Invite corrections: a follow-up that can be corrected becomes the record." },
    ],
    phrases: [
      "Thank you for your time this morning.",
      "To summarise what we agreed:",
      "Action points:",
      "One question remains open:",
      "Please let me know if I have missed anything.",
    ],
    sample:
      "Subject: Summary — pricing review, 14 May\n\nHi both,\n\nThank you for your time this morning. To summarise what we agreed:\n\n- The student plan stays free, with a limit of five saved texts per week.\n- The paid tier launches at the start of next term, not before.\n- We will not run a discount campaign in the first month.\n\nAction points:\n- Marta: draft the pricing page copy by Friday 17 May.\n- Anton: add the weekly limit to the app and confirm it works on mobile by Tuesday.\n- Ivan: confirm payment provider fees before the next call.\n\nOne question remains open: whether the paid tier includes the writing assessment or charges per submission. Ivan, could you decide this before Thursday so the copy can be finished?\n\nPlease let me know if I have missed anything.\n\nBest,\nAnton",
  },
  {
    id: "decline-request",
    title: "Say no to a request — politely",
    category: "work",
    format: "Email",
    level: "B2-C1",
    prompt:
      "A colleague asks you to take on extra work you have no capacity for. Write an email that declines clearly, explains briefly, and offers a realistic alternative.",
    minWords: 90,
    maxWords: 160,
    structure: [
      { heading: "Acknowledge", detail: "Show you understood the request. Restating it proves you are not dismissing them." },
      { heading: "Decline", detail: "Say no in one unambiguous sentence, early. A no buried at the end reads as a maybe." },
      { heading: "Reason", detail: "One line, factual, no apology spiral. 'I have two deadlines this week' is enough." },
      { heading: "Alternative", detail: "Offer the version you can do: later, smaller, or a different person. This is what keeps goodwill." },
      { heading: "Close", detail: "Warm, brief, no over-apologising — that reads as guilt rather than professionalism." },
    ],
    phrases: [
      "Thanks for thinking of me for this.",
      "I'm not going to be able to take this on.",
      "My week is committed to…",
      "What I could do instead is…",
      "Happy to revisit this after…",
    ],
    sample:
      "Subject: Re: cover for the Thursday workshop\n\nHi Daniel,\n\nThanks for thinking of me for the workshop — I can see why you need someone who already knows the material.\n\nI'm not going to be able to take it on this week. My time until Friday is committed to the release, and running a two-hour session would mean missing that deadline rather than moving it.\n\nWhat I could do instead is send you my slides and the exercise sheet this afternoon, so whoever runs it does not start from nothing. If the session can move to the following week, I would be glad to lead it myself.\n\nHappy to revisit this once the release is out.\n\nBest,\nAnton",
  },

  /* ── Study ──────────────────────────────────────────────────────────── */
  {
    id: "motivation-letter",
    title: "Motivation letter for a programme",
    category: "study",
    format: "Letter",
    level: "B2-C1",
    prompt:
      "Write a motivation letter for a university programme or scholarship: why this field, what you have already done about it, and why this programme specifically.",
    minWords: 200,
    maxWords: 300,
    structure: [
      { heading: "The hook", detail: "One concrete moment, not a grand claim. 'I have always loved science' says nothing about you." },
      { heading: "Evidence", detail: "What you actually did: built, ran, organised, measured. Interest without action is unpersuasive." },
      { heading: "Why this programme", detail: "Name courses, people or facilities. Anything you could paste into another application is dead weight." },
      { heading: "What you bring", detail: "Be specific and modest: a skill, a perspective, a project you would continue there." },
      { heading: "Close", detail: "State what you intend to do afterwards. Committees fund trajectories, not enthusiasm." },
    ],
    phrases: [
      "My interest in… began with a specific problem:",
      "Over the past two years I have…",
      "What makes your programme the right place for this is…",
      "I would bring…",
      "After the programme I intend to…",
    ],
    sample:
      "My interest in language technology began with a practical problem: my classmates and I were learning English from word lists that we forgot within a week. Instead of accepting that, I started building a web application that takes vocabulary out of real texts and schedules reviews using spaced repetition.\n\nOver the past year I have designed the data model, implemented the review algorithm, and worked with about forty users from my school. The most useful lesson was uncomfortable: my first version counted page visits as progress, which flattered everyone and taught nobody. Rebuilding it around finished tasks forced me to think carefully about what evidence of learning actually is.\n\nWhat makes your programme the right place for this is the second-year module on educational data mining and Professor Larsen's work on retention modelling. My scheduling algorithm is currently a simplified SM-2; I would like to learn how such models are evaluated properly rather than by intuition.\n\nI would bring practical engineering experience and a project that is already in real use, with the data to study it.\n\nAfter the programme I intend to keep working on assessment tools for independent learners, ideally in research alongside a product.",
  },
  {
    id: "article-summary",
    title: "Summarise an article in your own words",
    category: "study",
    format: "Summary",
    level: "B1-B2",
    prompt:
      "Pick any article you have read recently and summarise it: the main claim, the evidence given, and one limitation. Do not copy phrases from the original.",
    minWords: 120,
    maxWords: 200,
    structure: [
      { heading: "Source and claim", detail: "One sentence: what it is, and the single main argument. If you cannot name it, reread." },
      { heading: "Supporting evidence", detail: "The two or three things the author uses to convince. Compress, don't retell in order." },
      { heading: "Limitation", detail: "Where the argument is weak or the evidence thin. Summary plus judgement is what a seminar wants." },
      { heading: "Your one-line takeaway", detail: "What a reader should keep if they remember nothing else." },
    ],
    phrases: [
      "The article argues that…",
      "The author supports this with…",
      "A key piece of evidence is…",
      "The weakness of this argument is that…",
      "The central takeaway is…",
    ],
    sample:
      "The article argues that short daily study sessions are more effective for long-term memory than the same total time in a single sitting.\n\nThe author supports this with two lines of evidence. The first is a set of laboratory experiments in which participants who reviewed material across several days recalled substantially more after a month than those who studied it in one block. The second is classroom data showing the same pattern for vocabulary, where spacing improved retention even when the total time was held constant.\n\nThe weakness of this argument is that most of the studies measured recall of isolated items — word pairs and definitions — rather than the ability to use language in conversation. It is not obvious that the effect transfers equally to skills that require fluency rather than retrieval.\n\nThe central takeaway is that when you study matters as much as how long, and that any schedule which distributes practice is probably better than one that concentrates it.",
  },

  /* ── Everyday life ──────────────────────────────────────────────────── */
  {
    id: "turning-point-story",
    title: "A short story: the day something changed",
    category: "life",
    format: "Story",
    level: "B1-B2",
    prompt:
      "Write a short story about a day when something changed for you or your character. Use past tenses, and end on a moment rather than a moral.",
    minWords: 150,
    maxWords: 250,
    structure: [
      { heading: "Open in motion", detail: "Start inside the scene, not with the weather or the date. Something is already happening." },
      { heading: "Ordinary before", detail: "Two or three details of how things were, so the change has something to push against." },
      { heading: "The turn", detail: "The moment itself. Slow down here: this is the sentence the story exists for." },
      { heading: "After", detail: "One short paragraph on what was different. Show it in a detail, don't announce it." },
      { heading: "Last line", detail: "End on an image or a line of speech. Resist explaining what it meant." },
    ],
    phrases: [
      "I had been… for weeks when…",
      "It was the kind of day that…",
      "At first I didn't notice…",
      "Something in her voice made me…",
      "Afterwards, everything looked slightly…",
    ],
    sample:
      "I had been avoiding the phone all morning when it finally rang. My mother was in the kitchen, pretending not to listen, turning the same page of her newspaper for the third time.\n\nFor two months my life had run on a narrow track: school, the library, the same bus at six, exam papers spread across the table until midnight. I had stopped answering my friends' messages. It seemed reasonable at the time.\n\nThe woman on the phone spoke slowly, as if she had done this many times, and asked me to confirm my name twice before she read out the result. At first I didn't understand that she had already told me I had passed. I asked her to repeat it. She laughed and said congratulations, and then, gently, that she had eleven more calls to make.\n\nAfterwards the kitchen looked slightly unfamiliar, the way rooms do when you come back from a long trip. My mother had not turned the page.\n\n\"Well?\" she said, without looking up.",
  },
  {
    id: "apology-message",
    title: "Apologise and fix it",
    category: "life",
    format: "Email",
    level: "A2-B1",
    prompt:
      "You missed something important — a friend's event, a deadline, a promise. Write a message that apologises without excuses and proposes how to make up for it.",
    minWords: 60,
    maxWords: 120,
    structure: [
      { heading: "Say sorry first", detail: "Lead with the apology, not the explanation. Reasons before 'sorry' read as excuses." },
      { heading: "Name what you did", detail: "Be specific: 'I missed your birthday dinner', not 'about yesterday'." },
      { heading: "Short reason", detail: "One sentence maximum, and no self-pity. Long explanations shift the focus to you." },
      { heading: "Repair", detail: "Offer something concrete: a new date, a fix, an action. This is the part that counts." },
      { heading: "Warm close", detail: "Friendly and brief. Don't ask for forgiveness twice." },
    ],
    phrases: [
      "I'm really sorry about…",
      "I should have told you earlier that…",
      "There's no good excuse — I…",
      "Can I make it up to you by…?",
      "Let me know if that works.",
    ],
    sample:
      "Hi Nina,\n\nI'm really sorry about last night. I missed your birthday dinner, and I know you had booked the table weeks ago.\n\nThere's no good excuse. I lost track of time finishing a project and only saw your messages after eleven. I should have set an alarm the moment you sent the invitation.\n\nCan I make it up to you? I'd like to take you for dinner on Saturday, anywhere you choose, and I'll book it myself this time. I also have your present sitting on my desk, unwrapped since Tuesday.\n\nLet me know if Saturday works.\n\nSorry again — and happy birthday.\n\nAnton",
  },
];
