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

## Reverse-sync flow (v7.8.3 Phase 3 D-1)

When a fitme-story-native feature's state.json is committed to fitme-story `main` (with `state_owner: "fitme-story"`), the GitHub Action at [`.github/workflows/reverse-sync-fitme-story-to-ft2.yml`](../.github/workflows/reverse-sync-fitme-story-to-ft2.yml) automatically opens a PR against the FT2 repo mirroring the state.json into `FT2/.claude/features/<name>/state.json` with a `state_owner_sync_origin: "fitme-story-reverse"` marker.

The marker exempts the file from FT2's morphed C-5 (`STATE_OWNER_LOCATION_MISMATCH`) gate — without it, FT2 would reject any state.json with `state_owner: "fitme-story"` committed at an FT2 path (per spec §4.4).

### Operator setup (one-time)

Provision a fine-grained Personal Access Token:

1. Go to <https://github.com/settings/tokens?type=beta>
2. **Repository access:** Only `Regevba/FitTracker2` (NOT all repos)
3. **Permissions:** `Contents: write` + `Pull requests: write`
4. **Expiration:** 90 days (set calendar reminder for rotation)

Add as repo secret in fitme-story:

```bash
gh secret set FT2_REPO_TOKEN --repo Regevba/fitme-story
# Paste PAT when prompted

# Verify:
gh secret list --repo Regevba/fitme-story | grep FT2_REPO_TOKEN
```

Until the secret is provisioned, the workflow skips silently (the `if: secrets.FT2_REPO_TOKEN != ''` guard).

### Manual merge required

PRs opened by this workflow do NOT auto-merge — operator review + manual merge required per `feedback_no_auto_merge_without_approval.md`. The PR runs through the full FT2 gate stack (Mechanism A telemetry, integrity gates, morphed C-5 with sync_origin exemption) before being mergeable.

### Local testing

```bash
./scripts/test-reverse-sync-action.sh
```

Validates workflow YAML syntax + dry-runs the workflow against a synthetic push event without actually opening a real PR. Requires:

- `actionlint` (recommended): `brew install actionlint`
- `act` (recommended): `brew install act`

Each is optional — the script gracefully skips missing tools.

### Cross-references

- FT2 spec §4.2 (sync mechanism) + §4.4 (sync_origin marker) — `Regevba/FitTracker2/docs/superpowers/specs/2026-05-11-cross-repo-state-sync-impl-design.md`
- FT2 plan Task 3.1-3.5 — `Regevba/FitTracker2/docs/superpowers/plans/2026-05-11-cross-repo-state-sync-impl.md`
- FT2 morphed C-5 gate — `Regevba/FitTracker2/scripts/check-state-schema.py` (`check_state_owner_location_match`)
