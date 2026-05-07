'use client';

// src/app/control-room/sign-in/SignInShell.tsx
//
// Client wrapper around AuthPasskeyForm that handles the post-success redirect.
// Extracted because the page.tsx server component can't pass an event-handler
// callback prop across the server→client boundary.

import { useSearchParams } from 'next/navigation';
import AuthPasskeyForm from '@/components/control-room/AuthPasskeyForm';

export default function SignInShell() {
  const search = useSearchParams();
  const handleSuccess = () => {
    const next = search.get('next');
    const target = next && next.startsWith('/control-room') ? next : '/control-room';
    window.location.href = target;
  };
  return <AuthPasskeyForm mode="authenticate" onSuccess={handleSuccess} />;
}
