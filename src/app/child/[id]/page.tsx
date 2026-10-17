'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/shared/navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Play,
  Puzzle,
  Award,
  Clock,
  Heart,
  Volume2,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface RouteProps {
  params: { id: string };
}

export default function ChildModeHubPage({ params }: RouteProps) {
  const router = useRouter();
  const childId = params.id;

  const [child, setChild] = useState<any>(null);
  const [contentList, setContentList] = useState<any[]>([]);
  const [activitiesList, setActivitiesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Screen time session state
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [remainingMinutes, setRemainingMinutes] = useState<number>(30);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionEndedMessage, setSessionEndedMessage] = useState('');
  const [showBreakReminder, setShowBreakReminder] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [askParentHelp, setAskParentHelp] = useState(false);

  useEffect(() => {
    initChildMode();
  }, [childId]);

  // Screen time heartbeat timer (every 30 seconds)
  useEffect(() => {
    if (!sessionToken || sessionEnded) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/child/${childId}/screentime`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken, deltaSeconds: 30 }),
        });
        const status = await res.json();

        if (!status.active) {
          setSessionEnded(true);
          setSessionEndedMessage(status.message || 'Daily screen-time limit reached!');
        } else {
          setRemainingMinutes(Math.ceil(status.remainingSeconds / 60));
          if (status.breakDue) {
            setShowBreakReminder(true);
          }
        }
      } catch (err) {
        console.error('Screen-time heartbeat error:', err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [sessionToken, sessionEnded, childId]);

  async function initChildMode() {
    try {
      // 1. Fetch child profile
      const resChild = await fetch(`/api/parent/children/${childId}`);
      let childData = null;
      if (resChild.ok) {
        const json = await resChild.json();
        childData = json.child;
      } else {
        // Fallback fetch for restricted child mode
        const resMe = await fetch(`/api/auth/me`);
        const jsonMe = await resMe.json();
        childData = { id: childId, name: 'Little Genius', avatar: 'lion', coinBalance: 15, ageBand: 'BAND_3_5' };
      }
      setChild(childData);

      // 2. Start or resume screen-time session
      const resScreen = await fetch(`/api/child/${childId}/screentime`, { method: 'POST' });
      const screenStatus = await resScreen.json();
      if (!screenStatus.allowed) {
        setSessionEnded(true);
        setSessionEndedMessage(screenStatus.message || 'Screen-time limit completed for today.');
      } else {
        setSessionToken(screenStatus.sessionToken);
        setRemainingMinutes(Math.ceil(screenStatus.remainingSeconds / 60));
      }

      // 3. Fetch approved content and activities
      const [resContent, resActs] = await Promise.all([
        fetch(`/api/child/${childId}/content`),
        fetch(`/api/child/${childId}/activities`),
      ]);
      const contentJson = await resContent.json();
      const actsJson = await resActs.json();

      setContentList(contentJson.content || []);
      setActivitiesList(actsJson.activities || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const categoryTabs = [
    { id: 'ALL', label: 'All Fun', emoji: '⭐' },
    { id: 'ALPHABETS', label: 'Letters & ABC', emoji: '🔤' },
    { id: 'NUMBERS', label: 'Numbers 123', emoji: '🔢' },
    { id: 'ANIMALS', label: 'Animals', emoji: '🦁' },
    { id: 'LANGUAGES', label: 'Languages', emoji: '🗣️' },
    { id: 'SCIENCE', label: 'Science', emoji: '🚀' },
    { id: 'ART', label: 'Art & Colors', emoji: '🎨' },
    { id: 'GOOD_HABITS', label: 'Good Habits', emoji: '🪥' },
  ];

  const filteredContent = contentList.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    return true;
  });

  const filteredActivities = activitiesList.filter((act) => {
    if (selectedCategory !== 'ALL' && act.category !== selectedCategory) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <div className="text-6xl animate-bounce">🦁</div>
          <h2 className="text-2xl font-black text-amber-950">Getting ready for play & learning...</h2>
        </div>
      </div>
    );
  }

  // Session-end screen
  if (sessionEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-100 to-sky-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-5xl p-8 sm:p-12 max-w-lg w-full text-center shadow-2xl border-6 border-amber-300 space-y-6">
          <div className="text-7xl">🌅</div>
          <h1 className="text-3xl font-black text-slate-900">Great Job Today!</h1>
          <p className="text-base text-slate-700 leading-relaxed font-semibold">
            {sessionEndedMessage || 'You have finished your screen time for today. Your eyes worked super hard!'}
          </p>

          <div className="p-4 bg-amber-50 rounded-3xl border-2 border-amber-200 text-xs text-amber-900 font-bold space-y-1">
            <span>✨ Fun Offline Ideas:</span>
            <p className="text-slate-600 font-medium">Draw a picture with crayons, read a storybook, or play outside!</p>
          </div>

          <div className="pt-2">
            <Link href="/">
              <Button variant="kid-sunny" size="kid-lg" className="w-full text-lg font-black">
                Done for Today 👋
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/60 pb-16">
      <Navbar
        user={null}
        activeChild={{
          id: child?.id || childId,
          name: child?.name || 'Child',
          avatar: child?.avatar || 'lion',
          coins: child?.coinBalance || 0,
          remainingMinutes,
        }}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 w-full">
        {/* Child Welcome Banner */}
        <div className="bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 rounded-4xl p-6 sm:p-8 shadow-kid-card border-4 border-amber-400 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-20 h-20 rounded-3xl bg-white/90 flex items-center justify-center text-5xl shadow-md border-2 border-amber-400">
              {child?.avatar === 'lion' ? '🦁' : child?.avatar === 'elephant' ? '🐘' : '🐒'}
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-900">Welcome, Little Star!</span>
              <h1 className="text-2xl sm:text-4xl font-black text-amber-950 tracking-tight">
                Namaste, {child?.name || 'Friend'}! 🌟
              </h1>
              <p className="text-xs sm:text-sm font-bold text-amber-900 mt-1">
                What would you like to explore and learn today?
              </p>
            </div>
          </div>

          {/* Quick Actions in banner: Rewards catalogue shortcut */}
          <div className="flex items-center gap-3">
            <Link href={`/child/${childId}/rewards`}>
              <Button variant="kid-coral" size="lg" className="font-black text-sm sm:text-base shadow-md">
                <Award className="w-5 h-5 mr-1.5" /> Rewards Store
              </Button>
            </Link>
            <button
              onClick={() => setAskParentHelp(true)}
              className="p-3 bg-white/80 hover:bg-white text-slate-700 rounded-2xl border-2 border-amber-400 font-bold text-xs flex items-center gap-1 shadow-sm"
              title="Ask Parent for Help"
            >
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <span className="hidden sm:inline">Ask Parent</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills (Large Kid Touch Targets) */}
        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-600 px-1">
            Pick a Fun Topic:
          </span>
          <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none">
            {categoryTabs.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`kid-touch-target px-5 py-3 rounded-3xl font-black text-sm whitespace-nowrap flex items-center gap-2 border-3 transition transform ${
                  selectedCategory === cat.id
                    ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-kid-button scale-105'
                    : 'bg-white text-slate-700 border-amber-200 hover:border-amber-400 shadow-sm'
                }`}
              >
                <span className="text-xl">{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 1: Interactive Learning Activities (Earn Coins!) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Puzzle className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Play & Earn Coins ⭐
              </h2>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
              +5 Coins for Each Activity
            </span>
          </div>

          {filteredActivities.length === 0 ? (
            <Card className="text-center py-8 bg-white/80">
              <p className="text-xs text-slate-500 font-bold">No interactive games in this topic right now. Try &ldquo;All Fun&rdquo;!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((act) => (
                <Card
                  key={act.id}
                  variant="kid"
                  className="bg-white border-4 border-amber-300 hover:border-blue-400 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">
                        {act.activityType === 'QUIZ' ? '❓' : act.activityType === 'MATCHING' ? '🧩' : '📦'}
                      </span>
                      {act.alreadyRewarded ? (
                        <Badge variant="emerald">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Rewarded (Practice Mode)
                        </Badge>
                      ) : (
                        <Badge variant="amber">🪙 Earn +{act.coinReward} Coins</Badge>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-slate-900">{act.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 font-medium">{act.description}</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link href={`/child/${childId}/activity/${act.id}`}>
                      <Button variant="kid-mint" size="lg" className="w-full font-black text-sm tracking-wide shadow-md">
                        <Play className="w-4 h-4 mr-1.5 fill-current" /> Play Activity
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Parent-Approved Educational Videos */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Approved Watch Room 📺
            </h2>
          </div>

          {filteredContent.length === 0 ? (
            <Card className="text-center py-10 bg-white/80 space-y-2">
              <p className="text-sm font-bold text-slate-700">No videos approved in this topic yet.</p>
              <p className="text-xs text-slate-500">Your parent can approve videos from their Parent Dashboard.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((video) => (
                <Card
                  key={video.id}
                  variant="kid"
                  className="bg-white border-4 border-amber-200 overflow-hidden p-0 flex flex-col justify-between"
                >
                  <div className="h-44 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 relative flex items-center justify-center p-4">
                    <div className="w-14 h-14 rounded-full bg-amber-400 hover:bg-amber-300 flex items-center justify-center text-amber-950 shadow-xl transition transform hover:scale-110">
                      <Play className="w-7 h-7 fill-current ml-1" />
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                      {Math.round(video.durationSeconds / 60)} mins
                    </span>
                    <span className="absolute top-2 left-2">
                      <Badge variant="blue">{video.category}</Badge>
                    </span>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900 line-clamp-1">{video.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1 font-medium">{video.description}</p>
                    </div>

                    <Link href={`/child/${childId}/watch/${video.id}`}>
                      <Button variant="kid-sunny" size="md" className="w-full font-black text-sm">
                        Watch Video
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Break Reminder Modal */}
      {showBreakReminder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-5xl p-8 max-w-sm w-full text-center shadow-2xl border-6 border-amber-400 space-y-4">
            <div className="text-6xl animate-bounce">🧘</div>
            <h3 className="text-2xl font-black text-slate-900">Time for a Quick Break!</h3>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Blink your eyes, look far out the window, take a big breath, and sip some fresh water!
            </p>
            <Button
              variant="kid-sunny"
              size="lg"
              className="w-full font-black"
              onClick={() => setShowBreakReminder(false)}
            >
              I&apos;m Refreshed! Let&apos;s Continue 😊
            </Button>
          </div>
        </div>
      )}

      {/* Ask Parent Help Modal */}
      {askParentHelp && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-5xl p-8 max-w-sm w-full text-center shadow-2xl border-6 border-blue-400 space-y-4">
            <div className="text-6xl">👨‍👩‍👧</div>
            <h3 className="text-2xl font-black text-slate-900">Need Help?</h3>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Call your mom, dad, or guardian to sit beside you and play this activity together!
            </p>
            <Button
              variant="primary"
              size="lg"
              className="w-full font-bold"
              onClick={() => setAskParentHelp(false)}
            >
              Got It! 👍
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
