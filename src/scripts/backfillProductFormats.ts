import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { collection, doc, getDocs, getFirestore, writeBatch } from 'firebase/firestore';

const DEFAULT_FORMAT_QUANTITIES = ['250g', '500g', '1kg'];

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  console.log('🔎 Checking productsCatalog for missing formatQuantities...');

  const snapshot = await getDocs(collection(db, 'productsCatalog'));
  const docsToUpdate = snapshot.docs.filter((productDoc) => {
    const value = (productDoc.data() as { formatQuantities?: unknown }).formatQuantities;
    return !Array.isArray(value) || value.length === 0;
  });

  if (docsToUpdate.length === 0) {
    console.log('✅ All products already contain formatQuantities.');
    process.exit(0);
  }

  console.log(`🛠️ Updating ${docsToUpdate.length} products with default formats...`);
  const batch = writeBatch(db);

  docsToUpdate.forEach((productDoc) => {
    const productRef = doc(db, 'productsCatalog', productDoc.id);
    batch.update(productRef, { formatQuantities: DEFAULT_FORMAT_QUANTITIES });
  });

  await batch.commit();

  console.log('✅ Backfill finished. Updated documents:');
  docsToUpdate.forEach((productDoc) => {
    console.log(`  - productsCatalog/${productDoc.id}`);
  });

  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Backfill failed:', error);
  process.exit(1);
});
