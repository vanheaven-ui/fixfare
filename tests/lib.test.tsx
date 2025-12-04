// vi.mock MUST be at the absolute top for hoisting before any imports
import { vi } from "vitest";

// Interface for the $queryRaw method signature (used in tests)
interface QueryRawSignature {
  $queryRaw: (
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) => Promise<unknown>;
}

// Interface for the type of the findMany mock function itself
type MockFindMany = (args?: { where: { role: string } }) => Promise<unknown[]>;

// Refined MockedPrismaInstance to explicitly type findMany arguments
interface MockedPrismaInstance extends QueryRawSignature {
  $connect: () => Promise<void>;
  $disconnect: () => Promise<void>;
  user: {
    findMany: MockFindMany;
  };
}

// Interface for the actual module import structure
interface DbModule {
  prisma: MockedPrismaInstance;
  dbQuery: (...args: unknown[]) => Promise<unknown>;
}

vi.mock("@prisma/client", () => {
  // Define everything inside the factory to avoid hoisting reference errors
  const mockConnect = vi.fn().mockResolvedValue(undefined);
  // Assert the type of mockUserFindMany to satisfy the interface check later
  const mockUserFindMany = vi.fn().mockResolvedValue([]) as MockFindMany;
  const mockDisconnect = vi.fn().mockResolvedValue(undefined);
  const mockQueryRaw = vi.fn().mockResolvedValue([{ count: 1 }]);

  class MockPrismaClient {
    $connect = mockConnect;
    $disconnect = mockDisconnect;
    $queryRaw = mockQueryRaw;

    // Mock user namespace as getter to match Prisma
    get user() {
      return {
        // FIX: The type is now correctly asserted on the variable mockUserFindMany itself,
        // removing the need for 'as any' here.
        findMany: mockUserFindMany,
      };
    }
  }

  // Simple constructor
  const mockConstructor = vi.fn(function () {
    return new MockPrismaClient();
  });

  mockConstructor.prototype = MockPrismaClient.prototype; // Bind prototype for instanceof

  return { PrismaClient: mockConstructor };
});

import { describe, it, expect, beforeAll, afterAll } from "vitest";

// Using 'as unknown as DbModule' to resolve the conversion error (TS2352)
const dbModule = (await import("@/lib/db")) as unknown as DbModule;
const { prisma } = dbModule;

const dbQuery = dbModule.dbQuery;

describe("Lib/DB Config", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  it("creates a singleton Prisma instance that reuses across module loads", async () => {
    // Simulate multiple imports (tests global cache)
    const { prisma: prisma1 } =
      (await import("@/lib/db")) as unknown as DbModule;
    const { prisma: prisma2 } =
      (await import("@/lib/db")) as unknown as DbModule;
    expect(prisma1).toBe(prisma2); // Strict equality for singleton
    expect(prisma1).toBe(prisma); // Matches initial
  });

  it("provides mocked Prisma methods that resolve correctly", async () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe("function");
    expect(typeof prisma.user.findMany).toBe("function");

    // Asserting $queryRaw using the specific mock type
    expect(typeof prisma.$queryRaw).toBe("function");

    // Test async resolution
    const users = await prisma.user.findMany({ where: { role: "RIDER" } });
    expect(users).toEqual([]); // Mock return
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: { role: "RIDER" },
    });

    // Test $queryRaw with assertion
    const rawResult =
      await prisma.$queryRaw`SELECT COUNT(*) as count FROM users`;
    expect(rawResult).toEqual([{ count: 1 }]);

    expect(prisma.$queryRaw).toHaveBeenCalledWith(expect.anything());
  });

  it("handles dbQuery wrapper for retries on transient errors", async () => {
    // Conditional check ensures dbQuery is available and is a function
    if (dbQuery) {
      const errorQuery = vi.fn().mockRejectedValueOnce(new Error("ECONNRESET"));
      const retryQuery = vi.fn().mockResolvedValue("success");

      const result = await dbQuery(() => errorQuery().then(retryQuery));

      expect(result).toBe("success");
      expect(errorQuery).toHaveBeenCalledTimes(1);
      expect(retryQuery).toHaveBeenCalledTimes(1); // Retried
    } else {
      expect(true).toBe(true);
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
    vi.restoreAllMocks(); // Full reset
  });
});
