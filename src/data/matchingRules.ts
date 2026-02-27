import { QuizQuestion } from './quizQuestions';
import { t, getLocale } from './texts';
import { TEXTS } from './texts';

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

export const calculateProfile = (answers: Record<number, string | string[]>): CoffeeProfile => {
  const roast = answers[3] as string;
  const flavors = answers[4] as string[];
  const personality = answers[6] as string;
  const method = answers[1] as string;

  // 1. Explorador Afrutado
  if (roast === 'light' || (flavors?.some(f => ['fruity', 'floral'].includes(f)) && personality === 'explorer')) {
    return COFFEE_PROFILES.explorer_fruity;
  }

  // 3. El Clásico Intenso (prioridad si es oscuro o espresso/capsulas)
  if (roast === 'dark' || ['espresso', 'capsules'].includes(method)) {
    return COFFEE_PROFILES.classic_intense;
  }

  // 4. El Gran Aventurero
  if (roast === 'surprise' || personality === 'explorer') {
    return COFFEE_PROFILES.adventurer;
  }

  // 2. Amante del Equilibrio (Default)
  return COFFEE_PROFILES.balanced_lover;
};
