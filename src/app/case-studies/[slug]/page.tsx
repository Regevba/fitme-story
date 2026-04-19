import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc';
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

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = await getCaseStudyBySlug(slug);
  if (!entry) notFound();

  const components = useMDXComponents({});
  const { content } = await compileMDX({
    source: entry.body,
    components,
    options: { parseFrontmatter: false },
  });

  switch (entry.frontmatter.tier) {
    case 'flagship':
      return <FlagshipTemplate entry={entry}>{content}</FlagshipTemplate>;
    case 'standard':
      return <StandardTemplate entry={entry}>{content}</StandardTemplate>;
    case 'light':
    case 'appendix':
    default:
      return <LightTemplate entry={entry}>{content}</LightTemplate>;
  }
}
