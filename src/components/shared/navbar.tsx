'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, Shield, User, LogOut, Award, Clock, Menu, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface NavbarProps {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  } | null;
  activeChild?: {
    id: string;
    name: string;
    avatar: string;
    coins: number;
    remainingMinutes?: number;
  } | null;
}

export function Navbar({ user, activeChild }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [parentGateOpen, setParentGateOpen] = useState(false);
  const [gateAnswer, setGateAnswer] = useState('');
  const [gateError, setGateError] = useState('');

  const isChildMode = pathname.startsWith('/child');

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  function handleVerifyParentGate() {
    // Simple arithmetic lock to prevent young children (3-8) from exiting to parent zone accidentally
    if (gateAnswer.trim() === '12') {
      setParentGateOpen(false);
      setGateAnswer('');
      router.push('/parent/dashboard');
    } else {
      setGateError('Incorrect. Hint: 7 + 5 = ?');
    }
  }

  return (
    <>
      <header className={`sticky top-0 z-40 transition-colors ${isChildMode ? 'bg-amber-100/95 border-b-4 border-amber-300 shadow-sm' : 'bg-white/95 border-b border-slate-200 shadow-xs'} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href={isChildMode ? `/child/${activeChild?.id || ''}` : '/'} className="flex items-center gap-3 group">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white shadow-md transform group-hover:scale-105 transition ${isChildMode ? 'bg-amber-500' : 'bg-blue-600'}`}>
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                Chhota Genius
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-bold hidden sm:inline-block">
                  Ages 3–8
                </span>
              </span>
              <p className="text-xs font-semibold text-slate-700 hidden sm:block">
                छोटे उस्ताद, बड़ी सीख • Parent-Guided Safe Learning
              </p>
            </div>
          </Link>

          {/* Child Mode Active Status */}
          {isChildMode && activeChild && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-amber-200/90 px-3.5 py-1.5 rounded-full border border-amber-400 font-bold text-amber-950 text-sm">
                <span className="text-lg">🦁</span>
                <span className="hidden md:inline">{activeChild.name}</span>
                <span className="flex items-center gap-1 bg-amber-400 px-2.5 py-0.5 rounded-full text-xs font-black shadow-inner">
                  🪙 {activeChild.coins}
                </span>
              </div>

              {activeChild.remainingMinutes !== undefined && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white/80 border border-amber-300 text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{activeChild.remainingMinutes} min left</span>
                </div>
              )}

              {/* Parent Exit Button with Child Lock */}
              <button
                onClick={() => setParentGateOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border-2 border-slate-300 hover:bg-slate-100 transition shadow-sm"
              >
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Parent Exit</span>
              </button>
            </div>
          )}

          {/* Desktop Navigation for Public / Parent */}
          {!isChildMode && (
            <nav className="hidden md:flex items-center gap-6">
              {user ? (
                <>
                  <Link
                    href="/parent/dashboard"
                    className={`text-sm font-bold transition ${pathname.startsWith('/parent/dashboard') ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/parent/children"
                    className={`text-sm font-bold transition ${pathname.startsWith('/parent/children') ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Children Profiles
                  </Link>
                  <Link
                    href="/parent/content"
                    className={`text-sm font-bold transition ${pathname.startsWith('/parent/content') ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Curated Library
                  </Link>
                  <Link
                    href="/parent/rewards"
                    className={`text-sm font-bold transition ${pathname.startsWith('/parent/rewards') ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Rewards Approval
                  </Link>

                  <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {user.name.split(' ')[0]}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs font-bold">
                      <LogOut className="w-3.5 h-3.5 mr-1" />
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/#features" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                    Benefits
                  </Link>
                  <Link href="/#safety" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                    Safety & Privacy
                  </Link>
                  <Link href="/#activities" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                    Activities & Rewards
                  </Link>
                  <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="font-bold">
                        Parent Sign In
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="primary" size="sm" className="font-bold">
                        Start Free
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </nav>
          )}

          {/* Mobile Menu Button for non-child mode */}
          {!isChildMode && (
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          )}
        </div>

        {/* Mobile dropdown */}
        {!isChildMode && mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
            {user ? (
              <>
                <Link
                  href="/parent/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-bold py-2 text-slate-700"
                >
                  Dashboard
                </Link>
                <Link
                  href="/parent/children"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-bold py-2 text-slate-700"
                >
                  Children Profiles
                </Link>
                <Link
                  href="/parent/content"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-bold py-2 text-slate-700"
                >
                  Curated Library
                </Link>
                <Link
                  href="/parent/rewards"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-bold py-2 text-slate-700"
                >
                  Rewards Approval
                </Link>
                <div className="pt-2 border-t border-slate-100">
                  <Button variant="outline" size="sm" onClick={handleLogout} className="w-full justify-center">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold py-2 text-slate-700"
                >
                  Benefits
                </Link>
                <Link
                  href="/#safety"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold py-2 text-slate-700"
                >
                  Safety & Privacy
                </Link>
                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center">
                      Parent Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full justify-center">
                      Start Free
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {/* Parent Gate Modal for exiting child mode */}
      {parentGateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center border-4 border-amber-300">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">Parent Lock</h3>
            <p className="text-xs text-slate-600 mb-4">
              Please solve this quick problem to verify you are a parent or guardian:
            </p>

            <div className="bg-slate-100 py-3 rounded-2xl text-2xl font-black text-slate-800 mb-4 tracking-wider">
              7 + 5 = ?
            </div>

            <input
              type="number"
              placeholder="Your answer"
              value={gateAnswer}
              onChange={(e) => {
                setGateAnswer(e.target.value);
                setGateError('');
              }}
              className="w-full text-center text-xl font-bold py-3 rounded-2xl border-2 border-slate-300 focus:outline-none focus:border-blue-600 mb-2"
              autoFocus
            />

            {gateError && <p className="text-xs font-bold text-rose-600 mb-3">{gateError}</p>}

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setParentGateOpen(false);
                  setGateAnswer('');
                  setGateError('');
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" className="flex-1" onClick={handleVerifyParentGate}>
                Verify & Exit
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
