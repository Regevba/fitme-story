#!/usr/bin/env tsx
// scripts/sync-audit-log-to-blob.ts
//
// T21 — Reverse-mode sync (fitme-story → FT2).
//
// Reads the local .local/ucc-auth-events.jsonl (cumulative live log on
// the Vercel function host) and PUTs the file into a Vercel Blob bucket.
// The FT2 daily GHA workflow (T22) pulls that Blob and commits the
// resulting JSONL into .claude/logs/ucc-auth-events.jsonl.
//
// Why a separate sibling rather than a flag on sync-from-fittracker2.ts?
// Because the FT2→fitme-story sync runs at PRE-build (file system) and
// this runs as a POST-write hook (Vercel Function lifecycle). The two
// life-cycles never coexist on the same invocation, so a flag would muddy
// the intent.
//
// Local invocation (debugging):
//   pnpm tsx scripts/sync-audit-log-to-blob.ts
//
// Production (Vercel Cron): scheduled via vercel.json — see the cron entry.

import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { put } from '@vercel/blob';

const LOG_PATH =
  process.env.UCC_AUDIT_LIVE_PATH ??
  path.join(process.cwd(), '.local', 'ucc-auth-events.jsonl');

const BLOB_PATHNAME =
  process.env.UCC_AUDIT_BLOB_PATH ?? 'ucc-auth-events.jsonl';

async function main() {
  const token = process.env.UCC_AUDIT_BLOB_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    process.stderr.write(
      'UCC_AUDIT_BLOB_TOKEN (or BLOB_READ_WRITE_TOKEN) env var must be set.\n',
    );
    process.exit(2);
  }

  let raw: string;
  try {
    raw = await fs.readFile(LOG_PATH, 'utf8');
  } catch (err) {
    process.stderr.write(
      `No log to sync — ${LOG_PATH} doesn't exist yet (this is fine on a fresh deploy).\n`,
    );
    process.exit(0);
  }

  const lineCount = raw.split('\n').filter((l) => l.trim()).length;

  const blob = await put(BLOB_PATHNAME, raw, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/x-ndjson',
    token,
  });

  process.stdout.write(
    `  ✓ Synced ${lineCount} events to ${blob.url} (${raw.length} bytes)\n`,
  );
}

main().catch((err) => {
  process.stderr.write(
    `Sync failed: ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
