/**
 * RevenueCat Configuration for DFS Elite Study Planner
 * Handles subscription billing and entitlements
 */

import Purchases, { PurchasesPackage } from "react-native-purchases";
import { Platform } from "react-native";

const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || "";

// Product identifiers
export const PRODUCTS = {
  MONTHLY: "dfs_elite_monthly",
  ANNUAL: "dfs_elite_annual",
};

// Entitlement identifier
export const ENTITLEMENTS = {
  PREMIUM: "premium",
};

class RevenueCatManager {
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      // Set API key
      if (REVENUECAT_API_KEY) {
        await Purchases.configure({
          apiKey: REVENUECAT_API_KEY,
          appUserID: undefined, // Let RevenueCat generate anonymous ID
        });
        this.initialized = true;
      }
    } catch (error) {
      console.error("RevenueCat initialization error:", error);
    }
  }

  async getOfferings() {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current?.availablePackages || [];
    } catch (error) {
      console.error("Error fetching offerings:", error);
      return [];
    }
  }

  async purchasePackage(pkg: PurchasesPackage) {
    try {
      const purchaserInfo = await Purchases.purchasePackage(pkg);
      return purchaserInfo;
    } catch (error) {
      console.error("Purchase error:", error);
      throw error;
    }
  }

  async restorePurchases() {
    try {
      const purchaserInfo = await Purchases.restorePurchases();
      return purchaserInfo;
    } catch (error) {
      console.error("Restore purchases error:", error);
      throw error;
    }
  }

  async isPremium(): Promise<boolean> {
    try {
      const purchaserInfo = await Purchases.getCustomerInfo();
      return purchaserInfo.entitlements.active[ENTITLEMENTS.PREMIUM] !== undefined;
    } catch (error) {
      console.error("Error checking premium status:", error);
      return false;
    }
  }

  async getCustomerInfo() {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error("Error getting customer info:", error);
      return null;
    }
  }

  async setAttributes(attributes: Record<string, string>) {
    try {
      await Purchases.setAttributes(attributes);
    } catch (error) {
      console.error("Error setting attributes:", error);
    }
  }
}

export const revenueCat = new RevenueCatManager();
