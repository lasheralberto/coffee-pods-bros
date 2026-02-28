/**
 * Pinecone semantic search service for Coffee Pod Bros.
 *
 * Replaces the rule-based matching in matchingRules.ts with vector similarity
 * search over the `coffee-products` namespace in the `coffee-roasters-sp` index.
 *
 * Uses Pinecone Inference API (llama-text-embed-v2) for query embedding
 * and the REST API for querying — zero SDK dependencies.
 *
 * Env vars (VITE_*):
 *   VITE_PINECONE_API_KEY
 *   VITE_PINECONE_INDEX_HOST
 */

import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { getLocale } from '../data/texts';
import { getProductsCatalog } from '../providers/firebaseProvider';
import type { QuizResultProduct, DefaultPackItem } from '../data/matchingRules';

/* ── Config ──────────────────────────────────────────────── */

const PINECONE_API_KEY = import.meta.env.VITE_PINECONE_API_KEY as string;
const PINECONE_HOST    = import.meta.env.VITE_PINECONE_INDEX_HOST as string;
const EMBEDDING_MODEL  = 'llama-text-embed-v2';
const NAMESPACE        = 'coffee-products';
const MIN_SCORE        = 0.3;

/* ── Helpers ─────────────────────────────────────────────── */

function resolveAnswerLabel(questionId: number, answerId: string): string {
  const question = QUIZ_QUESTIONS.find((q) => q.id === questionId);
  if (!question) return answerId;
  const option = question.options.find((o) => o.id === answerId);
  return option ? option.label : answerId;
}

/**
 * Converts quiz answers into a natural-language query string
 * that maximises semantic overlap with the product embeddings.
 */
export function buildQueryText(answers: Record<number, string | string[]>): string {
  const parts: string[] = [];

  // Q1 — brew method
  if (answers[1]) {
    parts.push(`I brew coffee with ${resolveAnswerLabel(1, answers[1] as string)}`);
  }

  // Q2 — milk / sugar / black / ice
  if (answers[2]) {
    parts.push(`I like my coffee ${resolveAnswerLabel(2, answers[2] as string)}`);
  }

  // Q3 — roast preference
  if (answers[3]) {
    parts.push(`I prefer ${resolveAnswerLabel(3, answers[3] as string)} roast`);
  }

  // Q4 — flavor notes (multi-select)
  if (answers[4]) {
    const flavors = Array.isArray(answers[4]) ? answers[4] : [answers[4]];
    const labels = flavors.map((f) => resolveAnswerLabel(4, f));
    parts.push(`I enjoy ${labels.join(' and ')} flavor notes`);
  }

  // Q5 — frequency
  if (answers[5]) {
    parts.push(`I drink coffee ${resolveAnswerLabel(5, answers[5] as string)}`);
  }

  // Q6 — personality
  if (answers[6]) {
    parts.push(`My coffee personality is ${resolveAnswerLabel(6, answers[6] as string)}`);
  }

  return parts.join('. ') + '.';
}

/* ── Pinecone Inference: query embedding ─────────────────── */

async function generateQueryEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://api.pinecone.io/embed', {
    method: 'POST',
    headers: {
      'Api-Key':       PINECONE_API_KEY,
      'Content-Type':  'application/json',
      'X-Pinecone-API-Version': '2025-01',
    },
    body: JSON.stringify({
      model:      EMBEDDING_MODEL,
      inputs:     [{ text }],
      parameters: { input_type: 'query', truncate: 'END' },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pinecone embed failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  return json.data[0].values as number[];
}

/* ── Pinecone query ──────────────────────────────────────── */

interface PineconeMatch {
  id:       string;
  score:    number;
  metadata: Record<string, unknown>;
}

async function queryPinecone(
  vector: number[],
  topK: number,
): Promise<PineconeMatch[]> {
  const res = await fetch(`${PINECONE_HOST}/query`, {
    method: 'POST',
    headers: {
      'Api-Key':       PINECONE_API_KEY,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      namespace:       NAMESPACE,
      vector,
      topK,
      includeMetadata: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pinecone query failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  return (json.matches ?? []) as PineconeMatch[];
}

/* ── Public API ──────────────────────────────────────────── */

/**
 * Semantic search for the best matching products based on quiz answers.
 * Returns a pack of `DefaultPackItem[]` (same shape as the legacy function).
 *
 * Falls back to first product from Firestore if Pinecone is unavailable.
 */
export async function queryProducts(
  answers: Record<number, string | string[]>,
  topK = 6,
): Promise<DefaultPackItem[]> {
  const locale = getLocale();

  try {
    if (!PINECONE_API_KEY || !PINECONE_HOST) {
      throw new Error('Pinecone not configured');
    }

    const queryText = buildQueryText(answers);
    const vector    = await generateQueryEmbedding(queryText);
    const matches   = await queryPinecone(vector, topK);

    // Filter by minimum score
    const relevant = matches.filter((m) => m.score >= MIN_SCORE);

    if (relevant.length === 0) {
      throw new Error('No relevant matches from Pinecone');
    }

    return relevant.map((m) => ({
      productId: (m.metadata.productId as string) ?? m.id,
      name:      (locale === 'es'
        ? (m.metadata.name_es as string)
        : (m.metadata.name_en as string)) || (m.metadata.name_es as string) || '',
      image:     (m.metadata.image as string) ?? '',
      price:     (m.metadata.price as number) ?? 0,
      quantity:  1,
    }));
  } catch {
    // Fallback: return first product from Firestore catalog
    return fallbackFirstProduct(locale);
  }
}

/**
 * Semantic search for the single best matching product (top-1).
 * Returns a `QuizResultProduct` (same shape as the legacy `calculateProfile`).
 *
 * Falls back to first product from Firestore if Pinecone is unavailable.
 */
export async function queryTopProduct(
  answers: Record<number, string | string[]>,
): Promise<QuizResultProduct> {
  const locale = getLocale();

  try {
    if (!PINECONE_API_KEY || !PINECONE_HOST) {
      throw new Error('Pinecone not configured');
    }

    const queryText = buildQueryText(answers);
    const vector    = await generateQueryEmbedding(queryText);
    const matches   = await queryPinecone(vector, 1);

    if (matches.length === 0 || matches[0].score < MIN_SCORE) {
      throw new Error('No relevant top match from Pinecone');
    }

    const m = matches[0];
    return {
      id:          (m.metadata.productId as string) ?? m.id,
      brand:       (m.metadata.brand as string) ?? '',
      name:        (locale === 'es'
        ? (m.metadata.name_es as string)
        : (m.metadata.name_en as string)) || (m.metadata.name_es as string) || '',
      description: (locale === 'es'
        ? (m.metadata.description_es as string)
        : (m.metadata.description_en as string)) || (m.metadata.description_es as string) || '',
      price:       (m.metadata.price as number) ?? 0,
      image:       (m.metadata.image as string) ?? '',
      roast:       (m.metadata.roast as string) ?? '',
      tastesLike:  (m.metadata.tastesLike as string[]) ?? [],
    };
  } catch {
    // Fallback: use legacy Firestore catalog
    return fallbackFirstProductResult(locale);
  }
}

/* ── Fallbacks ───────────────────────────────────────────── */

async function fallbackFirstProduct(locale: string): Promise<DefaultPackItem[]> {
  const products = await getProductsCatalog();
  if (products.length === 0) return [];
  const p = products[0];
  return [{
    productId: p.id,
    name:      p.name[locale] ?? p.name['en'] ?? '',
    image:     p.image ?? '',
    price:     p.price,
    quantity:  1,
  }];
}

async function fallbackFirstProductResult(locale: string): Promise<QuizResultProduct> {
  const products = await getProductsCatalog();
  if (products.length === 0) {
    throw new Error('No products found in catalog');
  }
  const p = products[0];
  return {
    id:          p.id,
    brand:       p.brand,
    name:        p.name[locale]        ?? p.name['en']        ?? '',
    description: p.description[locale] ?? p.description['en'] ?? '',
    price:       p.price,
    image:       p.image ?? '',
    roast:       p.roast,
    tastesLike:  p.tastesLike ?? [],
  };
}
