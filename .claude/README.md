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

## Cross-repo state.json policy (2026-05-09 Phase C decision)

**FitTracker2 is the canonical source of truth for ALL feature state.**
fitme-story is a read-only consumer.

- **Cross-repo features** (rollups touching both repos, e.g.
  `fitme-story-public-enhancements`) — state.json lives in **FitTracker2**
  at `FitTracker2/.claude/features/<name>/state.json`. fitme-story reads
  via `scripts/sync-from-fittracker2.ts` for control-room display.
- **fitme-story-only features** — state.json STILL lives in FitTracker2.
  This `.claude/features/` directory exists for transient local use only;
  the canonical record is always in FT2. Rationale: single canonical
  writer eliminates merge conflicts and avoids inverting the gate model.
  See [`docs/superpowers/specs/2026-05-09-cross-repo-state-sync.md`](https://github.com/Regevba/FitTracker2/blob/main/docs/superpowers/specs/2026-05-09-cross-repo-state-sync.md)
  in FT2 for the full contract + Phase D candidates that may evolve this.

The one exception: `gate-coverage.jsonl` (Mechanism A telemetry) accumulates
**independently** in each repo because gate fires happen wherever the gate
runs. The control-room reads both files at build time (Phase C-4 — deferred).

## Hooks

`make install-hooks` registers `.githooks/pre-commit` which fires:
- `scripts/check-state-schema.py` (state.json gates)
- `scripts/check-case-study-preflight.py` (case-study gates)

## CI

`.github/workflows/integrity.yml` runs the same gates on every PR + main push.
