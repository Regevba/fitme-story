import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How this site stays honest — fitme-story',
  description:
    'Case studies and code are periodically audited by external AI models as an independent integrity check.',
};

export default function TrustPage() {
  return (
    <article className="max-w-[var(--measure-wide)] mx-auto px-6 py-16">
      <header className="mb-10">
        <h1 className="font-serif text-[length:var(--text-display-lg)]">
          How this site stays honest
        </h1>
        <p className="mt-4 text-xl text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          Every case study and line of code on this site is periodically reviewed by an independent
          external AI model — a neutral second pass that checks accuracy, honesty, and methodology.
          No curator-written spin; an outside model reads the same artifacts you do.
        </p>
      </header>

      <div className="prose prose-lg dark:prose-invert max-w-[var(--measure-body)]">
        <h2>What the audit checks for</h2>
        <ul>
          <li>
            Factual accuracy of every number in the case studies — commits, tests, metrics, timing
            claims
          </li>
          <li>
            Honest representation of failures alongside successes — nothing quietly dropped
          </li>
          <li>No cherry-picked data in comparisons</li>
          <li>
            No silent edits to historical claims (git history is preserved and publicly inspectable)
          </li>
          <li>No secrets or private data inadvertently published</li>
        </ul>

        <h2>Which models audit the site</h2>
        <p className="text-[var(--color-brand-coral)] font-sans text-sm not-prose mt-2">
          {'{{ TODO: USER_TO_FILL — which external AI models (e.g. Gemini 2.5 Pro, GPT-o3, etc.) run the audits, and optionally a short note on why each was chosen. Known: Gemini inspection pack ran over 221 project files (see project memory). }}'}
        </p>

        <h2>Audit cadence</h2>
        <p className="text-[var(--color-brand-coral)] font-sans text-sm not-prose mt-2">
          {'{{ TODO: USER_TO_FILL — how often audits run (e.g. after every major sprint, monthly, on each new case study publish); when the next one is scheduled. }}'}
        </p>

        <h2>Latest audit results</h2>
        <p className="text-[var(--color-brand-coral)] font-sans text-sm not-prose mt-2">
          {'{{ TODO: LINK_TO_LATEST_AUDIT_REPORT — point to an audit report page or markdown file once the first full cycle completes. }}'}
        </p>

        <hr />

        <p className="text-sm text-[var(--color-neutral-500)]">
          Everything on this site and its underlying code is open for inspection at{' '}
          <a href="https://github.com/Regevba/fitme-story">github.com/Regevba/fitme-story</a> and{' '}
          <a href="https://github.com/Regevba/fitme-showcase">github.com/Regevba/fitme-showcase</a>.
        </p>
      </div>
    </article>
  );
}
