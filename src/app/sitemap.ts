import type { MetadataRoute } from 'next';
import { getAllCaseStudies } from '@/lib/content';
import { FRAMEWORK_VERSIONS } from '@/lib/timeline';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://fitme-story.vercel.app';
  const now = new Date();
  const staticRoutes = [
    '',
    '/case-studies',
    '/framework',
    '/framework/dispatch',
    '/design-system',
    '/research',
    '/about',
    '/trust',
    '/case-studies/operations-layer',
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
