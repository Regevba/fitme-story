import Link from 'next/link';

const ANCHOR_CHIPS = [
  { hash: 'loop', label: 'The loop' },
  { hash: 'wall', label: 'The wall' },
  { hash: 'evolution', label: 'Evolution' },
  { hash: 'data', label: 'Data layer' },
  { hash: 'cache', label: 'Cache tiers' },
  { hash: 'build-your-own', label: 'Build your own' },
];

export function PmFlowHero() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-24 text-center">
      <h1 className="text-[length:var(--text-display-xl)] leading-[1.05] font-serif">
        The PM-flow ecosystem
      </h1>
      <p className="mt-6 text-lg max-w-[var(--measure-narrow)] mx-auto text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
        How the framework&apos;s 11 skills orchestrate a continuous product-development cycle. If you manage product work through Claude, this is the pattern.
      </p>
      <div className="mt-10 flex flex-wrap gap-2 justify-center">
        {ANCHOR_CHIPS.map((c) => (
          <Link
            key={c.hash}
            href={`#${c.hash}`}
            className="px-3 py-2 min-h-[44px] inline-flex items-center rounded-full text-sm font-sans border border-[var(--color-neutral-300)] hover:border-[var(--color-brand-indigo)] hover:text-[var(--color-brand-indigo)] transition-colors"
          >
            {c.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
