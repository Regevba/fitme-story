#!/usr/bin/env tsx
// scripts/issue-bootstrap-token.ts
//
// T20 — CLI for issuing bootstrap tokens.
//
// Usage:
//   pnpm tsx scripts/issue-bootstrap-token.ts <email>
//
// Reads admin gating env var UCC_BOOTSTRAP_ADMIN_TOKEN; refuses to run
// without it. Generates a 32-byte random token, SHA-256 hashes it, writes
// the hash to Redis with 15-min TTL + email payload, prints the RAW token
// to stdout (the operator pastes it into /control-room/sign-in/recover).
//
// The raw token is NEVER stored at rest. Only the hash sits in Redis.

import { createHash, randomBytes } from 'node:crypto';
import { hostname, userInfo } from 'node:os';
import { Redis } from '@upstash/redis';
import { logAuthEvent } from '../src/lib/auth/audit-log';

const BOOTSTRAP_TTL_SECONDS = 15 * 60;

function exitWith(code: number, msg: string): never {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

async function main() {
  const adminToken = process.env.UCC_BOOTSTRAP_ADMIN_TOKEN;
  if (!adminToken || adminToken.length < 32) {
    exitWith(
      2,
      'UCC_BOOTSTRAP_ADMIN_TOKEN env var not set (or too short). Run `vercel env pull .env.local` and retry.',
    );
  }

  const email = process.argv[2];
  if (!email || !email.includes('@')) {
    exitWith(2, 'Usage: pnpm tsx scripts/issue-bootstrap-token.ts <email>');
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    exitWith(
      2,
      'UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN env vars must be set.',
    );
  }

  const redis = new Redis({ url, token });

  const raw = randomBytes(32).toString('base64url');
  const hash = createHash('sha256').update(raw).digest('hex');
  const expiresAt = Math.floor(Date.now() / 1000) + BOOTSTRAP_TTL_SECONDS;

  await redis.set(
    `ucc:bootstrap:${hash}`,
    { email, expiresAt, used: false },
    { ex: BOOTSTRAP_TTL_SECONDS },
  );

  // G4 — audit the issuance (ucc-passkey-auth-security-hardening, 2026-05-20).
  // user_agent uses the `cli/<user>@<host>` convention recognized by
  // uaFamilyFromRaw which redacts to `cli/<user>` for the public blob export.
  // logAuthEvent is fail-soft — a Redis blip on the audit-log path will NOT
  // abort the token issuance (already-written ucc:bootstrap key remains valid).
  try {
    await logAuthEvent({
      event_type: 'auth_bootstrap_token_issued',
      operator_label: email,
      outcome: 'success',
      user_agent: `cli/${userInfo().username ?? 'unknown'}@${hostname()}`,
    });
  } catch (err) {
    process.stderr.write(
      `  ⚠ Audit event write failed (token issuance succeeded): ${
        err instanceof Error ? err.message : String(err)
      }\n`,
    );
  }

  process.stdout.write(`\n  ✓ Bootstrap token issued for ${email}\n`);
  process.stdout.write(`    TTL: 15 minutes (single-use)\n\n`);
  process.stdout.write(`  Token (paste into /control-room/sign-in/recover):\n\n`);
  process.stdout.write(`    ${raw}\n\n`);
  process.stdout.write(
    `  Or open this URL directly:\n    https://fitme-story.vercel.app/control-room/sign-in/recover?bootstrap=${encodeURIComponent(raw)}\n\n`,
  );
}

main().catch((err) => {
  exitWith(1, `Error: ${err instanceof Error ? err.message : String(err)}`);
});
