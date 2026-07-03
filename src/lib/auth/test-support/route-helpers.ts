// src/lib/auth/test-support/route-helpers.ts
//
// FIT-156 (T8) — request/env helpers for WebAuthn route-handler tests.
//
// Not a *.test.ts file — excluded from the runner glob + coverage.

import { NextRequest } from 'next/server';
import type { Credential } from '../redis-store';

const BASE = 'http://localhost/api/auth';

/** Build a NextRequest with a JSON body. Pass a raw string to force bad JSON. */
export function jsonRequest(
  body: unknown,
  opts?: { path?: string; headers?: Record<string, string> },
): NextRequest {
  const raw = typeof body === 'string' ? body : JSON.stringify(body);
  return new NextRequest(`${BASE}${opts?.path ?? '/test'}`, {
    method: 'POST',
    body: raw,
    headers: { 'content-type': 'application/json', ...(opts?.headers ?? {}) },
  });
}

/** GET NextRequest (devices route takes no body). */
export function getRequest(opts?: { path?: string; headers?: Record<string, string> }): NextRequest {
  return new NextRequest(`${BASE}${opts?.path ?? '/devices'}`, {
    method: 'GET',
    headers: opts?.headers ?? {},
  });
}

/** Deterministic credential record for seeding the mock store. */
export function makeCredential(over?: Partial<Credential>): Credential {
  return {
    credentialID: 'Y3JlZC1pZC0x', // base64url("cred-id-1")
    ownerEmail: 'operator@example.com',
    publicKey: 'cHViLWtleQ', // base64url-ish placeholder
    counter: 0,
    deviceType: 'platform',
    transports: ['internal'],
    aaguid: '00000000-0000-0000-0000-000000000000',
    label: 'Test Passkey',
    createdAt: 1_700_000_000,
    lastUsedAt: null,
    revokedAt: null,
    ...over,
  };
}

/**
 * Set the env vars the auth libs read at call time. Returns a restore fn.
 * (RP_ID / EXPECTED_ORIGIN are module-level consts with defaults — left as-is.)
 */
export function withAuthEnv(env: {
  allowedEmails?: string;
  sessionSecret?: string;
}): () => void {
  const prev = {
    UCC_ALLOWED_EMAILS: process.env.UCC_ALLOWED_EMAILS,
    UCC_SESSION_SECRET: process.env.UCC_SESSION_SECRET,
  };
  if (env.allowedEmails !== undefined) process.env.UCC_ALLOWED_EMAILS = env.allowedEmails;
  if (env.sessionSecret !== undefined) process.env.UCC_SESSION_SECRET = env.sessionSecret;
  return () => {
    for (const [k, v] of Object.entries(prev)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  };
}

/** A 32+ byte secret good enough for iron-session in tests. */
export const TEST_SESSION_SECRET = 'test-session-secret-0123456789abcdef-32b';
