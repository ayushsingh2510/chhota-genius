'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Gift,
  BookOpen,
  Sun,
  Palette,
  Sparkles,
  Heart,
  Clock,
  AlertCircle,
} from 'lucide-react';

export default function ParentRewardsPage() {
  const [parent, setParent] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'OFFLINE_TREAT' | 'STORYBOOK' | 'ART_SUPPLIES' | 'FAMILY_ACTIVITY'>('OFFLINE_TREAT');
  const [coinCost, setCoinCost] = useState(20);
  const [icon, setIcon] = useState('gift');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Decision State
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [resParent, resRewards, resRedemptions] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/parent/rewards'),
        fetch('/api/parent/redemptions'),
      ]);
      const parentJson = await resParent.json();
      const rewardsJson = await resRewards.json();
      const redemptionsJson = await resRedemptions.json();

      setParent(parentJson.parent);
      setRewards(rewardsJson.rewards || []);
      setRedemptions(redemptionsJson.redemptions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateReward(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/parent/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          coinCost: Number(coinCost),
          icon,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create reward');

      setShowModal(false);
      setTitle('');
      setDescription('');
      setCoinCost(20);
      await fetchData();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteReward(rewardId: string) {
    if (!confirm('Are you sure you want to delete this reward from your catalogue?')) return;
    try {
      const res = await fetch(`/api/parent/rewards/${rewardId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete reward');
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleRedemptionDecision(redemptionId: string, decision: 'APPROVE' | 'REJECT') {
    setActionLoading(redemptionId);
    try {
      const res = await fetch('/api/parent/redemptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redemptionId, decision }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Decision failed');

      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  const pendingList = redemptions.filter((r) => r.status === 'REQUESTED');
  const pastList = redemptions.filter((r) => r.status !== 'REQUESTED');

  const iconOptions = [
    { id: 'gift', label: 'Gift', icon: Gift },
    { id: 'book-open', label: 'Storybook', icon: BookOpen },
    { id: 'sun', label: 'Park/Outdoors', icon: Sun },
    { id: 'palette', label: 'Art/Crafts', icon: Palette },
    { id: 'sparkles', label: 'Treat/Baking', icon: Sparkles },
    { id: 'heart', label: 'Family Time', icon: Heart },
  ];

  function renderRewardIcon(iconName: string) {
    switch (iconName) {
      case 'book-open':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'sun':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'palette':
        return <Palette className="w-5 h-5 text-purple-600" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-amber-600" />;
      case 'heart':
        return <Heart className="w-5 h-5 text-rose-500" />;
      default:
        return <Gift className="w-5 h-5 text-emerald-600" />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar user={parent} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
        <div>
          <Link href="/parent/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Parent Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Parent Reward Catalogue</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Customize real-world family rewards that your children can earn through educational learning activities.
              </p>
            </div>
            <Button variant="primary" size="md" onClick={() => setShowModal(true)} className="font-bold">
              <Plus className="w-4 h-4 mr-1.5" /> Add Real-World Reward
            </Button>
          </div>
        </div>

        {/* Pending Redemptions Section */}
        {pendingList.length > 0 && (
          <div className="bg-amber-50 rounded-3xl p-6 border-2 border-amber-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-amber-600" />
                <h3 className="text-base font-black text-amber-950">
                  Pending Redemptions Awaiting Your Approval ({pendingList.length})
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-800">Server-Authoritative Ledger</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingList.map((red) => (
                <div key={red.id} className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-black text-blue-600 uppercase">{red.child?.name}&apos;s Request</span>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5">{red.reward?.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{red.reward?.description}</p>
                    <span className="text-xs font-black text-amber-800 mt-2 block">
                      Cost: 🪙 {red.coinCost} Coins
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRedemptionDecision(red.id, 'REJECT')}
                      disabled={actionLoading === red.id}
                      className="text-xs font-bold text-rose-600 hover:bg-rose-50"
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

        {/* Reward Catalogue Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Reward Catalogue</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <Card key={reward.id} variant="kid" className="space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center border border-amber-300">
                      {renderRewardIcon(reward.icon)}
                    </div>
                    <button
                      onClick={() => handleDeleteReward(reward.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Reward"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900">{reward.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{reward.description}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Badge variant="amber">{reward.category}</Badge>
                  <span className="text-sm font-black text-amber-950 flex items-center gap-1">
                    🪙 {reward.coinCost} Coins
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Past Decisions History */}
        {pastList.length > 0 && (
          <div className="space-y-4 pt-6">
            <h2 className="text-lg font-bold text-slate-900">Recent Redemption History</h2>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold">
                  <tr>
                    <th className="px-4 py-3">Child</th>
                    <th className="px-4 py-3">Reward</th>
                    <th className="px-4 py-3">Cost</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {pastList.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-bold">{item.child?.name}</td>
                      <td className="px-4 py-3 font-semibold">{item.reward?.title}</td>
                      <td className="px-4 py-3 font-black text-amber-900">🪙 {item.coinCost}</td>
                      <td className="px-4 py-3">
                        <Badge variant={item.status === 'APPROVED' ? 'emerald' : 'rose'}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{new Date(item.requestedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Add Real-World Reward */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-slate-100">
              <h2 className="text-xl font-black text-slate-900 mb-1">Add Offline Family Reward</h2>
              <p className="text-xs text-slate-500 mb-4 font-medium">
                Create a meaningful real-world activity, story, or treat.
              </p>

              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateReward} className="space-y-4">
                <Input
                  label="Reward Title"
                  required
                  placeholder="e.g. Visit the Zoo, Extra Bedtime Story"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <Input
                  label="Description"
                  required
                  placeholder="Brief details about the family activity or offline treat"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-white text-slate-900"
                  >
                    <option value="OFFLINE_TREAT">Offline Treat / Cooking</option>
                    <option value="STORYBOOK">Storybook / Bedtime Reading</option>
                    <option value="ART_SUPPLIES">Art Supplies & Sketchbooks</option>
                    <option value="FAMILY_ACTIVITY">Family Outing & Park Visit</option>
                  </select>
                </div>

                {/* Coin Cost */}
                <Input
                  label="Coin Cost (Bounded: 5–100)"
                  type="number"
                  min={5}
                  max={100}
                  required
                  value={coinCost}
                  onChange={(e) => setCoinCost(Number(e.target.value))}
                  helperText="Children earn ~5 coins per completed educational activity"
                />

                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Icon</label>
                  <div className="grid grid-cols-6 gap-2">
                    {iconOptions.map((opt) => {
                      const IconComp = opt.icon;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setIcon(opt.id)}
                          className={`p-2.5 rounded-xl border-2 flex items-center justify-center transition ${
                            icon === opt.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200'
                          }`}
                        >
                          <IconComp className="w-5 h-5 text-slate-700" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-100">
                  <Button type="button" variant="outline" className="flex-1 font-bold" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1 font-bold" isLoading={submitting}>
                    Add to Catalogue
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
