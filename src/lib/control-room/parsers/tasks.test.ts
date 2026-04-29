/**
 * Tests for parsers/tasks.ts — port from
 * dashboard/tests/tasks.test.js (FT2 vitest source).
 *
 * Pure-logic tests; no external data sources. Uses node:test (matches the
 * fitme-story test runner — see package.json `test` script).
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import {
  computeReadySet,
  computeBlockedSet,
  computeCriticalPath,
  buildPriorityQueue,
  parseTasks,
  type Task,
  type StateFileForTasks,
} from './tasks';

describe('computeReadySet', () => {
  test('returns tasks with no dependencies as ready', () => {
    const tasks: Task[] = [
      { id: 'T1', status: 'pending', depends_on: [] },
      { id: 'T2', status: 'pending', depends_on: [] },
    ];
    const ready = computeReadySet(tasks);
    assert.deepEqual(ready.map((t) => t.id), ['T1', 'T2']);
  });

  test('excludes done and in_progress tasks', () => {
    const tasks: Task[] = [
      { id: 'T1', status: 'done', depends_on: [] },
      { id: 'T2', status: 'in_progress', depends_on: [] },
      { id: 'T3', status: 'pending', depends_on: [] },
    ];
    const ready = computeReadySet(tasks);
    assert.deepEqual(ready.map((t) => t.id), ['T3']);
  });

  test('returns tasks whose dependencies are all done', () => {
    const tasks: Task[] = [
      { id: 'T1', status: 'done', depends_on: [] },
      { id: 'T2', status: 'pending', depends_on: ['T1'] },
      { id: 'T3', status: 'pending', depends_on: ['T1', 'T2'] },
    ];
    const ready = computeReadySet(tasks);
    assert.deepEqual(ready.map((t) => t.id), ['T2']);
  });

  test('blocks tasks with unmet dependencies', () => {
    const tasks: Task[] = [
      { id: 'T1', status: 'pending', depends_on: [] },
      { id: 'T2', status: 'pending', depends_on: ['T1'] },
    ];
    const ready = computeReadySet(tasks);
    assert.deepEqual(ready.map((t) => t.id), ['T1']);
  });

  test('handles tasks with no depends_on field', () => {
    const tasks: Task[] = [{ id: 'T1', status: 'pending' }];
    const ready = computeReadySet(tasks);
    assert.deepEqual(ready.map((t) => t.id), ['T1']);
  });
});

describe('computeBlockedSet', () => {
  test('returns tasks with at least one unmet dependency', () => {
    const tasks: Task[] = [
      { id: 'T1', status: 'pending', depends_on: [] },
      { id: 'T2', status: 'pending', depends_on: ['T1'] },
      { id: 'T3', status: 'pending', depends_on: ['T1', 'T2'] },
    ];
    const blocked = computeBlockedSet(tasks);
    assert.deepEqual(blocked.map((t) => t.id), ['T2', 'T3']);
  });

  test('returns empty when all dependencies are met', () => {
    const tasks: Task[] = [
      { id: 'T1', status: 'done', depends_on: [] },
      { id: 'T2', status: 'pending', depends_on: ['T1'] },
    ];
    const blocked = computeBlockedSet(tasks);
    assert.equal(blocked.length, 0);
  });
});

describe('computeCriticalPath', () => {
  test('returns empty array for empty input', () => {
    assert.deepEqual(computeCriticalPath([]), []);
  });

  test('returns single task for no-dependency case', () => {
    const tasks: Task[] = [{ id: 'T1', status: 'pending', depends_on: [] }];
    const path = computeCriticalPath(tasks);
    assert.deepEqual(path, ['T1']);
  });

  test('identifies the longest dependency chain', () => {
    const tasks: Task[] = [
      { id: 'T1', status: 'done', depends_on: [] },
      { id: 'T2', status: 'pending', depends_on: ['T1'] },
      { id: 'T3', status: 'pending', depends_on: ['T2'] },
      { id: 'T4', status: 'pending', depends_on: ['T1'] },
    ];
    const path = computeCriticalPath(tasks);
    assert.deepEqual(path, ['T1', 'T2', 'T3']);
    assert.equal(path.length, 3);
  });

  test('handles diamond dependencies correctly', () => {
    const tasks: Task[] = [
      { id: 'T1', status: 'done', depends_on: [] },
      { id: 'T2', status: 'pending', depends_on: ['T1'] },
      { id: 'T3', status: 'pending', depends_on: ['T1'] },
      { id: 'T4', status: 'pending', depends_on: ['T2', 'T3'] },
    ];
    const path = computeCriticalPath(tasks);
    assert.equal(path.length, 3);
    assert.equal(path[0], 'T1');
    assert.equal(path[path.length - 1], 'T4');
  });
});

describe('buildPriorityQueue', () => {
  test('returns only ready tasks sorted by computed score', () => {
    const tasks: Task[] = [
      { id: 'T1', status: 'done', depends_on: [], priority_score: 10 },
      { id: 'T2', status: 'pending', depends_on: [], priority_score: 5 },
      { id: 'T3', status: 'pending', depends_on: [], priority_score: 20 },
      { id: 'T4', status: 'pending', depends_on: ['T2'], priority_score: 100 },
    ];
    const queue = buildPriorityQueue(tasks);
    const ids = queue.map((t) => t.id);
    assert.ok(!ids.includes('T1'), 'T1 done — should not appear');
    assert.ok(!ids.includes('T4'), 'T4 blocked — should not appear');
    assert.ok(ids.indexOf('T3') < ids.indexOf('T2'), 'T3 (higher score) ranked first');
  });

  test('boosts fixes over features', () => {
    const tasks: Task[] = [
      { id: 'T1', status: 'pending', depends_on: [], priority_score: 10, work_type: 'feature' },
      { id: 'T2', status: 'pending', depends_on: [], priority_score: 10, work_type: 'fix' },
    ];
    const queue = buildPriorityQueue(tasks);
    assert.equal(queue[0].id, 'T2');
  });

  test('boosts bugs over features', () => {
    const tasks: Task[] = [
      { id: 'T1', status: 'pending', depends_on: [], priority_score: 10, work_type: 'feature' },
      { id: 'T2', status: 'pending', depends_on: [], priority_score: 10, work_type: 'bug' },
    ];
    const queue = buildPriorityQueue(tasks);
    assert.equal(queue[0].id, 'T2');
  });
});

describe('parseTasks', () => {
  const sampleState: StateFileForTasks[] = [
    {
      feature: 'auth',
      current_phase: 'implement',
      tasks: [
        { id: 'T1', title: 'Setup DB', status: 'done', depends_on: [], skill: '/dev' },
        { id: 'T2', title: 'Build API', status: 'pending', depends_on: ['T1'], skill: '/dev' },
        { id: 'T3', title: 'Design UI', status: 'pending', depends_on: [], skill: '/design' },
        { id: 'T4', title: 'Write tests', status: 'pending', depends_on: ['T2', 'T3'], skill: '/qa' },
      ],
    },
  ];

  test('groups tasks by feature', () => {
    const { byFeature } = parseTasks(sampleState);
    assert.ok(byFeature.has('auth'));
    assert.equal(byFeature.get('auth')!.length, 4);
  });

  test('groups tasks by skill', () => {
    const { bySkill } = parseTasks(sampleState);
    assert.ok(bySkill.has('/dev'));
    assert.equal(bySkill.get('/dev')!.length, 2);
    assert.ok(bySkill.has('/design'));
    assert.equal(bySkill.get('/design')!.length, 1);
    assert.ok(bySkill.has('/qa'));
    assert.equal(bySkill.get('/qa')!.length, 1);
  });

  test('computes effective status correctly', () => {
    const { byFeature } = parseTasks(sampleState);
    const tasks = byFeature.get('auth')!;
    const taskMap = new Map(tasks.map((t) => [t.id, t]));

    assert.equal(taskMap.get('T1')!.effectiveStatus, 'done');
    assert.equal(taskMap.get('T2')!.effectiveStatus, 'ready');
    assert.equal(taskMap.get('T3')!.effectiveStatus, 'ready');
    assert.equal(taskMap.get('T4')!.effectiveStatus, 'blocked');
  });

  test('builds a ready queue', () => {
    const { readyQueue } = parseTasks(sampleState);
    assert.ok(readyQueue.length > 0);
    for (const item of readyQueue) {
      assert.equal(item.effectiveStatus ?? 'ready', 'ready');
    }
  });

  test('computes critical paths per feature', () => {
    const { criticalPaths } = parseTasks(sampleState);
    assert.ok(criticalPaths.has('auth'));
    const path = criticalPaths.get('auth')!;
    assert.ok(path.length >= 2);
    assert.deepEqual(path, ['T1', 'T2', 'T4']);
  });

  test('skips state files with no tasks', () => {
    const result = parseTasks([{ feature: 'empty', current_phase: 'backlog', tasks: [] }]);
    assert.equal(result.byFeature.size, 0);
  });

  test('handles multiple features', () => {
    const multiState: StateFileForTasks[] = [
      ...sampleState,
      {
        feature: 'onboarding',
        current_phase: 'prd',
        tasks: [
          { id: 'O1', title: 'Research', status: 'done', depends_on: [], skill: '/dev' },
          { id: 'O2', title: 'Build flow', status: 'pending', depends_on: ['O1'], skill: '/dev' },
        ],
      },
    ];
    const { byFeature, bySkill } = parseTasks(multiState);
    assert.equal(byFeature.size, 2);
    assert.equal(bySkill.get('/dev')!.length, 4);
  });
});
