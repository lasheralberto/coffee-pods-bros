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

import { getLocale } from '../data/texts';
import { getProductsCatalog } from '../providers/firebaseProvider';
import type { QuizResultProduct, DefaultPackItem } from '../data/matchingRules';

/* ── Config ──────────────────────────────────────────────── */

const PINECONE_API_KEY = import.meta.env.VITE_PINECONE_API_KEY as string;
const PINECONE_HOST    = import.meta.env.VITE_PINECONE_INDEX_HOST as string;
const EMBEDDING_MODEL  = 'llama-text-embed-v2';
const NAMESPACE        = 'coffee-products';
const MIN_SCORE        = 0.3;
const QUIZ_TEXT_ANSWER_KEY = 1;

/* ── Helpers ─────────────────────────────────────────────── */

/**
 * Converts quiz answers into a natural-language query string
 * that maximises semantic overlap with the product embeddings.
 */
export function buildQueryText(answers: Record<number, string | string[]>): string {
  const freeText = typeof answers[QUIZ_TEXT_ANSWER_KEY] === 'string'
    ? answers[QUIZ_TEXT_ANSWER_KEY].trim()
    : '';

  if (freeText.length > 0) {
    return freeText;
  }

  const fallbackParts = Object.values(answers)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter((value) => value.length > 0);

  return fallbackParts.length > 0
    ? fallbackParts.join('. ')
    : 'Specialty coffee preference profile.';
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
 * @param answers   Quiz answers
 * @param topK      How many results to ask Pinecone for (default 6)
 * @param maxItems  If provided, truncates the final result to exactly this count
 *
 * Falls back to first product from Firestore if Pinecone is unavailable.
 */
export async function queryProducts(
  answers: Record<number, string | string[]>,
  topK = 6,
  maxItems?: number,
): Promise<DefaultPackItem[]> {
  const locale = getLocale();

  try {
    if (!PINECONE_API_KEY || !PINECONE_HOST) {
      throw new Error('Pinecone not configured');
    }

    const queryText = buildQueryText(answers);
    const vector    = await generateQueryEmbedding(queryText);
    const matches   = await queryPinecone(vector, topK);

    if (matches.length === 0) {
      throw new Error('No matches from Pinecone');
    }

    // Sort by score descending (Pinecone already does, but ensure order)
    matches.sort((a, b) => b.score - a.score);

    // Take exactly maxItems (or all if not specified)
    const final = maxItems != null && maxItems > 0 ? matches.slice(0, maxItems) : matches;

    return final.map((m) => ({
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
