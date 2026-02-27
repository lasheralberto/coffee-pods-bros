/**
 * Migration script: seeds `coffeeProfiles` and `suscriptionPlans` collections
 * in Firestore from the hardcoded data in texts.ts / matchingRules.ts.
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
   COFFEE PROFILES — collection: coffeeProfiles
   Each doc includes i18n fields + matching rules so
   calculateProfile() can work entirely from Firestore.
═══════════════════════════════════════════════════════════ */

const coffeeProfiles = [
  {
    id: 'explorer_fruity',
    name:        { es: 'Ethiopia Yirgacheffe Natural', en: 'Ethiopia Yirgacheffe Natural' },
    origin:      { es: 'Etiopía', en: 'Ethiopia' },
    altitude:    { es: '2.000m', en: '2,000m' },
    process:     { es: 'Natural', en: 'Natural' },
    notes:       { es: ['Arándanos', 'Jazmín', 'Limón'], en: ['Blueberries', 'Jasmine', 'Lemon'] },
    description: {
      es: 'Un café vibrante y complejo, perfecto para quienes buscan una experiencia sensorial única. Sus notas florales y afrutadas te transportarán al lugar de origen del café.',
      en: 'A vibrant and complex coffee, perfect for those seeking a unique sensory experience. Its floral and fruity notes will transport you to the origin of the coffee.',
    },
    price: { es: '€16,90', en: '€16.90' },
    tags:  { es: ['Afrutado', 'Floral', 'Complejo'], en: ['Fruity', 'Floral', 'Complex'] },
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
    // Matching rules
    matchRoast:       ['light'],
    matchFlavors:     ['fruity', 'floral'],
    matchPersonality: ['explorer'],
    matchMethod:      [],
    isDefault:        false,
    matchPriority:    1,
  },
  {
    id: 'classic_intense',
    name:        { es: 'Brasil Cerrado Pulped', en: 'Brasil Cerrado Pulped' },
    origin:      { es: 'Brasil', en: 'Brazil' },
    altitude:    { es: '1.200m', en: '1,200m' },
    process:     { es: 'Pulped Natural', en: 'Pulped Natural' },
    notes:       { es: ['Chocolate negro', 'Nuez tostada', 'Caramelo'], en: ['Dark Chocolate', 'Toasted Nut', 'Caramel'] },
    description: {
      es: 'Para los amantes de un café con cuerpo y carácter. Notas profundas de chocolate y frutos secos con una baja acidez y un final persistente.',
      en: 'For lovers of a coffee with body and character. Deep notes of chocolate and nuts with low acidity and a lingering finish.',
    },
    price: { es: '€14,90', en: '€14.90' },
    tags:  { es: ['Intenso', 'Cuerpo', 'Clásico'], en: ['Intense', 'Body', 'Classic'] },
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
    // Matching rules
    matchRoast:       ['dark'],
    matchFlavors:     [],
    matchPersonality: [],
    matchMethod:      ['espresso', 'capsules'],
    isDefault:        false,
    matchPriority:    2,
  },
  {
    id: 'adventurer',
    name:        { es: 'Blend Misterio del Mes', en: 'Mystery Blend of the Month' },
    origin:      { es: 'Origen Sorpresa', en: 'Surprise Origin' },
    altitude:    { es: 'Variable', en: 'Variable' },
    process:     { es: 'Secreto', en: 'Secret' },
    notes:       { es: ['Cambia cada mes', 'Siempre excepcional'], en: ['Changes every month', 'Always exceptional'] },
    description: {
      es: 'Déjate sorprender por nuestra selección mensual. Cada mes elegimos un microlote exclusivo que desafía las expectativas y expande tu paladar.',
      en: 'Let yourself be surprised by our monthly selection. Each month we choose an exclusive micro-lot that defies expectations and expands your palate.',
    },
    price: { es: '€17,90', en: '€17.90' },
    tags:  { es: ['Sorpresa', 'Exclusivo', 'Limitado'], en: ['Surprise', 'Exclusive', 'Limited'] },
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80',
    // Matching rules
    matchRoast:       ['surprise'],
    matchFlavors:     [],
    matchPersonality: ['explorer'],
    matchMethod:      [],
    isDefault:        false,
    matchPriority:    3,
  },
  {
    id: 'balanced_lover',
    name:        { es: 'Colombia Huila Honey', en: 'Colombia Huila Honey' },
    origin:      { es: 'Colombia', en: 'Colombia' },
    altitude:    { es: '1.750m', en: '1,750m' },
    process:     { es: 'Honey', en: 'Honey' },
    notes:       { es: ['Chocolate con leche', 'Avellana', 'Panela'], en: ['Milk Chocolate', 'Hazelnut', 'Panela'] },
    description: {
      es: 'El equilibrio perfecto entre dulzura y cuerpo. Un café versátil que brilla en cualquier método de preparación, con una suavidad que enamora.',
      en: 'The perfect balance between sweetness and body. A versatile coffee that shines in any brew method, with a smoothness that captivates.',
    },
    price: { es: '€15,50', en: '€15.50' },
    tags:  { es: ['Equilibrado', 'Dulce', 'Versátil'], en: ['Balanced', 'Sweet', 'Versatile'] },
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    // Matching rules — default / fallback profile
    matchRoast:       ['medium'],
    matchFlavors:     ['chocolate', 'nutty', 'sweet'],
    matchPersonality: ['comfort', 'hybrid'],
    matchMethod:      [],
    isDefault:        true,
    matchPriority:    4,
  },
];

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
   SEED EXECUTION
═══════════════════════════════════════════════════════════ */

async function seed() {
  console.log('🔥 Starting Firestore seed...\n');

  // 1. Coffee Profiles
  console.log('☕ Seeding coffeeProfiles...');
  for (const profile of coffeeProfiles) {
    const { id, ...data } = profile;
    const ref = doc(db, 'coffeeProfiles', id);
    await setDoc(ref, data, { merge: true });
    console.log(`  ✓ coffeeProfiles/${id}`);
  }

  // 2. Subscription Plans
  console.log('\n📦 Seeding suscriptionPlans...');
  for (const plan of suscriptionPlans) {
    const { id, ...data } = plan;
    const ref = doc(db, 'suscriptionPlans', id);
    await setDoc(ref, data, { merge: true });
    console.log(`  ✓ suscriptionPlans/${id}`);
  }

  console.log('\n✅ Seed complete! 4 coffee profiles + 3 subscription plans written.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
