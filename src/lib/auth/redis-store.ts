// src/lib/auth/redis-store.ts
//
// T5 — KV CRUD for operator + credential records (the persistent records).
// CAS counter update on credential reads — replay defense per WebAuthn spec.

import { getRedis } from './redis-client';

// ────────────────────────────────────────────────────────────────────────────
// Operator
// ────────────────────────────────────────────────────────────────────────────

export interface Operator {
  email: string;
  label: string;
  role: 'primary' | 'secondary';
  createdAt: number; // unix seconds
}

export async function upsertOperator(operator: Operator): Promise<void> {
  const redis = getRedis();
  await redis.set(`ucc:operator:${operator.email}`, operator);
}

export async function getOperator(email: string): Promise<Operator | null> {
  const redis = getRedis();
  return (await redis.get<Operator>(`ucc:operator:${email}`)) ?? null;
}

// ────────────────────────────────────────────────────────────────────────────
// Credential
// ────────────────────────────────────────────────────────────────────────────

export interface Credential {
  credentialID: string; // base64url
  ownerEmail: string;
  publicKey: string; // COSE base64url
  counter: number;
  deviceType: 'platform' | 'cross_platform';
  transports: ('internal' | 'usb' | 'nfc' | 'ble' | 'hybrid')[];
  aaguid: string;
  label: string;
  createdAt: number;
  lastUsedAt: number | null;
  revokedAt: number | null;
}

function credKey(credentialID: string): string {
  return `ucc:credential:${credentialID}`;
}

function ownerIndexKey(email: string): string {
  return `ucc:operator:${email}:credentials`;
}

export async function storeCredential(cred: Credential): Promise<void> {
  const redis = getRedis();
  await redis.set(credKey(cred.credentialID), cred);
  await redis.sadd(ownerIndexKey(cred.ownerEmail), cred.credentialID);
}

export async function getCredential(
  credentialID: string,
): Promise<Credential | null> {
  const redis = getRedis();
  return (await redis.get<Credential>(credKey(credentialID))) ?? null;
}

export async function listCredentialsForEmail(
  email: string,
): Promise<Credential[]> {
  const redis = getRedis();
  const ids = await redis.smembers(ownerIndexKey(email));
  if (ids.length === 0) return [];
  const records = await Promise.all(ids.map((id) => getCredential(id)));
  return records.filter((c): c is Credential => c !== null);
}

// CAS counter update — rejects if newCounter <= stored.counter (replay defense).
export async function updateCounterCAS(
  credentialID: string,
  newCounter: number,
): Promise<{ ok: true } | { ok: false; reason: 'replay' | 'unknown' }> {
  const cred = await getCredential(credentialID);
  if (!cred) return { ok: false, reason: 'unknown' };
  // Some hardware authenticators always report counter=0 — this is allowed
  // ONLY if the stored counter is also 0 (genuinely never-incremented).
  if (newCounter > 0 && newCounter <= cred.counter) {
    return { ok: false, reason: 'replay' };
  }
  if (newCounter === 0 && cred.counter !== 0) {
    return { ok: false, reason: 'replay' };
  }
  await storeCredential({
    ...cred,
    counter: newCounter,
    lastUsedAt: Math.floor(Date.now() / 1000),
  });
  return { ok: true };
}

export async function revokeCredential(credentialID: string): Promise<boolean> {
  const cred = await getCredential(credentialID);
  if (!cred) return false;
  if (cred.revokedAt) return true; // already revoked, idempotent
  await storeCredential({ ...cred, revokedAt: Math.floor(Date.now() / 1000) });
  return true;
}
