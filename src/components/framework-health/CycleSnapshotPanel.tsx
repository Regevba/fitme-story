/**
 * CycleSnapshotPanel — T25
 * Shows the latest integrity cycle snapshot from .claude/integrity/snapshots/.
 */

import type { IntegritySnapshot } from '@/lib/framework-health/load-ledgers';

interface Props {
  snapshot: IntegritySnapshot | null;
}

const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
  INCONSISTENT: 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800',
  MISSING: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800',
  WARN: 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800',
};

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  } catch {
    return ts;
  }
}

export function CycleSnapshotPanel({ snapshot }: Props) {
  if (!snapshot) {
    return (
      <div className="flex flex-col items-center justify-center h-48 rounded-lg border border-dashed border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-600)] gap-2">
        <p className="text-sm font-sans text-[var(--color-neutral-500)]">No snapshots yet</p>
        <p className="text-xs font-sans text-[var(--color-neutral-400)]">
          Cycle snapshots are generated every 72h by the GitHub Actions workflow.
          Run <code className="font-mono">make integrity-snapshot</code> locally to generate one.
        </p>
      </div>
    );
  }

  const totalFindings = snapshot.finding_count;
  const severities = snapshot.findings_by_severity ?? {};
  const allGreen = totalFindings === 0;

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-sans text-sm font-medium ${
            allGreen
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${allGreen ? 'bg-green-500' : 'bg-red-500'}`}
            aria-hidden="true"
          />
          {allGreen ? 'Clean — 0 findings' : `${totalFindings} finding${totalFindings !== 1 ? 's' : ''}`}
        </div>
        <span className="text-xs text-[var(--color-neutral-500)] font-sans">
          Generated {formatTimestamp(snapshot.timestamp)}
        </span>
        <span className="text-xs text-[var(--color-neutral-500)] font-sans">
          {snapshot.feature_count} features · {snapshot.case_study_count} case studies
        </span>
      </div>

      {/* Commit ref */}
      {snapshot.commit_head && (
        <p className="text-xs font-mono text-[var(--color-neutral-400)]">
          commit {snapshot.commit_head.slice(0, 12)}
        </p>
      )}

      {/* Severity breakdown */}
      {!allGreen && Object.keys(severities).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(severities).map(([severity, count]) => (
            <div
              key={severity}
              className={`rounded-lg border px-3 py-2 ${
                SEVERITY_STYLES[severity] ??
                'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-400'
              }`}
            >
              <p className="text-lg font-bold font-sans">{count}</p>
              <p className="text-xs font-sans uppercase tracking-wide">{severity}</p>
            </div>
          ))}
        </div>
      )}

      {/* Individual findings (if any) */}
      {snapshot.findings && snapshot.findings.length > 0 && (
        <div className="rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] overflow-hidden">
          <div className="px-4 py-2 bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-800)] border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
            <p className="text-xs font-sans font-semibold text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
              Findings detail
            </p>
          </div>
          <ul className="divide-y divide-[var(--color-neutral-100)] dark:divide-[var(--color-neutral-800)]">
            {snapshot.findings.slice(0, 20).map((finding, i) => (
              <li key={i} className="px-4 py-2.5">
                <div className="flex items-start gap-2">
                  <code className="text-[10px] font-mono bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                    {finding.code}
                  </code>
                  <div className="min-w-0">
                    <p className="text-xs font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                      {finding.message}
                    </p>
                    {finding.feature && (
                      <p className="text-[10px] text-[var(--color-neutral-400)] font-mono mt-0.5">
                        {finding.feature}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
            {snapshot.findings.length > 20 && (
              <li className="px-4 py-2 text-xs text-[var(--color-neutral-400)] font-sans">
                + {snapshot.findings.length - 20} more findings — run{' '}
                <code className="font-mono">make integrity-check</code> locally to see all.
              </li>
            )}
          </ul>
        </div>
      )}

      {allGreen && (
        <p className="text-xs text-[var(--color-neutral-500)] font-sans">
          All {snapshot.feature_count} features and {snapshot.case_study_count} case studies passed
          all cycle-time checks at this snapshot.
        </p>
      )}
    </div>
  );
}
