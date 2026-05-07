'use client';

// src/app/control-room/sign-in/recover/RecoverShell.tsx
//
// Client wrapper for the Recover page. Two paths:
//   A — ?bootstrap=<token> in URL: token auto-extracted, register CTA shown
//   B — no token: paste field + Continue → adds ?bootstrap=<token> to URL

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import AuthPasskeyForm from '@/components/control-room/AuthPasskeyForm';

export default function RecoverShell() {
  const search = useSearchParams();
  const router = useRouter();
  const tokenFromUrl = search.get('bootstrap');
  const [pastedToken, setPastedToken] = useState('');

  if (tokenFromUrl) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-neutral-500 dark:text-white/60">
          Tap below to register this device as your passkey.
        </p>
        <AuthPasskeyForm
          mode="register"
          bootstrapToken={tokenFromUrl}
          primaryLabel="Register this device"
          onSuccess={() => router.push('/control-room/sign-in?registered=1')}
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!pastedToken.trim()) return;
        router.push(
          `/control-room/sign-in/recover?bootstrap=${encodeURIComponent(pastedToken.trim())}`,
        );
      }}
      className="space-y-3"
    >
      <p className="text-sm text-neutral-500 dark:text-white/60">
        Paste the bootstrap token printed by{' '}
        <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs dark:bg-white/8">
          pnpm tsx scripts/issue-bootstrap-token.ts
        </code>{' '}
        on a trusted machine.
      </p>
      <textarea
        rows={3}
        value={pastedToken}
        onChange={(e) => setPastedToken(e.target.value)}
        placeholder="Paste bootstrap token…"
        aria-label="Bootstrap token"
        className="w-full rounded-xl border border-neutral-300 bg-white p-3 font-mono text-xs text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:outline-none dark:border-white/15 dark:bg-white/5 dark:text-white"
      />
      <button
        type="submit"
        disabled={!pastedToken.trim()}
        className="inline-flex h-12 w-full items-center justify-center rounded-xl px-6 text-sm font-semibold text-white transition focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
        style={{ backgroundColor: 'var(--color-brand-indigo)' }}
      >
        Continue
      </button>
    </form>
  );
}
