import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import type { Metadata } from 'next';
import { getAllCaseStudies, getCaseStudyBySlug } from '@/lib/content';
import { buildMetadata } from '@/lib/seo';
import { useMDXComponents } from '@/mdx-components';
import { LightTemplate } from '@/components/case-study/LightTemplate';
import { StandardTemplate } from '@/components/case-study/StandardTemplate';
import { FlagshipTemplate } from '@/components/case-study/FlagshipTemplate';
import { JsonLd } from '@/components/JsonLd';
import { blogPostingJsonLd, breadcrumbJsonLd } from '@/lib/seo';

export async function generateStaticParams() {
  const all = await getAllCaseStudies();
  return all
    .filter((c) => ['flagship', 'standard', 'light', 'appendix'].includes(c.frontmatter.tier))
    .map((c) => ({ slug: c.frontmatter.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getCaseStudyBySlug(slug);
  if (!entry) return { title: 'Not found' };
  const fm = entry.frontmatter;
  return buildMetadata({
    title: fm.title,
    description: fm.tldr ?? `Case study from the FitMe PM framework evolution (tier: ${fm.tier}).`,
    slug: `/case-studies/${fm.slug}`,
    type: 'article',
    publishedAt: fm.date,
  });
}

// Compute prev/next siblings in chronological (timeline-ordered) sequence.
// Audit CS-016 + CS-002 + R-003 (2026-05-08): TimelineNav exists but was
// never wired; this passes derived prev/next to the template so every
// case-study page renders a navigable footer link.
async function getSiblings(slug: string) {
  const all = await getAllCaseStudies();
  const i = all.findIndex((c) => c.frontmatter.slug === slug);
  if (i < 0) return { prev: undefined, next: undefined };
  const toSibling = (entry: (typeof all)[number]) => ({
    href: `/case-studies/${entry.frontmatter.slug}`,
    label: entry.frontmatter.title,
  });
  return {
    prev: i > 0 ? toSibling(all[i - 1]) : undefined,
    next: i < all.length - 1 ? toSibling(all[i + 1]) : undefined,
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = await getCaseStudyBySlug(slug);
  if (!entry) notFound();

  const components = useMDXComponents({});
  const { content } = await compileMDX({
    source: entry.body,
    components,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        // Audit CS-007 (2026-05-08): every heading becomes an anchor target.
        // Audit T17 P-MDX-CODE (2026-05-08): rehype-pretty-code adds shiki
        // syntax highlighting to fenced code blocks; pairs with the Pre
        // wrapper in mdx-components.tsx for the copy-button overlay.
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: 'wrap',
              properties: {
                className: ['heading-anchor'],
                ariaLabel: 'Permalink to this section',
              },
            },
          ],
          [
            rehypePrettyCode,
            {
              theme: { light: 'github-light', dark: 'github-dark' },
              keepBackground: false,
            },
          ],
        ],
      },
    },
  });

  const siblings = await getSiblings(slug);

  // JSON-LD payloads. BlogPosting describes the case study to Google's
  // article-card parser; BreadcrumbList feeds the SERP breadcrumb trail
  // (Home → Case Studies → {title}).
  const fm = entry.frontmatter;
  const articleJsonLd = blogPostingJsonLd({
    title: fm.title,
    description: fm.tldr ?? `Case study from the FitMe PM framework evolution.`,
    slug: `/case-studies/${fm.slug}`,
    publishedAt: fm.date,
    updatedAt: fm.date_written ?? fm.date,
  });
  const crumbsJsonLd = breadcrumbJsonLd([
    { name: 'Home', href: '/' },
    { name: 'Case Studies', href: '/case-studies' },
    { name: fm.title, href: `/case-studies/${fm.slug}` },
  ]);

  switch (entry.frontmatter.tier) {
    case 'flagship':
      return (
        <>
          <JsonLd data={articleJsonLd} />
          <JsonLd data={crumbsJsonLd} />
          <FlagshipTemplate entry={entry} siblings={siblings}>
            {content}
          </FlagshipTemplate>
        </>
      );
    case 'standard':
      return (
        <>
          <JsonLd data={articleJsonLd} />
          <JsonLd data={crumbsJsonLd} />
          <StandardTemplate entry={entry} siblings={siblings}>
            {content}
          </StandardTemplate>
        </>
      );
    case 'light':
    case 'appendix':
    default:
      return (
        <>
          <JsonLd data={articleJsonLd} />
          <JsonLd data={crumbsJsonLd} />
          <LightTemplate entry={entry} siblings={siblings}>
            {content}
          </LightTemplate>
        </>
      );
  }
}
