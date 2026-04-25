import type { Metadata } from 'next';
import Link from 'next/link';
import { PmFlowHero } from '@/components/pm-flow/PmFlowHero';
import { LifecycleLoop } from '@/components/pm-flow/LifecycleLoop';
import { LegoWall } from '@/components/pm-flow/LegoWall';
import { EvolutionStrip } from '@/components/pm-flow/EvolutionStrip';
import { SharedDataTiles } from '@/components/pm-flow/SharedDataTiles';
import { CacheTiers } from '@/components/pm-flow/CacheTiers';
import { Term } from '@/components/mdx/Term';

export const metadata: Metadata = {
  title: 'The PM-flow ecosystem — fitme-story',
  description: 'How the framework\'s 11 skills orchestrate a continuous product-development cycle. A guide for PMs using Claude.',
};

export default function PmFlowPage() {
  return (
    <>
      <PmFlowHero />

      <section id="loop" className="max-w-6xl mx-auto px-6 py-16 scroll-mt-20">
        <h2 className="font-serif text-3xl mb-4">The process is a cycle, not a pipeline.</h2>
        <p className="max-w-[var(--measure-body)] text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          Product development never ends with shipping. It loops back through monitoring, feedback, and analysis into the next iteration. The inner ring below shows the 10 phases. After <strong>P8 Release</strong>, three feedback skills (CX, Ops, Marketing) observe the shipped product and feed signals back to Research and Learn — closing the loop. A separate <strong>Docs satellite</strong> sits off-cycle, carrying internal artifacts (PRDs, QA reports, runbooks) bidirectionally between PRD, Tasks, UX, and Test.
        </p>
        <LifecycleLoop />
        <aside
          aria-label="Note on Docs vs Release"
          className="mx-auto mt-8 max-w-[var(--measure-body)] rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)] p-5 text-sm font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] leading-relaxed"
        >
          <p className="text-xs uppercase tracking-wider text-[var(--color-neutral-500)] mb-2">
            Footnote · Docs vs Release
          </p>
          <p>
            <strong>Docs</strong> is a <em>structural</em> part of the
            framework — full documentation about the process, the case
            studies, the runbooks, the lifecycle records — most of it
            written <em>after</em> Merge but during the same lifecycle.
            It&apos;s shown as an off-cycle satellite because its readers
            are internal: future agents, reviewing humans, the next
            iteration&apos;s research phase. <strong>Release</strong>, by
            contrast, is the <em>external</em> artifact — the moment the
            feature is live for users. That&apos;s why Release is a phase
            on the inner ring (the public ship event triggers the feedback
            loop), and Docs is a moon (the documentation work flows
            between phases without being a phase itself).
          </p>
        </aside>
      </section>

      <section id="wall" className="max-w-6xl mx-auto px-6 py-16 scroll-mt-20">
        <h2 className="font-serif text-3xl mb-4">Every skill stands alone. All skills fit together.</h2>
        <p className="max-w-[var(--measure-body)] text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          Each skill is a Lego brick — it works on its own AND it snaps into the 10-phase lifecycle (the <Term slug="hub-and-spoke">hub-and-spoke topology</Term>). Toggle <em>Scattered</em> to see them standalone; toggle <em>Assembled</em> to see them fit into phase columns. Click any brick to flip it and read the details.
        </p>
        <LegoWall />
      </section>

      <section id="evolution" className="max-w-6xl mx-auto px-6 py-16 scroll-mt-20">
        <h2 className="font-serif text-3xl mb-4">How the ecosystem grew</h2>
        <p className="max-w-[var(--measure-body)] text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          From a single monolithic skill in v1.0 to a hub-and-spoke topology by v4.3, then <Term slug="soc">SoC-on-software</Term> optimizations, dispatch intelligence, and hardware-aware dispatch. Six milestones that matter most.
        </p>
        <EvolutionStrip />
      </section>

      <section id="data" className="max-w-6xl mx-auto px-6 py-16 scroll-mt-20">
        <h2 className="font-serif text-3xl mb-4">The files the skills speak through.</h2>
        <p className="max-w-[var(--measure-body)] text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          Skills do not call each other directly — they read and write shared JSON files in <code className="font-mono">.claude/shared/</code>. Decoupling by design. Any skill can run standalone because every skill just reads state and writes state. The colored dots show which skills touch each file.
        </p>
        <SharedDataTiles />
      </section>

      <section id="cache" className="max-w-6xl mx-auto px-6 py-16 scroll-mt-20">
        <h2 className="font-serif text-3xl mb-4">Three cache tiers, just like a CPU.</h2>
        <p className="max-w-[var(--measure-body)] text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          The framework borrows the <Term slug="cache-tiers">L1/L2/L3 cache hierarchy</Term> directly from CPU architecture. L1 is per-skill (fastest), L2 is shared across skills, L3 is project-wide lore. When a skill needs context, it checks L1 first — if it misses, it tries L2, then L3.
        </p>
        <CacheTiers />
      </section>

      <section id="build-your-own" className="max-w-4xl mx-auto px-6 py-16 scroll-mt-20">
        <h2 className="font-serif text-3xl mb-4">Want this pattern in your own setup?</h2>
        <div className="prose prose-lg dark:prose-invert max-w-[var(--measure-body)]">
          <ul>
            <li><strong>Start with one hub skill + one phase.</strong> Do not try to stand up the whole ten-phase lifecycle on day one.</li>
            <li><strong>Shared-state-first.</strong> Skills read and write JSON state. They never call each other directly — that decoupling is what makes the ecosystem composable.</li>
            <li><strong>Add phases and spokes incrementally.</strong> The evolution strip above is a real receipt of how this grew. Iteration, not planning.</li>
          </ul>
          <p>
            The skill source files are open under CC-BY-4.0 at{' '}
            <a href="https://github.com/Regevba/FitTracker2/tree/main/.claude/skills" target="_blank" rel="noopener noreferrer">
              github.com/Regevba/FitTracker2 — .claude/skills
            </a>.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-4">
          <Link href="/framework" className="group block p-5 rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] hover:border-[var(--color-brand-indigo)]">
            <div className="font-serif text-lg group-hover:text-[var(--color-brand-indigo)]">The 6-floor building →</div>
            <p className="mt-2 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
              Zoom out to the full framework architecture.
            </p>
          </Link>
          <Link href="/framework/dispatch" className="group block p-5 rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] hover:border-[var(--color-brand-indigo)]">
            <div className="font-serif text-lg group-hover:text-[var(--color-brand-indigo)]">Watch it run →</div>
            <p className="mt-2 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
              A real feature flowing through the framework in real time.
            </p>
          </Link>
          <Link href="/glossary" className="group block p-5 rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] hover:border-[var(--color-brand-indigo)]">
            <div className="font-serif text-lg group-hover:text-[var(--color-brand-indigo)]">Glossary →</div>
            <p className="mt-2 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
              Plain-language definitions for every term on this page.
            </p>
          </Link>
        </div>
      </section>
    </>
  );
}
