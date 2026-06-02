import { Hero } from '@/components/home/Hero';
import { OriginNarrative } from '@/components/home/OriginNarrative';
import { Timeline } from '@/components/home/Timeline';
import { NumbersPanel } from '@/components/home/NumbersPanel';
import { ThreeWaysIn } from '@/components/home/ThreeWaysIn';
import { JsonLd } from '@/components/JsonLd';
import { buildAllTimelines } from '@/lib/timeline';
import { buildMetadata, websiteJsonLd, organizationJsonLd } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'How a PM flow became a framework',
  description:
    'PM flow, framework evolution, design system, case studies, and research from building FitMe.',
  slug: '/',
});

export default async function HomePage() {
  const timelines = await buildAllTimelines();
  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={organizationJsonLd()} />
      <Hero />
      <OriginNarrative />
      <Timeline timelines={timelines} />
      <NumbersPanel />
      <ThreeWaysIn />
    </>
  );
}
