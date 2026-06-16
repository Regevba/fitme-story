/**
 * Live-or-snapshot data source for the control-room (UCC live-feed Phase 2).
 *
 * The single place that knows about the FT2 state Blob. FitTracker2 CI pushes a
 * JSON bundle of `.claude/*` state to a public Vercel Blob on every commit to
 * main (see FT2 scripts/push-state-bundle.py — Phase 2 PR D); this module reads
 * that bundle ONCE per request (memoized via React `cache()`) and exposes
 * per-key accessors.
 *
 * FAIL-SOFT contract (the load-bearing rule, opposite of the build-time
 * fail-fast sync): every accessor returns `null` when the Blob is not
 * configured, unreachable, malformed, or missing the key. Each loader then
 * falls back to its existing `src/data/*` snapshot read. With
 * `FT2_STATE_BLOB_URL` unset, `loadBundle()` short-circuits before any fetch,
 * so the entire control-room behaves exactly as the build-time-snapshot path —
 * zero behavior change until the Blob is wired (Phase 2 PR E).
 *
 * Self-contained (own soft-fetch) so it carries no dependency on the Phase 1
 * `live/fetch-util.ts`; the two can be de-duplicated once both phases land.
 *
 * SERVER-ONLY.
 */

import { cache } from 'react';

export interface StateBundle {
  schema_version?: number;
  generated_at?: string;
  commit_sha?: string;
  /** Relative path (e.g. "shared/foo.json", "features/bar.json") → parsed JSON or raw text. */
  files: Record<string, unknown>;
}

export interface DataOrigin {
  origin: 'live-blob' | 'snapshot';
  blobGeneratedAt: string | null;
  commitSha: string | null;
}

/** Default per-request cache TTL for the bundle fetch (seconds). */
const DEFAULT_REVALIDATE = 120;
const FETCH_TIMEOUT_MS = 8000;

/** True when the FT2 state Blob is configured. Cheap, no fetch. */
export function isLiveConfigured(): boolean {
  return Boolean(process.env.FT2_STATE_BLOB_URL);
}

/**
 * Fetch + parse the state bundle, memoized per request. Returns `null` on any
 * failure (not configured, network reject, non-2xx, parse error, wrong shape).
 * Never throws.
 */
const loadBundle = cache(async (): Promise<StateBundle | null> => {
  if (typeof window !== 'undefined') return null;
  const url = process.env.FT2_STATE_BLOB_URL;
  if (!url) return null;

  const revalidate = Number(process.env.FT2_STATE_BLOB_REVALIDATE ?? DEFAULT_REVALIDATE);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: Number.isFinite(revalidate) ? revalidate : DEFAULT_REVALIDATE },
    } as RequestInit);
    if (!res.ok) return null;
    const bundle = (await res.json()) as StateBundle;
    if (!bundle || typeof bundle.files !== 'object' || bundle.files === null) return null;
    return bundle;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
});

// ── Pure extractors (no fetch / no env — unit-testable in isolation) ─────────

/** Parsed JSON for a key in an already-loaded bundle (or null to fall back). */
export function extractJson<T>(bundle: StateBundle | null, key: string): T | null {
  if (!bundle) return null;
  const value = bundle.files[key];
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return value as T;
}

/** Raw text for a key in an already-loaded bundle (or null to fall back). */
export function extractText(bundle: StateBundle | null, key: string): string | null {
  if (!bundle) return null;
  const value = bundle.files[key];
  if (value === undefined || value === null) return null;
  return typeof value === 'string' ? value : JSON.stringify(value);
}

/** Keys under a prefix in an already-loaded bundle (or [] when null). */
export function extractKeys(bundle: StateBundle | null, prefix: string): string[] {
  if (!bundle) return [];
  return Object.keys(bundle.files).filter((k) => k.startsWith(prefix));
}

// ── Async accessors (fetch the cached bundle, then extract) ──────────────────

/**
 * Parsed JSON for a bundle key, or `null` to signal the caller should fall back
 * to its snapshot. Bundle values may be stored pre-parsed (object) or as a raw
 * JSON string; both are handled.
 */
export async function getBundleJson<T>(key: string): Promise<T | null> {
  return extractJson<T>(await loadBundle(), key);
}

/** Raw text for a bundle key (e.g. a `.jsonl` ledger), or `null` to fall back. */
export async function getBundleText(key: string): Promise<string | null> {
  return extractText(await loadBundle(), key);
}

/** Bundle keys under a prefix (e.g. "features/"), or `[]` when not live. */
export async function listBundleKeys(prefix: string): Promise<string[]> {
  return extractKeys(await loadBundle(), prefix);
}

/** Provenance for the freshness footer (Phase 2 PR F). Never throws. */
export async function getDataOrigin(): Promise<DataOrigin> {
  const bundle = await loadBundle();
  if (!bundle) return { origin: 'snapshot', blobGeneratedAt: null, commitSha: null };
  return {
    origin: 'live-blob',
    blobGeneratedAt: bundle.generated_at ?? null,
    commitSha: bundle.commit_sha ?? null,
  };
}
