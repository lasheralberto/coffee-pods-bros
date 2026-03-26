export interface ContextualCoffeeProductSnapshot {
  productId: string;
  brand: string;
  name: string;
  description: string;
  price: number;
  image: string;
  roast: 'light' | 'medium' | 'dark';
  tastesLike: string[];
}

export interface ContextualCoffeeRecommendationSnapshot {
  generatedAt: string;
  timeContext: string;
  answerHighlights: string[];
  headline: string;
  rationale: string;
  ritualTitle: string;
  ritualSteps: string[];
  recommendedProduct: ContextualCoffeeProductSnapshot;
  alternatives: ContextualCoffeeProductSnapshot[];
}