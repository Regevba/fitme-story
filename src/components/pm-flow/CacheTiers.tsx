const TIERS = [
  {
    label: 'L1',
    location: '.claude/cache/{skill}/',
    description: 'Per-skill cache. Fastest to hit. Holds skill-specific recent patterns.',
    accent: 'var(--color-brand-indigo)',
  },
  {
    label: 'L2',
    location: '.claude/cache/_shared/',
    description: 'Cross-skill shared patterns. Hit when L1 misses.',
    accent: 'var(--color-brand-coral)',
  },
  {
    label: 'L3',
    location: '.claude/cache/_project/',
    description: 'Project-wide lore. Slowest tier. Cache of last resort.',
    accent: 'var(--skill-research)',
  },
];

export function CacheTiers() {
  return (
    <div
      className="my-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[var(--measure-wide)] mx-auto"
      aria-label="Cache tiers — CPU-analog three-tier cache"
    >
      {TIERS.map((tier) => (
        <div
          key={tier.label}
          className="min-w-0 rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-5 bg-white dark:bg-[var(--color-neutral-900)]"
          style={{ borderLeft: `6px solid ${tier.accent}` }}
        >
          <div className="mb-3 min-w-0">
            <span className="font-serif text-3xl font-semibold">{tier.label}</span>
            <code className="mt-2 block break-all text-xs leading-5 text-[var(--color-neutral-500)] font-mono">
              {tier.location}
            </code>
          </div>
          <p className="text-sm leading-6 text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
            {tier.description}
          </p>
        </div>
      ))}
    </div>
  );
}
