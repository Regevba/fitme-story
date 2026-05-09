# `.claude/` — fitme-story framework artifacts

Bootstrapped 2026-05-09 per the FT2 → fitme-story cross-repo framework port (closes v7.8.2 asymmetry).

## Layout

```
.claude/
  features/   — state.json files for fitme-story-native features
                (cross-repo features still canonicalize at FT2;
                 fitme-story-only features live here).
  logs/       — Tier 2.2 contemporaneous feature logs:
                  <feature>.log.json   per-feature event stream
                  gate-coverage.jsonl  Mechanism A telemetry
                  _session-*.events.jsonl  Mechanism C session attribution
  shared/     — schema-level configs:
                  branch-isolation-exempt.json  Mode-B path allowlist
                  path-reducers.json            Mechanism E reducer registry
```

## Cross-repo state.json policy

- **Cross-repo features** (rollups touching both repos, e.g.
  `fitme-story-public-enhancements`) — state.json lives in **FitTracker2**
  at `FitTracker2/.claude/features/<name>/state.json`. fitme-story reads
  via `scripts/sync-from-fittracker2.ts` for control-room display.
- **fitme-story-only features** — state.json lives **here** at
  `.claude/features/<name>/state.json`. Phase C of the 2026-05-09 directive
  may evolve this to bidirectional sync.

## Hooks

`make install-hooks` registers `.githooks/pre-commit` which fires:
- `scripts/check-state-schema.py` (state.json gates)
- `scripts/check-case-study-preflight.py` (case-study gates)

## CI

`.github/workflows/integrity.yml` runs the same gates on every PR + main push.
