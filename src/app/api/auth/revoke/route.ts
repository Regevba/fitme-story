// src/app/api/auth/revoke/route.ts
//
// T11 — POST /api/auth/revoke
//
// Marks a credential revoked. Caller MUST have a valid passkey session
// (verified via proxy.ts before the request reaches us; we re-check here
// as defense in depth).

import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { sessionConfig, unsealSession } from '@/lib/auth/iron-session-config';
import {
  getCredential,
  revokeCredential,
} from '@/lib/auth/redis-store';
import { revokeSessionsForEmail, getSession } from '@/lib/auth/redis-ttl-store';
import { logAuthEvent } from '@/lib/auth/audit-log';

export const runtime = 'nodejs';

interface RequestBody {
  credentialID: string; // base64url
}

export async function POST(req: NextRequest) {
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

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.credentialID || typeof body.credentialID !== 'string') {
    return NextResponse.json({ error: 'missing_credential_id' }, { status: 400 });
  }

  const target = await getCredential(body.credentialID);
  if (!target) {
    return NextResponse.json({ error: 'unknown_credential' }, { status: 404 });
  }

  const revokedSelf = target.ownerEmail === session.email;
  await revokeCredential(body.credentialID);

  // If the revoked credential is the only one for that operator, clear all
  // their sessions too (forces re-auth on every device).
  // Note: we don't auto-revoke for multi-credential operators — they keep
  // active sessions on other devices.
  if (revokedSelf) {
    await revokeSessionsForEmail(session.email);
  }

  await logAuthEvent({
    event_type: 'auth_passkey_revoked',
    operator_label: target.label,
    outcome: 'success',
    credential_id: body.credentialID,
    revoked_self: revokedSelf,
    ip: req.headers.get('x-forwarded-for') ?? undefined,
    user_agent: req.headers.get('user-agent') ?? undefined,
    session_id: session.sid,
  });

  return NextResponse.json({ ok: true });
}
