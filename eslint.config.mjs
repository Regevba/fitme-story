import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // T13 — unified-control-center extraction-readiness rule (PRD §7.2).
  // Showcase code MUST NOT import from any */control-room/* path.
  // Dashboard code MAY import from showcase shared components (Hero,
  // NumbersPanel, MetricsCard, Disclosure, Site*) — that direction is fine.
  // The asymmetry is what keeps the extraction recipe (EXTRACTION-RECIPE.md)
  // a 1-line `git mv` operation when the dashboard is split out later.
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    ignores: [
      "src/app/control-room/**/*",
      "src/components/control-room/**/*",
      "src/lib/control-room/**/*",
      "src/proxy.ts",
    ],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["**/control-room/*", "**/control-room", "@/components/control-room/*", "@/lib/control-room/*"],
          message: "Showcase code must not import dashboard code (PRD §7.2 — extraction-readiness rule). Dashboard files belong under src/{app,components,lib}/control-room/* + src/proxy.ts + scripts/sync-from-fittracker2.ts.",
        }],
      }],
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
