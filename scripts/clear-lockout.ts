#!/usr/bin/env tsx
// scripts/clear-lockout.ts
//
// CLI utility — clear failure counters + lockout sentinels for an email
// and/or IP class. Operator emergency clear path for the G3 hybrid
// lockout shipped in ucc-passkey-auth-security-hardening (2026-05-20).
//
// Usage:
//   pnpm tsx scripts/clear-lockout.ts --email <email>
//   pnpm tsx scripts/clear-lockout.ts --ip <raw-ip>
//   pnpm tsx scripts/clear-lockout.ts --email <email> --ip <raw-ip>
//
// The --ip argument should be the same raw IP the auth path saw (typically
// from `x-forwarded-for`); the script applies the same /24 (IPv4) or /48
// (IPv6) truncation the lockout module uses for keying.
//
// Reads UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (WRITE token).
// Run `vercel env pull .env.local` first to populate them locally.
//
// Emits an `auth_lockout_cleared` audit event with `reason: manual_clear`
// on success.

import { hostname, userInfo } from 'node:os';
import { clearFailures } from '../src/lib/auth/redis-lockout';
import { logAuthEvent } from '../src/lib/auth/audit-log';

function exitWith(code: number, msg: string): never {
  process.stderr.write(`${msg}\n`);
  process.exit(code);
}

function parseArgs(): { email: string | null; ip: string | null } {
  let email: string | null = null;
  let ip: string | null = null;
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--email' && i + 1 < argv.length) {
      email = argv[i + 1];
      i++;
    } else if (arg === '--ip' && i + 1 < argv.length) {
      ip = argv[i + 1];
      i++;
    } else {
      exitWith(
        2,
        `Unknown arg: ${arg}\nUsage: pnpm tsx scripts/clear-lockout.ts [--email <email>] [--ip <raw-ip>]`,
      );
    }
  }
  return { email, ip };
}

async function main() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    exitWith(
      2,
      'UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN env vars must be set. Run `vercel env pull .env.local` first.',
    );
  }

  const { email, ip } = parseArgs();
  if (!email && !ip) {
    exitWith(
      2,
      'At least one of --email or --ip is required.\nUsage: pnpm tsx scripts/clear-lockout.ts [--email <email>] [--ip <raw-ip>]',
    );
  }

  await clearFailures(email, ip);

  // Audit the manual clear. Fail-soft — don't abort if the audit write
  // fails (the Redis keys are already deleted; the action succeeded).
  try {
    await logAuthEvent({
      event_type: 'auth_lockout_cleared',
      operator_label: email ?? 'ip_only',
      outcome: 'success',
      reason: 'manual_clear',
      user_agent: `cli/${userInfo().username ?? 'unknown'}@${hostname()}`,
      ip: ip ?? undefined,
    });
  } catch (err) {
    process.stderr.write(
      `  ⚠ Audit event write failed (clear succeeded): ${
        err instanceof Error ? err.message : String(err)
      }\n`,
    );
  }

  const cleared: string[] = [];
  if (email) cleared.push(`email=${email}`);
  if (ip) cleared.push(`ip=${ip}`);
  process.stdout.write(`✓ Cleared lockout state for ${cleared.join(', ')}\n`);
}

main().catch((err) => {
  exitWith(1, `Error: ${err instanceof Error ? err.message : String(err)}`);
});
