/**
 * Regression tests for src/lib/seo.ts.
 *
 * Locks the 2026-05-27 fix: `buildMetadata()` previously defaulted
 * `og:image` to `${SITE_BASE}/og.png` which returned HTTP 404. The
 * Next.js Metadata API auto-emits the OG image at `/opengraph-image`
 * from `src/app/opengraph-image.tsx`. Social platforms (LinkedIn /
 * Twitter / Hacker News / dev.to) fetching the URL got 404 → broken
 * rich previews.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMetadata,
  blogPostingJsonLd,
  websiteJsonLd,
  organizationJsonLd,
  breadcrumbJsonLd,
  searchResultsPageJsonLd,
  SITE_BASE,
} from './seo';

test('buildMetadata() defaults og:image to /opengraph-image (not /og.png)', () => {
  const meta = buildMetadata({
    title: 'Test page',
    description: 'Test description',
    slug: '/test',
  });

  const ogImages = meta.openGraph?.images;
  assert.ok(Array.isArray(ogImages), 'openGraph.images must be an array');
  assert.equal(ogImages.length, 1, 'expected exactly 1 og:image');

  const firstImage = ogImages[0];
  const url = typeof firstImage === 'string' ? firstImage : firstImage.url;
  assert.equal(
    url,
    `${SITE_BASE}/opengraph-image`,
    'og:image must point at /opengraph-image (Next.js auto-route)',
  );
  assert.ok(
    !url.toString().includes('/og.png'),
    'og:image must NOT reference /og.png (404 — file does not exist)',
  );
});

test('buildMetadata() defaults twitter:image to /opengraph-image', () => {
  const meta = buildMetadata({
    title: 'Test page',
    description: 'Test description',
  });

  const twitterImages = meta.twitter?.images;
  assert.ok(twitterImages, 'twitter.images must be set');
  const url = Array.isArray(twitterImages) ? twitterImages[0] : twitterImages;
  assert.equal(
    typeof url === 'string' ? url : (url as { url: string }).url,
    `${SITE_BASE}/opengraph-image`,
    'twitter:image must point at /opengraph-image',
  );
});

test('buildMetadata() respects explicit image override', () => {
  const customImage = 'https://example.com/custom-og.png';
  const meta = buildMetadata({
    title: 'Test',
    description: 'Test',
    image: customImage,
  });

  const ogImages = meta.openGraph?.images;
  assert.ok(Array.isArray(ogImages));
  const firstImage = ogImages[0];
  const url = typeof firstImage === 'string' ? firstImage : firstImage.url;
  assert.equal(url, customImage, 'explicit image override must be used');
});

test('blogPostingJsonLd() defaults image + logo to /opengraph-image', () => {
  const jsonLd = blogPostingJsonLd({
    title: 'Test post',
    description: 'Test',
    slug: '/test',
  });

  assert.equal(
    jsonLd.image,
    `${SITE_BASE}/opengraph-image`,
    'BlogPosting.image must point at /opengraph-image',
  );
  assert.equal(
    jsonLd.publisher.logo.url,
    `${SITE_BASE}/opengraph-image`,
    'BlogPosting.publisher.logo.url must point at /opengraph-image',
  );
  assert.ok(
    !JSON.stringify(jsonLd).includes('/og.png'),
    'JSON-LD must NOT reference /og.png anywhere',
  );
});

test('buildMetadata() preserves canonical URL based on slug', () => {
  const meta = buildMetadata({
    title: 'Test',
    description: 'Test',
    slug: '/case-studies/example',
  });

  assert.equal(meta.alternates?.canonical, `${SITE_BASE}/case-studies/example`);
});

test('buildMetadata() handles empty slug (homepage)', () => {
  const meta = buildMetadata({
    title: 'Home',
    description: 'Home',
  });

  assert.equal(meta.alternates?.canonical, SITE_BASE);
  assert.equal(meta.openGraph?.url, SITE_BASE);
});

// ── C1 (2026-06-01) JSON-LD generator tests ────────────────────────

test('websiteJsonLd() declares WebSite + SearchAction for Sitelinks Search Box', () => {
  const ld = websiteJsonLd();
  assert.equal(ld['@type'], 'WebSite');
  assert.equal(ld.url, SITE_BASE);
  // SearchAction enables Google's in-result Sitelinks Search Box.
  const action = ld.potentialAction as Record<string, unknown>;
  assert.equal(action['@type'], 'SearchAction');
  const target = action.target as Record<string, unknown>;
  assert.equal(target['@type'], 'EntryPoint');
  assert.equal(
    target.urlTemplate,
    `${SITE_BASE}/search?q={search_term_string}`,
    'SearchAction.target.urlTemplate must match the /search?q= route',
  );
  assert.equal(action['query-input'], 'required name=search_term_string');
});

test('organizationJsonLd() declares Organization with logo + sameAs', () => {
  const ld = organizationJsonLd();
  assert.equal(ld['@type'], 'Organization');
  assert.equal(ld.url, SITE_BASE);
  assert.equal(ld.logo, `${SITE_BASE}/opengraph-image`,
    'Organization.logo must point at /opengraph-image (locks the V-012 fix)');
  assert.ok(Array.isArray(ld.sameAs), 'Organization.sameAs must be an array');
  assert.ok(
    (ld.sameAs as string[]).every((s) => s.startsWith('https://')),
    'sameAs entries must be absolute https URLs',
  );
});

test('breadcrumbJsonLd() emits ListItem entries with absolute URLs', () => {
  const ld = breadcrumbJsonLd([
    { name: 'Home', href: '/' },
    { name: 'Case Studies', href: '/case-studies' },
    { name: 'Example', href: '/case-studies/example' },
  ]);
  assert.equal(ld['@type'], 'BreadcrumbList');
  const items = ld.itemListElement as Array<Record<string, unknown>>;
  assert.equal(items.length, 3);
  assert.equal(items[0].position, 1);
  assert.equal(items[2].position, 3);
  assert.equal(items[2].item, `${SITE_BASE}/case-studies/example`,
    'BreadcrumbList items must be absolute URLs');
});

test('searchResultsPageJsonLd() returns query-scoped SearchResultsPage when query present', () => {
  const ld = searchResultsPageJsonLd('readiness', 12);
  assert.equal(ld['@type'], 'SearchResultsPage');
  assert.equal(ld.url, `${SITE_BASE}/search?q=readiness`);
  assert.equal(ld.name, 'Search results for "readiness"');
  const mainEntity = ld.mainEntity as Record<string, unknown>;
  assert.equal(mainEntity['@type'], 'ItemList');
  assert.equal(mainEntity.numberOfItems, 12);
});

test('searchResultsPageJsonLd() omits mainEntity when no result count', () => {
  const ld = searchResultsPageJsonLd();
  assert.equal(ld['@type'], 'SearchResultsPage');
  assert.equal(ld.url, `${SITE_BASE}/search`);
  assert.equal(ld.name, 'Search');
  assert.equal((ld as Record<string, unknown>).mainEntity, undefined);
});

test('searchResultsPageJsonLd() URL-encodes the query string', () => {
  const ld = searchResultsPageJsonLd('a b&c');
  assert.equal(ld.url, `${SITE_BASE}/search?q=a%20b%26c`);
});
