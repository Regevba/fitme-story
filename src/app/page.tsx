import type { Metadata } from 'next';
import { Hero } from '@/components/home/Hero';
import { OriginNarrative } from '@/components/home/OriginNarrative';
import { Timeline } from '@/components/home/Timeline';
import { NumbersPanel } from '@/components/home/NumbersPanel';
import { ThreeWaysIn } from '@/components/home/ThreeWaysIn';
import { buildAllTimelines } from '@/lib/timeline';

export const metadata: Metadata = {
  title: 'fitme-story — how a PM flow became a framework',
  description: 'PM flow, framework evolution, design system, case studies, and research from building FitMe.',
  openGraph: {
    title: 'fitme-story',
    description: 'How a PM flow became a framework and grew up alongside a fitness app.',
    type: 'website',
    url: 'https://fitme-story.vercel.app',
  },
};

export default async function HomePage() {
  const timelines = await buildAllTimelines();
  return (
    <>
      <Hero />
      <OriginNarrative />
      <Timeline timelines={timelines} />
      <NumbersPanel />
      <ThreeWaysIn />
    </>
  );
}
