// Alternative A locked-design chrome (2026-04-28).
//
// Rendered above the case-study narrative on Light/Standard/Flagship templates.
// Reads from validated frontmatter (see lib/content-schema.ts). Each component
// renders only when its data is present — partial frontmatter degrades
// gracefully rather than blowing up.
//
// Story-first order on every case study page (2026-06-21 reorder, assembled in
// CaseStudyArticle.tsx):
//   header (badge · h1 · reading time · tldr lead)
//   → <visual aid> (at-a-glance) + TierLegend (compact T1/T2/T3 key)
//   → narrative body
//   → HonestDisclosures · KillCriterionBanner · DeferredItemsList (epilogue)
// Visual catalog: docs/design-system/case-study-visual-aid-catalog.md (FitTracker2).

import { CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';
import type { ReactNode } from 'react';
import type { KeyNumber } from '@/lib/content-schema';

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
// HonestDisclosures — credibility callout, rendered below the narrative
// (2026-06-21: extracted from the former SummaryCard; the tldr now leads the
// header and the version/date/tier strip lives in the template header).
// ---------------------------------------------------------------------------
export function HonestDisclosures({ items }: { items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="not-prose rounded-lg border border-[var(--color-brand-coral)]/30 bg-[var(--color-brand-coral)]/5 p-5 sm:p-6">
      <div className="font-sans text-xs uppercase tracking-wider text-[var(--color-brand-coral)] mb-3 flex items-center gap-1.5">
        <AlertTriangle width={14} height={14} strokeWidth={2} />
        Honest disclosures
      </div>
      <ul className="space-y-1.5 text-sm font-sans text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)]">
        {items.map((d, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-[var(--color-brand-coral)] shrink-0">•</span>
            <span>{renderInlineMarkdown(d)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TierLegend — compact inline T1/T2/T3 key beside the visual band. Replaces the
// heavy "How to read this case study" DataKey panel that repeated on every page
// (the full explainer lives once on the /case-studies methodology accordion).
// ---------------------------------------------------------------------------
const TIER_BADGE: Record<'T1' | 'T2' | 'T3', string> = {
  T1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  T2: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  T3: 'bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-300',
};

export function TierLegend() {
  return (
    <details className="not-prose group mt-2 text-xs font-sans">
      <summary className="cursor-pointer list-none inline-flex items-center gap-1.5 text-[var(--color-neutral-500)] hover:text-[var(--color-neutral-700)] dark:hover:text-[var(--color-neutral-300)]">
        <span className="underline decoration-dotted underline-offset-2">What do T1 / T2 / T3 mean?</span>
        <span className="group-open:rotate-180 transition-transform">▾</span>
      </summary>
      <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1.5 text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">
        {(['T1', 'T2', 'T3'] as const).map((t) => (
          <div key={t} className="flex items-center gap-1.5">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${TIER_BADGE[t]}`}>
              {t}
            </span>
            <span>
              {t === 'T1' ? 'Instrumented — from a ledger/commit' : t === 'T2' ? 'Declared — stated, not measured' : 'Narrative — estimate from memory'}
            </span>
          </div>
        ))}
      </dl>
    </details>
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

// Length-aware sizing for plain (non-parsed) values. A short token like "27/27"
// or "O(1)" reads as a headline number; a phrase like "ai_summary_generated" or
// "flag-gated off (SDK-pending)" must shrink + wrap or it overflows its grid cell.
function plainValueSize(s: string): string {
  const len = s.trim().length;
  if (len <= 10) return 'text-2xl';
  if (len <= 18) return 'text-xl';
  if (len <= 30) return 'text-base';
  return 'text-sm';
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
    <div className={`mt-2 font-serif leading-tight text-[var(--color-brand-indigo)] break-words ${plainValueSize(parsed.raw)}`}>
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
