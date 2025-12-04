import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "**/coverage/**",
      "**/out/**",
      "**/build/**",
      "**/postcss.config.mjs",
      "**/seed.js", // FIX: Ignore JS seed script (no TS project)
    ],
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig, // Disable conflicting rules with Prettier
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      // Custom rules (add as needed)
      "@typescript-eslint/no-unused-vars": "error",
      "no-console": "warn",
    },
  },
  {
    files: ["**/*.{ts,tsx}"], // TS-specific config with parserOptions (only applies to TS files)
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: "./tsconfig.json",
      },
    },
  }
);
