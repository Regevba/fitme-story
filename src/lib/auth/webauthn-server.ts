// src/lib/auth/webauthn-server.ts
//
// T1 — Thin wrapper around @simplewebauthn/server v13. Only re-exports the
// 4 core functions the routes need plus shared types so route handlers don't
// each import the library directly. Centralizes RP_ID + RP_NAME.
//
// Runtime: Node.js (uses node:crypto via SimpleWebAuthn).

export {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

export type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  AuthenticatorTransport,
} from '@simplewebauthn/server';

export const RP_ID =
  process.env.UCC_RP_ID ?? 'fitme-story.vercel.app';
export const RP_NAME = 'FitMe Control Room';
export const EXPECTED_ORIGIN =
  process.env.UCC_RP_ORIGIN ?? 'https://fitme-story.vercel.app';
