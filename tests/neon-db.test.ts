/**
 * Test to validate Neon database connection
 */

import { describe, it, expect } from "vitest";

describe("Neon Database Configuration", () => {
  it("should have NEON_DATABASE_URL set", () => {
    const dbUrl = process.env.NEON_DATABASE_URL;
    expect(dbUrl).toBeDefined();
    expect(dbUrl).not.toBe("");
  });

  it("should have valid PostgreSQL connection string format", () => {
    const dbUrl = process.env.NEON_DATABASE_URL;
    expect(dbUrl).toMatch(/^postgresql:\/\//);
    expect(dbUrl).toContain("@");
    expect(dbUrl).toContain("neon.tech");
  });

  it("should contain neondb database name", () => {
    const dbUrl = process.env.NEON_DATABASE_URL;
    expect(dbUrl).toContain("neondb");
  });

  it("should have SSL mode enabled", () => {
    const dbUrl = process.env.NEON_DATABASE_URL;
    expect(dbUrl).toContain("sslmode=require");
  });

  it("should parse connection string components", () => {
    const dbUrl = process.env.NEON_DATABASE_URL || "";
    const urlObj = new URL(dbUrl);
    
    expect(urlObj.protocol).toBe("postgresql:");
    expect(urlObj.hostname).toContain("neon.tech");
    expect(urlObj.pathname).toBe("/neondb");
    expect(urlObj.username).toBe("neondb_owner");
  });
});
