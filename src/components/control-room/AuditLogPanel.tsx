// src/components/control-room/AuditLogPanel.tsx
//
// T18 — Server-rendered panel for the framework-health page. 3-stat row +
// suspicious-event banner + last 5 events. Reads .local/ucc-auth-events.jsonl.
//
// Server component (default) — no 'use client'. The expandable rows inside
// AuditEventRow are themselves client components.

import Link from 'next/link';
import { loadAuthEvents, computeAuditStats } from '@/lib/auth/load-events';
import { Panel } from './primitives';
import AuditEventRow from './AuditEventRow';

export default async function AuditLogPanel() {
  const events = await loadAuthEvents();
  const stats = await computeAuditStats(events);
  const recent = events.slice(0, 5);

  return (
    <Panel
      eyebrow="Auth surface"
      title="Operator dashboard authentication"
      description="Telemetry from the passkey gate on /control-room/*. Sourced from .claude/logs/ucc-auth-events.jsonl."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Registered" value={stats.registeredCount} />
        <StatCard label="Auths (7d)" value={stats.authsLast7d} />
        <StatCard
          label="Failed (7d)"
          value={stats.failsLast7d}
          tone={stats.failsLast7d > 0 ? 'warn' : 'neutral'}
        />
      </div>

      {stats.suspiciousReasons.length > 0 && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200"
        >
          <p className="font-semibold">⚠ Suspicious activity detected</p>
          <ul className="mt-1 list-disc pl-5">
            {stats.suspiciousReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <h4 className="mb-2 text-sm font-semibold text-neutral-700 dark:text-white/80">
          Recent events
        </h4>
        {recent.length === 0 ? (
          <p className="text-xs text-neutral-500 dark:text-white/50">
            No events yet. Audit log will populate after the first sign-in.
          </p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {recent.map((event, i) => (
                <AuditEventRow key={`${event.timestamp}-${i}`} event={event} dense />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 text-right">
        <Link
          href="/control-room/settings/audit"
          className="text-xs font-semibold text-[var(--color-brand-indigo)] hover:underline"
        >
          View full audit log →
        </Link>
      </div>
    </Panel>
  );
}

function StatCard({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: number;
  tone?: 'neutral' | 'warn';
}) {
  const valueClass =
    tone === 'warn' && value > 0
      ? 'text-rose-700 dark:text-rose-300'
      : 'text-neutral-900 dark:text-white';
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/50">
        {label}
      </p>
      <p className={`mt-1 font-serif text-3xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}
