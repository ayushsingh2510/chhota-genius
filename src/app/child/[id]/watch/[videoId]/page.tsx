'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Pause, RotateCcw, HelpCircle, CheckCircle2 } from 'lucide-react';

interface RouteProps {
  params: { id: string; videoId: string };
}

export default function WatchVideoPage({ params }: RouteProps) {
  const { id: childId, videoId } = params;
  const [video, setVideo] = useState<any>(null);
  const [child, setChild] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressSeconds, setProgressSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [askHelp, setAskHelp] = useState(false);

  useEffect(() => {
    fetchVideoDetails();
  }, [childId, videoId]);

  // Video playback simulation timer
  useEffect(() => {
    let timer: any;
    if (isPlaying && video) {
      timer = setInterval(() => {
        setProgressSeconds((prev) => {
          if (prev >= video.durationSeconds) {
            setIsPlaying(false);
            return video.durationSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, video]);

  async function fetchVideoDetails() {
    try {
      const [resChild, resContent] = await Promise.all([
        fetch(`/api/parent/children/${childId}`),
        fetch(`/api/child/${childId}/content`),
      ]);
      const childJson = await resChild.json();
      const contentJson = await resContent.json();

      setChild(childJson.child || { id: childId, name: 'Child', coinBalance: 15 });

      const found = (contentJson.content || []).find((v: any) => v.id === videoId);
      setVideo(found);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !video) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center text-white">
        <div className="space-y-4">
          <div className="text-6xl animate-bounce">📺</div>
          <h2 className="text-xl font-black">Loading Safe Video...</h2>
        </div>
      </div>
    );
  }

  const duration = video.durationSeconds || 180;
  const progressPct = Math.min(100, Math.round((progressSeconds / duration) * 100));

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      {/* Top Header */}
      <header className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <Link
          href={`/child/${childId}`}
          className="inline-flex items-center gap-2 text-xs font-black text-amber-400 bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 hover:bg-slate-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Learning Hub
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="blue">{video.category}</Badge>
          <span className="text-xs font-bold text-slate-400">
            {video.language === 'HINDI' ? 'हिंदी (Hindi)' : 'English'}
          </span>
        </div>

        <button
          onClick={() => setAskHelp(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Ask Parent</span>
        </button>
      </header>

      {/* Main Video Stage */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
        <div className="w-full aspect-video bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 rounded-4xl border-4 border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between p-6">
          {/* Top Info inside player */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider">Parent-Approved Safe Stream</span>
            <span className="text-xs font-bold bg-black/60 px-3 py-1 rounded-full border border-slate-700">
              {Math.floor(progressSeconds / 60)}:{(progressSeconds % 60).toString().padStart(2, '0')} /{' '}
              {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
            </span>
          </div>

          {/* Center Playback Animation / Icon */}
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-24 h-24 rounded-full bg-amber-400 hover:bg-amber-300 text-amber-950 flex items-center justify-center shadow-2xl transition transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? <Pause className="w-12 h-12 fill-current" /> : <Play className="w-12 h-12 fill-current ml-2" />}
            </button>
            <h2 className="text-xl sm:text-2xl font-black text-white max-w-lg">{video.title}</h2>
          </div>

          {/* Bottom Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
              <div className="bg-amber-400 h-3 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
              <span>{isPlaying ? '▶ Playing educational video' : '⏸ Paused'}</span>
              <span>Signed Token Active</span>
            </div>
          </div>
        </div>

        {/* Video Notes & Safety Banner */}
        <div className="w-full p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
          <p>{video.description}</p>
          <span className="text-[11px] font-bold text-amber-400 ml-4 shrink-0">Zero External Links</span>
        </div>
      </main>

      {/* Ask Parent Help Modal */}
      {askHelp && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-slate-900 text-white rounded-5xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-amber-400 space-y-4">
            <div className="text-6xl">👨‍👩‍👧</div>
            <h3 className="text-2xl font-black">Call Mom or Dad</h3>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Whenever you have questions or want to ask about what you learned, ask your parent or guardian to join you!
            </p>
            <Button
              variant="kid-sunny"
              size="lg"
              className="w-full font-black text-amber-950"
              onClick={() => setAskHelp(false)}
            >
              Okay! 👍
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
