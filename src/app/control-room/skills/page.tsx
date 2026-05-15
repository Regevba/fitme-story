/**
 * /control-room/skills — Skills Activity panel (P1.2)
 *
 * Closes P1.2 from FitTracker2 `docs/skills/skills-review-2026-05-13.md` §5.
 *
 * The 12 project-owned skills under FT2's `.claude/skills/*` are surfaced via
 * a runtime manifest produced by `scripts/sync-from-fittracker2.ts` at
 * prebuild time. The sync script parses every `SKILL.md` YAML frontmatter
 * (name, description, last_updated, framework_version, status, adapters_used)
 * and writes `src/data/skills/manifest.json`, which is loaded here via
 * `loadSkillsManifest()` from `@/lib/control-room/skills-manifest`.
 *
 * Manifest freshness ⇄ prebuild freshness: the page's `Manifest date` footer
 * shows `manifest.syncedAt`. If FT2 isn't on disk at build time, the sync
 * falls back to the committed snapshot under src/data/.
 *
 * Editorial `PHASE_MAPPING` (which lifecycle phase a skill owns) stays
 * hand-curated in this file — it's not part of SKILL.md frontmatter.
 *
 * Still deferred to a future follow-up (NOT in this PR):
 *   - `_session-*.events.jsonl` aggregator for per-feature usage tracing
 *     (the `/dev skills trace {feature}` empirical data surface)
 *   - state.json::cache_hits[] aggregator for the same
 *
 * Gated by proxy.ts basic-auth on /control-room/*.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import { loadSkillsManifest, type SkillRow as ManifestSkillRow, type SkillStatus } from '@/lib/control-room/skills-manifest';

export const metadata: Metadata = {
  title: 'Skills Activity — Control room',
  description:
    'Inventory + last-updated + adapter usage for the 12 project-owned skills under .claude/skills/*. Dynamically synced at prebuild from FT2 SKILL.md frontmatter (P1.2 runtime sync shipped via PR #111). Current snapshot reflects v7.8.6 (all 10 skills carry the preflight-cache pointer in their `## Shared Data` section per FT2 PR #363).',
  robots: { index: false, follow: false },
};

// ────────────────────────────────────────────────────────────────────────────
// Skill manifest — runtime-synced from FT2 at prebuild time (P1.2 follow-up).
//
// `scripts/sync-from-fittracker2.ts` parses every FT2 `.claude/skills/{name}/
// SKILL.md` YAML frontmatter and writes `src/data/skills/manifest.json`.
// `loadSkillsManifest()` reads that JSON at server-component-render time
// (build time for static pages).
//
// PHASE_MAPPING below is editorial (which lifecycle phase the skill owns)
// — not part of SKILL.md frontmatter, so it stays hand-curated here.
// If a new skill ships without a phase entry, the page shows "—" until
// this map is extended.
// ────────────────────────────────────────────────────────────────────────────

interface PageSkillRow extends ManifestSkillRow {
  phase: string;
}

const PHASE_MAPPING: Record<string, string> = {
  'pm-workflow': 'All phases (dispatch)',
  ux: 'Phase 0 (v2 audit) + Phase 3 + Phase 6',
  design: 'Phase 3 + Phase 6',
  cx: 'Phase 8 (post-launch) + Phase 9 (learn)',
  analytics: 'Phase 1 (PRD) + Phase 4 (implement) + Phase 8 (post-launch)',
  marketing: 'Phase 8 (post-launch) + Phase 9 (learn)',
  ops: 'All phases (infra monitoring)',
  research: 'Phase 0 (Research & Discovery)',
  release: 'Phase 7 (merge) + Phase 8 (docs)',
  qa: 'Phase 5 (test) + Phase 6 (review)',
  dev: 'Phase 4 (implement) + Phase 5 (test) + Phase 6 (review) + skill-of-skills audit',
  'brainstorm-pm': 'Phase 0 (default new-feature entry point)',
};

const MANIFEST = loadSkillsManifest();
const MANIFEST_DATE = MANIFEST.syncedAt.slice(0, 10) || '(no sync)';

const SKILLS: readonly PageSkillRow[] = MANIFEST.skills.map((s) => ({
  ...s,
  phase: PHASE_MAPPING[s.name] ?? '—',
}));


const FT2_GH = 'https://github.com/Regevba/FitTracker2';

const STATUS_BADGE_STYLES: Record<SkillStatus | 'unknown', string> = {
  active: 'bg-[var(--color-success-bg)] text-[var(--color-success-fg)]',
  stable: 'bg-[var(--color-info-bg,#dbeafe)] text-[var(--color-info-fg,#1e40af)]',
  planned: 'bg-[var(--color-warn-bg)] text-[var(--color-warn-fg)]',
  deprecated: 'bg-[var(--color-neutral-200)] text-[var(--color-neutral-700)]',
  unknown: 'bg-[var(--color-neutral-200)] text-[var(--color-neutral-700)]',
};

function statusKey(s: SkillStatus | ''): SkillStatus | 'unknown' {
  return s === '' ? 'unknown' : s;
}

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
          queue. Manifest synced from FT2 SKILL.md frontmatter at{' '}
          <strong>{MANIFEST_DATE}</strong> via{' '}
          <code className="font-mono text-xs">scripts/sync-from-fittracker2.ts</code>;
          per-feature usage tracing (cache_hits + session ledgers) still
          deferred to a future sync extension.
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
        subtitle="Dynamic frontmatter sync at prebuild (PR #111). v7.8.6: all 10 skills carry the preflight-cache pointer in their Shared Data section. Click a skill to open its SKILL.md on GitHub."
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
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-mono ${STATUS_BADGE_STYLES[statusKey(s.status)]}`}>
                      {s.status || '—'}
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
          <strong>Manifest date:</strong> {MANIFEST_DATE}. Auto-regenerated at prebuild time
          by <code className="font-mono">scripts/sync-from-fittracker2.ts</code> from FT2's
          live <code className="font-mono">.claude/skills/{'{name}'}/SKILL.md</code> frontmatter.
        </p>
        <p className="mt-2">
          <strong>Dynamic data plan:</strong> follow-up PR will extend{' '}
          <code className="font-mono">scripts/sync-from-fittracker2.ts</code> to mirror{' '}
          <code className="font-mono">.claude/skills/{'{name}'}/SKILL.md</code> into{' '}
          <code className="font-mono">src/data/skills/manifest.json</code> at prebuild time
          (shipped 2026-05-15). Usage tracing (which skills fired per feature) still
          requires aggregating <code className="font-mono">_session-*.events.jsonl</code> —
          deferred.
        </p>
      </footer>
    </article>
  );
}
