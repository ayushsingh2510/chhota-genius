import { describe, it, expect, beforeEach } from 'vitest';
import { getLearningActivitiesForChild, submitLearningActivity } from '@/modules/learning/service';
import { getChildCoinBalance } from '@/modules/rewards/service';
import { mockStore } from '@/lib/db/mock-store';
import { AgeBand } from '@prisma/client';

describe('Interactive Learning & Anti-Farming Security Suite', () => {
  const testChildId = 'child_learning_test';

  beforeEach(() => {
    mockStore.children = mockStore.children.filter((c) => c.id !== testChildId);
    mockStore.children.push({
      id: testChildId,
      parentId: 'parent_learning_test',
      name: 'Learning Child',
      avatar: 'lion',
      ageBand: AgeBand.BAND_3_5,
      preferredLanguage: 'ENGLISH',
      dailyScreenTimeMinutes: 30,
      breakReminderMinutes: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Reset attempts and coin transactions for test child
    mockStore.attempts = mockStore.attempts.filter((a) => a.childId !== testChildId);
    mockStore.coinTransactions = mockStore.coinTransactions.filter((tx) => tx.childId !== testChildId);
  });

  it('sanitizes activities and NEVER exposes secret answer keys to child mode', async () => {
    const activities = await getLearningActivitiesForChild(testChildId);
    expect(activities.length).toBeGreaterThan(0);

    for (const act of activities) {
      if (act.activityType === 'QUIZ') {
        const questions = act.publicData.questions;
        expect(questions).toBeDefined();
        for (const q of questions) {
          // Secret correctOptionId and explanation must NOT be present in child mode
          expect(q.correctOptionId).toBeUndefined();
          expect(q.explanation).toBeUndefined();
        }
      }
    }
  });

  it('authoritatively scores quizzes and awards coins on first pass', async () => {
    const initialBalance = await getChildCoinBalance(testChildId);
    expect(initialBalance).toBe(0);

    // Submit correct answers for act-abc-quiz-1 (q1: opt1=Apple, q2: opt2=Bee)
    const result = await submitLearningActivity(testChildId, 'act-abc-quiz-1', {
      answers: {
        q1: 'opt1',
        q2: 'opt2',
      },
    });

    expect(result.score).toBe(2);
    expect(result.maxScore).toBe(2);
    expect(result.passed).toBe(true);
    expect(result.rewardAwarded).toBe(true);
    expect(result.coinsEarned).toBe(5);
    expect(result.newBalance).toBe(5);

    const balanceAfter = await getChildCoinBalance(testChildId);
    expect(balanceAfter).toBe(5);
  });

  it('prevents duplicate reward farming when retrying the same activity', async () => {
    // 1st attempt: Pass and earn coins
    const firstResult = await submitLearningActivity(testChildId, 'act-abc-quiz-1', {
      answers: { q1: 'opt1', q2: 'opt2' },
    });
    expect(firstResult.rewardAwarded).toBe(true);
    expect(firstResult.coinsEarned).toBe(5);

    // 2nd attempt: Retrying the same activity
    const retryResult = await submitLearningActivity(testChildId, 'act-abc-quiz-1', {
      answers: { q1: 'opt1', q2: 'opt2' },
    });

    // Score is recorded, but reward must NOT be awarded again!
    expect(retryResult.score).toBe(2);
    expect(retryResult.passed).toBe(true);
    expect(retryResult.rewardAwarded).toBe(false);
    expect(retryResult.coinsEarned).toBe(0);

    // Balance remains exactly 5, not 10
    const finalBalance = await getChildCoinBalance(testChildId);
    expect(finalBalance).toBe(5);
  });

  it('does NOT deduct coins or shame child on incorrect answers', async () => {
    // Award 10 baseline coins
    mockStore.coinTransactions.push({
      id: 'tx_baseline',
      childId: testChildId,
      amount: 10,
      type: 'PARENT_ADJUSTMENT',
      reason: 'Baseline',
      createdAt: new Date(),
    });

    const balanceBefore = await getChildCoinBalance(testChildId);
    expect(balanceBefore).toBe(10);

    // Submit wrong answers (q1: opt3, q2: opt1)
    const result = await submitLearningActivity(testChildId, 'act-abc-quiz-1', {
      answers: {
        q1: 'opt3',
        q2: 'opt1',
      },
    });

    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
    expect(result.rewardAwarded).toBe(false);
    expect(result.coinsEarned).toBe(0);

    // Crucial rule: Balance must NOT be deducted for mistakes
    const balanceAfter = await getChildCoinBalance(testChildId);
    expect(balanceAfter).toBe(10);

    // Friendly, positive encouraging feedback message
    expect(result.feedback.message).toContain("Let's try again");
  });
});
