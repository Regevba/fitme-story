import Link from 'next/link';
import type { Metadata } from 'next';
import { getByTier } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Case studies — fitme-story',
  description: '13 chronological case studies from the FitMe PM framework evolution.',
};

export default async function CaseStudiesIndex() {
  const [flagship, standard, light, appendix] = await Promise.all([
    getByTier('flagship'),
    getByTier('standard'),
    getByTier('light'),
    getByTier('appendix'),
  ]);

  type Entry = typeof flagship[number];

  const Section = ({ title, items }: { title: string; items: Entry[] }) => (
    <section className="mb-16">
      <h2 className="font-serif text-2xl mb-6">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-neutral-500)] font-sans">None yet.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((c) => (
            <li key={c.frontmatter.slug}>
              <Link
                href={`/case-studies/${c.frontmatter.slug}`}
                className="block group p-4 rounded-lg hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)]"
              >
                <div className="font-sans text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">
                  {c.frontmatter.timeline_position ? `v${c.frontmatter.timeline_position.version} · ` : null}
                  {c.readingTimeMin} min read
                </div>
                <div className="mt-1 font-serif text-lg group-hover:text-[var(--color-brand-indigo)]">
                  {c.frontmatter.title}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-serif text-[length:var(--text-display-lg)] mb-12">Case studies</h1>
      <section className="mb-10 rounded-lg border border-[var(--color-brand-coral)] bg-[color-mix(in_srgb,var(--color-brand-coral)_8%,transparent)] p-5 font-sans text-sm">
        <p className="font-semibold text-[var(--color-brand-coral)] uppercase tracking-wider text-xs mb-2">
          Independent audit in progress
        </p>
        <p className="text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          All case studies and the site&apos;s source code are currently being reviewed by an independent external AI model
          as a neutral second pass — checking accuracy, methodology, and honesty. Results and the reviewer&apos;s findings will
          be published here when they come in.
        </p>
      </section>
      <Section title="Flagship" items={flagship} />
      <Section title="Standard" items={standard} />
      <Section title="Light" items={light} />
      <section className="mb-16">
        <h2 className="font-serif text-2xl mb-6">Supporting (Operations Layer)</h2>
        <ul className="space-y-4">
          <li>
            <Link
              href="/case-studies/operations-layer"
              className="block group p-4 rounded-lg hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)]"
            >
              <div className="font-sans text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">
                3 short studies combined
              </div>
              <div className="mt-1 font-serif text-lg group-hover:text-[var(--color-brand-indigo)]">
                The operations layer in practice
              </div>
            </Link>
          </li>
        </ul>
      </section>
      <Section title="Appendix" items={appendix} />
    </div>
  );
}
