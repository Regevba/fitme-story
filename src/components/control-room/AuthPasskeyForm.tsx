'use client';

// src/components/control-room/AuthPasskeyForm.tsx
//
// T13 — reusable WebAuthn ceremony component (P-core, foundation for sign-in + recover).
//
// Two modes:
//   - mode="authenticate" → calls /api/auth/authenticate/{options,verify}
//   - mode="register"     → calls /api/auth/register/{options,verify} with bootstrapToken
//
// State machine: idle → pending → success | error | locked
//
// Conditional-UI autofill (mode=authenticate, mediation=conditional) fires
// automatically on mount; the visible button is the manual fallback.

import { useEffect, useRef, useState } from 'react';
import {
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';
import { Fingerprint, AlertTriangle, CheckCircle2 } from 'lucide-react';

type Mode = 'authenticate' | 'register';
type Status = 'idle' | 'pending' | 'success' | 'error' | 'locked';

export interface AuthPasskeyFormProps {
  mode: Mode;
  bootstrapToken?: string;
  onSuccess?: (result: { label: string }) => void;
  /** Override the default labels (e.g. "Register this device" vs "Unlock with passkey"). */
  primaryLabel?: string;
  /** Disable conditional-UI autofill (mode=authenticate only). */
  disableConditional?: boolean;
}

const ERROR_REASON: Record<string, string> = {
  user_cancelled: 'Touch ID cancelled.',
  no_authenticator: 'No passkey found on this device.',
  attestation_invalid: 'Could not register this device — try again.',
  assertion_invalid: 'Authentication failed — try again.',
  counter_replay: 'Security check failed. Please contact your operator.',
  unknown_credential: 'This passkey is no longer valid. Use the Recover flow.',
  bootstrap_invalid: 'Bootstrap token is invalid, used, or expired.',
  timeout: 'Sign-in timed out. Try again.',
  server_error: 'Server error. Please retry.',
};

export default function AuthPasskeyForm(props: AuthPasskeyFormProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [errorReason, setErrorReason] = useState<string | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);
  const conditionalAbort = useRef<AbortController | null>(null);

  // Capability detection — gates whether the platform-authenticator path renders.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (typeof window === 'undefined' || !('PublicKeyCredential' in window)) {
          if (!cancelled) setSupported(false);
          return;
        }
        const platform =
          await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (!cancelled) setSupported(platform);
      } catch {
        if (!cancelled) setSupported(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Conditional-UI autofill (mode=authenticate only).
  useEffect(() => {
    if (props.mode !== 'authenticate') return;
    if (props.disableConditional) return;
    if (typeof window === 'undefined') return;

    let cancelled = false;
    const controller = new AbortController();
    conditionalAbort.current = controller;

    (async () => {
      try {
        const optsRes = await fetch('/api/auth/authenticate/options', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mediation: 'conditional' }),
          signal: controller.signal,
        });
        if (!optsRes.ok) return;
        const { options, challengeKey } = await optsRes.json();
        const assertion = await startAuthentication({
          optionsJSON: options,
          useBrowserAutofill: true,
        });
        if (cancelled) return;
        await verifyAuthenticate(challengeKey, assertion);
      } catch {
        // AbortError or no autofill match — silent fallback to manual button.
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.mode, props.disableConditional]);

  async function verifyAuthenticate(challengeKey: string, assertion: unknown) {
    const verifyRes = await fetch('/api/auth/authenticate/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeKey, response: assertion }),
    });
    if (!verifyRes.ok) {
      const data = await verifyRes.json().catch(() => ({}));
      setStatus('error');
      setErrorReason(data.error ?? 'server_error');
      return;
    }
    const { label } = await verifyRes.json();
    setStatus('success');
    setTimeout(() => props.onSuccess?.({ label }), 250);
  }

  async function handleAuthenticate() {
    setStatus('pending');
    setErrorReason(null);
    try {
      const optsRes = await fetch('/api/auth/authenticate/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediation: 'required' }),
      });
      if (!optsRes.ok) {
        setStatus('error');
        setErrorReason('server_error');
        return;
      }
      const { options, challengeKey } = await optsRes.json();
      const assertion = await startAuthentication({ optionsJSON: options });
      await verifyAuthenticate(challengeKey, assertion);
    } catch (err: unknown) {
      const e = err as { name?: string };
      setStatus('error');
      if (e.name === 'NotAllowedError') {
        setErrorReason('user_cancelled');
      } else {
        setErrorReason('server_error');
      }
    }
  }

  async function handleRegister() {
    if (!props.bootstrapToken) {
      setStatus('error');
      setErrorReason('bootstrap_invalid');
      return;
    }
    setStatus('pending');
    setErrorReason(null);
    try {
      const optsRes = await fetch('/api/auth/register/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bootstrapToken: props.bootstrapToken }),
      });
      if (!optsRes.ok) {
        const data = await optsRes.json().catch(() => ({}));
        setStatus('error');
        setErrorReason(data.error ?? 'server_error');
        return;
      }
      const { options, email } = await optsRes.json();
      const attestation = await startRegistration({ optionsJSON: options });
      const verifyRes = await fetch('/api/auth/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, response: attestation }),
      });
      if (!verifyRes.ok) {
        const data = await verifyRes.json().catch(() => ({}));
        setStatus('error');
        setErrorReason(data.error ?? 'attestation_invalid');
        return;
      }
      const { label } = await verifyRes.json();
      setStatus('success');
      setTimeout(() => props.onSuccess?.({ label }), 250);
    } catch (err: unknown) {
      const e = err as { name?: string };
      setStatus('error');
      setErrorReason(e.name === 'NotAllowedError' ? 'user_cancelled' : 'server_error');
    }
  }

  const handlePrimary = props.mode === 'authenticate' ? handleAuthenticate : handleRegister;

  if (supported === false && props.mode === 'register') {
    return (
      <div
        role="alert"
        className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
      >
        This browser does not support passkey registration. Use a modern Safari, Chrome, or Edge build.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {props.mode === 'authenticate' && (
        <input
          type="text"
          name="username"
          autoComplete="username webauthn"
          placeholder="Operator email (autofill will use this)"
          aria-label="Sign in with passkey"
          className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:outline-none dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
        />
      )}

      {status === 'error' && errorReason && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-3 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{ERROR_REASON[errorReason] ?? 'Something went wrong. Please try again.'}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handlePrimary}
        disabled={status === 'pending' || status === 'success' || status === 'locked'}
        className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-indigo px-6 text-sm font-semibold text-white transition hover:bg-brand-indigo-hover focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:outline-none disabled:bg-brand-indigo/60${
          props.mode === 'authenticate' && status === 'idle' ? ' coral-pulse-cta' : ''
        }`}
        style={{ backgroundColor: 'var(--color-brand-indigo)' }}
      >
        {status === 'success' ? (
          <>
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Signed in
          </>
        ) : status === 'pending' ? (
          <>
            <Fingerprint className="h-4 w-4 animate-pulse" aria-hidden="true" />
            Waiting for passkey…
          </>
        ) : (
          <>
            <Fingerprint className="h-4 w-4" aria-hidden="true" />
            {props.primaryLabel ??
              (props.mode === 'authenticate' ? 'Unlock with passkey' : 'Register this device')}
          </>
        )}
      </button>
    </div>
  );
}
