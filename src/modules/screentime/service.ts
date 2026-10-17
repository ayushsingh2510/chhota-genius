import crypto from 'crypto';
import { prisma, isPostgresAvailable } from '@/lib/db/prisma';
import { mockStore, MockScreenSession } from '@/lib/db/mock-store';

export interface ScreenSessionStatus {
  allowed: boolean;
  sessionToken?: string;
  totalSecondsToday: number;
  dailyLimitSeconds: number;
  remainingSeconds: number;
  breakReminderMinutes: number;
  breakDue: boolean;
  message?: string;
}

function getStartOfTodayUtc(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function startOrResumeScreenSession(childId: string): Promise<ScreenSessionStatus> {
  const hasDb = await isPostgresAvailable();

  let child: any = null;
  if (!hasDb) {
    child = mockStore.children.find((c) => c.id === childId);
  } else {
    child = await prisma.child.findUnique({ where: { id: childId } });
  }

  if (!child) throw new Error('Child not found');

  const dailyLimitSeconds = child.dailyScreenTimeMinutes * 60;
  const breakReminderMinutes = child.breakReminderMinutes || 15;
  const todayStart = getStartOfTodayUtc();

  let totalSecondsToday = 0;
  if (!hasDb) {
    const todaySessions = mockStore.sessions.filter(
      (s) => s.childId === childId && s.startedAt.getTime() >= todayStart.getTime()
    );
    totalSecondsToday = todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  } else {
    const todaySessions = await prisma.screenSession.findMany({
      where: {
        childId,
        startedAt: { gte: todayStart },
      },
    });
    totalSecondsToday = todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  }

  if (totalSecondsToday >= dailyLimitSeconds) {
    return {
      allowed: false,
      totalSecondsToday,
      dailyLimitSeconds,
      remainingSeconds: 0,
      breakReminderMinutes,
      breakDue: false,
      message: 'Daily screen-time limit has been reached for today! Time for fun offline play or reading.',
    };
  }

  const remainingSeconds = Math.max(0, dailyLimitSeconds - totalSecondsToday);
  const sessionToken = `ses_${crypto.randomBytes(24).toString('hex')}`;

  if (!hasDb) {
    const newSession: MockScreenSession = {
      id: `session_${Date.now()}`,
      childId,
      sessionToken,
      startedAt: new Date(),
      lastHeartbeatAt: new Date(),
      durationSeconds: 0,
      isActive: true,
    };
    mockStore.sessions.push(newSession);
  } else {
    await prisma.screenSession.create({
      data: {
        childId,
        sessionToken,
        durationSeconds: 0,
        isActive: true,
      },
    });
  }

  return {
    allowed: true,
    sessionToken,
    totalSecondsToday,
    dailyLimitSeconds,
    remainingSeconds,
    breakReminderMinutes,
    breakDue: false,
  };
}

export async function heartbeatScreenSession(
  sessionToken: string,
  clientReportedDeltaSeconds: number = 30
): Promise<{
  active: boolean;
  remainingSeconds: number;
  breakDue: boolean;
  message?: string;
}> {
  const hasDb = await isPostgresAvailable();

  let session: any = null;
  if (!hasDb) {
    const s = mockStore.sessions.find((it) => it.sessionToken === sessionToken);
    if (s) {
      session = {
        ...s,
        child: mockStore.children.find((c) => c.id === s.childId),
      };
    }
  } else {
    session = await prisma.screenSession.findUnique({
      where: { sessionToken },
      include: { child: true },
    });
  }

  if (!session || !session.isActive) {
    return {
      active: false,
      remainingSeconds: 0,
      breakDue: false,
      message: 'Session has ended or is invalid.',
    };
  }

  const now = new Date();
  const serverDeltaSeconds = Math.max(0, Math.floor((now.getTime() - new Date(session.lastHeartbeatAt).getTime()) / 1000));
  const effectiveDelta = Math.min(Math.max(clientReportedDeltaSeconds, serverDeltaSeconds), 60);

  const newDuration = session.durationSeconds + effectiveDelta;
  const child = session.child;
  const dailyLimitSeconds = child.dailyScreenTimeMinutes * 60;
  const breakReminderSeconds = (child.breakReminderMinutes || 15) * 60;

  const todayStart = getStartOfTodayUtc();
  let otherSessionsTotal = 0;

  if (!hasDb) {
    const otherSessions = mockStore.sessions.filter(
      (s) => s.childId === child.id && s.id !== session.id && s.startedAt.getTime() >= todayStart.getTime()
    );
    otherSessionsTotal = otherSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  } else {
    const otherSessions = await prisma.screenSession.findMany({
      where: {
        childId: child.id,
        id: { not: session.id },
        startedAt: { gte: todayStart },
      },
    });
    otherSessionsTotal = otherSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  }

  const grandTotalSecondsToday = otherSessionsTotal + newDuration;
  const remainingSeconds = Math.max(0, dailyLimitSeconds - grandTotalSecondsToday);
  const limitReached = grandTotalSecondsToday >= dailyLimitSeconds;
  const breakDue = newDuration > 0 && newDuration % breakReminderSeconds < effectiveDelta;

  if (!hasDb) {
    const s = mockStore.sessions.find((it) => it.id === session.id);
    if (s) {
      s.durationSeconds = newDuration;
      s.lastHeartbeatAt = now;
      s.isActive = !limitReached;
      if (limitReached) s.endedAt = now;
    }
  } else {
    await prisma.screenSession.update({
      where: { id: session.id },
      data: {
        durationSeconds: newDuration,
        lastHeartbeatAt: now,
        isActive: !limitReached,
        endedAt: limitReached ? now : undefined,
      },
    });
  }

  if (limitReached) {
    return {
      active: false,
      remainingSeconds: 0,
      breakDue: false,
      message: 'Daily screen time completed! Time to rest your eyes and play offline.',
    };
  }

  return {
    active: true,
    remainingSeconds,
    breakDue,
  };
}

export async function endScreenSession(sessionToken: string): Promise<void> {
  const now = new Date();
  const hasDb = await isPostgresAvailable();

  if (!hasDb) {
    const s = mockStore.sessions.find((it) => it.sessionToken === sessionToken);
    if (s) {
      s.isActive = false;
      s.endedAt = now;
    }
    return;
  }

  await prisma.screenSession.update({
    where: { sessionToken },
    data: {
      isActive: false,
      endedAt: now,
    },
  });
}

export async function getScreenTimeSummary(childId: string): Promise<{
  minutesSpentToday: number;
  dailyLimitMinutes: number;
  remainingMinutes: number;
  breakReminderMinutes: number;
  sessionsTodayCount: number;
}> {
  const hasDb = await isPostgresAvailable();

  let child: any = null;
  if (!hasDb) {
    child = mockStore.children.find((c) => c.id === childId);
  } else {
    child = await prisma.child.findUnique({ where: { id: childId } });
  }

  if (!child) throw new Error('Child not found');

  const todayStart = getStartOfTodayUtc();
  let totalSeconds = 0;
  let count = 0;

  if (!hasDb) {
    const sessions = mockStore.sessions.filter(
      (s) => s.childId === childId && s.startedAt.getTime() >= todayStart.getTime()
    );
    totalSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    count = sessions.length;
  } else {
    const sessions = await prisma.screenSession.findMany({
      where: {
        childId,
        startedAt: { gte: todayStart },
      },
    });
    totalSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    count = sessions.length;
  }

  const minutesSpentToday = Math.round(totalSeconds / 60);
  const remainingMinutes = Math.max(0, child.dailyScreenTimeMinutes - minutesSpentToday);

  return {
    minutesSpentToday,
    dailyLimitMinutes: child.dailyScreenTimeMinutes,
    remainingMinutes,
    breakReminderMinutes: child.breakReminderMinutes || 15,
    sessionsTodayCount: count,
  };
}
