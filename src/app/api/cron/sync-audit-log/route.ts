// src/app/api/cron/sync-audit-log/route.ts
//
// T21 Vercel-Cron sibling — invoked daily by the cron entry in vercel.json.
//
// Reads .local/ucc-auth-events.jsonl off the function host and PUTs it into
// a Vercel Blob. The FT2 GHA workflow (T22) pulls that Blob the next morning
// and commits the file into FT2/.claude/logs/.

import { NextResponse, type NextRequest } from 'next/server';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

function getLogPath(): string {
  return (
    process.env.UCC_AUDIT_LIVE_PATH ??
    path.join(process.cwd(), '.local', 'ucc-auth-events.jsonl')
  );
}

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

  let raw: string;
  try {
    raw = await fs.readFile(getLogPath(), 'utf8');
  } catch {
    return NextResponse.json({ ok: true, synced: 0, reason: 'no_log_yet' });
  }

  const lineCount = raw.split('\n').filter((l) => l.trim()).length;

  const blob = await put(getBlobPathname(), raw, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/x-ndjson',
    token: blobToken,
  });

  return NextResponse.json({ ok: true, synced: lineCount, url: blob.url });
}
