import { QuizQuestion } from './quizQuestions';

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

export const COFFEE_PROFILES: Record<string, CoffeeProfile> = {
  explorer_fruity: {
    id: 'explorer_fruity',
    name: 'Ethiopia Yirgacheffe Natural',
    origin: 'Etiopía',
    altitude: '2.000m',
    process: 'Natural',
    notes: ['Arándanos', 'Jazmín', 'Limón'],
    description: 'Un café vibrante y complejo, perfecto para quienes buscan una experiencia sensorial única. Sus notas florales y afrutadas te transportarán al lugar de origen del café.',
    price: '€16,90',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
    tags: ['Afrutado', 'Floral', 'Complejo'],
  },
  balanced_lover: {
    id: 'balanced_lover',
    name: 'Colombia Huila Honey',
    origin: 'Colombia',
    altitude: '1.750m',
    process: 'Honey',
    notes: ['Chocolate con leche', 'Avellana', 'Panela'],
    description: 'El equilibrio perfecto entre dulzura y cuerpo. Un café versátil que brilla en cualquier método de preparación, con una suavidad que enamora.',
    price: '€15,50',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    tags: ['Equilibrado', 'Dulce', 'Versátil'],
  },
  classic_intense: {
    id: 'classic_intense',
    name: 'Brasil Cerrado Pulped',
    origin: 'Brasil',
    altitude: '1.200m',
    process: 'Pulped Natural',
    notes: ['Chocolate negro', 'Nuez tostada', 'Caramelo'],
    description: 'Para los amantes de un café con cuerpo y carácter. Notas profundas de chocolate y frutos secos con una baja acidez y un final persistente.',
    price: '€14,90',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
    tags: ['Intenso', 'Cuerpo', 'Clásico'],
  },
  adventurer: {
    id: 'adventurer',
    name: 'Blend Misterio del Mes',
    origin: 'Origen Sorpresa',
    altitude: 'Variable',
    process: 'Secreto',
    notes: ['Cambia cada mes', 'Siempre excepcional'],
    description: 'Déjate sorprender por nuestra selección mensual. Cada mes elegimos un microlote exclusivo que desafía las expectativas y expande tu paladar.',
    price: '€17,90',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80',
    tags: ['Sorpresa', 'Exclusivo', 'Limitado'],
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
