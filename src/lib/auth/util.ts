// src/lib/auth/util.ts
//
// Small utilities shared across auth routes + scripts.

import { createHash, randomBytes } from 'node:crypto';

export function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export function sha256Truncated(input: string, bytes = 12): string {
  return `sha256:${sha256Hex(input).slice(0, bytes * 2)}`;
}

export function newSid(): string {
  return randomBytes(16).toString('base64url');
}

export function newBootstrapToken(): string {
  return randomBytes(32).toString('base64url');
}

// Truncate IPv4 to /24 and IPv6 to /48 for audit-log privacy.
export function ipClass(rawIp: string | null | undefined): string {
  if (!rawIp) return 'unknown';
  const ip = rawIp.split(',')[0].trim();
  if (ip.includes(':')) {
    // IPv6
    const parts = ip.split(':').slice(0, 3).join(':');
    return `ipv6-${parts}::/48`;
  }
  // IPv4
  const parts = ip.split('.');
  if (parts.length !== 4) return 'unknown';
  return `ipv4-${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
}

// Strip user agent down to a family string.
export function uaFamily(ua: string | null | undefined): string {
  if (!ua) return 'unknown';
  if (/safari/i.test(ua) && /macintosh/i.test(ua)) return 'Safari/macOS';
  if (/safari/i.test(ua) && /iphone|ipad/i.test(ua)) return 'Safari/iOS';
  if (/chrome/i.test(ua) && /macintosh/i.test(ua)) return 'Chrome/macOS';
  if (/chrome/i.test(ua) && /windows/i.test(ua)) return 'Chrome/Windows';
  if (/chrome/i.test(ua) && /linux/i.test(ua)) return 'Chrome/Linux';
  if (/edg/i.test(ua)) return 'Edge/Windows';
  if (/firefox/i.test(ua)) return 'Firefox';
  return 'other';
}
