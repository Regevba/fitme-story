// src/app/api/auth/register/options/route.ts
//
// T7 — POST /api/auth/register/options
//
// Returns PublicKeyCredentialCreationOptions for a new device.
// Gated by a valid bootstrap token (operator pasted it in /control-room/sign-in/recover).
//
// Runtime: Node.js (SimpleWebAuthn server uses node:crypto).

import { NextResponse, type NextRequest } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { consumeBootstrap, setChallenge } from '@/lib/auth/redis-ttl-store';
import { getOperator, listCredentialsForEmail } from '@/lib/auth/redis-store';
import { sha256Hex } from '@/lib/auth/util';
import { logAuthEvent } from '@/lib/auth/audit-log';

export const runtime = 'nodejs';

const RP_ID =
  process.env.UCC_RP_ID ?? 'fitme-story.vercel.app';
const RP_NAME = 'FitMe Control Room';

interface RequestBody {
  bootstrapToken: string;
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body.bootstrapToken || typeof body.bootstrapToken !== 'string') {
    return NextResponse.json({ error: 'missing_bootstrap_token' }, { status: 400 });
  }

  // SHA-256 hash matches what scripts/issue-bootstrap-token.ts wrote to Redis.
  const tokenHash = sha256Hex(body.bootstrapToken);
  const consumed = await consumeBootstrap(tokenHash);
  if (!consumed) {
    await logAuthEvent({
      event_type: 'auth_passkey_register_failed',
      operator_label: 'unknown',
      reason: 'bootstrap_invalid',
      outcome: 'error',
    });
    return NextResponse.json({ error: 'bootstrap_invalid' }, { status: 401 });
  }

  try {
    const operator = await getOperator(consumed.email);
    const existing = await listCredentialsForEmail(consumed.email);

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userName: consumed.email,
      userDisplayName: operator?.label ?? consumed.email,
      attestationType: 'none',
      excludeCredentials: existing
        .filter((c) => !c.revokedAt)
        .map((c) => ({
          id: c.credentialID,
          type: 'public-key' as const,
          transports: c.transports,
        })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    await setChallenge(consumed.email, options.challenge);

    await logAuthEvent({
      event_type: 'auth_passkey_register_started',
      operator_label: operator?.label ?? consumed.email,
      outcome: 'success',
    });

    return NextResponse.json({ options, email: consumed.email });
  } catch (err) {
    await logAuthEvent({
      event_type: 'auth_passkey_register_failed',
      operator_label: consumed.email,
      reason: 'server_error',
      outcome: 'error',
    });
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
