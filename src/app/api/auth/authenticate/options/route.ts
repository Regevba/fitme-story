// src/app/api/auth/authenticate/options/route.ts
//
// T9 — POST /api/auth/authenticate/options
//
// Generates PublicKeyCredentialRequestOptions for sign-in. Supports both
// conditional UI (no email needed; resident keys) and direct (email known).

import { NextResponse, type NextRequest } from 'next/server';
import {
  generateAuthenticationOptions,
  RP_ID,
} from '@/lib/auth/webauthn-server';
import { setChallenge } from '@/lib/auth/redis-ttl-store';
import { listCredentialsForEmail } from '@/lib/auth/redis-store';
import { logAuthEvent } from '@/lib/auth/audit-log';

export const runtime = 'nodejs';

interface RequestBody {
  email?: string; // optional — conditional UI doesn't need it
  mediation?: 'conditional' | 'required';
}

export async function POST(req: NextRequest) {
  let body: RequestBody = {};
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    // Empty body is fine for conditional UI.
  }

  let allowCredentials:
    | { id: string; transports?: ('internal' | 'usb' | 'nfc' | 'ble' | 'hybrid')[] }[]
    | undefined;

  if (body.email) {
    const creds = await listCredentialsForEmail(body.email);
    allowCredentials = creds
      .filter((c) => !c.revokedAt)
      .map((c) => ({
        id: c.credentialID,
        transports: c.transports,
      }));
  }

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials,
    userVerification: 'preferred',
  });

  // For conditional UI we don't have an email — key the challenge by a
  // synthetic identifier the client echoes back at verify time.
  const challengeKey = body.email ?? `conditional:${options.challenge}`;
  await setChallenge(challengeKey, options.challenge);

  await logAuthEvent({
    event_type: 'auth_passkey_authenticate_started',
    operator_label: body.email ?? 'conditional',
    outcome: 'success',
    mediation: body.mediation,
  });

  return NextResponse.json({ options, challengeKey });
}
