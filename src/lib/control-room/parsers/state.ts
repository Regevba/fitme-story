/**
 * state.json parser — UCC T31 port from
 * dashboard/src/scripts/parsers/state.js (FitTracker2 Astro source).
 *
 * Reads every .claude/features/{slug}/state.json under the FitTracker2 repo
 * (cloned at build time per vercel.json) and returns the parsed payload.
 *
 * Includes the v7.7 dashboard-fix backstop: ensures `data.feature` is always
 * populated (falls back through `feature_name` → directory name) so
 * downstream consumers like reconcile() never see undefined when v7.7+
 * state.json files use the new `feature_name` schema. This was the
 * 2026-04-28 dashboard 500 we hit immediately after v7.7 shipped.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import type { StateFile } from '../types';
import { resolveRepoRoot } from './shared';

/**
 * Read all .claude/features state.json files from the FitTracker2 repo.
 *
 * Returns an array of {@link StateFile} payloads. Each entry's `feature`
 * field is guaranteed to be a non-empty string (backstopped from
 * `feature_name` or the directory name) — callers never need to null-check
 * before calling `.toLowerCase()` etc.
 *
 * Malformed state.json files are silently skipped. The dashboard's 72h
 * integrity cycle is the canonical detector for malformed state files;
 * the dashboard parser stays graceful.
 */
export function parseStateFiles(repoRoot?: string): StateFile[] {
  const root = repoRoot ?? resolveRepoRoot();
  const featuresDir = resolve(root, '.claude/features');

  if (!existsSync(featuresDir)) return [];

  const features: StateFile[] = [];
  for (const dir of readdirSync(featuresDir, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const statePath = join(featuresDir, dir.name, 'state.json');
    if (!existsSync(statePath)) continue;

    try {
      const data = JSON.parse(readFileSync(statePath, 'utf-8')) as StateFile;
      // Backstop the canonical `feature` key. v7.7+ schema introduced
      // `feature_name`; the rest of the dashboard pipeline reads `feature`.
      if (!data.feature) {
        data.feature = data.feature_name || dir.name;
      }
      features.push(data);
    } catch {
      // Skip malformed state files
    }
  }

  return features;
}
