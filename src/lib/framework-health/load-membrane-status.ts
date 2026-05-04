/**
 * load-membrane-status.ts — server-side loader for v7.8 Mechanism F advisory.
 *
 * Runs `scripts/membrane-status.py --format=json` against the FitTracker2
 * repo at build time and returns the parsed smartlog. Reads-only;
 * v7.8 Mechanism F is advisory.
 *
 * Pattern: load-ledgers.ts. Designed for server components only.
 */

import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

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

// ── Loader ───────────────────────────────────────────────────────────────────

/**
 * Run membrane-status.py against the FitTracker2 repo and return its JSON.
 * Returns null on any error (script missing, repo unreachable, parse failure)
 * so the dashboard can render a graceful empty state.
 */
export async function loadMembraneStatus(): Promise<MembraneStatus | null> {
  const script = path.join(REPO_ROOT, 'scripts', 'membrane-status.py');
  try {
    const { stdout } = await execFileAsync(
      'python3',
      [script, '--format=json'],
      {
        cwd: REPO_ROOT,
        timeout: 15_000,
        maxBuffer: 10 * 1024 * 1024,
      }
    );
    const parsed = JSON.parse(stdout) as MembraneStatus;
    if (typeof parsed.feature_count !== 'number' || !Array.isArray(parsed.features)) {
      return null;
    }
    return parsed;
  } catch (err) {
    // Script may not exist (PR-6 not merged yet) or repo not present locally.
    // Fail soft so the dashboard still renders other panels.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[load-membrane-status] failed:', (err as Error).message);
    }
    return null;
  }
}
