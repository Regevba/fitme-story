// src/app/api/control-room/state-sync-health/route.ts
//
// FIT-183 (R17) — cross-repo state-sync read-only health endpoint.
//
// Reports the freshness of the FT2 state mirrored into this repo by the
// pre-build sync (scripts/sync-from-fittracker2.ts). Probed by the FT2 daily
// checkpoint, which alerts if age_minutes > 6h — surfacing a silently-stalled
// sync (cron auth drift, SSD unmount, build failure) within minutes instead of
// days.
//
// PUBLIC: not covered by proxy.ts (matcher is /control-room/* + /api/auth/*, not
// /api/control-room/*). Exposes only counts + a timestamp — no secrets — so an
// unauthenticated FT2 cron can probe it.

import { NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import freshness from '@/data/freshness.json';
import { computeSyncHealth } from '@/lib/control-room/state-sync-health';

export const runtime = 'nodejs';
// Always recompute age at request time — never serve a cached (stale) age.
export const dynamic = 'force-dynamic';

/** Best-effort line count of the mirrored gate-coverage stream (null if
 *  unreadable in the deployed bundle — the health verdict does not depend on
 *  it, only on freshness + state count). */
function gateCoverageLineCount(): number | null {
  try {
    const p = path.join(process.cwd(), 'src', 'data', 'integrity', 'gate-coverage-ft2.jsonl');
    const text = readFileSync(p, 'utf8');
    const trimmed = text.replace(/\n+$/, '');
    return trimmed === '' ? 0 : trimmed.split('\n').length;
  } catch {
    return null;
  }
}

export function GET() {
  const syncedAt = (freshness as { syncedAt?: string }).syncedAt ?? null;
  const ft2StateCount = (freshness as { counts?: { featureFiles?: number } }).counts?.featureFiles ?? 0;
  const gateLines = gateCoverageLineCount();

  const health = computeSyncHealth({
    syncedAt,
    ft2StateCount,
    gateCoverageLines: gateLines ?? 0,
    now: Date.now(),
  });

  // 200 when healthy, 503 when stale/broken — so a plain HTTP status check
  // (curl -f) also works as an alert signal, not just the JSON body.
  return NextResponse.json(
    { ...health, gate_coverage_lines: gateLines },
    { status: health.healthy ? 200 : 503 },
  );
}
