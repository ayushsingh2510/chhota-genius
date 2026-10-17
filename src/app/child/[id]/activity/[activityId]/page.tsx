'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { Navbar } from '@/components/shared/navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, CheckCircle2, RotateCcw, Award } from 'lucide-react';

interface RouteProps {
  params: { id: string; activityId: string };
}

export default function ActivityPlayerPage({ params }: RouteProps) {
  const router = useRouter();
  const { id: childId, activityId } = params;

  const [activity, setActivity] = useState<any>(null);
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Child selections state: keyed by question ID or leftId or item ID
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [matchingSelectedLeft, setMatchingSelectedLeft] = useState<string | null>(null);

  // Result state
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchActivity();
  }, [childId, activityId]);

  async function fetchActivity() {
    try {
      const [resChild, resActs] = await Promise.all([
        fetch(`/api/parent/children/${childId}`),
        fetch(`/api/child/${childId}/activities`),
      ]);

      const childJson = await resChild.json();
      const actsJson = await resActs.json();

      setChild(childJson.child || { id: childId, name: 'Child', coinBalance: 15 });

      const found = (actsJson.activities || []).find((a: any) => a.id === activityId);
      setActivity(found);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectQuizOption(questionId: string, optionId: string) {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  function handleMatchingClick(side: 'left' | 'right', id: string) {
    if (result) return;
    if (side === 'left') {
      setMatchingSelectedLeft(id);
    } else if (side === 'right' && matchingSelectedLeft) {
      setAnswers((prev) => ({ ...prev, [matchingSelectedLeft]: id }));
      setMatchingSelectedLeft(null);
    }
  }

  function handleSortItem(itemId: string, categoryId: string) {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [itemId]: categoryId }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/child/${childId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId,
          answers,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setResult(data);

      if (data.passed) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setAnswers({});
    setMatchingSelectedLeft(null);
    setResult(null);
  }

  if (loading || !activity) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <div className="text-6xl animate-bounce">⭐</div>
          <h2 className="text-xl font-black text-amber-950">Loading Activity...</h2>
        </div>
      </div>
    );
  }

  const { activityType, publicData } = activity;

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/70 pb-16">
      <Navbar
        user={null}
        activeChild={{
          id: childId,
          name: child?.name || 'Child',
          avatar: child?.avatar || 'lion',
          coins: result ? result.newBalance : child?.coinBalance || 0,
        }}
      />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 w-full">
        <Link
          href={`/child/${childId}`}
          className="inline-flex items-center gap-2 text-sm font-black text-amber-950 bg-white/80 px-4 py-2 rounded-2xl border-2 border-amber-300 hover:bg-white shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Learning Hub
        </Link>

        {/* Activity Title Banner */}
        <div className="bg-white rounded-4xl p-6 sm:p-8 shadow-kid-card border-4 border-amber-300 space-y-2 text-center">
          <Badge variant="blue" className="text-xs">
            {activity.category} • {activityType}
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{activity.title}</h1>
          <p className="text-sm font-bold text-amber-900">{activity.instructions}</p>
        </div>

        {/* Result Feedback Banner */}
        {result && (
          <div
            className={`p-6 rounded-4xl border-4 text-center space-y-3 animate-fadeIn shadow-lg ${
              result.passed
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                : 'bg-amber-100 border-amber-400 text-amber-950'
            }`}
          >
            <div className="text-5xl">{result.passed ? '🏆' : '🌟'}</div>
            <h2 className="text-2xl font-black">{result.feedback?.message}</h2>

            {result.rewardAwarded && (
              <div className="inline-flex items-center gap-2 bg-amber-400 px-4 py-2 rounded-2xl font-black text-amber-950 shadow-md">
                <Sparkles className="w-5 h-5" /> +{result.coinsEarned} Chhota Coins Added to Ledger!
              </div>
            )}

            <div className="flex justify-center gap-3 pt-3">
              <Button variant="outline" size="md" onClick={handleReset} className="font-black text-sm">
                <RotateCcw className="w-4 h-4 mr-1.5" /> Play Again
              </Button>
              <Link href={`/child/${childId}`}>
                <Button variant="kid-sunny" size="md" className="font-black text-sm">
                  Choose Another Game 🚀
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* 1. QUIZ TYPE */}
        {activityType === 'QUIZ' && publicData?.questions && (
          <div className="space-y-6">
            {publicData.questions.map((q: any, qIdx: number) => {
              const selectedOptionId = answers[q.id];
              const detail = result?.feedback?.details?.find((d: any) => d.id === q.id);

              return (
                <Card key={q.id} variant="kid" className="space-y-5 bg-white border-4 border-amber-200">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 font-black text-sm flex items-center justify-center">
                      {qIdx + 1}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900">{q.prompt}</h3>
                  </div>

                  {q.illustration && (
                    <div className="text-6xl text-center py-2 bg-slate-50 rounded-3xl border border-slate-100">
                      {q.illustration}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {q.options.map((opt: any) => {
                      const isSelected = selectedOptionId === opt.id;
                      return (
                        <button
                          key={opt.id}
                          disabled={!!result}
                          onClick={() => handleSelectQuizOption(q.id, opt.id)}
                          className={`kid-touch-target p-5 rounded-3xl font-black text-base flex flex-col items-center justify-center gap-2 border-4 transition transform active:scale-95 ${
                            isSelected
                              ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-kid-button scale-102'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300 shadow-xs'
                          }`}
                        >
                          {opt.icon && <span className="text-4xl">{opt.icon}</span>}
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {detail && detail.explanation && (
                    <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-xs font-bold text-blue-900">
                      💡 {detail.explanation}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* 2. MATCHING TYPE */}
        {activityType === 'MATCHING' && publicData?.pairs && (
          <Card variant="kid" className="space-y-6 bg-white border-4 border-amber-200">
            <p className="text-xs font-bold text-slate-500 text-center">
              1. Tap an animal on the left. 2. Tap its home on the right!
            </p>

            <div className="grid grid-cols-2 gap-6">
              {/* Left Side */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase text-slate-500 block text-center">Animals</span>
                {publicData.pairs.map((p: any) => {
                  const isSelected = matchingSelectedLeft === p.leftId;
                  const isMatched = !!answers[p.leftId];
                  return (
                    <button
                      key={p.leftId}
                      disabled={!!result}
                      onClick={() => handleMatchingClick('left', p.leftId)}
                      className={`kid-touch-target w-full p-4 rounded-3xl font-black text-base text-center border-4 transition ${
                        isSelected
                          ? 'border-blue-600 bg-blue-100 shadow-md scale-102'
                          : isMatched
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-950'
                          : 'border-slate-200 bg-white hover:border-amber-300'
                      }`}
                    >
                      {p.left} {isMatched && '✓'}
                    </button>
                  );
                })}
              </div>

              {/* Right Side */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase text-slate-500 block text-center">Homes</span>
                {publicData.pairs.map((p: any) => {
                  return (
                    <button
                      key={p.rightId}
                      disabled={!!result}
                      onClick={() => handleMatchingClick('right', p.rightId)}
                      className={`kid-touch-target w-full p-4 rounded-3xl font-black text-base text-center border-4 transition bg-white hover:border-amber-400 border-slate-200`}
                    >
                      {p.right}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {/* 3. SORTING TYPE */}
        {activityType === 'SORTING' && publicData?.items && (
          <div className="space-y-6">
            <Card variant="kid" className="space-y-6 bg-white border-4 border-amber-200">
              <span className="text-xs font-bold text-slate-500 block text-center">
                Tap each habit to sort it into Healthy or Sometimes Treat!
              </span>

              <div className="space-y-4">
                {publicData.items.map((it: any) => {
                  const selectedCategory = answers[it.id];
                  return (
                    <div
                      key={it.id}
                      className="p-4 rounded-3xl bg-slate-50 border-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3"
                    >
                      <span className="text-base font-black text-slate-800">{it.label}</span>
                      <div className="flex gap-2">
                        {publicData.categories.map((cat: any) => {
                          const isPicked = selectedCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              disabled={!!result}
                              onClick={() => handleSortItem(it.id, cat.id)}
                              className={`kid-touch-target px-4 py-2 rounded-2xl font-black text-xs border-2 transition ${
                                isPicked
                                  ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-sm'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                              }`}
                            >
                              {cat.name} {isPicked && '⭐'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* Submit Button */}
        {!result && (
          <div className="pt-4 text-center">
            <Button
              variant="kid-sunny"
              size="kid-lg"
              className="text-xl font-black px-12 shadow-xl"
              onClick={handleSubmit}
              isLoading={submitting}
            >
              Check My Answers! ✨
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
