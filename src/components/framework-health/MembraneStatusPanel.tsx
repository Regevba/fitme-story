/**
 * MembraneStatusPanel — v7.8 Mechanism F advisory smartlog.
 *
 * Renders the read-only output of FitTracker2's `scripts/membrane-status.py`
 * as a table of in-flight features (top N by last-touched mtime). v7.8 ships
 * advisory only — no leases acquired, no enforcement. v7.9 wires
 * /pm-workflow to call membrane-acquire.py at session start.
 *
 * Pattern: Sapling smartlog (Meta), Jujutsu op-log.
 */

import type { MembraneStatus } from '@/lib/framework-health/load-membrane-status';

interface Props {
  status: MembraneStatus | null;
  /** How many features to render (default 15). */
  limit?: number;
}

function formatRelative(iso: string): string {
  try {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const seconds = Math.max(0, Math.floor((now - then) / 1000));
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86_400)}d ago`;
  } catch {
    return iso;
  }
}

const PHASE_STYLES: Record<string, string> = {
  complete:
    'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950',
  implementation:
    'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950',
  testing:
    'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950',
  research:
    'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950',
  prd: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950',
  tasks:
    'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950',
  ux_or_integration:
    'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950',
  review: 'text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950',
  merge: 'text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950',
  documentation:
    'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950',
};

function phasePillClass(phase: string): string {
  return (
    PHASE_STYLES[phase] ??
    'text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)]'
  );
}

export function MembraneStatusPanel({ status, limit = 15 }: Props) {
  if (!status) {
    return (
      <div className="flex flex-col items-center justify-center h-48 rounded-lg border border-dashed border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-600)] gap-2">
        <p className="text-sm font-sans text-[var(--color-neutral-500)]">
          Membrane status unavailable
        </p>
        <p className="text-xs font-sans text-[var(--color-neutral-400)] max-w-md text-center">
          The build host could not run{' '}
          <code className="font-mono">scripts/membrane-status.py</code>. Set{' '}
          <code className="font-mono">FITTRACKER_REPO_PATH</code> or ensure
          the script is on main (PR #193, shipped 2026-05-04).
        </p>
      </div>
    );
  }

  const features = status.features.slice(0, limit);
  const remaining = status.features.length - features.length;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-sans text-sm font-medium bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-200)]">
          <span
            className="w-2 h-2 rounded-full bg-[var(--color-neutral-400)]"
            aria-hidden="true"
          />
          Advisory · read-only
        </div>
        <span className="text-xs font-sans text-[var(--color-neutral-500)]">
          Epoch {status.epoch}
        </span>
        <span className="text-xs font-sans text-[var(--color-neutral-500)]">
          {status.lease_count} active lease
          {status.lease_count === 1 ? '' : 's'}
        </span>
        <span className="text-xs font-sans text-[var(--color-neutral-500)]">
          {status.feature_count} features
        </span>
        <span className="text-xs font-sans text-[var(--color-neutral-500)]">
          {status.branch_count} open branches
        </span>
        <span className="ml-auto text-xs font-mono text-[var(--color-neutral-400)]">
          generated {formatRelative(status.generated_at)}
        </span>
      </div>

      {/* Smartlog table */}
      <div className="overflow-x-auto rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
        <table className="min-w-full text-sm font-sans">
          <thead className="bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)]">
            <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-neutral-500)]">
              <th className="px-3 py-2">Feature</th>
              <th className="px-3 py-2">Phase</th>
              <th className="px-3 py-2">FW</th>
              <th className="px-3 py-2">Manifest</th>
              <th className="px-3 py-2">Last touched</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-neutral-200)] dark:divide-[var(--color-neutral-700)]">
            {features.map((f) => (
              <tr
                key={f.slug}
                className="text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-200)]"
              >
                <td className="px-3 py-2 font-mono text-xs">{f.slug}</td>
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${phasePillClass(
                      f.current_phase
                    )}`}
                  >
                    {f.current_phase || '—'}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-xs text-[var(--color-neutral-500)]">
                  {f.framework_version || '—'}
                </td>
                <td className="px-3 py-2 text-xs">
                  {f.agent_manifest_present ? (
                    <span className="text-green-700 dark:text-green-400">
                      ✓
                    </span>
                  ) : (
                    <span className="text-[var(--color-neutral-400)]">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-xs text-[var(--color-neutral-500)] font-sans">
                  {formatRelative(f.last_touched_utc)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {remaining > 0 && (
          <div className="px-3 py-2 text-xs font-sans text-[var(--color-neutral-400)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)] border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
            +{remaining} more feature{remaining === 1 ? '' : 's'} not shown
          </div>
        )}
      </div>

      {/* Advisory note */}
      <p className="text-xs font-sans text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)] italic">
        {status._advisory_note}
      </p>
    </div>
  );
}
