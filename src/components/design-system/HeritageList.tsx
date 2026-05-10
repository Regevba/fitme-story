import * as React from 'react';
import {
  AUDIT_DECISIONS,
  LOCKED_PATTERNS,
  getHeritageMetrics,
  type AuditDecision,
} from '@/lib/design-system-heritage';

const SEVERITY_BADGE: Record<AuditDecision['severity'], string> = {
  P0: 'bg-[var(--color-brand-coral)] text-white',
  P1: 'bg-[var(--skill-research)] text-[var(--color-neutral-900)]',
  P2: 'bg-[var(--color-neutral-300)] text-[var(--color-neutral-700)]',
};

export function HeritageMetricsCard() {
  const m = getHeritageMetrics();
  return (
    <aside className="rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)] p-4 mb-6 text-sm font-sans">
      <div className="font-semibold mb-1">
        {m.auditTotal} audit decisions · {m.lockedPatternsTotal} locked patterns
      </div>
      <p className="text-xs text-[var(--color-neutral-500)]">
        {m.auditTotals.P0} P0 · {m.auditTotals.P1} P1 · {m.auditTotals.P2} P2.
        {' '}Earliest {m.earliestAudit}, latest {m.latestAudit}.
        {' '}All resolved before this design-system feature shipped.
      </p>
    </aside>
  );
}

export function AuditDecisionList() {
  const sorted = [...AUDIT_DECISIONS].sort((a, b) => {
    // P0 first, then P1, then P2; within tier, alphabetical by id
    const order = { P0: 0, P1: 1, P2: 2 };
    if (order[a.severity] !== order[b.severity]) return order[a.severity] - order[b.severity];
    return a.id.localeCompare(b.id);
  });
  return (
    <ul className="space-y-4">
      {sorted.map((d) => (
        <li
          key={d.id}
          className="rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-4"
        >
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <code className="font-mono text-xs text-[var(--color-neutral-500)]">{d.id}</code>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold ${SEVERITY_BADGE[d.severity]}`}
            >
              {d.severity}
            </span>
            <span className="font-sans font-semibold text-sm">{d.title}</span>
          </div>
          <p className="text-sm font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
            <strong className="font-semibold">Problem:</strong> {d.problem}
          </p>
          <p className="mt-1 text-sm font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
            <strong className="font-semibold">Fix:</strong> {d.fix}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs font-sans text-[var(--color-neutral-500)]">
            <span>Resolved {d.resolvedDate}</span>
            <span>· {d.resolvedIn.join(', ')}</span>
            <span>· Affects: {d.affects.join(', ')}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function LockedPatternList() {
  return (
    <ul className="space-y-4">
      {LOCKED_PATTERNS.map((p) => (
        <li
          key={p.id}
          className="rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-4"
        >
          <div className="flex flex-wrap items-baseline gap-2 mb-1">
            <span className="font-sans font-semibold text-sm">{p.name}</span>
            <span className="text-xs font-sans text-[var(--color-neutral-500)]">
              locked {p.lockedDate}
            </span>
          </div>
          <p className="text-sm font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
            {p.description}
          </p>
          <p className="mt-1 text-sm font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] italic">
            <strong className="font-semibold not-italic">Rationale:</strong> {p.rationale}
          </p>
          <div className="mt-2 text-xs font-sans text-[var(--color-neutral-500)]">
            Applies to: {p.appliesTo.join(', ')}
          </div>
        </li>
      ))}
    </ul>
  );
}
