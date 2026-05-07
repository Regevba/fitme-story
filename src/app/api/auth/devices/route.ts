// src/app/api/auth/devices/route.ts
//
// GET /api/auth/devices — lists the active operator's credentials.
// Helper for the Devices admin page (T16).

import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { sessionConfig, unsealSession } from '@/lib/auth/iron-session-config';
import { getSession } from '@/lib/auth/redis-ttl-store';
import { listCredentialsForEmail } from '@/lib/auth/redis-store';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const cookieStore = await cookies();
  const sealed = cookieStore.get(sessionConfig.cookieName)?.value;
  const session = sealed ? await unsealSession(sealed) : null;
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const stored = await getSession(session.sid);
  if (!stored) {
    return NextResponse.json({ error: 'session_not_found' }, { status: 401 });
  }
  const credentials = await listCredentialsForEmail(session.email);
  // Strip publicKey from the response — the dashboard doesn't need to display it.
  const safe = credentials.map((c) => ({
    credentialID: c.credentialID,
    label: c.label,
    deviceType: c.deviceType,
    transports: c.transports,
    createdAt: c.createdAt,
    lastUsedAt: c.lastUsedAt,
    revokedAt: c.revokedAt,
  }));
  return NextResponse.json({ credentials: safe });
}
