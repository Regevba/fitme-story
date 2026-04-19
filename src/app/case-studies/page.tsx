import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllCaseStudies, type ContentEntry } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Case studies — fitme-story',
  description:
    'Six milestone case studies from the FitMe PM framework evolution, plus supporting studies and developer deep-dives.',
};

// Six framework inflection points — the studies where something fundamental
// changed. Hooks, impact metrics, short-labels and a dedicated accent color
// are hand-curated per milestone. Ordered chronologically by framework version.
// The accent color appears: (1) in the top infographic strip, (2) as the
// leading color bar on each milestone card, creating a visual thread from the
// timeline pin down to the study it represents.
const MILESTONES: Array<{
  slug: string;
  version: string;
  shortLabel: string;
  impact: string;
  hook: string;
  colorVar: string;
}> = [
  {
    slug: 'onboarding-pilot',
    version: 'v2.0',
    shortLabel: 'Baseline pilot',
    impact: 'Baseline · 6.5h',
    hook: 'The pilot run. Full 9-phase PM lifecycle on one feature, end-to-end. Every number that follows in this timeline is relative to this one — including the 3 rework cycles and 5 latent bugs.',
    colorVar: 'var(--skill-ops)', // slate — baseline
  },
  {
    slug: 'framework-evolution',
    version: 'v4.1',
    shortLabel: 'Compounding proven',
    impact: '6.5× faster · defects → 0',
    hook: 'Six identical-scope refactors across four framework versions. A controlled natural experiment that isolated framework improvement from practitioner learning. Wall time dropped from 6.5h to 1h, defect escape rate from 5 to 0.',
    colorVar: 'var(--skill-pm-workflow)', // indigo — orchestration proven
  },
  {
    slug: 'eval-driven-development',
    version: 'v4.4',
    shortLabel: 'Quality gate',
    impact: '29 / 29 green',
    hook: 'Can you test AI output quality the same way you test code? Golden I/O tests and heuristic checks across four AI subsystems, all green on first run. Added a quality phase to the lifecycle without adding measurable overhead.',
    colorVar: 'var(--skill-qa)', // lime — quality
  },
  {
    slug: 'parallel-stress-test',
    version: 'v5.2',
    shortLabel: 'Parallel dispatch',
    impact: '4 features / 54 min',
    hook: 'Four independent features dispatched concurrently — 54 minutes from first prompt to four merged PRs. Zero merge conflicts, zero regressions. The stress test that proved the framework could parallelize.',
    colorVar: 'var(--skill-release)', // emerald — ship at speed
  },
  {
    slug: 'measurement-v6',
    version: 'v6.0',
    shortLabel: 'Measurement',
    impact: 'Instrumentation, not estimation',
    hook: 'Deterministic phase timing, skill activation, and cache hits — all measured per feature, not estimated. The version where the framework stopped claiming numbers and started capturing them.',
    colorVar: 'var(--skill-analytics)', // cyan — measurement
  },
  {
    slug: 'hadf',
    version: 'v7.0',
    shortLabel: 'Hardware-aware',
    impact: '17 chip profiles',
    hook: 'The framework learned to detect the machine it runs on. 17 chip profiles, 7 cloud signatures, dispatch routing that adapts to hardware — little-core for mechanical work, big-core for reasoning, cloud only when locally infeasible.',
    colorVar: 'var(--color-brand-coral)', // coral — latest
  },
];

const MILESTONE_SLUGS = new Set(MILESTONES.map((m) => m.slug));
const DEVELOPER_SLUGS = new Set(['ssr-regression', 'dispatchreplay', 'lego-pmflow']);

export default async function CaseStudiesIndex() {
  const all = await getAllCaseStudies();
  const entryBySlug = new Map(all.map((c) => [c.frontmatter.slug, c]));
  const milestoneEntries = MILESTONES.map((m) => ({
    ...m,
    entry: entryBySlug.get(m.slug),
  })).filter((m) => m.entry) as Array<(typeof MILESTONES)[number] & { entry: ContentEntry }>;

  const secondary = all.filter(
    (c) =>
      !MILESTONE_SLUGS.has(c.frontmatter.slug) &&
      !DEVELOPER_SLUGS.has(c.frontmatter.slug) &&
      c.frontmatter.tier !== 'unassigned',
  );

  const developer = all.filter((c) => DEVELOPER_SLUGS.has(c.frontmatter.slug));

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12">
        <h1 className="font-serif text-[length:var(--text-display-lg)] mb-4">Case studies</h1>
        <p className="font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] max-w-[var(--measure-body)] leading-relaxed">
          Six milestones where the framework fundamentally changed — plus supporting studies and
          engineering deep-dives. Read top to bottom for the chronological story, or jump to any
          milestone.
        </p>
      </header>

      <section className="mb-12 rounded-lg border border-[var(--color-brand-coral)] bg-[color-mix(in_srgb,var(--color-brand-coral)_8%,transparent)] p-5 font-sans text-sm">
        <p className="font-semibold text-[var(--color-brand-coral)] uppercase tracking-wider text-xs mb-2">
          Independent audit in progress
        </p>
        <p className="text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          All case studies and the site&apos;s source code are currently being reviewed by an
          independent external AI model as a neutral second pass — checking accuracy, methodology,
          and honesty. Results and the reviewer&apos;s findings will be published here when they come in.
        </p>
      </section>

      {/* ============ INFOGRAPHIC — framework progression strip ============
          Horizontal color-coded timeline. Each pin jumps to its milestone
          card below; the pin's color matches the card's leading color bar,
          creating a visual thread from the overview to the detail. */}
      <nav
        aria-label="Framework progression timeline"
        className="mb-16 -mx-6 px-6 sm:mx-0 sm:px-0 overflow-x-auto"
      >
        <div className="flex items-stretch gap-1 min-w-[640px]">
          {milestoneEntries.map((m) => (
            <a
              key={m.slug}
              href={`#milestone-${m.slug}`}
              className="group flex-1 flex flex-col gap-2 rounded-lg p-3 border border-transparent hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-brand-indigo)] focus-visible:outline-offset-2"
            >
              <div
                className="h-2 rounded-full"
                style={{ backgroundColor: m.colorVar }}
                aria-hidden="true"
              />
              <div className="font-sans">
                <div className="text-xs uppercase tracking-wider font-bold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
                  {m.version}
                </div>
                <div className="text-sm font-medium text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] mt-1 leading-snug">
                  {m.shortLabel}
                </div>
              </div>
            </a>
          ))}
        </div>
      </nav>

      {/* ============ MILESTONES — timeline spine ============ */}
      <section className="mb-20" aria-labelledby="milestones-heading">
        <h2
          id="milestones-heading"
          className="font-serif text-[length:var(--text-display-md)] mb-2"
        >
          Milestones
        </h2>
        <p className="font-sans text-sm text-[var(--color-neutral-500)] mb-10 max-w-[var(--measure-body)]">
          Six inflection points across the framework&apos;s evolution — each one the study where
          something that had been a hypothesis became a result.
        </p>

        <ol className="relative space-y-12 sm:space-y-14">
          <span
            aria-hidden="true"
            className="hidden sm:block absolute left-[11px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-[var(--color-brand-indigo)] via-[var(--color-brand-indigo)] to-[var(--color-brand-coral)] opacity-60"
          />

          {milestoneEntries.map((m, idx) => (
            <li
              key={m.slug}
              id={`milestone-${m.slug}`}
              className="relative sm:pl-12 scroll-mt-24"
            >
              {/* Milestone dot — colored to match the card's accent and the
                  infographic pin above, completing the visual thread. */}
              <span
                aria-hidden="true"
                className="hidden sm:block absolute left-0 top-3 w-6 h-6 rounded-full ring-4 ring-[var(--color-neutral-50)] dark:ring-[var(--color-neutral-900)]"
                style={{ backgroundColor: m.colorVar }}
              />
              <span
                aria-hidden="true"
                className="hidden sm:block absolute left-[7px] top-[18px] w-3 h-3 rounded-full bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)]"
              />

              <Link
                href={`/case-studies/${m.slug}`}
                className="block group rounded-xl border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-800)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)] overflow-hidden hover:border-[var(--color-brand-indigo)] hover:shadow-lg transition-all"
              >
                {/* Color strip "at the tip" — matches the infographic pin */}
                <div
                  className="h-1.5"
                  style={{ backgroundColor: m.colorVar }}
                  aria-hidden="true"
                />

                <div className="p-6 sm:p-7">
                  <div className="flex flex-wrap items-center gap-3 mb-3 font-sans">
                    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
                      <span
                        aria-hidden="true"
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: m.colorVar }}
                      />
                      Milestone {idx + 1} · {m.version} · {m.shortLabel}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">
                      {m.entry.readingTimeMin} min read
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl leading-tight mb-3 group-hover:text-[var(--color-brand-indigo)]">
                    {m.entry.frontmatter.title}
                  </h3>

                  <p className="font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] leading-relaxed mb-4 max-w-[var(--measure-body)]">
                    {m.hook}
                  </p>

                  <div className="inline-flex items-center gap-2 font-sans text-sm">
                    <span className="font-semibold text-[var(--color-brand-coral)] uppercase tracking-wider text-xs">
                      Impact
                    </span>
                    <span className="text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] font-medium">
                      {m.impact}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* ============ MORE STUDIES — compact list ============ */}
      <section className="mb-20" aria-labelledby="more-heading">
        <h2 id="more-heading" className="font-serif text-[length:var(--text-display-md)] mb-2">
          More case studies
        </h2>
        <p className="font-sans text-sm text-[var(--color-neutral-500)] mb-6 max-w-[var(--measure-body)]">
          Supporting studies and methodology notes — the work that validates, extends, or explains
          the milestones above.
        </p>

        <ul className="divide-y divide-[var(--color-neutral-200)] dark:divide-[var(--color-neutral-800)]">
          {secondary.map((c) => (
            <li key={c.frontmatter.slug}>
              <Link
                href={`/case-studies/${c.frontmatter.slug}`}
                className="block group py-4 px-2 -mx-2 rounded hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)] transition-colors"
              >
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="font-sans text-xs uppercase tracking-wider text-[var(--color-neutral-500)] font-medium whitespace-nowrap">
                    {c.frontmatter.timeline_position
                      ? `v${c.frontmatter.timeline_position.version}`
                      : 'supporting'}
                  </span>
                  <span className="font-serif text-base group-hover:text-[var(--color-brand-indigo)] flex-1">
                    {c.frontmatter.title}
                  </span>
                  <span className="font-sans text-xs text-[var(--color-neutral-500)] whitespace-nowrap">
                    {c.readingTimeMin} min
                  </span>
                </div>
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/case-studies/operations-layer"
              className="block group py-4 px-2 -mx-2 rounded hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)] transition-colors"
            >
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="font-sans text-xs uppercase tracking-wider text-[var(--color-neutral-500)] font-medium whitespace-nowrap">
                  supporting
                </span>
                <span className="font-serif text-base group-hover:text-[var(--color-brand-indigo)] flex-1">
                  The operations layer in practice
                </span>
                <span className="font-sans text-xs text-[var(--color-neutral-500)] whitespace-nowrap">
                  3 short studies
                </span>
              </div>
            </Link>
          </li>
        </ul>
      </section>

      {/* ============ DEVELOPER DEEP-DIVES ============ */}
      <section className="mb-8" aria-labelledby="dev-heading">
        <h2
          id="dev-heading"
          className="font-serif text-[length:var(--text-display-md)] mb-2 flex items-baseline gap-3"
        >
          <span aria-hidden="true">⚙️</span>
          <span>Developer deep-dives</span>
        </h2>
        <p className="font-sans text-sm text-[var(--color-neutral-500)] mb-6 max-w-[var(--measure-body)]">
          Engineering write-ups for readers who want the code-level story — SSR, animation
          plumbing, component design. Not required reading for the framework narrative.
        </p>

        <ul className="divide-y divide-[var(--color-neutral-200)] dark:divide-[var(--color-neutral-800)]">
          {developer.map((c) => (
            <li key={c.frontmatter.slug}>
              <Link
                href={`/case-studies/${c.frontmatter.slug}`}
                className="block group py-4 px-2 -mx-2 rounded hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)] transition-colors"
              >
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="font-serif text-base group-hover:text-[var(--color-brand-indigo)] flex-1">
                    {c.frontmatter.title}
                  </span>
                  <span className="font-sans text-xs text-[var(--color-neutral-500)] whitespace-nowrap">
                    {c.readingTimeMin} min
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
