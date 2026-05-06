'use client';

import Link from 'next/link';
import { useEffect, useSyncExternalStore } from 'react';
import { Lock, Moon, Sun } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  /** When true, renders a small lock icon next to the label as a hint that
      the destination is auth-gated (the basic-auth dialog will appear on
      navigation). */
  gated?: boolean;
}

const NAV: NavItem[] = [
  { href: '/pm-flow', label: 'PM Flow' },
  { href: '/framework', label: 'Framework' },
  { href: '/design-system', label: 'Design System' },
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/research', label: 'Research' },
  { href: '/about', label: 'About' },
  { href: '/control-room', label: 'Control Center', gated: true },
];

const STORAGE_KEY = 'fitme-story-theme';
const STORAGE_EVENT = 'storage';
const MEDIA_QUERY = '(prefers-color-scheme: dark)';

// `useSyncExternalStore`-backed dark-mode read so we don't trip React 19's
// `react-hooks/set-state-in-effect` rule. Same pattern as the control-room
// ThemeToggle. Subscribes to localStorage cross-tab updates + the OS
// prefers-color-scheme media query.

function subscribeToTheme(callback: () => void): () => void {
  window.addEventListener(STORAGE_EVENT, callback);
  const mq = window.matchMedia(MEDIA_QUERY);
  mq.addEventListener('change', callback);
  return () => {
    window.removeEventListener(STORAGE_EVENT, callback);
    mq.removeEventListener('change', callback);
  };
}

function getThemeSnapshot(): boolean {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  return window.matchMedia(MEDIA_QUERY).matches;
}

function getThemeServerSnapshot(): boolean {
  return false;
}

export function SiteHeader() {
  const dark = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );

  // DOM-mirror only — no setState in effect, satisfies the lint rule.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const toggle = () => {
    const next = !dark;
    window.localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    // storage events don't fire in the originating tab; broadcast manually
    // so useSyncExternalStore re-reads the snapshot.
    window.dispatchEvent(new StorageEvent(STORAGE_EVENT, { key: STORAGE_KEY }));
  };

  return (
    <header className="border-b border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)]">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between font-sans">
        <Link href="/" className="font-semibold tracking-tight inline-flex items-center min-h-[44px]">
          fitme<span className="text-[var(--color-brand-indigo)]">·</span>story
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-1.5 min-h-[44px] hover:text-[var(--color-brand-indigo)]"
                title={item.gated ? 'Gated: requires operator credentials' : undefined}
              >
                {item.label}
                {item.gated ? (
                  <Lock size={12} className="opacity-60" aria-label="gated" />
                ) : null}
              </Link>
            ))}
          </nav>
          <button
            onClick={toggle}
            aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
            className="p-2 rounded hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-800)]"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
