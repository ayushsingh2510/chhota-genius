'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  ShieldCheck,
  Clock,
  Award,
  Video,
  Puzzle,
  CheckCircle2,
  Lock,
  Heart,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar user={null} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-sky-50/50 to-slate-50 pt-16 pb-20 md:py-24">
        {/* Playful background decorative shapes */}
        <div className="absolute top-10 left-5 w-24 h-24 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-28 right-10 w-36 h-36 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>छोटे उस्ताद, बड़ी सीख • Curated for Curious Minds Aged 3–8</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Joyful Learning for Kids, <br className="hidden sm:inline" />
              <span className="text-blue-600 underline decoration-amber-400 decoration-wavy decoration-2">
                Total Peace of Mind
              </span>{' '}
              for Parents.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
              Chhota Genius is a clean educational sandbox where young children learn through parent-approved videos,
              interactive phonics and sorting activities, and earn virtual coins for offline real-world family rewards.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button variant="kid-sunny" size="kid-lg" className="w-full text-base sm:text-lg font-black">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="kid-lg" className="w-full text-base sm:text-lg font-bold">
                  Parent Login
                </Button>
              </Link>
            </div>

            {/* Micro Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Ad-Free
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-600" /> No Camera / Mic Access
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" /> Hindi & English Content
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Cards */}
      <section id="features" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="blue">Parent-First Design</Badge>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Designed for Early Childhood Development
            </h2>
            <p className="text-sm text-slate-600">
              Every video, activity, and coin transaction is guarded by parental control and pedagogical purpose.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <Card variant="kid" className="border-t-8 border-t-blue-500">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Curated Video Library</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                No endless algorithmic autoplay or weird recommendations. Only hand-curated, age-banded videos on
                alphabets, math, science, and good habits that parents explicitly approve.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Signed short-lived playback tokens
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Age bands 3–5 and 6–8
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Hindi and English phonics
                </li>
              </ul>
            </Card>

            {/* Card 2 */}
            <Card variant="kid" className="border-t-8 border-t-amber-400">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
                <Puzzle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Interactive Activities</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Coins are awarded only for completing verified educational activities—never for passively watching more
                screen time. Server-evaluated quizzes, matching, and sorting games.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> No shaming or deductions for mistakes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Server-side answer security
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Anti-farming idempotent rewards
                </li>
              </ul>
            </Card>

            {/* Card 3 */}
            <Card variant="kid" className="border-t-8 border-t-emerald-500">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Real-World Offline Rewards</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Virtual coins hold zero cash value and cannot be gambled. Children exchange coins for parent-approved
                offline treats like bedtime stories, drawing supplies, or a family park visit.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Parent approval required for all redemptions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Immutable server ledger
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Parent-configurable monthly coin budget
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Screen-Time & Safety Deep Dive */}
      <section id="safety" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="rose">Honest Safety & Screen-Time</Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Healthy Digital Boundaries Built on Server Clock Truth
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Unlike simple browser timers that children can reset by refreshing the page or switching tabs, Chhota
                Genius tracks session duration and remaining daily limits on the server.
              </p>

              <div className="space-y-4">
                <div className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-200">
                  <Clock className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Configurable Daily Screen Limits</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Set 20, 30, or 45 minutes per child. When time is up, video playback pauses and a cheerful
                      session-end screen reminds the child it is time to play outside.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-200">
                  <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Child Lock Math Gate</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Children cannot exit Child Mode to reach settings or external sites without solving a parent arithmetic
                      challenge.
                    </p>
                  </div>
                </div>
              </div>

              {/* Transparent Disclaimer Box */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1">
                <span className="font-bold">Transparent Limitations Disclosure:</span>
                <p className="text-[11px] leading-relaxed text-amber-900">
                  Screen-time enforcement operates within this web application. If a child navigates away from the browser
                  or uses other apps on the device, device-level operating system controls (e.g. Google Family Link / Apple
                  Screen Time) and active parental engagement are necessary. We make no medical claims regarding eyesight.
                </p>
              </div>
            </div>

            {/* Illustrative Dashboard Preview Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl">🦁</div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">Aarav (Age 4)</h4>
                    <span className="text-xs text-slate-500">English • Band 3–5</span>
                  </div>
                </div>
                <Badge variant="emerald">Approved Active</Badge>
              </div>

              {/* Screen-Time Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Today&apos;s Screen Time</span>
                  <span>15 / 25 mins</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                  <div className="bg-amber-400 h-3.5 rounded-full" style={{ width: '60%' }} />
                </div>
                <span className="text-[11px] text-slate-500 block">10 minutes remaining today • 1 break taken</span>
              </div>

              {/* Coin Ledger Snapshot */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 block">Authoritative Coin Balance</span>
                  <span className="text-2xl font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                    🪙 15 Chhota Coins
                  </span>
                </div>
                <Badge variant="amber">Bounded Cap: 200/mo</Badge>
              </div>

              {/* Pending Reward Request */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-blue-700 uppercase">Pending Redemption</span>
                  <h5 className="text-xs font-bold text-slate-900">Extra Bedtime Story Pick (15 coins)</h5>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs py-1 h-8">
                    Reject
                  </Button>
                  <Button variant="primary" size="sm" className="text-xs py-1 h-8">
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Indian Child Data Privacy Section */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <Badge variant="emerald">DPDPA 2023 Principles</Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Minimal Data Collection for Young Learners
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We believe children have an absolute right to privacy. We only ask for a display nickname and age band.
            We never collect a child’s legal name, exact birthdate, biometric data, photo, home address, or microphone/camera access.
          </p>
          <div className="pt-2">
            <Link href="/privacy" className="text-xs font-bold text-blue-600 hover:underline">
              Read our full Parent Consent & Child Data Policy →
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-blue-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Give Your Child a Safer, Calmer Digital Space?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto">
            Set up your parent account in less than a minute. Add your child’s nickname, pick approved categories, and start joyful learning today.
          </p>
          <div className="pt-2">
            <Link href="/register">
              <Button variant="kid-sunny" size="kid-lg" className="text-lg font-black text-amber-950">
                Create Parent Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
