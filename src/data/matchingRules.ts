import { getLocale } from './texts';
import { getProductsCatalog, type ProductCatalogFirestore } from '../providers/firebaseProvider';

/* ── Quiz result shape (product-based) ───────────────────── */

export interface QuizResultProduct {
  id: string;
  brand: string;
  name: string;
  description: string;
  price: number;
  image: string;
  roast: string;
  tastesLike: string[];
}

const locale = () => getLocale();

/* ── Convert a Firestore product doc to quiz-result shape ── */

function catalogToResult(doc: ProductCatalogFirestore): QuizResultProduct {
  const l = locale();
  return {
    id:          doc.id,
    brand:       doc.brand,
    name:        doc.name[l]        ?? doc.name['en']        ?? '',
    description: doc.description[l] ?? doc.description['en'] ?? '',
    price:       doc.price,
    image:       doc.image ?? '',
    roast:       doc.roast,
    tastesLike:  doc.tastesLike ?? [],
  };
}

/* ── Matching logic: quiz answers → product from catalog ── */

function matchesProduct(
  doc: ProductCatalogFirestore,
  answers: Record<number, string | string[]>,
): boolean {
  const roast   = answers[3] as string;
  const flavors = (answers[4] as string[]) ?? [];
  const method  = answers[1] as string;

  if (roast && doc.roast === roast) return true;
  if (flavors.length && flavors.some(f => doc.tastesLike.includes(f))) return true;
  if (roast === 'dark' && ['espresso', 'capsules'].includes(method) && doc.roast === 'dark') return true;
  return false;
}

/**
 * Calculates the recommended product based on quiz answers.
 * Fetches products from Firestore `productsCatalog` collection.
 */
export async function calculateProfile(
  answers: Record<number, string | string[]>,
): Promise<QuizResultProduct> {
  const products = await getProductsCatalog();
  if (products.length === 0) {
    throw new Error('No products found in catalog');
  }

  for (const doc of products) {
    if (matchesProduct(doc, answers)) {
      return catalogToResult(doc);
    }
  }

  // No match → return first product as default
  return catalogToResult(products[0]);
}

export interface DefaultPackItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

/**
 * Calculates a default pack based on quiz answers.
 * Returns all matching products (qty 1 each) from `productsCatalog`.
 */
export async function calculateDefaultPack(
  answers: Record<number, string | string[]>,
): Promise<DefaultPackItem[]> {
  const l = locale();
  const products = await getProductsCatalog();
  if (products.length === 0) return [];

  const matched: DefaultPackItem[] = [];
  for (const doc of products) {
    if (matchesProduct(doc, answers)) {
      matched.push({
        productId: doc.id,
        name:      doc.name[l] ?? doc.name['en'] ?? '',
        image:     doc.image ?? '',
        price:     doc.price,
        quantity:  1,
      });
    }
  }

  // If nothing matched, add the first product as fallback
  if (matched.length === 0) {
    const fallback = products[0];
    matched.push({
      productId: fallback.id,
      name:      fallback.name[l] ?? fallback.name['en'] ?? '',
      image:     fallback.image ?? '',
      price:     fallback.price,
      quantity:  1,
    });
  }

  return matched;
}
