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

    const productNames = packItems.map((i) => i.name);
    const productList = productNames.map((n) => `"${n}"`).join(', ');

    const prompt = `You are a world-class specialty coffee expert and Q-grader at this company — a precision-driven coffee subscription service.

A customer just completed a taste quiz and we've curated a personalized pack just for them.

**Customer quiz answers:**
${quizSummary}

**Selected pack:**
${packSummary}

The pack contains these specific products: ${productList}.

Analyze why this pack is the ideal match for this customer. You MUST reference each product by its exact name when explaining why it was selected. Respond STRICTLY in this format, no exceptions:

**[One punchy sentence explaining the core reason this pack fits them perfectly, mentioning the key product(s) by name]**
- **[Product name]**: [Technical reason explaining why this specific product matches their preferences — e.g. roast profile, origin, processing method and how it connects to their brew style]
- **[Product name]**: [Technical reason — e.g. flavor compounds, acidity level, body, or mouthfeel aligned with their answers]
- **[Product name]**: [Technical reason — e.g. grind compatibility, extraction dynamics, or how specific notes will express in their setup]

If there are more than 3 products, add one bullet per product. Every product in the pack must appear at least once.

RULES:
- The first line must be bold and declarative, no fluff
- Each bullet MUST start with the product name in bold followed by a colon
- Each bullet must be max 2 lines, no run-on sentences
- Each bullet must be genuinely technical: mention real coffee science (Maillard reaction, CO2 off-gassing, washed vs natural process, SCA parameters, etc.) when relevant
- Never use generic phrases like "you'll love" or "perfect blend"
- No greetings, no sign-offs
- Use **bold** only for the first sentence and product names at the start of each bullet. No other formatting.
- Balance technical depth with a confident, direct voice — like a Q-grader explaining to a curious enthusiast, not writing a thesis.
- Do not write emojis or use slang.
- Write in ${lang}`;

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
