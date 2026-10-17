import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Lock, Trash2, EyeOff, FileText, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar user={null} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="emerald">Privacy & Child Protection</Badge>
            <span className="text-xs text-slate-500 font-semibold">Last Updated: October 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
            Child Data Privacy & Parental Consent Policy
          </h1>
          <p className="text-sm text-slate-600 mt-2 font-medium">
            How Chhota Genius protects young children aged 3–8 and upholds minimal data collection principles.
          </p>
        </div>

        <Card variant="default" className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-blue-600" /> 1. Strict Data Minimization
            </h2>
            <p>
              We adhere strictly to the principle of <strong>data minimization</strong>. To use Chhota Genius, parents only provide:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li>A nickname or friendly display name for the child (e.g. &ldquo;Aarav&rdquo;, &ldquo;Anu&rdquo;).</li>
              <li>An age band selection (3–5 or 6–8) and preferred learning language (English or Hindi).</li>
              <li>Parent&apos;s verified email address and password hash for account authentication.</li>
            </ul>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-bold">
              We NEVER request or store: child legal names, photos, exact dates of birth, geographic GPS locations, biometric data, camera access, or microphone audio.
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> 2. No Advertisements, Trackers, or Profiling
            </h2>
            <p>
              Chhota Genius is 100% free of third-party behavioral advertising networks, commercial tracking pixels, and profiling algorithms.
              Children are never targeted with purchase prompts, commercial sponsorships, or algorithmic autoplay rabbit holes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" /> 3. Indian Child-Data Privacy Notice (DPDPA 2023)
            </h2>
            <p className="text-xs text-slate-600">
              In accordance with provisions for processing data of children under India&apos;s <em>Digital Personal Data Protection Act, 2023 (DPDPA)</em>:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li>Processing of child data is carried out solely upon verifiable parental consent.</li>
              <li>We do not track or behaviorally monitor children across third-party websites or services.</li>
              <li>We do not engage in targeted advertising directed at children or deploy mechanisms likely to cause physical or psychological harm.</li>
            </ul>
            <p className="text-xs text-slate-500 italic mt-1">
              Note: This notice reflects internal security engineering standards. Ongoing legal compliance reviews should be conducted prior to commercial multi-tenant distribution.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-600" /> 4. Safe Virtual Rewards & Coin Ledger
            </h2>
            <p className="text-xs text-slate-600">
              The virtual coins earned on Chhota Genius have no monetary or cash equivalent. They cannot be transferred, sold, or redeemed for currency.
              Reward redemptions are exclusively real-world offline activities or treats curated and approved directly by the child&apos;s parent or guardian.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" /> 5. Right to Erasure & Account Deletion
            </h2>
            <p className="text-xs text-slate-600">
              Parents have complete autonomy over their data. Parents can delete individual child profiles or their entire parent account directly from the Parent Settings dashboard.
              Upon deletion, child learning attempts, screen sessions, and coin transactions are purged immediately via database cascade deletion.
            </p>
          </section>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
