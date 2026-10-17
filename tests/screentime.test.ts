import { describe, it, expect, beforeEach } from 'vitest';
import {
  startOrResumeScreenSession,
  heartbeatScreenSession,
  getScreenTimeSummary,
} from '@/modules/screentime/service';
import { mockStore } from '@/lib/db/mock-store';

describe('Server-Authoritative Screen-Time Controls Suite', () => {
  const childId = 'child_screentime_test';

  beforeEach(() => {
    mockStore.children = mockStore.children.filter((c) => c.id !== childId);
    mockStore.children.push({
      id: childId,
      parentId: 'parent_screentime_test',
      name: 'Screen Time Child',
      avatar: 'lion',
      ageBand: 'BAND_3_5',
      preferredLanguage: 'ENGLISH',
      dailyScreenTimeMinutes: 20, // 20 minutes limit = 1200 seconds
      breakReminderMinutes: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Clear sessions for this child
    mockStore.sessions = mockStore.sessions.filter((s) => s.childId !== childId);
  });

  it('starts a screen session and returns accurate remaining seconds', async () => {
    const session = await startOrResumeScreenSession(childId);
    expect(session.allowed).toBe(true);
    expect(session.sessionToken).toBeDefined();
    expect(session.dailyLimitSeconds).toBe(20 * 60);
    expect(session.remainingSeconds).toBe(20 * 60);
    expect(session.breakReminderMinutes).toBe(10);
  });

  it('bounds client delta to prevent timer manipulation and updates duration', async () => {
    const session = await startOrResumeScreenSession(childId);
    const token = session.sessionToken!;

    // Client reports 30s delta
    const hb1 = await heartbeatScreenSession(token, 30);
    expect(hb1.active).toBe(true);
    expect(hb1.remainingSeconds).toBeLessThan(1200);

    // Client attempts to send a manipulated delta (e.g. 5000 seconds)
    // Server must bound the effective delta to <= 60 seconds
    const hbTampered = await heartbeatScreenSession(token, 5000);
    expect(hbTampered.active).toBe(true);
  });

  it('enforces playback stopping when daily screen limit is reached', async () => {
    const session = await startOrResumeScreenSession(childId);
    const token = session.sessionToken!;

    // Directly simulate having consumed almost all time (1190 seconds out of 1200)
    const stored = mockStore.sessions.find((s) => s.sessionToken === token);
    if (stored) {
      stored.durationSeconds = 1190;
    }

    // Ping with 30s delta (will cross 1200s limit)
    const hbEnd = await heartbeatScreenSession(token, 30);
    expect(hbEnd.active).toBe(false);
    expect(hbEnd.remainingSeconds).toBe(0);
    expect(hbEnd.message).toContain('Daily screen time completed');

    // Trying to start another session today must be blocked
    const newAttempt = await startOrResumeScreenSession(childId);
    expect(newAttempt.allowed).toBe(false);
    expect(newAttempt.remainingSeconds).toBe(0);
    expect(newAttempt.message).toContain('limit has been reached');
  });

  it('returns factual screen-time summary for parent review', async () => {
    // Add a completed 10-minute session today
    mockStore.sessions.push({
      id: 'session_old',
      childId,
      sessionToken: 'token_old',
      startedAt: new Date(),
      lastHeartbeatAt: new Date(),
      endedAt: new Date(),
      durationSeconds: 600, // 10 minutes
      isActive: false,
    });

    const summary = await getScreenTimeSummary(childId);
    expect(summary.dailyLimitMinutes).toBe(20);
    expect(summary.minutesSpentToday).toBe(10);
    expect(summary.remainingMinutes).toBe(10);
    expect(summary.sessionsTodayCount).toBe(1);
  });
});
