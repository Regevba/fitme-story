/**
 * load-ledgers.ts — server-side loader for FitTracker2 framework ledger files.
 *
 * Reads from FitTracker2's .claude/shared/ and .claude/integrity/snapshots/
 * directories. All paths are configurable via FITTRACKER_REPO_PATH env var
 * (default: /Volumes/DevSSD/FitTracker2).
 *
 * Designed to be called from server components only (uses fs, not fetch).
 */

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const REPO_ROOT =
  process.env.FITTRACKER_REPO_PATH ?? '/Volumes/DevSSD/FitTracker2';

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
  const sharedDir = path.join(REPO_ROOT, '.claude', 'shared');
  const snapshotsDir = path.join(REPO_ROOT, '.claude', 'integrity', 'snapshots');

  const loadErrors: string[] = [];

  const [adoptionHistory, adoptionCurrent, documentationDebt, latestIntegritySnapshot] =
    await Promise.all([
      readJSON<MeasurementAdoptionHistory>(
        path.join(sharedDir, 'measurement-adoption-history.json')
      ).catch((e) => {
        loadErrors.push(`adoptionHistory: ${e}`);
        return null;
      }),
      readJSON<MeasurementAdoptionCurrent>(
        path.join(sharedDir, 'measurement-adoption.json')
      ).catch((e) => {
        loadErrors.push(`adoptionCurrent: ${e}`);
        return null;
      }),
      readJSON<DocumentationDebt>(
        path.join(sharedDir, 'documentation-debt.json')
      ).catch((e) => {
        loadErrors.push(`documentationDebt: ${e}`);
        return null;
      }),
      readLatestSnapshot(snapshotsDir).catch((e) => {
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
