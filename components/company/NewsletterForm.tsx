'use client';

import { FormEvent, useState } from 'react';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';

export function NewsletterForm({
  companyId,
  buttonText = 'Subscribe',
  placeholder = 'Enter your email address',
  primaryColor,
}: {
  companyId: string;
  buttonText?: string;
  placeholder?: string;
  primaryColor: string;
}) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, email }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Could not subscribe');
      }
      setSuccess(true);
      setMessage('Thank you! You are now subscribed.');
      setEmail('');
    } catch (error) {
      setSuccess(false);
      setMessage(error instanceof Error ? error.message : 'Could not subscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-xl">
      <div className="flex flex-col gap-3 rounded-2xl bg-white/10 p-2 ring-1 ring-white/20 backdrop-blur sm:flex-row">
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-white px-4 text-gray-900">
          <Mail className="h-5 w-5 shrink-0 text-gray-400" />
          <span className="sr-only">Email address</span>
          <input
            type="email"
            required
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={placeholder}
            className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          style={{ backgroundColor: primaryColor }}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {buttonText}
        </button>
      </div>
      {message && (
        <p
          className={`mt-3 flex items-center justify-center gap-2 text-sm ${
            success ? 'text-emerald-200' : 'text-red-200'
          }`}
        >
          {success && <CheckCircle2 className="h-4 w-4" />}
          {message}
        </p>
      )}
    </form>
  );
}
