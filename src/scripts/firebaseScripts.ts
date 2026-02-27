/**
 * Migration script: seeds `suscriptionPlans` and `productsCatalog` collections
 * in Firestore.
 *
 * Run:  npx tsx src/scripts/firebaseScripts.ts
 */

import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

/* ── Firebase init (reads VITE_FIREBASE_* from .env) ─────── */

const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ═══════════════════════════════════════════════════════════
   SUBSCRIPTION PLANS — collection: suscriptionPlans
   All text fields are stored as i18n objects { es, en }
   so they can be edited directly from the Firebase console.
═══════════════════════════════════════════════════════════ */

const suscriptionPlans = [
  {
    id:          'explorer',
    name:        { es: 'Explorador', en: 'Explorer' },
    description: { es: 'Perfecto para iniciarse en el café de especialidad. Un origen diferente cada mes.', en: 'Perfect for getting started with specialty coffee. A different origin each month.' },
    badge:       { es: 'BÁSICO', en: 'BASIC' },
    price:       '12',
    priceCents:  '90',
    interval:    { es: '/ mes', en: '/ month' },
    subscribeCta:{ es: 'Suscribirme', en: 'Subscribe' },
    accentColor: '#4A5E3A',
    glowColor:   'rgba(74, 94, 58, 0.18)',
    features: [
      { es: '250g de café cada mes', en: '250g of coffee each month' },
      { es: 'Envío mensual', en: 'Monthly delivery' },
      { es: 'Envío gratis siempre', en: 'Free shipping always' },
      { es: 'Cancela cuando quieras', en: 'Cancel anytime' },
    ],
    highlighted: false,
    order:       1,
  },
  {
    id:          'connoisseur',
    name:        { es: 'Conocedor', en: 'Connoisseur' },
    description: { es: 'Para quienes quieren más café y más variedad. El favorito de la comunidad.', en: 'For those who want more coffee and more variety. The community favorite.' },
    badge:       { es: 'POPULAR', en: 'POPULAR' },
    price:       '19',
    priceCents:  '90',
    interval:    { es: '/ mes', en: '/ month' },
    subscribeCta:{ es: 'Suscribirme', en: 'Subscribe' },
    accentColor: '#C4773B',
    glowColor:   'rgba(196, 119, 59, 0.22)',
    features: [
      { es: '500g de café por envío', en: '500g of coffee per shipment' },
      { es: 'Envío cada 2 semanas', en: 'Biweekly delivery' },
      { es: 'Envío gratis siempre', en: 'Free shipping always' },
      { es: 'Acceso a microlotes exclusivos', en: 'Access to exclusive micro-lots' },
      { es: 'Cancela cuando quieras', en: 'Cancel anytime' },
    ],
    highlighted: true,
    order:       2,
  },
  {
    id:          'roaster',
    name:        { es: 'Tostador', en: 'Roaster' },
    description: { es: 'La experiencia completa. Acceso a microlotes exclusivos y catas privadas.', en: 'The complete experience. Access to exclusive micro-lots and private tastings.' },
    badge:       { es: 'PREMIUM', en: 'PREMIUM' },
    price:       '29',
    priceCents:  '90',
    interval:    { es: '/ mes', en: '/ month' },
    subscribeCta:{ es: 'Suscribirme', en: 'Subscribe' },
    accentColor: '#7B2D00',
    glowColor:   'rgba(123, 45, 0, 0.18)',
    features: [
      { es: '1kg de café por envío', en: '1kg of coffee per shipment' },
      { es: 'Envío cada 2 semanas', en: 'Biweekly delivery' },
      { es: 'Envío gratis siempre', en: 'Free shipping always' },
      { es: 'Catas privadas mensuales', en: 'Monthly private tastings' },
      { es: 'Soporte prioritario', en: 'Priority support' },
      { es: 'Cancela cuando quieras', en: 'Cancel anytime' },
    ],
    highlighted: false,
    order:       3,
  },
];

/* ═══════════════════════════════════════════════════════════
   PRODUCTS CATALOG — collection: productsCatalog
   Each doc stores i18n description + shop display data.
   The `id` field becomes the Firestore document ID.
═══════════════════════════════════════════════════════════ */

const productsCatalog = [
  {
    id: 'greater-goods-lunar-new-year',
    brand: 'GREATER GOODS',
    name: { es: 'Lunar New Year Blend', en: 'Lunar New Year Blend' },
    description: {
      es: 'Celebra con este blend especial de tueste medio. Notas de chocolate con leche y frutos secos crean una taza equilibrada, cálida y reconfortante.',
      en: 'Celebrate with this special medium roast blend. Notes of milk chocolate and nuts create a balanced, warm, and comforting cup.',
    },
    price: 16.99,
    image: 'productCatalog/greater-goods-lunar-new-year.webp',
    isNew: true,
    roast: 'medium',
    tastesLike: ['chocolate', 'nutty'],
    order: 1,
  },
  {
    id: 'peixoto-familia',
    brand: 'PEIXOTO',
    name: { es: 'Familia Peixoto', en: 'Familia Peixoto' },
    description: {
      es: 'Directo de las fincas de la familia Peixoto en Brasil. Notas envolventes de avellana y caramelo con un cuerpo sedoso que enamora en cada sorbo.',
      en: 'Straight from the Peixoto family farms in Brazil. Enveloping notes of hazelnut and caramel with a silky body that captivates in every sip.',
    },
    price: 21.99,
    image: 'productCatalog/peixoto-familia.webp',
    isNew: false,
    roast: 'medium',
    tastesLike: ['nutty', 'caramel'],
    order: 2,
  },
  {
    id: 'dune-alexander-vargas',
    brand: 'DUNE',
    name: { es: 'Alexander Vargas Colombia', en: 'Alexander Vargas Colombia' },
    description: {
      es: 'Un microlote colombiano de tueste claro con notas vibrantes de frutas rojas y flores de jazmín. Acidez brillante y un final limpio y elegante.',
      en: 'A Colombian micro-lot light roast with vibrant notes of red fruits and jasmine flowers. Bright acidity and a clean, elegant finish.',
    },
    price: 29.99,
    image: 'productCatalog/dune-alexander-vargas.webp',
    isNew: true,
    roast: 'light',
    tastesLike: ['fruity', 'floral'],
    order: 3,
  },
  {
    id: 'onyx-monarch-blend',
    brand: 'ONYX',
    name: { es: 'Monarch Blend', en: 'Monarch Blend' },
    description: {
      es: 'Un blend oscuro y majestuoso con notas profundas de chocolate amargo y humo de leña. Cuerpo intenso y un retrogusto largo y persistente.',
      en: 'A dark and majestic blend with deep notes of dark chocolate and wood smoke. Intense body and a long, lingering aftertaste.',
    },
    price: 18.50,
    image: 'productCatalog/onyx-monarch-blend.webp',
    isNew: false,
    roast: 'dark',
    tastesLike: ['chocolate', 'smoky'],
    order: 4,
  },
  {
    id: 'heart-stereo-blend',
    brand: 'HEART',
    name: { es: 'Stereo Blend', en: 'Stereo Blend' },
    description: {
      es: 'Tueste claro con notas cítricas brillantes y un toque afrutado. Perfecto para quienes buscan un café vivo, aromático y lleno de carácter.',
      en: 'Light roast with bright citrus notes and a fruity touch. Perfect for those seeking a lively, aromatic coffee full of character.',
    },
    price: 22.00,
    image: 'productCatalog/heart-stereo-blend.webp',
    isNew: true,
    roast: 'light',
    tastesLike: ['fruity', 'citrus'],
    order: 5,
  },
  {
    id: 'verve-sermon-blend',
    brand: 'VERVE',
    name: { es: 'Sermon Blend', en: 'Sermon Blend' },
    description: {
      es: 'Un blend premium de tueste oscuro con notas ahumadas y un dulzor de caramelo tostado. Ideal para los amantes del café con cuerpo y personalidad.',
      en: 'A premium dark roast blend with smoky notes and toasted caramel sweetness. Ideal for lovers of coffee with body and personality.',
    },
    price: 34.00,
    image: 'productCatalog/verve-sermon-blend.webp',
    isNew: false,
    roast: 'dark',
    tastesLike: ['smoky', 'caramel'],
    order: 6,
  },
];

/* ═══════════════════════════════════════════════════════════
   SEED EXECUTION
═══════════════════════════════════════════════════════════ */

async function seed() {
  console.log('🔥 Starting Firestore seed...\n');

  // 1. Subscription Plans
  console.log('📦 Seeding suscriptionPlans...');
  for (const plan of suscriptionPlans) {
    const { id, ...data } = plan;
    const ref = doc(db, 'suscriptionPlans', id);
    await setDoc(ref, data, { merge: true });
    console.log(`  ✓ suscriptionPlans/${id}`);
  }

  // 2. Products Catalog
  console.log('\n🛒 Seeding productsCatalog...');
  for (const product of productsCatalog) {
    const { id, ...data } = product;
    const ref = doc(db, 'productsCatalog', id);
    await setDoc(ref, data, { merge: true });
    console.log(`  ✓ productsCatalog/${id}`);
  }

  console.log('\n✅ Seed complete! 3 subscription plans + 6 products written.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
