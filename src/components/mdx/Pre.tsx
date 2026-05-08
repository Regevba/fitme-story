import type { HTMLAttributes } from 'react';
import { CopyButton } from './CopyButton';

// Wrapper around <pre> that adds a positioned <CopyButton> overlay.
// Server-rendered shell + client-only button. Used as the MDX `pre`
// override in mdx-components.tsx so every code block in case-study
// MDX gets a copy affordance. Audit A-024 + R-008 + CS-004 (2026-05-08).
//
// rehype-pretty-code emits a <pre data-language="…"> with a nested
// <code> containing per-token <span>s. We pass the rehype output through
// untouched and just position our button absolutely on top.
export function Pre(props: HTMLAttributes<HTMLPreElement>) {
  return (
    <div className="relative group not-prose my-6">
      <pre
        {...props}
        className={
          (props.className ?? '') +
          ' overflow-x-auto rounded-lg border border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)] p-4 text-sm leading-relaxed font-mono'
        }
      />
      <CopyButton className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100" />
    </div>
  );
}
