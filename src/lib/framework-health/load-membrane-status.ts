/**
 * load-membrane-status.ts — server-side loader for v7.8 Mechanism F advisory.
 *
 * v2 (2026-05-26): reads `src/data/shared/membrane-status.json` written by
 * `scripts/sync-from-fittracker2.ts` Phase F at prebuild time. This replaces
 * the original execFile invocation of `scripts/membrane-status.py` at render
 * time, which silently failed on Vercel's serverless runtime (no Python, no
 * FT2 repo on disk, no execFile permissions).
 *
 * Fall-back path: if the synced JSON is missing AND we're running locally
 * with `FITTRACKER_REPO_PATH` pointing at a real FT2 checkout, attempt the
 * legacy execFile path as a dev-mode convenience. Returns null on any
 * error so the dashboard renders a graceful empty state.
 *
 * Pattern: load-ledgers.ts. Designed for server components only.
 */

import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const FITME_STORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const SYNCED_PATH = path.join(
  FITME_STORY_ROOT,
  'src',
  'data',
  'shared',
  'membrane-status.json',
);

const REPO_ROOT =
  process.env.FITTRACKER_REPO_PATH ?? '/Volumes/DevSSD/FitTracker2';

// ── Types ────────────────────────────────────────────────────────────────────

export interface MembraneFeature {
  slug: string;
  current_phase: string;
  framework_version: string;
  branch: string | null;
  last_touched_utc: string;
  agent_manifest_present: boolean;
  manifest_writes: string[];
  branch_meta?: {
    commit: string;
    committer_date: string;
    age_seconds: number;
  };
  lease?: {
    agent: string;
    last_heartbeat: string;
    [key: string]: unknown;
  };
}

export interface MembraneStatus {
  generated_at: string;
  epoch: number;
  lease_count: number;
  feature_count: number;
  branch_count: number;
  features: MembraneFeature[];
  _advisory_note: string;
}

function isValidShape(parsed: unknown): parsed is MembraneStatus {
  if (typeof parsed !== 'object' || parsed === null) return false;
  const obj = parsed as Record<string, unknown>;
  return (
    typeof obj.feature_count === 'number' && Array.isArray(obj.features)
  );
}

// ── Loader ───────────────────────────────────────────────────────────────────

/**
 * Load membrane status from the synced JSON file written at prebuild time.
 * Falls back to execFile only when running locally with FT2 on disk (dev
 * convenience). Returns null on any error so the dashboard can render a
 * graceful empty state.
 */
export async function loadMembraneStatus(): Promise<MembraneStatus | null> {
  // Primary path: read the prebuild-emitted JSON file. Works in every
  // environment (local dev, Vercel build, Vercel serverless runtime).
  if (existsSync(SYNCED_PATH)) {
    try {
      const raw = await readFile(SYNCED_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (isValidShape(parsed)) return parsed;
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(
          '[load-membrane-status] synced JSON unreadable:',
          (err as Error).message,
        );
      }
    }
  }

  // Fall-back path: dev convenience when running with FT2 on disk and the
  // prebuild emitter hasn't run yet. Skip in production (Vercel) to avoid
  // 15s timeout on a known-failing path.
  if (process.env.NODE_ENV === 'production') return null;

  const script = path.join(REPO_ROOT, 'scripts', 'membrane-status.py');
  if (!existsSync(script)) return null;
  try {
    const { stdout } = await execFileAsync(
      'python3',
      [script, '--format=json'],
      {
        cwd: REPO_ROOT,
        timeout: 15_000,
        maxBuffer: 10 * 1024 * 1024,
      },
    );
    const parsed = JSON.parse(stdout);
    return isValidShape(parsed) ? parsed : null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      '[load-membrane-status] execFile fallback failed:',
      (err as Error).message,
    );
    return null;
  }
}
