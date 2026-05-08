'use client';

import { useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

// Code-block copy affordance. Closes audit A-024 + R-008 + CS-004
// (2026-05-08): code blocks rendered as plain monospace with no copy
// button and no syntax highlighting. This component pairs with the
// Pre wrapper in mdx-components.tsx (which adds rehype-pretty-code
// for syntax tokens) — together they upgrade the showcase MDX code
// experience to "engineering writing" standard.
//
// Implementation: server doesn't render this component; client extracts
// the code text from the parent <pre> via ref + textContent. No raw
// HTML injection required (uses native textContent extraction only).
export function CopyButton({ className = '' }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const onCopy = async () => {
    if (typeof window === 'undefined') return;
    const pre = buttonRef.current?.closest('pre');
    if (!pre) return;
    const code = pre.querySelector('code');
    const text = (code ?? pre).textContent ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onCopy}
      aria-label={copied ? 'Code copied to clipboard' : 'Copy code to clipboard'}
      aria-live="polite"
      className={
        'inline-flex items-center justify-center min-h-[32px] min-w-[32px] rounded p-1.5 ' +
        'bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] ' +
        'text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] ' +
        'hover:text-[var(--color-brand-indigo)] ' +
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)] ' +
        'transition-opacity ' +
        className
      }
    >
      {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
    </button>
  );
}
