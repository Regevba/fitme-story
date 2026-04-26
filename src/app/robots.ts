import type { MetadataRoute } from 'next';

// Layer 2 of the unified-control-center blind-switch (PRD §6.2):
// Disallow /control-room/* unconditionally. Must NEVER appear in crawler
// indexes regardless of DASHBOARD_PUBLIC. See src/app/sitemap.ts (omits
// the routes from the sitemap) and src/proxy.ts (Layer 1 auth gate).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/control-room' },
    ],
    sitemap: 'https://fitme-story.vercel.app/sitemap.xml',
  };
}
