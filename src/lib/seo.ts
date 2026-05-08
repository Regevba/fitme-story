import type { Metadata } from 'next';

// Per-page SEO metadata helper. Closes audit V-002 + V-012 + V-014
// (2026-05-08): only / had openGraph; 14+ public pages were inheriting
// the root layout's title with no per-page openGraph / twitter / canonical.
//
// Usage:
//   export const metadata: Metadata = buildMetadata({
//     title: 'The glossary',
//     description: '46 framework terms.',
//     slug: '/glossary',
//   });
//
// For dynamic routes use it inside generateMetadata():
//   export async function generateMetadata({ params }) {
//     const entry = await getCaseStudyBySlug(slug);
//     return buildMetadata({
//       title: entry.frontmatter.title,
//       description: '…',
//       slug: `/case-studies/${entry.frontmatter.slug}`,
//       type: 'article',
//       publishedAt: entry.frontmatter.date,
//     });
//   }

export const SITE_BASE = 'https://fitme-story.vercel.app';
export const SITE_NAME = 'fitme-story';
export const SITE_DESCRIPTION =
  'How a PM flow became a framework and grew up alongside a fitness app.';

export interface BuildMetadataParams {
  title: string;
  description: string;
  /** Path with leading slash. Defaults to '' (homepage). */
  slug?: string;
  /** og:type. 'article' for case studies + dev-guide; 'website' for everything else. */
  type?: 'website' | 'article';
  /** Override the default `/og.png` fallback. Pass a fully-qualified URL. */
  image?: string;
  /** ISO 8601. Only honored when type='article'. */
  publishedAt?: string;
  /** ISO 8601. Only honored when type='article'. */
  updatedAt?: string;
}

export function buildMetadata({
  title,
  description,
  slug = '',
  type = 'website',
  image,
  publishedAt,
  updatedAt,
}: BuildMetadataParams): Metadata {
  const path = slug.startsWith('/') ? slug : slug ? `/${slug}` : '';
  const url = path ? `${SITE_BASE}${path}` : SITE_BASE;
  const ogImage = image ?? `${SITE_BASE}/og.png`;
  // Append site name unless caller already included it (avoids "X — fitme-story — fitme-story")
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;

  const isArticle = type === 'article';

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      type,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(publishedAt && isArticle ? { publishedTime: publishedAt } : {}),
      ...(updatedAt && isArticle ? { modifiedTime: updatedAt } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}

// JSON-LD generators. Each returns a plain object that <JsonLd> renders
// as a <script type="application/ld+json"> in the page body. Closes the
// JSON-LD half of audit V-012.

export interface BlogPostingJsonLdParams {
  title: string;
  description: string;
  slug: string;
  publishedAt?: string;
  updatedAt?: string;
  image?: string;
  author?: string;
}

export function blogPostingJsonLd({
  title,
  description,
  slug,
  publishedAt,
  updatedAt,
  image,
  author = SITE_NAME,
}: BlogPostingJsonLdParams) {
  const path = slug.startsWith('/') ? slug : `/${slug}`;
  const url = `${SITE_BASE}${path}`;
  const ogImage = image ?? `${SITE_BASE}/og.png`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    image: ogImage,
    author: { '@type': 'Organization', name: author },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_BASE}/og.png` },
    },
    ...(publishedAt ? { datePublished: publishedAt } : {}),
    ...(updatedAt ? { dateModified: updatedAt } : {}),
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_BASE,
  };
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_BASE}${item.href}`,
    })),
  };
}
