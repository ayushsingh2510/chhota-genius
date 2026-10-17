import { prisma, isPostgresAvailable } from '@/lib/db/prisma';
import { mockStore, MockAttempt } from '@/lib/db/mock-store';
import { AgeBand, ContentCategory, Language, ActivityType, AttemptStatus, TransactionType } from '@prisma/client';

export interface PublicLearningActivity {
  id: string;
  contentItemId?: string | null;
  title: string;
  description: string;
  activityType: ActivityType;
  ageBand: AgeBand;
  language: Language;
  category: ContentCategory;
  instructions: string;
  coinReward: number;
  publicData: any;
  alreadyRewarded: boolean;
}

export interface ActivitySubmissionResult {
  attemptId: string;
  score: number;
  maxScore: number;
  passed: boolean;
  rewardAwarded: boolean;
  coinsEarned: number;
  newBalance: number;
  feedback: {
    message: string;
    details: Array<{
      id: string;
      correct: boolean;
      explanation?: string;
    }>;
  };
}

function sanitizeActivityData(activityType: ActivityType, questionsDataJson: string): any {
  try {
    const raw = JSON.parse(questionsDataJson);

    if (activityType === ActivityType.QUIZ) {
      return {
        questions: (raw.questions || []).map((q: any) => ({
          id: q.id,
          prompt: q.prompt,
          illustration: q.illustration,
          options: (q.options || []).map((o: any) => ({
            id: o.id,
            label: o.label,
            icon: o.icon,
          })),
        })),
      };
    }

    if (activityType === ActivityType.MATCHING) {
      return {
        pairs: (raw.pairs || []).map((p: any) => ({
          id: p.id,
          left: p.left,
          right: p.right,
          leftId: p.leftId,
          rightId: p.rightId,
        })),
      };
    }

    if (activityType === ActivityType.SORTING) {
      return {
        categories: raw.categories || [],
        items: (raw.items || []).map((it: any) => ({
          id: it.id,
          label: it.label,
        })),
      };
    }

    return raw;
  } catch {
    return {};
  }
}

export async function getLearningActivitiesForChild(childId: string): Promise<PublicLearningActivity[]> {
  const hasDb = await isPostgresAvailable();

  if (!hasDb) {
    const child = mockStore.children.find((c) => c.id === childId);
    if (!child) return [];

    const rewardedActivityIds = new Set(
      mockStore.attempts.filter((a) => a.childId === childId && a.rewardAwarded).map((a) => a.activityId)
    );

    return mockStore.activities
      .filter((act) => act.ageBand === child.ageBand)
      .map((act) => ({
        id: act.id,
        contentItemId: act.contentItemId,
        title: act.title,
        description: act.description,
        activityType: act.activityType,
        ageBand: act.ageBand,
        language: act.language,
        category: act.category,
        instructions: act.instructions,
        coinReward: act.coinReward,
        publicData: sanitizeActivityData(act.activityType, act.questionsData),
        alreadyRewarded: rewardedActivityIds.has(act.id),
      }));
  }

  const child = await prisma.child.findUnique({
    where: { id: childId },
    include: {
      learningAttempts: {
        where: { rewardAwarded: true },
      },
    },
  });
  if (!child) return [];

  const rewardedActivityIds = new Set(child.learningAttempts.map((a) => a.activityId));

  const activities = await prisma.learningActivity.findMany({
    where: {
      ageBand: child.ageBand,
    },
    orderBy: { createdAt: 'desc' },
  });

  return activities.map((act) => ({
    id: act.id,
    contentItemId: act.contentItemId,
    title: act.title,
    description: act.description,
    activityType: act.activityType,
    ageBand: act.ageBand,
    language: act.language,
    category: act.category,
    instructions: act.instructions,
    coinReward: act.coinReward,
    publicData: sanitizeActivityData(act.activityType, act.questionsData),
    alreadyRewarded: rewardedActivityIds.has(act.id),
  }));
}

export async function submitLearningActivity(
  childId: string,
  activityId: string,
  submission: { answers: Record<string, string> }
): Promise<ActivitySubmissionResult> {
  const hasDb = await isPostgresAvailable();

  let activity: any = null;
  if (!hasDb) {
    activity = mockStore.activities.find((a) => a.id === activityId) || null;
  } else {
    activity = await prisma.learningActivity.findUnique({ where: { id: activityId } });
  }

  if (!activity) {
    throw new Error('Activity not found');
  }

  const rawQuestions = JSON.parse(activity.questionsData);
  let score = 0;
  let maxScore = 0;
  const feedbackDetails: Array<{ id: string; correct: boolean; explanation?: string }> = [];

  // Server-authoritative scoring
  if (activity.activityType === ActivityType.QUIZ) {
    const questions = rawQuestions.questions || [];
    maxScore = questions.length;

    for (const q of questions) {
      const childAnswer = submission.answers[q.id];
      const isCorrect = childAnswer === q.correctOptionId;
      if (isCorrect) score += 1;

      feedbackDetails.push({
        id: q.id,
        correct: isCorrect,
        explanation: q.explanation,
      });
    }
  } else if (activity.activityType === ActivityType.MATCHING) {
    const pairs = rawQuestions.pairs || [];
    maxScore = pairs.length;

    for (const p of pairs) {
      const childRight = submission.answers[p.leftId];
      const isCorrect = childRight === p.rightId;
      if (isCorrect) score += 1;

      feedbackDetails.push({
        id: p.id,
        correct: isCorrect,
      });
    }
  } else if (activity.activityType === ActivityType.SORTING) {
    const items = rawQuestions.items || [];
    maxScore = items.length;

    for (const it of items) {
      const childCat = submission.answers[it.id];
      const isCorrect = childCat === it.correctCategory;
      if (isCorrect) score += 1;

      feedbackDetails.push({
        id: it.id,
        correct: isCorrect,
      });
    }
  }

  const passed = maxScore > 0 && score >= Math.ceil(maxScore * 0.6);

  // Check previous reward claim to prevent duplicate reward farming
  let alreadyRewarded = false;
  if (!hasDb) {
    const priorMock = mockStore.attempts.find(
      (a) => a.childId === childId && a.activityId === activityId && a.rewardAwarded
    );
    if (priorMock) alreadyRewarded = true;
  } else {
    const prior = await prisma.learningAttempt.findFirst({
      where: {
        childId,
        activityId,
        rewardAwarded: true,
      },
    });
    if (prior) alreadyRewarded = true;
  }

  const shouldAwardCoins = passed && !alreadyRewarded;
  const coinsToAward = shouldAwardCoins ? activity.coinReward : 0;
  const idempotencyKey = `activity_${childId}_${activityId}`;

  let attemptId = `attempt_${Date.now()}`;
  let newBalance = 0;

  if (!hasDb) {
    attemptId = `attempt_mock_${Date.now()}`;
    const newAttempt: MockAttempt = {
      id: attemptId,
      childId,
      activityId,
      status: AttemptStatus.COMPLETED,
      score,
      maxScore,
      passed,
      rewardAwarded: shouldAwardCoins,
      answersData: JSON.stringify(submission.answers),
      startedAt: new Date(Date.now() - 60000),
      completedAt: new Date(),
    };
    mockStore.attempts.push(newAttempt);

    if (shouldAwardCoins) {
      mockStore.coinTransactions.push({
        id: `tx_${Date.now()}`,
        childId,
        amount: coinsToAward,
        type: TransactionType.EARNED_ACTIVITY,
        reason: `Completed: ${activity.title}`,
        idempotencyKey,
        learningAttemptId: attemptId,
        createdAt: new Date(),
      });
    }

    const txs = mockStore.coinTransactions.filter((t) => t.childId === childId);
    newBalance = Math.max(
      0,
      txs.reduce((sum, t) => sum + t.amount, 0)
    );
  } else {
    const result = await prisma.$transaction(async (tx) => {
      const attempt = await tx.learningAttempt.create({
        data: {
          childId,
          activityId,
          status: AttemptStatus.COMPLETED,
          score,
          maxScore,
          passed,
          rewardAwarded: shouldAwardCoins,
          answersData: JSON.stringify(submission.answers),
          completedAt: new Date(),
        },
      });

      if (shouldAwardCoins) {
        await tx.coinTransaction.create({
          data: {
            childId,
            amount: coinsToAward,
            type: TransactionType.EARNED_ACTIVITY,
            reason: `Completed: ${activity.title}`,
            idempotencyKey,
            learningAttemptId: attempt.id,
          },
        });
      }

      const allTx = await tx.coinTransaction.findMany({ where: { childId } });
      const balance = allTx.reduce((sum, t) => sum + t.amount, 0);

      return { attemptId: attempt.id, balance: Math.max(0, balance) };
    });

    attemptId = result.attemptId;
    newBalance = result.balance;
  }

  let feedbackMessage = '';
  if (passed) {
    if (shouldAwardCoins) {
      feedbackMessage = `🎉 Amazing work! You scored ${score}/${maxScore} and earned +${coinsToAward} Chhota Coins!`;
    } else {
      feedbackMessage = `⭐ Terrific practice! You scored ${score}/${maxScore}! (Activity already rewarded previously)`;
    }
  } else {
    feedbackMessage = `🌟 Good try! You got ${score}/${maxScore}. Let's try again together to earn your star badge!`;
  }

  return {
    attemptId,
    score,
    maxScore,
    passed,
    rewardAwarded: shouldAwardCoins,
    coinsEarned: coinsToAward,
    newBalance,
    feedback: {
      message: feedbackMessage,
      details: feedbackDetails,
    },
  };
}

export async function getLearningHistoryForParent(
  parentId: string,
  childId: string
): Promise<{ attempts: any[] }> {
  const hasDb = await isPostgresAvailable();

  if (!hasDb) {
    const child = mockStore.children.find((c) => c.id === childId && c.parentId === parentId);
    if (!child) throw new Error('Child profile not found or unauthorized');

    const attempts = mockStore.attempts
      .filter((a) => a.childId === childId)
      .map((a) => ({
        ...a,
        activity: mockStore.activities.find((act) => act.id === a.activityId),
      }))
      .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));

    return { attempts };
  }

  const child = await prisma.child.findFirst({
    where: { id: childId, parentId },
  });
  if (!child) throw new Error('Child profile not found or unauthorized');

  const attempts = await prisma.learningAttempt.findMany({
    where: { childId },
    include: {
      activity: true,
    },
    orderBy: { completedAt: 'desc' },
    take: 20,
  });

  return { attempts };
}
