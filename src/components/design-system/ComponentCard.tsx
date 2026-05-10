import * as React from 'react';
import {
  type ComponentManifestEntry,
  buildFigmaNodeUrl,
  buildGitHubSourceUrl,
} from '@/lib/design-system';
import { StatusBadge } from './StatusBadge';
import { TrackedFigmaLink } from './TrackedFigmaLink';

type Props = {
  entry: ComponentManifestEntry;
  /** Optional rendered preview node — if provided, displayed in Light + Dark side-by-side. */
  preview?: React.ReactNode;
};

const DARK_MODE_LABEL: Record<ComponentManifestEntry['darkModeStatus'], string> = {
  Designed: 'Dark mode: designed',
  AutoDerived: 'Dark mode: auto-derived from tokens',
  NotApplicable: 'Dark mode: not applicable',
  TODO: 'Dark mode: TODO',
};

const DARK_MODE_BADGE_CLASS: Record<ComponentManifestEntry['darkModeStatus'], string> = {
  Designed: 'text-emerald-700 dark:text-emerald-300',
  AutoDerived: 'text-[var(--color-neutral-500)]',
  NotApplicable: 'text-[var(--color-neutral-500)]',
  TODO: 'text-[var(--color-brand-coral)]',
};

export function ComponentCard({ entry, preview }: Props) {
  const githubUrl = buildGitHubSourceUrl(entry.githubPath);
  const primaryFigmaNode = entry.figmaNodeIds?.[0];
  const figmaUrl = primaryFigmaNode ? buildFigmaNodeUrl(primaryFigmaNode.nodeId) : null;

  return (
    <article
      id={`component-${entry.name}`}
      className="rounded-[20px] border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-white/70 dark:bg-[var(--color-neutral-900)] p-6 scroll-mt-24"
      data-component-name={entry.name}
      data-component-category={entry.category}
      data-component-status={entry.status}
    >
      <header className="flex flex-wrap items-start gap-3 justify-between mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif text-lg font-semibold">{entry.name}</h3>
            <StatusBadge status={entry.status} />
          </div>
          <p className="mt-1 text-sm font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] max-w-[var(--measure-body)]">
            {entry.purpose}
          </p>
          <p className="mt-1 text-xs font-sans text-[var(--color-neutral-500)]">
            Where used: {entry.whereUsed}
          </p>
        </div>
        <span
          className={`text-[11px] font-sans font-semibold ${DARK_MODE_BADGE_CLASS[entry.darkModeStatus]}`}
          title={DARK_MODE_LABEL[entry.darkModeStatus]}
        >
          {entry.darkModeStatus === 'Designed' && '◐ '}
          {entry.darkModeStatus === 'AutoDerived' && '◑ '}
          {entry.darkModeStatus === 'TODO' && '✗ '}
          {entry.darkModeStatus === 'NotApplicable' && '— '}
          {entry.darkModeStatus}
        </span>
      </header>

      {preview ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <figure className="bg-[var(--color-neutral-50)] rounded-md p-4 border border-[var(--color-neutral-200)]">
            <div className="not-dark">
              {preview}
            </div>
            <figcaption className="text-[10px] font-mono text-[var(--color-neutral-500)] mt-2 text-right">
              Light
            </figcaption>
          </figure>
          <figure className="bg-[var(--color-neutral-900)] rounded-md p-4 border border-[var(--color-neutral-700)]">
            <div className="dark">
              {preview}
            </div>
            <figcaption className="text-[10px] font-mono text-[var(--color-neutral-300)] mt-2 text-right">
              Dark
            </figcaption>
          </figure>
        </div>
      ) : (
        <div className="rounded-md bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] p-4 mb-4 text-xs font-sans text-[var(--color-neutral-500)] italic">
          Preview pending — component live-render is added in Bucket C as the
          mapping work completes for this component family.
        </div>
      )}

      <footer className="flex flex-wrap items-center gap-3 text-xs font-sans">
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[var(--color-brand-indigo)] hover:underline"
        >
          GitHub source ↗
        </a>
        {figmaUrl && primaryFigmaNode ? (
          <TrackedFigmaLink
            componentName={entry.name}
            figmaNodeId={primaryFigmaNode.nodeId}
            figmaUrl={figmaUrl}
            variantCount={entry.figmaNodeIds?.length}
          />
        ) : (
          <span className="text-[var(--color-neutral-500)]">
            Figma node — not yet captured (Bucket C)
          </span>
        )}
        {entry.hasFigmaConnect ? (
          <span className="inline-flex items-center gap-1 text-[var(--color-neutral-500)]">
            ✓ Code Connect mapped
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[var(--color-neutral-500)]">
            — Code Connect mapping pending
          </span>
        )}
      </footer>
    </article>
  );
}
