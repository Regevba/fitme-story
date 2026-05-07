// src/proxy.ts
//
// Layer 1 of the unified-control-center blind-switch (PRD §6.1).
//
// Next.js 16 renamed middleware.ts → proxy.ts (clarifies it sits at the
// network boundary; partly motivated by CVE-2025-29927 middleware auth
// bypass via x-middleware-subrequest). Exported function must be named
// `proxy` (not `middleware`); runtime must be Node.js.
//
// ONLY gates /control-room/* routes — all showcase pages remain publicly
// accessible per user requirement 2026-04-26 ("only the dashboard is
// protected; showcase stays publicly accessible").
//
// Auth modes (UCC_AUTH_MODE):
//   - "basic"   → existing HTTP basic-auth (legacy path, used for previews + rollback)
//   - "passkey" → iron-session cookie required; redirect to /control-room/sign-in on miss
//   - "both"    → accept either (cutover window — preserves both paths)
//
// DASHBOARD_PUBLIC=true is an operator-only override that bypasses ALL auth
// (intended for local dev only).

import { NextResponse, type NextRequest } from 'next/server';
import { unsealSession, sessionConfig } from '@/lib/auth/iron-session-config';
import { getSession } from '@/lib/auth/redis-ttl-store';
import { logAuthEvent } from '@/lib/auth/audit-log';

const REALM = 'control-room';

type AuthMode = 'basic' | 'passkey' | 'both';

function getAuthMode(): AuthMode {
  const raw = (process.env.UCC_AUTH_MODE ?? 'basic').toLowerCase();
  if (raw === 'passkey' || raw === 'both' || raw === 'basic') return raw;
  return 'basic';
}

function isValidBasicAuth(authHeader: string | null): boolean {
  const expectedUser = process.env.DASHBOARD_USER;
  const expectedPass = process.env.DASHBOARD_PASS;
  if (!expectedUser || !expectedPass) return false;
  if (!authHeader || !authHeader.startsWith('Basic ')) return false;
  try {
    const encoded = authHeader.substring(6);
    const decoded = atob(encoded);
    const idx = decoded.indexOf(':');
    if (idx === -1) return false;
    const user = decoded.substring(0, idx);
    const pass = decoded.substring(idx + 1);
    return user === expectedUser && pass === expectedPass;
  } catch {
    return false;
  }
}

async function isValidPasskeySession(req: NextRequest): Promise<boolean> {
  const cookie = req.cookies.get(sessionConfig.cookieName)?.value;
  if (!cookie) return false;
  const session = await unsealSession(cookie);
  if (!session) return false;
  // Server-side allowlist check — instant revoke.
  const stored = await getSession(session.sid);
  if (!stored) return false;
  return true;
}

function challengeBasic(): NextResponse {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${REALM}"` },
  });
}

function redirectToSignIn(req: NextRequest): NextResponse {
  const url = new URL('/control-room/sign-in', req.url);
  url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

export async function proxy(req: NextRequest) {
  // Operator-only dev escape hatch.
  if (process.env.DASHBOARD_PUBLIC === 'true') return NextResponse.next();

  const mode = getAuthMode();

  // Public sign-in endpoints must remain reachable while unauthenticated.
  const path = req.nextUrl.pathname;
  if (
    path === '/control-room/sign-in' ||
    path === '/control-room/sign-in/recover' ||
    path.startsWith('/api/auth/') // WebAuthn ceremony endpoints
  ) {
    return NextResponse.next();
  }

  if (mode === 'basic') {
    if (!isValidBasicAuth(req.headers.get('authorization'))) {
      return challengeBasic();
    }
    return NextResponse.next();
  }

  if (mode === 'passkey') {
    if (!(await isValidPasskeySession(req))) {
      return redirectToSignIn(req);
    }
    return NextResponse.next();
  }

  // mode === 'both' — accept either; log which path was used.
  if (await isValidPasskeySession(req)) {
    return NextResponse.next();
  }
  if (isValidBasicAuth(req.headers.get('authorization'))) {
    // Best-effort audit log of the basic-auth path during cutover.
    // Don't await — proxy must stay fast.
    logAuthEvent({
      event_type: 'auth_basic_authenticated',
      operator_label: 'basic-auth-shared',
      outcome: 'success',
      ip: req.headers.get('x-forwarded-for') ?? undefined,
      user_agent: req.headers.get('user-agent') ?? undefined,
    }).catch(() => {});
    return NextResponse.next();
  }
  // Both failed → prefer the redirect path (more user-friendly than 401).
  return redirectToSignIn(req);
}

export const config = {
  // Matcher scopes proxy to /control-room/* + /api/auth/*. Showcase stays public.
  matcher: ['/control-room/:path*', '/api/auth/:path*'],
};
