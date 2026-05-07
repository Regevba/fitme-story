// src/app/control-room/settings/devices/page.tsx
//
// T16 — Devices admin page. Server component shell; the table is a client component
// because of the inline confirm-pill state machine.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { sessionConfig, unsealSession } from '@/lib/auth/iron-session-config';
import { getSession } from '@/lib/auth/redis-ttl-store';
import { listCredentialsForEmail } from '@/lib/auth/redis-store';
import DevicesTable, { type CredentialRow } from '@/components/control-room/DevicesTable';
import { TrackPageView } from '@/components/control-room/TrackPageView';

export const metadata: Metadata = {
  title: 'Devices — FitMe Control Room',
  description: 'Registered passkeys for the operator dashboard.',
  robots: { index: false, follow: false },
};

export const runtime = 'nodejs';

export default async function DevicesPage() {
  const cookieStore = await cookies();
  const sealed = cookieStore.get(sessionConfig.cookieName)?.value;
  const session = sealed ? await unsealSession(sealed) : null;
  if (!session) redirect('/control-room/sign-in?next=/control-room/settings/devices');
  const stored = await getSession(session.sid);
  if (!stored) redirect('/control-room/sign-in?next=/control-room/settings/devices');

  const credentials = await listCredentialsForEmail(session.email);
  const rows: CredentialRow[] = credentials.map((c) => ({
    credentialID: c.credentialID,
    label: c.label,
    deviceType: c.deviceType,
    transports: c.transports,
    createdAt: c.createdAt,
    lastUsedAt: c.lastUsedAt,
    revokedAt: c.revokedAt,
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <TrackPageView route="auth_passkey_devices" />
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-white/40">
          Operator dashboard / Settings
        </p>
        <h1 className="mt-2 font-serif text-[length:var(--text-display-md)] text-neutral-900 dark:text-white">
          Devices
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-white/60">
          Registered passkeys for this dashboard. Revoke any device that you no longer
          control. To add another device, run{' '}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs dark:bg-white/8">
            pnpm tsx scripts/issue-bootstrap-token.ts
          </code>{' '}
          on a trusted machine.
        </p>
      </header>

      <DevicesTable initialCredentials={rows} />
    </main>
  );
}
