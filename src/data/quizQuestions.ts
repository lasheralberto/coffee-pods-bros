export type QuizOption = {
  id: string;
  emoji: string;
  label: string;
  sublabel?: string;
};

export type QuizQuestion = {
  id: number;
  question: string;
  subtitle?: string;
  type: 'single' | 'multi';
  options: QuizOption[];
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: '¿Cómo preparas tu café en casa?',
    subtitle: 'Esto nos ayuda a calibrar el molido perfecto',
    type: 'single',
    options: [
      { id: 'moka', emoji: '☕', label: 'Moka / Italiana', sublabel: 'Clásico e intenso' },
      { id: 'french_press', emoji: '🇫🇷', label: 'Prensa Francesa', sublabel: 'Cuerpo completo' },
      { id: 'pour_over', emoji: '💧', label: 'Pour Over / V60', sublabel: 'Limpio y aromático' },
      { id: 'drip', emoji: '🔌', label: 'Goteo Eléctrico', sublabel: 'Práctico y constante' },
      { id: 'capsules', emoji: '💊', label: 'Cápsulas', sublabel: 'Rápido y sencillo' },
      { id: 'espresso', emoji: '⚡', label: 'Espresso', sublabel: 'Intenso y concentrado' },
    ],
  },
  {
    id: 2,
    question: '¿Cómo sueles tomar tu café?',
    subtitle: 'Sin juicios, solo queremos saberlo todo',
    type: 'single',
    options: [
      { id: 'black', emoji: '🌑', label: 'Solo y puro', sublabel: 'Sin distracciones' },
      { id: 'milk', emoji: '🥛', label: 'Con leche / Vegetal', sublabel: 'Cremoso y suave' },
      { id: 'sugar', emoji: '🍬', label: 'Con azúcar', sublabel: 'Un toque dulce' },
      { id: 'ice', emoji: '🧊', label: 'Con hielo', sublabel: 'Refrescante' },
    ],
  },
  {
    id: 3,
    question: '¿Qué nivel de tueste te llama más?',
    subtitle: 'Pista: el claro no es débil, es complejo',
    type: 'single',
    options: [
      { id: 'light', emoji: '🍋', label: 'Claro', sublabel: 'Floral, afrutado, acidez brillante' },
      { id: 'medium', emoji: '⚖️', label: 'Medio', sublabel: 'Equilibrado, caramelo, frutos secos' },
      { id: 'dark', emoji: '🍫', label: 'Oscuro', sublabel: 'Intenso, chocolate amargo, cuerpo' },
      { id: 'surprise', emoji: '🎲', label: 'Sorpréndeme', sublabel: 'Ponme a prueba' },
    ],
  },
  {
    id: 4,
    question: '¿Qué sabores te emocionan en el café?',
    subtitle: 'Elige hasta 2 que más resuenen contigo',
    type: 'multi',
    options: [
      { id: 'fruity', emoji: '🍒', label: 'Frutas rojas y cítricos' },
      { id: 'chocolate', emoji: '🍫', label: 'Chocolate y cacao' },
      { id: 'nutty', emoji: '🥜', label: 'Frutos secos y caramelo' },
      { id: 'floral', emoji: '🌸', label: 'Floral y té' },
      { id: 'spicy', emoji: '🌶️', label: 'Especias' },
      { id: 'sweet', emoji: '🍯', label: 'Miel y vainilla' },
    ],
  },
  {
    id: 5,
    question: '¿Cada cuánto quieres recibir tu café?',
    type: 'single',
    options: [
      { id: 'biweekly', emoji: '🗓️', label: 'Cada 2 semanas', sublabel: '~250g, para amantes del café' },
      { id: 'monthly', emoji: '📅', label: 'Mensual', sublabel: '~250g, lo más popular ❤️' },
      { id: 'six_weeks', emoji: '📆', label: 'Cada 6 semanas', sublabel: '~200g, para consumo moderado' },
      { id: 'once', emoji: '📦', label: 'Solo un pedido', sublabel: 'Sin suscripción, pedido único' },
    ],
  },
  {
    id: 6,
    question: '¿Eres más de...',
    type: 'single',
    options: [
      { id: 'comfort', emoji: '🏠', label: 'Lo conocido', sublabel: 'Un café de confianza que siempre me guste' },
      { id: 'explorer', emoji: '🧭', label: 'Explorador', sublabel: 'Cada mes un origen y perfil diferente' },
      { id: 'hybrid', emoji: '⚖️', label: 'Híbrido', sublabel: 'Un poco de ambos mundos' },
    ],
  },
];
