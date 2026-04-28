// Alternative A locked-design chrome (2026-04-28).
//
// Rendered above the case-study narrative on Light/Standard/Flagship templates.
// Reads from validated frontmatter (see lib/content-schema.ts). Each component
// renders only when its data is present — partial frontmatter degrades
// gracefully rather than blowing up.
//
// Order on every case study page:
//   1. SummaryCard      — TL;DR + 5 fields + 3 inline honest disclosures
//   2. DataKey          — collapsed "How to read this" panel
//   3. <visual aid>     — REQUIRED, picked per case (visual_aid: in frontmatter)
//   4. KillCriterionBanner — emerald (not fired) / coral (fired)
//   5. DeferredItemsList — title · ledger · reason per item
// Visual catalog: docs/design-system/case-study-visual-aid-catalog.md (FitTracker2).

import { CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Frontmatter, KeyNumber } from '@/lib/content-schema';

// ---------------------------------------------------------------------------
// Inline-code-safe markdown renderer for short strings (e.g. disclosures)
// ---------------------------------------------------------------------------
function renderInlineMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const matches = Array.from(text.matchAll(/`([^`]+)`/g));
  let lastIndex = 0;
  let key = 0;
  for (const m of matches) {
    const start = m.index ?? 0;
    if (start > lastIndex) parts.push(text.slice(lastIndex, start));
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
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

// ---------------------------------------------------------------------------
// SummaryCard
// ---------------------------------------------------------------------------
export function SummaryCard({ fm }: { fm: Frontmatter }) {
  const version = fm.timeline_position ? `v${fm.timeline_position.version}` : null;
  const tldr = fm.tldr;
  if (!tldr && !fm.honest_disclosures) return null;
  return (
    <div className="rounded-lg border border-[var(--color-neutral-200)] bg-white dark:border-[var(--color-neutral-700)] dark:bg-[var(--color-neutral-800)] p-6 sm:p-8 shadow-sm">
      <div className="font-sans text-xs uppercase tracking-wider text-[var(--color-brand-indigo)] mb-2">
        Summary card · 60-second read
      </div>
      <h1 className="font-serif text-[length:var(--text-display-md)] leading-tight">
        {fm.title}
      </h1>
      <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 font-sans text-sm">
        {version ? (
          <div>
            <dt className="text-[var(--color-neutral-500)] text-xs uppercase tracking-wide">
              Version
            </dt>
            <dd className="font-medium">{version}</dd>
          </div>
        ) : null}
        {fm.date ? (
          <div>
            <dt className="text-[var(--color-neutral-500)] text-xs uppercase tracking-wide">
              Date
            </dt>
            <dd className="font-medium">{fm.date}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-[var(--color-neutral-500)] text-xs uppercase tracking-wide">Tier</dt>
          <dd className="font-medium capitalize">{fm.tier}</dd>
        </div>
      </dl>
      {tldr ? (
        <p className="mt-5 font-serif text-lg leading-relaxed text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
          {tldr}
        </p>
      ) : null}
      {fm.honest_disclosures && fm.honest_disclosures.length > 0 ? (
        <div className="mt-5 pt-5 border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
          <div className="font-sans text-xs uppercase tracking-wider text-[var(--color-brand-coral)] mb-2 flex items-center gap-1.5">
            <AlertTriangle width={14} height={14} strokeWidth={2} />
            Honest disclosures
          </div>
          <ul className="space-y-1.5 text-sm font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
            {fm.honest_disclosures.map((d, i) => (
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

// ---------------------------------------------------------------------------
// DataKey — collapsed "How to read this case study" panel
// ---------------------------------------------------------------------------
export function DataKey() {
  return (
    <details className="rounded-md border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-900)] group">
      <summary className="cursor-pointer list-none px-4 py-3 min-h-11 flex items-center justify-between font-sans text-xs uppercase tracking-wider text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
        <span className="flex items-center gap-2">
          <span className="font-semibold">How to read this case study</span>
          <span className="text-[var(--color-neutral-500)] normal-case tracking-normal text-[11px]">
            T1/T2/T3 · ledger · kill criterion
          </span>
        </span>
        <span className="text-[var(--color-neutral-500)] group-open:rotate-180 transition-transform">
          ▾
        </span>
      </summary>
      <div className="px-4 pb-4 pt-2 border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 font-sans text-xs">
          <KeyEntry tier="T1" name="Instrumented">
            Numbers come from a machine-generated ledger or commit. Reproducible.
            Highest reader trust.
          </KeyEntry>
          <KeyEntry tier="T2" name="Declared">
            Numbers stated by a structured declaration (PRD, plan, frontmatter)
            but not directly measured.
          </KeyEntry>
          <KeyEntry tier="T3" name="Narrative">
            Estimates and observations from session memory. Useful for context;
            not citable as evidence.
          </KeyEntry>
          <KeyEntryLabel name="Ledger">
            Where to verify the claim — a file path, GitHub issue, or backlog
            entry. Anything labelled <code className="text-[0.85em] px-1 py-0.5 rounded bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-800)]">ledger:</code>{' '}
            is the audit trail.
          </KeyEntryLabel>
          <KeyEntryLabel name="Kill criterion">
            The pre-registered threshold under which this work would have been
            killed mid-flight. <strong>Not fired</strong> = work shipped without
            hitting the threshold.
          </KeyEntryLabel>
          <KeyEntryLabel name="Deferred">
            Items intentionally not closed in this version. Each cites the
            ledger that tracks remaining work.
          </KeyEntryLabel>
        </dl>
      </div>
    </details>
  );
}

function KeyEntry({
  tier,
  name,
  children,
}: {
  tier: 'T1' | 'T2' | 'T3';
  name: string;
  children: ReactNode;
}) {
  const styles =
    tier === 'T1'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
      : tier === 'T2'
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
        : 'bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-300';
  return (
    <div>
      <dt className="flex items-center gap-2 mb-1">
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${styles}`}
        >
          {tier}
        </span>
        <span className="font-semibold">{name}</span>
      </dt>
      <dd className="text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] leading-relaxed">
        {children}
      </dd>
    </div>
  );
}
function KeyEntryLabel({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div>
      <dt className="font-semibold mb-1">{name}</dt>
      <dd className="text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] leading-relaxed">
        {children}
      </dd>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KeyNumbersChart — fallback default visual aid
// ---------------------------------------------------------------------------
type ParsedNumber =
  | { kind: 'progress'; numerator: number; denominator: number; raw: string }
  | { kind: 'delta'; from: number; to: number; raw: string }
  | { kind: 'all-clear'; total: string; raw: string }
  | { kind: 'plain'; raw: string };

function parseKeyNumber(value: string): ParsedNumber {
  const progress = value.match(/^(\d+(?:\.\d+)?)\s+of\s+(\d+(?:\.\d+)?)/i);
  if (progress) {
    return {
      kind: 'progress',
      numerator: parseFloat(progress[1]),
      denominator: parseFloat(progress[2]),
      raw: value,
    };
  }
  const delta = value.match(/^(\d+(?:\.\d+)?)\s*(?:→|->)\s*(\d+(?:\.\d+)?)/);
  if (delta) {
    return {
      kind: 'delta',
      from: parseFloat(delta[1]),
      to: parseFloat(delta[2]),
      raw: value,
    };
  }
  const allClear = value.match(/^0\s+across\s+(.+)$/i);
  if (allClear) {
    return { kind: 'all-clear', total: allClear[1], raw: value };
  }
  return { kind: 'plain', raw: value };
}

function NumberVisual({ parsed }: { parsed: ParsedNumber }) {
  if (parsed.kind === 'progress') {
    const pct = Math.round((parsed.numerator / parsed.denominator) * 100);
    return (
      <div className="mt-2">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="font-serif text-2xl text-[var(--color-brand-indigo)]">
            {parsed.numerator}
          </span>
          <span className="font-sans text-xs text-[var(--color-neutral-500)]">
            of {parsed.denominator} · {pct}%
          </span>
        </div>
        <div
          className="h-1.5 rounded-full bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)] overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full bg-[var(--color-brand-indigo)]" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }
  if (parsed.kind === 'delta') {
    const up = parsed.to > parsed.from;
    const arrow = up ? '↑' : parsed.to < parsed.from ? '↓' : '→';
    const colorClass = up
      ? 'text-emerald-600 dark:text-emerald-400'
      : parsed.to < parsed.from
        ? 'text-[var(--color-brand-coral)]'
        : 'text-[var(--color-neutral-500)]';
    return (
      <div className="mt-2 flex items-center gap-3">
        <span className="font-serif text-xl text-[var(--color-neutral-500)] line-through decoration-1">
          {parsed.from}
        </span>
        <span className={`font-mono text-xl ${colorClass}`} aria-hidden="true">
          {arrow}
        </span>
        <span className="font-serif text-2xl text-[var(--color-brand-indigo)]">{parsed.to}</span>
      </div>
    );
  }
  if (parsed.kind === 'all-clear') {
    return (
      <div className="mt-2 flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 width={16} height={16} strokeWidth={2.25} />
        </span>
        <span className="font-serif text-xl text-[var(--color-brand-indigo)]">0</span>
        <span className="font-sans text-xs text-[var(--color-neutral-500)]">
          across {parsed.total}
        </span>
      </div>
    );
  }
  return (
    <div className="mt-2 font-serif text-2xl leading-tight text-[var(--color-brand-indigo)]">
      {parsed.raw}
    </div>
  );
}

export function KeyNumbersChart({ numbers }: { numbers: KeyNumber[] }) {
  return (
    <section
      aria-labelledby="visual-aid-heading"
      className="rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-white dark:bg-[var(--color-neutral-800)] p-5 sm:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          id="visual-aid-heading"
          className="font-sans text-xs uppercase tracking-wider text-[var(--color-brand-indigo)]"
        >
          Visual aid · key numbers at a glance
        </h2>
        <span className="font-sans text-[10px] text-[var(--color-neutral-500)] uppercase tracking-wider">
          Default · no specialised visual declared
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
        {numbers.map((n, i) => {
          const parsed = parseKeyNumber(n.value);
          return (
            <div key={i}>
              <div className="flex items-center gap-2">
                <span className="font-sans text-[11px] uppercase tracking-wider text-[var(--color-neutral-500)] flex-1 leading-snug">
                  {n.label}
                </span>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    n.tier === 'T1'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : n.tier === 'T2'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-300'
                  }`}
                >
                  {n.tier}
                </span>
              </div>
              <NumberVisual parsed={parsed} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// KillCriterionBanner
// ---------------------------------------------------------------------------
export function KillCriterionBanner({
  criteria,
  fired,
}: {
  criteria: string[];
  fired: boolean;
}) {
  if (!criteria || criteria.length === 0) return null;
  const Icon = fired ? XCircle : CheckCircle2;
  const color = fired
    ? 'text-[var(--color-brand-coral)] border-[var(--color-brand-coral)]/30 bg-[var(--color-brand-coral)]/5'
    : 'text-emerald-700 dark:text-emerald-400 border-emerald-600/30 bg-emerald-50 dark:bg-emerald-950/30';
  return (
    <div className={`rounded-md border p-4 flex items-start gap-3 ${color}`}>
      <Icon width={20} height={20} strokeWidth={2} className="shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="font-sans text-xs uppercase tracking-wider mb-1">
          Kill criterion · {fired ? 'FIRED' : 'not fired'}
        </div>
        <ul className="font-sans text-sm leading-relaxed space-y-1">
          {criteria.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DeferredItemsList
// ---------------------------------------------------------------------------
export interface DeferredItem {
  title: string;
  ledger: string;
  reason: string;
}

export function DeferredItemsList({ items }: { items: DeferredItem[] }) {
  if (!items || items.length === 0) return null;
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
