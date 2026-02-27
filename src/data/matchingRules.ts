import { QuizQuestion } from './quizQuestions';
import { t, getLocale } from './texts';
import { TEXTS } from './texts';
import { getCoffeeProfiles, type CoffeeProfileFirestore } from '../providers/firebaseProvider';

export interface CoffeeProfile {
  id: string;
  name: string;
  origin: string;
  altitude: string;
  process: string;
  notes: string[];
  description: string;
  price: string;
  image: string;
  tags: string[];
}

const locale = () => getLocale();

const getProfileTexts = (key: 'explorerFruity' | 'balancedLover' | 'classicIntense' | 'adventurer'): Omit<CoffeeProfile, 'id' | 'image'> => {
  const p = TEXTS.coffeeProfiles[key];
  const l = locale();
  return {
    name: p.name[l],
    origin: p.origin[l],
    altitude: p.altitude[l],
    process: p.process[l],
    notes: [...p.notes[l]],
    description: p.description[l],
    price: p.price[l],
    tags: [...p.tags[l]],
  };
};

/* ── Hardcoded fallback profiles ─────────────────────────── */

export const COFFEE_PROFILES: Record<string, CoffeeProfile> = {
  explorer_fruity: {
    id: 'explorer_fruity',
    ...getProfileTexts('explorerFruity'),
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
  },
  balanced_lover: {
    id: 'balanced_lover',
    ...getProfileTexts('balancedLover'),
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
  },
  classic_intense: {
    id: 'classic_intense',
    ...getProfileTexts('classicIntense'),
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
  },
  adventurer: {
    id: 'adventurer',
    ...getProfileTexts('adventurer'),
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80',
  },
};

/* ── Hardcoded matching logic (fallback) ─────────────────── */

function calculateProfileLocal(answers: Record<number, string | string[]>): CoffeeProfile {
  const roast = answers[3] as string;
  const flavors = answers[4] as string[];
  const personality = answers[6] as string;
  const method = answers[1] as string;

  if (roast === 'light' || (flavors?.some(f => ['fruity', 'floral'].includes(f)) && personality === 'explorer')) {
    return COFFEE_PROFILES.explorer_fruity;
  }
  if (roast === 'dark' || ['espresso', 'capsules'].includes(method)) {
    return COFFEE_PROFILES.classic_intense;
  }
  if (roast === 'surprise' || personality === 'explorer') {
    return COFFEE_PROFILES.adventurer;
  }
  return COFFEE_PROFILES.balanced_lover;
}

/* ── Firestore-based matching ────────────────────────────── */

/**
 * Converts a Firestore coffee profile doc to the local CoffeeProfile shape,
 * resolving the current locale for all i18n fields.
 */
function firestoreToLocal(doc: CoffeeProfileFirestore): CoffeeProfile {
  const l = locale();
  return {
    id:          doc.id,
    name:        doc.name[l]        ?? doc.name['es']        ?? '',
    origin:      doc.origin[l]      ?? doc.origin['es']      ?? '',
    altitude:    doc.altitude[l]    ?? doc.altitude['es']    ?? '',
    process:     doc.process[l]     ?? doc.process['es']     ?? '',
    notes:       doc.notes[l]       ?? doc.notes['es']       ?? [],
    description: doc.description[l] ?? doc.description['es'] ?? '',
    price:       doc.price[l]       ?? doc.price['es']       ?? '',
    image:       doc.image          ?? '',
    tags:        doc.tags[l]        ?? doc.tags['es']        ?? [],
  };
}

/**
 * Checks whether a Firestore profile's match rules match the given quiz answers.
 */
function matchesProfile(
  doc: CoffeeProfileFirestore,
  answers: Record<number, string | string[]>,
): boolean {
  const roast       = answers[3] as string;
  const flavors     = (answers[4] as string[]) ?? [];
  const personality = answers[6] as string;
  const method      = answers[1] as string;

  if (doc.matchRoast?.length && doc.matchRoast.includes(roast)) return true;
  if (doc.matchFlavors?.length && flavors.some(f => doc.matchFlavors!.includes(f))) {
    if (!doc.matchPersonality?.length || doc.matchPersonality.includes(personality)) {
      return true;
    }
  }
  if (doc.matchPersonality?.length && doc.matchPersonality.includes(personality)) return true;
  if (doc.matchMethod?.length && doc.matchMethod.includes(method)) return true;
  return false;
}

/**
 * Calculates the recommended coffee profile based on quiz answers.
 * Fetches profiles from Firestore `coffeeProfiles` collection when available,
 * falls back to hardcoded COFFEE_PROFILES + local matching logic.
 */
export async function calculateProfile(
  answers: Record<number, string | string[]>,
): Promise<CoffeeProfile> {
  try {
    const remoteDocs = await getCoffeeProfiles();
    if (remoteDocs.length === 0) return calculateProfileLocal(answers);

    // Sorted by matchPriority (ascending) — first match wins
    for (const doc of remoteDocs) {
      if (matchesProfile(doc, answers)) {
        return firestoreToLocal(doc);
      }
    }

    // No rule matched → use the default profile or the last one
    const defaultDoc = remoteDocs.find(d => d.isDefault) ?? remoteDocs[remoteDocs.length - 1];
    return firestoreToLocal(defaultDoc);
  } catch {
    // Firestore unavailable → use hardcoded fallback
    return calculateProfileLocal(answers);
  }
}

export interface DefaultPackItem {
  profileId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

/**
 * Calculates a default pack based on quiz answers.
 * Returns all matching profiles (qty 1 each) + the default/fallback if none matched.
 * Used when the quiz completes to generate the initial userPack.
 */
export async function calculateDefaultPack(
  answers: Record<number, string | string[]>,
): Promise<DefaultPackItem[]> {
  const l = locale();
  try {
    const remoteDocs = await getCoffeeProfiles();
    if (remoteDocs.length === 0) {
      // Fallback: single-item pack from local matching
      const local = calculateProfileLocal(answers);
      const rawPrice = parseFloat(local.price.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
      return [{ profileId: local.id, name: local.name, image: local.image, price: rawPrice, quantity: 1 }];
    }

    const matched: DefaultPackItem[] = [];
    for (const doc of remoteDocs) {
      if (matchesProfile(doc, answers)) {
        const rawPrice = doc.price[l] ?? doc.price['es'] ?? '0';
        const numericPrice = parseFloat(rawPrice.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
        matched.push({
          profileId: doc.id,
          name:      doc.name[l] ?? doc.name['es'] ?? '',
          image:     doc.image ?? '',
          price:     numericPrice,
          quantity:  1,
        });
      }
    }

    // If nothing matched, add the default profile
    if (matched.length === 0) {
      const defaultDoc = remoteDocs.find(d => d.isDefault) ?? remoteDocs[remoteDocs.length - 1];
      const rawPrice = defaultDoc.price[l] ?? defaultDoc.price['es'] ?? '0';
      const numericPrice = parseFloat(rawPrice.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
      matched.push({
        profileId: defaultDoc.id,
        name:      defaultDoc.name[l] ?? defaultDoc.name['es'] ?? '',
        image:     defaultDoc.image ?? '',
        price:     numericPrice,
        quantity:  1,
      });
    }

    return matched;
  } catch {
    const local = calculateProfileLocal(answers);
    const rawPrice = parseFloat(local.price.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
    return [{ profileId: local.id, name: local.name, image: local.image, price: rawPrice, quantity: 1 }];
  }
}
