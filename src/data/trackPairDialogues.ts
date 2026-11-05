import type { LessonSpec } from "./trackModel";

/** Short conversations authored for each two-expression lesson. */
const conversations: Record<string, string[]> = {
  "chat-honesty-pair": [
    "Can you send me yesterday's notes?",
    "Sure. lmk which part you need.",
    "nvm, I found my copy.",
    "Great! Message me if anything is missing."
  ],
  "chat-notes-pair": [
    "Do you know where Sam is?",
    "idk. He hasn't replied.",
    "He's angry that you left early.",
    "idgaf. I needed to go home."
  ],
  "speech-reactions-pair": [
    "Look at this video of my dog stealing my sandwich.",
    "I'm dead. His face is so funny.",
    "It was my only lunch, though.",
    "Bummer. Let's get you something to eat."
  ],
  "chat-basics-pair": [
    "wyd tonight?",
    "Nothing planned. Why?",
    "Come over! btw, I found your charger.",
    "Great, I'll bring some snacks."
  ],
  "speech-agreement-pair": [
    "Dude, are you joining us tonight?",
    "I need to finish my project first.",
    "Fair enough. We can meet tomorrow.",
    "That works for me."
  ],
  "chat-reassurance-pair": [
    "Can you help me carry these boxes?",
    "Say less. I'll be there in five minutes.",
    "Sorry for asking at the last minute.",
    "No biggie. I was nearby anyway."
  ],
  "speech-unfiltered-pair": [
    "Dan told everyone my private news.",
    "He has zero filter.",
    "Then he joked about it in front of my boss.",
    "That was out of pocket."
  ],
  "chat-truth-pair": [
    "I finished the whole project in one night.",
    "Deadass? You must be exhausted.",
    "I am. I haven't slept at all.",
    "Real talk, you need a break before you do anything else."
  ],
  "chat-plans-pair": [
    "I got us tickets to the final.",
    "fr? I thought it was sold out.",
    "It was, but two seats became available. Meet at seven?",
    "Bet. I'll be there."
  ],
  "chat-reactions-pair": [
    "Can you talk rn?",
    "I'm on the bus, but I can text.",
    "This new timetable is impossible to follow.",
    "ikr. I missed my bus twice this week."
  ],
  "speech-complaints-pair": [
    "The app won't accept my password again.",
    "What a pain. Have you tried resetting it?",
    "Yes! I'm so annoyed I want to throw my phone.",
    "Chill out. Let's try it on my laptop."
  ],
  "chat-context-pair": [
    "Have you met Leo irl?",
    "Not yet. We've only talked online.",
    "We're meeting for coffee tomorrow.",
    "ngl, I'm a little nervous for you."
  ],
  "speech-reductions-pair": [
    "What are you gonna do after class?",
    "I'm gonna get something to eat.",
    "Wanna try the new café?",
    "Yes, let's go together."
  ],
  "speech-labels-pair": [
    "My sister fixed the whole robot herself.",
    "She's such a nerd about engineering.",
    "Then she entered it in a national competition.",
    "That's badass. I hope she wins."
  ],
  "chat-boundaries-pair": [
    "You said you were selling your bike.",
    "What are you talking about? I never said that.",
    "Oh, sorry, I confused you with Max. Never mind.",
    "No problem. I'm keeping mine."
  ],
  "speech-insults-pair": [
    "He laughed when I dropped all my books.",
    "That's not cool.",
    "Then he filmed me instead of helping.",
    "What a douchebag. Did anyone else help you?"
  ],
  "chat-anger-pair": [
    "The last train has been cancelled.",
    "Seriously? I just bought a ticket.",
    "The next one is tomorrow morning.",
    "Damn. I'll need to find somewhere to stay."
  ],
  "idiom-confrontation-pair": [
    "The seller says these are the best seats in the house.",
    "I'd take it with a grain of salt.",
    "Why? The photo looks great.",
    "It's a sales pitch. Check the seating plan before you pay."
  ],
  "speech-profanity-pair": [
    "He says he finished twenty reports in one hour.",
    "That doesn't add up. Each one takes at least thirty minutes.",
    "He also says he did it without a computer.",
    "That's bullshit. Ask him to show you the files."
  ],
  "chat-meetups-pair": [
    "Are you still at home?",
    "No, omw!",
    "What's your eta?",
    "About ten minutes. The traffic is moving again."
  ],
  "idiom-introductions-pair": [
    "I never know what to say at parties.",
    "Ask about the music. It helps break the ice.",
    "I tried that with Sam yesterday.",
    "Did you hit it off?",
    "Yes, we talked for hours."
  ],
  "speech-plans-pair": [
    "We're going hiking on Saturday. Want to come?",
    "I'm down. Who else is going?",
    "Mia and Dan. Shall I book you a place in the car?",
    "Yes, count me in."
  ],
  "chat-mistakes-pair": [
    "Can you buy milk on your way home, Dad?",
    "I think this is the wrong chat.",
    "Oops! Sorry. And that last message wasn't finished.",
    "Sent too soon?",
    "Exactly. I'll check before I press send next time."
  ],
  "idiom-setbacks-pair": [
    "Our backup file is broken too.",
    "So we're back to square one?",
    "Yes. We'll need to make the whole presentation again.",
    "We had to learn the hard way. Next time we'll test the backup."
  ],
  "speech-apologies-pair": [
    "These tickets are for Tuesday, not Thursday.",
    "My bad. I selected the wrong date.",
    "Can we change them?",
    "I'll call the venue. That's on me."
  ],
  "chat-availability-pair": [
    "Are you there? I need help with the spreadsheet.",
    "brb, getting a drink.",
    "Okay. I was wondering why you weren't replying.",
    "I was afk for a few minutes. I'm back now."
  ],
  "idiom-workload-pair": [
    "Can you help with one more project?",
    "I'm under the gun to finish this report today.",
    "You have a lot on your plate already.",
    "Exactly. Could we discuss it tomorrow?"
  ],
  "speech-support-pair": [
    "I studied all week and still failed the test.",
    "That sucks. You put so much effort into it.",
    "I feel like giving up.",
    "I feel you. I struggled with that subject too."
  ],
  "chat-opinions-pair": [
    "Is the library open on Sunday?",
    "afaik, yes.",
    "What time does it close?",
    "iirc, at six. Let's check before we go."
  ],
  "idiom-deciding-pair": [
    "Are you going to apply for that course?",
    "I keep sitting on the fence.",
    "You can afford it, and you've wanted to try for years.",
    "You're right. I'll take the plunge and apply today."
  ],
  "speech-refusals-pair": [
    "Want to watch a horror film?",
    "Horror isn't really my thing.",
    "What about joining us for the late screening anyway?",
    "I'll pass tonight, but thanks for asking."
  ],
  "chat-information-pair": [
    "fyi, tomorrow's lesson starts at nine.",
    "Thanks. Where is it?",
    "icymi, the teacher posted the new room number in the group.",
    "Found it. Room 204."
  ],
  "idiom-information-pair": [
    "Everyone seems to know about the plan except me.",
    "We weren't trying to keep you in the dark.",
    "Then spill the beans. What's happening?",
    "We're arranging a surprise party for your brother."
  ],
  "speech-clarification-pair": [
    "The meeting has been pushed back.",
    "Come again? I didn't hear you.",
    "It's been pushed back by an hour.",
    "What do you mean by that? Are we meeting at ten instead of nine?",
    "Exactly."
  ],
  "chat-laughter-pair": [
    "My dad replied to the family photo with a photo of his ceiling.",
    "lol, did he mean to do that?",
    "No. Then he sent another one with just his forehead.",
    "lmao, please tell me you saved it."
  ],
  "idiom-money-pair": [
    "That tiny flat costs an arm and a leg.",
    "I know. The rent is nearly my whole salary.",
    "How do you manage to make ends meet?",
    "I share the rent with a friend and keep a close eye on spending."
  ],
  "speech-contractions-pair": [
    "Can you help me open this jar?",
    "Gimme the jar. I'll try.",
    "Careful, the lid is slippery.",
    "Lemme grab a towel first."
  ],
  "regroup-1-chat": [
    "I've sent you the notes.",
    "tq! That saves me a lot of time.",
    "I added the homework questions too.",
    "thx for your help!"
  ],
  "regroup-1-idiom": [
    "I didn't get the first job I applied for.",
    "That might have been a blessing in disguise.",
    "It was. I found a much better role a week later.",
    "You came out on top in the end."
  ],
  "regroup-1-speech": [
    "He drove six hours just to return a ten-pound shirt.",
    "That's wild. Why didn't he post it back?",
    "He said he wanted to complain in person.",
    "That whole plan sounds unhinged."
  ],
  "regroup-2-chat": [
    "What did you think of the film?",
    "tbh, I found it slow.",
    "Even the ending?",
    "imo, the ending was the best part."
  ],
  "regroup-2-idiom": [
    "I'm thinking of leading three projects at once.",
    "Don't bite off more than you can chew.",
    "Do you think I could manage just one?",
    "I'll go out on a limb and say you'd lead one really well."
  ],
  "regroup-2-speech": [
    "Did you like the show?",
    "Kinda. The first half was good.",
    "Will you watch the next episode?",
    "Dunno. Maybe if I have time."
  ],
  "regroup-3-chat": [
    "Sorry I'm late.",
    "All good. We haven't started yet.",
    "Can I still join your group?",
    "Ofc. There's a seat next to me."
  ],
  "regroup-3-idiom": [
    "I think I got off on the wrong foot with my new teammate.",
    "What happened?",
    "I arrived late and he said, \"Nice of you to join us.\"",
    "Read between the lines. He was annoyed, even though the words sounded polite."
  ],
  "regroup-3-speech": [
    "Want to come out tonight?",
    "Maybe some other time. I need a quiet evening.",
    "You could join us for just an hour.",
    "I'd still rather stay in.",
    "Suit yourself. We'll catch up tomorrow."
  ],
  "regroup-4-chat": [
    "He changed the deadline again.",
    "smh. That's the third time this week.",
    "Now we have to redo the whole schedule.",
    "So frustrating. I'll ask him to confirm it in writing."
  ],
  "regroup-4-idiom": [
    "We need to tighten our belt this month.",
    "Should we buy the cheapest parts for the repair?",
    "Let's not cut corners on safety.",
    "Agreed. We can save money on something less important."
  ],
  "regroup-4-speech": [
    "He's been bitching about the team all morning.",
    "Being frustrated is one thing.",
    "Then he started insulting people's families.",
    "That crosses the line. He needs to stop."
  ],
  "regroup-5-chat": [
    "Who's Robert on the guest list?",
    "Robert, aka Rob. You met him last week.",
    "And what does that long message about dinner say?",
    "tl;dr: we're meeting at seven, not eight."
  ],
  "regroup-5-idiom": [
    "Can we check the plan once more?",
    "Sure. I want us to be on the same page.",
    "So you don't need me to work on Saturday?",
    "No, you're off the hook. We've found another volunteer."
  ],
  "regroup-5-speech": [
    "The website says I won a prize, but I need to pay a fee.",
    "I'm not buying it.",
    "Why not? It looks official.",
    "Walk me through it. What exactly did they ask you to do?"
  ],
  "regroup-6-chat": [
    "Can you check one more thing for me?",
    "gtg, my bus is here.",
    "But I need an answer now. Please, just stay online.",
    "Leave me alone for a minute. I'll reply when I'm home."
  ],
  "regroup-6-idiom": [
    "Are you coming to the party?",
    "I'm a bit under the weather.",
    "Nothing serious, I hope?",
    "Just a cold. I'll lie low and rest this weekend."
  ],
  "regroup-6-speech": [
    "I gotta give a presentation in ten minutes.",
    "You've got this. You've practised all week.",
    "I'm worried I'll forget the opening.",
    "Take a breath and look at your first slide."
  ],
  "regroup-7-chat": [
    "I'll bring the duck to class.",
    "The duck?",
    "Autocorrect strikes again. I meant the book.",
    "I was already looking forward to meeting him.",
    "jk. See you at nine."
  ],
  "regroup-7-idiom": [
    "My audition starts in five minutes.",
    "Break a leg! You've practised so much.",
    "Do you think the last part will be difficult?",
    "For you? It'll be a piece of cake."
  ],
  "regroup-7-speech": [
    "Your presentation was top-notch.",
    "Thanks. Sorry if my question sounded too direct earlier.",
    "No hard feelings. It helped me explain the idea better.",
    "I'm glad. I really liked your examples."
  ],
  "regroup-8-chat": [
    "That was the best concert I've ever been to, no cap.",
    "Same. I could barely speak afterwards.",
    "I still have the songs stuck in my head. hbu?",
    "Me too. I've been listening to the album all morning."
  ],
  "regroup-8-idiom": [
    "The new manager says everything must be done by the book.",
    "Did you hear that from her directly?",
    "No, Dan told me.",
    "Take it with a grain of salt until you've spoken to her."
  ],
  "regroup-8-speech": [
    "The teacher joined the video call with a cat filter.",
    "No way! Did he notice?",
    "He spent five minutes saying he wasn't actually a cat.",
    "I'm dead. That must have been hilarious."
  ]
};

export function pairDialogue(id: string): LessonSpec["lines"] {
  const lines = conversations[id];
  if (!lines) throw new Error(`Missing dialogue for lesson: ${id}`);
  return lines.map((text, index) => ({ text, me: index % 2 === 1, at: `18:0${index}` }));
}
