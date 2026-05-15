import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BlueprintOverlay } from '@/components/bespoke/BlueprintOverlay';
import { Card } from '@/components/ui/Card';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'The framework',
  description: 'Six floors of an AI-orchestrated PM framework, explained layer by layer.',
  slug: '/framework',
});

export default function FrameworkPage() {
  return (
    <article className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-10">
        <h1 className="font-serif text-[length:var(--text-display-lg)]">The framework</h1>
        <p className="mt-4 text-xl text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          Seven floors. Hover to explore how each layer contributes.
        </p>
      </header>
      <BlueprintOverlay interactive />
      <div className="prose prose-lg dark:prose-invert max-w-[var(--measure-body)] mt-16">
        <h2>How the floors cooperate</h2>
        <p>
          The framework is organized as eight floors stacked on a shared slab. Floor 1 holds the source-of-truth state. Floor 2 is the hub-and-spoke of skills and their cache tiers (<strong>12 skills since 2026-05-14</strong>: 1 hub + 11 spokes — <code>/brainstorm-pm</code> added in the skills-review execution sweep). Floors 3–5 add successive SoC-inspired primitives — skill-on-demand loading, batch dispatch, dispatch intelligence. Floor 6 observes the lower floors via the v6.0 measurement overlay. Floor 7 promotes that observation into mechanical enforcement: 30+ gates + 5 advisories split across write-time pre-commit hooks, the 72h integrity cycle, a per-PR review bot, a weekly framework-status cron, and the Tier 1/2/3 readout dashboards. Floor 8 is the v7.8 → v7.9 bridge cadence (v7.8 shipped 2026-05-04 with six advisory mechanisms A–F; v7.8.1 added branch-isolation + closure-completeness gates 2026-05-07; v7.8.2 documented the cross-repo telemetry exemption 2026-05-08; v7.8.3 landed the cross-repo state-sync release umbrella with V2/V9/D-1/D-3 2026-05-11; v7.8.4 narrowed TIER_TAG heuristic + auto-refreshed PR cache 2026-05-12; v7.8.5 shipped the Observed Patterns Catalog + W9 branch-drift hook 2026-05-13; v7.8.5+S 2026-05-14 swept all 12 SKILL.md files for trigger-rich descriptions, frontmatter, observed-patterns preflight, anti-patterns, plus <code>make skills-audit</code> with 6 conformance checks and a preflight-fixture regression harness; v7.8.6 2026-05-15 closed the 96h drift window with <code>make integrity-diff</code> vs 2026-05-14 anchor + <code>make preflight WORK_TYPE=&lt;type&gt;</code> unified entry point writing <code>.claude/shared/preflight-cache.json</code> consumed by all 10 skills + W1 ssh-agent SessionStart preflight + weekly Mechanism A gate-coverage zero-drift scan + per-dimension trend nudge + weekly dependency audit + daily stale-branch / PR-babysit). v7.9 promotion lands ~2026-06-01 after a +7d measurement window confirms zero false-positives.
        </p>
        <p>
          For the full worked example of a single sprint flowing through these floors, see the{' '}
          <a href="/case-studies/soc-on-software">SoC-v5.0 case study</a>.
        </p>
      </div>
      {/* T1 (P2-022 audit follow-up 2026-05-10): 2 inline rounded-lg interactive
          nav cards migrated to <Card interactive>. Hover-shadow-lg preserved
          via className override since the base Card doesn't include shadow. */}
      <section className="mt-16">
        <Link href="/framework/dispatch" className="block">
          <Card
            interactive
            padding="md"
            className="group hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl group-hover:text-[var(--color-brand-indigo)]">
                  See the framework in motion →
                </h2>
                <p className="mt-2 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                  Two real feature traces walked through the six floors — scroll-driven, with floor-by-floor firing order.
                </p>
              </div>
              <ArrowRight size={24} className="text-[var(--color-brand-indigo)] shrink-0" />
            </div>
          </Card>
        </Link>
      </section>
      <section className="mt-6">
        <Link href="/framework/dev-guide" className="block">
          <Card
            interactive
            padding="md"
            className="group hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl group-hover:text-[var(--color-brand-indigo)]">
                  Developer guide (v1.0 → v7.8.6) →
                </h2>
                <p className="mt-2 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                  Technical reference for developers onboarding to the framework. 4 enforcement layers, <code>state.json</code> schema (incl. v7.8.3 cross-repo <code>state_owner</code> enum), phase lifecycle, dispatch model, cache architecture, measurement protocol, 34 mechanical gates + 5 advisories, v7.8 bridge mechanisms A–F, v7.8.3 cross-repo state-sync, v7.8.5 Observed Patterns Catalog + W9 branch-drift alert, v7.8.5+S skills-review execution (12 skills + <code>make skills-audit</code>), v7.8.6 cadence batch (unified preflight + integrity-diff + weekly trend scan + dependency audit), 3 operational walkthroughs, compressed v1.0 → v7.8.6 timeline.
                </p>
              </div>
              <ArrowRight size={24} className="text-[var(--color-brand-indigo)] shrink-0" />
            </div>
          </Card>
        </Link>
      </section>
    </article>
  );
}
