/**
 * Clerk Authentication Configuration
 * Uses the same Clerk instance as the web platform
 */

import * as SecureStore from "expo-secure-store";

// Token cache for Clerk - stores auth tokens securely
export const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
  async clearToken(key: string) {
    try {
      return SecureStore.deleteItemAsync(key);
    } catch (err) {
      return;
    }
  },
};

// Clerk publishable key - same as web platform
// This should be set via environment variable in production
export const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
