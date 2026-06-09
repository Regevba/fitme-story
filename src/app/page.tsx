import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Hero } from '@/components/home/Hero';
import { NumbersPanel } from '@/components/home/NumbersPanel';
import { FeaturedStudies } from '@/components/home/FeaturedStudies';
import { JsonLd } from '@/components/JsonLd';
import { buildMetadata, websiteJsonLd, organizationJsonLd } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'How a PM flow became a framework',
  description:
    'PM flow, framework evolution, design system, case studies, and research from building FitMe.',
  slug: '/',
});

// Compact home (dual-audience redesign T5): who/what + audience chooser high up,
// numbers, lens-aware featured studies, then a CTA into the full /story
// narrative. The deep origin narrative + interactive timeline live on /story
// (T6); the former 4-persona ThreeWaysIn block is removed.
export default function HomePage() {
  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={organizationJsonLd()} />
      <Hero />
      <NumbersPanel />
      <FeaturedStudies />
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 pb-20 text-center">
        <Link
          href="/story"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] px-6 py-3 font-sans font-medium hover:border-[var(--color-brand-indigo)] hover:text-[var(--color-brand-indigo)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)]"
        >
          Read the full story — how it started, grew, and measures itself
          <ArrowRight size={16} aria-hidden />
        </Link>
      </section>
    </>
  );
}
