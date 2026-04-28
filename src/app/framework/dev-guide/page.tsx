import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Metadata } from 'next';
import Link from 'next/link';
import { compileMDX } from 'next-mdx-remote/rsc';
import { useMDXComponents } from '@/mdx-components';

export const metadata: Metadata = {
  title: 'PM Framework — Developer Guide (v1.0 → v7.7) — fitme-story',
  description:
    'Technical, dev-only guide to the PM framework: 4 enforcement layers, state.json schema, phase lifecycle, dispatch, cache, measurement protocol, 13 integrity check codes + 1 advisory, 3 operational walkthroughs, and the compressed v1.0 → v7.7 timeline. Mirrors docs/architecture/dev-guide-v1-to-v7-7.md.',
};

const UPSTREAM_URL =
  'https://github.com/Regevba/FitTracker2/blob/main/docs/architecture/dev-guide-v1-to-v7-7.md';
const TRUST_AUDIT_URL = '/trust/audits/2026-04-21-gemini';
const CASE_STUDY_URL = '/case-studies/framework-v7-7-validity-closure';
const PRIOR_CASE_STUDY_URL = '/case-studies/mechanical-enforcement-v7-6';

export default async function DevGuidePage() {
  const filePath = path.resolve('content/framework/dev-guide.md');
  const raw = await readFile(filePath, 'utf8');
  const components = useMDXComponents({});
  const { content } = await compileMDX({
    source: raw,
    components,
    options: { parseFrontmatter: false },
  });

  return (
    <article className="max-w-[var(--measure-wide)] mx-auto px-6 py-16">
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
          PM Framework — Developer Guide (v1.0 → v7.7)
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
            <dd>~745 lines, 16 sections</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold">Last updated:</dt>
            <dd>2026-04-27 at v7.7 ship</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold">Canonical source:</dt>
            <dd>
              <a className="underline" href={UPSTREAM_URL}>
                docs/architecture/dev-guide-v1-to-v7-7.md
              </a>
            </dd>
          </div>
        </dl>

        <p className="mt-6 text-sm">
          Companion surfaces:{' '}
          <Link className="underline" href={CASE_STUDY_URL}>
            v7.7 case study
          </Link>{' '}
          (current — Validity Closure synthesis),{' '}
          <Link className="underline" href={PRIOR_CASE_STUDY_URL}>
            v7.6 case study
          </Link>{' '}
          (predecessor — Mechanical Enforcement), and{' '}
          <Link className="underline" href={TRUST_AUDIT_URL}>
            Gemini audit on /trust
          </Link>{' '}
          (verbatim audit + appended response).
        </p>
      </header>

      <div className="prose prose-lg dark:prose-invert max-w-[var(--measure-body)]">
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
