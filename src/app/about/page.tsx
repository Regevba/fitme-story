import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import { Card } from '@/components/ui/Card';

export const metadata = buildMetadata({
  title: 'About',
  description: 'Who built this, why, and where to find the full archive.',
  slug: '/about',
});

export default function AboutPage() {
  return (
    <article className="max-w-[var(--measure-wide)] mx-auto px-6 py-16">
      <h1 className="font-serif text-[length:var(--text-display-lg)]">About</h1>
      {/* BHF-1 (DS lens audit 2026-05-10): migrated from inline rounded-md
          border + bg-neutral-50 pattern to <Card variant="tinted">. The aside
          element wraps Card so the aria-label + semantic role stay correct. */}
      <aside aria-label="Project disclaimer" className="not-prose mt-8 max-w-[var(--measure-body)]">
        <Card variant="tinted" padding="md" className="font-sans text-sm leading-relaxed text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
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
        </Card>
      </aside>
      <p className="mt-8 font-sans text-sm text-[var(--color-neutral-500)] max-w-[var(--measure-body)]">
        The fuller story — who built this, why, and how it grew — now lives on the{' '}
        <Link href="/" className="text-[var(--color-brand-indigo)] hover:underline">
          home page
        </Link>{' '}
        and the{' '}
        <Link href="/story" className="text-[var(--color-brand-indigo)] hover:underline">
          story
        </Link>
        .
      </p>
    </article>
  );
}
