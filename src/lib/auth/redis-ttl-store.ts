// src/lib/auth/redis-ttl-store.ts
//
// T6 — KV CRUD for the TTL-keyed records: challenge, bootstrap, session.
//
// All three are short-lived auth artifacts:
//   ucc:challenge:<email>           TTL  60s   (registration + assertion)
//   ucc:bootstrap:<sha256(token)>   TTL  15min (single-use first-device gate)
//   ucc:session:<sid>               TTL  24h   (allowlist for instant revoke)

import { getRedis } from './redis-client';

const CHALLENGE_TTL_SECONDS = 60;
const BOOTSTRAP_TTL_SECONDS = 15 * 60;
const SESSION_TTL_SECONDS = 24 * 60 * 60;

// ────────────────────────────────────────────────────────────────────────────
// Challenge — per-ceremony random, single-use, 60s TTL
// ────────────────────────────────────────────────────────────────────────────

export interface StoredChallenge {
  challenge: string; // base64url
  expiresAt: number; // unix seconds
}

export async function setChallenge(
  email: string,
  challenge: string,
): Promise<void> {
  const redis = getRedis();
  const expiresAt = Math.floor(Date.now() / 1000) + CHALLENGE_TTL_SECONDS;
  await redis.set(
    `ucc:challenge:${email}`,
    { challenge, expiresAt },
    { ex: CHALLENGE_TTL_SECONDS },
  );
}

export async function consumeChallenge(
  email: string,
): Promise<string | null> {
  const redis = getRedis();
  const key = `ucc:challenge:${email}`;
  const data = await redis.get<StoredChallenge>(key);
  if (!data) return null;
  // Single-use: delete on read so a replayed challenge is rejected.
  await redis.del(key);
  if (data.expiresAt < Math.floor(Date.now() / 1000)) return null;
  return data.challenge;
}

// ────────────────────────────────────────────────────────────────────────────
// Bootstrap token — single-use, 15min TTL, SHA-256 hashed at rest
// ────────────────────────────────────────────────────────────────────────────

export interface StoredBootstrap {
  email: string;
  expiresAt: number;
  used: boolean;
}

export async function storeBootstrap(
  tokenHash: string,
  email: string,
): Promise<void> {
  const redis = getRedis();
  const expiresAt = Math.floor(Date.now() / 1000) + BOOTSTRAP_TTL_SECONDS;
  await redis.set(
    `ucc:bootstrap:${tokenHash}`,
    { email, expiresAt, used: false },
    { ex: BOOTSTRAP_TTL_SECONDS },
  );
}

export async function consumeBootstrap(
  tokenHash: string,
): Promise<{ email: string } | null> {
  const redis = getRedis();
  const key = `ucc:bootstrap:${tokenHash}`;
  const data = await redis.get<StoredBootstrap>(key);
  if (!data) return null;
  if (data.used) return null;
  if (data.expiresAt < Math.floor(Date.now() / 1000)) return null;
  // Mark used (instead of delete) so we can audit-log the redemption attempt.
  // Cleared by the same TTL.
  await redis.set(key, { ...data, used: true }, { ex: BOOTSTRAP_TTL_SECONDS });
  return { email: data.email };
}

// ────────────────────────────────────────────────────────────────────────────
// Session — server-side allowlist; revoking a credential clears the session
// ────────────────────────────────────────────────────────────────────────────

export interface StoredSession {
  email: string;
  mintedAt: number;
  expiresAt: number;
  lastSeenAt: number;
}

export async function mintSession(sid: string, email: string): Promise<void> {
  const redis = getRedis();
  const now = Math.floor(Date.now() / 1000);
  await redis.set(
    `ucc:session:${sid}`,
    { email, mintedAt: now, expiresAt: now + SESSION_TTL_SECONDS, lastSeenAt: now },
    { ex: SESSION_TTL_SECONDS },
  );
}

export async function getSession(sid: string): Promise<StoredSession | null> {
  const redis = getRedis();
  return (await redis.get<StoredSession>(`ucc:session:${sid}`)) ?? null;
}

export async function touchSession(sid: string): Promise<void> {
  const redis = getRedis();
  const session = await getSession(sid);
  if (!session) return;
  await redis.set(
    `ucc:session:${sid}`,
    { ...session, lastSeenAt: Math.floor(Date.now() / 1000) },
    { ex: SESSION_TTL_SECONDS },
  );
}

export async function revokeSession(sid: string): Promise<void> {
  const redis = getRedis();
  await redis.del(`ucc:session:${sid}`);
}

// Bulk-revoke all sessions for an email (used when revoking a credential
// that's the only one for that operator).
export async function revokeSessionsForEmail(email: string): Promise<number> {
  const redis = getRedis();
  let cursor = 0;
  let deleted = 0;
  do {
    const [next, keys] = await redis.scan(cursor, {
      match: 'ucc:session:*',
      count: 100,
    });
    cursor = typeof next === 'string' ? parseInt(next, 10) : next;
    for (const key of keys) {
      const session = await redis.get<StoredSession>(key);
      if (session?.email === email) {
        await redis.del(key);
        deleted++;
      }
    }
  } while (cursor !== 0);
  return deleted;
}
