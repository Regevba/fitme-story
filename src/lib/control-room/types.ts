/**
 * Shared types for the control-room data layer — UCC T31.
 *
 * These describe the on-disk shape of `.claude/features/<feature>/state.json`
 * and a couple of cross-parser wire shapes that the reconcile + builder
 * layers depend on.
 *
 * SERVER-ONLY: imported by parsers, reconcile, and builder at build time.
 */

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export interface StateFileTask {
  id: string;
  title?: string;
  status: string;
  depends_on?: string[];
  skill?: string;
  assigned_skill?: string;
  work_type?: string;
  priority_score?: number;
  effort_days?: number;
  started_at?: string;
  [key: string]: unknown;
}

export interface StateFile {
  feature?: string;
  current_phase?: string;
  work_type?: string;
  tasks?: StateFileTask[];
  [key: string]: unknown;
}

/**
 * fitme-story root, computed once from the location of this file.
 * `src/lib/control-room/` is 3 levels below the repo root.
 *
 * Uses `import.meta.url` (works under both ESM and tsx's CJS transpile)
 * rather than `import.meta.dirname` (ESM-only).
 */
const THIS_DIR = new URL('.', import.meta.url).pathname;
export const FITME_STORY_ROOT = resolve(THIS_DIR, '../../..');

/**
 * Default location of the FitTracker2 repo on disk.
 *
 * Local dev: clone FT2 as a sibling of fitme-story.
 * Vercel build: vercel.json buildCommand clones FT2 into `../FitTracker2`
 * before `npm run build` (see PRD §6, sync-from-fittracker2.ts).
 */
export const DEFAULT_FT2_ROOT = resolve(FITME_STORY_ROOT, '..', 'FitTracker2');

/**
 * Synced markdown snapshot dir produced by `npm run prebuild`. The sync
 * script preserves FT2's relative `docs/` layout under here, so passing
 * this as `repoRoot` to a markdown parser resolves the same paths
 * (`<root>/docs/product/backlog.md`, etc.) as a real FT2 root would.
 */
export const SNAPSHOT_DOCS_ROOT = resolve(FITME_STORY_ROOT, 'src', 'data', 'docs');

/**
 * Synced state.json snapshot dir — one flat `<feature>.json` per feature.
 * Different layout from FT2 (`.claude/features/<feature>/state.json`), so
 * `parseStateFiles` handles both via a runtime layout check.
 */
export const SNAPSHOT_FEATURES_DIR = resolve(FITME_STORY_ROOT, 'src', 'data', 'features');

/**
 * Pick the markdown source root: the synced snapshot if it has been
 * populated by `npm run prebuild`, otherwise the FT2 sibling. Resolves at
 * call time so a snapshot written mid-process is picked up immediately.
 */
export function resolveDefaultMarkdownRoot(): string {
  if (existsSync(resolve(SNAPSHOT_DOCS_ROOT, 'docs', 'product', 'backlog.md'))) {
    return SNAPSHOT_DOCS_ROOT;
  }
  return DEFAULT_FT2_ROOT;
}
