import Link from 'next/link';

interface Milestone {
  version: string;
  date: string;
  headline: string;
  what: string;
  caseStudyHref: string;
  tintVar: string;   // var(--skill-xxx) to tint the milestone chip
}

const MILESTONES: Milestone[] = [
  {
    version: 'v1.0',
    date: '2026-04-02',
    headline: 'Monolithic /pm-workflow',
    what: 'A single skill did everything inline — research, PRD, UX, code review, testing, docs. The ecosystem was one very large file.',
    caseStudyHref: '/case-studies/onboarding-pilot',
    tintVar: 'var(--skill-pm-workflow)',
  },
  {
    version: 'v2.0',
    date: '2026-04-07',
    headline: '/ux splits from /design',
    what: 'First spoke extracted. /ux owns what & why; /design owns how it looks. Signal that the monolith could decompose.',
    caseStudyHref: '/case-studies/onboarding-pilot',
    tintVar: 'var(--skill-ux)',
  },
  {
    version: 'v4.3',
    date: '2026-04-11',
    headline: 'Hub-and-spoke topology formalized',
    what: '6 refactors validated the pattern. 6.5× measured speedup vs. the monolith. 12 skills in the topology (as of 2026-05-14 +/brainstorm-pm).',
    caseStudyHref: '/case-studies/framework-evolution',
    tintVar: 'var(--color-brand-indigo)',
  },
  {
    version: 'v5.0',
    date: '2026-04-14',
    headline: 'SoC-on-software',
    what: 'Skill-on-demand loading + cache compression. ~54K context tokens reclaimed. Chip architecture principles applied to software.',
    caseStudyHref: '/case-studies/soc-on-software',
    tintVar: 'var(--skill-research)',
  },
  {
    version: 'v5.2',
    date: '2026-04-16',
    headline: 'Dispatch intelligence + write safety',
    what: '3-stage pre-flight: complexity scoring → model routing → tool budgets. Snapshot/rollback + mirror pattern for parallel writes.',
    caseStudyHref: '/case-studies/dispatch-intelligence',
    tintVar: 'var(--skill-qa)',
  },
  {
    version: 'v7.0',
    date: '2026-04-16',
    headline: 'V7.0 HADF — hardware-aware dispatch',
    what: '17 chip profiles + 7 cloud signatures. Mahalanobis fingerprinting picks the right model tier for the detected environment.',
    caseStudyHref: '/case-studies/hadf',
    tintVar: 'var(--skill-analytics)',
  },
  {
    version: 'v7.5',
    date: '2026-04-24',
    headline: 'V7.5 — Data Integrity Framework',
    what: 'Gemini-audit response. Pre-commit PR-number verification, contemporaneous logging (5 live), measurement-adoption ledger. Exposed that cache_hits was 0 of 40 across the corpus — filed honestly as issue #140.',
    caseStudyHref: '/trust',
    tintVar: 'var(--skill-ops)',
  },
  {
    version: 'v4.X (skill)',
    date: '2026-05-06',
    headline: 'V4.X — UX/Design preflight + auto Figma build + pre-merge UI review',
    what: '4 new sub-commands (/ux preflight, /ux pre-merge-review, /design preflight, /design pre-merge-review) + /design build auto-dispatch with Figma node ID write-back. Phase 3 chain extends 7→11 steps; Phase 6 chain 4→5 steps. Phase 7 BLOCKED unless both pre-merge reviews pass. Trigger: import-training-plan resume audit caught 4 P0 spec errors before any code was written.',
    caseStudyHref: '/case-studies/import-training-plan',
    tintVar: 'var(--skill-ux)',
  },
  {
    version: 'v4.X + CC',
    date: '2026-05-09',
    headline: 'Cross-repo Figma Code Connect',
    what: 'Figma library frames now map to React components (web, file fsjHfFLAHELACZHku8Rfcl) AND SwiftUI Views (iOS, file 0Ai7s3fCFqR5JXDW8JvgmD) via .figma.tsx + .figma.swift template files. Build-safety wrapper (#if canImport(Figma) on iOS, parser-excluded tsx on web) keeps everything compiling without the toolchain. Companion scaffold scripts auto-generate mapping files from state.json::figma_node_ids. Planned: /design build auto-invokes scaffold (Layer B); CI publish on merge (Layer C). Closes the design↔code loop in both directions.',
    caseStudyHref: '/case-studies/import-training-plan',
    tintVar: 'var(--skill-design)',
  },
  {
    version: 'v7.9',
    date: '2026-05-21',
    headline: 'Promotion Release — 3 gates flip to enforced',
    what: 'Single-line change at scripts/check-state-schema.py:132 (BRANCH_ISOLATION_ADVISORY_MODE = True → False) promotes 3 v7.8.1 advisory gates to enforced simultaneously: BRANCH_ISOLATION_VIOLATION Mode B + Mode C + FEATURE_CLOSURE_COMPLETENESS. All 4 §2.2 promotion criteria met after 14-day Mechanism A telemetry calibration (18 + 13 + 13 firings, 0 zero-candidate). First real-world Mode C gate fire caught + resolved same-session. 37 mechanical gates + 5 advisories post-promotion. Phase E validation soak 2026-05-21 → 06-04 PASSED (16 gates with telemetry, 0 GATE_COVERAGE_ZERO, 0 data regressions); v7.9.1 build window open. Honesty ledger entry FT2-FH-003 codifies the calibration discipline.',
    caseStudyHref: '/case-studies/framework-v7-9-promotion',
    tintVar: 'var(--skill-ops)',
  },
  {
    version: 'v7.10',
    date: '2026-06-10',
    headline: 'GATE_COVERAGE_ZERO observability + field-rename closure',
    caseStudyHref: '/case-studies/framework-v7-9-1-promotion',
    what: 'Hardens the observability of the gates themselves. GATE_COVERAGE_ZERO gains a 0-candidate mis-wire detector (a gate registered in the F17 index with candidates==checked==skipped==0 runs but never reaches a candidate — the cache_hits-keying / unreachable-loop class), and three cycle-time checks (BROKEN_PR_CITATION / CASE_STUDY_MISSING_TIER_TAGS / PATTERN_SKILL_UNMAPPED) that previously emitted no Mechanism A coverage now emit mode="cycle" so the meta-check can watch them. Observed-patterns #24 codifies the field-rename silent-pass in a READER/INDEX — two instances fixed: cu_v2 (top-level vs legacy complexity.cu_version, halving adoption; post-v6 fully-adopted 3→6) and w9.auto_isolate (ts vs timestamp, 30 rows dropped). Plus a second what-if self-test across every layer (iOS build + 672 tests, ai-engine 34/34, web 286/289, framework 0 findings) that fixed verify-local dep-skip ergonomics, and T10 — the AI golden-set eval harness (the FitMe AI is deterministic, not generative, so a deterministic golden set is a hard PR gate: 24 cases, ai-engine suite 60 pass).',
    tintVar: 'var(--skill-ops)',
  },
  {
    version: 'v8.x build window',
    date: '2026-06-17',
    headline: 'v8.x build window — F16 enforced + roadmap-realism gates',
    what: 'The v8.x build window opened once the kickoff gate cleared. F16, the try-repo pre-commit harness (the 3rd gate-test layer that spawns a throwaway git repo and runs the real pre-commit hook via subprocess), was promoted advisory→enforced one day early — not via a code flag but by adding the try-repo-harness CI job to main\'s required status checks via gh api branch protection (an integration-test gate at the CI layer). Calibration: K2 false-positive rate 0% over 60 CI runs / 13 days, so a gate\'s integration surface can no longer regress silently into main. Three v8.x ready-now roadmap-realism advisory gates shipped alongside: F4 FRAMEWORK_VERSION_STALE (write-time advisory, PR #740, fires when a feature is advanced while its framework_version is older than canonical — detection only, advisory→enforced ~2026-06-30), F1 STATE_TASKS_FILESYSTEM_DRIFT (cycle-time advisory-permanent, PR #752), and F3 DEPENDENCY_GRAPH_CYCLE (cycle-time advisory-permanent, PR #753). T14 PLATFORMS_TESTED was promoted advisory→enforced 2026-06-21 (PR #781), joining F16 (enforced 2026-06-17). Canonical counts: 115 features tracked, 28 instrumented gates (17 write-time emitting + 9 cycle-time + 2 W9 hooks; F4 is an 18th write-time gate, advisory).',
    caseStudyHref: '/case-studies/framework-v7-9-1-promotion',
    tintVar: 'var(--skill-ops)',
  },
];

export function EvolutionStrip() {
  return (
    <div className="my-8 overflow-x-auto pb-4" aria-label="Evolution of the skill ecosystem">
      <ol className="flex gap-4 min-w-min">
        {MILESTONES.map((m) => (
          <li key={m.version} className="min-w-[260px] max-w-[300px] shrink-0">
            <Link
              href={m.caseStudyHref}
              className="block group rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-4 hover:border-[var(--color-brand-indigo)] hover:shadow-md transition-all bg-white dark:bg-[var(--color-neutral-900)]"
              style={{ borderTop: `4px solid ${m.tintVar}` }}
            >
              <div className="font-sans text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">
                {m.version} · {m.date}
              </div>
              <div className="mt-1 font-serif text-base leading-tight group-hover:text-[var(--color-brand-indigo)]">
                {m.headline}
              </div>
              <p className="mt-2 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                {m.what}
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
