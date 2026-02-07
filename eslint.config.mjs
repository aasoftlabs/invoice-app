import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...compat.extends("prettier"),
  {
    rules: {
      // Vercel React Best Practices
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/button-has-type": "warn",
      "react/function-component-definition": "warn",
      "react/hook-use-state": "warn",
      "react/jsx-boolean-value": "warn",
      "react/jsx-curly-brace-presence": "warn",
      "react/jsx-fragments": "warn",
      "react/jsx-no-leaked-render": "warn",
      "react/jsx-no-target-blank": ["error", { allowReferrer: true }],
      "react/jsx-no-useless-fragment": ["warn", { allowExpressions: true }],
      "react/jsx-pascal-case": "warn",
      "react/no-array-index-key": "warn",
      "react/no-unstable-nested-components": "error",
      "react/self-closing-comp": "warn",
      "jsx-a11y/no-onchange": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
