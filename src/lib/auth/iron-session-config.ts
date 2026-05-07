// src/lib/auth/iron-session-config.ts
//
// T2 — iron-session config + cookie seal/unseal helpers.
//
// 24h hard cap, sliding refresh if cookie age > 12h. Cookie name is scoped to
// /control-room so it never leaks onto the public showcase paths.

import { sealData, unsealData } from 'iron-session';

const SESSION_TTL_SECONDS = 24 * 60 * 60; // 24 hours
const SESSION_REFRESH_AFTER_SECONDS = 12 * 60 * 60; // 12 hours
const COOKIE_NAME = 'ucc-session';
const COOKIE_PATH = '/control-room';

export interface SessionPayload {
  email: string;
  sid: string; // random session id; allowlisted in Redis
  iat: number; // issued-at unix seconds
  exp: number; // expiry unix seconds
}

function getSecret(): string {
  const secret = process.env.UCC_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'UCC_SESSION_SECRET env var must be set to a 32+ byte random string',
    );
  }
  return secret;
}

export async function sealSession(
  payload: Omit<SessionPayload, 'iat' | 'exp'>,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const full: SessionPayload = {
    ...payload,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  return sealData(full, { password: getSecret(), ttl: SESSION_TTL_SECONDS });
}

export async function unsealSession(
  cookieValue: string,
): Promise<SessionPayload | null> {
  if (!cookieValue) return null;
  try {
    const data = await unsealData<SessionPayload>(cookieValue, {
      password: getSecret(),
      ttl: SESSION_TTL_SECONDS,
    });
    if (!data || typeof data !== 'object') return null;
    // iron-session returns {} on garbage input rather than throwing.
    // A valid sealed payload must carry all 4 fields.
    if (
      typeof data.email !== 'string' ||
      typeof data.sid !== 'string' ||
      typeof data.iat !== 'number' ||
      typeof data.exp !== 'number'
    ) {
      return null;
    }
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export function shouldRefresh(payload: SessionPayload): boolean {
  const now = Math.floor(Date.now() / 1000);
  return now - payload.iat > SESSION_REFRESH_AFTER_SECONDS;
}

export const sessionConfig = {
  cookieName: COOKIE_NAME,
  cookiePath: COOKIE_PATH,
  ttlSeconds: SESSION_TTL_SECONDS,
  refreshAfterSeconds: SESSION_REFRESH_AFTER_SECONDS,
} as const;
