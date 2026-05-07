// src/app/control-room/sign-in/page.tsx
//
// T14 — Sign-in screen with conditional-UI autofill.
// Server component shell; client logic in SignInShell.

import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import SignInShell from './SignInShell';
import { TrackPageView } from '@/components/control-room/TrackPageView';

export const metadata: Metadata = {
  title: 'Sign in — FitMe Control Room',
  description: 'Operator dashboard authentication.',
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-6 py-12">
      <TrackPageView route="auth_passkey_signin" />
      <section
        className="w-full rounded-[28px] border border-neutral-300 bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(248,250,252,0.98)_100%)] p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/8 dark:bg-[linear-gradient(180deg,rgba(20,24,34,0.95)_0%,rgba(10,13,19,0.98)_100%)] dark:shadow-none"
        style={{ maxWidth: '58ch' }}
      >
        <header className="mb-6 text-center">
          <div
            aria-hidden="true"
            className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-3xl text-white"
            style={{ backgroundColor: 'var(--color-brand-coral)' }}
          >
            <span className="font-serif text-5xl font-bold">F</span>
          </div>
          <h1 className="font-serif text-[length:var(--text-display-md)] text-neutral-900 dark:text-white">
            FitMe Control Room
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-white/60">
            Sign in to continue
          </p>
        </header>

        <Suspense fallback={<div className="h-12 animate-pulse rounded-xl bg-neutral-200 dark:bg-white/10" />}>
          <SignInShell />
        </Suspense>

        <footer className="mt-6 text-center">
          <Link
            href="/control-room/sign-in/recover"
            className="text-sm underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-none"
            style={{ color: 'var(--color-brand-indigo)' }}
          >
            Lost your device? Recover access →
          </Link>
        </footer>
      </section>
    </main>
  );
}
