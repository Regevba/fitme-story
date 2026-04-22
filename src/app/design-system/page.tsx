import Image from 'next/image';
import type { Metadata } from 'next';

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
    src: '/design-system/onboarding-goals.png',
    title: 'Goal selection',
    caption: 'The user picks a concrete outcome early, with large touch targets and one dominant active state.',
  },
  {
    src: '/design-system/onboarding-consent.png',
    title: 'Consent step',
    caption: 'Privacy and analytics consent are explained in plain language with a single primary decision path.',
  },
  {
    src: '/design-system/onboarding-first-action.png',
    title: 'First action',
    caption: 'The flow closes by pointing the user toward the first meaningful action instead of dropping them into an empty shell.',
  },
];

const PRODUCT_SCREENS = [
  {
    src: '/design-system/home-dashboard.png',
    title: 'Home dashboard',
    caption: 'Gradient shell, large-type greeting, and card surfaces using the semantic token stack.',
  },
  {
    src: '/design-system/training-plan-picker.png',
    title: 'Training plan',
    caption: 'Reusable sheet, selection states, and compact action cards inside the training flow.',
  },
  {
    src: '/design-system/settings-home.png',
    title: 'Settings information architecture',
    caption: 'Area-based grouping makes account, health, goals, training, and sync controls scan quickly.',
  },
  {
    src: '/design-system/stats-month-view.png',
    title: 'Stats month view',
    caption: 'Chart placeholders, segmented controls, and metric tiles all share one visual grammar.',
  },
  {
    src: '/design-system/ai-intelligence-sheet.png',
    title: 'AI intelligence sheet',
    caption: 'Modal presentation reuses the same spacing, typography, and surface rules as the rest of the app.',
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
      <section>
        <h2 className="font-serif text-2xl mb-3">Onboarding flow</h2>
        <p className="max-w-[var(--measure-body)] text-sm font-sans text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
          The onboarding path uses the same typography, spacing, card radius, and CTA logic as the rest of the app.
          That makes the first-run experience feel like the beginning of the product, not a separate mini-site.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
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
        <h2 className="font-serif text-2xl mb-3">Screens in practice</h2>
        <p className="max-w-[var(--measure-body)] text-sm font-sans text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
          These simulator captures come from the FitTracker design-system validation run in the main repo&apos;s
          <code className="mx-1 font-mono">docs/screenshots/</code>
          corpus. They show the token system after the v2 refactor, not static mocks.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {PRODUCT_SCREENS.map((shot) => (
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
    </article>
  );
}
