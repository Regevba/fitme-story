import type { Frontmatter } from '@/lib/content-schema';

const REPO_BLOB_BASE = 'https://github.com/Regevba/FitTracker2/blob';

function buildUrl(fm: Frontmatter): string | null {
  if (!fm.upstream_path) return null;
  return `${REPO_BLOB_BASE}/main/${fm.upstream_path}`;
}

export function FullCaseStudyLink({ fm }: { fm: Frontmatter }) {
  const url = buildUrl(fm);
  if (!url) return null;
  return (
    <aside
      aria-label="Full case study"
      className="not-prose mt-12 rounded-xl border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-800)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)] p-6"
    >
      <p className="font-sans text-xs uppercase tracking-wider font-bold text-[var(--color-brand-coral)] mb-2">
        Want more detail?
      </p>
      <p className="font-sans text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] mb-4 leading-relaxed">
        This is the narrative version. The canonical write-up — with the full audit trail,
        every finding, all referenced PRs, and the complete decisions log — lives in the
        FitTracker2 repo.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-[var(--color-brand-indigo)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--color-brand-indigo)] focus-visible:outline-offset-2 rounded"
      >
        Read the full case study on GitHub
        <span aria-hidden="true">→</span>
      </a>
    </aside>
  );
}
