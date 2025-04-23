import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Ignore patterns (replacing .eslintignore)
  {
    ignores: [
      // Build output
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",

      // Node modules
      "node_modules/**",

      // Cache
      ".cache/**",
      ".eslintcache",

      // Environment variables
      ".env*",
      "!.env.example",

      // Public assets
      "public/**",

      // Generated files
      "*.generated.*",
      "next-env.d.ts",

      // Config files
      "next.config.js",
      "next.config.mjs",
      "next.config.ts",
      "postcss.config.js",
      "postcss.config.mjs",
      "tailwind.config.js",
      "tailwind.config.ts"
    ]
  },

  // Base configurations
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // TypeScript specific rules
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // Handle unused variables
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
      "no-unused-vars": "off", // Turn off the base rule as it can report incorrect errors

      // Enforce consistent type imports
      "@typescript-eslint/consistent-type-imports": ["warn", {
        "prefer": "type-imports",
        "disallowTypeAnnotations": false
      }],

      // Prevent React import when using JSX with React 17+
      "react/react-in-jsx-scope": "off",

      // Enforce consistent React component definition
      "react/function-component-definition": ["warn", {
        "namedComponents": ["function-declaration", "arrow-function"],
        "unnamedComponents": "arrow-function"
      }],

      // Enforce proper prop types
      "react/prop-types": "off", // TypeScript handles this

      // Enforce consistent imports
      "import/order": ["warn", {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "pathGroups": [
          {
            "pattern": "react",
            "group": "builtin",
            "position": "before"
          },
          {
            "pattern": "@/**",
            "group": "internal",
            "position": "after"
          }
        ],
        "pathGroupsExcludedImportTypes": ["react"],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }]
    }
  },

  // React specific rules
  {
    files: ["**/*.tsx"],
    rules: {
      // Enforce hook rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  }
];

export default eslintConfig;
