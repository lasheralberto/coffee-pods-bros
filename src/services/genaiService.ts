import { GoogleGenAI } from '@google/genai';
import { getLocale } from '../data/texts';
import { buildQuizAnswerHighlights, getQuizAnswerLabel } from '../data/quizQuestions';
import type { PackItem } from '../providers/firebaseProvider';
import type { ProductCatalogFirestore } from '../providers/firebaseProvider';
import type {
  ContextualCoffeeProductSnapshot,
  ContextualCoffeeRecommendationSnapshot,
} from '../types/contextualCoffee';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const QUIZ_TEXT_ANSWER_KEY = 1;

let aiInstance: GoogleGenAI | null = null;

const HOUR_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

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
 * Builds a human-readable summary of user's free-text preferences.
 */
function buildQuizSummary(answers: Record<number, string | string[]>): string {
  const freeText = typeof answers[QUIZ_TEXT_ANSWER_KEY] === 'string'
    ? answers[QUIZ_TEXT_ANSWER_KEY].trim()
    : '';

  if (freeText.length > 0 && freeText.includes(' ')) {
    return freeText;
  }

  const highlights = buildQuizAnswerHighlights(answers);
  if (highlights.length > 0) {
    return highlights.join('. ');
  }

  const fallback = Object.values(answers)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter((value) => value.length > 0);

  return fallback.join('. ');
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

  A customer described their coffee preferences in free text and we've curated a personalized pack just for them.

  **Customer preference text:**
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

type ParsedContextualRecommendation = {
  headline?: string;
  rationale?: string;
  ritualTitle?: string;
  ritualSteps?: string[];
  recommendedProduct?: string;
  alternatives?: string[];
};

function normalizeProductKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function parseJsonFromText(text: string): ParsedContextualRecommendation | null {
  const trimmed = text.trim();
  const withoutFence = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(withoutFence) as ParsedContextualRecommendation;
  } catch {
    return null;
  }
}

function getTimeContextLabel(date: Date, locale: 'es' | 'en'): string {
  const hour = date.getHours();

  if (hour < 10) {
    return locale === 'es' ? 'mañana temprana' : 'early morning';
  }
  if (hour < 13) {
    return locale === 'es' ? 'media mañana' : 'mid-morning';
  }
  if (hour < 17) {
    return locale === 'es' ? 'sobremesa' : 'after lunch';
  }
  if (hour < 20) {
    return locale === 'es' ? 'media tarde' : 'late afternoon';
  }
  return locale === 'es' ? 'final del día' : 'evening';
}

function toProductSnapshot(product: ProductCatalogFirestore, locale: 'es' | 'en'): ContextualCoffeeProductSnapshot {
  return {
    productId: product.id,
    brand: product.brand,
    name: product.name[locale] ?? product.name.en ?? product.name.es ?? '',
    description: product.description[locale] ?? product.description.en ?? product.description.es ?? '',
    price: product.price,
    image: product.image,
    roast: product.roast,
    tastesLike: product.tastesLike,
  };
}

function scoreProduct(product: ProductCatalogFirestore, answers: Record<number, string | string[]>): number {
  const moment = answers[1];
  const state = answers[2];
  const profile = answers[3];
  let score = 0;

  if (profile === 'bold_body') {
    score += product.roast === 'dark' ? 4 : product.roast === 'medium' ? 2 : 0;
    score += product.tastesLike.some((note) => ['chocolate', 'nutty', 'caramel', 'smoky'].includes(note)) ? 2 : 0;
  }
  if (profile === 'balanced_sweet') {
    score += product.roast === 'medium' ? 4 : product.roast === 'dark' ? 1 : 0;
    score += product.tastesLike.some((note) => ['caramel', 'nutty', 'chocolate', 'sweet'].includes(note)) ? 2 : 0;
  }
  if (profile === 'bright_fruit') {
    score += product.roast === 'light' ? 4 : product.roast === 'medium' ? 1 : 0;
    score += product.tastesLike.some((note) => ['fruity', 'citrus', 'floral'].includes(note)) ? 3 : 0;
  }
  if (profile === 'milk_friendly') {
    score += product.roast === 'dark' ? 3 : product.roast === 'medium' ? 2 : 0;
    score += product.tastesLike.some((note) => ['chocolate', 'nutty', 'caramel'].includes(note)) ? 3 : 0;
  }

  if (state === 'need_focus') {
    score += product.roast !== 'light' ? 2 : 0;
  }
  if (state === 'want_comfort') {
    score += product.tastesLike.some((note) => ['chocolate', 'nutty', 'caramel'].includes(note)) ? 2 : 0;
  }
  if (state === 'need_reset') {
    score += product.tastesLike.some((note) => ['citrus', 'fruity', 'floral'].includes(note)) ? 2 : 0;
  }
  if (state === 'indulgent_treat') {
    score += product.tastesLike.some((note) => ['chocolate', 'sweet', 'caramel'].includes(note)) ? 2 : 0;
  }

  if (moment === 'sobremesa') {
    score += product.roast === 'medium' || product.roast === 'dark' ? 2 : 0;
  }
  if (moment === 'sunset_pause') {
    score += product.roast === 'light' || product.roast === 'medium' ? 1 : 0;
  }

  score += product.isNew ? 0.3 : 0;
  return score;
}

function buildFallbackRitual(answerHighlights: string[], locale: 'es' | 'en'): { title: string; steps: string[] } {
  if (locale === 'es') {
    return {
      title: 'Ritual para este momento',
      steps: [
        'Muele o prepara la taza pensando en un servicio corto y limpio.',
        `Busca una extracción que acompañe ${answerHighlights[0] ?? 'tu momento actual'} sin saturar el paladar.`,
        'Tómalo despacio y deja que el final en boca marque el ritmo del siguiente tramo del día.',
      ],
    };
  }

  return {
    title: 'Ritual for this moment',
    steps: [
      'Brew for a short, clean cup that feels precise rather than heavy.',
      `Dial the extraction around ${answerHighlights[0] ?? 'your current moment'} so the cup stays focused.`,
      'Drink it slowly and let the finish set the tone for the next part of the day.',
    ],
  };
}

function buildFallbackRecommendation(
  answers: Record<number, string | string[]>,
  catalog: ProductCatalogFirestore[],
  locale: 'es' | 'en',
): ContextualCoffeeRecommendationSnapshot | null {
  const scored = [...catalog]
    .sort((left, right) => scoreProduct(right, answers) - scoreProduct(left, answers));

  const recommended = scored[0];
  if (!recommended) return null;

  const alternatives = scored.slice(1, 4).map((product) => toProductSnapshot(product, locale));
  const highlights = buildQuizAnswerHighlights(answers);
  const ritual = buildFallbackRitual(highlights, locale);

  return {
    generatedAt: new Date().toISOString(),
    timeContext: `${getTimeContextLabel(new Date(), locale)} · ${HOUR_FORMATTER.format(new Date())}`,
    answerHighlights: highlights,
    headline: locale === 'es'
      ? `Para este momento, ${toProductSnapshot(recommended, locale).name} te va a dar la taza más afinada.`
      : `${toProductSnapshot(recommended, locale).name} fits this moment with the cleanest match.`,
    rationale: locale === 'es'
      ? 'Equilibra el momento del día con el nivel de intensidad y el tipo de taza que acabas de pedir.'
      : 'It balances your time of day with the intensity and cup profile you just selected.',
    ritualTitle: ritual.title,
    ritualSteps: ritual.steps,
    recommendedProduct: toProductSnapshot(recommended, locale),
    alternatives,
  };
}

function resolveProductByName(name: string, catalog: ProductCatalogFirestore[]): ProductCatalogFirestore | null {
  const normalized = normalizeProductKey(name);
  if (!normalized) return null;

  return catalog.find((product) => {
    const names = [product.name.es, product.name.en, product.brand, product.id]
      .filter((value): value is string => typeof value === 'string' && value.length > 0);
    return names.some((value) => normalizeProductKey(value) === normalized);
  }) ?? null;
}

export async function generateContextualCoffeeRecommendation(
  answers: Record<number, string | string[]>,
  catalog: ProductCatalogFirestore[],
): Promise<ContextualCoffeeRecommendationSnapshot | null> {
  if (catalog.length === 0) return null;

  const locale = getLocale();
  const now = new Date();
  const timeContext = `${getTimeContextLabel(now, locale)} · ${HOUR_FORMATTER.format(now)}`;
  const answerHighlights = buildQuizAnswerHighlights(answers);
  const answerSummary = [
    getQuizAnswerLabel(1, typeof answers[1] === 'string' ? answers[1] : ''),
    getQuizAnswerLabel(2, typeof answers[2] === 'string' ? answers[2] : ''),
    getQuizAnswerLabel(3, typeof answers[3] === 'string' ? answers[3] : ''),
  ].filter(Boolean);

  const catalogSummary = catalog
    .map((product) => {
      const localized = toProductSnapshot(product, locale);
      return `- ${localized.name} | roast=${localized.roast} | notes=${localized.tastesLike.join(', ')} | brand=${localized.brand} | description=${localized.description}`;
    })
    .join('\n');

  try {
    const ai = getAI();
    const lang = locale === 'es' ? 'español' : 'English';
    const prompt = `You are a world-class specialty coffee selector helping a user choose one coffee for this exact moment of the day.

Time context: ${timeContext}
User answers: ${answerSummary.join(' · ')}

Available catalog. You MUST choose only from these exact product names:
${catalogSummary}

Return STRICT JSON only with this shape:
{
  "headline": "short editorial sentence",
  "rationale": "2 sentence reason tied to time, mood, and cup profile",
  "ritualTitle": "short ritual title",
  "ritualSteps": ["step 1", "step 2", "step 3"],
  "recommendedProduct": "exact product name from catalog",
  "alternatives": ["exact product name", "exact product name", "exact product name"]
}

Rules:
- recommendedProduct must be one exact product name from the catalog
- alternatives must contain 2 or 3 exact product names from the catalog and must not repeat the recommended product
- rationale must feel specific to this moment, not generic tasting copy
- ritualSteps must be concise, practical and sensorial
- Write in ${lang}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const parsed = response.text ? parseJsonFromText(response.text) : null;
    if (!parsed?.recommendedProduct) {
      return buildFallbackRecommendation(answers, catalog, locale);
    }

    const recommended = resolveProductByName(parsed.recommendedProduct, catalog);
    if (!recommended) {
      return buildFallbackRecommendation(answers, catalog, locale);
    }

    const alternatives = (parsed.alternatives ?? [])
      .map((name) => resolveProductByName(name, catalog))
      .filter((product): product is ProductCatalogFirestore => Boolean(product))
      .filter((product, index, list) => product.id !== recommended.id && list.findIndex((candidate) => candidate.id === product.id) === index)
      .slice(0, 3)
      .map((product) => toProductSnapshot(product, locale));

    const ritualSteps = Array.isArray(parsed.ritualSteps)
      ? parsed.ritualSteps.filter((step): step is string => typeof step === 'string' && step.trim().length > 0).slice(0, 3)
      : [];

    const fallbackRitual = buildFallbackRitual(answerHighlights, locale);

    return {
      generatedAt: now.toISOString(),
      timeContext,
      answerHighlights,
      headline: parsed.headline?.trim() || (locale === 'es'
        ? `Hoy el café va por ${toProductSnapshot(recommended, locale).name}.`
        : `This moment calls for ${toProductSnapshot(recommended, locale).name}.`),
      rationale: parsed.rationale?.trim() || (locale === 'es'
        ? 'La recomendación cruza el momento del día, el estado en el que estás y el tipo de taza que quieres ahora mismo.'
        : 'This recommendation crosses your time of day, current state, and cup profile.'),
      ritualTitle: parsed.ritualTitle?.trim() || fallbackRitual.title,
      ritualSteps: ritualSteps.length > 0 ? ritualSteps : fallbackRitual.steps,
      recommendedProduct: toProductSnapshot(recommended, locale),
      alternatives: alternatives.length > 0 ? alternatives : buildFallbackRecommendation(answers, catalog, locale)?.alternatives ?? [],
    };
  } catch {
    return buildFallbackRecommendation(answers, catalog, locale);
  }
}
