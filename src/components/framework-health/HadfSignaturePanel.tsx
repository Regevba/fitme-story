/**
 * HadfSignaturePanel — HADF Phase 3A sensing-layer surface (T4).
 *
 * Renders reference TTFT/TPS distributions + drift status as a PASSIVE,
 * ADVISORY observability panel. Makes no dispatch/routing claim. Per-request
 * single-shot accuracy is unvalidated (RQ5); attestation is advisory only.
 *
 * Server component (no client interactivity). Tokens + dark-mode classes match
 * the rest of /control-room/framework.
 */

import type {
  HadfSensingData,
  DriftRow,
} from '@/lib/framework-health/load-hadf-signatures';

function StatusBadge({ status }: { status: string }) {
  const instrumented = status === 'instrumented';
  const cls = instrumented
    ? 'bg-[var(--color-success-100)] text-[var(--color-success-800)] dark:bg-[var(--color-success-900)] dark:text-[var(--color-success-200)]'
    : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-600)] dark:bg-[var(--color-neutral-800)] dark:text-[var(--color-neutral-400)]';
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${cls}`}>
      {status}
    </span>
  );
}

function driftDot(band?: string): string {
  if (band === 'green') return 'bg-[var(--color-success-500)]';
  if (band === 'amber') return 'bg-[var(--color-warning-500)]';
  if (band === 'red') return 'bg-[var(--color-danger-500)]';
  return 'bg-[var(--color-neutral-400)]';
}

export function HadfSignaturePanel({ data }: { data: HadfSensingData }) {
  const { reference, drift, schemaWarning } = data;

  return (
    <div className="space-y-5">
      {/* Advisory banner — mandatory honesty label (SENSING-LAYER-README). */}
      <p className="rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)] px-3 py-2 text-xs text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)] font-sans">
        <strong>Advisory — not authoritative.</strong> Detection/observability
        only; no dispatch decision is made on this data. Per-request single-shot
        accuracy is unvalidated (RQ5); the acting layer is pre-registered as
        Phase&nbsp;3B/RQ4 and unstarted.
      </p>

      {schemaWarning && (
        <p className="rounded-md border border-[var(--color-warning-300)] bg-[var(--color-warning-50)] px-3 py-2 text-xs text-[var(--color-warning-800)] font-sans">
          ⚠ Schema mismatch: {schemaWarning}
        </p>
      )}

      {/* Reference distributions */}
      {reference ? (
        <div>
          <p className="mb-2 text-xs text-[var(--color-neutral-500)] font-sans">
            {reference.endpoint_count} endpoints · min&nbsp;n&nbsp;={reference.min_n} ·
            built {reference.built_as_of.slice(0, 10)}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-[var(--color-neutral-500)]">
                  <th className="py-1 pr-4">Provider / endpoint</th>
                  <th className="py-1 pr-4">n</th>
                  <th className="py-1 pr-4">TTFT median (p05–p95)</th>
                  <th className="py-1 pr-4">TPS median</th>
                  <th className="py-1 pr-4">Class</th>
                  <th className="py-1">Calibration</th>
                </tr>
              </thead>
              <tbody>
                {reference.endpoints.map((e) => (
                  <tr
                    key={`${e.provider}/${e.endpoint}`}
                    className="border-t border-[var(--color-neutral-100)] dark:border-[var(--color-neutral-800)]"
                  >
                    <td className="py-1.5 pr-4 text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
                      <span className="font-medium">{e.provider}</span>
                      <span className="text-[var(--color-neutral-500)]"> / {e.endpoint}</span>
                    </td>
                    <td className="py-1.5 pr-4 tabular-nums text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
                      {e.n}
                    </td>
                    <td className="py-1.5 pr-4 tabular-nums text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                      {e.ttft_median?.toFixed(3)}s
                      <span className="text-[var(--color-neutral-400)]">
                        {' '}({e.ttft_p05?.toFixed(3)}–{e.ttft_p95?.toFixed(3)})
                      </span>
                    </td>
                    <td className="py-1.5 pr-4 tabular-nums text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                      {e.tps_median?.toFixed(1)}
                    </td>
                    <td className="py-1.5 pr-4 text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
                      {e.class}
                    </td>
                    <td className="py-1.5">
                      <StatusBadge status={e.calibration_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-sm italic text-[var(--color-neutral-500)] font-sans">
          No reference signatures available yet.
        </p>
      )}

      {/* Drift status */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-[var(--color-neutral-800)] dark:text-[var(--color-neutral-200)] font-sans">
          Drift monitor
        </h3>
        {drift.length > 0 ? (
          <ul className="space-y-1">
            {latestPerEndpoint(drift).map((row) => (
              <li
                key={`${row.provider}/${row.endpoint}`}
                className="flex items-center gap-2 text-sm font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]"
              >
                <span className={`inline-block h-2 w-2 rounded-full ${driftDot(row.band)}`} />
                <span className="font-medium">
                  {row.provider}/{row.endpoint}
                </span>
                <span className="text-[var(--color-neutral-500)]">
                  {row.band ?? 'unknown'} · last checked {row.timestamp?.slice(0, 19)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm italic text-[var(--color-neutral-500)] font-sans">
            No drift readings yet — the monitor (<code>hadf-drift-monitor.py</code>)
            has not run, or its output is not yet synced.
          </p>
        )}
      </div>
    </div>
  );
}

/** Collapse the append-only drift log to the most recent row per endpoint. */
function latestPerEndpoint(drift: DriftRow[]): DriftRow[] {
  const byEndpoint = new Map<string, DriftRow>();
  for (const row of drift) {
    const key = `${row.provider}/${row.endpoint}`;
    const existing = byEndpoint.get(key);
    if (!existing || (row.timestamp ?? '') > (existing.timestamp ?? '')) {
      byEndpoint.set(key, row);
    }
  }
  return [...byEndpoint.values()].sort((a, b) =>
    `${a.provider}/${a.endpoint}`.localeCompare(`${b.provider}/${b.endpoint}`),
  );
}
