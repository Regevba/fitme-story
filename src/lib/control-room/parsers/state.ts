/**
 * State-file parser — UCC T31 port from
 * dashboard/src/scripts/parsers/state.js (FitTracker2 Astro source).
 *
 * Reads every PM-workflow `state.json` and returns a flat array. Two
 * layouts are supported transparently:
 *
 *   - FT2 source layout: `<repoRoot>/.claude/features/<feature>/state.json`
 *   - Synced snapshot:   `src/data/features/<feature>.json`
 *
 * The snapshot is preferred when it exists (no FT2 sibling required at
 * build time on Vercel). Malformed files are skipped silently — the
 * integrity-check cycle owns the alerting path for malformed state files.
 *
 * SERVER-ONLY: imported by builder.ts (build-time Server Component).
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

import {
  DEFAULT_FT2_ROOT,
  SNAPSHOT_FEATURES_DIR,
  type StateFile,
} from '../types';

function readFt2Layout(featuresDir: string): StateFile[] {
  const features: StateFile[] = [];
  for (const dir of readdirSync(featuresDir, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const statePath = join(featuresDir, dir.name, 'state.json');
    if (!existsSync(statePath)) continue;

    try {
      const data = JSON.parse(readFileSync(statePath, 'utf-8')) as StateFile;
      features.push(data);
    } catch {
      // Skip malformed state files — integrity-check cycle owns alerting.
    }
  }
  return features;
}

function readSnapshotLayout(snapshotDir: string): StateFile[] {
  const features: StateFile[] = [];
  for (const entry of readdirSync(snapshotDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    const statePath = join(snapshotDir, entry.name);

    try {
      const data = JSON.parse(readFileSync(statePath, 'utf-8')) as StateFile;
      features.push(data);
    } catch {
      // Skip malformed state files — integrity-check cycle owns alerting.
    }
  }
  return features;
}

export function parseStateFiles(repoRoot?: string): StateFile[] {
  // Explicit repoRoot wins (used by tests + by callers that want FT2 truth).
  if (repoRoot) {
    const dir = resolve(repoRoot, '.claude/features');
    if (existsSync(dir)) return readFt2Layout(dir);
    return [];
  }

  // Prefer the synced snapshot (works on Vercel without FT2 cloned).
  if (existsSync(SNAPSHOT_FEATURES_DIR)) {
    return readSnapshotLayout(SNAPSHOT_FEATURES_DIR);
  }

  // Fall back to the FT2 sibling.
  const ft2Dir = resolve(DEFAULT_FT2_ROOT, '.claude/features');
  if (existsSync(ft2Dir)) return readFt2Layout(ft2Dir);

  return [];
}
