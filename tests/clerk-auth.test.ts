/**
 * Test to validate Clerk API keys are properly configured
 */

import { describe, it, expect } from "vitest";

describe("Clerk Authentication Configuration", () => {
  it("should have EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY set", () => {
    const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
    expect(publishableKey).toBeDefined();
    expect(publishableKey).not.toBe("");
    expect(publishableKey?.startsWith("pk_")).toBe(true);
  });

  it("should have CLERK_SECRET_KEY set", () => {
    const secretKey = process.env.CLERK_SECRET_KEY;
    expect(secretKey).toBeDefined();
    expect(secretKey).not.toBe("");
    expect(secretKey?.startsWith("sk_")).toBe(true);
  });

  it("should be able to validate publishable key format", () => {
    const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
    // Clerk publishable keys follow format: pk_test_* or pk_live_*
    const isValidFormat = publishableKey?.match(/^pk_(test|live)_[a-zA-Z0-9]+$/);
    expect(isValidFormat).toBeTruthy();
  });

  it("should be able to validate secret key format", () => {
    const secretKey = process.env.CLERK_SECRET_KEY;
    // Clerk secret keys follow format: sk_test_* or sk_live_*
    const isValidFormat = secretKey?.match(/^sk_(test|live)_[a-zA-Z0-9]+$/);
    expect(isValidFormat).toBeTruthy();
  });
});
