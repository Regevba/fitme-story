/**
 * Skills manifest reader.
 *
 * Reads the dynamic skills manifest at `src/data/skills/manifest.json`,
 * produced by `scripts/sync-from-fittracker2.ts` at prebuild time from
 * FT2's `.claude/skills/{name}/SKILL.md` YAML frontmatter.
 *
 * Replaces the static SKILL_MANIFEST that was hardcoded in
 * `src/app/control-room/skills/page.tsx` (P1.2 MVP, PR #110).
 * Closes the P1.2 runtime-sync follow-up.
 *
 * Soft-fail: if the manifest doesn't exist (fresh checkout before
 * prebuild has run, or FT2 not present at build time), returns an
 * empty manifest so the page renders without crashing. Caller can
 * detect this via `manifest.skills.length === 0`.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export type SkillStatus = 'active' | 'stable' | 'planned' | 'deprecated';

export interface SkillRow {
  name: string;
  description: string;
  status: SkillStatus | '';
  lastUpdated: string;
  frameworkVersion: string;
  adaptersUsed: string[];
  loc: number;
}

export interface SkillsManifest {
  syncedAt: string;
  source: string;
  skills: SkillRow[];
}

const MANIFEST_PATH = resolve(process.cwd(), 'src', 'data', 'skills', 'manifest.json');

const EMPTY_MANIFEST: SkillsManifest = {
  syncedAt: new Date(0).toISOString(),
  source: '(manifest not present — run `npm run prebuild`)',
  skills: [],
};

export function loadSkillsManifest(): SkillsManifest {
  if (!existsSync(MANIFEST_PATH)) return EMPTY_MANIFEST;
  try {
    const raw = readFileSync(MANIFEST_PATH, 'utf8');
    return JSON.parse(raw) as SkillsManifest;
  } catch {
    return EMPTY_MANIFEST;
  }
}
