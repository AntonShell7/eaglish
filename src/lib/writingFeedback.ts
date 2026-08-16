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

const GROQ_MODEL = "llama-3.3-70b-versatile";

/**
 * Real feedback via Groq once VITE_GROQ_API_KEY is set. Falls back to a
 * clearly-labelled demo scorer based on simple text statistics otherwise —
 * never pretends the demo score is a real assessment.
 */
export async function getWritingFeedback(text: string): Promise<WritingFeedbackResult> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (apiKey) {
    try {
      return await callLiveFeedback(text, apiKey);
    } catch (err) {
      console.error("Groq writing feedback failed", err);
    }
  }
  return mockFeedback(text);
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

async function callLiveFeedback(text: string, apiKey: string): Promise<WritingFeedbackResult> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
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
    }),
  });

  if (!res.ok) throw new Error(`Groq error ${res.status}`);
  const data = await res.json();
  const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");

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
