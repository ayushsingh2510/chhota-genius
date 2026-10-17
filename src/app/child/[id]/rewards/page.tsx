'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Award, Sparkles, CheckCircle2, Gift, Sun, BookOpen, Palette } from 'lucide-react';

interface RouteProps {
  params: { id: string };
}

export default function ChildRewardsPage({ params }: RouteProps) {
  const childId = params.id;
  const [child, setChild] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchRewards();
  }, [childId]);

  async function fetchRewards() {
    try {
      const [resChild, resRewards] = await Promise.all([
        fetch(`/api/parent/children/${childId}`),
        fetch(`/api/child/${childId}/rewards`),
      ]);

      const childJson = await resChild.json();
      const rewardsJson = await resRewards.json();

      setChild(childJson.child || { id: childId, name: 'Child' });
      setRewards(rewardsJson.rewards || []);
      setBalance(rewardsJson.currentBalance || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestReward(rewardId: string) {
    setRequestingId(rewardId);
    setMessage(null);
    try {
      const res = await fetch(`/api/child/${childId}/rewards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request reward');

      setMessage(data.message);
      await fetchRewards();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRequestingId(null);
    }
  }

  function renderIcon(icon: string) {
    switch (icon) {
      case 'book-open':
        return '📖';
      case 'sun':
        return '🏞️';
      case 'palette':
        return '🎨';
      case 'sparkles':
        return '🍪';
      default:
        return '🎁';
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <div className="text-6xl animate-bounce">🎁</div>
          <h2 className="text-xl font-black text-amber-950">Opening Rewards Store...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/70 pb-16">
      <Navbar
        user={null}
        activeChild={{
          id: childId,
          name: child?.name || 'Child',
          avatar: child?.avatar || 'lion',
          coins: balance,
        }}
      />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 w-full">
        <Link
          href={`/child/${childId}`}
          className="inline-flex items-center gap-2 text-sm font-black text-amber-950 bg-white/80 px-4 py-2 rounded-2xl border-2 border-amber-300 hover:bg-white shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Learning Hub
        </Link>

        {/* Big Balance Showcase */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 rounded-4xl p-6 sm:p-8 border-4 border-amber-500 shadow-kid-card flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-amber-950">Virtual Reward Store</span>
            <h1 className="text-2xl sm:text-4xl font-black text-amber-950 tracking-tight">
              Real-World Family Treats 🎁
            </h1>
            <p className="text-xs sm:text-sm font-bold text-amber-900">
              Exchange the coins you earned by finishing quizzes for offline surprises approved by Mom & Dad!
            </p>
          </div>

          <div className="bg-white/95 px-6 py-4 rounded-3xl border-3 border-amber-500 shadow-md text-center shrink-0">
            <span className="text-xs font-bold text-slate-500 block">Your Coin Balance</span>
            <span className="text-3xl font-black text-amber-950 flex items-center justify-center gap-1 mt-0.5">
              🪙 {balance} Coins
            </span>
          </div>
        </div>

        {message && (
          <div className="p-4 rounded-3xl bg-emerald-100 border-3 border-emerald-400 text-emerald-950 text-center font-bold text-sm shadow-md animate-fadeIn">
            🎉 {message}
          </div>
        )}

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((rew) => {
            const hasEnough = balance >= rew.coinCost;
            const isRequesting = requestingId === rew.id;

            return (
              <Card
                key={rew.id}
                variant="kid"
                className={`flex flex-col justify-between border-4 transition ${
                  hasEnough ? 'border-amber-400 bg-white' : 'border-slate-200 bg-slate-50/70 opacity-90'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">{renderIcon(rew.icon)}</span>
                    <Badge variant={hasEnough ? 'amber' : 'slate'} className="font-black text-xs">
                      🪙 {rew.coinCost} Coins
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900">{rew.title}</h3>
                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">{rew.description}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Button
                    variant={hasEnough ? 'kid-coral' : 'outline'}
                    size="md"
                    className="w-full font-black text-xs sm:text-sm shadow-sm"
                    disabled={!hasEnough || isRequesting}
                    isLoading={isRequesting}
                    onClick={() => handleRequestReward(rew.id)}
                  >
                    {hasEnough ? 'Ask Parent for This Reward ✨' : `Need ${rew.coinCost - balance} More Coins`}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
