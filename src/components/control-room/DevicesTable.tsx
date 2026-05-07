'use client';

// src/components/control-room/DevicesTable.tsx
//
// T16 helper component — renders a table of registered credentials with
// inline-pill Revoke confirmation flow (NOT a modal — matches auth-polish-v2).

import { useState } from 'react';

export interface CredentialRow {
  credentialID: string;
  label: string;
  deviceType: 'platform' | 'cross_platform';
  transports: string[];
  createdAt: number;
  lastUsedAt: number | null;
  revokedAt: number | null;
}

function formatRelative(unixSeconds: number | null): string {
  if (!unixSeconds) return '—';
  const deltaMin = Math.floor((Date.now() / 1000 - unixSeconds) / 60);
  if (deltaMin < 1) return 'just now';
  if (deltaMin < 60) return `${deltaMin} min ago`;
  const deltaH = Math.floor(deltaMin / 60);
  if (deltaH < 24) return `${deltaH}h ago`;
  const deltaD = Math.floor(deltaH / 24);
  return `${deltaD}d ago`;
}

export default function DevicesTable({ initialCredentials }: { initialCredentials: CredentialRow[] }) {
  const [rows, setRows] = useState(initialCredentials);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function revoke(credentialID: string) {
    setBusyId(credentialID);
    try {
      const res = await fetch('/api/auth/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialID }),
      });
      if (res.ok) {
        setRows((prev) =>
          prev.map((r) =>
            r.credentialID === credentialID
              ? { ...r, revokedAt: Math.floor(Date.now() / 1000) }
              : r,
          ),
        );
      }
    } finally {
      setBusyId(null);
      setConfirmingId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-600 dark:border-white/15 dark:bg-white/5 dark:text-white/70">
        <p className="font-medium">No credentials registered yet.</p>
        <p className="mt-2">
          Run{' '}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs dark:bg-white/8">
            pnpm tsx scripts/issue-bootstrap-token.ts
          </code>{' '}
          to add your first device.
        </p>
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-neutral-200 dark:border-white/10">
          <th className="py-2 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/50">
            Label
          </th>
          <th className="py-2 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/50">
            Type
          </th>
          <th className="py-2 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/50">
            Last used
          </th>
          <th className="py-2 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/50">
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const isRevoked = row.revokedAt !== null;
          const isConfirming = confirmingId === row.credentialID;
          const isBusy = busyId === row.credentialID;
          return (
            <tr
              key={row.credentialID}
              className={`border-b border-neutral-100 dark:border-white/5 ${isRevoked ? 'opacity-60' : ''}`}
            >
              <td className={`py-3 ${isRevoked ? 'line-through' : ''} text-neutral-900 dark:text-white`}>
                {row.label}
              </td>
              <td className="py-3">
                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-800 dark:bg-white/8 dark:text-white">
                  {row.deviceType === 'platform' ? 'Platform' : 'Hardware key'}
                </span>
              </td>
              <td className="py-3 text-neutral-500 dark:text-white/60">
                {formatRelative(row.lastUsedAt)}
              </td>
              <td className="py-3 text-right">
                {isRevoked ? (
                  <span className="text-xs text-neutral-500 dark:text-white/40">
                    revoked {formatRelative(row.revokedAt)}
                  </span>
                ) : isConfirming ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">
                    Revoke?
                    <button
                      onClick={() => revoke(row.credentialID)}
                      disabled={isBusy}
                      aria-label={`Confirm revoke ${row.label}`}
                      className="rounded-full bg-white/20 px-2 py-0.5 hover:bg-white/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setConfirmingId(null)}
                      disabled={isBusy}
                      aria-label="Cancel revoke"
                      className="rounded-full bg-white/20 px-2 py-0.5 hover:bg-white/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
                    >
                      ✗
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmingId(row.credentialID)}
                    className="text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"
                  >
                    Revoke
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
