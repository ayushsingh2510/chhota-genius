import { prisma, isPostgresAvailable } from '@/lib/db/prisma';
import { mockStore, MockReward, MockRedemption } from '@/lib/db/mock-store';
import { TransactionType, RedemptionStatus } from '@prisma/client';
import { z } from 'zod';

export const rewardSchema = z.object({
  title: z.string().min(2).max(60).trim(),
  description: z.string().min(2).max(200).trim(),
  category: z.enum(['OFFLINE_TREAT', 'STORYBOOK', 'ART_SUPPLIES', 'FAMILY_ACTIVITY']).default('OFFLINE_TREAT'),
  coinCost: z.number().int().min(5, 'Minimum reward cost is 5 coins').max(100, 'Maximum reward cost is 100 coins'),
  icon: z.enum(['gift', 'book-open', 'sun', 'palette', 'sparkles', 'heart', 'star']).default('gift'),
});

export const updateRewardSchema = rewardSchema.partial();

export async function getChildCoinBalance(childId: string): Promise<number> {
  const hasDb = await isPostgresAvailable();
  if (!hasDb) {
    const txs = mockStore.coinTransactions.filter((tx) => tx.childId === childId);
    const balance = txs.reduce((sum, tx) => sum + tx.amount, 0);
    return Math.max(0, balance);
  }

  const txs = await prisma.coinTransaction.findMany({
    where: { childId },
  });
  const balance = txs.reduce((sum, tx) => sum + tx.amount, 0);
  return Math.max(0, balance);
}

export async function getChildCoinLedger(childId: string): Promise<any[]> {
  const hasDb = await isPostgresAvailable();
  if (!hasDb) {
    return mockStore.coinTransactions
      .filter((tx) => tx.childId === childId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  const txs = await prisma.coinTransaction.findMany({
    where: { childId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return txs;
}

export async function getRewardsForChild(childId: string): Promise<any[]> {
  const hasDb = await isPostgresAvailable();
  if (!hasDb) {
    const child = mockStore.children.find((c) => c.id === childId);
    if (!child) return [];
    return mockStore.rewards.filter((r) => r.parentId === child.parentId && r.isActive);
  }

  const child = await prisma.child.findUnique({
    where: { id: childId },
    include: {
      parent: {
        include: {
          rewards: {
            where: { isActive: true },
            orderBy: { coinCost: 'asc' },
          },
        },
      },
    },
  });
  if (!child) return [];
  return child.parent.rewards;
}

export async function getRewardsForParent(parentId: string): Promise<any[]> {
  const hasDb = await isPostgresAvailable();
  if (!hasDb) {
    return mockStore.rewards.filter((r) => r.parentId === parentId);
  }

  const rewards = await prisma.reward.findMany({
    where: { parentId },
    orderBy: { createdAt: 'desc' },
  });
  return rewards;
}

export async function createReward(parentId: string, input: z.infer<typeof rewardSchema>): Promise<any> {
  const validated = rewardSchema.parse(input);
  const hasDb = await isPostgresAvailable();

  if (!hasDb) {
    const newReward: MockReward = {
      id: `reward_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      parentId,
      title: validated.title,
      description: validated.description,
      category: validated.category,
      coinCost: validated.coinCost,
      icon: validated.icon,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockStore.rewards.push(newReward);
    return newReward;
  }

  const reward = await prisma.reward.create({
    data: {
      parentId,
      title: validated.title,
      description: validated.description,
      category: validated.category,
      coinCost: validated.coinCost,
      icon: validated.icon,
      isActive: true,
    },
  });
  return reward;
}

export async function updateReward(parentId: string, rewardId: string, input: z.infer<typeof updateRewardSchema>): Promise<any> {
  const validated = updateRewardSchema.parse(input);
  const hasDb = await isPostgresAvailable();

  if (!hasDb) {
    const reward = mockStore.rewards.find((r) => r.id === rewardId && r.parentId === parentId);
    if (!reward) throw new Error('Reward not found or unauthorized');

    if (validated.title) reward.title = validated.title;
    if (validated.description) reward.description = validated.description;
    if (validated.category) reward.category = validated.category;
    if (validated.coinCost !== undefined) reward.coinCost = validated.coinCost;
    if (validated.icon) reward.icon = validated.icon;
    reward.updatedAt = new Date();
    return reward;
  }

  const existing = await prisma.reward.findFirst({
    where: { id: rewardId, parentId },
  });
  if (!existing) throw new Error('Reward not found or unauthorized');

  const updated = await prisma.reward.update({
    where: { id: rewardId },
    data: validated,
  });
  return updated;
}

export async function deleteReward(parentId: string, rewardId: string): Promise<boolean> {
  const hasDb = await isPostgresAvailable();

  if (!hasDb) {
    const idx = mockStore.rewards.findIndex((r) => r.id === rewardId && r.parentId === parentId);
    if (idx === -1) throw new Error('Reward not found or unauthorized');
    mockStore.rewards.splice(idx, 1);
    return true;
  }

  const existing = await prisma.reward.findFirst({
    where: { id: rewardId, parentId },
  });
  if (!existing) throw new Error('Reward not found or unauthorized');

  await prisma.reward.delete({
    where: { id: rewardId },
  });
  return true;
}

export async function requestRewardRedemption(
  childId: string,
  rewardId: string
): Promise<{ redemptionId: string; message: string }> {
  const hasDb = await isPostgresAvailable();

  let child: any = null;
  let reward: any = null;

  if (!hasDb) {
    child = mockStore.children.find((c) => c.id === childId);
    reward = mockStore.rewards.find((r) => r.id === rewardId);
  } else {
    child = await prisma.child.findUnique({
      where: { id: childId },
      include: { coinTransactions: true },
    });
    reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });
  }

  if (!child) throw new Error('Child not found');
  if (!reward || !reward.isActive) throw new Error('Reward is currently unavailable');
  if (reward.parentId !== child.parentId) throw new Error('Unauthorized reward request');

  const currentBalance = await getChildCoinBalance(childId);
  if (currentBalance < reward.coinCost) {
    throw new Error(`Insufficient coins. You have ${currentBalance} coins, but "${reward.title}" requires ${reward.coinCost} coins.`);
  }

  let pendingCount = 0;
  if (!hasDb) {
    pendingCount = mockStore.redemptions.filter(
      (r) => r.childId === childId && r.rewardId === rewardId && r.status === RedemptionStatus.REQUESTED
    ).length;
  } else {
    pendingCount = await prisma.rewardRedemption.count({
      where: {
        childId,
        rewardId,
        status: RedemptionStatus.REQUESTED,
      },
    });
  }

  if (pendingCount > 0) {
    throw new Error('A request for this reward is already waiting for your parent’s approval!');
  }

  if (!hasDb) {
    const redemptionId = `redemption_${Date.now()}`;
    const newRedemption: MockRedemption = {
      id: redemptionId,
      childId,
      rewardId,
      coinCost: reward.coinCost,
      status: RedemptionStatus.REQUESTED,
      requestedAt: new Date(),
    };
    mockStore.redemptions.push(newRedemption);

    return {
      redemptionId,
      message: `Your request for "${reward.title}" was sent to your parent! They will review it soon.`,
    };
  }

  const redemption = await prisma.rewardRedemption.create({
    data: {
      childId,
      rewardId,
      coinCost: reward.coinCost,
      status: RedemptionStatus.REQUESTED,
    },
  });
  return {
    redemptionId: redemption.id,
    message: `Your request for "${reward.title}" was sent to your parent! They will review it soon.`,
  };
}

export async function decideRewardRedemption(
  parentId: string,
  redemptionId: string,
  decision: 'APPROVE' | 'REJECT',
  parentNote?: string
): Promise<{ status: RedemptionStatus; message: string }> {
  const hasDb = await isPostgresAvailable();

  let redemption: any = null;
  if (!hasDb) {
    const r = mockStore.redemptions.find((item) => item.id === redemptionId);
    if (r) {
      redemption = {
        ...r,
        child: mockStore.children.find((c) => c.id === r.childId),
        reward: mockStore.rewards.find((rew) => rew.id === r.rewardId),
      };
    }
  } else {
    redemption = await prisma.rewardRedemption.findUnique({
      where: { id: redemptionId },
      include: { child: true, reward: true },
    });
  }

  if (!redemption) throw new Error('Redemption request not found');
  if (redemption.child.parentId !== parentId) throw new Error('Unauthorized');
  if (redemption.status !== RedemptionStatus.REQUESTED) {
    throw new Error(`This request was already decided (${redemption.status}).`);
  }

  if (decision === 'APPROVE') {
    const childId = redemption.childId;
    const coinCost = redemption.coinCost;
    const idempotencyKey = `redeem_${redemptionId}`;

    if (!hasDb) {
      const txs = mockStore.coinTransactions.filter((t) => t.childId === childId);
      const balance = txs.reduce((sum, t) => sum + t.amount, 0);
      if (balance < coinCost) {
        throw new Error(`Child has only ${balance} coins. Cannot redeem reward costing ${coinCost} coins.`);
      }

      mockStore.coinTransactions.push({
        id: `tx_redeem_${Date.now()}`,
        childId,
        amount: -coinCost,
        type: TransactionType.REWARD_REDEMPTION,
        reason: `Redeemed offline reward: ${redemption.reward.title}`,
        idempotencyKey,
        redemptionId,
        createdAt: new Date(),
      });

      const redIdx = mockStore.redemptions.findIndex((r) => r.id === redemptionId);
      if (redIdx >= 0) {
        mockStore.redemptions[redIdx].status = RedemptionStatus.APPROVED;
        mockStore.redemptions[redIdx].parentNote = parentNote || 'Approved with love by parent!';
        mockStore.redemptions[redIdx].decidedAt = new Date();
      }

      return { status: RedemptionStatus.APPROVED, message: `Reward approved! ${coinCost} coins deducted from child's balance.` };
    }

    await prisma.$transaction(async (tx) => {
      const allTx = await tx.coinTransaction.findMany({ where: { childId } });
      const balance = allTx.reduce((sum, t) => sum + t.amount, 0);

      if (balance < coinCost) {
        throw new Error(`Child has only ${balance} coins. Cannot redeem reward costing ${coinCost} coins.`);
      }

      await tx.coinTransaction.create({
        data: {
          childId,
          amount: -coinCost,
          type: TransactionType.REWARD_REDEMPTION,
          reason: `Redeemed offline reward: ${redemption.reward.title}`,
          idempotencyKey,
          redemptionId,
        },
      });

      await tx.rewardRedemption.update({
        where: { id: redemptionId },
        data: {
          status: RedemptionStatus.APPROVED,
          parentNote: parentNote || 'Approved with love by parent!',
          decidedAt: new Date(),
        },
      });
    });

    return { status: RedemptionStatus.APPROVED, message: `Reward approved! ${coinCost} coins deducted from child's balance.` };
  } else {
    if (!hasDb) {
      const redIdx = mockStore.redemptions.findIndex((r) => r.id === redemptionId);
      if (redIdx >= 0) {
        mockStore.redemptions[redIdx].status = RedemptionStatus.REJECTED;
        mockStore.redemptions[redIdx].parentNote = parentNote || 'Not right now; please try again later.';
        mockStore.redemptions[redIdx].decidedAt = new Date();
      }
      return { status: RedemptionStatus.REJECTED, message: 'Reward request rejected. No coins were deducted.' };
    }

    await prisma.rewardRedemption.update({
      where: { id: redemptionId },
      data: {
        status: RedemptionStatus.REJECTED,
        parentNote: parentNote || 'Not right now; please try again later.',
        decidedAt: new Date(),
      },
    });

    return { status: RedemptionStatus.REJECTED, message: 'Reward request rejected. No coins were deducted.' };
  }
}

export async function getRedemptionsForParent(parentId: string): Promise<any[]> {
  const hasDb = await isPostgresAvailable();

  if (!hasDb) {
    const parentChildren = new Set(mockStore.children.filter((c) => c.parentId === parentId).map((c) => c.id));
    return mockStore.redemptions
      .filter((r) => parentChildren.has(r.childId))
      .map((r) => ({
        ...r,
        child: mockStore.children.find((c) => c.id === r.childId),
        reward: mockStore.rewards.find((rew) => rew.id === r.rewardId),
      }))
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }

  const redemptions = await prisma.rewardRedemption.findMany({
    where: {
      child: { parentId },
    },
    include: {
      child: true,
      reward: true,
    },
    orderBy: { requestedAt: 'desc' },
    take: 30,
  });
  return redemptions;
}
