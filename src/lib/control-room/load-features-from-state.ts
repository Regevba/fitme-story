/**
 * Live feature loader for /control-room/board + /control-room/table.
 *
 * Reads every `src/data/features/{slug}.json` (synced from FT2's
 * `.claude/features/{slug}/state.json` by `scripts/sync-from-fittracker2.ts`
 * at prebuild time) and transforms each into the `FeatureSeed` shape that the
 * Board + Table render layer consumes.
 *
 * Replaces the static `src/data/control-room-seeds/features.json` seed shipped
 * 2026-05-08 (PR #20), which had only 21 features and stopped reflecting FT2
 * reality. The synced data has 79 features (the full set of state.json files
 * on FT2 main).
 *
 * Sync gap (5 features): if FT2 main has N feature dirs but the mirror has
 * < N, the prebuild script ran against a snapshot at an earlier commit. The
 * Vercel buildCommand clones FT2 fresh on every deploy so production should
 * see the live count. Documented in fitme-story PR #152.
 */

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ────────────────────────────────────────────────────────────────────────────
// Path resolution (same pattern as load-ledgers.ts)
// ────────────────────────────────────────────────────────────────────────────

const FITME_STORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const FEATURES_DIR = path.join(FITME_STORY_ROOT, 'src', 'data', 'features');

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

/** Public output — matches the existing `FeatureSeed` interface that Board +
 *  Table consume. Stable across sync-source migrations. */
export interface FeatureSeed {
  name: string;
  slug: string;
  phase: string | null;
  priority: string | null;
  rice: number | null;
  category: string | null;
  shipped: string | null;
  prd: string | null;
}

/** Subset of state.json fields we actually read. */
interface StateJson {
  feature?: string;
  current_phase?: string;
  work_type?: 'feature' | 'enhancement' | 'fix' | 'chore' | string;
  case_study?: string | null;
  case_study_showcase?: string | null;
  prd_path?: string | null;
  parent_feature?: string | null;
  has_ui?: boolean;
  requires_analytics?: boolean;
  transitions?: Array<{
    from?: string | null;
    to?: string;
    timestamp?: string;
  }>;
  /** v7.8.3+ */
  state_owner?: 'ft2' | 'fitme-story';
}

// ────────────────────────────────────────────────────────────────────────────
// Transformations
// ────────────────────────────────────────────────────────────────────────────

/** "adaptive-intelligence" → "Adaptive Intelligence"
 *  "ucc-passkey-auth-audit-log-redis-fix" → "UCC Passkey Auth — Audit Log Redis Fix" */
function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((part) => {
      // Preserve common all-caps acronyms
      const upper = part.toUpperCase();
      if (['UCC', 'AI', 'UI', 'UX', 'API', 'PR', 'PRD', 'CSV', 'OTP', 'PPL', 'JSON'].includes(upper)) {
        return upper;
      }
      // Title-case
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}

/** Derive priority from work_type. State.json doesn't carry an explicit
 *  priority field — work_type is the closest proxy that's structured. */
function workTypeToPriority(workType: string | undefined): string | null {
  switch (workType) {
    case 'feature':
      return 'high';
    case 'enhancement':
      return 'medium';
    case 'fix':
      return 'medium';
    case 'chore':
      return 'low';
    default:
      return null;
  }
}

/** Derive a coarse category from feature-name patterns. Categories match the
 *  old static seed's vocabulary: product / framework / infra. */
function deriveCategory(slug: string): string {
  if (slug.startsWith('framework-') || slug.includes('-framework-')) return 'framework';
  if (slug.includes('infra') || slug.includes('hadf') || slug.includes('orchid')) return 'infra';
  if (slug.startsWith('ucc-') || slug.includes('passkey') || slug.includes('audit-log')) return 'infra';
  if (slug.startsWith('analytics') || slug.includes('observability') || slug.includes('meta-analysis')) return 'infra';
  if (slug.includes('test-coverage') || slug.includes('dispatch-test')) return 'infra';
  return 'product';
}

/** Find the date the feature transitioned to `complete` (ship date). */
function findShipDate(state: StateJson): string | null {
  if (state.current_phase !== 'complete') return null;
  const completeTransition = state.transitions?.find((t) => t.to === 'complete');
  if (completeTransition?.timestamp) {
    return completeTransition.timestamp.slice(0, 10); // ISO date only
  }
  return null;
}

/** Compute a public-link PRD path if the state declares one. */
function derivePrdLink(state: StateJson, slug: string): string | null {
  if (state.prd_path) return state.prd_path;
  // Fall back to conventional location — the Board page already handles
  // unknown PRDs by linking to the feature dir on GitHub.
  return null;
}

// ────────────────────────────────────────────────────────────────────────────
// Main loader
// ────────────────────────────────────────────────────────────────────────────

/** Read every synced `src/data/features/*.json`, transform to FeatureSeed.
 *  Returns sorted by ship date desc (shipped first), then by name. */
export function loadFeaturesFromState(): FeatureSeed[] {
  let entries: string[];
  try {
    entries = readdirSync(FEATURES_DIR).filter((f) => f.endsWith('.json'));
  } catch {
    return [];
  }

  const features: FeatureSeed[] = [];
  for (const file of entries) {
    try {
      const raw = readFileSync(path.join(FEATURES_DIR, file), 'utf8');
      const state = JSON.parse(raw) as StateJson;
      const slug = state.feature ?? file.replace(/\.json$/, '');

      features.push({
        name: slugToTitle(slug),
        slug,
        phase: state.current_phase ?? null,
        priority: workTypeToPriority(state.work_type),
        rice: null, // state.json doesn't carry RICE; surfaced via backlog.md
        category: deriveCategory(slug),
        shipped: findShipDate(state),
        prd: derivePrdLink(state, slug),
      });
    } catch {
      // Skip malformed state.json files; surfaced via cycle-time integrity gates.
    }
  }

  // Sort: shipped (with date) first by date desc; in-flight next by name asc.
  features.sort((a, b) => {
    if (a.shipped && b.shipped) return b.shipped.localeCompare(a.shipped);
    if (a.shipped) return -1;
    if (b.shipped) return 1;
    return a.name.localeCompare(b.name);
  });

  return features;
}

/** Grouped variant matching the old `FeaturesSeedFile` shape so the Board +
 *  Table pages can swap import sources without restructuring their flatten
 *  logic. The grouping is derived from `current_phase`. */
export interface GroupedFeatures {
  shipped: FeatureSeed[];
  planned: FeatureSeed[];
  backlog: FeatureSeed[];
}

const SHIPPED_PHASES = new Set([
  'complete',
  'done',
  'merge',
  'documentation',
  'docs',
]);
const BACKLOG_PHASES = new Set(['backlog']);

export function loadFeaturesGrouped(): GroupedFeatures {
  const all = loadFeaturesFromState();
  const out: GroupedFeatures = { shipped: [], planned: [], backlog: [] };
  for (const f of all) {
    const phase = f.phase ?? 'backlog';
    if (SHIPPED_PHASES.has(phase)) {
      out.shipped.push(f);
    } else if (BACKLOG_PHASES.has(phase)) {
      out.backlog.push(f);
    } else {
      out.planned.push(f);
    }
  }
  return out;
}
