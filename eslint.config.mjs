import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Vendored from bazza/ui: generic `any`s are intentional, and its hook patterns predate the React Compiler rules.
    files: ["components/data-table/filter/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/use-memo": "warn",
      "react-hooks/refs": "warn",
    },
  },
  globalIgnores([".next/**", "public/r/**", "next-env.d.ts", "components/ui/**"]),
]);
