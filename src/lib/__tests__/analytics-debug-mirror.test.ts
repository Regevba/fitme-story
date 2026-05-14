/**
 * Tests for `analytics-debug-mirror.ts` — Phase 2.A.4 of analytics-observability.
 *
 * Validates:
 *   - SSR safe (typeof window === 'undefined')
 *   - Env-driven sink resolution (only NEXT_PUBLIC_DEBUG_ANALYTICS=1 enables)
 *   - Default URL + DEBUG_ANALYTICS_URL override
 *   - Fetch shape (POST + JSON body + correct event payload)
 *   - Failures swallowed (production safety)
 *
 * Uses node:test (the built-in runner already used by sibling tests in
 * src/lib/control-room/*.test.ts).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  __postEventForTests,
  __resolveSinkURLForTests,
} from '../analytics-debug-mirror';

// ────────────────────────────────────────────────────────────────────────────
// resolveSinkURL — env-gated
// ────────────────────────────────────────────────────────────────────────────

test('resolveSinkURL: returns null when env var unset', () => {
  const prev = process.env.NEXT_PUBLIC_DEBUG_ANALYTICS;
  delete process.env.NEXT_PUBLIC_DEBUG_ANALYTICS;
  try {
    assert.equal(__resolveSinkURLForTests(), null);
  } finally {
    if (prev !== undefined) process.env.NEXT_PUBLIC_DEBUG_ANALYTICS = prev;
  }
});

test('resolveSinkURL: returns null when env value is not exactly "1"', () => {
  for (const v of ['true', 'yes', '0', 'TRUE', '1.0']) {
    const prev = process.env.NEXT_PUBLIC_DEBUG_ANALYTICS;
    process.env.NEXT_PUBLIC_DEBUG_ANALYTICS = v;
    try {
      assert.equal(__resolveSinkURLForTests(), null, `value "${v}" should NOT enable`);
    } finally {
      if (prev !== undefined) process.env.NEXT_PUBLIC_DEBUG_ANALYTICS = prev;
      else delete process.env.NEXT_PUBLIC_DEBUG_ANALYTICS;
    }
  }
});

test('resolveSinkURL: returns default URL when env=1 and no URL override', () => {
  const prev1 = process.env.NEXT_PUBLIC_DEBUG_ANALYTICS;
  const prev2 = process.env.NEXT_PUBLIC_DEBUG_ANALYTICS_URL;
  process.env.NEXT_PUBLIC_DEBUG_ANALYTICS = '1';
  delete process.env.NEXT_PUBLIC_DEBUG_ANALYTICS_URL;
  try {
    assert.equal(__resolveSinkURLForTests(), 'http://127.0.0.1:8765/event');
  } finally {
    if (prev1 !== undefined) process.env.NEXT_PUBLIC_DEBUG_ANALYTICS = prev1;
    else delete process.env.NEXT_PUBLIC_DEBUG_ANALYTICS;
    if (prev2 !== undefined) process.env.NEXT_PUBLIC_DEBUG_ANALYTICS_URL = prev2;
  }
});

test('resolveSinkURL: returns custom URL when override set', () => {
  const prev1 = process.env.NEXT_PUBLIC_DEBUG_ANALYTICS;
  const prev2 = process.env.NEXT_PUBLIC_DEBUG_ANALYTICS_URL;
  process.env.NEXT_PUBLIC_DEBUG_ANALYTICS = '1';
  process.env.NEXT_PUBLIC_DEBUG_ANALYTICS_URL = 'http://localhost:9999/event';
  try {
    assert.equal(__resolveSinkURLForTests(), 'http://localhost:9999/event');
  } finally {
    if (prev1 !== undefined) process.env.NEXT_PUBLIC_DEBUG_ANALYTICS = prev1;
    else delete process.env.NEXT_PUBLIC_DEBUG_ANALYTICS;
    if (prev2 !== undefined) process.env.NEXT_PUBLIC_DEBUG_ANALYTICS_URL = prev2;
    else delete process.env.NEXT_PUBLIC_DEBUG_ANALYTICS_URL;
  }
});

// ────────────────────────────────────────────────────────────────────────────
// __postEventForTests — fetch shape
// ────────────────────────────────────────────────────────────────────────────

test('postEvent: sends POST with JSON body containing event_name + params', async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = ((url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init || {} });
    return Promise.resolve(new Response(null, { status: 202 }));
  }) as typeof fetch;

  try {
    await __postEventForTests(
      'http://127.0.0.1:8765/event',
      'home_action_tap',
      { action_type: 'start_workout', day_type: 'push' }
    );
  } finally {
    globalThis.fetch = realFetch;
  }

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'http://127.0.0.1:8765/event');
  assert.equal(calls[0].init.method, 'POST');

  const headers = calls[0].init.headers as Record<string, string>;
  assert.equal(headers['Content-Type'], 'application/json');

  const body = JSON.parse(calls[0].init.body as string);
  assert.deepEqual(body, {
    event_name: 'home_action_tap',
    params: { action_type: 'start_workout', day_type: 'push' },
  });
});

test('postEvent: uses keepalive + omit credentials (production safe)', async () => {
  const calls: { init: RequestInit }[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = ((_url: string | URL | Request, init?: RequestInit) => {
    calls.push({ init: init || {} });
    return Promise.resolve(new Response(null, { status: 202 }));
  }) as typeof fetch;

  try {
    await __postEventForTests('http://example.com/event', 'x', {});
  } finally {
    globalThis.fetch = realFetch;
  }

  assert.equal(calls[0].init.keepalive, true);
  assert.equal(calls[0].init.credentials, 'omit');
});

test('postEvent: swallows fetch failures (production safety)', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = () => Promise.reject(new Error('network down'));

  try {
    // Must NOT throw
    await assert.doesNotReject(
      __postEventForTests('http://127.0.0.1:8765/event', 'x', {})
    );
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('postEvent: swallows synchronous throws from fetch (e.g. invalid URL)', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = (() => {
    throw new TypeError('Invalid URL');
  }) as typeof fetch;

  try {
    await assert.doesNotReject(
      __postEventForTests('not-a-url', 'x', {})
    );
  } finally {
    globalThis.fetch = realFetch;
  }
});
