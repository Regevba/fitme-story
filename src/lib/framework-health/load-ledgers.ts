/**
 * load-ledgers.ts — server-side loader for FitTracker2 framework ledger files.
 *
 * Path resolution (revised 2026-05-06 to fix dashboard "no snapshots yet" bug
 * on Vercel):
 *
 *   1. PREFERRED: read from the synced snapshot at
 *      `<fitme-story>/src/data/{shared,integrity/snapshots}/`. The
 *      `npm run prebuild` step (sync-from-fittracker2.ts) populates these
 *      directories at build time. This works on Vercel because the synced
 *      data is committed/baked into the deployment.
 *
 *   2. FALLBACK: read from a sibling FitTracker2 clone at
 *      `<FITTRACKER_REPO_PATH>/.claude/{shared,integrity/snapshots}/`,
 *      defaulting to `/Volumes/DevSSD/FitTracker2`. This path is for local
 *      dev only — Vercel builders never have FT2 mounted at this path.
 *
 *   The synced location is the SOURCE OF TRUTH at runtime; the FT2 sibling
 *   is only consulted when a synced file is missing (e.g. local dev where
 *   prebuild hasn't run yet).
 *
 * Designed to be called from server components only (uses fs, not fetch).
 */

import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FITME_STORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const SYNCED_SHARED = path.join(FITME_STORY_ROOT, 'src', 'data', 'shared');
const SYNCED_INTEGRITY_SNAPSHOTS = path.join(
  FITME_STORY_ROOT,
  'src',
  'data',
  'integrity',
  'snapshots',
);

const REPO_ROOT =
  process.env.FITTRACKER_REPO_PATH ?? '/Volumes/DevSSD/FitTracker2';
const FALLBACK_SHARED = path.join(REPO_ROOT, '.claude', 'shared');
const FALLBACK_INTEGRITY_SNAPSHOTS = path.join(
  REPO_ROOT,
  '.claude',
  'integrity',
  'snapshots',
);

function pickSharedPath(filename: string): string {
  const synced = path.join(SYNCED_SHARED, filename);
  if (existsSync(synced)) return synced;
  return path.join(FALLBACK_SHARED, filename);
}

function pickIntegritySnapshotsDir(): string {
  if (existsSync(SYNCED_INTEGRITY_SNAPSHOTS)) return SYNCED_INTEGRITY_SNAPSHOTS;
  return FALLBACK_INTEGRITY_SNAPSHOTS;
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface DimensionStat {
  overall_present: number;
  overall_percent: number;
  post_v6_present: number;
  post_v6_percent: number;
}

export interface AdoptionSummary {
  features_total: number;
  features_post_v6: number;
  features_pre_v6: number;
  fully_adopted: number;
  partial_adopted: number;
  zero_adopted: number;
  fully_adopted_post_v6: number;
  tier_1_1_status: string;
}

export interface AdoptionSnapshot {
  date: string;
  generated_at: string;
  trigger: string;
  summary: AdoptionSummary;
  dimension_coverage: {
    timing_wall_time: DimensionStat;
    per_phase_timing: DimensionStat;
    cache_hits: DimensionStat;
    cu_v2: DimensionStat;
  };
}

export interface MeasurementAdoptionHistory {
  version: string;
  description: string;
  snapshots: AdoptionSnapshot[];
}

export interface MeasurementAdoptionCurrent {
  version: string;
  updated: string;
  v6_ship_date: string;
  description: string;
  summary: AdoptionSummary;
  dimension_coverage: {
    timing_wall_time: DimensionStat;
    per_phase_timing: DimensionStat;
    cache_hits: DimensionStat;
    cu_v2: DimensionStat;
  };
}

export interface DebtCoverage {
  present: number;
  missing: number;
  percent: number;
  examples: string[];
}

export interface DocumentationDebt {
  version: string;
  updated: string;
  description: string;
  summary: {
    case_studies_scanned: number;
    features_scanned: number;
    integrity_snapshot_files: number;
    integrity_cycle_snapshots: number;
    trend_ready: boolean;
    open_debt_items: number;
  };
  coverage: Record<string, DebtCoverage>;
  integrity_cycle: {
    snapshot_files_available: number;
    snapshots_available: number;
    trend_ready: boolean;
    status: string;
    notes: string;
  };
}

export interface IntegrityFinding {
  feature?: string;
  case_study?: string;
  code: string;
  severity: string;
  message: string;
}

export interface IntegritySnapshot {
  timestamp: string;
  commit_head: string;
  feature_count: number;
  case_study_count: number;
  finding_count: number;
  findings_by_severity: Record<string, number>;
  findings?: IntegrityFinding[];
}

export interface FrameworkLedgers {
  adoptionHistory: MeasurementAdoptionHistory | null;
  adoptionCurrent: MeasurementAdoptionCurrent | null;
  documentationDebt: DocumentationDebt | null;
  latestIntegritySnapshot: IntegritySnapshot | null;
  loadErrors: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function readJSON<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function readLatestSnapshot(snapshotsDir: string): Promise<IntegritySnapshot | null> {
  try {
    const entries = await readdir(snapshotsDir);
    const jsonFiles = entries
      .filter((f) => f.endsWith('.json'))
      .sort()
      .reverse(); // Latest first (ISO timestamp sort is lexicographic)

    if (jsonFiles.length === 0) return null;

    return readJSON<IntegritySnapshot>(path.join(snapshotsDir, jsonFiles[0]));
  } catch {
    return null;
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function loadFrameworkLedgers(): Promise<FrameworkLedgers> {
  const loadErrors: string[] = [];

  const [adoptionHistory, adoptionCurrent, documentationDebt, latestIntegritySnapshot] =
    await Promise.all([
      readJSON<MeasurementAdoptionHistory>(
        pickSharedPath('measurement-adoption-history.json'),
      ).catch((e) => {
        loadErrors.push(`adoptionHistory: ${e}`);
        return null;
      }),
      readJSON<MeasurementAdoptionCurrent>(
        pickSharedPath('measurement-adoption.json'),
      ).catch((e) => {
        loadErrors.push(`adoptionCurrent: ${e}`);
        return null;
      }),
      readJSON<DocumentationDebt>(
        pickSharedPath('documentation-debt.json'),
      ).catch((e) => {
        loadErrors.push(`documentationDebt: ${e}`);
        return null;
      }),
      readLatestSnapshot(pickIntegritySnapshotsDir()).catch((e) => {
        loadErrors.push(`latestSnapshot: ${e}`);
        return null;
      }),
    ]);

  return {
    adoptionHistory,
    adoptionCurrent,
    documentationDebt,
    latestIntegritySnapshot,
    loadErrors,
  };
}
