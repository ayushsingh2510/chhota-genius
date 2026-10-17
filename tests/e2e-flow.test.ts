import { describe, it, expect } from 'vitest';
import { registerParent, loginParent } from '@/lib/auth/service';
import { createChild, getChildById } from '@/modules/children/service';
import { getChildApprovedContent, toggleContentApproval } from '@/modules/content/service';
import { getLearningActivitiesForChild, submitLearningActivity } from '@/modules/learning/service';
import {
  createReward,
  getRewardsForChild,
  requestRewardRedemption,
  decideRewardRedemption,
  getChildCoinBalance,
} from '@/modules/rewards/service';
import { startOrResumeScreenSession, heartbeatScreenSession } from '@/modules/screentime/service';

describe('Complete End-to-End User Journeys Suite', () => {
  it('executes full flow: Parent registration -> Child setup -> Learning quiz -> Coin ledger -> Reward redemption approval', async () => {
    // 1. Parent registers
    const parentEmail = `parent_${Date.now()}@test.local`;
    const parent = await registerParent({
      name: 'Anjali Gupta',
      email: parentEmail,
      password: 'SecurePassword123',
      consentPrivacy: true,
    });
    expect(parent.id).toBeDefined();

    // 2. Parent logs in
    const sessionParent = await loginParent({
      email: parentEmail,
      password: 'SecurePassword123',
    });
    expect(sessionParent.id).toBe(parent.id);

    // 3. Parent creates child profile for "Vihaan" (Age 3-5, 25 mins screen time)
    const child = await createChild(parent.id, {
      name: 'Vihaan',
      avatar: 'lion',
      ageBand: 'BAND_3_5',
      preferredLanguage: 'ENGLISH',
      dailyScreenTimeMinutes: 25,
      breakReminderMinutes: 10,
    });
    expect(child.id).toBeDefined();
    expect(child.coinBalance).toBe(5); // Initial welcome bonus

    // 4. Parent creates custom offline reward: "Bedtime Story Pick" for 10 coins
    const reward = await createReward(parent.id, {
      title: 'Bedtime Story Pick',
      description: 'Choose any bedtime story tonight',
      category: 'STORYBOOK',
      coinCost: 10,
      icon: 'book-open',
    });
    expect(reward.id).toBeDefined();

    // 5. Parent approves content
    await toggleContentApproval(parent.id, child.id, 'content-abc-phonics', true);
    const approvedContent = await getChildApprovedContent(child.id);
    expect(approvedContent.some((item) => item.id === 'content-abc-phonics')).toBe(true);

    // 6. Child enters child mode: Screen session starts
    const session = await startOrResumeScreenSession(child.id);
    expect(session.allowed).toBe(true);
    expect(session.remainingSeconds).toBe(25 * 60);

    // 7. Child sends screen time heartbeat (30s elapsed)
    const hb = await heartbeatScreenSession(session.sessionToken!, 30);
    expect(hb.active).toBe(true);
    expect(hb.remainingSeconds).toBeLessThan(25 * 60);

    // 8. Child views activities and solves "Alphabet Phonics Fun Quiz"
    const activities = await getLearningActivitiesForChild(child.id);
    const quizAct = activities.find((a) => a.id === 'act-abc-quiz-1');
    expect(quizAct).toBeDefined();

    // Submit correct answers
    const submitRes = await submitLearningActivity(child.id, quizAct!.id, {
      answers: { q1: 'opt1', q2: 'opt2' },
    });
    expect(submitRes.passed).toBe(true);
    expect(submitRes.rewardAwarded).toBe(true);
    expect(submitRes.coinsEarned).toBe(5);

    // 9. Child's authoritative balance is now 5 (welcome) + 5 (quiz) = 10 coins
    const balanceNow = await getChildCoinBalance(child.id);
    expect(balanceNow).toBe(10);

    // 10. Child views reward store and requests redemption of "Bedtime Story Pick" (10 coins)
    const storeRewards = await getRewardsForChild(child.id);
    expect(storeRewards.length).toBeGreaterThan(0);

    const redeemRes = await requestRewardRedemption(child.id, reward.id);
    expect(redeemRes.redemptionId).toBeDefined();

    // Balance remains 10 until parent approves
    expect(await getChildCoinBalance(child.id)).toBe(10);

    // 11. Parent reviews and approves the redemption
    const decision = await decideRewardRedemption(parent.id, redeemRes.redemptionId, 'APPROVE', 'Enjoy your bedtime story!');
    expect(decision.status).toBe('APPROVED');

    // 12. Final coin balance is authoritatively deducted: 10 - 10 = 0 coins
    const finalBalance = await getChildCoinBalance(child.id);
    expect(finalBalance).toBe(0);
  });
});
