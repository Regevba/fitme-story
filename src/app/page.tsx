import { Hero } from '@/components/home/Hero';
import { OriginNarrative } from '@/components/home/OriginNarrative';
import { Timeline } from '@/components/home/Timeline';
import { NumbersPanel } from '@/components/home/NumbersPanel';
import { buildAllTimelines } from '@/lib/timeline';

export default async function HomePage() {
  const timelines = await buildAllTimelines();
  return (
    <>
      <Hero />
      <OriginNarrative />
      <Timeline timelines={timelines} />
      <NumbersPanel />
    </>
  );
}
