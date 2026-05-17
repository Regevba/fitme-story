// src/app/api/cron/sync-audit-log/route.ts
//
// Vercel-Cron sibling — invoked daily by the cron entry in vercel.json.
//
// Reads the live audit-log from Upstash Redis (`ucc:audit-log:events`),
// SANITIZES each event (hashes operator_label so PII never crosses to the
// public blob), then PUTs the sanitized JSONL to a Vercel Blob. The FT2
// GHA workflow (T22) pulls that blob the next morning and commits the
// file into FT2/.claude/logs/.
//
// Why sanitize at the cron-write boundary:
//   - Redis (private, token-gated) holds operator emails raw so the
//     in-app AuditLogPanel can show "you signed in" to authenticated
//     operators viewing their own activity.
//   - Vercel Blob with access:public + addRandomSuffix:false produces a
//     deterministic URL (so FT2 can hard-code UCC_AUDIT_BLOB_URL once)
//     but the URL is publicly readable to anyone who guesses it. Operator
//     emails MUST NOT cross that boundary.
//
// Security amendment per ucc-passkey-auth-audit-log-redis-fix
// pre-implementation audit (2026-05-17).

import { NextResponse, type NextRequest } from 'next/server';
import { put } from '@vercel/blob';
import { readAllEvents, sanitizeForPublicExport } from '@/lib/auth/redis-audit-log';

export const runtime = 'nodejs';

function getBlobPathname(): string {
  return process.env.UCC_AUDIT_BLOB_PATH ?? 'ucc-auth-events.jsonl';
}

export async function GET(req: NextRequest) {
  // Vercel Cron sets the `authorization` header to `Bearer ${CRON_SECRET}`.
  // Reject requests that don't carry the secret. CRON_SECRET is auto-set
  // by Vercel for projects with `crons` configured.
  const authHeader = req.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const blobToken =
    process.env.UCC_AUDIT_BLOB_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    return NextResponse.json(
      { error: 'blob_token_missing', synced: 0 },
      { status: 500 },
    );
  }

  let events: unknown[];
  try {
    events = await readAllEvents();
  } catch (err) {
    return NextResponse.json(
      { error: 'redis_read_failed', synced: 0, message: String(err) },
      { status: 500 },
    );
  }

  if (events.length === 0) {
    return NextResponse.json({ ok: true, synced: 0, reason: 'no_events_yet' });
  }

  // Sanitize each event before writing the public blob.
  const sanitized = events
    .filter((e): e is Record<string, unknown> => typeof e === 'object' && e !== null)
    .map(sanitizeForPublicExport);

  const jsonl = sanitized.map((e) => JSON.stringify(e)).join('\n') + '\n';

  const blob = await put(getBlobPathname(), jsonl, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/x-ndjson',
    token: blobToken,
  });

  return NextResponse.json({
    ok: true,
    synced: sanitized.length,
    url: blob.url,
    pii_redacted: true,
  });
}
