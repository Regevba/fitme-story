// src/lib/auth/redis-client.ts
//
// T4 — Upstash Redis client. Uses HTTP REST so it works on Node.js + Edge
// runtime without TCP. Region-pinned via Vercel Marketplace integration env vars
// (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN). Provisioned automatically
// when the Upstash Marketplace integration is installed for the project.
//
// Singleton pattern: one client per Vercel function invocation.

import { Redis } from '@upstash/redis';

let cached: Redis | null = null;

export function getRedis(): Redis {
  if (cached) return cached;
  // Redis.fromEnv() reads UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
  // Throws clearly if either is missing — matches the build-time-safety
  // pattern in the vercel-storage skill.
  cached = Redis.fromEnv();
  return cached;
}

// Test seam — allows tests to inject a mock client.
export function __setRedisForTests(client: Redis | null): void {
  cached = client;
}
