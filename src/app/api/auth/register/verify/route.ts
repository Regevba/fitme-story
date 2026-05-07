// src/app/api/auth/register/verify/route.ts
//
// T8 — POST /api/auth/register/verify
//
// Verifies the registration attestation + persists the credential to Redis.

import { NextResponse, type NextRequest } from 'next/server';
import {
  verifyRegistrationResponse,
  RP_ID,
  EXPECTED_ORIGIN,
} from '@/lib/auth/webauthn-server';
import { consumeChallenge } from '@/lib/auth/redis-ttl-store';
import {
  storeCredential,
  upsertOperator,
  getOperator,
} from '@/lib/auth/redis-store';
import { logAuthEvent } from '@/lib/auth/audit-log';
import { uaFamily } from '@/lib/auth/util';

export const runtime = 'nodejs';

interface RequestBody {
  email: string;
  label?: string;
  response: Parameters<typeof verifyRegistrationResponse>[0]['response'];
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.email || !body.response) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  const expectedChallenge = await consumeChallenge(body.email);
  if (!expectedChallenge) {
    await logAuthEvent({
      event_type: 'auth_passkey_register_failed',
      operator_label: body.email,
      outcome: 'error',
      reason: 'attestation_invalid',
    });
    return NextResponse.json({ error: 'no_pending_challenge' }, { status: 400 });
  }

  try {
    const verification = await verifyRegistrationResponse({
      response: body.response,
      expectedChallenge,
      expectedOrigin: EXPECTED_ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      await logAuthEvent({
        event_type: 'auth_passkey_register_failed',
        operator_label: body.email,
        outcome: 'error',
        reason: 'attestation_invalid',
      });
      return NextResponse.json(
        { error: 'attestation_invalid' },
        { status: 400 },
      );
    }

    const info = verification.registrationInfo;
    const label =
      body.label ||
      `${body.email.split('@')[0]}-${uaFamily(req.headers.get('user-agent'))}`;

    // Upsert operator if first credential.
    if (!(await getOperator(body.email))) {
      await upsertOperator({
        email: body.email,
        label,
        role: 'primary',
        createdAt: Math.floor(Date.now() / 1000),
      });
    }

    const cred = info.credential;
    await storeCredential({
      credentialID: cred.id,
      ownerEmail: body.email,
      publicKey: Buffer.from(cred.publicKey).toString('base64url'),
      counter: cred.counter,
      deviceType:
        info.credentialDeviceType === 'singleDevice' ? 'platform' : 'cross_platform',
      transports: (cred.transports ?? []) as Array<
        'internal' | 'usb' | 'nfc' | 'ble' | 'hybrid'
      >,
      aaguid: info.aaguid ?? '',
      label,
      createdAt: Math.floor(Date.now() / 1000),
      lastUsedAt: null,
      revokedAt: null,
    });

    await logAuthEvent({
      event_type: 'auth_passkey_register_completed',
      operator_label: label,
      outcome: 'success',
      credential_id: cred.id,
      device_type:
        info.credentialDeviceType === 'singleDevice' ? 'platform' : 'cross_platform',
      ip: req.headers.get('x-forwarded-for') ?? undefined,
      user_agent: req.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ verified: true, label });
  } catch (err) {
    await logAuthEvent({
      event_type: 'auth_passkey_register_failed',
      operator_label: body.email,
      outcome: 'error',
      reason: 'server_error',
    });
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
