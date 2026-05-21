// src/lib/auth/redis-client.ts
//
// T4 — Upstash Redis client. Uses HTTP REST so it works on Node.js + Edge
// runtime without TCP. Region-pinned via Vercel Marketplace integration env vars.
//
// W13 durable fix (2026-05-21): dual-name env-var fallback for
// UPSTASH_REDIS_REST_* (Upstash native naming) and KV_REST_API_* (legacy
// Vercel KV naming). Vercel auto-provisions both on runtime, but
// `vercel env pull .env.local` only pulls KV_* for some projects (e.g.
// fitme-story as of 2026-05-20). Falling back ensures local CLI scripts
// + tests work without manual shell aliasing. See observed-patterns W13.
//
// Singleton pattern: one client per Vercel function invocation.

import { Redis } from '@upstash/redis';

let cached: Redis | null = null;

export function getRedis(): Redis {
  if (cached) return cached;
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error(
      'Upstash Redis env vars missing — set either UPSTASH_REDIS_REST_URL + ' +
      'UPSTASH_REDIS_REST_TOKEN (Upstash native) or KV_REST_API_URL + ' +
      'KV_REST_API_TOKEN (legacy Vercel KV). Both names accepted as of W13 fix.'
    );
  }
  cached = new Redis({ url, token });
  return cached;
}

// Test seam — allows tests to inject a mock client.
export function __setRedisForTests(client: Redis | null): void {
  cached = client;
}
