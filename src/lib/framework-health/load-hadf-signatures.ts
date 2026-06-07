/**
 * load-hadf-signatures.ts — server-side loader for the HADF Phase 3A sensing
 * layer (T4 control-room panel).
 *
 * Renders two FT2-produced artifacts:
 *   1. reference-signatures.json — per-(provider,endpoint) reference TTFT/TPS
 *      distributions (producer: scripts/hadf-build-reference-store.py).
 *   2. drift-monitor.jsonl — append-only drift status rows
 *      (producer: scripts/hadf-drift-monitor.py; may not exist yet → empty).
 *
 * Path resolution mirrors load-ledgers.ts: synced snapshot under
 * src/data/shared/hadf/ is the runtime source of truth; the FT2 sibling clone
 * is a local-dev-only fallback.
 *
 * W16 DISCIPLINE (load-bearing): the types below are pinned to the canonical
 * PRODUCER schema (reference-signatures.json schema_version 1), NOT a
 * consumer-invented shape. The panel selects a subset of fields; it never
 * fabricates field names. If the producer bumps schema_version, this loader
 * must be updated in lockstep (see the contract-boundary fixture test).
 *
 * HONESTY: attestation/drift are advisory [T1-input → T3-interpretation].
 * Detection/observability ONLY — no dispatch decision is made on this data.
 * Per-request single-shot accuracy is unvalidated (RQ5).
 *
 * Server-component only (uses fs, not fetch).
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FITME_STORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const SYNCED_SHARED = path.join(FITME_STORY_ROOT, 'src', 'data', 'shared');
const REPO_ROOT =
  process.env.FITTRACKER_REPO_PATH ?? '/Volumes/DevSSD/FitTracker2';
const FALLBACK_SHARED = path.join(REPO_ROOT, '.claude', 'shared');

function pickSharedPath(relPath: string): string {
  const synced = path.join(SYNCED_SHARED, relPath);
  if (existsSync(synced)) return synced;
  return path.join(FALLBACK_SHARED, relPath);
}

// ── Producer schema (reference-signatures.json schema_version 1) ──────────────

/** Quantile + moment block emitted for both ttft_s and tps. */
export interface SignatureStats {
  p05: number;
  p25: number;
  median: number;
  p75: number;
  p95: number;
  mean: number;
  std: number;
}

/** One reference endpoint record. `cov` (covariance matrix) and `mean` are
 *  intentionally NOT surfaced by the panel — heavy + only used by attestation. */
export interface ReferenceEndpoint {
  provider: string;
  endpoint: string;
  n: number;
  ttft_s: SignatureStats;
  tps: SignatureStats;
  calibration_status: 'instrumented' | 'prior_unvalidated' | string;
  class: string;
  provenance?: Record<string, unknown>;
}

export interface ReferenceSignatures {
  schema_version: number;
  built_as_of: string;
  source?: string;
  note?: string;
  endpoint_count: number;
  min_n: number;
  max_ttft_s: number;
  dropped_implausible_ttft_total?: number;
  excluded_low_n?: unknown[];
  endpoints: ReferenceEndpoint[];
}

/** One drift-monitor.jsonl row. Producer emits a per-endpoint drift verdict
 *  vs the reference baseline. Shape is kept permissive (passthrough) because
 *  the monitor is advisory and its row schema may evolve; the panel reads only
 *  the labeled fields below and ignores the rest. */
export interface DriftRow {
  timestamp: string;
  provider?: string;
  endpoint?: string;
  /** advisory band: green = within baseline, amber/red = drifting */
  band?: 'green' | 'amber' | 'red' | string;
  ks_p?: number;
  mahalanobis?: number;
  [key: string]: unknown;
}

export interface HadfSensingData {
  /** null when the file is absent or fails the schema_version pin (W16). */
  reference: ReferenceSignaturesView | null;
  /** [] when drift-monitor.jsonl is absent (not produced yet) or empty. */
  drift: DriftRow[];
  /** non-null when a producer-schema mismatch was detected (rendered as a
   *  visible warning rather than a silent blank — anti-W16). */
  schemaWarning: string | null;
}

/** Panel-facing projection — selected fields only (no cov dump). */
export interface ReferenceSignaturesView {
  built_as_of: string;
  endpoint_count: number;
  min_n: number;
  endpoints: Array<{
    provider: string;
    endpoint: string;
    n: number;
    ttft_median: number;
    ttft_p05: number;
    ttft_p95: number;
    tps_median: number;
    calibration_status: string;
    class: string;
  }>;
}

const SUPPORTED_SCHEMA_VERSION = 1;

function readJSON<T>(filePath: string): T | null {
  try {
    if (!existsSync(filePath)) return null;
    return JSON.parse(readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function projectReference(
  raw: ReferenceSignatures,
): ReferenceSignaturesView {
  return {
    built_as_of: raw.built_as_of,
    endpoint_count: raw.endpoint_count,
    min_n: raw.min_n,
    endpoints: (raw.endpoints ?? []).map((e) => ({
      provider: e.provider,
      endpoint: e.endpoint,
      n: e.n,
      ttft_median: e.ttft_s?.median,
      ttft_p05: e.ttft_s?.p05,
      ttft_p95: e.ttft_s?.p95,
      tps_median: e.tps?.median,
      calibration_status: e.calibration_status,
      class: e.class,
    })),
  };
}

function loadDrift(): DriftRow[] {
  // drift-monitor.jsonl is append-only and may not exist until the monitor
  // runs. Parse line-by-line like the gate-coverage aggregator; skip blanks.
  const filePath = pickSharedPath(path.join('hadf', 'drift-monitor.jsonl'));
  if (!existsSync(filePath)) return [];
  try {
    return readFileSync(filePath, 'utf-8')
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line) as DriftRow)
      .sort((a, b) => (a.timestamp ?? '').localeCompare(b.timestamp ?? ''));
  } catch {
    return [];
  }
}

/** Load + project the HADF sensing-layer artifacts for the control-room panel. */
export function loadHadfSensing(): HadfSensingData {
  const raw = readJSON<ReferenceSignatures>(
    pickSharedPath(path.join('hadf', 'reference-signatures.json')),
  );

  if (!raw) {
    return { reference: null, drift: loadDrift(), schemaWarning: null };
  }

  // W16: refuse to render against an unexpected producer schema rather than
  // silently mis-reading fields.
  if (raw.schema_version !== SUPPORTED_SCHEMA_VERSION) {
    return {
      reference: null,
      drift: loadDrift(),
      schemaWarning: `reference-signatures.json schema_version=${raw.schema_version} (panel supports ${SUPPORTED_SCHEMA_VERSION}); update load-hadf-signatures.ts in lockstep with the producer.`,
    };
  }

  return {
    reference: projectReference(raw),
    drift: loadDrift(),
    schemaWarning: null,
  };
}
