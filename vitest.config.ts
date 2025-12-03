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

    // Configuration for test coverage reporting
    coverage: {
      provider: "v8", // Recommended V8 provider for speed
      reporter: ["text", "json", "html", "clover"], // Reporters for console, CI, and local viewing
      // Files to include in coverage reporting
      include: ["app/**", "components/**", "lib/**"],
      // Files to exclude from coverage reporting
      exclude: ["node_modules/", "tests/"],
    },
  },

  // Resolve configuration for handling module imports
  resolve: {
    // Defines the path alias '@' to point to the project root directory
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
