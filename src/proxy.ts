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
// Toggle via Vercel env vars (no rebuild required to change DASHBOARD_PUBLIC):
//   - DASHBOARD_PUBLIC = "true"  → no auth required (operator dev mode)
//   - DASHBOARD_PUBLIC = anything else (default) → basic-auth required
//   - DASHBOARD_USER + DASHBOARD_PASS → credentials for the basic-auth gate
//
// Layer 2 (sitemap + robots) is unconditional — see src/app/sitemap.ts + robots.ts.
// Layer 3 (build-time inclusion flag) — see next.config.ts DASHBOARD_BUILD.
//
// Auth posture (per vercel-plugin:auth skill): basic-auth in the network
// proxy is appropriate as a single-operator internal-artifact gate. Full
// auth providers (Clerk/Descope/Auth0) are intentionally NOT used —
// overkill for single-operator scope; deferred to v2 if multi-operator
// becomes real (see PRD §15 Q1).

import { NextResponse, type NextRequest } from 'next/server';

const REALM = 'control-room';

function isValidBasicAuth(authHeader: string | null): boolean {
  const expectedUser = process.env.DASHBOARD_USER;
  const expectedPass = process.env.DASHBOARD_PASS;

  // Fail closed: if creds are not configured, reject all requests when
  // DASHBOARD_PUBLIC is not "true". Prevents an accidental "no auth
  // required because env vars never got set" deployment.
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

export function proxy(req: NextRequest) {
  const dashboardPublic = process.env.DASHBOARD_PUBLIC === 'true';
  if (dashboardPublic) return NextResponse.next();

  if (!isValidBasicAuth(req.headers.get('authorization'))) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': `Basic realm="${REALM}"` },
    });
  }

  return NextResponse.next();
}

export const config = {
  // Matcher scopes proxy to /control-room/* ONLY.
  // This is THE rule that keeps the showcase public — do not broaden without
  // explicit re-approval (see PRD §6.1 + user instruction 2026-04-26).
  matcher: '/control-room/:path*',
  // NOTE: do NOT declare `runtime`. Next.js 16 proxy.ts ALWAYS runs on
  // the Node.js runtime; declaring it here is a build error
  // (Route segment config is not allowed in Proxy file).
};
