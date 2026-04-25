import Image from 'next/image';
import type { Metadata } from 'next';
import { Disclosure } from '@/components/ui/Disclosure';
import { FlowDiagram } from '@/components/case-study/FlowDiagram';
import { TOKEN_GROUPS, TYPE_SCALE, MEASURES } from '@/lib/design-tokens';
import { DESIGN_SYSTEM_COMPONENTS } from '@/lib/design-system-components';

export const metadata: Metadata = {
  title: 'The design system — fitme-story',
  description: '13 UX foundations and ~125 tokens that underpin FitMe.',
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

const ONBOARDING_FLOW = [
  {
    src: '/design-system/welcome.png',
    title: 'Welcome',
    caption: 'Brand entry. One CTA, no chrome, the wordmark and the value proposition. The first frame the user judges the app on.',
  },
  {
    src: '/design-system/onboarding-goals.png',
    title: 'Goal selection',
    caption: 'A concrete outcome chosen up front, with large touch targets and a single primary action. The progress bar at top is the only navigation chrome.',
  },
  {
    src: '/design-system/onboarding-experience.png',
    title: 'Tell us about you',
    caption: 'Training experience and weekly frequency calibrate the program. Skip is always available — onboarding never blocks.',
  },
  {
    src: '/design-system/onboarding-apple-health.png',
    title: 'Sync Apple Health',
    caption: 'Permission with intent. Each data type listed by purpose, recovery and readiness explicitly named. Skip with a clear later-in-Settings escape.',
  },
  {
    src: '/design-system/onboarding-consent.png',
    title: 'Help us improve',
    caption: 'Honest analytics. Green checks on what is collected, red on what is not — health values and personal information stay local. Continue Without is just as prominent as Accept.',
  },
  {
    src: '/design-system/onboarding-save-progress.png',
    title: 'Save your progress',
    caption: 'Email or Apple, both equally weighted, log-in for returning users, skip-for-now for trial. The ladder reads top-down by friction.',
  },
];

const LIVE_APP_SCREENS = [
  {
    src: '/design-system/home-dashboard.png',
    title: 'Home — Day 84',
    caption: 'Personalized greeting, rotating achievements card, contextual day type (rest day with Start Recovery + Log Meal), body-composition snapshot below the fold. All actions are one tap away.',
  },
  {
    src: '/design-system/training-plan-live.png',
    title: 'Training plan — live session',
    caption: 'Week strip with completion dots, suggested session card with progress ring, exercise rows showing sets / rep range / rest plus an inline coaching note in the brand orange.',
  },
  {
    src: '/design-system/session-complete.png',
    title: 'Session complete — celebration sheet',
    caption: 'Modal presentation honours every PR. Duration, exercises, total sets, and volume rendered in the same metric-tile grammar as the home dashboard. Share is one tap.',
  },
  {
    src: '/design-system/nutrition-live.png',
    title: 'Nutrition — macros and strategy',
    caption: 'Macro targets at the top, named strategy beneath ("Continuous deficit"), Repeat Last for the daily ritual, meals timestamped with kcal + protein. Same chip and card grammar as the rest of the app.',
  },
];

export default function DesignSystemPage() {
  return (
    <article className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-10">
        <h1 className="font-serif text-[length:var(--text-display-lg)]">The design system</h1>
        <p className="mt-4 text-xl text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          13 UX foundations. ~125 semantic tokens. 13 reusable components. CI-enforced and visible in shipped screens.
        </p>
      </header>
      <section className="mb-16">
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
      <section className="mt-16">
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
                  alt={shot.title}
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
      <section className="mt-16">
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
                  alt={shot.title}
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

      <section className="mt-16">
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
                      className="flex flex-wrap gap-3 items-baseline border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] pb-2"
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
                      className="flex flex-wrap gap-3 items-baseline border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] pb-2"
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
              {DESIGN_SYSTEM_COMPONENTS.map((c) => (
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
    </article>
  );
}
