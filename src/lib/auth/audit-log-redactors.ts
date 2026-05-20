// src/lib/auth/audit-log-redactors.ts
//
// Pure-function privacy redactors for the auth audit log. Extracted from
// audit-log.ts during the ucc-passkey-auth-security-hardening enhancement
// (2026-05-20) so the lockout module (redis-lockout.ts) can key on the
// same IP-class truncation the audit log already uses.
//
// All functions are pure (no I/O, no Redis, no env reads). Safe to import
// from anywhere in the auth path.

/**
 * Truncate a raw IP (IPv4 or IPv6) to a privacy-preserving class:
 *   - IPv4 → `ipv4-X.Y.Z.0/24` (drops the host octet)
 *   - IPv6 → `ipv6-XXXX:XXXX:XXXX::/48` (keeps first 3 groups, drops the rest)
 *
 * Used by audit-log writes AND redis-lockout keying. Both consumers MUST
 * see the same truncation, otherwise the lockout key won't match the
 * audit event's ip_class field on the same request.
 */
export function ipClassFromRaw(rawIp: string): string {
  const ip = rawIp.split(',')[0].trim();
  if (ip.includes(':')) return `ipv6-${ip.split(':').slice(0, 3).join(':')}::/48`;
  const parts = ip.split('.');
  if (parts.length !== 4) return 'unknown';
  return `ipv4-${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
}

/**
 * Coarse-grained UA family classification. Strips fingerprintable detail
 * (exact versions, build numbers) and emits one of a fixed set of strings.
 *
 * The `cli/` prefix is reserved for the CLI runner identity emitted by
 * `scripts/issue-bootstrap-token.ts` (and `scripts/clear-lockout.ts`).
 * When the input starts with `cli/`, the function returns
 * `cli/<user-part>` — the hostname tail is dropped to keep the public
 * blob export PII-free.
 */
export function uaFamilyFromRaw(ua: string): string {
  if (ua.startsWith('cli/')) {
    // Format: `cli/<user>@<host>` — keep `cli/<user>`, drop the host.
    const atIdx = ua.indexOf('@');
    return atIdx > 0 ? ua.slice(0, atIdx) : ua;
  }
  if (/safari/i.test(ua) && /macintosh/i.test(ua)) return 'Safari/macOS';
  if (/safari/i.test(ua) && /iphone|ipad/i.test(ua)) return 'Safari/iOS';
  if (/chrome/i.test(ua) && /macintosh/i.test(ua)) return 'Chrome/macOS';
  if (/chrome/i.test(ua) && /windows/i.test(ua)) return 'Chrome/Windows';
  if (/edg/i.test(ua)) return 'Edge/Windows';
  if (/firefox/i.test(ua)) return 'Firefox';
  return 'other';
}
