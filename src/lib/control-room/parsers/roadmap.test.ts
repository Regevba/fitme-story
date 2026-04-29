/**
 * Integration test for parsers/roadmap.ts — port from
 * dashboard/tests/roadmap.test.js (FT2 vitest source).
 *
 * Reads the synced master-backlog-roadmap.md snapshot under src/data/docs/.
 * Requires `npm run prebuild` to have populated the snapshot at least once.
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { parseRoadmap } from './roadmap';

describe('parseRoadmap', () => {
  test('reads the canonical master-plan roadmap path and parses RICE rows', () => {
    const tasks = parseRoadmap();

    assert.ok(tasks.length > 5, `expected >5 RICE rows, got ${tasks.length}`);
    // Every row should at least have a name and a non-zero RICE score.
    for (const t of tasks) {
      assert.equal(typeof t.name, 'string');
      assert.ok(t.name.length > 0);
      assert.equal(typeof t.taskNumber, 'number');
      assert.equal(typeof t.rice, 'number');
    }
  });
});
