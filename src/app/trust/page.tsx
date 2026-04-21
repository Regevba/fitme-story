import type { Metadata } from 'next';
import Link from 'next/link';

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
        <p>
          Audits are performed by models from different vendors than the one that writes
          the site. The goal is independence — a model that had no hand in producing the
          artifacts it reviews.
        </p>
        <ul>
          <li>
            <strong>Google Gemini 2.5 Pro</strong> — inaugural external auditor, first
            pass on 2026-04-21.
          </li>
        </ul>
        <p className="text-sm text-[var(--color-neutral-500)]">
          Additional auditors (from other vendors and model families) will be added as
          they run. Each audit is archived verbatim with the date it was performed and
          the model that performed it. Nothing is silently re-audited or retracted.
        </p>

        <h2>Audit cadence</h2>
        <ul>
          <li>
            <strong>On-demand</strong> after each framework version bump or major
            case-study batch.
          </li>
          <li>
            <strong>Minimum quarterly</strong> even if no version bump has occurred, to
            catch drift.
          </li>
          <li>
            <strong>Immediately</strong> if an internal structural check (the 72h
            integrity cycle) flags a regression that is not resolvable in-repo.
          </li>
        </ul>

        <h2>Latest audit results</h2>
        <div className="not-prose my-6 rounded-lg border border-[var(--color-neutral-300)] bg-[var(--color-neutral-50)] p-6 dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)]">
          <p className="text-sm uppercase tracking-wide text-[var(--color-neutral-500)]">
            2026-04-21 · Google Gemini 2.5 Pro
          </p>
          <p className="mt-3 font-serif text-xl">
            Mixed: methodologically strong, empirically weak on pre-v6.0 quantitative
            claims.
          </p>
          <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="font-semibold">Scope</dt>
              <dd>24 showcase + 41 main-repo case studies + 3 internal meta-analyses</dd>
            </div>
            <div>
              <dt className="font-semibold">Well-supported</dt>
              <dd>
                Process documentation; internal arithmetic; post-v6.0 instrumentation;
                honest failure reporting
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Weak / uncertain</dt>
              <dd>
                Pre-v6.0 quantitative claims; causality of speedup; power-law predictive
                power; runtime correctness
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Open corrections</dt>
              <dd>
                3 cited PRs don&apos;t resolve — tracked at{' '}
                <a
                  href="https://github.com/Regevba/FitTracker2/issues/138"
                  className="underline"
                >
                  FitTracker2 #138
                </a>
              </dd>
            </div>
          </dl>
          <p className="mt-4">
            <Link
              href="/trust/audits/2026-04-21-gemini"
              className="inline-block rounded bg-[var(--color-neutral-900)] px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-100)] dark:text-[var(--color-neutral-900)] dark:hover:bg-[var(--color-neutral-300)]"
            >
              Read the full audit →
            </Link>
          </p>
        </div>

        <h2>How we act on audit findings</h2>
        <p>
          Findings are not silently fixed. When an audit surfaces a broken citation, a
          methodological flaw, or a data inconsistency, we:
        </p>
        <ol>
          <li>
            <strong>Publish the audit verbatim</strong> — even before corrections are
            made, so the raw finding is visible.
          </li>
          <li>
            <strong>File a tracked issue</strong> on the underlying code repository
            (e.g., FitTracker2) with the remediation plan.
          </li>
          <li>
            <strong>Append corrections, don&apos;t overwrite.</strong> The audit archive
            and its git history show what was found, what was done, and when.
          </li>
          <li>
            <strong>Harden the process</strong> so the same class of finding can&apos;t
            recur (e.g., the 72h integrity cycle and the &ldquo;Auditor Agent&rdquo;
            recommended by Gemini).
          </li>
        </ol>

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
