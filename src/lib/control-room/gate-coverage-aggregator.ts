// v7.8.3 Phase 1 C-4: cross-repo gate-coverage aggregator
//
// Reads FT2's gate-coverage.jsonl (synced to src/data/integrity/gate-coverage-ft2.jsonl
// via scripts/sync-from-fittracker2.ts Phase 1 extension) AND fitme-story's local
// .claude/logs/gate-coverage.jsonl.
//
// Combines + tags + sorts by timestamp. Used by /control-room/framework page
// to render aggregated counts + per-source filter chips.
//
// Per spec §4.3: aggregator is a build-time computation. Runs once per Vercel
// deploy + hourly cron refresh.

export type GateOutcome = 'PASS' | 'FAIL' | 'WARN' | 'SKIP';

// FT2's gate_coverage.py emits `timestamp`; legacy fixtures used `ts`.
// We normalize at parse time so callers see a single field.
export interface GateEvent {
  gate: string;
  outcome?: GateOutcome | string;
  timestamp: string;
  source_repo?: 'ft2' | 'fitme-story';
  [key: string]: unknown;
}

interface RawGateEvent {
  gate: string;
  outcome?: GateOutcome | string;
  timestamp?: string;
  ts?: string;
  [key: string]: unknown;
}

function parseLines(content: string, source: 'ft2' | 'fitme-story'): GateEvent[] {
  return content
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const raw = JSON.parse(line) as RawGateEvent;
      const event: GateEvent = {
        ...raw,
        gate: raw.gate,
        timestamp: raw.timestamp ?? raw.ts ?? '',
        source_repo: source,
      };
      return event;
    });
}

export function aggregateGateCoverage(ft2Content: string, fsContent: string): GateEvent[] {
  const all = [...parseLines(ft2Content, 'ft2'), ...parseLines(fsContent, 'fitme-story')];
  all.sort((a, b) => (a.timestamp ?? '').localeCompare(b.timestamp ?? ''));
  return all;
}

export function countEventsBySource(
  ft2Content: string,
  fsContent: string,
): Record<string, number> {
  const ft2Count = ft2Content.split('\n').filter((l) => l.trim().length > 0).length;
  const fsCount = fsContent.split('\n').filter((l) => l.trim().length > 0).length;
  return { ft2: ft2Count, 'fitme-story': fsCount };
}
