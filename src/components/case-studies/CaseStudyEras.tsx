'use client';

// Era-grouped, newest-first case-study accordions (dual-audience redesign T8).
// Re-groups reactively on lens change (buildEraGroups is pure) so row ordering
// follows the active audience. Reuses the design-system Disclosure + Tag and
// the exact token/typography classes the rest of /case-studies uses.

import Link from 'next/link';
import { useId, useState } from 'react';
import { Disclosure } from '@/components/ui/Disclosure';
import { Tag } from '@/components/ui/Tag';
import { useLens } from '@/lib/lens-client';
import { trackCaseStudyEraExpand, trackCaseStudyOpen } from '@/lib/lens-analytics';
import { buildEraGroups, type GroupableStudy } from '@/lib/case-study-grouping';

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmtDate(iso: string): string | null {
  const m = iso.match(/^(\d{4})-(\d{2})-\d{2}/);
  if (!m) return null;
  const month = MONTH_ABBR[parseInt(m[2], 10) - 1];
  return month ? `${month} ${m[1]}` : null;
}

function StudyRow({
  study,
  eraId,
  lens,
}: {
  study: GroupableStudy;
  eraId: string;
  lens: string;
}) {
  const date = fmtDate(study.date);
  return (
    <li>
      <Link
        href={`/case-studies/${study.slug}`}
        onClick={() => trackCaseStudyOpen(study.slug, eraId, lens === 'dev' || lens === 'pm' ? lens : null)}
        className="block group py-3 px-2 -mx-2 rounded hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)] transition-colors"
      >
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="font-sans text-xs uppercase tracking-wider text-[var(--color-neutral-500)] font-medium whitespace-nowrap">
            {study.version ? `v${study.version}` : 'meta'}
          </span>
          <span className="font-serif text-base group-hover:text-[var(--color-brand-indigo)] flex-1">
            {study.title}
            {study.isMilestone && (
              <span className="ml-2 align-middle">
                <Tag variant="flagship">Milestone</Tag>
              </span>
            )}
          </span>
          {date && (
            <span className="font-sans text-xs text-[var(--color-neutral-500)] whitespace-nowrap">{date}</span>
          )}
          <span className="font-sans text-xs text-[var(--color-neutral-500)] whitespace-nowrap">
            {study.readingTimeMin} min
          </span>
        </div>
      </Link>
    </li>
  );
}

export function CaseStudyEras({ studies }: { studies: GroupableStudy[] }) {
  const lens = useLens() ?? 'pm';
  const eras = buildEraGroups(studies, lens);
  // "Expand all" remounts the Disclosures (uncontrolled) with defaultOpen=true
  // via a bumped key, since Disclosure manages its own open state.
  const [forceOpenEpoch, setForceOpenEpoch] = useState(0);
  const headingId = useId();

  return (
    <section className="mb-20" aria-labelledby={headingId}>
      <h2 id={headingId} className="font-serif text-[length:var(--text-display-md)] mb-2">
        Browse by era
      </h2>
      <p className="font-sans text-sm text-[var(--color-neutral-500)] mb-4 max-w-[var(--measure-body)]">
        Grouped by framework era, newest first — the latest work is one click away. Each era pins its
        milestone(s), then sub-groups by subject. Ordering follows your selected lens.
      </p>

      {/* Sticky era jump-nav + expand-all */}
      <nav
        aria-label="Jump to era"
        className="sticky top-0 z-10 -mx-2 mb-4 flex flex-wrap items-center gap-2 bg-[var(--color-neutral-50)]/90 dark:bg-[var(--color-neutral-900)]/90 backdrop-blur px-2 py-2 border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-800)]"
      >
        {eras.map((era) => (
          <a
            key={era.id}
            href={`#era-${era.id}`}
            className="font-sans text-xs rounded-full border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] px-3 py-1 text-[var(--color-brand-indigo)] hover:border-[var(--color-brand-indigo)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)]"
          >
            {era.id.toUpperCase()} <span className="text-[var(--color-neutral-500)]">{era.count}</span>
          </a>
        ))}
        <button
          type="button"
          onClick={() => setForceOpenEpoch((n) => n + 1)}
          className="ml-auto font-sans text-xs font-medium text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] hover:text-[var(--color-brand-indigo)] min-h-[32px] px-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)] rounded"
        >
          Expand all
        </button>
      </nav>

      <div className="space-y-3">
        {eras.map((era) => (
          <div key={era.id} id={`era-${era.id}`} className="scroll-mt-16">
            <Disclosure
              key={`${era.id}:${forceOpenEpoch}`}
              label={`${era.label}`}
              summary={`${era.count} ${era.count === 1 ? 'study' : 'studies'}`}
              defaultOpen={forceOpenEpoch > 0 || era.defaultOpen}
              onToggle={(open) => trackCaseStudyEraExpand(era.id, open)}
            >
              {era.milestones.length > 0 && (
                <div className="mb-4 rounded-lg border border-dashed border-[var(--color-brand-coral)] bg-[var(--color-brand-coral)]/5 px-4 py-3">
                  <h4 className="font-sans text-xs uppercase tracking-wider font-semibold text-[var(--color-neutral-500)] mb-2">
                    Milestone{era.milestones.length > 1 ? 's' : ''}
                  </h4>
                  <ul className="space-y-3">
                    {era.milestones.map((s) => (
                      <li key={s.slug}>
                        <Link
                          href={`/case-studies/${s.slug}`}
                          onClick={() =>
                            trackCaseStudyOpen(s.slug, era.id, lens === 'dev' || lens === 'pm' ? lens : null)
                          }
                          className="block group"
                        >
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span
                              aria-hidden="true"
                              className="w-2.5 h-2.5 rounded-full self-center"
                              style={{ backgroundColor: s.accentVar ?? 'var(--color-brand-coral)' }}
                            />
                            <span className="font-sans text-xs uppercase tracking-wider text-[var(--color-neutral-500)] font-medium whitespace-nowrap">
                              {s.version ? `v${s.version}` : 'meta'}
                            </span>
                            <span className="font-serif text-lg leading-tight group-hover:text-[var(--color-brand-indigo)] flex-1">
                              {s.title}
                            </span>
                            <span className="font-sans text-xs text-[var(--color-neutral-500)] whitespace-nowrap">
                              {s.readingTimeMin} min
                            </span>
                          </div>
                          {s.hook && (
                            <p className="mt-1 font-sans text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] leading-relaxed max-w-[var(--measure-body)]">
                              {s.hook}
                            </p>
                          )}
                          {s.impact && (
                            <span className="mt-1 inline-flex items-center gap-2 font-sans text-xs">
                              <span className="font-semibold text-[var(--color-brand-coral)] uppercase tracking-wider">
                                Impact
                              </span>
                              <span className="text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] font-medium">
                                {s.impact}
                              </span>
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {era.subGroups.map((sg) => (
                <div key={sg.category} className="mt-3 first:mt-0">
                  <h4 className="font-sans text-xs uppercase tracking-wider font-semibold text-[var(--color-neutral-500)] mb-1">
                    {sg.label}{' '}
                    <span className="text-[var(--color-neutral-400)]">{sg.studies.length}</span>
                  </h4>
                  <ul className="divide-y divide-[var(--color-neutral-200)] dark:divide-[var(--color-neutral-800)]">
                    {sg.studies.map((s) => (
                      <StudyRow key={s.slug} study={s} eraId={era.id} lens={lens} />
                    ))}
                  </ul>
                </div>
              ))}
            </Disclosure>
          </div>
        ))}
      </div>
    </section>
  );
}
