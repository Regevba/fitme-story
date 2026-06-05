/**
 * src/lib/framework-snapshot.ts
 *
 * T-snapshot-loader — final Phase 4.A task of the 3D Universe feature.
 * Single typed entry point for scene components to consume the four
 * build-time framework data files emitted by the sync script:
 *
 *   1. feature-roster.json    (locked OQ-2 contract, T-aggregator PR #182)
 *   2. versions.json          (T-versions-mirror, PR #183)
 *   3. adoption-snapshot.json (T-adoption-mirror, PR #183, renamed
 *                              from FT2's measurement-adoption.json)
 *   4. pattern-skill-map.json (T-pattern-skill-mirror, PR #183)
 *
 * Design intent (per 3D Universe PRD §Data Contracts):
 *
 *   • Scene components import named exports rather than parsing paths
 *     themselves — keeps `src/data/framework/` an implementation detail.
 *   • Each surface ships with a minimal TS shape covering only the fields
 *     consumed by current scene components. The full JSON shape is wider
 *     (especially `versions.json` with 18 top-level keys); we intentionally
 *     under-type to keep the contract stable across upstream additions.
 *   • All imports use the static `import * as` form because the JSON is
 *     committed to the repo. The bundler inlines the data into the
 *     framework page's deferred chunk; no runtime fetch.
 *   • Acts III/IV consume `pattern-skill-map.json`; Act V consumes
 *     `adoption-snapshot.json`; Act VI consumes `feature-roster.json`;
 *     Acts I-II consume `versions.json` (timeline + per-version stats).
 *
 * See also:
 *   - 3D Universe Phase 2 tasks.md (T-snapshot-loader spec)
 *   - 3D Universe PRD §Data Contracts (locked OQ-2 schema)
 *   - FT2 fs PR #182 (T-aggregator) + #183 (G.2 mirrors)
 */

import featureRosterJson from '../data/framework/feature-roster.json';
import versionsJson from '../data/framework/versions.json';
import adoptionJson from '../data/framework/adoption-snapshot.json';
import patternSkillMapJson from '../data/framework/pattern-skill-map.json';

// ─── feature-roster.json — locked OQ-2 contract ──────────────────────────

export type FeatureRosterStatus =
  | 'paused'
  | 'in_progress'
  | 'complete'
  | 'cancelled'
  | 'unknown';

export interface FeatureRosterEntry {
  slug: string;
  status: FeatureRosterStatus;
  framework_version: string | null;
  current_phase: string;
  case_study: string | null;
  parent_feature: string | null;
  state_owner: 'ft2' | 'fitme-story' | null;
  isolation_opt_out: boolean;
  has_brainstorm: boolean;
}

export interface FeatureRosterFile {
  schema_version: '1.0.0';
  generated_at: string;
  entries: FeatureRosterEntry[];
}

// Cast through `unknown` is intentional. The committed JSON is a wider
// surface than the TS interfaces we expose; TypeScript's strict-overlap
// check rejects a direct `as Type` cast even when we know the shape is
// compatible. This is the same pattern used elsewhere in the codebase for
// under-typed JSON imports.
export const featureRoster = featureRosterJson as unknown as FeatureRosterFile;

// ─── versions.json — framework version manifest ──────────────────────────
//
// Intentionally under-typed: we expose only the surfaces Act I/II render
// from. Other fields (`mechanisms`, `phases`, `work_types`, etc.) are
// accessible via the raw JSON if scene components need them later.

export interface VersionTimelineEntry {
  version: string;
  date?: string;
  label?: string;
  highlight?: string;
}

export interface FrameworkVersions {
  schema_version: string;
  current: {
    version: string;
    [k: string]: unknown;
  };
  next: {
    version?: string;
    [k: string]: unknown;
  };
  timeline: VersionTimelineEntry[];
  [k: string]: unknown;
}

export const frameworkVersions = versionsJson as unknown as FrameworkVersions;

// ─── adoption-snapshot.json — Act V bar source ───────────────────────────
//
// Wider shape than scenes typically consume; we under-type to the
// 4-dimension percentage surface that Act V's bars need.

export interface AdoptionDimensionCoverage {
  /** Numerator/denominator slice of features that have BOTH cu_v2 and
   *  cache_hits and per_phase_timing populated. */
  fully_adopted_post_v6?: number;
  any_adopted_post_v6?: number;
  features_post_v6?: number;
  [k: string]: unknown;
}

export interface AdoptionSnapshot {
  version: string;
  updated: string;
  v6_ship_date?: string;
  dimension_coverage?: AdoptionDimensionCoverage;
  fully_adopted_features?: string[];
  partial_adopted_features?: string[];
  [k: string]: unknown;
}

export const adoptionSnapshot = adoptionJson as unknown as AdoptionSnapshot;

// ─── pattern-skill-map.json — Acts III/IV overlay source ─────────────────

export interface PatternSkillMapEntry {
  id: string;
  title: string;
  section: 'gate' | 'workflow';
  blocker: boolean;
  detector: 'mechanized' | 'manual' | 'hybrid';
  autoheal: boolean;
  skills: string[];
  remediation?: string;
}

export const patternSkillMap = patternSkillMapJson as unknown as PatternSkillMapEntry[];

// ─── Unified accessor ────────────────────────────────────────────────────
//
// `loadFrameworkSnapshot()` returns all 4 surfaces in a single typed
// object. Scene components that consume multiple surfaces can destructure
// what they need; components that consume one can keep importing the
// named export directly.

export interface FrameworkSnapshot {
  featureRoster: FeatureRosterFile;
  versions: FrameworkVersions;
  adoption: AdoptionSnapshot;
  patternSkillMap: PatternSkillMapEntry[];
}

export function loadFrameworkSnapshot(): FrameworkSnapshot {
  return {
    featureRoster,
    versions: frameworkVersions,
    adoption: adoptionSnapshot,
    patternSkillMap,
  };
}

// ─── Helper accessors per scene-component use case ───────────────────────

/** Feature slugs grouped by status. Used by Act VI monument layout. */
export function featuresByStatus(): Record<FeatureRosterStatus, string[]> {
  const out: Record<FeatureRosterStatus, string[]> = {
    paused: [],
    in_progress: [],
    complete: [],
    cancelled: [],
    unknown: [],
  };
  for (const e of featureRoster.entries) out[e.status].push(e.slug);
  return out;
}

/** Patterns mapped to a given skill. Used by Act IV hover-card to look up
 * `pattern-skill-map.json` entries when the scene shows a skill chip. */
export function patternsForSkill(skill: string): PatternSkillMapEntry[] {
  return patternSkillMap.filter((p) => p.skills.includes(skill));
}

/** Pattern by id. Used by Act IV gate-fire signage to look up a specific
 * W-number's title + remediation when the scene shows the firing gate. */
export function patternById(id: string): PatternSkillMapEntry | undefined {
  return patternSkillMap.find((p) => p.id === id);
}
