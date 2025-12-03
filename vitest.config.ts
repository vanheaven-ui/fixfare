import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// Define the configuration for Vitest
export default defineConfig({
  // Plugins are essential for processing files like .tsx
  plugins: [
    // This plugin allows Vite/Vitest to process React components (JSX/TSX)
    react(),
  ],

  // Vitest specific configuration
  test: {
    // Sets the testing environment to Happy DOM for browser-like DOM APIs
    environment: "happy-dom",
    // Enables global APIs (like 'describe', 'it', 'expect') without explicit import
    globals: true,
    // Runs your setup file before every test suite
    setupFiles: ["./tests/setup.ts"],
    // Includes only relevant test files
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    // Excludes irrelevant files from test discovery
    exclude: ["node_modules/", "dist/"],
    // Snapshot format options for better JSX handling (no escapeDollar—invalid prop)
    snapshotFormat: {
      printBasicPrototype: false, // Keeps snapshots clean (Vitest default; set true for more verbose)
    },
    // Configuration for test coverage reporting
    coverage: {
      provider: "v8", // Recommended V8 provider for speed
      reporter: ["text", "json", "html", "clover"], // Reporters for console, CI, and local viewing
      // Files to include in coverage reporting
      include: ["app/**", "components/**", "lib/**"],
      // Files to exclude from coverage reporting
      exclude: ["node_modules/", "tests/"],
      // Enforce minimum coverage thresholds (fails tests if below)
      thresholds: {
        lines: 30,
        statements: 30,
        functions: 20,
        branches: 20,
      },
    },
  },

  // Resolve configuration for handling module imports
  resolve: {
    // Defines the path alias '@' to point to the project root directory (matches tsconfig.json)
    alias: {
      "@": path.resolve(__dirname, "./"),
      // Optional sub-aliases for common dirs (extend as needed)
      "@/components": path.resolve(__dirname, "./components"),
      "@/lib": path.resolve(__dirname, "./lib"),
    },
  },
});
