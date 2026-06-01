import type { MetadataRoute } from 'next';
import { getAllCaseStudies } from '@/lib/content';
import { FRAMEWORK_VERSIONS } from '@/lib/timeline';

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

// Layer 2 of the unified-control-center blind-switch (PRD §6.2):
// /control-room/* routes are NEVER added to the sitemap, regardless of
// DASHBOARD_PUBLIC. Crawlers must never discover dashboard URLs.
// See src/app/robots.ts for the matching Disallow rule + src/proxy.ts for Layer 1.
//
// changeFrequency + priority are SEO hints — not strict directives. Google
// largely ignores them as of 2026 (algorithmic crawl-frequency dominates)
// but Bing + Yandex + smaller crawlers still honor them. Costs nothing to
// emit. Priority is RELATIVE within the sitemap (default 0.5; we use
// 0.4-1.0 to reflect the home/case-studies/framework hierarchy).
//
// Per-case-study lastModified uses frontmatter.date (the Zod schema in
// src/lib/content-schema.ts exposes `date` but strips `date_written` —
// the latter exists in raw MDX frontmatter but never reaches the typed
// surface). Lets crawlers prioritize fresh case studies over the
// chronological-order legacy slot numbers.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://fitme-story.vercel.app';
  const now = new Date();

  const staticRoutes: Array<{ path: string; changeFrequency: ChangeFrequency; priority: number }> = [
    { path: '',                                 changeFrequency: 'weekly',  priority: 1.0 },
    { path: '/case-studies',                    changeFrequency: 'weekly',  priority: 0.9 },
    { path: '/case-studies/compare',            changeFrequency: 'weekly',  priority: 0.7 },
    { path: '/case-studies/operations-layer',   changeFrequency: 'monthly', priority: 0.7 },
    { path: '/framework',                       changeFrequency: 'weekly',  priority: 0.9 },
    { path: '/framework/dispatch',              changeFrequency: 'monthly', priority: 0.7 },
    { path: '/framework/dev-guide',             changeFrequency: 'weekly',  priority: 0.8 },
    { path: '/design-system',                   changeFrequency: 'monthly', priority: 0.7 },
    { path: '/research',                        changeFrequency: 'monthly', priority: 0.7 },
    { path: '/about',                           changeFrequency: 'yearly',  priority: 0.5 },
    { path: '/glossary',                        changeFrequency: 'weekly',  priority: 0.7 },
    { path: '/pm-flow',                         changeFrequency: 'monthly', priority: 0.7 },
    { path: '/trust',                           changeFrequency: 'monthly', priority: 0.6 },
    { path: '/trust/audits/2026-04-21-gemini',  changeFrequency: 'yearly',  priority: 0.5 },
    // NOTE: /search NOT included — it's a function, not content. Sitelinks
    // Search Box discovery happens through the SearchAction in WebSite
    // JSON-LD on the homepage.
    // NOTE: /control-room/* deliberately omitted — see src/proxy.ts + src/app/robots.ts.
  ];

  const studies = await getAllCaseStudies();
  const studyRoutes = studies
    .filter((c) => ['flagship', 'standard', 'light', 'appendix'].includes(c.frontmatter.tier))
    .map((c) => {
      const fm = c.frontmatter;
      return {
        path: `/case-studies/${fm.slug}`,
        changeFrequency: 'monthly' as ChangeFrequency,
        priority: fm.tier === 'flagship' ? 0.8 : 0.6,
        lastModifiedRaw: fm.date,
      };
    });

  const versionRoutes = FRAMEWORK_VERSIONS.map((v) => ({
    path: `/timeline/${v.version}`,
    changeFrequency: 'monthly' as ChangeFrequency,
    priority: 0.6,
  }));

  return [
    ...staticRoutes.map((r) => ({
      url: `${base}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...studyRoutes.map((r) => ({
      url: `${base}${r.path}`,
      lastModified: r.lastModifiedRaw ? new Date(r.lastModifiedRaw) : now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...versionRoutes.map((r) => ({
      url: `${base}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
  ];
}
