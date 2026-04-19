import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The operations layer in practice — fitme-story',
  description: 'Three short studies of how the framework handled maintenance, cleanup, and IA drift.',
};

export default function OperationsLayerPage() {
  return (
    <article className="max-w-[var(--measure-wide)] mx-auto px-6 py-16">
      <header className="mb-10">
        <div className="inline-block font-sans text-sm uppercase tracking-wider text-white bg-[var(--color-brand-indigo)] px-3 py-1 rounded">
          Supporting studies
        </div>
        <h1 className="mt-4 font-serif text-[length:var(--text-display-lg)]">The operations layer in practice</h1>
        <p className="mt-4 text-xl text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          Three short studies of how the framework&apos;s operations layer handled maintenance, cleanup, and IA drift.
        </p>
      </header>
      <div className="prose prose-lg max-w-[var(--measure-body)]">
        <h2>Audit remediation</h2>
        <p>
          A systematic remediation of 170 audit findings across 6 domains, with serial sprints replacing an aborted
          concurrent dispatch. The operations layer recorded progress in <code>audit-findings.json</code> as the
          load-bearing slab; each sprint drained the queue in 30–120 minute windows.
        </p>
        <h2>Cleanup control-room program</h2>
        <p>
          The maintenance program that folded source-of-truth reconciliation, documentation hygiene, and framework-health
          checks into one reviewable cadence. Weekly digests surfaced drift before it compounded.
        </p>
        <h2>Control-center IA refresh</h2>
        <p>
          How the operations control room was realigned with the knowledge hub so navigation, nomenclature, and
          ownership all pointed at the same thing. Closed 22 cross-surface inconsistencies identified during the
          v5.1 parallel stress test.
        </p>
      </div>
    </article>
  );
}
