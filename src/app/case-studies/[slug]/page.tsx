import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import type { Metadata } from 'next';
import { getAllCaseStudies, getCaseStudyBySlug } from '@/lib/content';
import { useMDXComponents } from '@/mdx-components';
import { LightTemplate } from '@/components/case-study/LightTemplate';
import { StandardTemplate } from '@/components/case-study/StandardTemplate';
import { FlagshipTemplate } from '@/components/case-study/FlagshipTemplate';

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
  return {
    title: `${entry.frontmatter.title} — fitme-story`,
    description: `Case study from the FitMe PM framework evolution (tier: ${entry.frontmatter.tier}).`,
  };
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
        // rehype-slug adds id="..." to h1-h6; rehype-autolink-headings wraps
        // the text in a self-link so each heading is deep-linkable.
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
        ],
      },
    },
  });

  const siblings = await getSiblings(slug);

  switch (entry.frontmatter.tier) {
    case 'flagship':
      return (
        <FlagshipTemplate entry={entry} siblings={siblings}>
          {content}
        </FlagshipTemplate>
      );
    case 'standard':
      return (
        <StandardTemplate entry={entry} siblings={siblings}>
          {content}
        </StandardTemplate>
      );
    case 'light':
    case 'appendix':
    default:
      return (
        <LightTemplate entry={entry} siblings={siblings}>
          {content}
        </LightTemplate>
      );
  }
}
