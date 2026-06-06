/**
 * VisitorComprehensionPanel.tsx
 *
 * Phase 4.H / T-comprehension-panel. Mounted on /control-room/framework.
 *
 * Surfaces the 6 framework_universe_* GA4 events shipped via #198
 * (T-ga4-events), the expected funnel, and a placeholder for the
 * live-data slot. When GA4 collection accumulates and the MCP-fed
 * /control-room/analytics route is wired against these events, the
 * "Awaiting first batch" rows fill in.
 *
 * Why ship the scaffold now:
 *   1. Operators see the analytics surface that's already collecting
 *   2. The structural slot for live data is in place — when the GA4
 *      data flows, the wiring is a focused diff rather than a new
 *      panel from scratch
 *   3. The event schema lives next to the analytics helpers so the
 *      docs + code stay in lockstep (drift catches at review time)
 *
 * Server Component. No client-side interactivity needed at this
 * stage — once live-data wiring lands, the data fetcher can stay
 * server-side as well (the existing dashboard uses force-dynamic).
 */

import { ExternalLink } from 'lucide-react';

interface TrackedEvent {
  name: string;
  description: string;
  funnelStep?: number;
}

const TRACKED_EVENTS: TrackedEvent[] = [
  {
    name: 'framework_universe_act_enter',
    description:
      'Fires at each Act boundary (Acts I–VI). Funnel anchor — drives the act-completion ladder.',
    funnelStep: 1,
  },
  {
    name: 'framework_universe_label_hover',
    description:
      'Fires when pointer enters a HoverCard-wrapped label (Act III pattern annotations, Act IV gate-fire emitters, etc.). Engagement signal.',
    funnelStep: 2,
  },
  {
    name: 'framework_universe_scrub_seek',
    description:
      'Fires on timeline scrub. Tells us whether visitors re-watch specific acts (lands once T-scrub-pause-timedilation is wired, Phase 4.E follow-up).',
    funnelStep: 3,
  },
  {
    name: 'framework_universe_time_dilation',
    description:
      'Fires on slow/fast toggle. Same Phase 4.E follow-up dependency.',
    funnelStep: 3,
  },
  {
    name: 'framework_universe_replay',
    description:
      'Fires on replay (user click or auto-loop after Act VI). Distinguishes "watched once and left" vs "watched again on purpose".',
    funnelStep: 4,
  },
  {
    name: 'framework_universe_fallback_tier_activated',
    description:
      'Fires when the FR-4 cascade activates Tier 2 (Rive) or Tier 3 (poster). Tracks the distribution of capabilities in the wild.',
    funnelStep: 0,
  },
];

const EXPECTED_FUNNEL = [
  { step: 'Act I enter', baseline: 1.0, label: 'All visitors who reach the page' },
  { step: 'Act III enter', baseline: 0.7, label: 'Engaged through architecture buildout' },
  { step: 'Act IV label_hover', baseline: 0.3, label: 'Interacted with gate-firing emitters' },
  { step: 'Act VI enter', baseline: 0.5, label: 'Completed the walkthrough' },
  { step: 'replay', baseline: 0.1, label: 'Watched again on purpose' },
];

export function VisitorComprehensionPanel() {
  return (
    <section
      aria-labelledby="visitor-comprehension-heading"
      className="rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] p-6 bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)]"
    >
      <header className="mb-4">
        <h2
          id="visitor-comprehension-heading"
          className="font-serif text-xl leading-tight"
        >
          Visitor Comprehension (3D Universe)
        </h2>
        <p className="mt-1 text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          GA4 funnel for <code className="font-mono text-xs">/framework/universe</code> + <code className="font-mono text-xs">/control-room/framework/universe</code>. 6 events emitted from the same scene tree across visitor + operator modes.
        </p>
      </header>

      {/* Event schema — always visible. */}
      <div className="mb-6">
        <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-neutral-500)] mb-2">
          Tracked events
        </h3>
        <ul className="space-y-2">
          {TRACKED_EVENTS.map((e) => (
            <li key={e.name} className="text-sm">
              <code className="font-mono text-xs text-[var(--color-brand-indigo)]">
                {e.name}
              </code>
              <p className="mt-0.5 text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
                {e.description}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Expected funnel — baseline expectations until real data accumulates. */}
      <div className="mb-6">
        <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-neutral-500)] mb-2">
          Expected funnel (baseline)
        </h3>
        <ol className="space-y-2">
          {EXPECTED_FUNNEL.map((row) => (
            <li
              key={row.step}
              className="text-sm flex items-baseline gap-3 border-l-2 border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-600)] pl-3"
            >
              <span className="font-mono text-xs tabular-nums w-12 text-[var(--color-neutral-500)]">
                {(row.baseline * 100).toFixed(0)}%
              </span>
              <span className="font-medium">{row.step}</span>
              <span className="text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
                — {row.label}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Live-data slot — placeholder until GA4 wiring lands. */}
      <div className="rounded border border-dashed border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-600)] p-4">
        <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--color-neutral-500)] mb-2">
          Live data
        </h3>
        <p className="text-sm text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          Awaiting first batch of post-deploy events. The GA4 MCP-fed loader at <code className="font-mono text-xs">src/lib/control-room/analytics.ts</code> will surface scene-by-scene completion + dwell-time + scrub interactions once the events accumulate. Until then, the expected funnel above stands as the baseline.
        </p>
      </div>

      {/* Operator action: GA4 DebugView during verification. */}
      <div className="mt-6 text-xs text-[var(--color-neutral-500)]">
        <p>
          Verification —{' '}
          <a
            href="https://analytics.google.com/analytics/web/#/p/admin/debugger"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-brand-indigo)] hover:underline inline-flex items-center gap-1"
          >
            GA4 Real-Time DebugView
            <ExternalLink size={10} aria-hidden />
          </a>{' '}
          confirms event emission against the preview deploy with{' '}
          <code className="font-mono">?gtm_debug=x</code>.
        </p>
      </div>
    </section>
  );
}
