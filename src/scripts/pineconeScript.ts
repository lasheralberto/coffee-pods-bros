/**
 * Migration script: upserts all products from Firestore `productsCatalog`
 * into Pinecone index `coffee-roasters-sp` (namespace: coffee-products).
 *
 * Uses Pinecone Inference API (llama-text-embed-v2) for embeddings
 * and the REST API for upsert — no SDK dependency needed.
 *
 * Run:  npx tsx src/scripts/pineconeScript.ts
 *
 * Required .env vars:
 *   VITE_PINECONE_API_KEY
 *   VITE_PINECONE_INDEX_HOST   (e.g. https://coffee-roasters-sp-xxxxx.svc.xxx.pinecone.io)
 *   VITE_FIREBASE_*            (standard Firebase client config)
 */

import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

/* ── Config ──────────────────────────────────────────────── */

const PINECONE_API_KEY   = process.env.VITE_PINECONE_API_KEY ?? '';
const PINECONE_HOST      = process.env.VITE_PINECONE_INDEX_HOST ?? '';
const EMBEDDING_MODEL    = 'llama-text-embed-v2';
const NAMESPACE          = 'coffee-products';

if (!PINECONE_API_KEY) throw new Error('Missing VITE_PINECONE_API_KEY in .env');
if (!PINECONE_HOST)    throw new Error('Missing VITE_PINECONE_INDEX_HOST in .env');

/* ── Firebase init ───────────────────────────────────────── */

const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

/* ── Types ───────────────────────────────────────────────── */

interface ProductDoc {
  id:          string;
  brand:       string;
  name:        Record<string, string>;
  description: Record<string, string>;
  price:       number;
  image:       string;
  isNew:       boolean;
  roast:       string;
  tastesLike:  string[];
  formatQuantities?: string[];
  order?:      number;
}

interface PineconeEmbedding {
  values: number[];
}

/* ── Pinecone Inference: generate embeddings ─────────────── */

async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const res = await fetch('https://api.pinecone.io/embed', {
    method: 'POST',
    headers: {
      'Api-Key':      PINECONE_API_KEY,
      'Content-Type':  'application/json',
      'X-Pinecone-API-Version': '2025-01',
    },
    body: JSON.stringify({
      model:      EMBEDDING_MODEL,
      inputs:     texts.map((text) => ({ text })),
      parameters: { input_type: 'passage', truncate: 'END' },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pinecone embed failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  return (json.data as PineconeEmbedding[]).map((d) => d.values);
}

/* ── Pinecone upsert ─────────────────────────────────────── */

async function upsertVectors(
  vectors: { id: string; values: number[]; metadata: Record<string, unknown> }[],
): Promise<void> {
  const res = await fetch(`${PINECONE_HOST}/vectors/upsert`, {
    method: 'POST',
    headers: {
      'Api-Key':      PINECONE_API_KEY,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ vectors, namespace: NAMESPACE }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pinecone upsert failed (${res.status}): ${body}`);
  }
}

/* ── Build semantic text for a product ───────────────────── */

function buildProductText(doc: ProductDoc): string {
  const nameEs = doc.name?.es ?? '';
  const nameEn = doc.name?.en ?? '';
  const descEs = doc.description?.es ?? '';
  const descEn = doc.description?.en ?? '';
  const flavors = (doc.tastesLike ?? []).join(', ');
  const formats = (doc.formatQuantities ?? []).join(', ');

  return [
    `Brand: ${doc.brand}`,
    `Name: ${nameEs} / ${nameEn}`,
    `Roast level: ${doc.roast}`,
    `Available formats: ${formats}`,
    `Flavor notes: ${flavors}`,
    `Description (ES): ${descEs}`,
    `Description (EN): ${descEn}`,
    `Price: ${doc.price}€`,
  ].join('. ');
}

/* ── Main ────────────────────────────────────────────────── */

async function main() {
  console.log('🔥  Fetching products from Firestore productsCatalog...');

  const snap = await getDocs(collection(db, 'productsCatalog'));
  const products: ProductDoc[] = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as ProductDoc[];

  console.log(`   Found ${products.length} products.`);
  if (products.length === 0) {
    console.log('⚠️  No products to migrate. Exiting.');
    process.exit(0);
  }

  // Build semantic texts
  const texts = products.map(buildProductText);

  console.log('🧠  Generating embeddings via Pinecone Inference (llama-text-embed-v2)...');

  // Pinecone Inference supports batch — send all at once (up to 96 texts)
  const BATCH_SIZE = 96;
  const allVectors: { id: string; values: number[]; metadata: Record<string, unknown> }[] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batchTexts    = texts.slice(i, i + BATCH_SIZE);
    const batchProducts = products.slice(i, i + BATCH_SIZE);

    const embeddings = await generateEmbeddings(batchTexts);

    for (let j = 0; j < batchProducts.length; j++) {
      const doc = batchProducts[j];
      allVectors.push({
        id:     doc.id,
        values: embeddings[j],
        metadata: {
          productId:   doc.id,
          brand:       doc.brand,
          roast:       doc.roast,
          tastesLike:  doc.tastesLike ?? [],
          formatQuantities: doc.formatQuantities ?? [],
          price:       doc.price,
          name_es:     doc.name?.es ?? '',
          name_en:     doc.name?.en ?? '',
          description_es: doc.description?.es ?? '',
          description_en: doc.description?.en ?? '',
          image:       doc.image ?? '',
          isNew:       doc.isNew ?? false,
          text:        batchTexts[j].slice(0, 1000),
        },
      });
    }

    console.log(`   Embedded batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batchTexts.length} products`);
  }

  // Upsert in batches of 100 vectors (Pinecone limit)
  const UPSERT_BATCH = 100;
  for (let i = 0; i < allVectors.length; i += UPSERT_BATCH) {
    const batch = allVectors.slice(i, i + UPSERT_BATCH);
    await upsertVectors(batch);
    console.log(`📤  Upserted ${batch.length} vectors (batch ${Math.floor(i / UPSERT_BATCH) + 1})`);
  }

  console.log(`\n✅  Migration complete! ${allVectors.length} products upserted to Pinecone.`);
  console.log(`   Index: coffee-roasters-sp | Namespace: ${NAMESPACE}`);
  console.log(`   Model: ${EMBEDDING_MODEL}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌  Migration failed:', err);
  process.exit(1);
});
