// src/lib/auth/test-support/mock-redis.ts
//
// FIT-156 (T8) — shared in-memory Upstash Redis mock for route-handler tests.
//
// Extends the makeMock() pattern first used in redis-lockout.test.ts to cover
// the full method surface the auth libs call: get, set (with {ex}), del, incr,
// expire, sadd, smembers, lpush, lrange, ltrim, scan. Injected into the real
// libs via `__setRedisForTests` so the route handlers exercise their true
// storage codepaths against an in-memory KV instead of a live Upstash REST
// endpoint.
//
// Not a *.test.ts file — excluded from the runner glob; excluded from coverage
// via .c8rc.json.

import type { Redis } from '@upstash/redis';
import { __setRedisForTests } from '../redis-client';

interface Entry {
  value: unknown;
  ttlSeconds?: number;
}

export interface MockRedisHandle {
  redis: Redis;
  store: Map<string, Entry>;
  /** Restore the real (null) client so the next test re-injects cleanly. */
  reset: () => void;
}

/**
 * Build an in-memory Upstash-compatible Redis mock. Object values are stored
 * by reference (the real client JSON-round-trips; for tests reference storage
 * is behaviourally equivalent since the libs spread-copy before re-writing).
 */
export function makeMockRedis(): MockRedisHandle {
  const store = new Map<string, Entry>();

  const asSet = (key: string): Set<string> => {
    const e = store.get(key);
    if (e && e.value instanceof Set) return e.value as Set<string>;
    const s = new Set<string>();
    store.set(key, { value: s, ttlSeconds: e?.ttlSeconds });
    return s;
  };

  const asList = (key: string): string[] => {
    const e = store.get(key);
    if (e && Array.isArray(e.value)) return e.value as string[];
    const l: string[] = [];
    store.set(key, { value: l, ttlSeconds: e?.ttlSeconds });
    return l;
  };

  const redis = {
    async get(key: string): Promise<unknown> {
      const e = store.get(key);
      return e ? e.value : null;
    },
    async set(
      key: string,
      value: unknown,
      opts?: { ex?: number },
    ): Promise<'OK'> {
      store.set(key, { value, ttlSeconds: opts?.ex });
      return 'OK';
    },
    async del(...keys: string[]): Promise<number> {
      let n = 0;
      for (const k of keys) if (store.delete(k)) n++;
      return n;
    },
    async incr(key: string): Promise<number> {
      const e = store.get(key);
      const current = typeof e?.value === 'number' ? (e.value as number) : 0;
      const next = current + 1;
      store.set(key, { value: next, ttlSeconds: e?.ttlSeconds });
      return next;
    },
    async expire(key: string, seconds: number): Promise<number> {
      const e = store.get(key);
      if (!e) return 0;
      store.set(key, { value: e.value, ttlSeconds: seconds });
      return 1;
    },
    async sadd(key: string, ...members: string[]): Promise<number> {
      const s = asSet(key);
      let added = 0;
      for (const m of members) {
        if (!s.has(m)) {
          s.add(m);
          added++;
        }
      }
      return added;
    },
    async smembers(key: string): Promise<string[]> {
      const e = store.get(key);
      return e && e.value instanceof Set ? [...(e.value as Set<string>)] : [];
    },
    async lpush(key: string, ...vals: string[]): Promise<number> {
      const l = asList(key);
      l.unshift(...vals);
      return l.length;
    },
    async lrange(key: string, start: number, stop: number): Promise<string[]> {
      const e = store.get(key);
      const l = e && Array.isArray(e.value) ? (e.value as string[]) : [];
      // Redis lrange is inclusive; -1 == last element.
      const end = stop < 0 ? l.length + stop : stop;
      return l.slice(start, end + 1);
    },
    async ltrim(key: string, start: number, stop: number): Promise<'OK'> {
      const e = store.get(key);
      if (!e || !Array.isArray(e.value)) return 'OK';
      const l = e.value as string[];
      const end = stop < 0 ? l.length + stop : stop;
      store.set(key, { value: l.slice(start, end + 1), ttlSeconds: e.ttlSeconds });
      return 'OK';
    },
    async scan(
      _cursor: number | string,
      opts?: { match?: string; count?: number },
    ): Promise<[string, string[]]> {
      // One-shot scan: return every matching key + a terminal '0' cursor.
      const match = opts?.match;
      const re = match
        ? new RegExp('^' + match.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$')
        : null;
      const keys = [...store.keys()].filter((k) => (re ? re.test(k) : true));
      return ['0', keys];
    },
  } as unknown as Redis;

  return {
    redis,
    store,
    reset: () => __setRedisForTests(null),
  };
}

/** Install a fresh mock as the active Redis client and return its handle. */
export function installMockRedis(): MockRedisHandle {
  const handle = makeMockRedis();
  __setRedisForTests(handle.redis);
  return handle;
}
