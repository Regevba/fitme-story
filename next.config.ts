import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

// Layer 3 of the unified-control-center blind-switch (PRD §6.3):
// DASHBOARD_BUILD env var. If "false", /control-room/* routes are
// rewritten to /404 — the dashboard becomes inaccessible regardless of
// auth state. Default is "true" (gated, not erased).
//
// Note: Next.js 16 uses Turbopack by default. A webpack IgnorePlugin
// (per the original PRD §6.3 sketch) would be ignored by Turbopack, so
// we rely on rewrites alone for v1. If true bundle-drop becomes
// critical, switch the project to webpack via `bundler: 'webpack'`
// AND add the IgnorePlugin — but the rewrite alone makes /control-room
// uncrawlable + unservable, which satisfies the spec.
const includeDashboard = process.env.DASHBOARD_BUILD !== 'false';

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  experimental: {
    mdxRs: true,
  },
  ...(includeDashboard
    ? {}
    : {
        async rewrites() {
          return [
            { source: '/control-room', destination: '/404' },
            { source: '/control-room/:path*', destination: '/404' },
          ];
        },
      }),
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
});

export default withMDX(nextConfig);
