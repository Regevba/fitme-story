import type { MetadataRoute } from 'next';
import { getAllCaseStudies } from '@/lib/content';
import { FRAMEWORK_VERSIONS } from '@/lib/timeline';

// Layer 2 of the unified-control-center blind-switch (PRD §6.2):
// /control-room/* routes are NEVER added to the sitemap, regardless of
// DASHBOARD_PUBLIC. Crawlers must never discover dashboard URLs.
// See src/app/robots.ts for the matching Disallow rule + src/proxy.ts for Layer 1.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://fitme-story.vercel.app';
  const now = new Date();
  const staticRoutes = [
    '',
    '/case-studies',
    '/framework',
    '/framework/dispatch',
    '/framework/dev-guide',
    '/design-system',
    '/research',
    '/about',
    '/glossary',
    '/pm-flow',
    '/trust',
    '/trust/audits/2026-04-21-gemini',
    '/case-studies/operations-layer',
    // NOTE: /control-room/* deliberately omitted — see src/proxy.ts + src/app/robots.ts.
  ];
  const studies = await getAllCaseStudies();
  const studyRoutes = studies
    .filter((c) => ['flagship', 'standard', 'light', 'appendix'].includes(c.frontmatter.tier))
    .map((c) => `/case-studies/${c.frontmatter.slug}`);
  const versionRoutes = FRAMEWORK_VERSIONS.map((v) => `/timeline/${v.version}`);

  return [...staticRoutes, ...studyRoutes, ...versionRoutes].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
  }));
}
