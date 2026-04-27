/**
 * AutomationMap — T23
 * Static lookup table of all framework check codes as of v7.7.
 * 10 write-time (pre-commit) + 9 cycle gating + 1 cycle advisory = 20 total.
 */

interface CheckCode {
  code: string;
  shipped_in: string;
  description: string;
}

const WRITE_TIME_CODES: CheckCode[] = [
  {
    code: 'SCHEMA_DRIFT',
    shipped_in: 'v7.5',
    description: 'Rejects legacy phase key; canonical is current_phase.',
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
    code: 'BROKEN_PR_CITATION',
    shipped_in: 'v7.6',
    description: 'Rejects case-study commits citing a PR # that does not resolve in gh pr list.',
  },
  {
    code: 'CASE_STUDY_MISSING_TIER_TAGS',
    shipped_in: 'v7.6',
    description: 'Rejects post-2026-04-21 case-study commits with no T1/T2/T3 tier tag.',
  },
  {
    code: 'CACHE_HITS_EMPTY_POST_V6',
    shipped_in: 'v7.7',
    description: 'Rejects state.json with cache_hits=[] for post-v6 features that have completed at least one phase.',
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
    code: 'CASE_STUDY_MISSING_FIELDS',
    shipped_in: 'v7.7',
    description: 'Rejects case-study MDX commits missing required frontmatter fields (slug, tier, timeline_position).',
  },
];

const CYCLE_GATING_CODES: CheckCode[] = [
  {
    code: 'PHASE_LIE',
    shipped_in: 'v7.5',
    description: 'Feature reports complete phase but linked tasks are not done.',
  },
  {
    code: 'TASK_LIE',
    shipped_in: 'v7.5',
    description: 'Task counts in state.json do not match actual task list.',
  },
  {
    code: 'NO_CS_LINK',
    shipped_in: 'v7.5',
    description: 'Complete feature has no case_study field in state.json.',
  },
  {
    code: 'V2_FILE_MISSING',
    shipped_in: 'v7.5',
    description: 'state.json references a v2 file path that does not exist in the repo.',
  },
  {
    code: 'PARTIAL_SHIP_TERMINAL',
    shipped_in: 'v7.5',
    description: 'Feature has been in partial-ship state for more than 14 days.',
  },
  {
    code: 'NO_STATE',
    shipped_in: 'v7.5',
    description: 'Feature directory exists but has no state.json.',
  },
  {
    code: 'INVALID_JSON',
    shipped_in: 'v7.5',
    description: 'state.json or case-study file is not valid JSON/YAML.',
  },
  {
    code: 'NO_PHASE',
    shipped_in: 'v7.5',
    description: 'state.json is missing the current_phase field.',
  },
  {
    code: 'CU_V2_INVALID',
    shipped_in: 'v7.7',
    description: 'Cycle-time mirror of write-time CU_V2_INVALID — catches backfill bypasses.',
  },
];

const CYCLE_ADVISORY_CODES: CheckCode[] = [
  {
    code: 'TIER_TAG_LIKELY_INCORRECT',
    shipped_in: 'v7.7',
    description:
      'Advisory: T1/T2/T3 tag present but heuristically suspicious (e.g., T1 on a metric with no instrumentation path). Kill criterion 2 fired at baseline n=1 — shipped permanently advisory due to 100% FP rate.',
  },
];

const VERSION_COLORS: Record<string, string> = {
  'v7.5': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  'v7.6': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'v7.7': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
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
  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-3">
        <LayerCard
          title="Write-time gates"
          subtitle="Fire on git commit (pre-commit hook)"
          count={WRITE_TIME_CODES.length}
          codes={WRITE_TIME_CODES}
          accentClass="bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-100"
        />
        <LayerCard
          title="Cycle-time gates (gating)"
          subtitle="Fire every 72h via GitHub Actions — blocks CI on new findings"
          count={CYCLE_GATING_CODES.length}
          codes={CYCLE_GATING_CODES}
          accentClass="bg-purple-50 dark:bg-purple-950 text-purple-900 dark:text-purple-100"
        />
        <LayerCard
          title="Cycle-time (advisory)"
          subtitle="Fire every 72h — informational only, does not block CI"
          count={CYCLE_ADVISORY_CODES.length}
          codes={CYCLE_ADVISORY_CODES}
          accentClass="bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-100"
        />
      </div>
      <p className="text-xs text-[var(--color-neutral-500)] mt-4 font-sans">
        Total: {WRITE_TIME_CODES.length} write-time + {CYCLE_GATING_CODES.length} cycle gating + {CYCLE_ADVISORY_CODES.length} advisory ={' '}
        {WRITE_TIME_CODES.length + CYCLE_GATING_CODES.length + CYCLE_ADVISORY_CODES.length} check codes as of v7.7.
      </p>
    </div>
  );
}
