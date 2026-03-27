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
import { buildQuizAnswerHighlights } from '../data/quizQuestions';
import { getProductsCatalog, getProductCatalogProductById } from '../providers/firebaseProvider';
import type { QuizResultProduct, DefaultPackItem } from '../data/matchingRules';
import type { ProductCatalogFirestore } from '../providers/firebaseProvider';

/* ── Config ──────────────────────────────────────────────── */

const PINECONE_API_KEY = import.meta.env.VITE_PINECONE_API_KEY as string;
const PINECONE_HOST    = import.meta.env.VITE_PINECONE_INDEX_HOST as string;
const EMBEDDING_MODEL  = 'llama-text-embed-v2';
const NAMESPACE        = 'coffee-products';
const MIN_SCORE        = 0.3;
const QUIZ_TEXT_ANSWER_KEY = 1;
const QUIZ_PLAN_ANSWER_KEY = 100;

/* ── Helpers ─────────────────────────────────────────────── */

/**
 * Converts quiz answers into a natural-language query string
 * that maximises semantic overlap with the product embeddings.
 */
export function buildQueryText(answers: Record<number, string | string[]>): string {
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

  const fallbackParts = Object.entries(answers)
    .filter(([key]) => Number(key) !== QUIZ_PLAN_ANSWER_KEY)
    .map(([, value]) => value)
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

interface PineconeVectorPayload {
  id: string;
  values: number[];
  metadata: Record<string, unknown>;
}

async function generatePassageEmbeddings(texts: string[]): Promise<number[][]> {
  const res = await fetch('https://api.pinecone.io/embed', {
    method: 'POST',
    headers: {
      'Api-Key':       PINECONE_API_KEY,
      'Content-Type':  'application/json',
      'X-Pinecone-API-Version': '2025-01',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      inputs: texts.map((text) => ({ text })),
      parameters: { input_type: 'passage', truncate: 'END' },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pinecone embed failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  return (json.data ?? []).map((row: { values: number[] }) => row.values);
}

async function deleteNamespaceVectors(): Promise<void> {
  const res = await fetch(`${PINECONE_HOST}/vectors/delete`, {
    method: 'POST',
    headers: {
      'Api-Key':       PINECONE_API_KEY,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      namespace: NAMESPACE,
      deleteAll: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pinecone delete namespace failed (${res.status}): ${body}`);
  }
}

async function deleteVectorsById(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  const res = await fetch(`${PINECONE_HOST}/vectors/delete`, {
    method: 'POST',
    headers: {
      'Api-Key':       PINECONE_API_KEY,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      namespace: NAMESPACE,
      ids,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pinecone delete vector failed (${res.status}): ${body}`);
  }
}

async function upsertVectors(vectors: PineconeVectorPayload[]): Promise<void> {
  const res = await fetch(`${PINECONE_HOST}/vectors/upsert`, {
    method: 'POST',
    headers: {
      'Api-Key':       PINECONE_API_KEY,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      namespace: NAMESPACE,
      vectors,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pinecone upsert failed (${res.status}): ${body}`);
  }
}

function buildProductText(product: ProductCatalogFirestore): string {
  const nameEs = product.name?.es ?? '';
  const nameEn = product.name?.en ?? '';
  const descEs = product.description?.es ?? '';
  const descEn = product.description?.en ?? '';
  const flavors = (product.tastesLike ?? []).join(', ');
  const formats = (product.formatQuantities ?? []).join(', ');

  return [
    `Brand: ${product.brand}`,
    `Name: ${nameEs} / ${nameEn}`,
    `Roast level: ${product.roast}`,
    `Available formats: ${formats}`,
    `Flavor notes: ${flavors}`,
    `Description (ES): ${descEs}`,
    `Description (EN): ${descEn}`,
    `Price: ${product.price}€`,
  ].join('. ');
}

function buildVectorMetadata(product: ProductCatalogFirestore, text: string): Record<string, unknown> {
  return {
    productId: product.id,
    brand: product.brand,
    roast: product.roast,
    tastesLike: product.tastesLike ?? [],
    formatQuantities: product.formatQuantities ?? [],
    price: product.price,
    name_es: product.name?.es ?? '',
    name_en: product.name?.en ?? '',
    description_es: product.description?.es ?? '',
    description_en: product.description?.en ?? '',
    image: product.image ?? '',
    isNew: product.isNew ?? false,
    text: text.slice(0, 1000),
  };
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

/**
 * Rebuilds Pinecone namespace from current Firestore products catalog.
 * 1) Deletes all vectors in `coffee-products` namespace.
 * 2) Embeds all products as passages.
 * 3) Upserts vectors in Pinecone.
 */
export async function reindexProductsCatalog(): Promise<number> {
  if (!PINECONE_API_KEY || !PINECONE_HOST) {
    throw new Error('Pinecone not configured');
  }

  const products = await getProductsCatalog();
  await deleteNamespaceVectors();

  if (products.length === 0) {
    return 0;
  }

  const productTexts = products.map(buildProductText);
  const vectors: PineconeVectorPayload[] = [];
  const EMBED_BATCH_SIZE = 96;

  for (let index = 0; index < products.length; index += EMBED_BATCH_SIZE) {
    const batchProducts = products.slice(index, index + EMBED_BATCH_SIZE);
    const batchTexts = productTexts.slice(index, index + EMBED_BATCH_SIZE);
    const embeddings = await generatePassageEmbeddings(batchTexts);

    if (embeddings.length !== batchProducts.length) {
      throw new Error('Embedding batch size mismatch during reindex');
    }

    for (let itemIndex = 0; itemIndex < batchProducts.length; itemIndex += 1) {
      const product = batchProducts[itemIndex];
      vectors.push({
        id: product.id,
        values: embeddings[itemIndex],
        metadata: buildVectorMetadata(product, batchTexts[itemIndex]),
      });
    }
  }

  const UPSERT_BATCH_SIZE = 100;
  for (let index = 0; index < vectors.length; index += UPSERT_BATCH_SIZE) {
    const batch = vectors.slice(index, index + UPSERT_BATCH_SIZE);
    await upsertVectors(batch);
  }

  return vectors.length;
}

/**
 * Upserts a single product vector into Pinecone without touching other namespace vectors.
 */
export async function upsertProductCatalogProduct(productId: string): Promise<void> {
  if (!PINECONE_API_KEY || !PINECONE_HOST) {
    throw new Error('Pinecone not configured');
  }

  const wait = async (ms: number) => new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

  let product = await getProductCatalogProductById(productId);

  if (!product) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await wait(300);
      product = await getProductCatalogProductById(productId);
      if (product) break;
    }
  }

  if (!product) {
    throw new Error('Product not found in catalog for Pinecone upsert');
  }

  const text = buildProductText(product);
  const embeddings = await generatePassageEmbeddings([text]);

  if (embeddings.length !== 1) {
    throw new Error('Embedding size mismatch during product upsert');
  }

  await upsertVectors([
    {
      id: product.id,
      values: embeddings[0],
      metadata: buildVectorMetadata(product, text),
    },
  ]);
}

/**
 * Deletes a single product vector from Pinecone without touching the namespace.
 */
export async function deleteProductCatalogProductVector(productId: string): Promise<void> {
  if (!PINECONE_API_KEY || !PINECONE_HOST) {
    throw new Error('Pinecone not configured');
  }

  await deleteVectorsById([productId]);
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
