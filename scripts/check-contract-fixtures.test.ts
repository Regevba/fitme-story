// scripts/check-contract-fixtures.test.ts
//
// Tests for the E-15 consumer-side contract checker. Each case builds a
// throwaway contract dir / features dir under the OS temp dir and asserts the
// findings — so no test depends on the live vendored fixtures (which is the
// whole point: the consumer's tests must not hand-author the producer's shape).

import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runChecks, ageDays, MAX_AGE_DAYS } from './check-contract-fixtures';

const NOW = new Date('2026-06-22T00:00:00Z');

function isoDaysAgo(n: number): string {
  return new Date(NOW.getTime() - n * 86_400_000).toISOString();
}

let root: string;
let contractDir: string;
let featuresDir: string;

function writeFixture(
  name: string,
  records: Record<string, unknown>[],
  meta: { required_keys: string[]; producer_repo: string; sampled_at: string; provenance?: string },
): void {
  writeFileSync(
    join(contractDir, `${name}.jsonl`),
    records.map((r) => JSON.stringify(r)).join('\n') + '\n',
  );
  writeFileSync(
    join(contractDir, `${name}.meta.json`),
    JSON.stringify({ contract: name, provenance: 'canonical', ...meta }),
  );
}

function writeFeature(slug: string, obj: Record<string, unknown>): void {
  writeFileSync(join(featuresDir, `${slug}.json`), JSON.stringify(obj));
}

before(() => {
  root = mkdtempSync(join(tmpdir(), 'contract-check-'));
  contractDir = join(root, 'contracts');
  featuresDir = join(root, 'features');
  mkdirSync(contractDir, { recursive: true });
  mkdirSync(featuresDir, { recursive: true });
});

after(() => rmSync(root, { recursive: true, force: true }));

describe('ageDays', () => {
  test('computes whole-day age and treats unparseable as infinite', () => {
    assert.equal(ageDays(isoDaysAgo(3), NOW), 3);
    assert.equal(ageDays('not-a-date', NOW), Number.POSITIVE_INFINITY);
  });
});

describe('runChecks — shape (HARD)', () => {
  test('fresh fixture with all required keys → ok, no findings', () => {
    writeFixture(
      'gate-coverage',
      [{ timestamp: isoDaysAgo(0), gate: 'V2', candidates: 1, checked: 1, skipped: 0 }],
      { required_keys: ['timestamp', 'gate', 'candidates'], producer_repo: 'FitTracker2', sampled_at: isoDaysAgo(1) },
    );
    const { ok, findings } = runChecks({ contractDir, featuresDir, now: NOW });
    writeFeature('f1', { current_phase: 'complete', framework_version: 'v7.10' }); // for the live check below
    assert.equal(findings.filter((f) => f.contract === 'gate-coverage').length, 0);
    assert.ok(ok.some((l) => l.startsWith('gate-coverage')));
  });

  test('missing required key on a record → HARD shape failure', () => {
    writeFixture(
      'gate-coverage',
      [{ timestamp: isoDaysAgo(0), gate: 'V2', candidates: 1 /* checked + skipped missing */ }],
      { required_keys: ['timestamp', 'gate', 'candidates', 'checked', 'skipped'], producer_repo: 'FitTracker2', sampled_at: isoDaysAgo(1) },
    );
    const { findings } = runChecks({ contractDir, featuresDir, now: NOW });
    const shape = findings.find((f) => f.contract === 'gate-coverage' && f.tier === 'shape');
    assert.ok(shape?.hard, 'shape drift must be a hard failure');
    assert.match(shape!.message, /checked|skipped/);
  });
});

describe('runChecks — freshness (asymmetric ownership)', () => {
  test('stale FT2-produced fixture → WARN (not hard)', () => {
    writeFixture(
      'gate-coverage',
      [{ timestamp: isoDaysAgo(0), gate: 'V2', candidates: 1, checked: 1, skipped: 0 }],
      { required_keys: ['gate'], producer_repo: 'FitTracker2', sampled_at: isoDaysAgo(MAX_AGE_DAYS + 5) },
    );
    const { findings } = runChecks({ contractDir, featuresDir, now: NOW });
    const fresh = findings.find((f) => f.contract === 'gate-coverage' && f.tier === 'freshness');
    assert.ok(fresh, 'stale fixture must produce a freshness finding');
    assert.equal(fresh!.hard, false, 'vendored FT2 fixture staleness is advisory, not a build break');
  });

  test('stale fitme-story-OWNED fixture → HARD (we control re-sampling)', () => {
    writeFixture(
      'audit-log',
      [{ event_type: 'sign_in', timestamp: isoDaysAgo(0) }],
      { required_keys: ['event_type', 'timestamp'], producer_repo: 'fitme-story', sampled_at: isoDaysAgo(MAX_AGE_DAYS + 5) },
    );
    const { findings } = runChecks({ contractDir, featuresDir, now: NOW });
    const fresh = findings.find((f) => f.contract === 'audit-log' && f.tier === 'freshness');
    assert.ok(fresh?.hard, 'owned fixture staleness must be a hard failure');
  });
});

describe('runChecks — live state-json-schema consumer', () => {
  test('all feature files carry required keys → ok', () => {
    writeFeature('a', { current_phase: 'complete', framework_version: 'v7.10', name: 'a' });
    writeFeature('b', { current_phase: 'implementation', framework_version: 'v7.9', feature: 'b' });
    const { ok, findings } = runChecks({ contractDir, featuresDir, now: NOW });
    assert.equal(findings.filter((f) => f.contract === 'state-json-schema').length, 0);
    assert.ok(ok.some((l) => l.startsWith('state-json-schema')));
  });

  test('a feature file missing framework_version → HARD consumer drift', () => {
    writeFeature('c', { current_phase: 'complete' /* framework_version missing */ });
    const { findings } = runChecks({ contractDir, featuresDir, now: NOW });
    const drift = findings.find((f) => f.contract === 'state-json-schema');
    assert.ok(drift?.hard);
    assert.match(drift!.message, /framework_version/);
  });
});
