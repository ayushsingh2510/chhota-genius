'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!consentPrivacy) {
      setError('Please review and check the parental consent agreement to continue.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, consentPrivacy }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/parent/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar user={null} />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Create Parent Account</h1>
            <p className="text-xs text-slate-500 font-medium">
              You maintain 100% control over child profiles, screen time, and content.
            </p>
          </div>

          <Card variant="elevated" className="border-2 border-slate-200">
            <CardContent>
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Parent / Guardian Name"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />

                <Input
                  label="Parent Email Address"
                  type="email"
                  required
                  placeholder="parent@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />

                <Input
                  label="Create Password"
                  type="password"
                  required
                  placeholder="At least 8 characters (A-Z, a-z, 0-9)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  helperText="Must be 8+ characters with uppercase, lowercase, and a number."
                  autoComplete="new-password"
                />

                {/* Explicit Parental Consent Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={consentPrivacy}
                      onChange={(e) => setConsentPrivacy(e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-600 leading-relaxed font-medium">
                      I confirm that I am a parent or legal guardian. I consent to creating child learning profiles using nicknames and understand the{' '}
                      <Link href="/privacy" target="_blank" className="text-blue-600 underline font-bold">
                        Child Privacy Notice
                      </Link>
                      .
                    </span>
                  </label>
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full font-bold mt-2" isLoading={loading}>
                  Create Account & Add First Child
                </Button>
              </form>

              <div className="mt-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero advertisements • No personal data sales • No trackers</span>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-slate-500 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-blue-600 hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
