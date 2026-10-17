import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Heart, AlertCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center font-black text-amber-950 shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">Chhota Genius</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Safe, joyful educational learning designed with love for children aged 3–8. Parent-approved videos, interactive activities, and offline real-world rewards.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-800/50 w-fit">
              <ShieldCheck className="w-4 h-4" /> 100% Ad-Free & Zero Tracking
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <Link href="/#features" className="hover:text-amber-400 transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#activities" className="hover:text-amber-400 transition">
                  Quizzes & Sorting Games
                </Link>
              </li>
              <li>
                <Link href="/#safety" className="hover:text-amber-400 transition">
                  Parent Screen-Time Controls
                </Link>
              </li>
              <li>
                <Link href="/#rewards" className="hover:text-amber-400 transition">
                  Offline Real-World Rewards
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy & Safety Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Safety & Consent</h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <Link href="/privacy" className="hover:text-amber-400 transition">
                  Child Data Privacy Notice
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-400 transition">
                  Parent Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/data-retention" className="hover:text-amber-400 transition">
                  Data Retention & Account Deletion
                </Link>
              </li>
              <li>
                <span className="text-slate-500">DPDPA 2023 Child Privacy Review</span>
              </li>
            </ul>
          </div>

          {/* Honest Parental Notice */}
          <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700/60 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Parental Advisory Note</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Chhota Genius is an educational supplement. It does not replace active parental supervision, make medical claims regarding eyesight protection, or diagnose learning abilities. Screen-time controls apply within this web session and require parent co-engagement for complete device-level enforcement.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Chhota Genius Platform. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for curious young learners across India & beyond.
          </p>
        </div>
      </div>
    </footer>
  );
}
