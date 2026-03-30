export type SubscriptionPeriod = 'monthly' | 'annual';

export const SUBSCRIPTION_ANNUAL_DISCOUNT_RATE = 0.15;
const MONTHS_IN_YEAR = 12;

export const roundCurrency = (value: number): number => Number(value.toFixed(2));

export const getSubscriptionDurationMonths = (period: SubscriptionPeriod): number => (
  period === 'annual' ? MONTHS_IN_YEAR : 1
);

export const getSubscriptionFullAnnualPrice = (monthlyPrice: number): number => (
  roundCurrency(monthlyPrice * MONTHS_IN_YEAR)
);

export const getSubscriptionCharge = (monthlyPrice: number, period: SubscriptionPeriod): number => {
  if (period === 'annual') {
    return roundCurrency(getSubscriptionFullAnnualPrice(monthlyPrice) * (1 - SUBSCRIPTION_ANNUAL_DISCOUNT_RATE));
  }

  return roundCurrency(monthlyPrice);
};

export const getSubscriptionSavings = (monthlyPrice: number, period: SubscriptionPeriod): number => {
  if (period !== 'annual') {
    return 0;
  }

  return roundCurrency(getSubscriptionFullAnnualPrice(monthlyPrice) - getSubscriptionCharge(monthlyPrice, period));
};

export const getAnnualEquivalentMonthlyPrice = (monthlyPrice: number): number => (
  roundCurrency(getSubscriptionCharge(monthlyPrice, 'annual') / MONTHS_IN_YEAR)
);

export const calculateSubscriptionEndDate = (startedOn: Date, period: SubscriptionPeriod): Date => {
  const result = new Date(startedOn);
  const originalDay = result.getDate();

  result.setDate(1);
  result.setMonth(result.getMonth() + getSubscriptionDurationMonths(period));

  const lastDayOfTargetMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(originalDay, lastDayOfTargetMonth));

  return result;
};