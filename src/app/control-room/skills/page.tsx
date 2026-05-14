/**
 * /control-room/skills — Skills Activity panel (P1.2 MVP)
 *
 * Closes P1.2 from FitTracker2 `docs/skills/skills-review-2026-05-13.md` §5.
 * MVP scope: static inventory of the 12 project-owned skills under
 * FT2's `.claude/skills/*`. Frontmatter snapshot taken at the
 * 2026-05-14 v7.8.5+S sweep ship time.
 *
 * Dynamic data sources (state.json::cache_hits[], _session-*.events.jsonl,
 * live SKILL.md frontmatter) are NOT wired in this PR. They exist on the
 * FT2 side (per P1.1 `/dev skills trace` + P0.4 `make skills-audit`) but
 * are not yet mirrored into fitme-story's sync target. The follow-up:
 *
 *   1. Extend `scripts/sync-from-fittracker2.ts` to mirror
 *      `.claude/skills/{name}/SKILL.md` → `src/data/skills/{name}/SKILL.md`
 *   2. Replace SKILL_MANIFEST below with a runtime YAML-frontmatter parser
 *   3. Add `_session-*.events.jsonl` aggregator for usage tracing
 *
 * Until that lands, regenerate the manifest below by hand whenever a
 * SKILL.md `last_updated:` changes. The page footer shows the manifest
 * date so reviewers can spot rot.
 *
 * Gated by proxy.ts basic-auth on /control-room/*.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Skills Activity — Control room',
  description:
    'Inventory + last-updated + adapter usage for the 12 project-owned skills under .claude/skills/*. Static snapshot from the 2026-05-14 v7.8.5+S sweep; dynamic sync deferred to a follow-up.',
  robots: { index: false, follow: false },
};

// ────────────────────────────────────────────────────────────────────────────
// Skill manifest — hand-synced at sweep time. Update on any SKILL.md
// frontmatter change. See header comment for follow-up to make dynamic.
// ────────────────────────────────────────────────────────────────────────────

const MANIFEST_DATE = '2026-05-14';

type SkillStatus = 'active' | 'stable' | 'planned' | 'deprecated';

interface SkillRow {
  name: string;
  description: string; // first sentence of frontmatter description
  status: SkillStatus;
  lastUpdated: string; // YYYY-MM-DD
  frameworkVersion: string; // vX.Y or vX.Y.Z
  adaptersUsed: string[];
  loc: number; // SKILL.md line count at sweep time (rough proxy for skill size)
  phase: string; // one-line phase ownership
}

const SKILLS: readonly SkillRow[] = [
  {
    name: 'pm-workflow',
    description: 'Hub. 10-phase product lifecycle orchestrator + roadmap sub-cmd.',
    status: 'active',
    lastUpdated: '2026-05-14',
    frameworkVersion: 'v7.8.5',
    adaptersUsed: ['ga4'],
    loc: 1688,
    phase: 'All phases (dispatch)',
  },
  {
    name: 'ux',
    description: 'UX research, specs, wireframes, validation, preflight + pre-merge-review gates.',
    status: 'active',
    lastUpdated: '2026-05-14',
    frameworkVersion: 'v7.8.5',
    adaptersUsed: ['axe'],
    loc: 525,
    phase: 'Phase 0 (v2 audit) + Phase 3 + Phase 6',
  },
  {
    name: 'design',
    description: 'Design system governance, Figma MCP build, Code Connect bridge, preflight + pre-merge-review gates.',
    status: 'active',
    lastUpdated: '2026-05-14',
    frameworkVersion: 'v7.8.5',
    adaptersUsed: ['axe'],
    loc: 344,
    phase: 'Phase 3 + Phase 6',
  },
  {
    name: 'cx',
    description: 'Reviews, NPS, sentiment, post-deploy digests, root-cause feedback dispatch.',
    status: 'stable',
    lastUpdated: '2026-05-14',
    frameworkVersion: 'v7.8.5',
    adaptersUsed: ['app-store-connect', 'ga4', 'sentry'],
    loc: 242,
    phase: 'Phase 0 + Phase 8 + Phase 9',
  },
  {
    name: 'analytics',
    description: 'Event taxonomy, instrumentation validation, dashboards, funnels, live watch.',
    status: 'active',
    lastUpdated: '2026-05-14',
    frameworkVersion: 'v7.8.5',
    adaptersUsed: ['ga4'],
    loc: 232,
    phase: 'Phase 1 + Phase 5 + Phase 8',
  },
  {
    name: 'marketing',
    description: 'ASO, campaigns, competitive analysis, content, launch comms, App Store screenshots.',
    status: 'stable',
    lastUpdated: '2026-05-14',
    frameworkVersion: 'v7.8.5',
    adaptersUsed: ['app-store-connect', 'firecrawl'],
    loc: 231,
    phase: 'Phase 0 + Phase 8',
  },
  {
    name: 'ops',
    description: 'Infrastructure health, incident response, cloud cost audit, alert config.',
    status: 'stable',
    lastUpdated: '2026-05-14',
    frameworkVersion: 'v7.8.5',
    adaptersUsed: ['security-audit', 'sentry'],
    loc: 231,
    phase: 'Cross-phase',
  },
  {
    name: 'research',
    description: 'Wide-to-narrow research funnel (cross-industry → same-category → feature-specific).',
    status: 'active',
    lastUpdated: '2026-05-14',
    frameworkVersion: 'v7.8.5',
    adaptersUsed: ['firecrawl'],
    loc: 230,
    phase: 'Phase 0',
  },
  {
    name: 'release',
    description: 'Version bumps, changelogs, TestFlight prep, App Store submission.',
    status: 'stable',
    lastUpdated: '2026-05-14',
    frameworkVersion: 'v7.8.5',
    adaptersUsed: ['app-store-connect'],
    loc: 187,
    phase: 'Phase 7',
  },
  {
    name: 'qa',
    description: 'Test planning, coverage, regression sweeps, security audits.',
    status: 'active',
    lastUpdated: '2026-05-14',
    frameworkVersion: 'v7.8.5',
    adaptersUsed: ['axe', 'security-audit', 'sentry'],
    loc: 179,
    phase: 'Phase 5',
  },
  {
    name: 'dev',
    description: 'Branching, code review, CI status, deps, perf, skill-of-skills meta-checks.',
    status: 'active',
    lastUpdated: '2026-05-14',
    frameworkVersion: 'v7.8.5',
    adaptersUsed: ['security-audit'],
    loc: 173,
    phase: 'Phase 4 + Phase 6 + Phase 7',
  },
  {
    name: 'brainstorm-pm',
    description: 'PM-flavored brainstorming with 4 modes (problem/solution/assumption/strategy) and 4 frameworks.',
    status: 'active',
    lastUpdated: '2026-05-14',
    frameworkVersion: 'v7.8.5',
    adaptersUsed: [],
    loc: 210,
    phase: 'Phase 0 (default new-feature entry point)',
  },
];

const FT2_GH = 'https://github.com/Regevba/FitTracker2';

const STATUS_BADGE_STYLES: Record<SkillStatus, string> = {
  active: 'bg-[var(--color-success-bg)] text-[var(--color-success-fg)]',
  stable: 'bg-[var(--color-info-bg,#dbeafe)] text-[var(--color-info-fg,#1e40af)]',
  planned: 'bg-[var(--color-warn-bg)] text-[var(--color-warn-fg)]',
  deprecated: 'bg-[var(--color-neutral-200)] text-[var(--color-neutral-700)]',
};

// ────────────────────────────────────────────────────────────────────────────
// Section wrapper — mirrors framework/page.tsx style
// ────────────────────────────────────────────────────────────────────────────

function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-14">
      <div className="mb-5">
        <h2 className="font-serif text-xl text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)] font-sans">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────────────

export default function SkillsActivityPage() {
  const activeCount = SKILLS.filter((s) => s.status === 'active').length;
  const stableCount = SKILLS.filter((s) => s.status === 'stable').length;
  const totalAdapters = new Set(SKILLS.flatMap((s) => s.adaptersUsed)).size;

  return (
    <article className="max-w-[var(--measure-body)]">
      <header className="mb-10">
        <p className="text-sm font-mono uppercase tracking-wider text-[var(--color-brand-indigo)]">
          UCC · P1.2
        </p>
        <h1 className="mt-2 font-serif text-[length:var(--text-display-md)]">
          Skills Activity
        </h1>
        <p className="mt-3 text-base text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          Inventory + frontmatter snapshot of the 12 project-owned skills under{' '}
          <code>.claude/skills/*</code>. Closes P1.2 from the{' '}
          <Link
            href={`${FT2_GH}/blob/main/docs/skills/skills-review-2026-05-13.md`}
            className="underline decoration-[var(--color-brand-indigo)] underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            skills-review 2026-05-13
          </Link>{' '}
          queue. MVP: static manifest dated <strong>{MANIFEST_DATE}</strong>; live data
          (cache_hits + session ledgers + audit findings) deferred to a follow-up
          sync extension.
        </p>
        <dl className="mt-6 grid grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="font-mono text-xs uppercase tracking-wider text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
              Skills total
            </dt>
            <dd className="mt-1 font-serif text-2xl text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
              {SKILLS.length}
              <span className="ml-2 text-sm font-sans font-normal text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
                (1 hub + {SKILLS.length - 1} spokes)
              </span>
            </dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-wider text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
              Status mix
            </dt>
            <dd className="mt-1 font-serif text-2xl text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
              {activeCount} active
              <span className="ml-2 text-sm font-sans font-normal text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
                · {stableCount} stable
              </span>
            </dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-wider text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
              Distinct adapters
            </dt>
            <dd className="mt-1 font-serif text-2xl text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)]">
              {totalAdapters}
              <span className="ml-2 text-sm font-sans font-normal text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
                wired
              </span>
            </dd>
          </div>
        </dl>
      </header>

      <Section
        id="inventory"
        title="Inventory"
        subtitle="Frontmatter snapshot at v7.8.5+S sweep time. Click a skill to open its SKILL.md on GitHub."
      >
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-700)] text-left font-mono text-xs uppercase tracking-wider text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
                <th className="px-3 py-3">Skill</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Last updated</th>
                <th className="px-3 py-3">Framework</th>
                <th className="px-3 py-3">Adapters</th>
                <th className="px-3 py-3 text-right">LoC</th>
                <th className="px-3 py-3">Phase ownership</th>
              </tr>
            </thead>
            <tbody>
              {SKILLS.map((s) => (
                <tr
                  key={s.name}
                  className="border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-800)]"
                >
                  <td className="px-3 py-3 align-top">
                    <Link
                      href={`${FT2_GH}/blob/main/.claude/skills/${s.name}/SKILL.md`}
                      className="font-mono text-[var(--color-brand-indigo)] underline-offset-4 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      /{s.name}
                    </Link>
                    <p className="mt-1 text-xs text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] font-sans">
                      {s.description}
                    </p>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-mono ${STATUS_BADGE_STYLES[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-top font-mono text-xs">{s.lastUpdated}</td>
                  <td className="px-3 py-3 align-top font-mono text-xs">{s.frameworkVersion}</td>
                  <td className="px-3 py-3 align-top">
                    {s.adaptersUsed.length === 0 ? (
                      <span className="text-xs italic text-[var(--color-neutral-500)]">none</span>
                    ) : (
                      <ul className="flex flex-wrap gap-1">
                        {s.adaptersUsed.map((a) => (
                          <li
                            key={a}
                            className="inline-block rounded bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] px-1.5 py-0.5 text-xs font-mono"
                          >
                            {a}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-3 py-3 align-top text-right font-mono text-xs tabular-nums">
                    {s.loc}
                  </td>
                  <td className="px-3 py-3 align-top text-xs">{s.phase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        id="audit"
        title="Mechanical audit (FT2 commands)"
        subtitle="Run these in the FitTracker2 repo to see live state."
      >
        <ul className="space-y-3 text-sm">
          <li>
            <code className="bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] px-1.5 py-0.5 rounded font-mono text-xs">
              make skills-audit
            </code>{' '}
            — 6 mechanical checks (E1–E4 + W1–W5) covering frontmatter integrity, trigger-rich
            descriptions, observed-patterns refs, adapter + script path resolution, freshness,
            and bidirectional adapter ↔ skill linkage. Wired into{' '}
            <code className="font-mono text-xs">make integrity-check</code> as advisory.
          </li>
          <li>
            <code className="bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] px-1.5 py-0.5 rounded font-mono text-xs">
              make preflight-fixture-test
            </code>{' '}
            — regression harness for <code className="font-mono text-xs">/ux preflight</code> +{' '}
            <code className="font-mono text-xs">/design preflight</code> spec-side symbol-existence checks (P1.3).
          </li>
          <li>
            <code className="bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] px-1.5 py-0.5 rounded font-mono text-xs">
              python3 scripts/skills-audit.py --skill {'<name>'}
            </code>{' '}
            — audit a single skill (bypasses the reverse-direction W5 check).
          </li>
          <li>
            <code className="bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] px-1.5 py-0.5 rounded font-mono text-xs">
              python3 scripts/skills-audit.py --max-age-days 30
            </code>{' '}
            — tighten W4 freshness threshold (default 90 days).
          </li>
        </ul>
      </Section>

      <Section
        id="references"
        title="References"
        subtitle="Canonical sources of truth on the FT2 side."
      >
        <ul className="space-y-2 text-sm">
          {[
            { name: 'Skills review report 2026-05-13', path: 'docs/skills/skills-review-2026-05-13.md' },
            { name: 'Skills CHANGELOG', path: 'docs/skills/CHANGELOG.md' },
            { name: 'UCC data-flow contract', path: 'docs/skills/ucc-data-flow.md' },
            { name: 'Skills README + evolution', path: 'docs/skills/README.md' },
            { name: 'Observed Patterns Catalog (v7.8.5)', path: '.claude/integrity/observed-patterns.md' },
            { name: 'scripts/skills-audit.py', path: 'scripts/skills-audit.py' },
            { name: 'scripts/preflight-fixture-test.py', path: 'scripts/preflight-fixture-test.py' },
          ].map((ref) => (
            <li key={ref.path}>
              <Link
                href={`${FT2_GH}/blob/main/${ref.path}`}
                className="underline decoration-[var(--color-brand-indigo)] underline-offset-4 hover:text-[var(--color-brand-indigo)]"
                target="_blank"
                rel="noopener noreferrer"
              >
                {ref.name}
              </Link>{' '}
              <ExternalLink size={12} className="inline align-baseline text-[var(--color-neutral-500)]" />
              <span className="ml-2 text-xs font-mono text-[var(--color-neutral-500)]">{ref.path}</span>
            </li>
          ))}
        </ul>
      </Section>

      <footer className="mt-16 border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-800)] pt-6 text-xs text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
        <p>
          <strong>Manifest date:</strong> {MANIFEST_DATE} (v7.8.5+S sweep). Updated by hand when
          any SKILL.md <code className="font-mono">last_updated:</code> changes.
        </p>
        <p className="mt-2">
          <strong>Dynamic data plan:</strong> follow-up PR will extend{' '}
          <code className="font-mono">scripts/sync-from-fittracker2.ts</code> to mirror{' '}
          <code className="font-mono">.claude/skills/{'{name}'}/SKILL.md</code> into{' '}
          <code className="font-mono">src/data/skills/</code>, then replace the static manifest
          above with a YAML-frontmatter loader. Usage tracing (which skills fired per feature)
          requires aggregating <code className="font-mono">_session-*.events.jsonl</code> — also
          deferred.
        </p>
      </footer>
    </article>
  );
}
