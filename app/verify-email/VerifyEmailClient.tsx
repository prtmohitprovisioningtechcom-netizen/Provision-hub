'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';

export function VerifyEmailClient({ token }: { token?: string }) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error',
  );
  const [message, setMessage] = useState(
    token ? 'Verifying your email…' : 'Verification token is missing.',
  );

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify-email', token }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Verification link is invalid or expired.');
        }
        setStatus('success');
        setMessage('Your email has been verified successfully.');
      } catch (error) {
        setStatus('error');
        setMessage(
          error instanceof Error
            ? error.message
            : 'Verification link is invalid or expired.',
        );
      }
    };

    verify();
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <BrandLogo className="mb-8 justify-center" />
        {status === 'loading' && <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600" />}
        {status === 'success' && <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />}
        {status === 'error' && <XCircle className="mx-auto h-12 w-12 text-red-600" />}
        <h1 className="mt-5 text-2xl font-bold">Email verification</h1>
        <p className="mt-3 text-gray-500">{message}</p>
        {status !== 'loading' && (
          <Button asChild className="mt-6 w-full">
            <Link href="/login">{status === 'success' ? 'Continue to sign in' : 'Back to sign in'}</Link>
          </Button>
        )}
      </div>
    </main>
  );
}
