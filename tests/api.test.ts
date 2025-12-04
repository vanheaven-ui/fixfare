import { describe, it, expect, vi } from "vitest";
import { POST } from "@/app/api/quotes/route";
import { prisma } from "@/lib/db";
import type { NextRequest } from "next/server";

// -----------------------------------------------------------------------------
// Prisma Mock
// -----------------------------------------------------------------------------

vi.mock("@/lib/db", () => ({
  prisma: {
    repair: {
      findFirst: vi.fn().mockResolvedValue({
        id: "repair-1",
        priceRange: { min: 50000, max: 100000 },
      }),
    },
    quote: {
      create: vi.fn().mockResolvedValue({
        id: "quote-1",
        shareLink: "abc123",
      }),
    },
  },
}));

// -----------------------------------------------------------------------------
// Mock Cookies
// -----------------------------------------------------------------------------

const mockCookies = {
  get: vi.fn(),
  getAll: vi.fn(),
  has: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(() => mockCookies), // Chainable
  [Symbol.iterator]: vi.fn(() => [][Symbol.iterator]()), // Simple iterator
};

// -----------------------------------------------------------------------------
// Helper: Create Mock NextRequest
// -----------------------------------------------------------------------------

/**
 * Creates a mock object satisfying the NextRequest interface.
 * Includes json() and text() methods to simulate request body parsing.
 */
function createMockNextRequest(body: any): NextRequest {
  const jsonBody = body;

  return {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    url: "http://localhost:3000/api/quotes",

    // Implement asynchronous parsing methods
    json: async () => jsonBody,
    text: async () => JSON.stringify(jsonBody),

    // Mock Next.js specific properties
    cookies: mockCookies,
    nextUrl: new URL("http://localhost:3000/api/quotes"),

    // Add other properties like body, signal if needed by your handler
  } as unknown as NextRequest;
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("API Routes: POST /api/quotes", () => {
  it("generates quote with range", async () => {
    const request = createMockNextRequest({
      vehicleType: "Car",
      repairName: "Brake Pads Replacement",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.shareLink).toBeDefined();
    expect(data.expectedRange.min).toBe(50000);
  });

  it("returns 400 for invalid input", async () => {
    const request = createMockNextRequest({
      vehicleType: "Invalid",
      repairName: "",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("returns 404 for unknown repair", async () => {
    // Override mock for this test
    vi.mocked(prisma.repair.findFirst).mockResolvedValueOnce(null);

    const request = createMockNextRequest({
      vehicleType: "Car",
      repairName: "Unknown Repair",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Repair not found");
  });
});
