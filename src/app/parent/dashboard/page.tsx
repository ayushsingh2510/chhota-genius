'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Users,
  Clock,
  Award,
  Video,
  Play,
  CheckCircle2,
  XCircle,
  Plus,
  BookOpen,
  ArrowRight,
  Shield,
} from 'lucide-react';

export default function ParentDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const res = await fetch('/api/parent/dashboard');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRedemptionDecision(redemptionId: string, decision: 'APPROVE' | 'REJECT') {
    setActionLoading(redemptionId);
    setNotice(null);
    try {
      const res = await fetch('/api/parent/redemptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redemptionId, decision }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to update redemption');

      setNotice(result.message);
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar user={null} />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center space-y-3">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
            <p className="text-sm font-bold text-slate-600">Loading Parent Dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const parent = data?.parent;
  const children = data?.children || [];
  const pendingRedemptions = data?.recentRedemptions?.filter((r: any) => r.status === 'REQUESTED') || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar user={parent} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Parent Command Center</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              Welcome back, {parent?.name || 'Parent'}!
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Review daily screen time, child learning activities, and approve offline real-world rewards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/parent/children">
              <Button variant="outline" size="sm" className="font-bold">
                <Plus className="w-4 h-4 mr-1.5" /> Add Child Profile
              </Button>
            </Link>
            <Link href="/parent/rewards">
              <Button variant="outline" size="sm" className="font-bold">
                <Award className="w-4 h-4 mr-1.5" /> Reward Catalogue ({data?.rewardsCount || 0})
              </Button>
            </Link>
            <Link href="/parent/content">
              <Button variant="primary" size="sm" className="font-bold">
                <Video className="w-4 h-4 mr-1.5" /> Curate Library
              </Button>
            </Link>
          </div>
        </div>

        {notice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs font-bold animate-fadeIn">
            <span>{notice}</span>
            <button onClick={() => setNotice(null)} className="text-emerald-700 hover:text-emerald-900">
              Dismiss
            </button>
          </div>
        )}

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="bordered" className="p-4 space-y-1">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" /> Children Profiles
            </span>
            <span className="text-2xl font-black text-slate-900">{children.length}</span>
          </Card>

          <Card variant="bordered" className="p-4 space-y-1">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" /> Total Screen Time Today
            </span>
            <span className="text-2xl font-black text-slate-900">
              {children.reduce((acc: number, c: any) => acc + (c.screenTime?.minutesSpentToday || 0), 0)} mins
            </span>
          </Card>

          <Card variant="bordered" className="p-4 space-y-1">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" /> Ledger Coins in Circulation
            </span>
            <span className="text-2xl font-black text-slate-900">
              {children.reduce((acc: number, c: any) => acc + (c.coinBalance || 0), 0)} coins
            </span>
          </Card>

          <Card variant="bordered" className={`p-4 space-y-1 ${pendingRedemptions.length > 0 ? 'bg-amber-50 border-amber-300' : ''}`}>
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-rose-500" /> Pending Reward Requests
            </span>
            <span className="text-2xl font-black text-slate-900">{pendingRedemptions.length}</span>
          </Card>
        </div>

        {/* Pending Reward Redemptions Alert Section */}
        {pendingRedemptions.length > 0 && (
          <div className="bg-amber-50 rounded-3xl p-6 border-2 border-amber-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-600" />
                <h3 className="text-base font-black text-amber-950">
                  Pending Reward Requests ({pendingRedemptions.length})
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-800">Requires Parent Confirmation</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRedemptions.map((red: any) => (
                <div key={red.id} className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">Child:</span>
                      <span className="text-xs font-black text-slate-900">{red.child?.name}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{red.reward?.title}</h4>
                    <span className="text-xs font-bold text-amber-700">Cost: {red.coinCost} Coins</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRedemptionDecision(red.id, 'REJECT')}
                      disabled={actionLoading === red.id}
                      className="text-xs font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleRedemptionDecision(red.id, 'APPROVE')}
                      disabled={actionLoading === red.id}
                      isLoading={actionLoading === red.id}
                      className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Children Profile Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Children</h2>
            <Link href="/parent/children" className="text-xs font-bold text-blue-600 hover:underline">
              Manage Profiles & Limits →
            </Link>
          </div>

          {children.length === 0 ? (
            <Card className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl mx-auto flex items-center justify-center text-3xl">
                🦁
              </div>
              <h3 className="text-lg font-bold text-slate-900">No child profiles created yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create a child profile using just a display nickname and age band to start safe learning.
              </p>
              <Link href="/parent/children">
                <Button variant="primary" size="md" className="font-bold">
                  Add First Child Profile
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {children.map((child: any) => {
                const spent = child.screenTime?.minutesSpentToday || 0;
                const limit = child.dailyScreenTimeMinutes;
                const pct = Math.min(100, Math.round((spent / limit) * 100));

                return (
                  <Card key={child.id} variant="kid" className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl shadow-inner">
                          {child.avatar === 'lion' ? '🦁' : child.avatar === 'elephant' ? '🐘' : '🐒'}
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-900">{child.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant={child.ageBand === 'BAND_3_5' ? 'blue' : 'purple'}>
                              {child.ageBand === 'BAND_3_5' ? 'Ages 3–5' : 'Ages 6–8'}
                            </Badge>
                            <span className="text-xs font-semibold text-slate-500">
                              {child.preferredLanguage === 'HINDI' ? 'हिंदी (Hindi)' : 'English'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Launch Child Mode button */}
                      <Link href={`/child/${child.id}`}>
                        <Button variant="kid-sunny" size="sm" className="font-black text-xs px-3 shadow-md">
                          <Play className="w-3.5 h-3.5 mr-1 fill-current" /> Launch Child Mode
                        </Button>
                      </Link>
                    </div>

                    {/* Screen-Time Gauge */}
                    <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-500" /> Daily Screen Limit
                        </span>
                        <span>
                          {spent} / {limit} mins ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all ${pct >= 100 ? 'bg-rose-500' : 'bg-amber-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>{child.screenTime?.remainingMinutes} mins left today</span>
                        <span>Break reminder every {child.breakReminderMinutes}m</span>
                      </div>
                    </div>

                    {/* Coin Ledger and Progress Snapshot */}
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                        <span className="text-[11px] font-bold text-amber-800 block">Available Coins</span>
                        <span className="text-xl font-black text-amber-950 flex items-center justify-center gap-1 mt-0.5">
                          🪙 {child.coinBalance}
                        </span>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200">
                        <span className="text-[11px] font-bold text-blue-800 block">Activities Completed</span>
                        <span className="text-xl font-black text-blue-950 mt-0.5 block">
                          ⭐ {child.totalActivitiesCompleted || 0}
                        </span>
                      </div>
                    </div>

                    {/* Recent Activities List */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                        Recent Learning Attempts
                      </span>
                      {child.recentAttempts && child.recentAttempts.length > 0 ? (
                        <div className="space-y-1.5">
                          {child.recentAttempts.map((att: any) => (
                            <div
                              key={att.id}
                              className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200"
                            >
                              <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                                {att.activity?.title || 'Interactive Quiz'}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-600">
                                  {att.score}/{att.maxScore}
                                </span>
                                {att.passed ? (
                                  <Badge variant="emerald">Passed</Badge>
                                ) : (
                                  <Badge variant="slate">Practiced</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic py-2">No learning activities recorded yet.</p>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs font-bold">
                      <Link
                        href={`/parent/content?childId=${child.id}`}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Video className="w-3.5 h-3.5" /> Curate Content
                      </Link>
                      <Link
                        href={`/parent/children`}
                        className="text-slate-600 hover:text-slate-900"
                      >
                        Adjust Limits →
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
