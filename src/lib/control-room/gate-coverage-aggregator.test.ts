import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { aggregateGateCoverage, countEventsBySource } from './gate-coverage-aggregator';

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
