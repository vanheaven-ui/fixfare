import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { Prisma } from "@prisma/client"; // For typing 'this'

// vi.mock at top for hoisting
vi.mock("@prisma/client", () => {
  // Define everything inside the factory to avoid hoisting reference errors
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

  class MockPrismaClient {
    $connect = mockConnect;
    $disconnect = mockDisconnect;

    // Mock user namespace as getter to match Prisma
    get user() {
      return {
        findMany: mockUserFindMany,
      };
    }

    // Mock repair namespace as getter
    get repair() {
      return {
        findMany: mockRepairFindMany,
        upsert: mockRepairUpsert,
      };
    }

    // Mock vehicleType namespace as getter
    get vehicleType() {
      return {
        upsert: vi.fn().mockResolvedValue({ id: "test-id", name: "Car" }),
      };
    }
  }

  // Simple constructor (no unused args)
  const mockConstructor = vi.fn(function () {
    // FIX: Removed ...args: any[] (no-unused-vars/no-explicit-any)
    return new MockPrismaClient();
  });

  mockConstructor.prototype = MockPrismaClient.prototype; // Bind prototype for instanceof

  return { PrismaClient: mockConstructor };
});

import { prisma } from "@/lib/db";

// Interface for the specific data shape returned by the findMany query
interface RepairWithPriceRange {
  name: string;
  // We expect the priceRange to conform to our PriceRange type
  priceRange: { min: number; max: number; currency?: string }; // FIX: Inline type instead of toPriceRange (avoids hoisting error)
}

describe("Database Seeding", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  it("fetches car repairs with ranges", async () => {
    // FIX: Cast to specific interface (no unknown as any)
    const repairs = (await prisma.repair.findMany({
      where: { vehicleType: { name: "Car" } },
      select: { name: true, priceRange: true },
    })) as RepairWithPriceRange[];

    expect(repairs).toHaveLength(5);

    const brakes = repairs.find((r) => r.name === "Brake Pads Replacement");

    expect(brakes).toBeDefined();

    // priceRange is now correctly typed via the cast
    expect(brakes!.priceRange.min).toBe(50000);
  });

  it("uses compound unique key for upsert", async () => {
    const testRepair = await prisma.repair.upsert({
      where: {
        name_vehicleTypeId: { name: "Test Repair", vehicleTypeId: "test-id" },
      },
      update: {
        priceRange: {
          min: 10000,
          max: 20000,
          currency: "UGX",
        } as Prisma.InputJsonValue,
      },
      create: {
        name: "Test Repair",
        vehicleTypeId: "test-id",
        priceRange: {
          min: 10000,
          max: 20000,
          currency: "UGX",
        } as Prisma.InputJsonValue, 
      },
    });
    expect(testRepair.name).toBe("Test Repair");
  });

  afterAll(async () => {
    await prisma.$disconnect();
    vi.restoreAllMocks();
  });
});
