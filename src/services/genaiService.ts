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

    const prompt = `You are a sharp, passionate barista at Coffee Pod Bros — a specialty coffee subscription service that takes coffee seriously.

A customer just completed a taste quiz and we've curated a personalized pack just for them.

**Customer quiz answers:**
${quizSummary}

**Selected pack:**
${packSummary}

Write a punchy, confident description (2-3 sentences max) that tells them exactly why this pack was made for them. Lead with insight — connect their brewing style, roast preferences, and flavor profile to what's in their pack. Make them feel like this wasn't random: this was crafted. Be specific about flavors, aromas, and brewing compatibility. Sound like someone who lives and breathes coffee, not a chatbot.

IMPORTANT: Write the response in ${lang}. No markdown. No greetings or sign-offs. No filler. Just straight-up, compelling coffee knowledge.`;

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
