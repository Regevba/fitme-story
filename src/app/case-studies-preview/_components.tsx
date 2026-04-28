// Reusable preview components shared between Alternative A and Alternative B.
// These mock what the production MDX components would look like once an
// alternative is picked. Throwaway for now — keeps the preview pages clean.

import { CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';
import type { ReactNode } from 'react';

export interface KeyNumber {
  label: string;
  value: string;
  tier: 'T1' | 'T2' | 'T3';
}

export interface DeferredItem {
  title: string;
  ledger: string;
  reason: string;
}

// Render a string with `inline-code` markers safely as JSX.
function renderInlineMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const matches = Array.from(text.matchAll(/`([^`]+)`/g));
  let lastIndex = 0;
  let key = 0;
  for (const m of matches) {
    const start = m.index ?? 0;
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }
    parts.push(
      <code
        key={`code-${key++}`}
        className="text-[0.85em] px-1 py-0.5 rounded bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-900)]"
      >
        {m[1]}
      </code>,
    );
    lastIndex = start + m[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

// =============================================================================
// SummaryCard — header card both alternatives lead with.
// =============================================================================
export function SummaryCard({
  title,
  version,
  shipDate,
  workType,
  trigger,
  tldr,
  showDisclosuresInline,
  honestDisclosures,
}: {
  title: string;
  version: string;
  shipDate: string;
  workType: string;
  trigger: string;
  tldr: string;
  showDisclosuresInline: boolean;
  honestDisclosures: string[];
}) {
  return (
    <div className="rounded-lg border border-[var(--color-neutral-200)] bg-white dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-800)] p-6 sm:p-8 shadow-sm">
      <div className="font-sans text-xs uppercase tracking-wider text-[var(--color-brand-indigo)] mb-2">
        Summary card · 60-second read
      </div>
      <h1 className="font-serif text-[length:var(--text-display-md)] leading-tight">
        {title}
      </h1>
      <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 font-sans text-sm">
        <div>
          <dt className="text-[var(--color-neutral-500)] text-xs uppercase tracking-wide">Version</dt>
          <dd className="font-medium">{version}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-neutral-500)] text-xs uppercase tracking-wide">Ship date</dt>
          <dd className="font-medium">{shipDate}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-neutral-500)] text-xs uppercase tracking-wide">Work type</dt>
          <dd className="font-medium">{workType}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-neutral-500)] text-xs uppercase tracking-wide">Trigger</dt>
          <dd className="font-medium">{trigger}</dd>
        </div>
      </dl>
      <p className="mt-5 font-serif text-lg leading-relaxed text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
        {tldr}
      </p>
      {showDisclosuresInline && honestDisclosures.length > 0 ? (
        <div className="mt-5 pt-5 border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
          <div className="font-sans text-xs uppercase tracking-wider text-[var(--color-brand-coral)] mb-2 flex items-center gap-1.5">
            <AlertTriangle width={14} height={14} strokeWidth={2} />
            Honest disclosures
          </div>
          <ul className="space-y-1.5 text-sm font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
            {honestDisclosures.map((d, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--color-brand-coral)] shrink-0">•</span>
                <span>{renderInlineMarkdown(d)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

// =============================================================================
// KeyNumbersStrip — three pills inline (Alternative A).
// =============================================================================
export function KeyNumbersStrip({ numbers }: { numbers: KeyNumber[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {numbers.map((n, i) => (
        <div
          key={i}
          className="rounded-md border border-[var(--color-neutral-200)] bg-white dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-800)] p-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-[10px] uppercase tracking-wider text-[var(--color-neutral-500)]">
              {n.label}
            </span>
            <TierBadge tier={n.tier} />
          </div>
          <div className="font-serif text-2xl leading-tight text-[var(--color-brand-indigo)]">
            {n.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// KeyNumbersPanel — bigger card grid (Alternative B).
// =============================================================================
export function KeyNumbersPanel({ numbers }: { numbers: KeyNumber[] }) {
  return (
    <section>
      <SectionHeading eyebrow="Key numbers" accent="indigo" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {numbers.map((n, i) => (
          <div
            key={i}
            className="rounded-lg border border-[var(--color-neutral-200)] bg-white dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-800)] p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-sans text-xs text-[var(--color-neutral-500)]">
                {n.label}
              </span>
              <TierBadge tier={n.tier} />
            </div>
            <div className="font-serif text-3xl leading-tight text-[var(--color-brand-indigo)]">
              {n.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// =============================================================================
// HonestDisclosuresPanel — Alternative B's standalone panel.
// =============================================================================
export function HonestDisclosuresPanel({ disclosures }: { disclosures: string[] }) {
  return (
    <section>
      <SectionHeading eyebrow="Honest disclosures" accent="coral" />
      <ul className="space-y-3">
        {disclosures.map((d, i) => (
          <li
            key={i}
            className="flex gap-3 rounded-md border border-[var(--color-brand-coral)]/30 bg-[var(--color-brand-coral)]/5 p-4"
          >
            <AlertTriangle
              className="shrink-0 mt-0.5 text-[var(--color-brand-coral)]"
              width={18}
              height={18}
              strokeWidth={2}
            />
            <span className="font-sans text-sm leading-relaxed">
              {renderInlineMarkdown(d)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// =============================================================================
// KillCriterionBanner — used by A. Single line indicating fired/not.
// =============================================================================
export function KillCriterionBanner({
  threshold,
  fired,
  evidence,
}: {
  threshold: string;
  fired: boolean;
  evidence: string;
}) {
  const Icon = fired ? XCircle : CheckCircle2;
  const color = fired
    ? 'text-[var(--color-brand-coral)] border-[var(--color-brand-coral)]/30 bg-[var(--color-brand-coral)]/5'
    : 'text-emerald-700 dark:text-emerald-400 border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/30';
  return (
    <div className={`rounded-md border p-4 flex items-start gap-3 ${color}`}>
      <Icon width={20} height={20} strokeWidth={2} className="shrink-0 mt-0.5" />
      <div>
        <div className="font-sans text-xs uppercase tracking-wider mb-1">
          Kill criterion · {fired ? 'FIRED' : 'not fired'}
        </div>
        <div className="font-sans text-sm leading-relaxed">{threshold}</div>
        <div className="font-sans text-xs mt-2 opacity-80">{evidence}</div>
      </div>
    </div>
  );
}

// =============================================================================
// KillCriteriaPanel — Alternative B. Bigger surface; same content.
// =============================================================================
export function KillCriteriaPanel({
  threshold,
  fired,
  evidence,
}: {
  threshold: string;
  fired: boolean;
  evidence: string;
}) {
  const Icon = fired ? XCircle : CheckCircle2;
  const colorClasses = fired
    ? 'text-[var(--color-brand-coral)] border-[var(--color-brand-coral)]/30 bg-[var(--color-brand-coral)]/5'
    : 'text-emerald-700 dark:text-emerald-400 border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/30';
  return (
    <section>
      <SectionHeading eyebrow="Kill criterion" accent={fired ? 'coral' : 'emerald'} />
      <div className={`rounded-lg border p-5 flex items-start gap-4 ${colorClasses}`}>
        <Icon width={28} height={28} strokeWidth={1.75} className="shrink-0 mt-0.5" />
        <div>
          <div className="font-sans text-xs uppercase tracking-wider mb-2 font-semibold">
            {fired ? 'FIRED' : 'Not fired'}
          </div>
          <p className="font-serif text-base leading-relaxed">{threshold}</p>
          <p className="font-sans text-sm mt-3 opacity-80">{evidence}</p>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// DeferredItemsList — used by A (compact strip).
// =============================================================================
export function DeferredItemsList({ items }: { items: DeferredItem[] }) {
  return (
    <div className="rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] divide-y divide-[var(--color-neutral-200)] dark:divide-[var(--color-neutral-700)]">
      <div className="px-4 py-2 bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-900)] font-sans text-xs uppercase tracking-wider text-[var(--color-neutral-500)] flex items-center gap-1.5">
        <Clock width={14} height={14} strokeWidth={2} />
        Deferred items
      </div>
      {items.map((item, i) => (
        <div key={i} className="px-4 py-3 flex flex-wrap gap-x-4 gap-y-1 items-baseline">
          <span className="font-sans text-sm font-semibold">{item.title}</span>
          <span className="font-sans text-xs text-[var(--color-neutral-500)]">
            ledger: <code className="text-[var(--color-brand-indigo)]">{item.ledger}</code>
          </span>
          <span className="font-sans text-xs text-[var(--color-neutral-500)] basis-full sm:basis-auto">
            {item.reason}
          </span>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// DeferredItemsPanel — Alternative B (card grid).
// =============================================================================
export function DeferredItemsPanel({ items }: { items: DeferredItem[] }) {
  return (
    <section>
      <SectionHeading eyebrow="Deferred items" accent="amber" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-white dark:bg-[var(--color-neutral-800)] p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock
                width={16}
                height={16}
                strokeWidth={2}
                className="text-amber-600 dark:text-amber-400"
              />
              <span className="font-sans text-sm font-semibold">{item.title}</span>
            </div>
            <div className="font-sans text-xs text-[var(--color-neutral-500)] mb-1">
              ledger:{' '}
              <code className="text-[var(--color-brand-indigo)]">{item.ledger}</code>
            </div>
            <p className="font-sans text-xs text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] leading-relaxed">
              {item.reason}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// =============================================================================
// SectionHeading — visual rhythm divider.
// =============================================================================
function SectionHeading({
  eyebrow,
  accent,
}: {
  eyebrow: string;
  accent: 'indigo' | 'coral' | 'emerald' | 'amber';
}) {
  const colorMap = {
    indigo: 'text-[var(--color-brand-indigo)]',
    coral: 'text-[var(--color-brand-coral)]',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
  };
  return (
    <div className={`font-sans text-xs uppercase tracking-wider mb-3 ${colorMap[accent]}`}>
      {eyebrow}
    </div>
  );
}

// =============================================================================
// TierBadge — T1/T2/T3 data-quality marker.
// =============================================================================
function TierBadge({ tier }: { tier: 'T1' | 'T2' | 'T3' }) {
  const styles =
    tier === 'T1'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
      : tier === 'T2'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
        : 'bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-300';
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${styles}`}
    >
      {tier}
    </span>
  );
}

// =============================================================================
// PreviewBanner — shown at top of every preview page so it's clear this is a demo.
// =============================================================================
export function PreviewBanner({ alt }: { alt: 'A' | 'B' }) {
  return (
    <div className="bg-[var(--color-brand-indigo)] text-white px-4 py-2 text-center font-sans text-xs">
      <strong>PREVIEW</strong> — Alternative {alt} of the case-study presentation
      refactor. Source case study: Data Integrity Framework v7.5.{' '}
      <a
        href="/case-studies-preview"
        className="underline underline-offset-2 hover:no-underline"
      >
        ← back to alternatives
      </a>
    </div>
  );
}

// =============================================================================
// SwitchAlternativeBar — links between A and B from inside each preview.
// =============================================================================
export function SwitchAlternativeBar({ current }: { current: 'A' | 'B' }) {
  const other = current === 'A' ? 'B' : 'A';
  return (
    <div className="mt-12 pt-8 border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] text-center">
      <p className="font-sans text-sm text-[var(--color-neutral-500)] mb-3">
        Compare alternatives
      </p>
      <a
        href={`/case-studies-preview/alternative-${other.toLowerCase()}`}
        className="inline-flex items-center gap-2 rounded-md border border-[var(--color-brand-indigo)] text-[var(--color-brand-indigo)] px-4 py-2 font-sans text-sm font-medium hover:bg-[var(--color-brand-indigo)] hover:text-white transition-colors"
      >
        View Alternative {other} →
      </a>
    </div>
  );
}

export function SectionDivider({ children }: { children?: ReactNode }) {
  return (
    <div className="my-10 flex items-center gap-4">
      <div className="h-px bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)] flex-1" />
      {children ? (
        <span className="font-sans text-xs uppercase tracking-wider text-[var(--color-neutral-500)]">
          {children}
        </span>
      ) : null}
      <div className="h-px bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)] flex-1" />
    </div>
  );
}
