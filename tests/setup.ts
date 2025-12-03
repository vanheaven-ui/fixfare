import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers"; // Using the fix from the last step

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

// Modernized Mock for window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,

    // Modern implementations, replacing the deprecated ones
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),

    // Keeping the deprecated ones as mock functions for compatibility
    // in case old libraries still call them (no longer deprecated comments needed)
    addListener: vi.fn(),
    removeListener: vi.fn(),

    dispatchEvent: vi.fn(),
  })),
});
