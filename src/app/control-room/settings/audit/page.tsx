// src/app/control-room/settings/audit/page.tsx
//
// T17 — Audit log viewer (last 50 events).

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { sessionConfig, unsealSession } from '@/lib/auth/iron-session-config';
import { getSession } from '@/lib/auth/redis-ttl-store';
import { loadAuthEvents } from '@/lib/auth/load-events';
import AuditTable from './AuditTable';
import { TrackPageView } from '@/components/control-room/TrackPageView';

export const metadata: Metadata = {
  title: 'Audit log — FitMe Control Room',
  description: 'Operator dashboard authentication audit log.',
  robots: { index: false, follow: false },
};

export const runtime = 'nodejs';

export default async function AuditLogPage() {
  const cookieStore = await cookies();
  const sealed = cookieStore.get(sessionConfig.cookieName)?.value;
  const session = sealed ? await unsealSession(sealed) : null;
  if (!session) redirect('/control-room/sign-in?next=/control-room/settings/audit');
  const stored = await getSession(session.sid);
  if (!stored) redirect('/control-room/sign-in?next=/control-room/settings/audit');

  const events = await loadAuthEvents(50);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <TrackPageView route="auth_passkey_audit" />
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-white/40">
          Operator dashboard / Settings
        </p>
        <h1 className="mt-2 font-serif text-[length:var(--text-display-md)] text-neutral-900 dark:text-white">
          Audit log
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-white/60">
          Last 50 authentication events on this dashboard. Click any row for details.
        </p>
      </header>

      <AuditTable events={events} />
    </main>
  );
}
