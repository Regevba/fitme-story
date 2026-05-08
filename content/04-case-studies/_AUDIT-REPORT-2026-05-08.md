# Showcase MDX Frontmatter Audit — 2026-05-08

**Closes:** [fitme-story-public-enhancements](https://github.com/Regevba/FitTracker2/issues/255) **T9** (audit ID **G5**)
**Contract audited against:** [`docs/case-studies/dual-outlet-pattern.md`](https://github.com/Regevba/FitTracker2/blob/main/docs/case-studies/dual-outlet-pattern.md) §3 (FT2)
**Reusable script:** [`scripts/audit-frontmatter.mjs`](../../scripts/audit-frontmatter.mjs)

---

## Summary

47 showcase MDX files audited. Audit-clean exit (no BARE_WITHOUT_REASON, no INVALID).

| Bucket | Pre-audit (2026-05-08) | Post-backfill (this PR) | Change |
|---|---|---|---|
| `COMPLIANT_FULL` | 17 | **22** | +5 |
| `COMPLIANT_PARTIAL` | 18 | 18 | (unchanged — pre-2026-04-28 entries lacking `kill_criteria` by convention-of-the-time) |
| `COMPLIANT_THIN` | 11 | **3** | -8 |
| `BARE_INTENTIONAL` | 0 | **3** | +3 (chrome_minimal opt-out on methodology docs) |
| `BARE_WITHOUT_REASON` | 0 | 0 | none — audit-clean |
| `NON_CASE_STUDY` | 1 | 1 | (README.mdx, tier=unassigned) |
| **Total** | **47** | **47** | |

## Backfills applied

### 5 newest entries — kill_criteria + 3 honest_disclosures each (real data from FT2 source case studies)

| Slot | Source | Backfilled |
|---|---|---|
| `23a-unified-control-center.mdx` | [`docs/case-studies/unified-control-center-case-study.md`](https://github.com/Regevba/FitTracker2/blob/main/docs/case-studies/unified-control-center-case-study.md) | 3 kill_criteria + 3 honest_disclosures |
| `23b-import-training-plan.mdx` | [`docs/case-studies/import-training-plan-case-study.md`](https://github.com/Regevba/FitTracker2/blob/main/docs/case-studies/import-training-plan-case-study.md) | 3 kill_criteria + 3 honest_disclosures |
| `23c-push-notifications-v2.mdx` | [`docs/case-studies/push-notifications-v2-case-study.md`](https://github.com/Regevba/FitTracker2/blob/main/docs/case-studies/push-notifications-v2-case-study.md) | 3 kill_criteria + 3 honest_disclosures |
| `25-framework-v7-8-1-branch-isolation.mdx` | [`docs/case-studies/framework-v7-8-branch-isolation-case-study.md`](https://github.com/Regevba/FitTracker2/blob/main/docs/case-studies/framework-v7-8-branch-isolation-case-study.md) | 4 kill_criteria + 3 honest_disclosures |
| `26-ucc-passkey-auth.mdx` | [`docs/case-studies/ucc-passkey-auth-case-study.md`](https://github.com/Regevba/FitTracker2/blob/main/docs/case-studies/ucc-passkey-auth-case-study.md) | 3 kill_criteria + 4 honest_disclosures |

This closes the **CS-008 P0** silent-pass regression — the 5 most recent ships all had FT2 source case studies with the data; the slot MDX just hadn't been backfilled.

### 3 methodology docs — `chrome_minimal: true` opt-out

| File | Reason |
|---|---|
| `meta-analysis.mdx` | Counterfactual ROI analysis, not a feature shipment. No kill_criteria or honest_disclosures applicable; the doc itself IS the analysis. |
| `meta-analysis-validation.mdx` | Validation pass against an external audit. |
| `normalization-model.mdx` | Normalization model spec. |

The `chrome_minimal: true` + `chrome_minimal_reason` pattern (introduced in T5 P-CHROME-BACKFILL, 2026-05-08) explicitly distinguishes "intentionally bare" from "forgot to populate." All 3 methodology docs now carry the explicit signal.

## Remaining COMPLIANT_PARTIAL (18 entries, intentional)

Slots 01–14 + 18, 19, 20 are older case studies (pre-2026-04-28) where `kill_criteria` was not yet a frontmatter convention. The Alternative A locked design that introduced the field shipped in PR #146 (2026-04-28); entries before that date predate the convention.

These are correctly classified as `COMPLIANT_PARTIAL` (have `honest_disclosures` + `timeline_position`, missing `kill_criteria`). They are NOT regressions — they are convention-eligible-only-going-forward.

Adding fabricated kill_criteria to these would violate the [verbatim-then-remediate rule](https://github.com/Regevba/FitTracker2/blob/main/README.md). Their FT2 source case studies (where present) also predate the convention, so there's no source data to backfill from.

**Disposition:** leave as-is. No backfill required.

## Remaining COMPLIANT_THIN (3 entries, intentional)

Slots `15-ssr-regression`, `16-dispatchreplay`, `17-lego-pmflow` are dev-deep-dives. Per the catalog page convention they live in `DEVELOPER_SLUGS` (rendered as a separate section, not in the chronological era timeline). They lack `timeline_position` because they are not framework features — they are technical detail entries.

**Disposition:** leave as-is. The COMPLIANT_THIN classification correctly captures their nature; flipping to `chrome_minimal: true` would mis-signal them as "bare-intentional" when their actual nature is "dev-detail-narrative." The taxonomy may need a `dev_deep_dive: true` opt-out signal in a future iteration.

## Audit script — reusable

[`scripts/audit-frontmatter.mjs`](../../scripts/audit-frontmatter.mjs) is a Node script that reproduces the bucket counts above. Two output modes:

```bash
node scripts/audit-frontmatter.mjs           # human-readable
node scripts/audit-frontmatter.mjs --json    # machine-readable
```

**Exit codes:**
- `0` — All entries are compliant or have explicit `chrome_minimal` opt-out
- `1` — At least one entry is `BARE_WITHOUT_REASON` (needs backfill or opt-out) OR `INVALID` (missing required fields)

Use `npm run audit-frontmatter` (a `package.json` script could be added in a follow-up to wire this into CI; today it's manually invocable).

## What this PR does NOT do

- **Does NOT backfill `kill_criteria` to pre-2026-04-28 entries.** Their FT2 source case studies predate the convention; fabricating data would violate the verbatim rule.
- **Does NOT add `chrome_minimal: true` to dev-deep-dives.** Their COMPLIANT_THIN status is accurate; a future `dev_deep_dive: true` signal would be more honest than reusing `chrome_minimal`.
- **Does NOT enforce the audit script in CI.** Today it's manually-runnable. A follow-up could add a GitHub Action that runs it on PR open and fails on `BARE_WITHOUT_REASON`.
- **Does NOT promote the new T15 callout components into existing case-study MDX bodies.** That adoption pass is a separate task — best done case-by-case as new entries ship rather than retroactively rewriting prose.

## Cross-references

- **Dual-outlet pattern contract** (T8/G3 ship): [`docs/case-studies/dual-outlet-pattern.md`](https://github.com/Regevba/FitTracker2/blob/main/docs/case-studies/dual-outlet-pattern.md) — §3 frontmatter contract, §7 audit checklist
- **Audit synthesis** that surfaced G5: [`docs/research/2026-05-08-fitme-story-audit-synthesis.md`](https://github.com/Regevba/FitTracker2/blob/main/docs/research/2026-05-08-fitme-story-audit-synthesis.md)
- **chrome_minimal schema** (T5 ship): `src/lib/content-schema.ts` (in this repo)
- **FT2 source case studies:** `docs/case-studies/{slug}-case-study.md` (per slot)
- **Rollup feature state.json:** [`.claude/features/fitme-story-public-enhancements/state.json`](https://github.com/Regevba/FitTracker2/blob/main/.claude/features/fitme-story-public-enhancements/state.json)
