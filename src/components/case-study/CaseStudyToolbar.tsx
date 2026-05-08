'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Check, Link as LinkIcon } from 'lucide-react';

// Top-of-article toolbar shipped with the 2026-05-08 quick-wins bundle.
// Closes audit V-007 (no back-to-catalog) + CS-015 (no copy-link affordance)
// + part of A-008 (focus-visible ring on every interactive surface).
export function CaseStudyToolbar() {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mb-8 flex items-center justify-between gap-4 font-sans text-sm">
      <Link
        href="/case-studies"
        className="inline-flex items-center gap-1.5 text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] hover:text-[var(--color-brand-indigo)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)] focus-visible:rounded min-h-[44px]"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        <span>Case studies</span>
      </Link>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? 'Link copied to clipboard' : 'Copy link to this case study'}
        aria-live="polite"
        className="inline-flex items-center gap-1.5 text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] hover:text-[var(--color-brand-indigo)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)] focus-visible:rounded min-h-[44px] px-2"
      >
        {copied ? (
          <>
            <Check size={14} aria-hidden="true" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <LinkIcon size={14} aria-hidden="true" />
            <span>Copy link</span>
          </>
        )}
      </button>
    </div>
  );
}
