import Link from 'next/link';
import { Wrench } from 'lucide-react';
import { getAllCaseStudies, type ContentEntry } from '@/lib/content';
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { Disclosure } from '@/components/ui/Disclosure';
import { CaseStudyEras } from '@/components/case-studies/CaseStudyEras';
import type { Category, GroupableStudy } from '@/lib/case-study-grouping';

export const metadata = buildMetadata({
  title: 'Case studies',
  description:
    'Case studies from the FitMe PM framework evolution, grouped by era — newest first — plus meta-analysis and developer deep-dives.',
  slug: '/case-studies',
});

const CASE_STUDIES_BREADCRUMBS = breadcrumbJsonLd([
  { name: 'Home', href: '/' },
  { name: 'Case Studies', href: '/case-studies' },
]);

// Six framework inflection points — the studies where something fundamental
// changed. Their curated hook + impact + accent are preserved INSIDE their era
// (the milestone is pinned at the top of its era accordion), so the
// chronological narrative survives the era-grouped reorganization (T8).
const MILESTONE_META: Record<
  string,
  { shortLabel: string; impact: string; hook: string; accentVar: string }
> = {
  'onboarding-pilot': {
    shortLabel: 'Baseline pilot',
    impact: 'Baseline · 6.5h',
    hook: 'The pilot run. Full 9-phase PM lifecycle on one feature, end-to-end. Every number that follows in this timeline is relative to this one — including the 3 rework cycles and 5 latent bugs.',
    accentVar: 'var(--skill-ops)',
  },
  'framework-evolution': {
    shortLabel: 'Compounding proven',
    impact: '6.5× faster · defects → 0',
    hook: 'Six identical-scope refactors across four framework versions. A controlled natural experiment that isolated framework improvement from practitioner learning. Wall time dropped from 6.5h to 1h, defect escape rate from 5 to 0.',
    accentVar: 'var(--skill-pm-workflow)',
  },
  'eval-driven-development': {
    shortLabel: 'Quality gate',
    impact: '29 / 29 green',
    hook: 'Can you test AI output quality the same way you test code? Golden I/O tests and heuristic checks across four AI subsystems, all green on first run. Added a quality phase to the lifecycle without adding measurable overhead.',
    accentVar: 'var(--skill-qa)',
  },
  'parallel-stress-test': {
    shortLabel: 'Parallel dispatch',
    impact: '4 features / 54 min',
    hook: 'Four independent features dispatched concurrently — 54 minutes from first prompt to four merged PRs. Zero merge conflicts, zero regressions. The stress test that proved the framework could parallelize.',
    accentVar: 'var(--skill-release)',
  },
  'measurement-v6': {
    shortLabel: 'Measurement',
    impact: 'Instrumentation, not estimation',
    hook: 'Deterministic phase timing, skill activation, and cache hits — all measured per feature, not estimated. The version where the framework stopped claiming numbers and started capturing them.',
    accentVar: 'var(--skill-analytics)',
  },
  hadf: {
    shortLabel: 'Hardware-aware',
    impact: '17 chip profiles',
    hook: 'The framework learned to detect the machine it runs on. 17 chip profiles, 7 cloud signatures, dispatch routing that adapts to hardware — little-core for mechanical work, big-core for reasoning, cloud only when locally infeasible.',
    accentVar: 'var(--color-brand-coral)',
  },
};

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatPublishedDate(iso: string | undefined): string | null {
  if (!iso) return null;
  const match = iso.match(/^(\d{4})-(\d{2})-\d{2}/);
  if (!match) return null;
  const month = MONTH_ABBR[parseInt(match[2], 10) - 1];
  if (!month) return null;
  return `${month} ${match[1]}`;
}

function dateSortKey(iso: string | undefined): string {
  return iso ?? '9999-99-99';
}

function toGroupable(c: ContentEntry): GroupableStudy {
  const slug = c.frontmatter.slug;
  const milestone = MILESTONE_META[slug];
  return {
    slug,
    title: c.frontmatter.title,
    version: c.frontmatter.timeline_position?.version ?? null,
    date: c.frontmatter.date ?? '',
    category: (c.frontmatter.category ?? 'product') as Category,
    readingTimeMin: c.readingTimeMin,
    emphasis: {
      pm: c.frontmatter.persona_emphasis?.pm,
      dev: c.frontmatter.persona_emphasis?.dev,
    },
    isMilestone: Boolean(milestone),
    ...(milestone
      ? { hook: milestone.hook, impact: milestone.impact, accentVar: milestone.accentVar }
      : {}),
  };
}

export default async function CaseStudiesIndex() {
  const all = await getAllCaseStudies();
  const studies = all.filter((c) => c.frontmatter.tier !== 'unassigned');
  const groupable = studies.map(toGroupable);

  // Meta + dev-deepdive studies render in their own dedicated sections (not the
  // era accordions), so era counts stay clean. Category-driven (T7 backfill).
  const metaStudies = groupable
    .filter((g) => g.category === 'meta')
    .sort((a, b) => dateSortKey(b.date).localeCompare(dateSortKey(a.date)));
  const devStudies = groupable
    .filter((g) => g.category === 'dev-deepdive')
    .sort((a, b) => dateSortKey(b.date).localeCompare(dateSortKey(a.date)));

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <JsonLd data={CASE_STUDIES_BREADCRUMBS} />
      <header className="mb-12">
        <h1 className="font-serif text-[length:var(--text-display-lg)] mb-4">Case studies</h1>
        <p className="font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] max-w-[var(--measure-body)] leading-relaxed">
          The framework&apos;s evolution, told through the features it shipped — grouped by era,
          newest first, so the latest work is right at the top. Each era pins its milestones, then
          sub-groups by subject. Ordering follows your selected lens.
        </p>
        <p className="mt-4 font-sans text-sm">
          <Link
            href="/case-studies/compare"
            className="inline-flex items-center gap-1 link-inline"
            style={{ color: 'var(--color-brand-indigo)' }}
          >
            Compare every case study at a glance →
          </Link>
        </p>
      </header>

      {/* ============ METHODOLOGY — how we measured ============
          Framing section. Every case study below cites velocity, CU, and
          cache-hit numbers. This block explains how those numbers are
          computed, how the measurement approach evolved across framework
          versions, and what the numbers can and can't prove. Collapsed by
          default so the era groups stay above the fold. */}
      <section
        aria-labelledby="methodology-heading"
        className="mb-16 rounded-2xl border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-800)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)] p-6 sm:p-8"
      >
        <div className="flex items-baseline justify-between flex-wrap gap-3 mb-4">
          <h2
            id="methodology-heading"
            className="font-serif text-[length:var(--text-display-md)]"
          >
            How we measured
          </h2>
          <p className="font-sans text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">
            Framing · read before the numbers below
          </p>
        </div>

        <Disclosure
          label="Read the methodology"
          summary="What complexity units, cache-hit tiers, and timing measurements actually mean — and what they can't prove."
        >
          <p className="font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] leading-relaxed mb-8 max-w-[var(--measure-body)]">
            Every case study below cites numbers — wall time, complexity units, cache-hit rates,
            throughput multipliers. This block explains where those numbers come from, how the
            measurement approach evolved across framework versions, and what the numbers can and
            can&apos;t prove.
          </p>

          <dl className="grid md:grid-cols-2 gap-x-8 gap-y-6 font-sans text-sm leading-relaxed text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
            <div>
              <dt className="font-semibold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] mb-1">
                The assumption — a natural experiment
              </dt>
              <dd>
                Six sequential UX-alignment refactors ran across six FitMe screens. Identical scope
                (same phase list, same compliance checklist, same design-system target) meant any
                velocity difference between refactor 1 and refactor 6 could only come from screen
                complexity, practitioner learning, or framework evolution. Normalize for complexity
                and treat learning as roughly constant after the first run, and what&apos;s left is
                framework evolution — a controlled natural experiment with N=6 initial datapoints,
                now 17.
              </dd>
            </div>

            <div>
              <dt className="font-semibold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] mb-1">
                How measurement evolved
              </dt>
              <dd>
                Three generations. <strong>v2.0–v5.2</strong> — estimated: wall time from commit
                timestamps (±15–30 min), cache hit rates inferred from narrative.{' '}
                <strong>v6.0</strong> — instrumented: per-phase timestamps, L1/L2/L3 cache counters,
                tokenizer-based overhead measurement, mandatory eval-coverage gate.{' '}
                <strong>v7.0 onwards</strong> — continuous factors: view-count tiers replaced binary
                &quot;has UI&quot;, architectural-novelty replaced binary &quot;new model&quot;.
              </dd>
            </div>

            <div>
              <dt className="font-semibold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] mb-1">
                The normalization model
              </dt>
              <dd>
                Every feature converts to a single number — <strong>Complexity Units (CU)</strong> —
                via <code className="font-mono text-xs">CU = Tasks × Work_Type_Weight × (1 + Σ Complexity_Factors)</code>.
                The primary metric is <strong>min/CU</strong>: wall time divided by CU; lower is
                better. This is what makes a 6.5-hour onboarding refactor comparable to a
                54-minute 4-feature parallel run.{' '}
                <Link
                  href="/case-studies/normalization-model"
                  className="text-[var(--color-brand-indigo)] hover:underline font-medium"
                >
                  Full formula →
                </Link>
              </dd>
            </div>

            <div>
              <dt className="font-semibold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] mb-1">
                How we analyzed results
              </dt>
              <dd>
                Three comparison axes: framework-era averages (v2.0 → v7.0), work-type segmentation
                (refactor vs feature vs enhancement), and execution-mode (serial vs parallel).
                Trend fitted as a power law — R²&nbsp;=&nbsp;0.87 under v2 factors. Rolling
                baselines replaced the single anchor to detect plateaus. Regressions documented
                honestly: two real ones (Training v4.0, Readiness v4.2), both attributed to
                measurable learning taxes from new framework capabilities.{' '}
                <Link
                  href="/case-studies/meta-analysis"
                  className="text-[var(--color-brand-indigo)] hover:underline font-medium"
                >
                  Full retrospective →
                </Link>
              </dd>
            </div>

            <div>
              <dt className="font-semibold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] mb-1">
                How we compared across features
              </dt>
              <dd>
                Every case study ends with a <em>Normalized velocity</em> block that cites the same
                CU formula, making cross-comparison honest. A framework refactor and a new feature
                land on the same axis. A serial v5.1 run and a parallel v5.1 stress test land on the
                same axis. The full dataset was submitted for independent review — arithmetic
                verified, structure sound, weaknesses surfaced and mostly fixed in v6.0.{' '}
                <Link
                  href="/case-studies/meta-analysis-validation"
                  className="text-[var(--color-brand-indigo)] hover:underline font-medium"
                >
                  External validation →
                </Link>
              </dd>
            </div>

            <div>
              <dt className="font-semibold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] mb-1">
                What this can&apos;t prove
              </dt>
              <dd>
                Single practitioner. N=17 is small for robust regression. Of the 185 full-audit
                findings, only 11.4% are externally-automated (confirmed by build, test, or
                independent measurement); 78.9% are framework-only (AI assertion from code
                reading). All claims should be read as directional signals, not statistical
                certainties. The honest reporting of regressions and limitations is what makes the
                rest of the dataset trustworthy.
              </dd>
            </div>
          </dl>
        </Disclosure>
      </section>

      {/* ============ ERA-GROUPED INDEX (T8) ============
          Newest-first collapsible era accordions, milestones pinned in-era,
          subject sub-groups, lens-aware ordering. Replaces the former
          oldest-first milestone spine + v7.x category section so recent work
          is reachable in one click. Client component (re-sorts on lens change
          + fires era/open analytics). */}
      <CaseStudyEras studies={groupable} />

      {/* ============ META-ANALYSIS & METHODOLOGY ============
          Studies that audit or validate the framework itself — full-system
          audits, normalized retrospectives, external validation, methodology,
          plus the operations-layer practice notes. Category-driven (meta). */}
      <section className="mb-20" aria-labelledby="meta-heading">
        <h2 id="meta-heading" className="font-serif text-[length:var(--text-display-md)] mb-2">
          Meta-analysis &amp; methodology
        </h2>
        <p className="font-sans text-sm text-[var(--color-neutral-500)] mb-6 max-w-[var(--measure-body)]">
          Studies that audit or validate the framework itself — full-system audits, normalized
          retrospectives, external validation, and operations-layer notes. Read these to see how
          the framework holds up under scrutiny.
        </p>

        <ul className="divide-y divide-[var(--color-neutral-200)] dark:divide-[var(--color-neutral-800)]">
          {metaStudies.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/case-studies/${c.slug}`}
                className="block group py-4 px-2 -mx-2 rounded hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)] transition-colors"
              >
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="font-sans text-xs uppercase tracking-wider text-[var(--color-neutral-500)] font-medium whitespace-nowrap">
                    {c.version ? `v${c.version}` : 'meta'}
                  </span>
                  <span className="font-serif text-base group-hover:text-[var(--color-brand-indigo)] flex-1">
                    {c.title}
                  </span>
                  {formatPublishedDate(c.date) && (
                    <span className="font-sans text-xs text-[var(--color-neutral-500)] whitespace-nowrap">
                      {formatPublishedDate(c.date)}
                    </span>
                  )}
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
                  meta
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

      {/* ============ DEVELOPER DEEP-DIVES ============ Category-driven (dev-deepdive). */}
      <section className="mb-8" aria-labelledby="dev-heading">
        <h2
          id="dev-heading"
          className="font-serif text-[length:var(--text-display-md)] mb-2 flex items-baseline gap-3"
        >
          <Wrench
            aria-hidden="true"
            width={28}
            height={28}
            strokeWidth={1.75}
            className="text-[var(--color-neutral-500)]"
          />
          <span>Developer deep-dives</span>
        </h2>
        <p className="font-sans text-sm text-[var(--color-neutral-500)] mb-6 max-w-[var(--measure-body)]">
          Engineering write-ups for readers who want the code-level story — SSR, animation
          plumbing, component design. Not required reading for the framework narrative.
        </p>

        <ul className="divide-y divide-[var(--color-neutral-200)] dark:divide-[var(--color-neutral-800)]">
          {devStudies.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/case-studies/${c.slug}`}
                className="block group py-4 px-2 -mx-2 rounded hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)] transition-colors"
              >
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="font-serif text-base group-hover:text-[var(--color-brand-indigo)] flex-1">
                    {c.title}
                  </span>
                  {formatPublishedDate(c.date) && (
                    <span className="font-sans text-xs text-[var(--color-neutral-500)] whitespace-nowrap">
                      {formatPublishedDate(c.date)}
                    </span>
                  )}
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
