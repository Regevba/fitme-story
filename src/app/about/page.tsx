import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — fitme-story',
  description: 'Who built this, why, and where to find the full archive.',
};

export default function AboutPage() {
  return (
    <article className="max-w-[var(--measure-wide)] mx-auto px-6 py-16">
      <h1 className="font-serif text-[length:var(--text-display-lg)]">About</h1>
      <div className="prose prose-lg max-w-[var(--measure-body)] mt-8">
        <p>
          FitMe started as a school project — an iOS app that unifies training, nutrition, recovery, and body composition.
          The interesting part isn&apos;t the app. It&apos;s what happened while building it.
        </p>
        <p>
          I built an AI-orchestrated PM workflow — <code>/pm-workflow</code> — to enforce the planning discipline I kept
          abandoning. Then the workflow itself started evolving. Caches, eval layers, dispatch intelligence, measurement.
          By v6.1 it was routing to hardware-aware models.
        </p>
        <p>
          This site is the guided tour of that process. All docs are from real shipped work. All metrics are measured,
          not estimated. The regressions are as public as the successes.
        </p>
        <h2>Links</h2>
        <ul>
          <li>
            <a href="https://github.com/Regevba/fitme-showcase">fitme-showcase</a> — canonical markdown docs (GitHub)
          </li>
          <li>
            <Link href="/case-studies">case studies</Link> — 13 chronological deep-dives
          </li>
          <li>
            <Link href="/framework">the framework</Link> — floor by floor
          </li>
          <li>
            <Link href="/research">research</Link> — where this pointed next
          </li>
        </ul>
        <h2>Contact</h2>
        <p>regvash21@gmail.com</p>
      </div>
    </article>
  );
}
