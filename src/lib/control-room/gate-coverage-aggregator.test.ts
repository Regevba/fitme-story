import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { aggregateGateCoverage, countEventsBySource } from './gate-coverage-aggregator';

const HERE = dirname(fileURLToPath(import.meta.url));
const CONTRACT_DIR = join(HERE, '__fixtures__', 'contracts');

describe('gate-coverage-aggregator', () => {
  test('combines two sources tagged by source_repo, sorted by timestamp (canonical FT2 schema)', () => {
    const ft2Lines = [
      '{"gate":"V2","outcome":"FAIL","timestamp":"2026-05-12T01:00:00Z"}',
      '{"gate":"V9","outcome":"PASS","timestamp":"2026-05-12T03:00:00Z"}',
    ].join('\n');
    const fsLines = [
      '{"gate":"V2","outcome":"PASS","timestamp":"2026-05-12T02:00:00Z"}',
    ].join('\n');

    const result = aggregateGateCoverage(ft2Lines, fsLines);
    assert.equal(result.length, 3);
    assert.equal(result[0].source_repo, 'ft2');
    assert.equal(result[0].timestamp, '2026-05-12T01:00:00Z');
    assert.equal(result[1].source_repo, 'fitme-story');
    assert.equal(result[1].timestamp, '2026-05-12T02:00:00Z');
    assert.equal(result[2].source_repo, 'ft2');
  });

  test('accepts legacy `ts` field as an alias (back-compat)', () => {
    const ft2Lines = '{"gate":"V2","outcome":"FAIL","ts":"2026-05-12T01:00:00Z"}';
    const fsLines = '{"gate":"V2","outcome":"PASS","timestamp":"2026-05-12T02:00:00Z"}';
    const result = aggregateGateCoverage(ft2Lines, fsLines);
    assert.equal(result.length, 2);
    assert.equal(result[0].timestamp, '2026-05-12T01:00:00Z');
    assert.equal(result[1].timestamp, '2026-05-12T02:00:00Z');
  });

  test('does not crash when event is missing both timestamp and ts (defensive)', () => {
    const ft2Lines = '{"gate":"V2","outcome":"FAIL"}';
    const fsLines = '{"gate":"V9","outcome":"PASS","timestamp":"2026-05-12T02:00:00Z"}';
    const result = aggregateGateCoverage(ft2Lines, fsLines);
    assert.equal(result.length, 2);
    assert.equal(result[0].timestamp, '');
    assert.equal(result[1].timestamp, '2026-05-12T02:00:00Z');
  });

  test('counts events per source', () => {
    const ft2Lines = '{"gate":"V2","outcome":"FAIL","timestamp":"2026-05-12T00:00:00Z"}';
    const fsLines = '{"gate":"V2","outcome":"PASS","timestamp":"2026-05-12T01:00:00Z"}';
    const counts = countEventsBySource(ft2Lines, fsLines);
    assert.equal(counts.ft2, 1);
    assert.equal(counts['fitme-story'], 1);
  });

  test('handles empty fitme-story side gracefully', () => {
    const ft2Lines = '{"gate":"V2","outcome":"FAIL","timestamp":"2026-05-12T00:00:00Z"}';
    const fsLines = '';
    const result = aggregateGateCoverage(ft2Lines, fsLines);
    assert.equal(result.length, 1);
    assert.equal(result[0].source_repo, 'ft2');

    const counts = countEventsBySource(ft2Lines, fsLines);
    assert.equal(counts.ft2, 1);
    assert.equal(counts['fitme-story'], 0);
  });

  test('skips empty lines and trailing newlines', () => {
    const ft2Lines = '{"gate":"V2","outcome":"FAIL","timestamp":"2026-05-12T00:00:00Z"}\n\n\n';
    const fsLines = '\n{"gate":"V2","outcome":"PASS","timestamp":"2026-05-12T01:00:00Z"}\n';
    const result = aggregateGateCoverage(ft2Lines, fsLines);
    assert.equal(result.length, 2);
  });
});

// ────────────────────────────────────────────────────────────────────────
// F-CONTRACT-FIXTURE-SAMPLING consumer adoption (closes the W16 class)
//
// The tests above use INLINE, hand-authored fixtures — the exact pattern that
// caused the 2026-05-24 13-day silent regression (consumer expected `event.ts`
// while the producer emitted `timestamp`; both repos' tests agreed on the wrong
// shape). These tests instead run the aggregator against the CANONICAL fixture
// sampled from FT2's real `scripts/gate_coverage.py` output by
// `make sample-contract-fixtures` — so any producer-shape drift fails here.
// ────────────────────────────────────────────────────────────────────────

describe('gate-coverage contract (canonical FT2 producer fixture)', () => {
  const fixture = readFileSync(join(CONTRACT_DIR, 'gate-coverage.jsonl'), 'utf8');
  const meta = JSON.parse(
    readFileSync(join(CONTRACT_DIR, 'gate-coverage.meta.json'), 'utf8'),
  ) as { provenance: string; required_keys: string[]; producer_repo: string };

  test('fixture is the canonical producer sample (not consumer-invented)', () => {
    assert.equal(meta.provenance, 'canonical');
    assert.equal(meta.producer_repo, 'FitTracker2');
  });

  // The producer stream is NOT uniform — sampling surfaced two sub-schemas:
  //   main gate_coverage.py : {timestamp, mode, gate, candidates, checked, skipped, skip_reasons}
  //   w9.auto_isolate       : {ts, outcome, drift, gate, candidates, checked, skipped, skip_reasons}
  // The Mechanism-A coverage tuple {gate, candidates, checked, skipped} is the
  // TRUE per-record invariant; timestamp is either `timestamp` or legacy `ts`
  // (the aggregator normalizes both — this is exactly the W16 field the bug hit).
  const CORE_INVARIANT = ['gate', 'candidates', 'checked', 'skipped'];

  test('every canonical record carries the core Mechanism-A invariant', () => {
    const lines = fixture.split('\n').filter((l) => l.trim().length > 0);
    assert.ok(lines.length > 0, 'canonical fixture must be non-empty');
    for (const line of lines) {
      const rec = JSON.parse(line) as Record<string, unknown>;
      for (const key of CORE_INVARIANT) {
        assert.ok(
          key in rec,
          `producer drift: canonical record (gate=${rec.gate}) missing core key ` +
            `"${key}" — re-run \`make sample-contract-fixtures\` in FT2.`,
        );
      }
      assert.ok(
        'timestamp' in rec || 'ts' in rec,
        `producer drift: record (gate=${rec.gate}) has neither timestamp nor ts`,
      );
    }
  });

  test('aggregator parses the canonical shape — timestamp present, source tagged', () => {
    const result = aggregateGateCoverage(fixture, '');
    assert.ok(result.length > 0);
    for (const ev of result) {
      assert.equal(ev.source_repo, 'ft2');
      assert.ok(ev.gate.length > 0, 'gate name must survive parse');
      // The W16 bug: timestamp would be '' if the producer key were misread.
      assert.notEqual(ev.timestamp, '', 'canonical `timestamp` must normalize');
    }
  });
});
