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
      <aside
        aria-label="Project disclaimer"
        className="not-prose mt-8 max-w-[var(--measure-body)] rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)] p-5 font-sans text-sm leading-relaxed text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]"
      >
        <p className="text-xs uppercase tracking-wider text-[var(--color-neutral-500)] mb-2">
          Disclaimer
        </p>
        <p>
          This is an experiment. Everything on this site — the framework, the case
          studies, the audits, the metrics, the app itself — was built to teach
          myself what working with AI on real product development actually feels
          like, from first sketch to last commit. The goal was the learning; the
          artifacts are byproducts. Read it as one person&apos;s working notebook —
          how plans form, how builds break, how audits surface what you missed,
          how iteration plays out across days and weeks. Nothing here claims to be
          finished, generalizable, or anyone&apos;s recipe to follow.{' '}
          <strong>The <em>how</em> matters more than the <em>what</em>.</strong>
        </p>
      </aside>
      <div className="prose prose-lg dark:prose-invert max-w-[var(--measure-body)] mt-8">
        <p>
          FitMe is a personal project — an iOS app I built to track my own fitness and wellbeing the way I wanted: fast,
          privacy-first, and entirely owned by the person using it. Data stays on-device by default, analysis happens
          locally when possible, and no health signal gets silently shipped to a cloud AI.
          The interesting part isn&apos;t the app. It&apos;s what happened while building it.
        </p>
        <p>
          I built an AI-orchestrated PM workflow — <code>/pm-workflow</code> — to enforce the planning discipline I kept
          abandoning. Then the workflow itself started evolving. Caches, eval layers, dispatch intelligence, measurement.
          By v7.0 it was routing to hardware-aware models.
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
            <Link href="/pm-flow">pm flow</Link> — the phases, skills, and shared-state model
          </li>
          <li>
            <Link href="/framework">framework</Link> — the six-floor architecture
          </li>
          <li>
            <Link href="/design-system">design system</Link> — tokens, principles, and shipped UI
          </li>
          <li>
            <Link href="/case-studies">case studies</Link> — chronological deep-dives
          </li>
          <li>
            <Link href="/research">research</Link> — where the framework pointed next
          </li>
        </ul>
        <h2>Contact</h2>
        <ul>
          <li>Email: <a href="mailto:Regev.ba@gmail.com">Regev.ba@gmail.com</a></li>
          <li>LinkedIn: <a href="https://www.linkedin.com/in/regev-barak/" target="_blank" rel="noopener noreferrer">linkedin.com/in/regev-barak</a></li>
          <li>Resume: <a href="/resume.pdf" download>Download PDF</a></li>
        </ul>
      </div>
    </article>
  );
}
