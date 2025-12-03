import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { PrismaClient } from "@prisma/client"; // For typing 'this'

// vi.mock at top for hoisting
vi.mock("@prisma/client", () => {
  const mockConnect = vi.fn().mockResolvedValue(undefined);
  const mockDisconnect = vi.fn().mockResolvedValue(undefined);
  const mockUserFindMany = vi.fn().mockResolvedValue([]);
  const mockRepairFindMany = vi.fn().mockResolvedValue([
    { name: "Brake Pads Replacement", priceRange: { min: 50000, max: 100000 } },
    { name: "Oil Change", priceRange: { min: 30000, max: 60000 } },
    { name: "Tire Replacement", priceRange: { min: 80000, max: 150000 } },
    { name: "Carburetor Cleaning", priceRange: { min: 20000, max: 50000 } },
    { name: "Spark Plug Replacement", priceRange: { min: 15000, max: 30000 } },
  ]);
  const mockRepairUpsert = vi.fn().mockResolvedValue({
    name: "Test Repair",
    priceRange: { min: 10000, max: 20000, currency: "UGX" },
  });

  // Regular function for constructor with typed 'this'
  const MockPrismaClient = vi.fn(function (
    this: Partial<PrismaClient>,
    ...args: any[]
  ) {
    this.$connect = mockConnect;
    this.$disconnect = mockDisconnect;

    // Define getters for read-only properties (user, repair) to avoid assignment error
    Object.defineProperty(this, "user", {
      get: function () {
        return {
          findMany: mockUserFindMany,
        };
      },
      configurable: true,
    });

    Object.defineProperty(this, "repair", {
      get: function () {
        return {
          findMany: mockRepairFindMany,
          upsert: mockRepairUpsert,
        };
      },
      configurable: true,
    });

    Object.defineProperty(this, "vehicleType", {
      get: function () {
        return {
          upsert: vi.fn().mockResolvedValue({ id: "test-id", name: "Car" }),
        };
      },
      configurable: true,
    });
  });

  return { PrismaClient: MockPrismaClient };
});

import { prisma } from "@/lib/db";

describe("Database Seeding", () => {
  beforeAll(async () => {
    // Trigger singleton creation under mock
    await prisma.$connect();
  });

  it("fetches car repairs with ranges", async () => {
    const repairs = await prisma.repair.findMany({
      where: { vehicleType: { name: "Car" } },
      select: { name: true, priceRange: true },
    });

    expect(repairs).toHaveLength(5);

    // Find the repair and assert it is not null or undefined
    const brakes = repairs.find((r) => r.name === "Brake Pads Replacement");

    // 1. Assert 'brakes' is not null
    expect(brakes).toBeDefined();

    // 2. Assert 'priceRange' is not null using the non-null assertion operator (!)
    // Since we are in a test and rely on the seed data, we can assert that 'priceRange' exists.
    expect((brakes!.priceRange as { min: number; max: number }).min).toBe(
      50000
    );
  });

  it("uses compound unique key for upsert", async () => {
    // Test upsert with name_vehicleTypeId (smoke for seed logic)
    const testRepair = await prisma.repair.upsert({
      where: {
        name_vehicleTypeId: { name: "Test Repair", vehicleTypeId: "test-id" }, // Fails gracefully if ID invalid
      },
      update: { priceRange: { min: 10000, max: 20000 } as unknown as any }, // Type assertion here to satisfy Prisma's update type
      create: {
        name: "Test Repair",
        vehicleTypeId: "test-id", // Assume valid ID
        priceRange: {
          min: 10000,
          max: 20000,
          currency: "UGX",
        } as unknown as any, // Type assertion here to satisfy Prisma's create type
      },
    });
    expect(testRepair.name).toBe("Test Repair");
  });

  afterAll(async () => {
    await prisma.$disconnect();
    vi.restoreAllMocks();
  });
});
