import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { getAllCaseStudies } from '@/lib/content';
import CaseStudyComparisonTable, {
  type ComparisonRow,
} from '@/components/case-study/CaseStudyComparisonTable';

export const metadata: Metadata = {
  title: 'Compare all case studies — fitme-story',
  description:
    'Cross-case-study comparison table. Sort by version, date, tier, or work type. Filter and search across every shipped case study at a glance.',
};

export default async function ComparePage() {
  const all = await getAllCaseStudies();

  const rows: ComparisonRow[] = all.map((c) => {
    const fm = c.frontmatter;
    const headline = Array.isArray(fm.key_numbers) && fm.key_numbers.length > 0 ? fm.key_numbers[0] : null;
    const headlineString = headline ? `${headline.value} — ${headline.label}` : null;
    return {
      slug: fm.slug,
      title: fm.title,
      version: fm.timeline_position?.version ?? null,
      date: fm.date ?? null,
      // work_type isn't in the Zod schema explicitly but commonly exists in
      // frontmatter; read it via index access since the schema accepts unknown
      // top-level keys (passthrough behavior).
      workType: ((fm as unknown) as Record<string, unknown>).work_type as string | undefined ?? null,
      tier: fm.tier,
      tldr: fm.tldr ?? null,
      headlineNumber: headlineString,
      killFired: fm.kill_criterion_fired ?? null,
    };
  });

  return (
    <article className="mx-auto max-w-6xl px-6 py-16">
      <nav className="mb-6">
        <Link
          href="/case-studies"
          className="inline-flex items-center gap-1 text-sm text-slate-500 underline-offset-4 hover:underline hover:text-slate-700 dark:text-white/50 dark:hover:text-white/80"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
          Back to case studies
        </Link>
      </nav>

      <header className="mb-8 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-white/40">
          Cross-corpus comparison
        </p>
        <h1 className="mt-2 font-serif text-[length:var(--text-display-lg)] text-slate-950 dark:text-white">
          Every case study at a glance
        </h1>
        <p className="mt-4 text-base text-slate-600 dark:text-white/70">
          {rows.length} shipped case studies, sortable and filterable. Click any row to open the
          full study. The table reads frontmatter directly — when a study lands or its frontmatter
          updates, this page reflects it on the next deploy.
        </p>
      </header>

      <CaseStudyComparisonTable rows={rows} />
    </article>
  );
}
