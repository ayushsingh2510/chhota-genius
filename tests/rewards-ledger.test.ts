import { describe, it, expect, beforeEach } from 'vitest';
import {
  getChildCoinBalance,
  requestRewardRedemption,
  decideRewardRedemption,
  createReward,
} from '@/modules/rewards/service';
import { mockStore } from '@/lib/db/mock-store';
import { TransactionType } from '@prisma/client';

describe('Authoritative Coin Ledger & Safe Rewards Suite', () => {
  const parentId = 'parent_ledger_test';
  const childId = 'child_ledger_test';
  let rewardItem: any;

  beforeEach(async () => {
    mockStore.parents = mockStore.parents.filter((p) => p.id !== parentId);
    mockStore.parents.push({
      id: parentId,
      email: 'ledger.parent@test.local',
      passwordHash: 'hash',
      name: 'Ledger Parent',
      role: 'PARENT',
      dailyScreenTimeMinutesDefault: 30,
      sessionBreakReminderMinutes: 15,
      monthlyRewardCoinBudget: 200,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockStore.children = mockStore.children.filter((c) => c.id !== childId);
    mockStore.children.push({
      id: childId,
      parentId,
      name: 'Ledger Child',
      avatar: 'lion',
      ageBand: 'BAND_3_5',
      preferredLanguage: 'ENGLISH',
      dailyScreenTimeMinutes: 30,
      breakReminderMinutes: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Reset ledger transactions and redemptions for this child
    mockStore.coinTransactions = mockStore.coinTransactions.filter((tx) => tx.childId !== childId);
    mockStore.redemptions = mockStore.redemptions.filter((r) => r.childId !== childId);

    // Create a 20-coin reward item
    rewardItem = await createReward(parentId, {
      title: 'Family Zoo Trip',
      description: 'Visit the city zoo on Saturday',
      category: 'FAMILY_ACTIVITY',
      coinCost: 20,
      icon: 'sun',
    });
  });

  it('calculates balance directly from immutable transaction ledger', async () => {
    // Add two credit transactions
    mockStore.coinTransactions.push(
      {
        id: 'tx1',
        childId,
        amount: 10,
        type: TransactionType.EARNED_ACTIVITY,
        reason: 'Quiz 1',
        createdAt: new Date(),
      },
      {
        id: 'tx2',
        childId,
        amount: 5,
        type: TransactionType.EARNED_ACTIVITY,
        reason: 'Quiz 2',
        createdAt: new Date(),
      }
    );

    const balance = await getChildCoinBalance(childId);
    expect(balance).toBe(15);
  });

  it('rejects reward redemption request when balance is insufficient', async () => {
    // Child has 10 coins, reward costs 20 coins
    mockStore.coinTransactions.push({
      id: 'tx_low',
      childId,
      amount: 10,
      type: TransactionType.PARENT_ADJUSTMENT,
      reason: 'Starter coins',
      createdAt: new Date(),
    });

    await expect(requestRewardRedemption(childId, rewardItem.id)).rejects.toThrow(
      'Insufficient coins. You have 10 coins, but "Family Zoo Trip" requires 20 coins.'
    );
  });

  it('allows redemption request when balance is sufficient and prevents duplicate pending requests', async () => {
    // Child has 25 coins
    mockStore.coinTransactions.push({
      id: 'tx_ok',
      childId,
      amount: 25,
      type: TransactionType.PARENT_ADJUSTMENT,
      reason: 'Starter coins',
      createdAt: new Date(),
    });

    // First request should succeed
    const req = await requestRewardRedemption(childId, rewardItem.id);
    expect(req.redemptionId).toBeDefined();

    // Duplicate submission for the same pending reward must be rejected
    await expect(requestRewardRedemption(childId, rewardItem.id)).rejects.toThrow(
      'A request for this reward is already waiting'
    );
  });

  it('deducts coins only upon parent approval via server transaction', async () => {
    // Child starts with 30 coins
    mockStore.coinTransactions.push({
      id: 'tx_30',
      childId,
      amount: 30,
      type: TransactionType.PARENT_ADJUSTMENT,
      reason: 'Starter coins',
      createdAt: new Date(),
    });

    const initialBalance = await getChildCoinBalance(childId);
    expect(initialBalance).toBe(30);

    // Child requests redemption
    const req = await requestRewardRedemption(childId, rewardItem.id);

    // Balance remains 30 while pending parent decision
    const pendingBalance = await getChildCoinBalance(childId);
    expect(pendingBalance).toBe(30);

    // Parent approves redemption
    const decision = await decideRewardRedemption(parentId, req.redemptionId, 'APPROVE');
    expect(decision.status).toBe('APPROVED');

    // Authoritative balance is now exactly 30 - 20 = 10 coins
    const finalBalance = await getChildCoinBalance(childId);
    expect(finalBalance).toBe(10);
  });

  it('preserves child coin balance when parent rejects redemption request', async () => {
    mockStore.coinTransactions.push({
      id: 'tx_reject_test',
      childId,
      amount: 25,
      type: TransactionType.PARENT_ADJUSTMENT,
      reason: 'Starter coins',
      createdAt: new Date(),
    });

    const req = await requestRewardRedemption(childId, rewardItem.id);
    const decision = await decideRewardRedemption(parentId, req.redemptionId, 'REJECT');
    expect(decision.status).toBe('REJECTED');

    // Balance remains exactly 25
    const balance = await getChildCoinBalance(childId);
    expect(balance).toBe(25);
  });
});
