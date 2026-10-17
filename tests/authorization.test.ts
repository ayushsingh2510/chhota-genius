import { describe, it, expect, beforeEach } from 'vitest';
import { createChild, getChildById, updateChild, deleteChild } from '@/modules/children/service';
import { decideRewardRedemption } from '@/modules/rewards/service';
import { mockStore } from '@/lib/db/mock-store';

describe('Authorization & Cross-Account Access Denial Suite', () => {
  const parentAId = 'parent_a_test';
  const parentBId = 'parent_b_test';

  let childA: any;
  let childB: any;

  beforeEach(async () => {
    // Set up test parent profiles
    mockStore.parents = [
      {
        id: parentAId,
        email: 'parentA@test.local',
        passwordHash: 'hash',
        name: 'Parent A',
        role: 'PARENT',
        dailyScreenTimeMinutesDefault: 30,
        sessionBreakReminderMinutes: 15,
        monthlyRewardCoinBudget: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: parentBId,
        email: 'parentB@test.local',
        passwordHash: 'hash',
        name: 'Parent B',
        role: 'PARENT',
        dailyScreenTimeMinutesDefault: 30,
        sessionBreakReminderMinutes: 15,
        monthlyRewardCoinBudget: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    childA = await createChild(parentAId, {
      name: 'Aarav-A',
      avatar: 'lion',
      ageBand: 'BAND_3_5',
      preferredLanguage: 'ENGLISH',
      dailyScreenTimeMinutes: 25,
      breakReminderMinutes: 10,
    });

    childB = await createChild(parentBId, {
      name: 'Kabir-B',
      avatar: 'monkey',
      ageBand: 'BAND_6_8',
      preferredLanguage: 'HINDI',
      dailyScreenTimeMinutes: 30,
      breakReminderMinutes: 15,
    });
  });

  it('allows parent to view and access only their own child profile', async () => {
    const fetchedOwn = await getChildById(parentAId, childA.id);
    expect(fetchedOwn).not.toBeNull();
    expect(fetchedOwn?.name).toBe('Aarav-A');

    // Cross-account access must return null
    const crossAccountFetch = await getChildById(parentAId, childB.id);
    expect(crossAccountFetch).toBeNull();
  });

  it('denies Parent A from updating Parent B child profile', async () => {
    await expect(
      updateChild(parentAId, childB.id, {
        name: 'Hacked Name',
      })
    ).rejects.toThrow('Child profile not found or unauthorized');
  });

  it('denies Parent A from deleting Parent B child profile', async () => {
    await expect(deleteChild(parentAId, childB.id)).rejects.toThrow('Child profile not found or unauthorized');
  });

  it('prevents Parent A from approving redemption for Parent B child', async () => {
    // Add reward for parent B
    const rewardB = {
      id: 'rew_b_1',
      parentId: parentBId,
      title: 'Storybook B',
      description: 'Desc',
      category: 'STORYBOOK',
      coinCost: 10,
      icon: 'gift',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockStore.rewards.push(rewardB);

    // Add redemption
    const redId = 'red_test_b';
    mockStore.redemptions.push({
      id: redId,
      childId: childB.id,
      rewardId: rewardB.id,
      coinCost: 10,
      status: 'REQUESTED',
      requestedAt: new Date(),
    });

    // Parent A tries to decide redemption of child B -> Must throw unauthorized
    await expect(decideRewardRedemption(parentAId, redId, 'APPROVE')).rejects.toThrow('Unauthorized');
  });
});
