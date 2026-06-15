/**
 * Resilience tests for the control-room live-source layer.
 *
 * The load-bearing contract: every probe is FAIL-SOFT — no token, a non-2xx
 * response, a network reject, or a malformed payload must all yield a
 * `degraded` result and NEVER throw. Tests stub `globalThis.fetch` + env.
 */

import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { fetchGitHubHealth } from './github';
import { fetchVercelHealth } from './vercel';
import { fetchLinearHealth } from './linear';
import { fetchNotionHealth } from './notion';
import { fetchSupabaseHealth } from './supabase';
import { fetchGa4Health } from './ga4';
import { gatherLiveSources, anyLive } from './gather';
import { buildSourceHealthRows, type SnapshotShape } from './present';
import { degradedResult, liveResult } from './types';

type FetchFn = typeof globalThis.fetch;
const realFetch = globalThis.fetch;

// Env keys the probes read; saved/cleared per test for isolation.
const ENV_KEYS = [
  'GITHUB_TOKEN', 'VERCEL_API_TOKEN', 'LINEAR_API_KEY', 'NOTION_API_KEY',
  'NOTION_TRACKED_PAGE_IDS', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY', 'GA4_SUMMARY_URL',
];
const savedEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const k of ENV_KEYS) { savedEnv[k] = process.env[k]; delete process.env[k]; }
});
afterEach(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
  globalThis.fetch = realFetch;
});

function stubFetch(fn: (url: string) => Promise<Response> | Response) {
  globalThis.fetch = ((input: string | URL | Request) =>
    Promise.resolve(fn(String(input)))) as unknown as FetchFn;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

describe('live source probes — degrade with no token', () => {
  const probes = [
    ['github', fetchGitHubHealth],
    ['vercel', fetchVercelHealth],
    ['linear', fetchLinearHealth],
    ['notion', fetchNotionHealth],
    ['supabase', fetchSupabaseHealth],
    ['ga4', fetchGa4Health],
  ] as const;

  for (const [name, probe] of probes) {
    test(`${name}: no token -> degraded, no throw`, async () => {
      const res = await probe();
      assert.equal(res.degraded, true, `${name} should be degraded`);
      assert.equal(res.mode, 'snapshot');
      assert.equal(res.data, null);
    });
  }
});

describe('live source probes — fail soft on bad responses', () => {
  test('github: non-200 issues fetch -> degraded, no throw', async () => {
    process.env.GITHUB_TOKEN = 'x';
    stubFetch(() => new Response('rate limited', { status: 403 }));
    const res = await fetchGitHubHealth();
    assert.equal(res.degraded, true);
  });

  test('vercel: network reject -> degraded, no throw', async () => {
    process.env.VERCEL_API_TOKEN = 'x';
    globalThis.fetch = (() => Promise.reject(new Error('ECONNRESET'))) as unknown as FetchFn;
    const res = await fetchVercelHealth();
    assert.equal(res.degraded, true);
  });

  test('linear: malformed payload -> degraded, no throw', async () => {
    process.env.LINEAR_API_KEY = 'x';
    stubFetch(() => jsonResponse({ nonsense: true }));
    const res = await fetchLinearHealth();
    assert.equal(res.degraded, true);
  });

  test('ga4: summary url set but empty body -> degraded', async () => {
    process.env.GA4_SUMMARY_URL = 'https://example.com/ga4.json';
    stubFetch(() => jsonResponse({}));
    const res = await fetchGa4Health();
    assert.equal(res.degraded, true);
  });
});

describe('live source probes — happy paths', () => {
  test('vercel: READY deploy -> live + healthy', async () => {
    process.env.VERCEL_API_TOKEN = 'x';
    stubFetch(() => jsonResponse({ deployments: [{ state: 'READY', target: 'production', url: 'foo.app', created: 1, meta: { githubCommitMessage: 'fix: x\nbody' } }] }));
    const res = await fetchVercelHealth();
    assert.equal(res.degraded, false);
    assert.equal(res.mode, 'live');
    assert.equal(res.healthy, true);
    assert.equal(res.data?.latest_state, 'READY');
    assert.equal(res.data?.latest_commit, 'fix: x');
  });

  test('vercel: ERROR deploy -> live but unhealthy + alert', async () => {
    process.env.VERCEL_API_TOKEN = 'x';
    stubFetch(() => jsonResponse({ deployments: [{ state: 'ERROR', created: 2 }] }));
    const res = await fetchVercelHealth();
    assert.equal(res.healthy, false);
    assert.equal(res.alerts, 1);
  });

  test('linear: counts by state type', async () => {
    process.env.LINEAR_API_KEY = 'x';
    stubFetch(() => jsonResponse({ data: { issues: { nodes: [
      { state: { type: 'completed' } }, { state: { type: 'completed' } },
      { state: { type: 'started' } }, { state: { type: 'backlog' } },
      { state: { type: 'unstarted' } }, { state: { type: 'canceled' } },
    ] } } }));
    const res = await fetchLinearHealth();
    assert.equal(res.degraded, false);
    assert.equal(res.data?.total, 6);
    assert.equal(res.data?.done, 2);
    assert.equal(res.data?.in_progress, 1);
    assert.equal(res.data?.canceled, 1);
  });
});

describe('gatherLiveSources', () => {
  test('all degraded with no env -> never throws, anyLive false', async () => {
    const sources = await gatherLiveSources();
    assert.equal(anyLive(sources), false);
    assert.equal(sources.github.degraded, true);
    assert.equal(sources.ga4.degraded, true);
  });
});

describe('buildSourceHealthRows', () => {
  const snapshot: SnapshotShape = {
    updated: '2026-06-15T00:00:00Z',
    sources: {
      github: { repo_summary: { current_branch: 'main', working_tree_changes: 0, open_prs_ft2: 1 }, issue_summary: { total: 20 } },
      linear: { issue_summary: { total: 48, done: 23, in_progress: 1, todo: 9, backlog: 15 } },
      notion: { page_summary: { tracked_pages: 9, roadmap_last_updated: '2026-06-15T16:24:00Z' } },
      vercel: { live_probe_2026_06_15: { latest_production_state: 'READY' } },
      analytics: { runtime_health: { ga4_active_users_last_probe: { as_of: '2026-06-15' } } },
    },
  };

  function allDegraded() {
    return {
      github: degradedResult<never>('github', 'no_token'),
      vercel: degradedResult<never>('vercel', 'no_token'),
      linear: degradedResult<never>('linear', 'no_token'),
      notion: degradedResult<never>('notion', 'no_token'),
      supabase: degradedResult<never>('supabase', 'no_token'),
      ga4: degradedResult<never>('ga4', 'no_token'),
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }

  test('all degraded -> 6 snapshot rows built from snapshot baseline', () => {
    const rows = buildSourceHealthRows(snapshot, allDegraded());
    assert.equal(rows.length, 6);
    assert.ok(rows.every((r) => r.mode === 'snapshot'));
    const linear = rows.find((r) => r.key === 'linear');
    assert.match(linear!.headline, /48 issues/);
  });

  test('live linear row overrides snapshot', () => {
    const sources = allDegraded();
    sources.linear = liveResult('linear',
      { team: 'FIT', total: 50, backlog: 16, todo: 10, in_progress: 2, done: 22, canceled: 0 },
      { healthy: true, alerts: 0, fetchedAt: '2026-06-15T20:00:00Z' });
    const rows = buildSourceHealthRows(snapshot, sources);
    const linear = rows.find((r) => r.key === 'linear')!;
    assert.equal(linear.mode, 'live');
    assert.match(linear.headline, /50 issues/);
  });
});
