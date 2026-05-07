// src/app/api/auth/authenticate/verify/route.ts
//
// T10 — POST /api/auth/authenticate/verify
//
// Verifies the WebAuthn assertion + mints the iron-session cookie.
// CAS counter check is the replay defense (rejects if newCounter <= stored).
// Critical-path: this is what flips an unauthenticated request into a
// dashboard session.

import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import {
  verifyAuthenticationResponse,
  RP_ID,
  EXPECTED_ORIGIN,
} from '@/lib/auth/webauthn-server';
import { consumeChallenge } from '@/lib/auth/redis-ttl-store';
import {
  getCredential,
  updateCounterCAS,
} from '@/lib/auth/redis-store';
import { mintSession } from '@/lib/auth/redis-ttl-store';
import { sealSession, sessionConfig } from '@/lib/auth/iron-session-config';
import { logAuthEvent } from '@/lib/auth/audit-log';
import { newSid } from '@/lib/auth/util';

export const runtime = 'nodejs';

interface RequestBody {
  challengeKey: string;
  email?: string; // optional for conditional UI
  response: Parameters<typeof verifyAuthenticationResponse>[0]['response'];
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.response || !body.challengeKey) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const expectedChallenge = await consumeChallenge(body.challengeKey);
  if (!expectedChallenge) {
    await logAuthEvent({
      event_type: 'auth_passkey_authenticate_failed',
      operator_label: body.email ?? 'conditional',
      outcome: 'error',
      reason: 'timeout',
      duration_ms: Date.now() - startedAt,
    });
    return NextResponse.json({ error: 'no_pending_challenge' }, { status: 400 });
  }

  const credentialID = body.response.id;
  const credential = await getCredential(credentialID);

  if (!credential || credential.revokedAt) {
    await logAuthEvent({
      event_type: 'auth_passkey_authenticate_failed',
      operator_label: body.email ?? 'conditional',
      outcome: 'error',
      reason: 'unknown_credential',
      credential_id: credentialID,
      duration_ms: Date.now() - startedAt,
    });
    return NextResponse.json(
      { error: 'unknown_credential' },
      { status: 401 },
    );
  }

  try {
    const verification = await verifyAuthenticationResponse({
      response: body.response,
      expectedChallenge,
      expectedOrigin: EXPECTED_ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: credential.credentialID,
        publicKey: Buffer.from(credential.publicKey, 'base64url'),
        counter: credential.counter,
        transports: credential.transports,
      },
      requireUserVerification: true,
    });

    if (!verification.verified) {
      await logAuthEvent({
        event_type: 'auth_passkey_authenticate_failed',
        operator_label: credential.label,
        outcome: 'error',
        reason: 'assertion_invalid',
        credential_id: credentialID,
        duration_ms: Date.now() - startedAt,
      });
      return NextResponse.json(
        { error: 'assertion_invalid' },
        { status: 401 },
      );
    }

    const cas = await updateCounterCAS(
      credentialID,
      verification.authenticationInfo.newCounter,
    );
    if (!cas.ok) {
      await logAuthEvent({
        event_type: 'auth_passkey_authenticate_failed',
        operator_label: credential.label,
        outcome: 'error',
        reason: cas.reason === 'replay' ? 'counter_replay' : 'unknown_credential',
        credential_id: credentialID,
        duration_ms: Date.now() - startedAt,
      });
      return NextResponse.json(
        { error: cas.reason === 'replay' ? 'counter_replay' : 'unknown_credential' },
        { status: 401 },
      );
    }

    // Mint session.
    const sid = newSid();
    await mintSession(sid, credential.ownerEmail);
    const sealed = await sealSession({ email: credential.ownerEmail, sid });

    const cookieStore = await cookies();
    cookieStore.set({
      name: sessionConfig.cookieName,
      value: sealed,
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: sessionConfig.cookiePath,
      maxAge: sessionConfig.ttlSeconds,
    });

    await logAuthEvent({
      event_type: 'auth_passkey_authenticate_succeeded',
      operator_label: credential.label,
      outcome: 'success',
      credential_id: credentialID,
      device_type: credential.deviceType,
      duration_ms: Date.now() - startedAt,
      ip: req.headers.get('x-forwarded-for') ?? undefined,
      user_agent: req.headers.get('user-agent') ?? undefined,
      session_id: sid,
    });
    await logAuthEvent({
      event_type: 'auth_session_minted',
      operator_label: credential.label,
      outcome: 'success',
      session_id: sid,
      session_ttl_seconds: sessionConfig.ttlSeconds,
    });

    return NextResponse.json({ verified: true, label: credential.label });
  } catch {
    await logAuthEvent({
      event_type: 'auth_passkey_authenticate_failed',
      operator_label: credential.label,
      outcome: 'error',
      reason: 'server_error',
      credential_id: credentialID,
      duration_ms: Date.now() - startedAt,
    });
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
