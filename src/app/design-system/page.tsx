import Image from 'next/image';
import { Disclosure } from '@/components/ui/Disclosure';
import { FlowDiagram } from '@/components/case-study/FlowDiagram';
import {
  TOKEN_GROUPS,
  TYPE_SCALE,
  MEASURES,
  MOTION_TOKENS,
  ELEVATION_TOKENS,
  Z_INDEX_TOKENS,
} from '@/lib/design-tokens';
import { DESIGN_SYSTEM_COMPONENTS as IOS_COMPONENTS } from '@/lib/design-system-components';
import {
  DESIGN_SYSTEM_COMPONENTS as WEB_COMPONENTS,
  groupComponentsByCategory,
  type ComponentCategory,
} from '@/lib/design-system';
import { ComponentCard } from '@/components/design-system/ComponentCard';
import {
  MotionTokenRow,
  ElevationSwatch,
  ZIndexLadderRow,
} from '@/components/design-system/TokenSwatch';
import {
  ButtonVariants,
  TagVariants,
} from '@/components/design-system/VariantGrid';
import {
  HeritageMetricsCard,
  AuditDecisionList,
  LockedPatternList,
} from '@/components/design-system/HeritageList';
import { ParitySummaryCard } from '@/components/design-system/ParitySummaryCard';
import { TrackedSection } from '@/components/design-system/TrackedSection';
import { CaseStudyCard } from '@/components/ui/CaseStudyCard';
import { FrameworkVersionCard } from '@/components/ui/FrameworkVersionCard';
import { LensFraming } from '@/components/LensFraming';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'The design system',
  description:
    'Two systems, one story — the iOS app and the framework story site share the same 13 UX foundations, ~125 semantic tokens, and CI-enforced compliance. Public showcase: tokens, components, drift status, dark-mode parity, contribution patterns.',
  slug: '/design-system',
});

const CATEGORY_TITLES: Record<ComponentCategory, string> = {
  primitive: 'Primitives',
  layout: 'Layout',
  callout: 'MDX callouts',
  'ui-utility': 'UI utilities',
  'control-room': 'Control-room (Internal)',
  persona: 'Persona',
  bespoke: 'Bespoke (Internal)',
};

const CATEGORY_ORDER: ComponentCategory[] = [
  'primitive',
  'layout',
  'callout',
  'ui-utility',
  'persona',
  'control-room',
  'bespoke',
];

/** Pre-baked previews for components that have inline-renderable variants. */
const COMPONENT_PREVIEWS: Record<string, React.ReactNode> = {
  Button: <ButtonVariants />,
  Tag: <TagVariants />,
  CaseStudyCard: (
    <CaseStudyCard
      href="/case-studies/example"
      title="Example case study"
      tldr="One-line summary of what this case study covers — readable in dark + light."
      tagLabel="Standard"
      tagVariant="standard"
    />
  ),
  FrameworkVersionCard: (
    <FrameworkVersionCard
      href="/framework"
      version="7.8.2"
      date="2026-05-08"
      outcome="Cross-repo gate asymmetry policy"
    />
  ),
};

const PRINCIPLES = [
  'Clarity over cleverness',
  'Touch affordances above 44pt',
  'One primary CTA per screen',
  'Progressive disclosure by default',
  'Motion communicates state change, not personality',
  'Empty states teach, not decorate',
  'Error recovery beats error prevention',
  'Loading states beat spinners',
  'Color is a last-resort differentiator',
  'Every interactive element has a disabled variant',
  'Accessibility is a constraint, not a feature',
  'Typography owns hierarchy',
  'Spacing owns grouping',
];

// Audit A-014 (2026-05-08): `alt` is content-describing, not just the title.
// Title and caption surface in the figcaption; `alt` describes the image
// itself for screen-reader users who can't see the screenshot.
const ONBOARDING_FLOW = [
  {
    src: '/design-system/welcome.png',
    title: 'Welcome',
    alt: 'FitMe Welcome screen — orange app icon centered above the wordmark, value proposition tagline, and a single primary Sign Up button with no other chrome.',
    caption: 'Brand entry. One CTA, no chrome, the wordmark and the value proposition. The first frame the user judges the app on.',
  },
  {
    src: '/design-system/onboarding-goals.png',
    title: 'Goal selection',
    alt: 'FitMe Goal selection screen — large card-style choices for fat-loss, muscle, recovery, and endurance, each with an icon and short description, with a thin progress bar across the top.',
    caption: 'A concrete outcome chosen up front, with large touch targets and a single primary action. The progress bar at top is the only navigation chrome.',
  },
  {
    src: '/design-system/onboarding-experience.png',
    title: 'Tell us about you',
    alt: 'FitMe onboarding experience step — segmented selectors for training history, weekly frequency, and session duration with a Skip option in the top corner.',
    caption: 'Training experience and weekly frequency calibrate the program. Skip is always available — onboarding never blocks.',
  },
  {
    src: '/design-system/onboarding-apple-health.png',
    title: 'Sync Apple Health',
    alt: 'FitMe Apple Health permission screen — a labeled list of every data category requested (heart rate, HRV, sleep, workouts) with the rationale next to each, plus Connect and Skip buttons.',
    caption: 'Permission with intent. Each data type listed by purpose, recovery and readiness explicitly named. Skip with a clear later-in-Settings escape.',
  },
  {
    src: '/design-system/onboarding-consent.png',
    title: 'Help us improve',
    alt: 'FitMe analytics consent screen — two columns showing collected categories with green check marks and excluded categories with red cross marks, then equally prominent Accept and Continue Without buttons.',
    caption: 'Honest analytics. Green checks on what is collected, red on what is not — health values and personal information stay local. Continue Without is just as prominent as Accept.',
  },
  {
    src: '/design-system/onboarding-save-progress.png',
    title: 'Save your progress',
    alt: 'FitMe save-progress screen — Continue with Apple and email sign-up rendered as equally weighted buttons, with secondary Log In and Skip For Now links underneath.',
    caption: 'Email or Apple, both equally weighted, log-in for returning users, skip-for-now for trial. The ladder reads top-down by friction.',
  },
];

const LIVE_APP_SCREENS = [
  {
    src: '/design-system/home-dashboard.png',
    title: 'Home — Day 84',
    alt: 'FitMe Home dashboard on day 84 — greeting and rotating achievements at top, a rest-day status card with Start Recovery and Log Meal actions in the middle, and a body-composition snapshot card below.',
    caption: 'Personalized greeting, rotating achievements card, contextual day type (rest day with Start Recovery + Log Meal), body-composition snapshot below the fold. All actions are one tap away.',
  },
  {
    src: '/design-system/training-plan-live.png',
    title: 'Training plan — live session',
    alt: 'FitMe Training tab during a live session — week strip with completion dots at top, a suggested session card with circular progress ring, then a list of exercise rows each showing sets, rep range, rest interval, and an inline coaching note in brand orange.',
    caption: 'Week strip with completion dots, suggested session card with progress ring, exercise rows showing sets / rep range / rest plus an inline coaching note in the brand orange.',
  },
  {
    src: '/design-system/session-complete.png',
    title: 'Session complete — celebration sheet',
    alt: 'FitMe session-complete modal — celebration headline, four metric tiles for duration, exercises, total sets, and volume, plus a single Share button.',
    caption: 'Modal presentation honours every PR. Duration, exercises, total sets, and volume rendered in the same metric-tile grammar as the home dashboard. Share is one tap.',
  },
  {
    src: '/design-system/nutrition-live.png',
    title: 'Nutrition — macros and strategy',
    alt: 'FitMe Nutrition tab — three macro target tiles for protein, carbs, and fat at top, the active strategy name "Continuous deficit" labeled beneath, a Repeat Last button, and a list of timestamped meals each showing kcal and protein.',
    caption: 'Macro targets at the top, named strategy beneath ("Continuous deficit"), Repeat Last for the daily ritual, meals timestamped with kcal + protein. Same chip and card grammar as the rest of the app.',
  },
];

export default function DesignSystemPage() {
  return (
    <article className="page-shell section-padding-x py-16">
      <header className="mb-10">
        <h1 className="font-serif text-[length:var(--text-display-lg)]">The design system</h1>
        <p className="mt-4 text-xl text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          Two systems, one story — the iOS app and the framework story site share the same 13 UX
          foundations, ~125 semantic tokens, and CI-enforced compliance. The iOS app proves the
          system in production. This site is the public observable surface.
        </p>
      </header>

      <LensFraming
        className="mb-10 max-w-[var(--measure-body)]"
        pm={
          <p className="rounded-lg border-l-2 border-[var(--color-brand-indigo)] bg-[var(--color-brand-indigo)]/5 px-5 py-4 font-sans text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
            <strong>Why a design system:</strong> it&apos;s a product asset. It guarantees
            consistency, accessibility, and shipping speed — and the guarantees are CI-enforced, not
            aspirational. Below: what it promises and how drift is caught.
          </p>
        }
        dev={
          <p className="rounded-lg border-l-2 border-[var(--color-neutral-400)] bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] px-5 py-4 font-sans text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
            <strong>The implementation:</strong> ~125 semantic tokens, 13 components, the
            Style-Dictionary token pipeline, and the <code>tokens-check</code> +{' '}
            <code>ui-audit</code> CI drift gates. (Figma↔code Code Connect <em>publishing</em> is
            disabled — it requires a Figma Org/Enterprise plan — but the Figma library itself is a
            real, manually-maintained mirror, re-verified live 2026-06-18 across both surfaces (iOS:
            80-var token collection + 22 component sets; web: 56 components + the <code>globals.css</code>{' '}
            token collection). Code is the source of truth; the mirror is kept honest by a maintenance
            protocol + a <code>figma-mirror-staleness</code> drift advisory.)
          </p>
        }
      />

      <nav
        aria-label="Design system page sections"
        className="mb-10 flex flex-wrap gap-x-4 gap-y-2 text-xs font-sans text-[var(--color-neutral-500)] border-y border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] py-3"
      >
        <span className="font-semibold text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          Part 1 (iOS):
        </span>
        <a href="#principles" className="hover:underline">
          Principles
        </a>
        <a href="#onboarding-flow" className="hover:underline">
          Onboarding
        </a>
        <a href="#live-app" className="hover:underline">
          Live app
        </a>
        <a href="#under-the-hood" className="hover:underline">
          Under the hood
        </a>
        <span className="font-semibold text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] ml-2">
          Part 2 (Web):
        </span>
        <a href="#parity" className="hover:underline">
          Parity
        </a>
        <a href="#tokens-web" className="hover:underline">
          Tokens
        </a>
        <a href="#components-web" className="hover:underline">
          Components
        </a>
        <a href="#heritage" className="hover:underline">
          Heritage
        </a>
        <a href="#contribute" className="hover:underline">
          Contribute
        </a>
      </nav>
      <section id="principles" className="mb-16 scroll-mt-24">
        <h2 className="font-serif text-2xl mb-6">The 13 principles</h2>
        <ol className="space-y-3 font-sans">
          {PRINCIPLES.map((p, i) => (
            <li key={p} className="flex gap-4">
              <span className="text-[var(--color-brand-indigo)] font-semibold w-6 shrink-0">{i + 1}.</span>
              <span>{p}</span>
            </li>
          ))}
        </ol>
      </section>
      <section id="onboarding-flow" className="mt-16 scroll-mt-24">
        <h2 className="font-serif text-2xl mb-3">Onboarding flow — six screens</h2>
        <p className="max-w-[var(--measure-body)] text-sm font-sans text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
          The first-run path uses the same typography, spacing, card radius, and CTA logic as the
          rest of the app — so onboarding feels like the beginning of the product, not a separate
          mini-site. Every screen offers an explicit skip; no step blocks.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ONBOARDING_FLOW.map((shot) => (
            <figure
              key={shot.src}
              className="overflow-hidden rounded-[28px] border border-[var(--color-neutral-200)] bg-white/70 shadow-sm dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)]"
            >
              <div className="bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)]">
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={1320}
                  height={2868}
                  className="h-auto w-full"
                />
              </div>
              <figcaption className="p-5 font-sans">
                <div className="font-semibold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
                  {shot.title}
                </div>
                <p className="mt-2 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                  {shot.caption}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section id="live-app" className="mt-16 scroll-mt-24">
        <h2 className="font-serif text-2xl mb-3">Live app — daily use with mock data</h2>
        <p className="max-w-[var(--measure-body)] text-sm font-sans text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
          Four screens from the daily flow, captured against a seeded test profile so the data is
          realistic without exposing real users. Same tokens, same components, same metric-tile
          grammar carried from onboarding into Home, Training, Session-Complete, and Nutrition.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {LIVE_APP_SCREENS.map((shot) => (
            <figure
              key={shot.src}
              className="overflow-hidden rounded-[28px] border border-[var(--color-neutral-200)] bg-white/70 shadow-sm dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)]"
            >
              <div className="bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)]">
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={1320}
                  height={2868}
                  className="h-auto w-full"
                />
              </div>
              <figcaption className="p-5 font-sans">
                <div className="font-semibold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
                  {shot.title}
                </div>
                <p className="mt-2 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                  {shot.caption}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="under-the-hood" className="mt-16 scroll-mt-24">
        <h2 className="font-serif text-2xl mb-3">Under the hood</h2>
        <p className="max-w-[var(--measure-body)] text-sm font-sans text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
          What the principles and screens look like at the token layer — the raw inputs
          every view in the app composes from.
        </p>

        <div className="mt-8 space-y-4">
          <Disclosure
            label="Semantic tokens"
            summary="Brand, skill palette, neutrals, type scale, measures — the full color and spacing grammar."
          >
            <div className="space-y-10">
              {TOKEN_GROUPS.map((group) => (
                <div key={group.name}>
                  <h3 className="font-serif text-lg mb-1">{group.name}</h3>
                  <p className="text-xs font-sans text-[var(--color-neutral-500)] max-w-[var(--measure-body)]">
                    {group.description}
                  </p>
                  <ul className="mt-4 grid gap-3 grid-cols-2 md:grid-cols-3">
                    {group.swatches.map((s) => (
                      <li
                        key={s.cssVar}
                        className="flex gap-3 items-center rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-3"
                      >
                        <span
                          aria-hidden="true"
                          className="h-10 w-10 shrink-0 rounded border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]"
                          style={{ backgroundColor: s.hex }}
                        />
                        <div className="min-w-0">
                          <div className="font-sans text-sm font-semibold truncate">{s.label}</div>
                          <code className="block font-mono text-[11px] text-[var(--color-neutral-500)] truncate">
                            {s.cssVar}
                          </code>
                          <code className="block font-mono text-[11px] text-[var(--color-neutral-500)]">
                            {s.hex}
                          </code>
                          {s.note ? (
                            <p className="mt-1 text-[11px] font-sans text-[var(--color-neutral-500)]">
                              {s.note}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div>
                <h3 className="font-serif text-lg mb-1">Type scale</h3>
                <ul className="mt-3 space-y-2">
                  {TYPE_SCALE.map((t) => (
                    <li
                      key={t.cssVar}
                      className="flex flex-wrap gap-3 items-baseline divider-row"
                    >
                      <span className="font-sans font-semibold text-sm w-28 shrink-0">{t.label}</span>
                      <code className="font-mono text-xs text-[var(--color-neutral-500)]">{t.cssVar}</code>
                      <code className="font-mono text-xs text-[var(--color-neutral-500)]">{t.value}</code>
                      <span className="text-xs font-sans text-[var(--color-neutral-500)]">{t.note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-serif text-lg mb-1">Reading measures</h3>
                <ul className="mt-3 space-y-2">
                  {MEASURES.map((m) => (
                    <li
                      key={m.cssVar}
                      className="flex flex-wrap gap-3 items-baseline divider-row"
                    >
                      <span className="font-sans font-semibold text-sm w-28 shrink-0">{m.value}</span>
                      <code className="font-mono text-xs text-[var(--color-neutral-500)]">{m.cssVar}</code>
                      <span className="text-xs font-sans text-[var(--color-neutral-500)]">{m.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Disclosure>

          <Disclosure
            label="Components"
            summary="Thirteen reusable components in the iOS app, all composed from the tokens above."
          >
            <ul className="divide-y divide-[var(--color-neutral-200)] dark:divide-[var(--color-neutral-700)]">
              {IOS_COMPONENTS.map((c) => (
                <li key={c.name} className="py-3 grid gap-1 md:grid-cols-[10rem_1fr] md:gap-6">
                  <code className="font-mono text-sm text-[var(--color-brand-indigo)]">{c.name}</code>
                  <div>
                    <p className="font-sans text-sm text-[var(--color-neutral-800)] dark:text-[var(--color-neutral-200)]">
                      {c.purpose}
                    </p>
                    <p className="mt-1 text-xs font-sans text-[var(--color-neutral-500)]">
                      Where used: {c.whereUsed}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs font-sans text-[var(--color-neutral-500)]">
              Snapshot of the iOS app&apos;s <code className="font-mono">FitTracker/DesignSystem/AppComponents.swift</code>. The
              canonical definitions live in the main repo.
            </p>
          </Disclosure>

          <Disclosure
            label="Pipeline"
            summary="How a token travels from source-of-truth JSON to the iOS build — and where CI guards it."
          >
            <FlowDiagram
              nodes={[
                { label: 'tokens.json', sublabel: 'source of truth' },
                { label: 'Style Dictionary', sublabel: 'build step' },
                { label: 'DesignTokens.swift', sublabel: 'generated' },
                { label: 'AppTheme.swift', sublabel: 'app surface' },
                { label: 'make tokens-check', sublabel: 'CI gate' },
              ]}
            />
            <p className="mt-4 text-xs font-sans text-[var(--color-neutral-500)] max-w-[var(--measure-body)]">
              Every token flows from a single JSON source. Style Dictionary compiles it into
              Swift, <code className="font-mono">AppTheme</code> exposes it to the app,
              and <code className="font-mono">make tokens-check</code> gates PRs
              against drift. Any color literal that bypasses this pipeline fails CI.
            </p>
          </Disclosure>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          PART 2 — The fitme-story website's own design system.
          The system that renders this very page. Public observability layer
          shipped via the fitme-story-website-design-system feature (2026-05-10).
          ═══════════════════════════════════════════════════════════════════════ */}
      <hr className="my-20 border-t-2 border-dashed border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]" />

      <section className="mb-12">
        <p className="text-sm font-sans uppercase tracking-wide text-[var(--color-neutral-500)] mb-2">
          Part 2
        </p>
        <h2 className="font-serif text-[length:var(--text-display-md)] mb-4">
          The system that renders this site
        </h2>
        <p className="max-w-[var(--measure-body)] text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] font-sans">
          Part 1 narrates the iOS app&apos;s system. Part 2 documents the system rendering this
          very page — the React components, Tailwind tokens, MDX callouts, and audit decisions
          that compose the framework story site itself. It exists so designers and contributors
          can see what&apos;s here, what&apos;s mapped to Figma, what&apos;s pending, and what we&apos;ve already
          decided.
        </p>
      </section>

      <TrackedSection sectionId="parity" className="mb-16 scroll-mt-24">
        <h2 className="font-serif text-2xl mb-4">Parity at a glance</h2>
        <ParitySummaryCard />
        <p className="text-sm font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] max-w-[var(--measure-body)]">
          This snapshot is computed at build time from the typed component manifest at{' '}
          <code className="font-mono text-xs">src/lib/design-system.ts</code>. The drift detection
          script (Bucket D of this feature) cross-checks the manifest against the live Figma file
          on a weekly cron and on-demand via <code className="font-mono text-xs">make figma-drift</code>.
        </p>
      </TrackedSection>

      <TrackedSection sectionId="tokens-web" className="mb-16 scroll-mt-24">
        <h2 className="font-serif text-2xl mb-4">Tokens — motion, elevation, z-index</h2>
        <p className="max-w-[var(--measure-body)] text-sm font-sans text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)] mb-6">
          Color, type, and measure tokens are documented in the &ldquo;Under the hood&rdquo; disclosure
          above (shared with the iOS app). Motion, elevation, and z-index ladder — added in this
          feature&apos;s Bucket A — are below.
        </p>

        <div className="space-y-10">
          <div>
            <h3 className="font-serif text-lg mb-3">Motion</h3>
            <p className="text-xs font-sans text-[var(--color-neutral-500)] max-w-[var(--measure-body)] mb-4">
              Material M3 vocabulary. All wrapped in{' '}
              <code className="font-mono">@media (prefers-reduced-motion: reduce)</code> for opt-out.
            </p>
            <ul className="space-y-2">
              {MOTION_TOKENS.map((t) => (
                <MotionTokenRow
                  key={t.cssVar}
                  cssVar={t.cssVar}
                  value={t.value}
                  label={`${t.label} (${t.category})`}
                  note={t.note}
                />
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg mb-3">Elevation</h3>
            <p className="text-xs font-sans text-[var(--color-neutral-500)] max-w-[var(--measure-body)] mb-4">
              Each level shown rendered in light + dark. Dark-mode shadows bump opacity to
              compensate for low contrast against neutral-900.
            </p>
            <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {ELEVATION_TOKENS.map((e) => (
                <ElevationSwatch
                  key={e.cssVar}
                  cssVar={e.cssVar}
                  lightValue={e.lightValue}
                  darkValue={e.darkValue}
                  level={e.level}
                  label={e.label}
                  note={e.note}
                />
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg mb-3">Z-index ladder</h3>
            <p className="text-xs font-sans text-[var(--color-neutral-500)] max-w-[var(--measure-body)] mb-4">
              10× spacing leaves room for insertions. Header stays above hover; modal blocks
              everything; toast outranks modal so transient feedback is always visible.
            </p>
            <ul className="space-y-2">
              {Z_INDEX_TOKENS.map((z) => (
                <ZIndexLadderRow
                  key={z.cssVar}
                  cssVar={z.cssVar}
                  value={z.value}
                  label={z.label}
                  note={z.note}
                />
              ))}
            </ul>
          </div>
        </div>
      </TrackedSection>

      <TrackedSection sectionId="components-web" className="mb-16 scroll-mt-24">
        <h2 className="font-serif text-2xl mb-4">Components</h2>
        <p className="max-w-[var(--measure-body)] text-sm font-sans text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)] mb-6">
          {WEB_COMPONENTS.length} components catalogued. Status badges indicate maturity (Stable,
          Experimental, Deprecated, Internal). Where Figma frames exist, each card links to the
          node; where they don&apos;t yet, the card flags it for Bucket C.
        </p>
        {(() => {
          const grouped = groupComponentsByCategory();
          return CATEGORY_ORDER.map((cat) => {
            const items = grouped[cat];
            if (items.length === 0) return null;
            const sectionId = `category-${cat}`;
            return (
              <div key={cat} id={sectionId} className="mb-12 scroll-mt-24">
                <h3 className="font-serif text-lg mb-1">{CATEGORY_TITLES[cat]}</h3>
                <p className="text-xs font-sans text-[var(--color-neutral-500)] mb-4">
                  {items.length} {items.length === 1 ? 'component' : 'components'}
                </p>
                <div className="space-y-4">
                  {items.map((entry) => (
                    <ComponentCard
                      key={entry.name}
                      entry={entry}
                      preview={COMPONENT_PREVIEWS[entry.name]}
                    />
                  ))}
                </div>
              </div>
            );
          });
        })()}
      </TrackedSection>

      <TrackedSection sectionId="drift" className="mb-16 scroll-mt-24">
        <h2 className="font-serif text-2xl mb-4">Drift report</h2>
        <div className="rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-6 bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)]">
          <p className="text-sm font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
            <strong>Last run:</strong> never (Bucket D ships in this feature).
          </p>
          <p className="text-sm font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] mt-2">
            Once Bucket D lands: weekly cron + on-demand{' '}
            <code className="font-mono text-xs">make figma-drift</code> /{' '}
            <code className="font-mono text-xs">npm run figma-drift</code> will append a dated
            report to{' '}
            <code className="font-mono text-xs">docs/design-system/figma-code-sync-status.md</code>{' '}
            and surface here.
          </p>
        </div>
      </TrackedSection>

      <TrackedSection sectionId="dark-mode" className="mb-16 scroll-mt-24">
        <h2 className="font-serif text-2xl mb-4">Dark-mode parity</h2>
        <div className="rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-6 bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)]">
          <p className="text-sm font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
            Per-component status surfaced inline on each component card above (◐ Designed, ◑
            AutoDerived, ✗ TODO, — NotApplicable).
          </p>
          <p className="text-sm font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] mt-2">
            Full matrix doc with contrast ratios + last-audited dates ships in Bucket E:{' '}
            <code className="font-mono text-xs">
              docs/design-system/fitme-story-dark-mode-coverage.md
            </code>
            .
          </p>
        </div>
      </TrackedSection>

      <TrackedSection sectionId="heritage" className="mb-16 scroll-mt-24">
        <h2 className="font-serif text-2xl mb-4">Design heritage</h2>
        <p className="max-w-[var(--measure-body)] text-sm font-sans text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)] mb-6">
          Durable design decisions made on this site before the design-system feature shipped.
          Audit findings (P0/P1/P2) and locked patterns whose rationale matters when contributors
          ask &ldquo;why is it this way?&rdquo;.
        </p>
        <HeritageMetricsCard />
        <div className="space-y-10">
          <div>
            <h3 className="font-serif text-lg mb-3">Audit decisions</h3>
            <AuditDecisionList />
          </div>
          <div>
            <h3 className="font-serif text-lg mb-3">Locked patterns</h3>
            <LockedPatternList />
          </div>
        </div>
      </TrackedSection>

      <TrackedSection sectionId="contribute" className="mb-16 scroll-mt-24">
        <h2 className="font-serif text-2xl mb-4">How to contribute</h2>
        <p className="max-w-[var(--measure-body)] text-sm font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] mb-3">
          Three rules for every new component on this site:
        </p>
        <ol className="space-y-2 max-w-[var(--measure-body)] text-sm font-sans">
          <li className="flex gap-3">
            <span className="font-semibold text-[var(--color-brand-indigo)] w-6 shrink-0">1.</span>
            <span>
              <strong>Reuse before adding.</strong> Check this catalog first. Most patterns
              already exist as tokens or primitives — extend before creating.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-[var(--color-brand-indigo)] w-6 shrink-0">2.</span>
            <span>
              <strong>Add a manifest entry.</strong> Append to{' '}
              <code className="font-mono text-xs">src/lib/design-system.ts</code>. The drift
              detection script will surface mismatches; the showcase will render automatically.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-[var(--color-brand-indigo)] w-6 shrink-0">3.</span>
            <span>
              <strong>Map to Figma when possible.</strong> Author a{' '}
              <code className="font-mono text-xs">.figma.tsx</code> file alongside the component;
              capture the Figma node ID in the manifest. Note: Code Connect publishing is{' '}
              <strong>disabled</strong> (requires a Figma Org/Enterprise plan) — the mapping
              documents intent only, and re-activates if the plan is upgraded.
            </span>
          </li>
        </ol>
        <p className="mt-6 text-sm font-sans text-[var(--color-neutral-500)]">
          Full contribution doc lives at{' '}
          <code className="font-mono text-xs">docs/CONTRIBUTING-design-system.md</code> (Bucket F
          of this feature).
        </p>
      </TrackedSection>
    </article>
  );
}
