// scripts/sample-audit-log-contract.ts
//
// F-CONTRACT-FIXTURE-SAMPLING — audit-log CANONICAL sampler (E-15).
//
// fitme-story is the canonical PRODUCER of the `audit-log` contract (the UCC
// auth event stream lives in Upstash Redis here; FT2 only holds a daily mirror,
// which it samples with provenance=mirror). The canonical, provenance=canonical
// sample must therefore be produced HERE — that's this script.
//
// It reads the most-recent N events from Redis, SANITIZES each one for public
// export (the fixture is committed to git + the control-room is publicly
// reachable), asserts the contract's required_keys, and writes
//   src/lib/control-room/__fixtures__/contracts/audit-log.jsonl
//   src/lib/control-room/__fixtures__/contracts/audit-log.meta.json
//
// Runs in the weekly re-sample cron (which has the Upstash secret). LOCAL / PR
// runs have no Redis creds → it no-ops cleanly (exit 0, writes nothing) so it
// never breaks a contributor's machine or a fork PR.
//
// Usage:  tsx scripts/sample-audit-log-contract.ts

import { writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { readEvents } from '../src/lib/auth/redis-audit-log';
import { sanitizeForPublicExport } from '../src/lib/auth/redis-audit-log';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, '..', 'src/lib/control-room/__fixtures__/contracts');
const CONTRACT = 'audit-log';
const SAMPLE_SIZE = 10;
const REQUIRED_KEYS = ['event_type', 'timestamp'];

export interface SampleResult {
  records: Record<string, unknown>[];
  meta: Record<string, unknown> | null;
  /** Non-null when the producer output violated the contract (drift). */
  error: string | null;
}

/** True when Upstash Redis creds are present (Upstash-native OR legacy KV). */
export function redisConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(
    (env.UPSTASH_REDIS_REST_URL ?? env.KV_REST_API_URL) &&
      (env.UPSTASH_REDIS_REST_TOKEN ?? env.KV_REST_API_TOKEN),
  );
}

/**
 * Pure core: sanitize + validate raw producer events into a canonical sample.
 * Kept Redis-free so it is unit-testable without creds.
 */
export function buildAuditLogSample(rawEvents: unknown[], now: Date): SampleResult {
  const records = rawEvents
    .filter((e): e is Record<string, unknown> => typeof e === 'object' && e !== null)
    .map((e) => sanitizeForPublicExport(e));

  if (records.length === 0) {
    return { records: [], meta: null, error: 'no events returned from producer (Redis empty)' };
  }

  // Validate the producer's own output against the contract — this is the
  // sample-time assertion (mirrors FT2's `_missing_keys`). A missing required
  // key here means the PRODUCER drifted; surface it rather than ship a bad
  // fixture the consumer would later trip on.
  const missing = new Map<string, number>();
  for (const rec of records) {
    for (const key of REQUIRED_KEYS) {
      if (!(key in rec)) missing.set(key, (missing.get(key) ?? 0) + 1);
    }
  }
  if (missing.size > 0) {
    const detail = [...missing.entries()].map(([k, n]) => `"${k}" (${n}/${records.length})`).join(', ');
    return { records, meta: null, error: `producer drift: required key(s) missing: ${detail}` };
  }

  const meta = {
    contract: CONTRACT,
    sampled_at: now.toISOString().replace(/\.\d{3}Z$/, '+00:00'),
    provenance: 'canonical',
    record_count: records.length,
    required_keys: REQUIRED_KEYS,
    producer_repo: 'fitme-story',
  };
  return { records, meta, error: null };
}

async function main(): Promise<number> {
  if (!redisConfigured()) {
    console.log(
      `audit-log sampler: Upstash Redis not configured — skipping (cron-only). ` +
        `No fixture written.`,
    );
    return 0;
  }

  let raw: unknown[];
  try {
    raw = await readEvents(SAMPLE_SIZE);
  } catch (err) {
    console.error(`audit-log sampler: Redis read failed — ${(err as Error).message}`);
    return 1;
  }

  const { records, meta, error } = buildAuditLogSample(raw, new Date());
  if (error) {
    // Empty Redis is a soft skip (no events yet); real drift is a hard fail.
    if (error.startsWith('no events')) {
      console.log(`audit-log sampler: ${error} — skipping (no fixture written).`);
      return 0;
    }
    console.error(`audit-log sampler: ${error}`);
    return 1;
  }

  writeFileSync(join(OUT_DIR, `${CONTRACT}.jsonl`), records.map((r) => JSON.stringify(r)).join('\n') + '\n');
  writeFileSync(join(OUT_DIR, `${CONTRACT}.meta.json`), JSON.stringify(meta, null, 2) + '\n');
  console.log(`audit-log sampler: wrote ${records.length} canonical records → ${CONTRACT}.jsonl`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().then((code) => process.exit(code));
}
