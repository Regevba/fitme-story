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
  /** Override the default `/opengraph-image` (Next.js auto-generated
   * 1200×630 PNG from `src/app/opengraph-image.tsx`) fallback. Pass a
   * fully-qualified URL. 2026-05-27 fix: previous default was `/og.png`
   * which 404s — the Next.js Metadata API auto-emits the OG image at
   * `/opengraph-image`, not at `/og.png`. */
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
  const ogImage = image ?? `${SITE_BASE}/opengraph-image`;
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
  const ogImage = image ?? `${SITE_BASE}/opengraph-image`;
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
      logo: { '@type': 'ImageObject', url: `${SITE_BASE}/opengraph-image` },
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
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_BASE}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Pairs naturally with websiteJsonLd() on the homepage. Schema.org
// recommends both the WebSite + Organization entities for branded
// sites with an "About" or "Contact" surface. The fitme-story logo
// + sameAs (linked profiles) help Google's Knowledge Graph resolve
// the brand.
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_BASE,
    logo: `${SITE_BASE}/opengraph-image`,
    sameAs: [
      'https://github.com/Regevba/fitme-story',
      'https://github.com/Regevba/FitTracker2',
    ],
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

// Declares the /search page as a SearchResultsPage to search crawlers.
// Optional `query` populates the about-pattern: when present, Google's
// rich-results parser treats the page as a query-scoped surface and
// can render result-count snippets.
export function searchResultsPageJsonLd(query?: string, resultCount?: number) {
  const url = query
    ? `${SITE_BASE}/search?q=${encodeURIComponent(query)}`
    : `${SITE_BASE}/search`;
  return {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    url,
    name: query ? `Search results for "${query}"` : 'Search',
    description: query
      ? `Results for "${query}" across case studies, glossary, research, and framework docs.`
      : SITE_DESCRIPTION,
    ...(typeof resultCount === 'number' && resultCount >= 0
      ? {
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: resultCount,
          },
        }
      : {}),
  };
}
