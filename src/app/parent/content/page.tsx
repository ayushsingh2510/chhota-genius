'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Video, CheckCircle2, XCircle, Filter, Sparkles, Shield, Play } from 'lucide-react';

function ParentContentInner() {
  const searchParams = useSearchParams();
  const initialChildId = searchParams.get('childId');

  const [parent, setParent] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>(initialChildId || '');
  const [contentList, setContentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchInitial();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      fetchChildApprovals(selectedChildId);
    }
  }, [selectedChildId]);

  async function fetchInitial() {
    try {
      const [resParent, resChildren] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/parent/children'),
      ]);
      const parentJson = await resParent.json();
      const childrenJson = await resChildren.json();

      setParent(parentJson.parent);
      const kids = childrenJson.children || [];
      setChildren(kids);

      const targetId = initialChildId || (kids.length > 0 ? kids[0].id : '');
      setSelectedChildId(targetId);

      if (targetId) {
        await fetchChildApprovals(targetId);
      } else {
        // If no kids yet, just fetch all curated content
        const resContent = await fetch('/api/content');
        const contentJson = await resContent.json();
        setContentList(contentJson.content || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchChildApprovals(childId: string) {
    try {
      const res = await fetch(`/api/parent/children/${childId}/approvals`);
      const json = await res.json();
      setContentList(json.content || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleApproval(contentItemId: string, currentlyApproved: boolean) {
    if (!selectedChildId) return;
    setTogglingId(contentItemId);

    try {
      const res = await fetch(`/api/parent/children/${selectedChildId}/approvals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentItemId,
          approved: !currentlyApproved,
        }),
      });

      if (!res.ok) throw new Error('Failed to update approval');

      // Update state locally for instant UI responsiveness
      setContentList((prev) =>
        prev.map((item) => {
          if (item.id === contentItemId) {
            return {
              ...item,
              isApproved: !currentlyApproved,
              approvalStatus: !currentlyApproved ? 'APPROVED' : 'REJECTED',
            };
          }
          return item;
        })
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setTogglingId(null);
    }
  }

  const filteredContent = contentList.filter((item) => {
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    return true;
  });

  const categories = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'ALPHABETS', label: 'Alphabets & Phonics' },
    { id: 'NUMBERS', label: 'Numbers & Counting' },
    { id: 'ANIMALS', label: 'Animals & Nature' },
    { id: 'LANGUAGES', label: 'Languages' },
    { id: 'SCIENCE', label: 'Science & World' },
    { id: 'ART', label: 'Art & Colors' },
    { id: 'GOOD_HABITS', label: 'Good Habits' },
  ];

  const selectedChild = children.find((c) => c.id === selectedChildId);

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
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Curated Educational Library</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Parent-approved video catalog. Content is strictly hidden from your child until you approve it.
              </p>
            </div>
          </div>
        </div>

        {/* Child Selector Tabs */}
        {children.length > 0 && (
          <div className="flex items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl w-fit">
            <span className="text-xs font-bold text-slate-600 px-3">Curating for:</span>
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectedChildId === child.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{child.avatar === 'lion' ? '🦁' : '🐘'}</span>
                <span>{child.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                  {child.ageBand === 'BAND_3_5' ? '3–5' : '6–8'}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                categoryFilter === cat.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => {
            const isApproved = item.isApproved;
            const isToggling = togglingId === item.id;

            return (
              <Card key={item.id} variant="elevated" className="flex flex-col justify-between overflow-hidden border-2 border-slate-200 p-0">
                {/* Fake Video Thumbnail Header */}
                <div className="h-44 bg-gradient-to-tr from-slate-800 to-slate-900 relative p-4 flex flex-col justify-between text-white">
                  <div className="flex items-center justify-between">
                    <Badge variant={item.category === 'ALPHABETS' ? 'amber' : item.category === 'NUMBERS' ? 'blue' : 'purple'}>
                      {item.category}
                    </Badge>
                    <span className="text-[11px] font-bold bg-black/60 px-2 py-0.5 rounded-md">
                      {Math.round(item.durationSeconds / 60)} mins
                    </span>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center backdrop-blur-xs transition transform hover:scale-110 cursor-pointer">
                      <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                    <span>{item.language === 'HINDI' ? 'हिंदी (Hindi)' : 'English'}</span>
                    <span>{item.ageBand === 'BAND_3_5' ? 'Ages 3–5' : 'Ages 6–8'}</span>
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block">Approval Status</span>
                      <span className={`text-xs font-black flex items-center gap-1 ${isApproved ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {isApproved ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-slate-400" />}
                        {isApproved ? 'Approved for Child' : 'Hidden from Child'}
                      </span>
                    </div>

                    <Button
                      variant={isApproved ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleApproval(item.id, !!isApproved)}
                      isLoading={isToggling}
                      className={`text-xs font-bold ${
                        isApproved ? 'text-rose-600 hover:bg-rose-50 hover:border-rose-300' : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      {isApproved ? 'Revoke Approval' : 'Approve for Child'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ParentContentPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <ParentContentInner />
    </React.Suspense>
  );
}
