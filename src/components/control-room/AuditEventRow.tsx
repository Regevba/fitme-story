'use client';

// src/components/control-room/AuditEventRow.tsx
//
// T17 helper component — renders a single audit event with click-to-expand
// detail view. Outcome cell is a colored pill; event_type uses a palette by
// success/error/info/admin/expiry semantic.

import { useState } from 'react';

export interface AuditEvent {
  timestamp: string;
  event_type: string;
  operator_label: string;
  outcome: 'success' | 'error';
  reason?: string | null;
  credential_id_hash?: string;
  ip_class?: string;
  user_agent_family?: string;
  duration_ms?: number;
  session_id_hash?: string;
}

const EVENT_COLOR: Record<string, string> = {
  succeeded: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200',
  minted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200',
  failed: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200',
  started: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200',
  revoked: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200',
  expired: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200',
  authenticated: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200',
  issued: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200',
};

function classify(eventType: string): string {
  for (const k of Object.keys(EVENT_COLOR)) {
    if (eventType.includes(k)) return EVENT_COLOR[k];
  }
  return 'bg-neutral-100 text-neutral-800 dark:bg-white/8 dark:text-white';
}

export default function AuditEventRow({ event, dense = false }: { event: AuditEvent; dense?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr
        onClick={() => setExpanded((e) => !e)}
        className="cursor-pointer border-b border-neutral-100 hover:bg-neutral-50 dark:border-white/5 dark:hover:bg-white/4"
      >
        <td className={`${dense ? 'py-2' : 'py-3'} font-mono text-xs text-neutral-500 dark:text-white/50`}>
          {new Date(event.timestamp).toISOString().slice(0, 19).replace('T', ' ')}
        </td>
        <td className={`${dense ? 'py-2' : 'py-3'}`}>
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${classify(event.event_type)}`}>
            {event.event_type.replace('auth_', '')}
          </span>
        </td>
        <td className={`${dense ? 'py-2' : 'py-3'} text-sm text-neutral-700 dark:text-white/70`}>
          {event.operator_label}
        </td>
        <td className={`${dense ? 'py-2' : 'py-3'} text-right`}>
          {event.outcome === 'success' ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">
              ✓
            </span>
          ) : (
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-500/20 dark:text-rose-200">
              ✗
            </span>
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-neutral-100 bg-neutral-50 dark:border-white/5 dark:bg-white/4">
          <td colSpan={4} className="px-4 py-3 font-mono text-xs text-neutral-700 dark:text-white/70">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
              {event.credential_id_hash && (
                <>
                  <dt className="font-semibold text-neutral-500 dark:text-white/50">credential_id_hash</dt>
                  <dd>{event.credential_id_hash}</dd>
                </>
              )}
              {event.ip_class && (
                <>
                  <dt className="font-semibold text-neutral-500 dark:text-white/50">ip_class</dt>
                  <dd>{event.ip_class}</dd>
                </>
              )}
              {event.user_agent_family && (
                <>
                  <dt className="font-semibold text-neutral-500 dark:text-white/50">user_agent_family</dt>
                  <dd>{event.user_agent_family}</dd>
                </>
              )}
              {typeof event.duration_ms === 'number' && (
                <>
                  <dt className="font-semibold text-neutral-500 dark:text-white/50">duration_ms</dt>
                  <dd>{event.duration_ms}</dd>
                </>
              )}
              {event.reason && (
                <>
                  <dt className="font-semibold text-neutral-500 dark:text-white/50">reason</dt>
                  <dd>{event.reason}</dd>
                </>
              )}
              {event.session_id_hash && (
                <>
                  <dt className="font-semibold text-neutral-500 dark:text-white/50">session_id_hash</dt>
                  <dd>{event.session_id_hash}</dd>
                </>
              )}
            </dl>
          </td>
        </tr>
      )}
    </>
  );
}
