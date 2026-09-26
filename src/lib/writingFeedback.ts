import { askModel } from "./aiClient";
export interface WritingScores {
  grammar: number;
  vocabulary: number;
  coherence: number;
  overall: number;
}

export interface WritingFeedbackResult {
  scores: WritingScores;
  summary: string;
  tips: string[];
  isLive: boolean;
}

/**
 * The provider retired llama-3.3 without warning, and this file kept asking
 * for it: every request came back 404, the catch below swallowed it, and
 * writing feedback had been silently serving the demo scorer to everyone.
 * Naming no model at all is the fix — the endpoint picks its own default, so
 * the next retirement cannot break this the same way.
 */
const GROQ_MODEL = undefined;

/**
 * Real feedback through the server endpoint when the deployment has a key.
 * Falls back to a clearly-labelled demo scorer based on simple text statistics
 * otherwise — it never pretends the demo score is a real assessment.
 */
export async function getWritingFeedback(text: string): Promise<WritingFeedbackResult> {
  try {
    return await callLiveFeedback(text);
  } catch (err) {
    console.error("writing feedback failed", err);
    return mockFeedback(text);
  }
}

function mockFeedback(text: string): WritingFeedbackResult {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgWordsPerSentence = sentences.length ? words.length / sentences.length : 0;

  const lengthScore = Math.min(10, Math.round((words.length / 60) * 10));
  const varietyScore = Math.min(10, Math.max(3, Math.round(avgWordsPerSentence)));

  const scores: WritingScores = {
    grammar: Math.max(4, Math.min(9, varietyScore)),
    vocabulary: Math.max(4, Math.min(9, lengthScore)),
    coherence: Math.max(4, Math.min(9, Math.round((lengthScore + varietyScore) / 2))),
    overall: 0,
  };
  scores.overall = Math.round((scores.grammar + scores.vocabulary + scores.coherence) / 3);

  return {
    scores,
    summary:
      "Demo mode: this is a placeholder based on simple text statistics, not real grammar analysis. Connect a free Groq API key for genuine feedback.",
    tips: [
      "Try to vary your sentence length — mix short and longer sentences.",
      "Check subject-verb agreement in longer sentences.",
      "Add one specific example to support your main point.",
    ],
    isLive: false,
  };
}

async function callLiveFeedback(text: string): Promise<WritingFeedbackResult> {
  const content = await askModel({
    model: GROQ_MODEL,
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'You are a supportive but honest English writing tutor. Assess the student\'s text on a 1-10 scale for grammar, vocabulary and coherence, then set "overall" as their rounded average. Score honestly against the rubric — do not inflate scores artificially. Give 2-3 concrete, actionable tips referencing the actual text. Respond with strict JSON only, no markdown fences, in exactly this shape: {"grammar": number, "vocabulary": number, "coherence": number, "overall": number, "summary": string, "tips": string[]}',
      },
      { role: "user", content: text },
    ],
  });

  const parsed = JSON.parse(content || "{}");

  return {
    scores: {
      grammar: parsed.grammar,
      vocabulary: parsed.vocabulary,
      coherence: parsed.coherence,
      overall: parsed.overall,
    },
    summary: parsed.summary ?? "",
    tips: parsed.tips ?? [],
    isLive: true,
  };
}
