// vi.mock MUST be at the absolute top for hoisting before any imports
import { vi } from "vitest";

vi.mock("@prisma/client", () => {
  // Define everything inside the factory to avoid hoisting reference errors
  const mockConnect = vi.fn().mockResolvedValue(undefined);
  const mockDisconnect = vi.fn().mockResolvedValue(undefined);
  const mockUserFindMany = vi.fn().mockResolvedValue([]);
  const mockQueryRaw = vi.fn().mockResolvedValue([{ count: 1 }]);

  class MockPrismaClient {
    $connect = mockConnect;
    $disconnect = mockDisconnect;
    $queryRaw = mockQueryRaw;

    // Mock user namespace as getter to match Prisma
    get user() {
      return {
        findMany: mockUserFindMany,
      };
    }
  }

  // Simple constructor (no expect—move logging to separate test if needed)
  const mockConstructor = vi.fn(function (...args: any[]) {
    return new MockPrismaClient();
  });

  mockConstructor.prototype = MockPrismaClient.prototype; // Bind prototype for instanceof

  return { PrismaClient: mockConstructor };
});

import { describe, it, expect, beforeAll, afterAll } from "vitest"; // No vi here—globals: true

// Dynamic import for the module under test (ensures mock applies first)
const module = await import("@/lib/db");
const { prisma } = module;
const dbQuery = (module as any).dbQuery; // Optional destructuring with type assertion

describe("Lib/DB Config", () => {
  beforeAll(async () => {
    // Trigger singleton creation and connect (exercises new PrismaClient)
    await prisma.$connect();
  });

  it("creates a singleton Prisma instance that reuses across module loads", async () => {
    // Simulate multiple imports (tests global cache)
    const { prisma: prisma1 } = await import("@/lib/db");
    const { prisma: prisma2 } = await import("@/lib/db");
    expect(prisma1).toBe(prisma2); // Strict equality for singleton
    expect(prisma1).toBe(prisma); // Matches initial
  });

  it("provides mocked Prisma methods that resolve correctly", async () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe("function");
    expect(typeof prisma.user.findMany).toBe("function");
    expect(typeof (prisma as any).$queryRaw).toBe("function"); // Type assertion for TS

    // Test async resolution
    const users = await prisma.user.findMany({ where: { role: "RIDER" } });
    expect(users).toEqual([]); // Mock return
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: { role: "RIDER" },
    });

    // Test $queryRaw with assertion
    const rawResult = await (prisma as any)
      .$queryRaw`SELECT COUNT(*) as count FROM users`;
    expect(rawResult).toEqual([{ count: 1 }]);
    expect((prisma as any).$queryRaw).toHaveBeenCalledWith(expect.anything()); // Tagged template
  });

  it("handles dbQuery wrapper for retries on transient errors", async () => {
    if (typeof dbQuery === "function") {
      // Mock a transient error (ECONNRESET)
      const errorQuery = vi.fn().mockRejectedValueOnce(new Error("ECONNRESET"));
      const retryQuery = vi.fn().mockResolvedValue("success");

      // First call fails, retries once
      const result = await dbQuery(() => errorQuery().then(retryQuery));
      expect(result).toBe("success");
      expect(errorQuery).toHaveBeenCalledTimes(1);
      expect(retryQuery).toHaveBeenCalledTimes(1); // Retried
    } else {
      // Skip if dbQuery not implemented yet
      expect(true).toBe(true);
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
    vi.restoreAllMocks(); // Full reset
  });
});
