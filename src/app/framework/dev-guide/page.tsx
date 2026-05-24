import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import { useMDXComponents } from '@/mdx-components';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'PM Framework — Developer Guide (v1.0 → v7.9)',
  description:
    'Technical, dev-only guide to the PM framework: 4 enforcement layers, state.json schema (incl. v7.8.3 cross-repo state_owner enum), phase lifecycle, dispatch, cache, measurement protocol, 37 mechanical gates + 5 advisories, v7.8 bridge mechanisms (A–F), v7.8.3 cross-repo state-sync release umbrella (V2 enforced + V9 logs + D-3 unified PR cite cache + D-1 reverse-sync GH Action), v7.8.4 pre-v7.9 telemetry calibration (PR_CACHE_STALE auto-refresh + TIER_TAG heuristic narrowing), v7.8.5 observability layer (Observed Patterns Catalog of 23 gate patterns + 9 workflow patterns + W9 branch-drift real-time alert via PostToolUse:Bash hook), v7.8.6 cadence batch (make integrity-diff + make preflight unified entry point + weekly gate-coverage zero-drift scan + per-dimension trend nudge + W1 ssh-agent SessionStart preflight + weekly dependency audit + daily stale-branch/PR-babysit), v7.9 promotion release (single-flag flip at scripts/check-state-schema.py:132 promotes 3 v7.8.1 advisory gates to enforced — BRANCH_ISOLATION_VIOLATION Mode B + Mode C + FEATURE_CLOSURE_COMPLETENESS — after 14d Mechanism A calibration; Phase E validation soak 2026-05-21 → 2026-06-04; first real-world gate fire caught + resolved same-session), 3 operational walkthroughs, and the compressed v1.0 → v7.9 timeline.',
  slug: '/framework/dev-guide',
  type: 'article',
});

const UPSTREAM_URL =
  'https://github.com/Regevba/FitTracker2/blob/main/docs/architecture/dev-guide-v1-to-v7-7.md';
const LIFECYCLE_CATALOG_URL =
  'https://github.com/Regevba/FitTracker2/blob/main/docs/architecture/feature-lifecycle-event-catalog.md';
const TRUST_AUDIT_URL = '/trust/audits/2026-04-21-gemini';
const CASE_STUDY_URL = '/case-studies/framework-v7-9-promotion';
const PRIOR_CASE_STUDY_URL = '/case-studies/framework-v7-7-validity-closure';

export default async function DevGuidePage() {
  const filePath = path.resolve('content/framework/dev-guide.md');
  const raw = await readFile(filePath, 'utf8');
  const components = useMDXComponents({});
  const { content } = await compileMDX({
    source: raw,
    components,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        // Audit T17 P-MDX-CODE (2026-05-08): syntax highlighting + copy
        // button overlay for code blocks. Audit CS-007 (2026-05-08):
        // every heading becomes a deep-link target. Same plugin set as
        // the case-study slug page.
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: 'wrap',
              properties: {
                className: ['heading-anchor'],
                ariaLabel: 'Permalink to this section',
              },
            },
          ],
          [
            rehypePrettyCode,
            {
              theme: { light: 'github-light', dark: 'github-dark' },
              keepBackground: false,
            },
          ],
        ],
      },
    },
  });

  return (
    <article className="max-w-[min(110ch,calc(100vw-3rem))] mx-auto px-6 py-16">
      <nav className="mb-8 text-sm">
        <Link href="/framework" className="underline">
          ← Back to /framework
        </Link>
      </nav>

      <header className="mb-10">
        <p className="text-sm uppercase tracking-wide text-[var(--color-neutral-500)]">
          Developer guide
        </p>
        <h1 className="mt-2 font-serif text-[length:var(--text-display-lg)]">
          PM Framework — Developer Guide (v1.0 → v7.9)
        </h1>
        <p className="mt-4 text-xl text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          Technical reference for developers onboarding to the framework. Not the
          marketing narrative; the wiring.
        </p>

        <div className="mt-6 rounded border border-[var(--color-neutral-300)] bg-[var(--color-neutral-50)] p-4 text-sm dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-900)]">
          <p>
            <strong>Why this guide is here:</strong> the 2026-04-21 Google Gemini 2.5
            Pro independent audit asked the framework to make its workings legible to
            external reviewers. v7.5 + v7.6 + v7.7 shipped the policy, mechanical, and
            validity-closure responses; this guide documents <em>how</em> the framework actually
            works, end to end, so an external operator (per Tier 3.3, GitHub{' '}
            <a
              className="underline"
              href="https://github.com/Regevba/FitTracker2/issues/142"
            >
              issue #142
            </a>
            ) can replicate it on an unrelated product.
          </p>
        </div>

        <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="font-semibold">Audience:</dt>
            <dd>Developers (not PMs, designers, HR, academic readers)</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold">Length:</dt>
            <dd>~830 lines, 16 sections (incl. v7.8 §2.4 mechanism inventory + v7.8.1 gates in §10.1 + v7.9 §2.4.1 promoted sub-section)</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold">Last updated:</dt>
            <dd>2026-05-21 at v7.9 promotion ship — 3 advisory gates → enforced (Phase E live 2026-05-21 → 2026-06-04)</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold">Canonical source:</dt>
            <dd>
              <a className="underline" href={UPSTREAM_URL}>
                docs/architecture/dev-guide-v1-to-v7-7.md
              </a>{' '}
              <span className="text-[var(--color-neutral-500)]">
                (filename retained for ref-stability; content tracks v7.9)
              </span>
            </dd>
          </div>
        </dl>

        <p className="mt-6 text-sm">
          Companion surfaces:{' '}
          <a className="underline" href={LIFECYCLE_CATALOG_URL}>
            Feature Lifecycle Event Catalog
          </a>{' '}
          (the event/log/gate catalog with mermaid flow diagrams — 12 sections, paired with this guide),{' '}
          <Link className="underline" href={CASE_STUDY_URL}>
            v7.9 case study
          </Link>{' '}
          (Advisory → Enforced Promotion: single-flag flip ships 3 gates after 14d calibration),{' '}
          <Link className="underline" href={PRIOR_CASE_STUDY_URL}>
            v7.7 case study
          </Link>{' '}
          (Validity Closure synthesis), and{' '}
          <Link className="underline" href={TRUST_AUDIT_URL}>
            Gemini audit on /trust
          </Link>{' '}
          (verbatim audit + appended response).
        </p>
      </header>

      <div className="prose prose-lg dark:prose-invert max-w-none dev-guide-prose">
        {content}
      </div>

      <hr className="my-12" />

      <p className="text-sm text-[var(--color-neutral-500)]">
        This page is a vendored mirror of{' '}
        <a className="underline" href={UPSTREAM_URL}>
          docs/architecture/dev-guide-v1-to-v7-7.md
        </a>{' '}
        on the FitTracker2 repository. The canonical source updates whenever the
        framework's structural shape changes; this page is regenerated on the next
        site deploy. If a code-vs-doc drift appears, the GitHub source is
        authoritative.
      </p>
    </article>
  );
}
