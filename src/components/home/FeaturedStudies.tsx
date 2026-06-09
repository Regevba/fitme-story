'use client';

// Three featured case studies on the home page, re-picked + relabeled per lens
// (dual-audience redesign T5). PM lens leads with outcome/process entry points;
// Dev lens leads with architecture/mechanism entry points. Reuses the DS
// CaseStudyCard so styling/typography matches the rest of the site.

import { CaseStudyCard } from '@/components/ui/CaseStudyCard';
import { useLens } from '@/lib/lens-client';
import type { Lens } from '@/lib/lens';

interface Featured {
  slug: string;
  version: string;
  title: string;
  tldr: string;
}

const FEATURED: Record<Lens, Featured[]> = {
  pm: [
    { slug: 'measurement-v6', version: 'v6.0', title: 'Measurement', tldr: 'Where the framework stopped estimating numbers and started capturing them — outcomes became provable.' },
    { slug: 'framework-v7-9-promotion', version: 'v7.9', title: 'v7.9 Promotion', tldr: 'Three advisory gates flip to enforced after a 14-day calibration window — the lifecycle hardening, end to end.' },
    { slug: 'parallel-stress-test', version: 'v5.2', title: 'Parallel stress test', tldr: 'Four features, 54 minutes, four merged PRs, zero conflicts — process at speed.' },
  ],
  dev: [
    { slug: 'hadf', version: 'v7.0', title: 'Hardware-aware dispatch', tldr: '17 chip profiles + Mahalanobis fingerprinting route each task to the right model tier for the detected machine.' },
    { slug: 'soc-on-software', version: 'v5.0', title: 'SoC-on-software', tldr: 'Skill-on-demand loading + cache compression — ~54K context tokens reclaimed by applying chip-architecture principles to software.' },
    { slug: 'framework-v7-8-1-branch-isolation', version: 'v7.8.1', title: 'Branch isolation', tldr: 'Three write-time pre-commit gates close empirically-witnessed silent-pass failure modes — enforcement internals.' },
  ],
};

export function FeaturedStudies() {
  const lens: Lens = useLens() ?? 'pm';
  const items = FEATURED[lens];
  return (
    <section
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-12"
      aria-label="Featured case studies"
    >
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-6">
        <h2 className="font-serif text-[length:var(--text-display-md)]">Featured</h2>
        <p className="font-sans text-sm text-[var(--color-neutral-500)]">
          Picked for {lens === 'pm' ? 'product managers' : 'developers'} ·{' '}
          <a href="/case-studies" className="text-[var(--color-brand-indigo)] hover:underline">
            all case studies →
          </a>
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((f) => (
          <CaseStudyCard
            key={f.slug}
            href={`/case-studies/${f.slug}`}
            title={f.title}
            tldr={f.tldr}
            tagLabel={f.version}
            tagVariant="flagship"
          />
        ))}
      </div>
    </section>
  );
}
