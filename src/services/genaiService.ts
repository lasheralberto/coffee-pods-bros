import { GoogleGenAI } from '@google/genai';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { getLocale } from '../data/texts';
import type { PackItem } from '../providers/firebaseProvider';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    if (!API_KEY || API_KEY === 'MY_GEMINI_API_KEY') {
      throw new Error('VITE_GEMINI_API_KEY not configured');
    }
    aiInstance = new GoogleGenAI({ apiKey: API_KEY });
  }
  return aiInstance;
}

/**
 * Resolves a quiz option ID to its human-readable label.
 */
function resolveAnswerLabel(questionId: number, answerId: string): string {
  const question = QUIZ_QUESTIONS.find((q) => q.id === questionId);
  if (!question) return answerId;
  const option = question.options.find((o) => o.id === answerId);
  return option ? option.label : answerId;
}

/**
 * Builds a human-readable summary of quiz answers.
 */
function buildQuizSummary(answers: Record<number, string | string[]>): string {
  const lines: string[] = [];
  for (const [key, val] of Object.entries(answers)) {
    const qId = Number(key);
    const question = QUIZ_QUESTIONS.find((q) => q.id === qId);
    if (!question) continue;
    const answerLabels = Array.isArray(val)
      ? val.map((a) => resolveAnswerLabel(qId, a)).join(', ')
      : resolveAnswerLabel(qId, val);
    lines.push(`- ${question.question}: ${answerLabels}`);
  }
  return lines.join('\n');
}

/**
 * Builds a human-readable summary of pack items.
 */
function buildPackSummary(items: PackItem[]): string {
  return items.map((i) => `- ${i.name} (x${i.quantity}) — ${i.price.toFixed(2)}€`).join('\n');
}

/**
 * Generates a personalized GenAI description explaining why a pack fits the user.
 * Returns the description text or null if generation fails.
 */
export async function generatePackDescription(
  answers: Record<number, string | string[]>,
  packItems: PackItem[],
): Promise<string | null> {
  try {
    const ai = getAI();
    const locale = getLocale();
    const lang = locale === 'es' ? 'español' : 'English';

    const quizSummary = buildQuizSummary(answers);
    const packSummary = buildPackSummary(packItems);

    const prompt = `You are a friendly coffee expert at Coffee Pod Bros, a specialty coffee subscription service.

A customer just completed a taste quiz. Based on their answers, we selected a personalized coffee pack for them.

**Customer quiz answers:**
${quizSummary}

**Selected pack:**
${packSummary}

Write a short, warm, and engaging explanation (2-3 sentences max) of why this specific pack is perfect for them. Connect their preferences (brew method, roast level, flavor notes) to the coffees in their pack. Be specific about flavors and brewing compatibility.

IMPORTANT: Write the response in ${lang}. Do not use markdown formatting. Keep it conversational and concise.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() ?? null;
  } catch (err) {
    // Silently fail — the pack still works without AI description
    return null;
  }
}
