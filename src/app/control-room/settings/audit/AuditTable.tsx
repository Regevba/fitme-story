'use client';

// src/app/control-room/settings/audit/AuditTable.tsx
//
// T17 helper — filter chips + paginated event list.

import { useMemo, useState } from 'react';
import AuditEventRow, { type AuditEvent } from '@/components/control-room/AuditEventRow';

const FILTERS: { key: string; label: string; match: (et: string) => boolean }[] = [
  { key: 'all', label: 'All', match: () => true },
  { key: 'authenticate', label: 'Authenticate', match: (et) => et.includes('authenticate') },
  { key: 'register', label: 'Register', match: (et) => et.includes('register') },
  { key: 'revoke', label: 'Revoke', match: (et) => et.includes('revoked') },
  { key: 'session', label: 'Session', match: (et) => et.includes('session') },
];

export default function AuditTable({ events }: { events: AuditEvent[] }) {
  const [active, setActive] = useState('all');
  const filter = FILTERS.find((f) => f.key === active) ?? FILTERS[0];
  const filtered = useMemo(
    () => events.filter((e) => filter.match(e.event_type)),
    [events, filter],
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActive(f.key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 ${
              active === f.key
                ? 'bg-[var(--color-brand-indigo)] text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-white/8 dark:text-white/80 dark:hover:bg-white/15'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-600 dark:border-white/15 dark:bg-white/5 dark:text-white/70">
          No events recorded yet.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-white/10">
              <th className="py-2 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/50">
                Time
              </th>
              <th className="py-2 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/50">
                Event
              </th>
              <th className="py-2 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/50">
                Operator
              </th>
              <th className="py-2 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/50">
                Outcome
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((event, i) => (
              <AuditEventRow key={`${event.timestamp}-${i}`} event={event} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
