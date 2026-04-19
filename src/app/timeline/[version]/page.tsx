import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { FRAMEWORK_VERSIONS } from '@/lib/timeline';
import { getAllCaseStudies } from '@/lib/content';

export async function generateStaticParams() {
  return FRAMEWORK_VERSIONS.map((v) => ({ version: v.version }));
}

export async function generateMetadata({ params }: { params: Promise<{ version: string }> }): Promise<Metadata> {
  const { version } = await params;
  const v = FRAMEWORK_VERSIONS.find((x) => x.version === version);
  if (!v) return { title: 'Not found' };
  return {
    title: `v${v.version} — ${v.headline} — fitme-story`,
    description: v.headline,
  };
}

export default async function VersionPage({ params }: { params: Promise<{ version: string }> }) {
  const { version } = await params;
  const v = FRAMEWORK_VERSIONS.find((x) => x.version === version);
  if (!v) notFound();

  const all = await getAllCaseStudies();
  const studies = all.filter((c) => c.frontmatter.timeline_position?.version === version);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="font-sans text-sm uppercase tracking-wider text-[var(--color-neutral-500)]">
        Framework version · {v.date}
      </div>
      <h1 className="mt-3 font-serif text-[length:var(--text-display-lg)]">v{v.version}</h1>
      <p className="mt-4 text-xl text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
        {v.headline}
      </p>
      <div className="mt-8 flex items-baseline gap-2">
        <span className="text-4xl font-semibold text-[var(--color-brand-indigo)]">{v.keyMetric.value}</span>
        <span className="text-sm text-[var(--color-neutral-500)] font-sans">{v.keyMetric.label}</span>
      </div>
      <h2 className="mt-16 font-serif text-2xl">Case studies in this version</h2>
      <ul className="mt-4 space-y-3">
        {studies.map((c) => (
          <li key={c.frontmatter.slug}>
            <Link href={`/case-studies/${c.frontmatter.slug}`} className="underline hover:text-[var(--color-brand-indigo)]">
              {c.frontmatter.title}
            </Link>
          </li>
        ))}
        {studies.length === 0 && <li className="text-[var(--color-neutral-500)]">No detailed case studies yet for this version.</li>}
      </ul>
    </div>
  );
}
