/**
 * RevenueCat Products Configuration
 * Define all subscription products and their features
 */

export const SUBSCRIPTION_PRODUCTS = {
  MONTHLY: {
    id: "dfs_elite_monthly",
    displayName: "Monthly Premium",
    price: "$9.99",
    billingPeriod: "monthly",
    features: [
      "Unlimited AI Tutoring Sessions",
      "Unlimited Practice Quizzes",
      "Offline Study Mode",
      "Advanced Analytics",
      "Priority Support",
      "Custom Study Plans",
      "Voice Q&A",
    ],
  },
  ANNUAL: {
    id: "dfs_elite_annual",
    displayName: "Annual Premium",
    price: "$79.99",
    billingPeriod: "annual",
    features: [
      "Unlimited AI Tutoring Sessions",
      "Unlimited Practice Quizzes",
      "Offline Study Mode",
      "Advanced Analytics",
      "Priority Support",
      "Custom Study Plans",
      "Voice Q&A",
      "Save 33% vs Monthly",
    ],
  },
  TRIAL: {
    id: "dfs_elite_trial",
    displayName: "7-Day Free Trial",
    price: "Free",
    billingPeriod: "trial",
    features: [
      "Access all premium features",
      "7 days free",
      "Cancel anytime",
    ],
  },
};

export const FREE_TIER_LIMITS = {
  dailyQuizzesLimit: 3,
  dailyFlashcardsLimit: 50,
  monthlyAISessionsLimit: 5,
  storageLimit: "100MB",
};

export const PREMIUM_TIER_LIMITS = {
  dailyQuizzesLimit: -1, // Unlimited
  dailyFlashcardsLimit: -1, // Unlimited
  monthlyAISessionsLimit: -1, // Unlimited
  storageLimit: "1GB",
};

export function getProductDescription(productId: string): string {
  switch (productId) {
    case SUBSCRIPTION_PRODUCTS.MONTHLY.id:
      return "Get unlimited access to all premium features with monthly billing. Cancel anytime.";
    case SUBSCRIPTION_PRODUCTS.ANNUAL.id:
      return "Get unlimited access with annual billing and save 33% compared to monthly.";
    case SUBSCRIPTION_PRODUCTS.TRIAL.id:
      return "Try all premium features free for 7 days. No credit card required.";
    default:
      return "";
  }
}

export function isPremiumProduct(productId: string): boolean {
  return (
    productId === SUBSCRIPTION_PRODUCTS.MONTHLY.id ||
    productId === SUBSCRIPTION_PRODUCTS.ANNUAL.id ||
    productId === SUBSCRIPTION_PRODUCTS.TRIAL.id
  );
}

export function getMonthlyEquivalentPrice(productId: string): number {
  switch (productId) {
    case SUBSCRIPTION_PRODUCTS.MONTHLY.id:
      return 9.99;
    case SUBSCRIPTION_PRODUCTS.ANNUAL.id:
      return 79.99 / 12; // ~$6.66/month
    default:
      return 0;
  }
}
