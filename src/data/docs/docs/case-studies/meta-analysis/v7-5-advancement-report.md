# v7.5 Data Integrity Framework — Advancement Report

> **Generated:** 2026-07-11T05:08:56Z
> **Window:** 2026-04-21 → 2026-04-24
> **Canonical narrative:** [docs/case-studies/data-integrity-framework-v7.5-case-study.md](/docs/case-studies/data-integrity-framework-v7.5-case-study.md)

Consolidated before/after advancement data across the Gemini audit remediation (2026-04-21 → 2026-04-24). Every number is tagged with its T1/T2/T3 data-quality tier. This file is derived from framework-manifest.json, measurement-adoption.json, documentation-debt.json, change-log.json, .claude/logs/, and `git log`.

## Before / after

| Metric | Before (v7.1, 2026-04-21) | After (v7.5, 2026-04-24) | Tier |
|---|---|---|---|
| Framework version | 7.1 | 7.9 | T2 (Declared) |
| Auditor Agent check codes | 8 | 12 | T1 (Instrumented) |
| Active feature logs | 0 | 99 | T1 (Instrumented) |
| Runtime smoke profiles | 0 | 5 | T2 (Declared) |
| Pre-commit hook installed | False | True | T1 (Instrumented) |
| cache_hits populated | 0/40 | 34/131 | T1 (Instrumented) |
| Data-quality tiers convention | False | True | T2 (Declared) |
| measurement-adoption ledger | False | True | T1 (Instrumented) |
| documentation-debt ledger | False | True | T1 (Instrumented) |
| Open Gemini tier items | 9 | {"fully_or_effectively_shipped":7, "partial_or_pilot":2, "external_blocked":1, "tier":"T2 (Declared)"} | T2 (Declared) |

## Tier-by-tier status (from framework-manifest)

| Tier | Label | Status |
|---|---|---|
| 1.1 | Automated time/event metrics | partial_measured |
| 1.2 | Integrate with sources of truth (GitHub API) | shipped |
| 1.3 | Enforce state.json schema on write | shipped |
| 2.1 | Gated phase transitions w/ runtime smoke tests | groundwork_shipped |
| 2.2 | Contemporaneous logging | pilot_active |
| 2.3 | Data quality tiers T1/T2/T3 | shipped |
| 3.1 | Independent Auditor Agent | shipped_hardened |
| 3.2 | Documentation debt dashboard | baseline_shipped |
| 3.3 | External replication | backlog_external_blocked |

## Effort data

- Data quality: T3 (Narrative)
- Window: 2026-04-21 → 2026-04-24
- Commits in window: 777
- Canonical commits identified: 20

**Known gap:** Tier 2.2 contemporaneous logger shipped 2026-04-21 but was not dogfooded on the remediation work itself. Per-tier wall-time, session count, and token cost are NOT available. Option 2 (retroactive backfill via append-feature-log.py --retroactive) is planned for the meta-analysis-audit log.

## Canonical commits (ordered by author date)

| SHA | Date | Subject | Canonical role |
|---|---|---|---|
| `ee1c15b` | 2026-04-21 | ui-audit: migrate WelcomeView raw animations to semantic tokens (P0=3 → 0) | - |
| `14f7c10` | 2026-04-21 | ui-audit: migrate OnboardingFirstActionView raw animation to semantic token (P0= | - |
| `d70c00b` | 2026-04-21 | ui-audit: migrate ReadinessCard raw animation to semantic token (P0=1 → 0) | - |
| `ab651ca` | 2026-04-21 | ui-audit: migrate TrainingPlanView raw animation to semantic token (P0=1 → 0) | - |
| `499050f` | 2026-04-21 | ui-audit: baseline P0 → 0 after Phase 2 animation cluster closed | - |
| `cf8e09c` | 2026-04-21 | ui-audit: promote to hard gate in verify-local | - |
| `076d3bd` | 2026-04-21 | ui-audit: tighten DS-RAW-ANIMATION to catch bare forms + close 2 new findings | - |
| `7bbf076` | 2026-04-21 | ui-audit: add ui-audit-drift check to verify-local | - |
| `fa1aab4` | 2026-04-21 | chore: remove two orphan PBXBuildFile entries for historical v1 views | - |
| `caa2338` | 2026-04-21 | feat(framework): promote HADF v6.1 -> v7.0 and Integrity Cycle v6.2 -> v7.1 | - |
| `3a5bbcf` | 2026-04-21 | docs: publish UI-audit baseline burndown case study (Phase 5.1) | - |
| `36c1329` | 2026-04-21 | docs(meta-analysis): add structural meta-analysis + Gemini 2.5 Pro independent a | structural meta-analysis + Gemini audit archive |
| `4269fbf` | 2026-04-21 | feat(integrity): Auditor Agent + corrections to the day's meta-analysis | Tier 3.1 Auditor Agent + same-day corrections |
| `c6312b1` | 2026-04-21 | feat(integrity): Tier 1.3 — pre-commit state.json schema enforcement | Tier 1.3 pre-commit schema enforcement |
| `1580760` | 2026-04-21 | docs(meta-analysis): Tier 2.3 — data quality tiers convention | Tier 2.3 data quality tiers convention |
| `d99f6b9` | 2026-04-21 | feat(integrity): Tier 1.2 subset — PR_NUMBER_UNRESOLVED check | Tier 1.2 PR_NUMBER_UNRESOLVED check |
| `066ad18` | 2026-04-21 | docs(audit): add runtime smoke, logging, and docs debt baseline | initial runtime-smoke + logging + docs-debt baseline |
| `1405f89` | 2026-04-22 | chore: checkpoint workspace changes | - |
| `2415475` | 2026-04-23 | chore(audit): harden gemini follow-up status and gates | 2026-04-23 hardening (workflow exit-code, snapshot metadata) |
| `d986d74` | 2026-04-23 | docs(handoff): record staging auth checkpoint | staging-auth checkpoint handoff |
| `e74604e` | 2026-04-24 | feat(auth): Tier 2.1 harness closure — staging sign-in surface smoke green | Tier 2.1 harness closure (sign-in-surface green) |
| `4ff953e` | 2026-04-24 | chore(logs): Tier 2.2 log entries for Tier 2.1 harness closure session | Tier 2.2 log entries seeded |
| `0a38af7` | 2026-04-24 | docs: wire Gemini-audit Tier groundwork into CLAUDE.md + index READMEs | doc discoverability wiring |
| `e892ce3` | 2026-04-24 | Merge chore/pbxproj-orphan-cleanup: remove 2 orphan PBXBuildFile entries | merge pbxproj-orphan-cleanup |
| `223a1b4` | 2026-04-24 | feat(integrity): Tier 1.2 full PR-on-write + Tier 1.1 adoption inventory + Tier  | Tier 1.2 full + Tier 1.1 inventory + Tier 2.2 scaffolds |
| `28cbd44` | 2026-04-24 | chore(shared): commit first measurement-adoption baseline | measurement-adoption baseline ledger |
| `c174c01` | 2026-04-24 | docs(audit): reflect 2026-04-24 Tier advancement across remediation surfaces | status doc sync across trust/mirror/memory |
| `bea6c59` | 2026-04-24 | feat(framework): v7.1 -> v7.5 — Data Integrity Framework | v7.1 → v7.5 framework version bump |
| `c4b7893` | 2026-04-24 | Merge PR #139 (claude/review-ui-consistency-zSkvJ): UI-audit P0 27→0 burndown | merge PR #139 UI-audit burndown (P0 27→0) |
| `c7191fc` | 2026-04-24 | feat(tier1.1): close cache_hits writer-path gap — issue #140 | Tier 1.1 cache_hits writer path (issue #140) |
| `b491e53` | 2026-04-24 | feat(framework): post-v7.5 hardening — auto-emission, regression test, tier-tag  | post-v7.5 hardening (auto-emit, regression test, tier-tag, framework-status) |
| `9227085` | 2026-04-24 | fix(makefile): auto-resolve test simulator instead of hardcoded UUID | Makefile auto-resolve simulator |
| `c4fd6bc` | 2026-04-24 | feat(meta-analysis): v7.5 advancement report + retroactive log backfill | - |
| `0a23922` | 2026-04-25 | feat(v7.6 phase 1): close 4 Class B → A gaps via write-time pre-commit hooks | - |
| `c0be8ea` | 2026-04-25 | feat(framework): v7.6 Phase 2 — recurring enforcement (PR bot, weekly cron, hist | - |
| `ecb172d` | 2026-04-25 | docs(framework): v7.6 Phase 3 — explicit Class B inventory + CLAUDE.md update | - |
| `58b82b5` | 2026-04-25 | feat(framework): v7.5 -> v7.6 — Mechanical Enforcement (Phase 4 — bump + case st | - |
| `805daab` | 2026-04-25 | docs(dev-guide): add DEV-only framework guide v1.0 → v7.6 (745 lines, 16 section | - |
| `9bc6763` | 2026-04-25 | docs(framework): add v7.6 pending fixes handoff | - |
| `761dc97` | 2026-04-25 | chore(framework): reconcile v7.6 feature state | - |
| `9d3c64f` | 2026-04-25 | chore(framework): register v7.6 shared tracking | - |
| `765f0f7` | 2026-04-25 | ci(framework): fail PR integrity on required check errors | - |
| `2e15af4` | 2026-04-25 | docs(framework): align v7.6 guarantees with implementation | - |
| `682d88b` | 2026-04-25 | test(framework): clarify v7.5 v7.6 regression suite | - |
| `95809a0` | 2026-04-25 | docs(framework): update v7.6 pending fixes handoff | - |
| `5b0670a` | 2026-04-25 | docs(framework): add v7.6 unified completion plan (cross-walk of original plan + | - |
| `4af9334` | 2026-04-25 | ci: re-trigger PR #141 workflows after Actions billing resolution | - |
| `6b1ab6c` | 2026-04-25 | Merge pull request #141 from Regevba/framework-v7.6-pending-fixes | - |
| `a466de0` | 2026-04-25 | docs(framework): wire issue #142 link into v7.6 case study + unclosable-gaps Gap | - |
| `8193330` | 2026-04-25 | docs: sync 7 README index files to v7.6 status (Mechanical Enforcement, shipped  | - |
| `1492ec0` | 2026-04-26 | docs(prd+master-plan): close PM-artifact gaps per 2026-04-26 audit | - |
| `2c542d2` | 2026-04-26 | chore(shared): sync control-room state to v7.6 reality (Linear + Notion + change | - |
| `19b0411` | 2026-04-26 | feat(unified-control-center): bootstrap feature per v7.6 + ship T1 (TTC baseline | - |
| `fb7c82e` | 2026-04-26 | chore(unified-control-center): mark T3/T4/T8/T9/T10/T13 done in state.json | - |
| `02e4170` | 2026-04-27 | chore(unified-control-center): mark T5/T7/T11/T12 done in state.json | - |
| `749bedc` | 2026-04-27 | feat(unified-control-center): T15 token map (Astro dashboard → fitme-story) | - |
| `6f1ed38` | 2026-04-27 | chore(unified-control-center): mark T15 done in state.json | - |
| `cd69870` | 2026-04-27 | docs(unified-control-center): T16 contrast audit report | - |
| `5ce66a0` | 2026-04-27 | docs(unified-control-center): T17 token map + contrast audit updates | - |
| `3616a35` | 2026-04-27 | chore(unified-control-center): mark T16/T17 done in state.json | - |
| `4e81f30` | 2026-04-27 | chore(unified-control-center): mark T14 done in state.json | - |
| `6020be0` | 2026-04-27 | chore(unified-control-center): mark T6 done in state.json | - |
| `a8e3f2f` | 2026-04-27 | ui-audit-baseline-burndown: retroactive state close (implement → complete) | - |
| `d56a86a` | 2026-04-27 | docs(ui-audit): update case study header to reflect 2026-04-24 merge | - |
| `5f1775f` | 2026-04-27 | docs(unified-control-center): framework-health dashboard enhancement design (T43 | - |
| `ec6019e` | 2026-04-27 | feat(auth-polish-v2): bootstrap feature per v7.6 + ship Phase 0 research + Phase | - |
| `7fe7692` | 2026-04-27 | chore(framework-status): weekly snapshot 2026-04-27 | - |
| `a0deb3a` | 2026-04-27 | chore(measurement): backfill timing_wall_time for 3 post-v6 features | - |
| `1057144` | 2026-04-27 | docs(framework-v7-7): brainstorming spec for Validity Closure | - |
| `360e9dd` | 2026-04-27 | docs(framework-v7-7): implementation plan (42 tasks, 8 PRs, 6 milestones) | - |
| `f867525` | 2026-04-27 | feat(framework-v7-7): bootstrap feature state + live case-study journal (T0a) | - |
| `971a5e9` | 2026-04-27 | chore(unified-control-center): migrate T43-T54 into framework-v7-7 M4 (T0b) | - |
| `c4e2c3a` | 2026-04-27 | chore(framework): pause 6 features for v7.7 priority freeze (T0c) | - |
| `b7a98e1` | 2026-04-27 | docs(framework-v7-7): CLAUDE.md banner stub for v7.7 in-progress (T0d) | - |
| `9ceed6c` | 2026-04-27 | docs(master-plan): add v7.7 Validity Closure as active top priority (T0e) | - |
| `6ede57f` | 2026-04-27 | docs(framework-v7-7): journal — M0 kickoff propagation complete | - |
| `95ac393` | 2026-04-27 | docs(framework-v7-7): cache read-paths inventory (T1) | - |
| `a6f3943` | 2026-04-27 | feat(framework-v7-7): log-cache-hit.py auto-discovery wrapper (T2 / PR-1) | - |
| `448d989` | 2026-04-27 | feat(framework-v7-7): CACHE_HITS_EMPTY_POST_V6 pre-commit hook (T3 / PR-1) | - |
| `6c1c23d` | 2026-04-27 | feat(framework-v7-7): wire log-cache-hit.py into Cache Tracking Protocol (T4 / P | - |
| `47ab4bf` | 2026-04-27 | docs(framework-v7-7): journal — PR-1 cache_hits writer-path opened (#144) | - |
| `e5e2dd7` | 2026-04-27 | feat(framework-v7-7): validate-cu-v2.py schema validator (T6 / PR-2) | - |
| `f305656` | 2026-04-27 | feat(framework-v7-7): wire CU_V2_INVALID into pre-commit + cycle (T7 / PR-2) | - |
| `c1a707a` | 2026-04-27 | docs(framework-v7-7): integrity codes 12→13 with CU_V2_INVALID (T8 / PR-2) | - |
| `444e276` | 2026-04-27 | docs(framework-v7-7): journal — PR-2 cu_v2 schema validator merged into train | - |
| `5e6698d` | 2026-04-27 | chore(app-store-assets): mark exempt from case-study requirement (T9 / PR-3) | - |
| `9d22c66` | 2026-04-27 | chore(onboarding-v2-retroactive): stub case study + state link (T10 / PR-3) | - |
| `82c17d5` | 2026-04-27 | feat(framework-v7-7): STATE_NO_CASE_STUDY_LINK hook (T11 / PR-3) | - |
| `8a99822` | 2026-04-27 | feat(framework-v7-7): CASE_STUDY_MISSING_FIELDS hook (T12 / PR-4) | - |
| `10cf51c` | 2026-04-27 | feat(framework-v7-7): doc-debt backfill script (T13 / PR-4) | - |
| `7a828c5` | 2026-04-27 | docs(framework-v7-7): bulk backfill case-study frontmatter fields (T14 / PR-4) | - |
| `0f4dde3` | 2026-04-27 | chore(framework-v7-7): backfill timing.phases for 3 paused features (T15 / PR-5) | - |
| `b60b9fe` | 2026-04-27 | docs(framework-v7-7): v7.6 hook coverage note for timing backfill (T16 / PR-5) | - |
| `3be6a2c` | 2026-04-27 | docs(framework-v7-7): journal — M2 complete (linkage + doc-debt + active backfil | - |
| `2a03d66` | 2026-04-27 | feat(framework-v7-7): tier-tag heuristic checker (T17 / PR-6) | - |
| `31e890e` | 2026-04-27 | feat(framework-v7-7): wire TIER_TAG_LIKELY_INCORRECT as advisory (T18 / PR-6) | - |
| `3851128` | 2026-04-27 | docs(framework-v7-7): tier-tag checker FP-rate baseline (T19 / PR-6) | - |
| `200adf5` | 2026-04-27 | docs(framework-v7-7): journal — M3 tier-tag heuristic shipped advisory (kill cri | - |
| `78c84fc` | 2026-04-27 | docs(framework-v7-7): T31+T32+T33 — Section 99 synthesis + CLAUDE.md + master pl | - |
| `85c8ef4` | 2026-04-27 | docs(framework-v7-7): journal — M5 complete, v7.7 READY FOR MERGE | - |
| `97b7e04` | 2026-04-27 | Merge remote-tracking branch 'origin/main' into feature/framework-v7-7-validity- | - |
| `01b9e11` | 2026-04-27 | Merge pull request #144 from Regevba/feature/framework-v7-7-validity-closure | - |
| `b21ccc4` | 2026-04-28 | docs(framework-v7-7): post-merge documentation sweep | - |
| `e2067a0` | 2026-04-28 | docs(framework-v7-7): fix THIS FILE comment to reference v7.7 path | - |
| `fc12a82` | 2026-04-28 | docs(framework-v7-7): journal — post-merge house-cleaning milestone (2026-04-28) | - |
| `8c81135` | 2026-04-28 | docs(backlog): add case-study presentation/readability refinement task | - |
| `a25998e` | 2026-04-28 | chore(integrity): cycle snapshot 2026-04-28T06-32-43Z | - |
| `f58ee01` | 2026-04-28 | docs(case-study): visual-aid catalog + Alt-A/B templates + state.json (locked 20 | - |
| `ae2073b` | 2026-04-28 | docs(case-study-presentation): completion case study + state.json closeout | - |
| `dcd91c5` | 2026-04-29 | docs(figma-sync): record Smart Reminders page (907:2) — six notification states  | - |
| `c7d0dca` | 2026-04-29 | chore(portfolio): add MIT LICENSE and dedupe .gitignore | - |
| `99d3b84` | 2026-04-29 | chore(deps): bump postcss from 8.5.8 to 8.5.12 in /website (#147) | - |
| `9fa8fc8` | 2026-04-29 | chore(deps-dev): bump lodash from 4.17.21 to 4.18.1 (#148) | - |
| `2823a84` | 2026-04-29 | chore(deps): bump astro from 6.1.3 to 6.1.10 in /website (#150) | - |
| `c57e521` | 2026-04-29 | chore(deps): bump vite from 7.3.1 to 7.3.2 in /website (#149) | - |
| `479ff6d` | 2026-04-29 | chore(deps): bump vite from 7.3.1 to 7.3.2 in /dashboard (#152) | - |
| `091ddda` | 2026-04-29 | chore(deps): bump astro from 6.1.3 to 6.1.10 in /dashboard (#153) | - |
| `a7d30e7` | 2026-04-29 | chore(readme): trim from 359 → ~135 lines, fix outdated MIT License footer (#154 | - |
| `4ba5c55` | 2026-04-29 | chore(deps): force path-to-regexp >=6.3.0 to close 2 HIGH CVEs (#155) | - |
| `f25bada` | 2026-04-29 | chore(deps): bump dashboard astro/postcss constraints to patched versions (#156) | - |
| `9c7b5c9` | 2026-04-29 | docs(media): add hero GIF recording guide + docs/media/ directory (#157) | - |
| `79e461c` | 2026-04-29 | chore(repo): move stray project_*.md entrypoint files to .claude/entrypoints/ (# | - |
| `252268d` | 2026-04-30 | test(ui): quarantine HomeReadinessUITests on hosted CI (#160) | - |
| `81f2a98` | 2026-04-30 | fix(dashboard): unbreak after v7.7 — state.json feature_name vs feature schema d | - |
| `9a59cc9` | 2026-04-30 | feat(smart-reminders): wire all 6 lifecycle analytics events + housekeeping (v7. | - |
| `9b05ebf` | 2026-04-30 | feat(stats-v2): finish v2 alignment pass — analytics wiring + a11y + type extrac | - |
| `b3c1204` | 2026-04-30 | chore(smart-reminders): repoint case_study_showcase to slot 23 (#161) | - |
| `371fe7a` | 2026-04-30 | docs(smart-reminders): record E-1 readiness-aware training alert as Enhancement  | - |
| `ab98d8a` | 2026-04-30 | chore(backlog): add task — CI parallel-clone simulator hang root cause investiga | - |
| `d66d2f1` | 2026-04-30 | docs(stats-v2): dedicated case study + repoint state.json from roundup (#167) | - |
| `b9ec3fd` | 2026-04-30 | fix(ci): quarantine UI tests use NSUserName() instead of broken GITHUB_ACTIONS e | - |
| `287d062` | 2026-05-01 | chore(repo): hygiene — .gitignore + research notes + v7.8 branch-isolation surve | - |
| `4f6c4cc` | 2026-05-01 | feat(auth-polish-v2): forgot-password recovery + biometric refinement + Google S | - |
| `95e13b2` | 2026-05-01 | chore(framework): close v7.7 silent-pass surface + 3 near-miss disclosures (#169 | - |
| `0f3761f` | 2026-05-02 | feat(framework-v7.8): PR-1 — Mechanism C scaffolding + gate predicate fix (#173) | - |
| `072a4de` | 2026-05-02 | feat(hadf): chip-profiles v1.1 schema + Tier-1 expansion (Slices A + B) (#171) | - |
| `f99132a` | 2026-05-02 | docs(hadf-phase2): publish case study + Tracks 3/4 research notes; gitignore inc | - |
| `f547721` | 2026-05-02 | docs(framework): v7.8 + v7.9 bridge design spec + 2 research notes (#172) | - |
| `a0057d3` | 2026-05-02 | chore(framework): reconcile 3 state.json files to current_phase=complete (#174) | - |
| `2acfdf5` | 2026-05-02 | chore(repo): untrack .claude/settings.local.json (#175) | - |
| `19ce6cf` | 2026-05-03 | docs(backlog): sync In Progress → Done for 7 shipped items + correct stale pause | - |
| `ad9d252` | 2026-05-03 | docs(framework+setup): manifest 7.6→7.7 + recover ssd/sentry setup-guide updates | - |
| `a7c1090` | 2026-05-03 | docs(manifest): add 7 capability flags for v7.7 + v7.8 PR-1 (#178) | - |
| `3df8f27` | 2026-05-03 | docs(orchid): v1.5 design spec addendum (Option B per v2 mapping research §10) ( | - |
| `9c17b7e` | 2026-05-03 | docs(orchid): v1.5 implementation plan — Tracks L (Layer A) + D (DSE) + R (RTL P | - |
| `e4c921e` | 2026-05-03 | feat(orchid-v1.5): Track L — Layer A behavioral models for U8 + U9 + tier propag | - |
| `318df3d` | 2026-05-03 | feat(orchid-v1.5): Track D D1+D2 — tier-aware DSE end-to-end (#183) | - |
| `da50ca1` | 2026-05-03 | docs(orchid-v1.5): toolchain setup guide + companion case study scaffold (#184) | - |
| `d32a9af` | 2026-05-03 | chore(framework): backfill framework_version on 5 post-v6 features + ui-audit da | - |
| `596a74a` | 2026-05-03 | chore(framework): backfill framework_version on 34 pre-v6 features (#186) | - |
| `1881f9d` | 2026-05-03 | feat(framework-v7.8): PR-3 — Mechanism C wiring (T9 + T10 + T11 advisory) (#188) | - |
| `107e457` | 2026-05-03 | feat(framework-v7.8): PR-4 — Mechanism E git merge driver for ledgers (#189) | - |
| `516eef0` | 2026-05-04 | feat(smart-reminders): behavioral learning PR 1 — iOS data layer + toggle-off (b | - |
| `e3db7f0` | 2026-05-04 | feat(framework-v7.8): PR-5 — Schema bridge fields (T15 + T16 + T17) (#192) | - |
| `27ae077` | 2026-05-04 | docs(framework-v7.8): update CLAUDE.md + add v7.8 bridge case study (#191) | - |
| `b3237fd` | 2026-05-04 | docs(framework-v7.8): PR-7 — cold-start entrypoint + honesty ledger entry FT2-FH | - |
| `46f9f15` | 2026-05-04 | fix(ci): disable parallel UI testing to eliminate sim-clone flake (#195) | - |
| `32e44cd` | 2026-05-04 | feat(framework-v7.8): PR-2 — Mechanism A coverage-asserting gates (#187) | - |
| `da3c000` | 2026-05-04 | feat(framework-v7.8): PR-6 — Mechanism F membrane-status + Mechanism D self-test | - |
| `e040a1e` | 2026-05-04 | docs(framework-v7.8): final doc sweep — bump CLAUDE.md header + backlog entry (# | - |
| `38c5e32` | 2026-05-04 | feat(framework-v7.9): measurement-window snapshot tool (#197) | - |
| `04eeac6` | 2026-05-04 | feat(smart-reminders): backend half — AI engine endpoints + retention migration  | - |
| `3e1f81c` | 2026-05-04 | docs(smart-reminders-behavioral-learning): PR-2 implementation plan (#199) | - |
| `21be564` | 2026-05-04 | docs: comprehensive review — v7.8 sync + PRD parent-child wiring (smart-reminder | - |
| `75decc1` | 2026-05-04 | chore(framework): close all remaining audit gaps — cron persistence + tier-tag a | - |
| `775c1e5` | 2026-05-04 | chore(doc-debt): 100% coverage — slot-fix, work_type backfill, showcase wiring,  | - |
| `8e70832` | 2026-05-05 | chore(gitignore): untrack scheduled_tasks.lock + add lock-file patterns (#204) | - |
| `1ae9033` | 2026-05-05 | docs(spec): framework page v7 floor update — add Floor 7 (v7.7 Validity Closure) | - |
| `5ce32f9` | 2026-05-05 | feat(framework-v7.8): add framework_meta_retroactive exempt type for chain-of-cu | - |
| `5160254` | 2026-05-05 | docs(case-studies): split roundup + standardize 28 showcase paths (#207) | - |
| `dcdd576` | 2026-05-05 | feat(framework-v7.8): land framework-v7-8-branch-isolation backlog stub (#208) | - |
| `31c5847` | 2026-05-05 | docs(framework-meta): retroactive specs/plans for v7.5, v7.6, v7.8 (#209) | - |
| `60feb3f` | 2026-05-05 | chore(chain-of-custody): fix ui-audit link + 4 framework-meta wrappers + remove  | - |
| `b37c74b` | 2026-05-05 | docs(claudemd): correct outdated 27-P0 ui-audit baseline references (#211) | - |
| `0a648bc` | 2026-05-05 | chore(onboarding-v2-retroactive): reconcile state.json + add log.json (#212) | - |
| `f37a342` | 2026-05-05 | chore(dashboard): bump version 1.0.0 → 1.0.1 (FIT-59 cache-bust) (#213) | - |
| `5cfb83a` | 2026-05-05 | docs(prd): retroactive PRD for metric-tile-deep-linking (iOS audit C-1, 1/3) (#2 | - |
| `4f8f8be` | 2026-05-05 | docs(prd): retroactive PRD for settings-v2 (iOS audit C-1, 2/3) (#215) | - |
| `f777efb` | 2026-05-05 | docs(prd): rename adaptive-intelligence-initiative.md → adaptive-intelligence.md | - |
| `1609dd2` | 2026-05-05 | docs(claudemd): codify Tier 3 policy notes — E-2 (UI test strategy) + F-1 (HISTO | - |
| `f3ea271` | 2026-05-05 | chore(unified-control-center): UCC Path A — T40 + state.json reconcile (T31-T33, | - |
| `27f0bd1` | 2026-05-05 | docs(glossary): add dev-basics primer for non-developers (#219) | - |
| `976f92b` | 2026-05-05 | chore(unified-control-center): T2 baseline placeholder + T2.5 follow-up task (#2 | - |
| `ecd4776` | 2026-05-05 | chore(unified-control-center): reconcile state.json — T18 + T19 done (#221) | - |
| `d6ac70d` | 2026-05-05 | chore(ucc): mark T20-T23 done in state.json (Wave 1 complete) (#222) | - |
| `b151e18` | 2026-05-05 | chore(unified-control-center): reconcile T24/T25/T27/T28 done — fitme-story PRs  | - |
| `1e88768` | 2026-05-06 | fix(ci): disable UI test target parallelism — root-cause fix for parallel-clone  | - |
| `96be1a0` | 2026-05-06 | docs(analytics): add 8 dashboard_* events to taxonomy CSV (UCC T37) (#226) | - |
| `c149672` | 2026-05-06 | docs(dashboard): mark Astro dashboard as HISTORICAL — superseded by fitme-story  | - |
| `2068728` | 2026-05-06 | chore(unified-control-center): end-of-day reconcile — T26/T29/T30/T30.5/T34/T36( | - |
| `fe873c9` | 2026-05-06 | chore(unified-control-center): T35 redirect fit-tracker2 -> fitme-story/control- | - |
| `e18fca8` | 2026-05-06 | chore(unified-control-center): final reconcile T35/T36/T38/T42 done + T2.5 defer | - |
| `67d8cfb` | 2026-05-06 | chore(unified-control-center): formal close — current_phase=complete (#232) | - |
| `a47e3a7` | 2026-05-06 | chore(framework-v7-7): post-merge ledger cleanup + B1/B2 verification (#201) | - |
| `dc98b17` | 2026-05-06 | docs(backlog): strike CI parallel-clone hang — resolved 2026-05-05 via PR #225 ( | - |
| `dbd173e` | 2026-05-06 | feat(skills): v4.X skill-layer — UX/Design preflight + auto Figma build + pre-me | - |
| `8bb5daa` | 2026-05-06 | feat(import-training-plan): Phase 1 ship — persist + active-plan + GDPR + 9 even | - |
| `6c9bdca` | 2026-05-06 | docs(backlog): close /ux + /design preflight task (shipped via FT2 #235 + fitme- | - |
| `721c0e8` | 2026-05-06 | chore(import-training-plan): Phase 8 closure — current_phase=complete + case stu | - |
| `732f4ed` | 2026-05-06 | chore(sync): cross-reference sync — Linear + Notion + master plan + backlog + UC | - |
| `6bf417a` | 2026-05-07 | feat(push-notifications-v2): platform-layer rebuild — Phase 0–6 complete (#239) | - |
| `c7e6c10` | 2026-05-07 | docs(framework): bump dev-guide to v7.8 + ship lifecycle event catalog + reconci | - |
| `81d6e07` | 2026-05-07 | chore(push-notifications-v2): Phase 8 closure (#240) | - |
| `96c9069` | 2026-05-07 | docs(push-notifications-v2-case-study): rename table column 'Kill' → 'Kill crite | - |
| `6d1a53f` | 2026-05-07 | feat(framework-v7-8-branch-isolation): BRANCH_ISOLATION_VIOLATION + FEATURE_CLOS | - |
| `6dabcbf` | 2026-05-07 | docs(framework-v7-8-branch-isolation): Phase 8 closure — case study + current_ph | - |
| `0a0ec25` | 2026-05-07 | chore(framework): bump to v7.8.1 — docs propagation across 5 surfaces (#246) | - |
| `be9abc8` | 2026-05-07 | docs(master-plan+backlog): sync to v7.8.1 reality (push-notifications-v2 + branc | - |
| `e5a7c45` | 2026-05-07 | feat(ucc-passkey-auth): cross-repo audit-log sync + state + protocol artifacts ( | - |
| `b39ddd0` | 2026-05-07 | docs(ucc-passkey-auth): Phase 8 closure — case study + state.json complete (#249 | - |
| `939c7f8` | 2026-05-07 | docs(setup): add ucc-passkey-auth going-live runbook (#250) | - |
| `751c982` | 2026-05-07 | docs(claude.md): cross-reference ucc-passkey-auth setup guide (#251) | - |
| `d16715b` | 2026-05-07 | docs(backlog): add Figma design + architecture for both surfaces (iOS + web) (#2 | - |
| `3cf8f71` | 2026-05-07 | docs(stress-test): roadmap-stress-test-2026-05-07 closure (1 shipped, 8 v7.9 can | - |
| `f252ded` | 2026-05-08 | docs(audit): fitme-story public-site audit + v7.9 candidates queue (#254) | - |
| `ed2537b` | 2026-05-08 | chore(integrity): cycle snapshot 2026-05-07T06-39-32Z (#257) | - |
| `dc2d2e5` | 2026-05-08 | fix(ucc-passkey-auth): reconcile T1-T28 task statuses to done (#262) | - |
| `127c3e5` | 2026-05-08 | chore(workflows): bump GitHub Actions to Node 24-compatible majors (#263) | - |
| `2975e74` | 2026-05-08 | docs(case-studies): dual-outlet pattern contract (T8 / G3) (#260) | - |
| `02e3d8d` | 2026-05-08 | chore(framework): document cross-repo gate asymmetry + fix observe-cache-hit hoo | - |
| `3176038` | 2026-05-08 | docs(design-system): fitme-story design architecture (T21 / FIG-W6) (#261) | - |
| `d536871` | 2026-05-08 | feat(fitme-story-public-enhancements): create rollup feature folder + capture 7  | - |
| `a4b357f` | 2026-05-08 | chore(hadf-phase2): land final summary + scripts in main (closes citation gap) ( | - |
| `be76b73` | 2026-05-09 | docs(hadf-phase2): update case-study citations to squash SHA a4b357f (#265) | - |
| `ab8d5fa` | 2026-05-09 | chore(fitme-story-public-enhancements): reconcile state.json (7→17 done) (#266) | - |
| `2f1ac2c` | 2026-05-09 | chore(fitme-story-public-enhancements): invoke v7.8.1 retroactively + midstream  | - |
| `c2587cd` | 2026-05-09 | docs(hadf): label Framework Version v7.0 (was v6.0) — match user-facing card (#2 | - |
| `d252b7b` | 2026-05-09 | docs(spec): Phase C cross-repo state sync — canonical contract (#271) | - |
| `998ad7e` | 2026-05-09 | chore(fitme-story-public-enhancements): reconcile T10 + T12 to done (rollup 20→2 | - |
| `5c12f58` | 2026-05-09 | chore(fitme-story-public-enhancements): capture 17 Figma component node IDs (T20 | - |
| `39f0882` | 2026-05-09 | docs(framework-v7.8): advisory-period extension to 2026-05-16 — calibration revi | - |
| `84381df` | 2026-05-09 | chore(ios-code-connect): scaffold placeholder chore feature (#273) | - |
| `044c8ee` | 2026-05-09 | docs(backlog): add fitme-story website design system as separate item (#274) | - |
| `febba77` | 2026-05-10 | chore(fitme-story-public-enhancements): reconcile T20 → done (23/24) (#275) | - |
| `7bfc8f2` | 2026-05-10 | docs(backlog): mark "Refine case-study presentation/readability" SHIPPED (#276) | - |
| `666e951` | 2026-05-10 | feat(ios-code-connect): T1+T2+T3+T5 — Figma.toml + 5 .figma.swift mappings + wor | - |
| `c98b9d3` | 2026-05-10 | chore(code-connect-automation): scaffold chore feature (3-layer plan) (#278) | - |
| `9cceffe` | 2026-05-10 | feat(scaffold): scripts/scaffold-figma-mapping.py — auto-gen .figma.swift templa | - |
| `5beb32d` | 2026-05-10 | feat(design-skill): T3 Layer B + Code Connect access gate + spec↔build parity ch | - |
| `091f990` | 2026-05-10 | feat(ci): T4 Layer C — figma-code-connect-publish workflow (FT2) (#281) | - |
| `8b80061` | 2026-05-10 | chore(integrity): cycle snapshot 2026-05-10T06-36-02Z (#282) | - |
| `8536fb8` | 2026-05-10 | fix(ci): use Swift parser via SPM wrapper for iOS Code Connect publish (#283) | - |
| `977aaf6` | 2026-05-10 | fix(ios-code-connect): point .figma.swift mappings at component IDs (not frame I | - |
| `0e4b4ff` | 2026-05-10 | docs(code-connect): roll up v4.X+CC across CLAUDE.md + skills + dev-guide + DS c | - |
| `b8954d6` | 2026-05-10 | chore(code-connect-automation): close out — T1-T4 done, T5 deferred (Figma scope | - |
| `2e00e18` | 2026-05-10 | feat(fitme-story-website-design-system): PM scaffolding + case study + analytics | - |
| `810a60c` | 2026-05-10 | chore(fitme-story-website-design-system): Phase 8 + 9 closure — current_phase=co | - |
| `1e91ec2` | 2026-05-10 | docs(bucket-h): DS lens audit (45 findings) + 4 P1 follow-up backlog items (#289 | - |
| `953908b` | 2026-05-11 | feat(design-system): add 4 AppSize tokens + mass-substitute magic frame values ( | - |
| `d71577b` | 2026-05-11 | chore(closure-and-attribution): p2-cleanup closure + BHF attribution + control-r | - |
| `c0759f9` | 2026-05-11 | feat(design-system): 3 new AppText tokens + 23 font subs + 5 a11y labels + widen | - |
| `df65d87` | 2026-05-11 | chore(ios-ui-audit-p1-burndown): Phase 5-8 closure — current_phase=complete (#29 | - |
| `231168e` | 2026-05-11 | chore(framework-status): weekly snapshot 2026-05-11 (#296) | - |
| `aaf7876` | 2026-05-11 | v7.8.3 Phase 0 — V2 + V9 + snapshot protocol + tests/framework infra (#298) | - |
| `c8e4b96` | 2026-05-11 | v7.8.3 Phase 1 D-3 — unified cross-repo PR cite cache + 63/63 calibration (#299) | - |
| `16dd1d6` | 2026-05-11 | v7.8.3 Phase 2 — state_owner schema + 62-feature backfill + morphed C-5 (#300) | - |
| `2188bc0` | 2026-05-11 | Reverse-sync: mirror fitme-story-native state.json from b844f69 (#301) | - |
| `0601718` | 2026-05-11 | docs(v7.9-candidates): add F11/F12/F13 from v7.8.3 cutover dogfood findings (#30 | - |
| `d7955d3` | 2026-05-11 | docs(case-study): cross-repo-state-sync-impl (v7.8.3) — 5 PRs, 3-attempt cutover | - |
| `564cc88` | 2026-05-11 | chore(cross-repo-state-sync-impl): closure — current_phase=complete (v7.8.3 SHIP | - |
| `4f40306` | 2026-05-11 | docs(v7.8.3): sync framework docs + master plan + backlog to v7.8.3 release umbr | - |
| `7f786f7` | 2026-05-12 | docs(spec): HADF Phase 2-bis hardened cloud replication design — 11 sections + s | - |
| `f0b305a` | 2026-05-12 | feat(ios-p1-drift-cleanup): 10 AppSize tokens + 4 magic-padding swaps — 44→14 P1 | - |
| `5375908` | 2026-05-12 | chore(fitme-story-ds-p2-deferred): closure — current_phase=complete + case study | - |
| `74d809f` | 2026-05-12 | chore(ios-ui-audit-p1-drift-cleanup): closure — current_phase=complete + case st | - |
| `75c2137` | 2026-05-12 | chore(fitme-story-ds-p2-final-sweep): closure — current_phase=complete + case st | - |
| `ac80088` | 2026-05-12 | feat(ds): 13 AppSize tokens + 14 substitutions — iOS P1 to 0 (#311) | - |
| `4257a8a` | 2026-05-12 | chore(ui-ux-final-sweep-2026-05-12): closure — current_phase=complete + case stu | - |
| `2bfe108` | 2026-05-12 | docs(plan): HADF Phase 2-bis implementation plan (3 blocks × 21 tasks × ~10300 w | - |
| `1092f22` | 2026-05-12 | feat(framework-v7.8.4): pre-v7.9 telemetry calibration + PR_CACHE_STALE gate (#3 | - |
| `652aeac` | 2026-05-12 | chore(framework-v7.9): +7d measurement-window snapshot (2026-05-11) (#297) | - |
| `442427d` | 2026-05-12 | feat(hadf-phase2bis-replication): Block A — soak window scaffolding (12 tasks, a | - |
| `29e89e3` | 2026-05-12 | fix(v7.8.5): cache_hits gate-coverage test fixture rot — emission key was correc | - |
| `0307d2f` | 2026-05-12 | docs(v7-9-candidates): F14-F18 from PR #317 + test-suite audit + external resear | - |
| `77d2ffe` | 2026-05-12 | docs(infra-plan + backlog): consolidate PR #317 + #318 findings into forward pla | - |
| `5edb264` | 2026-05-12 | docs(plan): full v7.8.5 → v8.2 implementation plan + product-framework concurren | - |
| `9ed8c8e` | 2026-05-12 | docs(hadf-phase2bis): consolidate with v7.8.5→v8.2 framework plan + per-phase OR | - |
| `566e7d6` | 2026-05-12 | docs(master-plan): consolidated review + Linear/Notion paste-ready hierarchy (#3 | - |
| `6c52e92` | 2026-05-12 | fix(framework): BRANCH_ISOLATION_VIOLATION Mode B silent-pass on infra-only comm | - |
| `16312b0` | 2026-05-12 | docs(telemetry): pre-T7.9.0 baseline audit + 3D framework diagram Phase 0 resear | - |
| `b621740` | 2026-05-13 | chore(integrity): cycle snapshot 2026-05-13T06-50-51Z (#325) | - |
| `7b1ce27` | 2026-05-13 | chore(telemetry): seed Mode B post-fix + freeze gate-coverage snapshot for T7.9. | - |
| `c178950` | 2026-05-13 | docs(integrity): document BRANCH_ISOLATION_HISTORICAL post-cleanup behavior (#32 | - |
| `5467360` | 2026-05-13 | docs(integrity): establish Observed Patterns Catalog + wire preflight (#328) | - |
| `27ced70` | 2026-05-13 | docs(framework): advance 3D framework universe research → PRD draft (#329) | - |
| `8f34d76` | 2026-05-13 | fix(v7.8.5.1): residual test fixture rot from v7.8.3 + v7.8.4 schema migrations  | - |
| `507fa60` | 2026-05-13 | feat(analytics-observability): Phase 1 PRD + decisions log + 3D Framework Univer | - |
| `787836a` | 2026-05-13 | feat(analytics-observability): Phase 1.A.1 — CSV taxonomy backfill (49 events +  | - |
| `d3ca7ed` | 2026-05-13 | Reverse-sync: mirror fitme-story-native state.json from 52f2213 (#333) | - |
| `edd4027` | 2026-05-13 | feat(analytics-observability): Phase 1.A.3 — delete unfired ai_recommendation_ac | - |
| `535e60f` | 2026-05-13 | feat(analytics-observability): Phase 1.A.4 — forward-declared events convention  | - |
| `0b15aa4` | 2026-05-13 | docs(analytics-observability): complete spec — §5.5 status + §14.5 patterns + §1 | - |
| `4ebfd8a` | 2026-05-13 | feat(analytics-observability): Phase 1.A.5 — 19 iOS analytics tests, coverage 81 | - |
| `e47cca2` | 2026-05-13 | feat(analytics-observability): Phase 1.A.7 — refresh external-sync-status.json a | - |
| `241e1e3` | 2026-05-13 | docs(planning): A2/A3/A4 spec planning batch — review notes + F16 PRD + v8.0 doc | - |
| `c50bf4b` | 2026-05-13 | feat(integrity): W9 branch-drift detection + real-time alert hook (#341) | - |
| `c29877a` | 2026-05-13 | docs(framework): v7.8.5 observability layer doc-sync — CLAUDE.md + dev-guide + l | - |
| `c737eb8` | 2026-05-13 | docs(skill): add qa SKILL.md preflight section for observed-patterns catalog (#3 | - |
| `353b142` | 2026-05-13 | feat(analytics-observability): Phase 2.A.1 — local analytics mirror SSE server ( | - |
| `4117ac7` | 2026-05-13 | docs(planning): commit 2026-05-13 planning docs (skills-review + test-coverage m | - |
| `cea4e0b` | 2026-05-14 | docs(infra-master-plan): wire test-coverage sub-doc — §3.4 Theme H + §3.6.6.B +  | - |
| `7ee1ca5` | 2026-05-14 | feat(analytics-observability): Phase 2.A.2 — /analytics watch CLI sub-command (# | - |
| `2269077` | 2026-05-14 | docs(skill): add /analytics SKILL.md preflight section for observed-patterns cat | - |
| `62d1689` | 2026-05-14 | feat(analytics-observability): Phase 2.A.3 — iOS DebugSinkAdapter (#349) | - |
| `0b1f661` | 2026-05-14 | feat(analytics-observability): Phase 2.B.1 — /analytics poll + GA4 MCP setup run | - |
| `ccad7c8` | 2026-05-14 | chore(skills): P0 + Top-3 P1 sweep — frontmatter, audit gate, anti-patterns, /br | - |
| `8334a01` | 2026-05-14 | chore(skills): P1.1 — /dev skills sub-command (audit \| trace \| freshness) (#352) | - |
| `145a12c` | 2026-05-14 | chore(skills): P1.4 + P1.5 + P1.6 — adapter cross-links, skill changelog, UCC da | - |
| `822b332` | 2026-05-14 | chore(skills): W5 — bidirectional adapter ↔ skill integrity check (#355) | - |
| `1168677` | 2026-05-14 | docs(analytics-observability): Phase 3.A.0 — spec scaffold + master-plan §7.5/§7 | - |
| `92dbe90` | 2026-05-14 | chore(analytics-observability): reconcile 3.A.1 → complete (post-merge cleanup)  | - |
| `ef27d6b` | 2026-05-14 | chore(skills): P1.3 — /ux + /design preflight self-test fixtures + ecosystem doc | - |
| `cca5c14` | 2026-05-15 | chore(infra): daily integrity checkpoint system + companion master plan (#360) | - |
| `a943824` | 2026-05-15 | docs(analytics-observability): GA4 MCP connected — fix env-var name typo + sync  | - |
| `371ea60` | 2026-05-15 | chore(deps): Bump devalue from 5.6.4 to 5.8.1 in /website (#361) | - |
| `4b71222` | 2026-05-15 | chore(framework): MUST-have cadence batch — integrity-diff, weekly trends, ssh p | - |
| `5e6aa4b` | 2026-05-15 | docs(v7-7): flip Section 99 banner to shipped — both B1+B2 trend modes verified  | - |
| `8967e07` | 2026-05-15 | chore(framework): nice-to-have cadence batch — dep audit weekly + stale-branch + | - |
| `3f7c6a4` | 2026-05-15 | docs(framework): reconcile v7.8.6 across all framework doc surfaces (#366) | - |
| `b485666` | 2026-05-15 | chore(skills): bump 11 SKILL.md frontmatter to v7.8.6 / 2026-05-15 (#367) | - |
| `b097357` | 2026-05-15 | docs(skills): add brainstorm-pm.md docs page + sweep stale skill-count refs acro | - |
| `ac43757` | 2026-05-16 | chore(framework): v7.8.6 P2 polish — W10 stale-branch pattern + GA4 anomaly chec | - |
| `b9f8fe9` | 2026-05-16 | docs(framework): add framework-routines navigation index (#369) | - |
| `b6b5b9c` | 2026-05-16 | chore(integrity): cycle snapshot 2026-05-16T06-24-57Z (#374) | - |
| `0b4823f` | 2026-05-16 | docs(evolution): update v7.8.6 row to reflect /brainstorm-pm teal color recovery | - |
| `010ae5f` | 2026-05-16 | fix(framework): pr-cache freshness gate now validates per-repo completeness (W11 | - |
| `72dfa8d` | 2026-05-16 | chore(sync): 2026-05-16 daily ecosystem sync — framework tracking updates (#372) | - |
| `a53b963` | 2026-05-16 | docs(ga4): access binding setup guide + 2026-05-16 diagnostic findings (#376) | - |
| `50a4be9` | 2026-05-16 | chore(ios-code-connect): T4 root-cause diagnosis — FIGMA token missing Code Conn | - |
| `2ff79fe` | 2026-05-16 | chore(state): system-sweep gap closures — HADF tasks + v7.9 promotion scaffold + | - |
| `a161323` | 2026-05-16 | fix(app-store-assets): rename stale `paused` block to `previous_pause` to resolv | - |
| `5dca26a` | 2026-05-17 | fix(checkpoint): key daily-checkpoint idempotency on ledger row, not snapshot di | - |
| `b8eb4e7` | 2026-05-17 | chore(framework): patch feature-completeness-audit + backfill cu_v2 (#382) | - |
| `fea3cd4` | 2026-05-17 | chore(ucc-passkey-auth): sync docs after 2026-05-16 cutover Parts 1-6 (redacted) | - |
| `1019db7` | 2026-05-17 | chore(ucc-passkey-auth-audit-log-redis-fix): T1-T9 wrap-up — state.json + case s | - |
| `513abff` | 2026-05-17 | chore(ucc-sign-in-figma-mapping): UU4 Phase 2-4 setup — state.json + log + caden | - |
| `aaab08f` | 2026-05-17 | chore(framework): patch BRANCH_ISOLATION_HISTORICAL heuristic + regression flag  | - |
| `daf76ac` | 2026-05-17 | chore(ledger): 2026-05-17 daily-checkpoint at aaab08f — regression flag cleared  | - |
| `31ea322` | 2026-05-17 | chore(ucc-passkey-auth): close T7 (preemptive wire) + reconcile Part 9 shipped + | - |
| `063ee17` | 2026-05-18 | fix(ios-analytics): light up iOS firehose to GA4 — plist target membership (#388 | - |
| `b52a567` | 2026-05-18 | chore(ledger): 2026-05-18 daily ecosystem sync — squashed snapshot (#396) | - |
| `004814a` | 2026-05-18 | docs(telemetry): T7.9.0 v7.9 pre-promotion-decision verdict report (2026-05-18)  | - |
| `f895e88` | 2026-05-18 | docs(telemetry): T7.9.0 pre-decision review (D-3) (#393) | - |
| `28052fd` | 2026-05-18 | fix(ci): plist-decode step writes stub when secret unavailable (Dependabot-safe) | - |
| `d3c2e54` | 2026-05-18 | chore(framework-status): weekly snapshot 2026-05-18 (#394) | - |
| `c455b56` | 2026-05-18 | fix(ci): skip Build and Test job entirely for Dependabot PRs (#399) | - |
| `758423d` | 2026-05-18 | chore(deps): Bump devalue from 5.6.4 to 5.8.1 in /dashboard (#395) | - |
| `f6e15f1` | 2026-05-18 | docs(meta-analysis): kill_criteria_resolution backfill decision (FIT-69) — optio | - |
| `122744e` | 2026-05-18 | chore(framework-v7-9-promotion): append Tier 2.2 risk-closure event for 2026-05- | - |
| `baa64bd` | 2026-05-18 | docs(meta-analysis): cache_hits surgical backfill draft (PR #392 Action 5) — exe | - |
| `68aa6bf` | 2026-05-18 | docs(prompts/ui): UCC sign-in Figma build spec — discovery + variant-build recip | - |
| `9944819` | 2026-05-18 | chore(framework-v7-9-promotion): T7.9.0.6 rollback rehearsal completed — Tier 2. | - |
| `c9e2ab1` | 2026-05-19 | chore(deps): Bump brace-expansion from 5.0.5 to 5.0.6 in /dashboard (#406) | - |
| `4975e10` | 2026-05-19 | chore(deps): Bump brace-expansion from 5.0.5 to 5.0.6 in /website (#407) | - |
| `3311d30` | 2026-05-19 | feat(audit): impartial audit prompt substrate for External Audits #1-#4 + 4 Data | - |
| `1a77b0e` | 2026-05-19 | chore: 2026-05-19 batch — A1 state reconcile + D1 defer + Swift 6 fixes + v7.9 a | - |
| `02610a2` | 2026-05-20 | feat(ucc-passkey-auth-security-hardening): Phase 0/1 prep — spec + risk assessme | - |
| `57696af` | 2026-05-20 | chore(ucc-passkey-auth-security-hardening): Phase 2 → 3 advance — Implementation | - |
| `a98214c` | 2026-05-20 | fix(ci): UCC audit log sync — open PR instead of direct push to main (#411) | - |
| `baf2c4a` | 2026-05-20 | chore(ios-code-connect): close as partial-ship — T4 figma publish requires org-t | - |
| `e05eb32` | 2026-05-21 | docs(ucc-passkey-auth-security-hardening): Phase 8 docs — case study + cadence + | - |
| `424963f` | 2026-05-21 | chore(ucc-sign-in-figma-mapping): reconcile state — 8/11 actually shipped + W14  | - |
| `0178a9c` | 2026-05-21 | docs(master-plan): fitme-story discoverability plan — 4-phase, ~11-13h, target 5 | - |
| `ea53ff4` | 2026-05-21 | feat(framework-v7-9-promotion): flip 3 advisory gates → enforced (single-flag, B | - |
| `9bfb7bb` | 2026-05-21 | feat(framework-v7-9-promotion): post-merge close-out — phases + 4 merge SHAs (#4 | - |
| `209423e` | 2026-05-21 | chore(backlog): pause Sentry Error Tracking Integration — pre-launch trigger (#4 | - |
| `fe36bad` | 2026-05-21 | docs(master-plan): post-v7.9 sweep — A4 + A3 + A2 (3 docs in 1 commit) (#420) | - |
| `36b9a8c` | 2026-05-21 | docs(backlog + master-plan): post-v7.9 catch-up — A1 + A2-current (#421) | - |
| `60946de` | 2026-05-21 | docs(observed-patterns): add W15 — MDX `<digit` parse failure pattern (#422) | - |
| `94d2fd7` | 2026-05-21 | chore(dev-env): Tier 1 R1 + R6 + R2 — .tool-versions + .editorconfig + checkpoin | - |
| `4ecbf16` | 2026-05-21 | chore(dev-env): R3 — capture SSD hardware identity in daily checkpoint (#424) | - |
| `da1bffc` | 2026-05-21 | chore(dev-env): R5 — pre-flight SSD health probe (#425) | - |
| `e261119` | 2026-05-21 | chore(dev-env): R4 — replug-detection launchd watcher for /Volumes/DevSSD (#426) | - |
| `2bfa04e` | 2026-05-21 | chore(dev-env): R11 — make doctor (one-shot dev-env sanity readout) (#427) | - |
| `2a69bcc` | 2026-05-21 | chore(dev-env): R20 — integrity-snapshot retention policy (#428) | - |
| `c3afff6` | 2026-05-21 | chore(dev-env): R8 + R9 — log rotation + session-ledger compaction (#429) | - |
| `2d6603b` | 2026-05-21 | chore(dev-env): R13 — gh auth + token expiry early-warning (#430) | - |
| `6fe2d5e` | 2026-05-21 | chore(dev-env): R7 + R10 audit — gh-pr-cache surface + verify-local idempotency  | - |
| `0c74ac5` | 2026-05-21 | chore(dev-env): R12 — weekly off-platform git-history backup to GH release (#434 | - |
| `9bd12a9` | 2026-05-21 | chore(dev-env): YubiKey FIDO2 cut-over follow-up — doctor check + runbook (#431) | - |
| `553ff57` | 2026-05-21 | chore(dev-env): R16 + R23 — cache hit-rate audit + import survey (#433) | - |
| `4bacdcf` | 2026-05-21 | chore(security): GitHub Security Tier S — 4 hardening surfaces (#435) | - |
| `2c40494` | 2026-05-21 | chore(ci)(deps): Bump actions/checkout from 4 to 6 (#436) | - |
| `71dac9b` | 2026-05-21 | chore(ci)(deps): Bump actions/github-script from 7 to 9 (#438) | - |
| `9aa244a` | 2026-05-22 | chore(integrity): clear UCC hardening advisories — cache_hits backfill + T2 tier | - |
| `8889f54` | 2026-05-22 | chore(phase-e-day-1): post-v7.9 calendar-anchored batch — T-8 + T-7 reconciliati | - |
| `ab4eebe` | 2026-05-22 | chore(meta-analysis): Phase 1 refresh — L0/L1/L2 paired with Audit #2 (#445) | - |
| `d130971` | 2026-05-22 | chore(audit-1-corrections): apply all 5 corrections from External Audit #1 (#448 | - |
| `a0e7740` | 2026-05-22 | chore(framework): daily sync — documentation-debt + measurement-adoption refresh | - |
| `3424344` | 2026-05-22 | chore(integrity): cycle snapshot 2026-05-22T07-48-47Z (#446) | - |
| `deb816f` | 2026-05-23 | chore(deps): consolidated CI action bumps (peter-evans v8 + setup-python v6 + up | - |
| `7aeb4e7` | 2026-05-23 | chore(docs): fix CLAUDE.md drift — master-plan reference (#450) | - |
| `86084c4` | 2026-05-23 | feat(framework-f14-f15): dispatch-test coverage for 9 gates (F14 + F15 ship) (#4 | - |
| `3686f98` | 2026-05-23 | chore(cadence): backfill PR #451 into C1 closure + case study related_prs (#452) | - |
| `003485b` | 2026-05-23 | chore(ucc): B8 T+7d kill-criteria checkpoint EXECUTED 2026-05-23 (#453) | - |
| `e906601` | 2026-05-23 | chore(batch): C-batch — C7 + C8 + C11 + C12 infra-ops chores (#454) | - |
| `98ca1ad` | 2026-05-23 | chore(hygiene): close 2 features + cadence sweep + audit-run dirs (#455) | - |
| `62ca606` | 2026-05-23 | docs(drift-close): align 3 doc drifts surfaced by 2026-05-23 cross-reference aud | - |
| `d0def07` | 2026-05-23 | docs(audit): comprehensive PR↔docs sync audit + 8 drift fixes (#457) | - |
| `7296645` | 2026-05-23 | chore(audit-2026-05-23-v2): close remaining drifts — Tier 1 + Tier 2 sweep (#458 | - |
| `e6696dd` | 2026-05-23 | chore(gap-close): D-AUDIT-1 backlog row + D-RECON-7 framework-story-site phase c | - |
| `334fc40` | 2026-05-23 | chore(state): D-RECON-12 — roadmap-stress-test case_study_showcase set (#460) | - |
| `bd9b562` | 2026-05-24 | chore(state): D-AUDIT-9 — orchid-v1-5 retroactive feature dir (paused state) (#4 | - |
| `996db67` | 2026-05-24 | chore(state): D-AUDIT-8 — hadf-phase2-cloud-fingerprinting retroactive feature d | - |
| `d1a271a` | 2026-05-24 | chore(dashboard): DISCO P2.3 — 301 permanent + path preservation on legacy fit-t | - |
| `26e3afb` | 2026-05-24 | docs(framework): refresh 6 framework docs for v7.9 promotion alignment (#464) | - |
| `008517d` | 2026-05-24 | feat(notifications): E-5 — wire smart-reminders broadcast to DeepLinkRouter (#46 | - |
| `6fcca16` | 2026-05-24 | docs(architecture): C13 ai-engine deployment doc + cadence-followups closeouts + | - |
| `86e6c66` | 2026-05-24 | chore(hygiene): daily ledger 2026-05-24 + clear phantom regression + W11.b patte | - |
| `30c13ef` | 2026-05-24 | docs(sub-plans): Tier-3 C1 refresh — 5 sub-plans aligned to v7.9 outcome (#469) | - |
| `33927b3` | 2026-05-24 | docs(hygiene): session-end batch — A1-A5 + B1-B4 (9 doc closeouts) (#468) | - |
| `58205bc` | 2026-05-24 | docs(architecture): dev-guide v7.9 readability pass (TL;DR + Glossary + §15 chec | - |
| `5542327` | 2026-05-24 | docs(sub-plans): codify dev-env + ui-ux sub-plans; reconcile UX-R1..R5 drift ite | - |
| `401d632` | 2026-05-24 | docs(hygiene): A1+A2+A4+A5+B1+B2+B3 batch — PHASE_LIE fix, drift backlog, catalo | - |
| `c65f401` | 2026-05-24 | docs(backlog): add design-tokens-pipeline-v5-migration to v8.x icebox + close PR | - |
| `94dfb98` | 2026-05-24 | fix(architecture/dev-guide): TOC offset + cache_hits strikethrough fixes (FT2 mi | - |
| `7e6e4b0` | 2026-05-24 | docs(observed-patterns): W16 contract-boundary fixture sampling (v7.9.1 candidat | - |
| `4039112` | 2026-05-24 | chore(analytics-observability): reconcile phases.implementation status (drift) ( | - |
| `ee62909` | 2026-05-24 | docs(audits): close E-12 + E-13 (ai-engine Dockerfile + cohort telemetry — both  | - |
| `7632380` | 2026-05-25 | chore: session-close drift reconciliation D-1 + D-2 (2026-05-24) (#482) | - |
| `88ac926` | 2026-05-25 | feat(r7+r8+r12): SwiftLint + ruff + markdownlint Track A configs (FT2) (#481) | - |
| `61f77a9` | 2026-05-25 | docs(chore): close C-14 (Orchid v1.5 paused state intact) + HADF Phase 2 replica | - |
| `e4031d7` | 2026-05-25 | feat(r9): iOS Slather + ai-engine pytest-cov coverage instrumentation (#479) | - |
| `22d5a4f` | 2026-05-25 | chore(ucc-auth): daily sync of audit log (20260524) (#470) | - |
| `701e537` | 2026-05-25 | feat(analytics): D-3 — wire AnalyticsScreenModifier to SettingsView (2026-05-25) | - |
| `695eb40` | 2026-05-25 | chore(b12+u1+u2): T-2 prep + ai-recommendation-ui case_study link + 4 UX-R check | - |
| `789dffd` | 2026-05-25 | chore(integrity): cycle snapshot 2026-05-25T08-23-49Z (#485) | - |
| `1d27643` | 2026-05-25 | chore(ci)(deps): Bump actions/cache from 4 to 5 (#486) | - |
| `0446f3b` | 2026-05-25 | chore(ci)(deps): Bump actions/setup-node from 5 to 6 (#487) | - |
| `7ddde52` | 2026-05-25 | feat(hadf-phase2bis): implement call_endpoint for sub-exp 1 (2026-05-25) (#490) | - |
| `bc99613` | 2026-05-25 | chore(daily-digest): framework cycle outputs 2026-05-25 (regen, Path 2) (#491) | - |
| `ea113c0` | 2026-05-25 | docs(observed-patterns): W17 — stale-base unmerged branches (cherry-pick = groun | - |
| `fd3e942` | 2026-05-26 | chore(analytics-observability): phase flip implementation → testing (drift close | - |
| `79abd55` | 2026-05-26 | chore(ui-ux): AND-2 token-drift audit + AND-1 blocker disposition (2026-05-25) ( | - |
| `9ce84be` | 2026-05-26 | chore(ucc-redis-fix): close phase=complete (post-merge reconcile) (#495) | - |
| `aad0045` | 2026-05-26 | chore(ucc-figma-mapping): close phase=complete (8/11 done, 3 blocked deferred) ( | - |
| `e87dbb5` | 2026-05-26 | chore(ucc-security-hardening): reconcile 24/26 task statuses (post-ship state.js | - |
| `66916f1` | 2026-05-26 | fix(b12): correct 3 query template bugs in security-hardening case study §4 (#49 | - |
| `f991267` | 2026-05-26 | chore(ui-ux): Tier A bundle — AND-3 decision + VoiceOver audit + ui-audit P1 rec | - |
| `483a99d` | 2026-05-26 | chore(sync): cross-surface sync — backlog row 116 + cadence B12 T-1 prep + infra | - |
| `ea0037b` | 2026-05-27 | docs(plans): defer Skills Activity aggregator to post-Phase-E (≥ 2026-06-04) (#5 | - |
| `bca2e12` | 2026-05-27 | chore(ucc-hardening): close B12 T+7d kill-criteria — VERDICT: PROMOTE (#503) | - |
| `ec7cb1e` | 2026-05-27 | chore(cadence): close 2 drift items — B11 strike + 3d-flow advisory silence (#50 | - |
| `a9ad674` | 2026-05-27 | chore(hadf-phase2bis): Sub-exp 2 prereg pre-ceremony fill-in (#506) | - |
| `393ee88` | 2026-05-27 | chore(hadf-phase2bis): Sub-exp 3 prereg pre-ceremony fill-in (#507) | - |
| `fadbd3e` | 2026-05-27 | fix(integrity-checkpoint): close #397 check-then-act race via flock (#505) | - |
| `b3f12f8` | 2026-05-27 | chore(cadence): close W11 + HADF related_prs + backlog row 117 (#509) | - |
| `50f7e86` | 2026-05-27 | chore(ai-engine): close 60% router coverage gap + strike stale C-13 (#512) | - |
| `935c8fa` | 2026-05-27 | chore(hadf-phase2bis): cross-sub-exp synthesis case study skeleton (Block C C16  | - |
| `798ae75` | 2026-05-27 | chore(hygiene): items 2-4 — B1 strike + backlog In-Progress refresh + F-LAUNCHD- | - |
| `afb1da4` | 2026-05-27 | chore(disco): Phase 1 status update — P1.3 + P1.4 shipped + bug-fix documented ( | - |
| `b750dfc` | 2026-05-28 | chore(session-close): W18 + W19 patterns + F-DEPLOYED-URL-PROBE + DISCO Phase 1  | - |
| `c86ebf6` | 2026-05-28 | feat(freshness): cross-layer freshness check — closes W20 stale-session-state in | - |
| `116ae0c` | 2026-05-28 | chore(cycle): daily diagnostic outputs — 2026-05-28 measurement-adoption + doc-d | - |
| `890af3d` | 2026-05-28 | chore(integrity): cycle snapshot 2026-05-28T08-04-36Z (#517) | - |
| `82ff444` | 2026-05-28 | chore(ucc-auth): daily sync of audit log (#518) | - |
| `3fb76d0` | 2026-05-28 | feat(hadf-phase2bis-replication): close Sub-exp 1A + prep Sub-exp 2 for Sat 2026 | - |
| `f9c0a82` | 2026-05-28 | chore(framework-manifest): backfill v7.8.4 + v7.8.5 + v7.8.6 + v7.9 sections + b | - |
| `e8f2067` | 2026-05-28 | chore(cadence): strike B2 — post-v7.9 T+7d baseline snapshot EXECUTED 2026-05-28 | - |
| `52cbf47` | 2026-05-28 | feat(framework-v7-9-promotion): advance docs → complete (kill_criteria_resolutio | - |
| `c4c1151` | 2026-05-28 | chore(v7-9-1): file 2 candidates from v7.9 Phase E Day 7 closure — F-SNAPSHOT-MA | - |
| `f1b326f` | 2026-05-29 | chore(meta-analysis-refresh-phase-1): reconcile state implementation → complete  | - |
| `4a90091` | 2026-05-29 | chore(ucc-passkey-auth): close B9 — rollout terminal state stays on UCC_AUTH_MOD | - |
| `4f98daf` | 2026-05-29 | chore(reconcile): 2026-05-29 freshness verification — Phase E UI/UX buckets ship | - |
| `d0d1346` | 2026-05-30 | docs(hadf-phase2bis): add operator pre-launch runbook for B14 + B15 (#530) | - |
| `717cf8e` | 2026-05-30 | ci(framework-status-weekly): add shell-fallback path with retry/backoff (#529) | - |
| `da71069` | 2026-05-30 | chore(ucc-auth): daily sync of audit log (#528) | - |
| `266f93c` | 2026-05-30 | fix(hadf-phase2bis): extract prompt_obj['text'] in collect.py main loop (#532) | - |
| `1494727` | 2026-05-30 | feat(hadf-phase2bis): Sub-exp 1B prep — extended 4-endpoint cloud matrix (#533) | - |
| `7e31bcd` | 2026-05-30 | feat(hadf-phase2bis): Sub-exp 3 prep — Bedrock routing test scaffolding (#534) | - |
| `c852b2b` | 2026-05-30 | chore(phase-e-sweep): close F-SNAPSHOT-MANIFEST-CHECKSUM-ORDERING + v7.9.1 docke | - |
| `1b45acd` | 2026-05-31 | chore(reconcile): 2026-05-29 freshness verification — Phase E UI/UX buckets ship | - |
| `20f6cc1` | 2026-05-31 | chore(cadence): strike B13 + B14 — both resolved 2026-05-30 (#538) | - |
| `05e7f78` | 2026-05-31 | feat(hadf-phase2bis): verdict-script --metric ks for Sub-exp 2 cloud-vs-local (# | - |
| `32d6038` | 2026-05-31 | fix(integrity): TIER_TAG advisory recognizes forward-deadline patterns (#540) | - |
| `627e612` | 2026-05-31 | feat(hadf-phase2bis): verdict-script --metric signature_delta_ratio for Sub-exp  | - |
| `a3ea055` | 2026-05-31 | feat(hadf-phase2bis): Sub-exp 1B v2 — drop mistral + vercel-ai-gateway for 2026- | - |
| `b1e6f79` | 2026-05-31 | docs(hadf-phase2bis): Block C synthesis — §2 PR chain backfill + §3.A.1 Sub-exp  | - |
| `ec8a5d1` | 2026-05-31 | chore(meta-analysis-refresh-phase-1): reconcile state implementation → complete  | - |
| `f648cf8` | 2026-05-31 | docs(backlog): row #118 — 2026-05-30/31 9-PR comprehensive sync batch (#544) | - |
| `a47fcbc` | 2026-05-31 | docs(ui-ux-master-plan): §3.3 freshness reconcile — 4 features moved In-flight → | - |
| `faee2bd` | 2026-05-31 | docs(backlog): iOS Medium Priority dedup — 2 items flipped from open to shipped  | - |
| `458071d` | 2026-05-31 | chore(tier-a): session-close — v7.9.1 docket + daily checkpoint refresh (#548) | - |
| `3099412` | 2026-05-31 | docs(orchid): stage research-arc capstone publication prep (not for publish) (#5 | - |
| `df5f614` | 2026-05-31 | feat(smart-reminders): C1 first slice — register as v2 NotificationConsumerRegis | - |
| `5d289fa` | 2026-05-31 | feat(notifications): Settings v2 — Notifications screen + ReminderPreferencesSto | - |
| `579ee89` | 2026-05-31 | feat(data-export): add CSV format alongside JSON (L350 backlog) (#549) | - |
| `c199c99` | 2026-05-31 | feat(smart-reminders): C1 item #1 — route scheduleIfAllowed through Notification | - |
| `e07399f` | 2026-05-31 | docs(design-system): Dark Mode E2E verification — 47-colorset audit + 5 categori | - |
| `f8d8286` | 2026-05-31 | docs(observed-patterns): catalog W21–W25 surfaced during 2026-05-31 session (#55 | - |
| `66d298f` | 2026-05-31 | feat(smart-reminders): C1 item #3 — migrate ReminderType.deepLink to DeepLinkRou | - |
| `059d08c` | 2026-05-31 | docs(design-system): Dynamic Type @ScaledMetric audit — backlog L353 reframed (t | - |
| `786fb74` | 2026-05-31 | feat(dynamic-type): L353 Phase 1 — @ScaledMetric on 4 v2 icon containers (#557) | - |
| `f5d2665` | 2026-05-31 | ci: skip iOS Build for docs-only PRs (10-15min → instant) (#558) | - |
| `228430a` | 2026-05-31 | docs(backlog): E1 RICE refresh — replace 2026-04-02 Phase 0 table with current 2 | - |
| `247078f` | 2026-06-01 | fix(ci): distinct concurrency groups for ci.yml + ci-docs-skip.yml (W26) (#561) | - |
| `8121294` | 2026-06-01 | feat(trend-alerts-hrv): Phase 0 (Research) — C4 next-most-valuable per E1 RICE r | - |
| `dcf30c9` | 2026-06-01 | feat(readiness-aware-training-alert): full 4-phase enhancement cycle (C2) (#560) | - |
| `c6553eb` | 2026-06-01 | docs(framework): reflect v7.8.1→v7.9 in dev guide + sync observed-patterns catal | - |
| `e131aba` | 2026-06-01 | docs(observed-patterns): W28 — CoreSimulator + iOS platform out-of-date (#565) | - |
| `3deab70` | 2026-06-01 | feat(trend-alerts-hrv): Phase 1 (PRD) + Phase 2 (Tasks) — C4 ready for Implement | - |
| `05f7c3c` | 2026-06-01 | chore(integrity): cycle snapshot 2026-05-31T07-48-04Z (#547) | - |
| `9a5a5cc` | 2026-06-01 | chore(ucc-auth): daily sync of audit log (#568) | - |
| `bcb7a51` | 2026-06-01 | chore(integrity): cycle snapshot 2026-06-01T09-29-10Z (#566) | - |
| `6c456dd` | 2026-06-01 | chore(framework-status): weekly snapshot 2026-06-01 (#567) | - |
| `6fe7f45` | 2026-06-01 | docs(analytics): B1-B4 GA4 funnels + conversion events operator runbook (#570) | - |
| `aec0a2e` | 2026-06-01 | docs(cadence): consolidate 2026-06-01 session operator-action queue (19 items) ( | - |
| `d774dc2` | 2026-06-02 | chore(backlog): close E4 drift — onboarding-v2 retroactive refactor ALREADY DONE | - |
| `91979f8` | 2026-06-02 | chore(deps)(deps-dev): Bump style-dictionary from 3.9.2 to 5.4.2 (#577) | - |
| `77aa9db` | 2026-06-02 | chore(integrity): 2026-06-02 sweep — cross-repo PR-cite fix + cron ledger sync ( | - |
| `cee8801` | 2026-06-02 | Revert "chore(deps)(deps-dev): Bump style-dictionary from 3.9.2 to 5.4.2 (#577)" | - |
| `ec5dff9` | 2026-06-02 | feat(ai-user-feedback-loop): C5 full lifecycle — close UI-024 + reinforcement lo | - |
| `986309c` | 2026-06-02 | chore(sync-2026-06-02): close C5 drift + cadence ledger + Dependabot incident fo | - |
| `42d8235` | 2026-06-02 | docs(hadf): consolidate HADF source of truth + reconcile Sub-exp 2 closure to ma | - |
| `879c199` | 2026-06-02 | docs(dev-guide)+chore(routing): wire brainstorm-pm into research phase + close d | - |
| `26d52ab` | 2026-06-02 | chore(daily-digest): regenerate documentation-debt + measurement-adoption report | - |
| `d6ffd7e` | 2026-06-02 | docs(hadf): fix case_study_showcase pointer 30 → 22c (dangling pointer) (#584) | - |
| `fc28aa6` | 2026-06-02 | docs(hadf): Phase 3 kickoff — SoT activation analysis + 3A sensing spec + 3B RQ4 | - |
| `1c9d000` | 2026-06-02 | docs(framework): index the W28 catalog entry + bump dev-guide pattern count (#58 | - |
| `95d8ab3` | 2026-06-02 | feat(exercise-search-filter): C3 full lifecycle (Phases 0-5) — read-only library | - |
| `fd3b216` | 2026-06-02 | feat(training-program-customization): C6 full lifecycle (Phases 0-5) — custom pr | - |
| `ce50022` | 2026-06-02 | feat(adaptive-intelligence-next-pass): D1 Phase 0+1+2 (Research + PRD + Tasks) — | - |
| `e709be2` | 2026-06-02 | chore(adaptive-intelligence-next-pass): close out D1 — testing → complete (PR #5 | - |
| `f265f55` | 2026-06-03 | chore(analytics): add search_* taxonomy rows (screen_scope=search) (#588) | - |
| `8fc1414` | 2026-06-03 | chore(daily-checkpoint): 2026-06-03 03:00 UTC autonomous snapshot (#589) | - |
| `f78b3e8` | 2026-06-03 | chore(state-drift-closure): close C2 + C3 + C5 + C6 (testing → complete, consoli | - |
| `2c326f1` | 2026-06-03 | chore(2026-06-03): preserve save-branch unique content + HADF SoT sync + .gitign | - |
| `64970cb` | 2026-06-03 | feat(automation): add `make close-feature FEATURE=<name>` — automates post-merge | - |
| `90bf2c0` | 2026-06-03 | chore(ledger): 2026-06-03 daily digest — measurement-adoption + doc-debt snapsho | - |
| `d881b9a` | 2026-06-03 | chore(2026-06-03): batch followups — SoT post-merge cleanup + Lighthouse scoreca | - |
| `2741198` | 2026-06-03 | feat(brainstorm-pm): add Three-Option Trade-Off Mode (UX / Design / Dev matrix)  | - |
| `8a4e257` | 2026-06-03 | docs(brainstorm-pm-3-option): sweep README + CHANGELOG + evolution + pm-workflow | - |
| `dc8049c` | 2026-06-03 | chore(daily-checkpoint): 2026-06-03 17:15 UTC end-of-day refresh (#599) | - |
| `130daa8` | 2026-06-03 | feat(pm-workflow): wire brainstorm-pm three-option auto-dispatch heuristic (M1 f | - |
| `61e0200` | 2026-06-03 | docs(3d-framework-universe): Phase 1 PRD review while paused (L3) (#602) | - |
| `91da2df` | 2026-06-03 | docs(hadf-sot): revise §3 backup-job action — KEEP running (not bootout) (M3) (# | - |
| `793ac88` | 2026-06-03 | chore(trend-alerts-hrv): close out T14 — state.json implementation→complete + ba | - |
| `375d87b` | 2026-06-03 | chore(backlog): 2026-06-03 session ledger — 17 PRs (D1+state-drift batch+brainst | - |
| `d90595e` | 2026-06-04 | chore(backlog): v8.x icebox L417 — record PR #596 failed migration + lesson (#60 | - |
| `9599c20` | 2026-06-04 | chore(v7-9-1): F6 impact-tier docs in CLAUDE.md + T14 stub feature directory (FI | - |
| `5a70d14` | 2026-06-04 | feat(f16-try-repo-harness): Phase 0 Research + Phase 1 PRD + Phase 2 Tasks (FIT- | - |
| `1e650bb` | 2026-06-04 | feat(f16-try-repo-harness): Phase 4 T2+T3 — baseline + builder + harness scaffol | - |
| `186ddcd` | 2026-06-04 | fix(gates): REPO_ROOT_OVERRIDE env var for F16 try-repo harness (#611) | - |
| `6e1d7ba` | 2026-06-04 | chore(ledger): 2026-06-04 daily digest — measurement-adoption + doc-debt snapsho | - |
| `cf4e6a7` | 2026-06-04 | feat(f16-try-repo-harness): T4a fixtures + Q6 finding (29 pass + 10 skip) (#610) | - |
| `ce59e6b` | 2026-06-04 | feat(f16-try-repo-harness): T4a UNBLOCKED — 10/10 schema-gate tests pass end-to- | - |
| `b6fbac6` | 2026-06-04 | chore(ucc-auth): daily sync of audit log (#594) | - |
| `31d1a6b` | 2026-06-04 | chore(integrity): cycle snapshot 2026-06-04T08-22-22Z (#613) | - |
| `3d66942` | 2026-06-04 | feat(f16-try-repo-harness): T6+T7+T8+T9+T10 — F16 implementation→complete (#616) | - |
| `8fdccc1` | 2026-06-04 | feat(f17-last-fired-at-index): refresh script + tests + integration + docs + cas | - |
| `d1267f7` | 2026-06-04 | feat(f2-phase-0-reality-check): mechanical defense against post-squash-merge sta | - |
| `ab0530c` | 2026-06-04 | chore(dev-env): Track B — R7+R8+R12 lint trio Makefile + verify-local + CI workf | - |
| `ed20cbf` | 2026-06-04 | feat(v7-9-1): F-LAUNCHD-DRIFT-EXTENSION sub-fixes (b)+(c) — cron-context phantom | - |
| `41ea644` | 2026-06-04 | chore(f-launchd-drift-extension): close out — state testing→complete (PR #621 me | - |
| `32c41b1` | 2026-06-04 | feat(v7-9-1): F-LAUNCHD-DRIFT-EXTENSION sub-fix (a) — plist path-resolution heal | - |
| `9302838` | 2026-06-04 | docs(observed-patterns): add W29 + W30 + W31 + W32 — MDX/YAML/workflow/closure p | - |
| `e4bbd6a` | 2026-06-04 | chore(f-launchd-drift-extension-sub-a): close out — state implementation→complet | - |
| `48ad2e3` | 2026-06-04 | feat(v7-9-1): F-PHASE-E-ADOPTION-FREEZE-DISCIPLINE — soak-window adoption-metric | - |
| `cf8204f` | 2026-06-04 | chore(dev-env): R9 Track B (FT2 side) — coverage Makefile targets + warn-only CI | - |
| `8f3524f` | 2026-06-04 | chore(dev-env): R11+R13+R14+R17+R18 batch — gitleaks + pip-audit + SBOM + commit | - |
| `e5608c6` | 2026-06-04 | feat(v7-9-1): F-DEPLOYED-URL-PROBE (FT2 substrate) — reusable bash helper closes | - |
| `a79aebe` | 2026-06-04 | feat(v7-9-1): unified promotion case study + comprehensive doc sweep (#629) | - |
| `bb6ae2b` | 2026-06-04 | feat(framework): pattern↔skill preflight overlay — operationalize observed-patte | - |
| `ef31ba8` | 2026-06-04 | feat(3d-universe): Phase 1 → Phase 2 advancement + dev-guide §10.5a pattern↔skil | - |
| `819aa81` | 2026-06-05 | feat(hadf-phase2bis): Block C synthesis closure — all 4 verdicts PASS, HADF disp | - |
| `8bcf2fb` | 2026-06-05 | chore(v7-9-1): close 4 stuck v7.9.1 features (implementation → complete) (#633) | - |
| `e154dc4` | 2026-06-05 | chore(v7-9-1): close framework-v7-9-1-promotion (implementation → complete) (#63 | - |
| `8e1810f` | 2026-06-05 | docs(research): complete HADF×ORCHID overlay anchor — all 4 sub-exps closed, dis | - |
| `35fc32d` | 2026-06-05 | feat(hadf-phase3a): sensing/observability layer — reference store + attestation  | - |
| `a065798` | 2026-06-05 | chore(framework): W30+W31+W32 durable fixes — parser bare-int + workflow-coverag | - |
| `5d90d33` | 2026-06-05 | docs(3d-universe): Phase 2 tasks.md — 36 tasks + HADF Phase 3a layer reservation | - |
| `5cb8a53` | 2026-06-05 | chore(framework-w30-w31-w32-durable-fixes): close out — W32 dogfood SUCCESS (#64 | - |
| `846d3a0` | 2026-06-05 | fix(integrity): raise PR cache window to 2000 — close W34 truncation false-posit | - |
| `f414c08` | 2026-06-05 | fix(hadf-phase3a-sensing): populate complexity (presence-only) to clear MISSING_ | - |
| `f3295d5` | 2026-06-05 | fix(framework): W34 bidirectional sync — pattern-skill-map.json catch-up + SKILL | - |
| `3043ff4` | 2026-06-06 | fix(ci): trailing newline on dependency-audit digest — fix weekly cron failure ( | - |
| `dee4085` | 2026-06-06 | chore(docket): add F-W9-DRIFT-TRIGGERED-AUTO-ISOLATION candidate (#646) | - |
| `8f1e042` | 2026-06-06 | docs(hadf): refresh Source-of-Truth + ORCHID-integration note to final CONFIRMED | - |
| `81b4d8d` | 2026-06-06 | feat(hadf-signature-expansion): calibration_status honesty layer + on-device har | - |
| `8dc286b` | 2026-06-06 | docs(hadf): program closeout — backlog complete + handoff + next-phase readiness | - |
| `4e41001` | 2026-06-06 | chore(ledger): 2026-06-05 daily digest — measurement-adoption + doc-debt snapsho | - |
| `474d804` | 2026-06-06 | feat(w9-auto-isolation): Phase 1 — drift-triggered auto-isolation (#648) | - |
| `a14471a` | 2026-06-06 | feat(w9-auto-isolation): Phase 2 — concurrency-proactive isolation (T6-T10, ADVI | - |
| `13df3ef` | 2026-06-06 | chore(w9-auto-isolation): close feature — current_phase=complete + case study (# | - |
| `1c44dfb` | 2026-06-06 | fix(qa): correct stale test-v7-5-pipeline.sh path in pattern catalog (#651) | - |
| `262ce7d` | 2026-06-06 | chore(ledger): 2026-06-06 daily digest — measurement-adoption + doc-debt snapsho | - |
| `365d1a4` | 2026-06-07 | chore(3d-universe): sync reverse-mirror state.json + tasks.md to current reality | - |
| `8fa7247` | 2026-06-07 | docs(cross-repo-state-sync): restore v7.8.3 spec + plan to main (broken-ref fix) | - |
| `446afeb` | 2026-06-07 | chore(hadf-signature-expansion): close out — merge→complete (PR #644 merged) (#6 | - |
| `d496cdb` | 2026-06-07 | feat(t14-platform-parity): advance research → PRD → tasks_phase (#662) | - |
| `f50b7ac` | 2026-06-07 | fix(framework): permit the prereg lock-introducing commit (F-LOCK-INTRODUCING-CO | - |
| `fe9c043` | 2026-06-07 | chore(framework): tracking-drift-check gate — surface open-but-shipped rows (#65 | - |
| `8e364f1` | 2026-06-07 | chore(backlog): reconcile 2 stale iOS rows + file real notification-store seam ( | - |
| `f118aa1` | 2026-06-07 | docs(t14-platform-parity): T5+T6+T8a+T9 — dev-guide, CLAUDE.md, case study, cali | - |
| `4603ee7` | 2026-06-07 | feat(integrity): F-CONTRACT-FIXTURE-SAMPLING — sample contracts from canonical p | - |
| `aed4de6` | 2026-06-07 | chore(ledger): 2026-06-07 daily digest — measurement-adoption + doc-debt snapsho | - |
| `2abbffb` | 2026-06-07 | feat(hadf-phase3a): T4+T5 risk assessment + T5a honest inference emit hook (#663 | - |
| `070419f` | 2026-06-07 | chore(master-plan): v7.9.1 sync refresh — infra plan + 5 connected sub-plans + c | - |
| `2ee7e00` | 2026-06-08 | docs(setup): style-dictionary v3→v5 migration runbook (ready-to-execute, needs n | - |
| `da22cae` | 2026-06-08 | chore(ledger): 2026-06-08 daily digest — measurement-adoption + doc-debt snapsho | - |
| `74c4b08` | 2026-06-08 | chore(hygiene): backfill cache_hits from Mechanism C attributions + archive stal | - |
| `8d741dc` | 2026-06-08 | fix(integrity): suppress TIER_TAG FPs on un-ledgerable observations (durations + | - |
| `0aa9542` | 2026-06-08 | feat(integrity): GATE_COVERAGE_ZERO meta-check (advisory; v7.10 candidate) (#673 | - |
| `2cf9502` | 2026-06-08 | ci(tokens): run tokens-check on token-pipeline dependency changes (W29 fix) (#67 | - |
| `7c8bfbf` | 2026-06-08 | chore(ci)(deps): Bump gitleaks/gitleaks-action from 2 to 3 (#669) | - |
| `8f6ac91` | 2026-06-08 | build(tokens): migrate style-dictionary v3 → v5 (ESM, golden-verified byte-ident | - |
| `185884d` | 2026-06-09 | feat(fitme-story-dual-audience-redesign): PM paper trail + closure (impl → fitme | - |
| `9d4344e` | 2026-06-09 | chore: reconcile stale feature state — analytics-observability close-out + 3d mi | - |
| `345288f` | 2026-06-09 | chore(analytics-observability): salvage #678 — backlog strike + roster union + T | - |
| `ab96f35` | 2026-06-10 | docs(setup): operator-action register — consolidate all operator-only pending ta | - |
| `0b93f0a` | 2026-06-10 | chore(framework-status): weekly snapshot 2026-06-08 (#675) | - |
| `9832ba5` | 2026-06-10 | fix(measurement): count cu_v2 in BOTH field representations — closes systematic  | - |
| `54e417e` | 2026-06-10 | docs(t14): reconcile T7+T8 to complete — dev-guide timeline row + cu_v2 measurem | - |
| `f85615b` | 2026-06-10 | fix(f17): index w9.auto_isolate hook rows — accept `ts` alongside `timestamp` (# | - |
| `b7268cf` | 2026-06-10 | feat(hadf-phase3a): close out sensing layer — dedicated case study + state recon | - |
| `28b4260` | 2026-06-10 | chore(integrity): cycle snapshot 2026-06-07T07-56-45Z (#658) | - |
| `9e63dd4` | 2026-06-10 | feat(v7.10): cycle-time gate coverage + GATE_COVERAGE_ZERO mis-wire detection (# | - |
| `d20ce24` | 2026-06-10 | chore(ucc-auth): daily sync of audit log (#681) | - |
| `76d916b` | 2026-06-10 | docs(meta-analysis)+fix(verify): second what-if self-test — close local-self-ver | - |
| `f2b0b4d` | 2026-06-10 | feat(ai-golden-set-evals): T10 — golden-set behavioral eval for the deterministi | - |
| `fba6bd8` | 2026-06-10 | docs(sync): reflect v7.10 + T10 + field-rename closure across CLAUDE.md, backlog | - |
| `1f9c3ef` | 2026-06-10 | feat(t13): per-gate last_failed_at index (extends F17) + GATE_COVERAGE_ZERO mis- | - |
| `a0c7d94` | 2026-06-10 | feat(T3): SignInService passkey/WebAuthn unit tests — close the highest-risk zer | - |
| `c53926c` | 2026-06-10 | chore(ucc-auth): daily sync of audit log (#692) | - |
| `8e630d3` | 2026-06-10 | chore(integrity): cycle snapshot 2026-06-10T08-10-40Z (#696) | - |
| `e717cab` | 2026-06-10 | docs(spec): T4 Swift snapshot testing — Phase A scaffold + 2 operator gates (#70 | - |
| `be140d0` | 2026-06-11 | feat(integrity): dilution-normalized drift overlay + provenance split + unified  | - |
| `35599e7` | 2026-06-11 | feat(T5): mock-protocol drift detection — central conformance registry (#698) | - |
| `57d0855` | 2026-06-11 | fix(ds): clear 2 P1 ui-audit drifts on the C4/C5 screens (fix-as-you-touch) (#69 | - |
| `407ed02` | 2026-06-11 | fix(integrity): source weekly gate-coverage observer from committed F17 index (# | - |
| `be54d06` | 2026-06-11 | chore(monitoring): daily cycle snapshot — 2026-06-11 09:00 IDT (#703) | - |
| `b69ecd4` | 2026-06-11 | docs(backlog): reconcile 2 shipped iOS items — Smart Reminders↔Push v2 (C1) + L3 | - |
| `b497fc0` | 2026-06-11 | docs(integrity): sync observed-patterns Index — #24 + W30-W34, fix stale W29 lab | - |
| `c8ba299` | 2026-06-12 | feat(garmin-health-connection): Tier-1 Data Sources (HealthKit relay) (#705) | - |
| `dbe5d73` | 2026-06-14 | chore(monitoring): daily cycle snapshot — 2026-06-14 09:00 IDT (#708) | - |
| `8aff3ac` | 2026-06-14 | fix(w9): session-id keying — read from hook stdin, not the never-set env var (#7 | - |
| `4fb3d1d` | 2026-06-14 | chore(garmin-health-connection): post-merge closure — cu_v2 + case study + compl | - |
| `79a25a0` | 2026-06-14 | fix(close-feature): normalize lingering sub-phase status at closure (#711) | - |
| `e420d32` | 2026-06-15 | docs(framework): align living docs to v7.10 current state + canonical fact block | - |
| `c591313` | 2026-06-15 | docs(master-plan): refresh v8.x docket to v7.10 current state (#713) | - |
| `01cf502` | 2026-06-15 | docs(master-plan): extract v8.x docket into dedicated sub-plan + ready-now workp | - |
| `5d8b530` | 2026-06-15 | feat(f10+f5): experiment_outcome enum + scope_change event (non-gate formalizati | - |
| `a82ae72` | 2026-06-15 | feat(f12): actionlint warn-only CI gate on GitHub Actions workflows (#719) | - |
| `628f085` | 2026-06-15 | docs(docket): mark F13 shipped (reverse-sync source_commit + full-scan) (#721) | - |
| `2aeb86e` | 2026-06-15 | feat(f11): reverse-sync exemption for BRANCH_ISOLATION_HISTORICAL advisory (#722 | - |
| `e8af862` | 2026-06-15 | chore(design-system): disable Code Connect bridge (Pro-plan-gated) + reconcile d | - |
| `5c90ab3` | 2026-06-15 | security: untrack .vercel/ (leaked GitHub PAT) + incident note (#727) | - |
| `0c93e7b` | 2026-06-15 | fix(training): invalidate rest timer on disappear (1Hz timer leak) (#730) | - |
| `79c091a` | 2026-06-15 | docs(audit): spec the 3 build/review-gated fixes from the 2026-06-15 audit (#734 | - |
| `e8e469b` | 2026-06-15 | chore: post-merge closure for f11/f12/f10+f5 (implementation→complete) (#728) | - |
| `4cf58d0` | 2026-06-15 | docs: truth-up stale counts, version labels, line-refs, docket math (#729) | - |
| `297d23e` | 2026-06-15 | chore(ai-engine): document confidence-formula contract + drop dead totals param  | - |
| `f8f80b3` | 2026-06-15 | fix(backend): enforce k-anonymity floor in cohort_stats RLS (DB-layer) (#732) | - |
| `dbfd610` | 2026-06-15 | chore(fitme-story-dual-audience-redesign): salvage #214 ref + merge_note from su | - |
| `1bf0fa5` | 2026-06-15 | docs(ai-engine): document on-device Tier 3 (3a real PR #724, 3b PCC flag-gated)  | - |
| `ee5d5bf` | 2026-06-15 | feat(foundation-models-tier3): on-device Foundation Models Tier 3a + PCC escalat | - |
| `197cb0a` | 2026-06-15 | docs: refresh living docs to v7.10 (dev-guide, evolution, architecture, +4) (#73 | - |
| `c5997d3` | 2026-06-16 | fix(ci): bot ledger workflows push direct to main (W37 docs-quirk fix, option B) | - |
| `22bcf0f` | 2026-06-16 | chore(shared): refresh source-health ledgers from 2026-06-15 live probe (#739) | - |
| `e5b1f7c` | 2026-06-16 | chore(deps): Bump tar from 7.5.13 to 7.5.16 in /dashboard (#738) | - |
| `09c45da` | 2026-06-16 | chore(deps): Bump js-yaml from 4.1.1 to 4.2.0 in /website (#737) | - |
| `6939780` | 2026-06-16 | feat(framework): F4 FRAMEWORK_VERSION_STALE advisory gate (v8.x docket Theme C)  | - |
| `5f85fa8` | 2026-06-16 | chore(integrity): cycle snapshot 2026-06-16T05-57-42Z (#741) | - |
| `f4c63e8` | 2026-06-16 | chore(framework-status): weekly snapshot 2026-06-15 (#716) | - |
| `887a73c` | 2026-06-16 | feat(ucc): FT2 state-bundle producer for control-room live feed (Phase 2 PR D) ( | - |
| `7260dbc` | 2026-06-16 | docs(observed-patterns): W37 — add verified manual unblock recipe (update-branch | - |
| `906cfc3` | 2026-06-16 | docs(v8.x): reconcile F4 FRAMEWORK_VERSION_STALE shipped state across docket sou | - |
| `2602596` | 2026-06-16 | chore(ucc-auth): daily sync of audit log (20260616) (#746) | - |
| `2daa6ad` | 2026-06-16 | chore(ledgers): session snapshot updates — adoption + debt + checkpoint (2026-06 | - |
| `a7073fa` | 2026-06-16 | chore(integrity): daily checkpoint row 2026-06-16 (regression=false) (#748) | - |
| `bdae662` | 2026-06-16 | fix(f17): union-merge gate index with committed; restore 8→26 gates (#745 regres | - |
| `b9f3d92` | 2026-06-16 | docs(observed-patterns): add #25 — derived index from gitignored source must uni | - |
| `a0c1674` | 2026-06-16 | docs(case-study): control-room live feed enhancement (build-time snapshot → fail | - |
| `b386519` | 2026-06-17 | feat(f1): STATE_TASKS_FILESYSTEM_DRIFT cycle-time advisory (v8.x docket Theme A) | - |
| `0de75c2` | 2026-06-17 | feat(f3): DEPENDENCY_GRAPH_CYCLE cycle-time advisory (v8.x docket Theme A) (#753 | - |
| `f8622f9` | 2026-06-17 | chore(refresh): reconcile f1/f3/f4 shipped state + refresh all ledgers (2026-06- | - |
| `0178b5d` | 2026-06-17 | docs(framework-facts): reconcile to 2026-06-17 — 113 features, 28 gates (#755) | - |
| `1fa1523` | 2026-06-17 | chore(state): backfill tasks[] on 5 f1-flagged complete features (#756) | - |
| `29b094b` | 2026-06-17 | chore(telemetry): recover 2026-06-12 + 06-13 adoption-history snapshots (#757) | - |
| `728d85b` | 2026-06-17 | docs(case-studies): data-integrity remediation — kill_criteria_resolution, tier- | - |
| `496df8f` | 2026-06-17 | fix(integrity): emit cycle-coverage for 4 silent advisories + silence 3 historic | - |
| `b0a67f9` | 2026-06-17 | chore(a11y): Dynamic Type scaling for fixed-point fonts + CTA min-height (#761) | - |
| `20c4e0d` | 2026-06-17 | feat(android): real, drift-gated token pipeline (AND-1) (#762) | - |
| `e9fa4ab` | 2026-06-17 | chore(a11y): VoiceOver label gaps on 5 onboarding/settings v2 surfaces (#760) | - |
| `f24c9f6` | 2026-06-18 | chore(deps): Bump astro from 6.1.10 to 6.4.8 in /website (#763) | - |
| `605edaa` | 2026-06-18 | chore(f16): enforce try-repo harness (advisory→enforced, 1d early) (#764) | - |
| `c5ee5ad` | 2026-06-18 | docs(framework): reconcile canonical versions.json to v7.10 + v8.x (syncs to fit | - |
| `3af31b3` | 2026-06-18 | feat(figma-design-architecture): mirror audit + per-surface arch docs + Gap D go | - |
| `7b68a32` | 2026-06-18 | chore(ledger): 2026-06-18 daily integrity checkpoint snapshot (#766) | - |
| `ea796bd` | 2026-06-18 | chore(figma-design-architecture): close out — review→complete (PR #767 + fitme-s | - |
| `ed72e82` | 2026-06-18 | chore(foundation-models-tier3): close out — state implementation→complete (PR #7 | - |
| `ee89363` | 2026-06-18 | ci(contract-fixtures): weekly drift-only check cron (operator decision D2) (#770 | - |
| `36b7cfc` | 2026-06-18 | docs(3d-universe): record Phase 4 operator decisions (2026-06-18) (#771) | - |
| `9ced362` | 2026-06-18 | chore(integrity): clear 2 advisories — W38 pattern-skill map + android-token-pip | - |
| `7786ad8` | 2026-06-19 | docs(observed-patterns): add W39 — major-version Dependabot bump churns as close | - |
| `489978e` | 2026-06-19 | chore(integrity): fix branch-dependent isolation test + reconcile backlog drift  | - |
| `a35d9dd` | 2026-06-20 | chore(w9): reconcile calibration date 06-20 → 06-28 across plans (#778) | - |
| `1d1e2e9` | 2026-06-20 | chore(ucc-auth): daily sync of audit log (20260619) (#776) | - |
| `6ac372b` | 2026-06-21 | chore(t14): promote PLATFORMS_TESTED advisory→enforced (B15 calibration) (#781) | - |
| `bff2f0c` | 2026-06-21 | chore(t14): reconcile B15 cadence ledger + daily telemetry post-PLATFORMS_TESTED | - |
| `80e85b2` | 2026-06-21 | docs(t14): reconcile all FT2 docs to PLATFORMS_TESTED enforced + close t14 featu | - |
| `cc137d4` | 2026-06-21 | chore(ledger): 2026-06-21 daily digest — measurement-adoption + doc-debt snapsho | - |
| `289d5e2` | 2026-06-21 | chore(state): record case_study_showcase for foundation-models-tier3 + fix t14 p | - |
| `0118cec` | 2026-06-21 | chore(state): reconcile case_study_showcase fields for 13 newly-published showca | - |
| `98b51a4` | 2026-06-22 | chore(figma-design-architecture): post-merge closure — backfill cache_hits[] (#7 | - |
| `9809179` | 2026-06-22 | chore(deps): patch high+moderate npm vulns in dashboard + website (non-breaking) | - |
| `2cb09a9` | 2026-06-22 | chore(contracts): re-sample stale gate-coverage + state-json-schema fixtures (#7 | - |
| `ab7e73b` | 2026-06-22 | chore(e-15): close contract-fixture-consumer-adoption + case study (#795) | - |
| `11af21b` | 2026-06-22 | docs(framework-facts): reconcile feature count 115→116 (E-15 added) (#796) | - |
| `d1ea163` | 2026-06-22 | chore(deps)(deps-dev): Bump style-dictionary (#793) | - |
| `bc4a00f` | 2026-06-22 | chore(ci)(deps): Bump actions/checkout from 4 to 7 (#792) | - |
| `fe81e6f` | 2026-06-22 | chore(ci)(deps): Bump actions/setup-node from 4 to 6 (#794) | - |
| `3ddc828` | 2026-06-22 | chore(integrity): cycle snapshot 2026-06-22T05-57-39Z (#788) | - |
| `a54d0f7` | 2026-06-22 | chore(framework-status): weekly snapshot 2026-06-22 (#797) | - |
| `d883954` | 2026-06-22 | chore(ledger): 2026-06-22 daily digest — regenerated at 116 features (#791) | - |
| `cfb9960` | 2026-06-24 | feat(funnel-analysis-dashboards): live GA4 funnel analysis + machine-readable de | - |
| `306fcb3` | 2026-06-24 | chore(funnel-analysis-dashboards): close out — state testing→complete (PR #799 m | - |
| `0f33762` | 2026-06-24 | chore(funnel-analysis-dashboards): backfill cu_v2 + impl commit (#802) | - |
| `05f4a32` | 2026-06-24 | chore(ledger): 2026-06-24 daily digest — telemetry + adoption snapshots (#804) | - |
| `45ba8df` | 2026-06-26 | docs(sync): reconcile all living plans to v7.10 / 117 features (2026-06-26) (#80 | - |
| `c294a9c` | 2026-06-26 | feat(f18-mutation-testing): warn-only mutation testing on gate dispatchers (#809 | - |
| `909e919` | 2026-06-26 | docs(sync): reconcile F18 shipped — 117→118 features, docket roll-up 16→17 (#810 | - |
| `dcae1e9` | 2026-06-27 | chore(figma-design-architecture): clear stale resume_notes on closed feature (#8 | - |
| `0d2bea8` | 2026-06-27 | chore(integrity): cycle snapshot 2026-06-25T05-27-34Z (#805) | - |
| `7dfddda` | 2026-06-27 | chore(ledger): 2026-06-25 daily digest — telemetry + adoption snapshots (#806) | - |
| `634cf48` | 2026-06-27 | chore(ledger): 2026-06-26 daily digest — telemetry + adoption snapshots (#807) | - |
| `94a54a6` | 2026-06-28 | chore(ledger): 2026-06-27 daily digest — telemetry + adoption snapshots (#811) | - |
| `292dc54` | 2026-06-28 | chore(ledger): 2026-06-28 daily digest — telemetry + adoption snapshots (#813) | - |
| `748b7d7` | 2026-06-28 | docs(w9): record T+14d concurrency calibration decision — HOLD at advisory (#814 | - |
| `893eeac` | 2026-06-29 | chore(integrity): cycle snapshot 2026-06-28T05-36-25Z (#812) | - |
| `1a94f71` | 2026-06-29 | chore(framework-status): weekly snapshot 2026-06-29 (#815) | - |
| `d4e8af5` | 2026-06-29 | docs(FW-NAMING): apply cross-layer naming convention to all master/sub plans (#8 | - |
| `0a86831` | 2026-06-29 | feat(FW-NAMING): cross-layer item naming convention + crosswalk registry (#817) | - |
| `35b173d` | 2026-06-29 | feat(DE-R18): state.json schema_version + migration runner (FIT-184) (#819) | - |
| `a7e44dd` | 2026-06-29 | chore(FW-NAMING): backfill linear_id + thematic_codes on 23 features (FIT-200) ( | - |
| `cfdfb7c` | 2026-06-29 | docs(observed-patterns): add W40 — cross-layer tracker lag / stale-open (#821) | - |
| `ea86776` | 2026-06-29 | feat(AN-1B.1): CSV_TAXONOMY_DRIFT write-time gate (advisory) + Phase A artifacts | - |
| `684fe97` | 2026-06-29 | chore(cadence): add B16 — AN-1B.1 CSV_TAXONOMY_DRIFT advisory→enforced review (~ | - |
| `771e241` | 2026-06-29 | perf(DE-R14): parallelize integrity-check first-commit-date lookups (FIT-180) (# | - |
| `4c9156d` | 2026-06-29 | feat(AN-1B.2): GA4_MCP_DISCONNECTED advisory-only connectivity gate (FIT-146) (# | - |
| `715277a` | 2026-06-29 | chore(AN-1B.1): B16 burndown — add 27 taxonomy rows, CSV_TAXONOMY_DRIFT drift 27 | - |
| `df4a0a9` | 2026-06-29 | docs(sync): reconcile canonical docs to 2026-06-29 state (32 gates, 121 features | - |
| `d469293` | 2026-06-30 | chore(FIT-200): backfill 29 linear_id joins + fix 10 platforms_tested anomalies  | - |
| `f21cd79` | 2026-07-01 | chore: reconcile 3 drifted-state feature closures + track Supabase advisor SQL ( | - |
| `8c65993` | 2026-07-01 | feat(R10): cloud daily-checkpoint integrity alert (launchd -> GHA) (#831) | - |
| `be8a9a9` | 2026-07-02 | docs(w40): reconcile 2 stale-open rows in v8-x build docket (#832) | - |
| `7007d1e` | 2026-07-02 | chore(integrity): cycle snapshot 2026-07-01T05-39-35Z (#829) | - |
| `cb3e0cf` | 2026-07-02 | chore(digest): daily cycle ledger updates 2026-07-02 (#834) | - |
| `afcd03d` | 2026-07-02 | chore(TC-T16): machine-derived gate catalog (stage + test-tier annotation) (#835 | - |
| `ed31934` | 2026-07-02 | chore(FIT-181): pre-commit hook latency profiler (P50/P95 vs budget) (#836) | - |
| `86f4078` | 2026-07-02 | chore(FIT-185): weekly digest A5 — silent-gate candidates enrichment (#837) | - |
| `964178b` | 2026-07-03 | chore: batch-flip 3 shipped framework chores implement→complete (FIT-164/181/185 | - |
| `ae66dce` | 2026-07-03 | chore(FIT-156): FT2 state closure for T8 web WebAuthn route-handler tests (#839) | - |
| `8581466` | 2026-07-03 | chore(FIT-155): FT2 state closure for T7 web critical-route smoke tests (#841) | - |
| `28ffffc` | 2026-07-03 | feat(FIT-163): orphan-test + untested-symbol scanner + weekly cron (T15, advisor | - |
| `27efaaa` | 2026-07-04 | feat(FIT-152): Swift snapshot-testing foundation (T4, record-in-CI) (#843) | - |
| `87a5241` | 2026-07-04 | feat(FIT-183): FT2 daily-checkpoint probe for cross-repo state-sync health (R17) | - |
| `70af917` | 2026-07-04 | test(FIT-157): EncryptionService concurrency + payload chaos tests (T9 foundatio | - |
| `be1b623` | 2026-07-04 | docs: reconcile canonical docs to 2026-07-04 test-coverage batch (130 features,  | - |
| `bc6be87` | 2026-07-05 | chore(integrity): cycle snapshot 2026-07-04T05-20-33Z (#845) | - |
| `0fa09fb` | 2026-07-05 | chore(digest): append 2026-07-03 cycle snapshots from daily digest run (#840) | - |
| `da972d6` | 2026-07-05 | chore(digest): append 2026-07-04 cycle snapshots from daily digest run (#847) | - |
| `05d92d0` | 2026-07-05 | docs(R9): 30-day coverage read baseline for GATE_TEST_MISSING calibration (#849) | - |
| `fa4ac59` | 2026-07-08 | chore(ci)(deps): Bump actions/checkout from 5 to 7 (#851) | - |
| `8a93757` | 2026-07-08 | docs(plan): next-session advanceable-items overlay (reconciled vs #849; F4 done) | - |
| `32d45fa` | 2026-07-08 | chore(f4): promote FRAMEWORK_VERSION_STALE advisory→enforced (cadence F4) (#858) | - |
| `8b5b338` | 2026-07-08 | feat(e3): surface UCC auth-lockout activity in the weekly digest (OQ-4) (#859) | - |
| `1d98cb5` | 2026-07-08 | chore(framework-status): weekly snapshot 2026-07-06 (#852) | - |
| `3894677` | 2026-07-08 | docs: declare internal storage canonical; SSD becomes build drive (post-corrupti | - |
| `58050e2` | 2026-07-09 | chore(integrity): DI-Q2 forensic snapshot + FIT-206 off-SSD backup verification  | - |
| `4e1e45b` | 2026-07-09 | fix: FIT-210 scheduler wiring to v2 store + D-3 screen-view residuals (#863) | - |
| `161196f` | 2026-07-09 | feat(gate): T12/FIT-160 — SCHEMA_DIFF advisory gate (Supabase↔iOS column drift)  | - |
| `3c424a5` | 2026-07-09 | chore(digest): append 2026-07-09 cycle snapshots from daily digest run (#861) | - |
| `647eef6` | 2026-07-09 | chore(cadence): register B17 — SCHEMA_DIFF (T12) advisory→enforced review ~2026- | - |
| `bf9d1d7` | 2026-07-10 | docs(freshness): reconcile living docs to v7.10 / 130 features / 32-34 gates + l | - |
| `4d962d9` | 2026-07-10 | chore(config): repoint stale SSD source paths to internal storage after migratio | - |
| `c14dd99` | 2026-07-10 | feat(N6): quarterly Data Freshness Audit tooling (§3.5.3) + park 3D diagram (#86 | - |

## Active feature logs at snapshot time

- `.claude/logs/3d-interactive-framework-flow-diagram.log.json`
- `.claude/logs/adaptive-intelligence-next-pass.log.json`
- `.claude/logs/ai-golden-set-evals.log.json`
- `.claude/logs/ai-user-feedback-loop.log.json`
- `.claude/logs/an-1b1-csv-taxonomy-drift.log.json`
- `.claude/logs/an-1b2-ga4-mcp-disconnected.log.json`
- `.claude/logs/analytics-observability.log.json`
- `.claude/logs/android-token-pipeline.log.json`
- `.claude/logs/app-store-assets.log.json`
- `.claude/logs/audit-1-corrections.log.json`
- `.claude/logs/auth-polish-v2.log.json`
- `.claude/logs/case-study-comparison-table.log.json`
- `.claude/logs/case-study-presentation.log.json`
- `.claude/logs/code-connect-automation.log.json`
- `.claude/logs/contract-fixture-consumer-adoption.log.json`
- `.claude/logs/cross-repo-state-sync-impl.log.json`
- `.claude/logs/data-integrity-framework-v7-6.log.json`
- `.claude/logs/de-r14-integrity-parallel.log.json`
- `.claude/logs/dev-env-r11-r13-r14-r17-r18-batch.log.json`
- `.claude/logs/exercise-search-filter.log.json`
- `.claude/logs/f-deployed-url-probe-ft2.log.json`
- `.claude/logs/f-launchd-drift-extension.log.json`
- `.claude/logs/f-launchd-drift-extension-sub-a.log.json`
- `.claude/logs/f-phase-e-adoption-freeze-discipline.log.json`
- `.claude/logs/f1-state-tasks-filesystem-drift.log.json`
- `.claude/logs/f11-reverse-sync-historical-exempt.log.json`
- `.claude/logs/f12-actionlint-gate.log.json`
- `.claude/logs/f16-try-repo-harness.log.json`
- `.claude/logs/f17-last-fired-at-index.log.json`
- `.claude/logs/f18-mutation-testing.log.json`
- `.claude/logs/f2-phase-0-reality-check.log.json`
- `.claude/logs/f3-dependency-graph-cycle-check.log.json`
- `.claude/logs/f4-framework-version-stale.log.json`
- `.claude/logs/figma-design-architecture.log.json`
- `.claude/logs/fitme-story-design-system-p2-cleanup.log.json`
- `.claude/logs/fitme-story-ds-p2-deferred.log.json`
- `.claude/logs/fitme-story-ds-p2-final-sweep.log.json`
- `.claude/logs/fitme-story-dual-audience-redesign.log.json`
- `.claude/logs/fitme-story-public-enhancements.log.json`
- `.claude/logs/fitme-story-website-design-system.log.json`
- `.claude/logs/foundation-models-tier3.log.json`
- `.claude/logs/framework-f14-f15-dispatch-test-coverage.log.json`
- `.claude/logs/framework-honesty-fixes-2026-05-01.log.json`
- `.claude/logs/framework-story-site.log.json`
- `.claude/logs/framework-v5-0-soc.log.json`
- `.claude/logs/framework-v7-1-integrity-cycle.log.json`
- `.claude/logs/framework-v7-5-data-integrity.log.json`
- `.claude/logs/framework-v7-7-validity-closure.log.json`
- `.claude/logs/framework-v7-8-branch-isolation.log.json`
- `.claude/logs/framework-v7-8-bridge.log.json`
- `.claude/logs/framework-v7-9-1-promotion.log.json`
- `.claude/logs/framework-v7-9-promotion.log.json`
- `.claude/logs/framework-w30-w31-w32-durable-fixes.log.json`
- `.claude/logs/funnel-analysis-dashboards.log.json`
- `.claude/logs/garmin-health-connection.log.json`
- `.claude/logs/hadf-phase2-cloud-fingerprinting.log.json`
- `.claude/logs/hadf-phase2bis-replication.log.json`
- `.claude/logs/hadf-phase3a-sensing.log.json`
- `.claude/logs/hadf-signature-expansion.log.json`
- `.claude/logs/import-training-plan.log.json`
- `.claude/logs/ios-code-connect.log.json`
- `.claude/logs/ios-ui-audit-p1-burndown.log.json`
- `.claude/logs/ios-ui-audit-p1-drift-cleanup.log.json`
- `.claude/logs/meta-analysis-audit.log.json`
- `.claude/logs/meta-analysis-refresh-phase-1.log.json`
- `.claude/logs/n6-data-freshness-audit.log.json`
- `.claude/logs/onboarding-v2-retroactive.log.json`
- `.claude/logs/orchid-v1-5.log.json`
- `.claude/logs/precommit-hook-latency-profiling.log.json`
- `.claude/logs/push-notifications.log.json`
- `.claude/logs/r17-state-sync-health-endpoint.log.json`
- `.claude/logs/r9-track-b-coverage-aggregator.log.json`
- `.claude/logs/readiness-aware-training-alert.log.json`
- `.claude/logs/roadmap-stress-test-2026-05-07.log.json`
- `.claude/logs/smart-reminders-behavioral-learning.log.json`
- `.claude/logs/staging-auth-runtime.log.json`
- `.claude/logs/stats-v2.log.json`
- `.claude/logs/t13-last-failed-at-index.log.json`
- `.claude/logs/t14-platform-parity-state-field.log.json`
- `.claude/logs/t15-orphan-test-weekly-cron.log.json`
- `.claude/logs/t16-gate-test-tier-annotation.log.json`
- `.claude/logs/t3-signinservice-passkey-tests.log.json`
- `.claude/logs/t4-ios-snapshot-testing.log.json`
- `.claude/logs/t5-mock-protocol-drift.log.json`
- `.claude/logs/t7-web-critical-route-smoke-tests.log.json`
- `.claude/logs/t8-web-webauthn-route-handler-tests.log.json`
- `.claude/logs/t9-backend-chaos-tests.log.json`
- `.claude/logs/training-program-customization.log.json`
- `.claude/logs/trend-alerts-hrv.log.json`
- `.claude/logs/ucc-passkey-auth.log.json`
- `.claude/logs/ucc-passkey-auth-audit-log-redis-fix.log.json`
- `.claude/logs/ucc-passkey-auth-security-hardening.log.json`
- `.claude/logs/ucc-sign-in-figma-mapping.log.json`
- `.claude/logs/ui-audit-baseline-burndown.log.json`
- `.claude/logs/ui-ux-final-sweep-2026-05-12.log.json`
- `.claude/logs/unified-control-center.log.json`
- `.claude/logs/v8-f10-f5-schema-vocab.log.json`
- `.claude/logs/w9-drift-triggered-auto-isolation.log.json`
- `.claude/logs/weekly-digest-silent-gate-enrichment.log.json`

---

Regenerate: `python3 scripts/v7-5-advancement-report.py`
Change-log events in corpus: 33
