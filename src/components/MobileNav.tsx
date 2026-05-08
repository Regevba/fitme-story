'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { Lock, Menu, X, Moon, Sun } from 'lucide-react';
import { NAV, isCurrentNav } from '@/lib/nav';

// Mobile navigation drawer. Closes the only remaining P0 from the
// 2026-05-08 audit (V-004): SiteHeader's `hidden md:flex` nav had no
// fallback below 768px — all 7 nav items disappeared with no replacement.
//
// Implementation:
// - Native <dialog> element via showModal() for free focus trap + Escape-to-close
// - Hamburger button visible only at md:hidden (matches the threshold where
//   the desktop nav disappears)
// - Closes on route change (usePathname effect)
// - Closes on backdrop click (dialog::backdrop click handler)
// - Theme toggle moved inside so mobile users have feature parity
//
// Browser support: <dialog>::showModal is in Chrome 37+, Safari 15.4+,
// Firefox 98+ (>99% of fitme-story.vercel.app traffic per Vercel Analytics).
export interface MobileNavProps {
  dark: boolean;
  onToggleTheme: () => void;
}

export function MobileNav({ dark, onToggleTheme }: MobileNavProps) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dialogId = useId();

  const open = () => {
    dialogRef.current?.showModal();
    setIsOpen(true);
  };
  const close = () => {
    dialogRef.current?.close();
    setIsOpen(false);
  };

  // Close drawer when route changes (link click → navigation → drawer hides).
  useEffect(() => {
    if (isOpen) close();
    // We intentionally only depend on pathname — close() is stable enough
    // for this use case and adding it would re-fire the effect on every
    // toggle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close on backdrop click. Native <dialog> doesn't do this by default;
  // we detect by checking if the click target is the dialog itself
  // (clicking the open dialog area would target a child element, not the
  // dialog itself).
  const onDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) close();
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        aria-controls={dialogId}
        className="md:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)]"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-label="Site navigation"
        onClick={onDialogClick}
        onClose={() => setIsOpen(false)}
        className="m-0 ml-auto h-full max-h-screen w-full max-w-sm bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)] text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] backdrop:bg-black/40 backdrop:backdrop-blur-sm shadow-2xl"
      >
        <div className="flex flex-col h-full font-sans">
          <div className="flex items-center justify-between border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] px-6 py-5">
            <span className="font-semibold tracking-tight">
              fitme<span className="text-[var(--color-brand-indigo)]">·</span>story
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close navigation menu"
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)]"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {NAV.map((item) => {
                const current = !item.gated && isCurrentNav(pathname, item.href);
                const baseLink =
                  'flex items-center gap-2 min-h-[44px] px-3 py-2 rounded text-base hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)] hover:text-[var(--color-brand-indigo)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)]';
                const currentClasses = current
                  ? ' text-[var(--color-brand-indigo)] bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] font-medium'
                  : '';
                return (
                  <li key={item.href}>
                    {item.gated ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener"
                        className={`${baseLink} justify-between`}
                        title="Gated: requires operator credentials. Opens in a new tab."
                      >
                        <span>{item.label}</span>
                        <Lock size={14} className="opacity-60" aria-label="gated" />
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        aria-current={current ? 'page' : undefined}
                        className={`${baseLink}${currentClasses}`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] px-6 py-4">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-pressed={dark}
              className="inline-flex items-center gap-2 min-h-[44px] px-3 py-2 rounded text-sm hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-indigo)]"
            >
              {dark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
              <span>{dark ? 'Light theme' : 'Dark theme'}</span>
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
