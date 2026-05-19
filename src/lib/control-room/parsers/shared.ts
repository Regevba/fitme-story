/**
 * Shared helpers for the control-room parsers.
 *
 * Centralizes the FitTracker2 repo-root resolution so each parser doesn't
 * duplicate the env-var-or-sibling-clone fallback. Tests + local dev set
 * `FITTRACKER_REPO_ROOT`; the Vercel build step clones FT2 to the sibling
 * path expected by the default branch.
 */

import { resolve } from 'node:path';

export function resolveRepoRoot(): string {
  if (process.env.FITTRACKER_REPO_ROOT) {
    return resolve(process.env.FITTRACKER_REPO_ROOT);
  }
  // src/lib/control-room/parsers → up four to fitme-story root, then
  // sibling FitTracker2/. The Vercel build clones FT2 to ../FitTracker2
  // (per vercel.json). Local dev with the SSD-sibling layout resolves
  // the same way.
  return resolve(import.meta.dirname || __dirname, '../../../../../FitTracker2');
}
