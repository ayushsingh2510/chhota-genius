'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Edit2, Trash2, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function ParentChildrenPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [parent, setParent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChild, setEditingChild] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('lion');
  const [ageBand, setAgeBand] = useState<'BAND_3_5' | 'BAND_6_8'>('BAND_3_5');
  const [preferredLanguage, setPreferredLanguage] = useState<'ENGLISH' | 'HINDI'>('ENGLISH');
  const [dailyScreenTimeMinutes, setDailyScreenTimeMinutes] = useState(30);
  const [breakReminderMinutes, setBreakReminderMinutes] = useState(15);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [resParent, resChildren] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/parent/children'),
      ]);
      const parentJson = await resParent.json();
      const childrenJson = await resChildren.json();

      setParent(parentJson.parent);
      setChildren(childrenJson.children || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingChild(null);
    setName('');
    setAvatar('lion');
    setAgeBand('BAND_3_5');
    setPreferredLanguage('ENGLISH');
    setDailyScreenTimeMinutes(30);
    setBreakReminderMinutes(15);
    setFormError('');
    setShowModal(true);
  }

  function openEditModal(child: any) {
    setEditingChild(child);
    setName(child.name);
    setAvatar(child.avatar);
    setAgeBand(child.ageBand);
    setPreferredLanguage(child.preferredLanguage);
    setDailyScreenTimeMinutes(child.dailyScreenTimeMinutes);
    setBreakReminderMinutes(child.breakReminderMinutes);
    setFormError('');
    setShowModal(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        name,
        avatar,
        ageBand,
        preferredLanguage,
        dailyScreenTimeMinutes: Number(dailyScreenTimeMinutes),
        breakReminderMinutes: Number(breakReminderMinutes),
      };

      let res;
      if (editingChild) {
        res = await fetch(`/api/parent/children/${editingChild.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/parent/children', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save profile');

      setShowModal(false);
      await fetchData();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(childId: string, childName: string) {
    if (!confirm(`Are you sure you want to delete profile "${childName}"? This will permanently delete their history, coin ledger, and approved activities.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/parent/children/${childId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Deletion failed');
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  }

  const avatarList = [
    { id: 'lion', emoji: '🦁', label: 'Lion' },
    { id: 'elephant', emoji: '🐘', label: 'Elephant' },
    { id: 'monkey', emoji: '🐒', label: 'Monkey' },
    { id: 'peacock', emoji: '🦚', label: 'Peacock' },
    { id: 'tiger', emoji: '🐯', label: 'Tiger' },
    { id: 'rabbit', emoji: '🐰', label: 'Rabbit' },
  ];

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
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Children Profiles & Limits</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Configure nickname, age band, daily screen-time allowance, and break intervals.
              </p>
            </div>
            <Button variant="primary" size="md" onClick={openCreateModal} className="font-bold">
              <Plus className="w-4 h-4 mr-1.5" /> Add Child Profile
            </Button>
          </div>
        </div>

        {/* Children Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <Card key={child.id} variant="kid" className="space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 rounded-3xl bg-amber-100 flex items-center justify-center text-4xl shadow-inner border border-amber-300">
                    {avatarList.find((a) => a.id === child.avatar)?.emoji || '🦁'}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(child)}
                      className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(child.id, child.name)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200"
                      title="Delete Profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900">{child.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={child.ageBand === 'BAND_3_5' ? 'blue' : 'purple'}>
                      {child.ageBand === 'BAND_3_5' ? 'Age 3–5 Band' : 'Age 6–8 Band'}
                    </Badge>
                    <Badge variant="amber">{child.preferredLanguage === 'HINDI' ? 'हिंदी (Hindi)' : 'English'}</Badge>
                  </div>
                </div>

                <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" /> Daily Screen Limit:
                    </span>
                    <span>{child.dailyScreenTimeMinutes} minutes</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Break Reminder:</span>
                    <span>Every {child.breakReminderMinutes} minutes</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-700 pt-1 border-t border-slate-200">
                    <span>Current Coin Balance:</span>
                    <span className="text-amber-900">🪙 {child.coinBalance} Coins</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Link href={`/child/${child.id}`} className="flex-1">
                  <Button variant="kid-sunny" size="sm" className="w-full font-bold text-xs">
                    Launch Child Mode
                  </Button>
                </Link>
                <Link href={`/parent/content?childId=${child.id}`}>
                  <Button variant="outline" size="sm" className="font-bold text-xs">
                    Content
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Minimal Data Collection Notice */}
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 flex items-start gap-3 text-xs leading-relaxed font-medium">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Privacy Architecture Principle</span>
            We strictly request only a display nickname and broad age band. No legal surnames, birthdates, photographs, or contact numbers are ever required or stored.
          </div>
        </div>

        {/* Modal: Create or Edit Child Profile */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-4 border-slate-100 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-black text-slate-900 mb-1">
                {editingChild ? `Edit Profile: ${editingChild.name}` : 'Add New Child Profile'}
              </h2>
              <p className="text-xs text-slate-500 mb-4 font-medium">
                Set age-appropriate educational categories and screen-time boundaries.
              </p>

              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs font-bold text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <Input
                  label="Child Display Nickname"
                  required
                  placeholder="e.g. Aarav, Ananya, Kabir"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  helperText="Use a friendly nickname only, not a legal full name."
                />

                {/* Avatar Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Choose Friendly Avatar</label>
                  <div className="grid grid-cols-6 gap-2">
                    {avatarList.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setAvatar(av.id)}
                        className={`p-2.5 rounded-2xl text-2xl flex flex-col items-center border-2 transition ${
                          avatar === av.id
                            ? 'border-blue-600 bg-blue-50 shadow-sm scale-105'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span>{av.emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age Band Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Developmental Age Band</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAgeBand('BAND_3_5')}
                      className={`p-3 rounded-2xl border-2 text-left transition ${
                        ageBand === 'BAND_3_5' ? 'border-blue-600 bg-blue-50' : 'border-slate-200'
                      }`}
                    >
                      <span className="block font-bold text-sm text-slate-900">Ages 3–5</span>
                      <span className="block text-xs text-slate-500 mt-0.5">Phonics, counting, animal homes, colors</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAgeBand('BAND_6_8')}
                      className={`p-3 rounded-2xl border-2 text-left transition ${
                        ageBand === 'BAND_6_8' ? 'border-blue-600 bg-blue-50' : 'border-slate-200'
                      }`}
                    >
                      <span className="block font-bold text-sm text-slate-900">Ages 6–8</span>
                      <span className="block text-xs text-slate-500 mt-0.5">Solar system, Hindi varnamala, healthy habits</span>
                    </button>
                  </div>
                </div>

                {/* Preferred Language */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Preferred Content Language</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPreferredLanguage('ENGLISH')}
                      className={`p-2.5 rounded-xl border-2 text-center text-xs font-bold ${
                        preferredLanguage === 'ENGLISH' ? 'border-amber-500 bg-amber-50 text-amber-950' : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreferredLanguage('HINDI')}
                      className={`p-2.5 rounded-xl border-2 text-center text-xs font-bold ${
                        preferredLanguage === 'HINDI' ? 'border-amber-500 bg-amber-50 text-amber-950' : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      हिंदी (Hindi)
                    </button>
                  </div>
                </div>

                {/* Daily Screen Time and Break Reminder */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Daily Limit (Minutes)"
                    type="number"
                    min={10}
                    max={120}
                    value={dailyScreenTimeMinutes}
                    onChange={(e) => setDailyScreenTimeMinutes(Number(e.target.value))}
                    helperText="Recommended 20–45 mins"
                  />

                  <Input
                    label="Break Reminder (Mins)"
                    type="number"
                    min={5}
                    max={60}
                    value={breakReminderMinutes}
                    onChange={(e) => setBreakReminderMinutes(Number(e.target.value))}
                    helperText="Pause & stretch interval"
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-100">
                  <Button type="button" variant="outline" className="flex-1 font-bold" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1 font-bold" isLoading={submitting}>
                    {editingChild ? 'Save Changes' : 'Create Profile'}
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
