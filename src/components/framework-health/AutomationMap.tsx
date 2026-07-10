/**
 * AutomationMap — T23
 * Static lookup table of the framework's instrumented gates as of v7.10.
 * 21 write-time (pre-commit; incl. F4 FRAMEWORK_VERSION_STALE enforced 2026-07-08,
 * SCHEMA_DIFF + CSV_TAXONOMY_DRIFT + GA4_MCP_DISCONNECTED) +
 * 9 cycle-time (72h CI) + 2 W9 real-time hooks = 32 instrumented gates (34 live).
 * Source of truth: FitTracker2 docs/FRAMEWORK-FACTS.md (reconciled 2026-07-10).
 */

interface CheckCode {
  code: string;
  shipped_in: string;
  description: string;
}

const WRITE_TIME_CODES: CheckCode[] = [
  {
    code: 'SCHEMA_DRIFT_LEGACY_PHASE',
    shipped_in: 'v7.5',
    description: 'Rejects legacy phase key; canonical is current_phase.',
  },
  {
    code: 'SCHEMA_DRIFT_LEGACY_CREATED',
    shipped_in: 'v7.8',
    description: 'Rejects legacy created key; canonical is created_at.',
  },
  {
    code: 'PR_NUMBER_UNRESOLVED',
    shipped_in: 'v7.5',
    description: 'Verifies phases.merge.pr_number against cached gh pr list result.',
  },
  {
    code: 'PHASE_TRANSITION_NO_LOG',
    shipped_in: 'v7.6',
    description: 'Rejects current_phase change without a feature log event in last 15 min.',
  },
  {
    code: 'PHASE_TRANSITION_NO_TIMING',
    shipped_in: 'v7.6',
    description: 'Rejects current_phase change without timing.phases.<new_phase>.started_at.',
  },
  {
    code: 'CU_V2_INVALID',
    shipped_in: 'v7.7',
    description: 'Rejects cu_v2 entries with factor outside valid range or missing required fields.',
  },
  {
    code: 'STATE_NO_CASE_STUDY_LINK',
    shipped_in: 'v7.7',
    description: 'Rejects complete-phase state.json transitions without a case_study field.',
  },
  {
    code: 'CACHE_HITS_AUTO_INSTRUMENTATION_DRIFT',
    shipped_in: 'v7.8.3',
    description: 'Enforced — flags features where session Read events exist but state.json::cache_hits[] is empty.',
  },
  {
    code: 'BRANCH_ISOLATION_VIOLATION',
    shipped_in: 'v7.8.1 (enforced v7.9)',
    description: 'Mode B — fires on every commit when staged files match infra-path globs.',
  },
  {
    code: 'BRANCH_ISOLATION_VIOLATION_MODE_C',
    shipped_in: 'v7.8.1 (enforced v7.9)',
    description: 'Mode C — fires on state.json::current_phase mutations from a non-feature branch.',
  },
  {
    code: 'FEATURE_CLOSURE_COMPLETENESS',
    shipped_in: 'v7.8.1 (enforced v7.9)',
    description: 'Fires on current_phase=complete — validates 7 case-study frontmatter fields + Q6/Q7 parity.',
  },
  {
    code: 'ISOLATION_OPT_OUT_REASON_MISSING',
    shipped_in: 'v7.8.1',
    description: 'When isolation_opt_out=true, isolation_opt_out_reason must be non-empty.',
  },
  {
    code: 'STATE_OWNER_MISSING',
    shipped_in: 'v7.8.3',
    description: 'Required top-level state_owner enum field ({ft2, fitme-story}).',
  },
  {
    code: 'STATE_OWNER_INVALID',
    shipped_in: 'v7.8.3',
    description: 'state_owner must be a member of the valid enum.',
  },
  {
    code: 'STATE_OWNER_LOCATION_MISMATCH',
    shipped_in: 'v7.8.3',
    description: 'state.json file location must match its declared state_owner (reverse-sync exempt).',
  },
  {
    code: 'FRAMEWORK_VERSION_FORMAT',
    shipped_in: 'v7.8',
    description: 'framework_version must be canonical vX.Y form.',
  },
  {
    code: 'PLATFORMS_TESTED',
    shipped_in: 'T14 (enforced 2026-06-21, PR #781)',
    description: 'Fires on current_phase=complete when no platforms_tested key is true; validates field shape.',
  },
  {
    code: 'FRAMEWORK_VERSION_STALE',
    shipped_in: 'F4 v8.x (enforced 2026-07-08, PR #858)',
    description: 'Detects stale framework_version on phase-advance. Promoted advisory→enforced after 8 emission days / 40 fires / 0 false positives.',
  },
  {
    code: 'CSV_TAXONOMY_DRIFT',
    shipped_in: 'AN-1B.1 (advisory, PR #822)',
    description: 'Fires when AnalyticsProvider.swift is staged + an AnalyticsEvent value has no analytics-taxonomy.csv row. Advisory→enforced review ~2026-07-13.',
  },
  {
    code: 'GA4_MCP_DISCONNECTED',
    shipped_in: 'AN-1B.2 (advisory-only, PR #825)',
    description: 'Advisory-ONLY by design — fires when analytics-affecting code is staged + GA4 MCP unreachable via env. Never blocks.',
  },
  {
    code: 'SCHEMA_DIFF',
    shipped_in: 'T12/FIT-160 (advisory, PR #862)',
    description: 'Supabase↔iOS synced-table column drift (sync_records, cardio_assets, cohort_stats). 34th live gate, shipped 2026-07-09.',
  },
];

const CYCLE_GATING_CODES: CheckCode[] = [
  {
    code: 'BROKEN_PR_CITATION',
    shipped_in: 'v7.6',
    description: 'Flags case-study PR # / pull/N citations that do not resolve in the cached gh pr list result.',
  },
  {
    code: 'CASE_STUDY_MISSING_TIER_TAGS',
    shipped_in: 'v7.6',
    description: 'Flags post-2026-04-21 case studies with no T1/T2/T3 tier tag.',
  },
  {
    code: 'PHASE_LIE',
    shipped_in: 'v7.5',
    description: 'Feature reports complete phase but linked tasks are not done.',
  },
  {
    code: 'PATTERN_SKILL_UNMAPPED',
    shipped_in: 'v7.9.1',
    description: 'Flags Observed-Patterns entries not mapped to a skill in pattern-skill-map.json.',
  },
  {
    code: 'STATE_TASKS_FILESYSTEM_DRIFT',
    shipped_in: 'f1 (2026-06-17, advisory-permanent)',
    description: 'Advisory — state.json tasks reference filesystem paths that drift from on-disk reality.',
  },
  {
    code: 'DEPENDENCY_GRAPH_CYCLE',
    shipped_in: 'f3 (2026-06-17, advisory-permanent)',
    description: 'Advisory — detects cycles in the feature dependency graph.',
  },
];

const CYCLE_ADVISORY_CODES: CheckCode[] = [
  {
    code: 'TIER_TAG_LIKELY_INCORRECT',
    shipped_in: 'v7.7',
    description:
      'Advisory: T1/T2/T3 tag present but heuristically suspicious. Kill criterion 2 fired at baseline — shipped permanently advisory.',
  },
  {
    code: 'CACHE_HITS_AUTO_INSTRUMENTATION_INACTIVE',
    shipped_in: 'v7.8',
    description:
      'Advisory: session events show Reads but state.json::cache_hits[] is empty (auto-instrumentation inactive).',
  },
  {
    code: 'BRANCH_ISOLATION_HISTORICAL',
    shipped_in: 'v7.8.1',
    description:
      'Advisory: forward-only audit for squash-merge + branch-cleanup attribution artifacts.',
  },
];

const W9_HOOK_CODES: CheckCode[] = [
  {
    code: 'w9.auto_isolate',
    shipped_in: 'v7.8.5',
    description: 'PostToolUse:Bash hook — auto-isolation drift detection on infra-path edits.',
  },
  {
    code: 'w9.concurrency',
    shipped_in: 'v7.8.5 (re-keyed 2026-06-14)',
    description: 'PostToolUse:Bash hook — detects concurrent-session branch flips (HEAD drift). Calibration re-eval ~2026-06-28.',
  },
];

const VERSION_COLORS: Record<string, string> = {
  'v7.5': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  'v7.6': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'v7.7': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  'v7.8': 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
};

function CodeRow({ item }: { item: CheckCode }) {
  return (
    <div className="flex gap-3 py-2.5 border-b border-[var(--color-neutral-100)] dark:border-[var(--color-neutral-800)] last:border-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <code className="text-xs font-mono font-semibold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] px-1.5 py-0.5 rounded">
            {item.code}
          </code>
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium font-sans ${
              VERSION_COLORS[item.shipped_in] ?? 'bg-neutral-100 text-neutral-800'
            }`}
          >
            {item.shipped_in}
          </span>
        </div>
        <p className="mt-1 text-xs text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)] font-sans leading-relaxed">
          {item.description}
        </p>
      </div>
    </div>
  );
}

function LayerCard({
  title,
  subtitle,
  count,
  codes,
  accentClass,
}: {
  title: string;
  subtitle: string;
  count: number;
  codes: CheckCode[];
  accentClass: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] overflow-hidden">
      <div className={`px-4 py-3 ${accentClass}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-sans font-semibold text-sm">{title}</h3>
          <span className="font-sans text-xs opacity-80">{count} code{count !== 1 ? 's' : ''}</span>
        </div>
        <p className="text-xs opacity-70 mt-0.5 font-sans">{subtitle}</p>
      </div>
      <div className="px-4 divide-y divide-transparent">
        {codes.map((item) => (
          <CodeRow key={item.code} item={item} />
        ))}
      </div>
    </div>
  );
}

export function AutomationMap() {
  const totalInstrumented =
    WRITE_TIME_CODES.length + CYCLE_GATING_CODES.length + W9_HOOK_CODES.length;
  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-3">
        <LayerCard
          title="Write-time gates"
          subtitle="Fire on git commit (pre-commit hook) — incl. F4 advisory"
          count={WRITE_TIME_CODES.length}
          codes={WRITE_TIME_CODES}
          accentClass="bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-100"
        />
        <LayerCard
          title="Cycle-time checks (72h CI)"
          subtitle="Fire every 72h via GitHub Actions — instrumented gates + advisories"
          count={CYCLE_GATING_CODES.length}
          codes={CYCLE_GATING_CODES}
          accentClass="bg-purple-50 dark:bg-purple-950 text-purple-900 dark:text-purple-100"
        />
        <LayerCard
          title="W9 real-time hooks"
          subtitle="PostToolUse:Bash drift detection within a session"
          count={W9_HOOK_CODES.length}
          codes={W9_HOOK_CODES}
          accentClass="bg-rose-50 dark:bg-rose-950 text-rose-900 dark:text-rose-100"
        />
      </div>
      <div className="mt-6">
        <LayerCard
          title="Cycle-time advisories (non-gating)"
          subtitle="Fire every 72h — informational only, do not block CI"
          count={CYCLE_ADVISORY_CODES.length}
          codes={CYCLE_ADVISORY_CODES}
          accentClass="bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-100"
        />
      </div>
      <p className="text-xs text-[var(--color-neutral-500)] mt-4 font-sans">
        {WRITE_TIME_CODES.length} write-time (incl. F4 enforced) + {CYCLE_GATING_CODES.length}{' '}
        cycle-time + {W9_HOOK_CODES.length} W9 hooks = {totalInstrumented} instrumented gates (34
        live) as of v7.10 ({CYCLE_ADVISORY_CODES.length} additional cycle-time advisories shown
        separately; 28 of 32 actively firing).
      </p>
    </div>
  );
}
