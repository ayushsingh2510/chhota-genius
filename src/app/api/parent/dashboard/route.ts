import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getParentById } from '@/lib/auth/service';
import { getChildrenForParent } from '@/modules/children/service';
import { getRedemptionsForParent, getRewardsForParent } from '@/modules/rewards/service';
import { getScreenTimeSummary } from '@/modules/screentime/service';
import { getLearningHistoryForParent } from '@/modules/learning/service';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parent = await getParentById(session.parentId);
  if (!parent) {
    return NextResponse.json({ error: 'Parent not found' }, { status: 404 });
  }

  const [children, redemptions, rewards] = await Promise.all([
    getChildrenForParent(session.parentId),
    getRedemptionsForParent(session.parentId),
    getRewardsForParent(session.parentId),
  ]);

  // For each child, fetch screen-time summary and recent learning attempts
  const childrenSummaries = await Promise.all(
    children.map(async (child) => {
      const [screenTime, history] = await Promise.all([
        getScreenTimeSummary(child.id),
        getLearningHistoryForParent(session.parentId, child.id),
      ]);

      return {
        ...child,
        screenTime,
        recentAttempts: history.attempts.slice(0, 5),
        totalActivitiesCompleted: history.attempts.filter((a: any) => a.passed).length,
      };
    })
  );

  const pendingRedemptionsCount = redemptions.filter((r) => r.status === 'REQUESTED').length;

  return NextResponse.json({
    parent,
    children: childrenSummaries,
    rewardsCount: rewards.length,
    pendingRedemptionsCount,
    recentRedemptions: redemptions.slice(0, 5),
  });
}
