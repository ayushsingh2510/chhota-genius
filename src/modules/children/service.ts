import { prisma, isPostgresAvailable } from '@/lib/db/prisma';
import { mockStore, MockChild } from '@/lib/db/mock-store';
import { childProfileSchema, updateChildProfileSchema } from '@/lib/validation/auth';
import { AgeBand, Language, ApprovalStatus, TransactionType } from '@prisma/client';
import { z } from 'zod';

export interface SafeChildWithBalance {
  id: string;
  parentId: string;
  name: string;
  avatar: string;
  ageBand: AgeBand;
  preferredLanguage: Language;
  dailyScreenTimeMinutes: number;
  breakReminderMinutes: number;
  coinBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function getChildrenForParent(parentId: string): Promise<SafeChildWithBalance[]> {
  const hasDb = await isPostgresAvailable();
  if (!hasDb) {
    const children = mockStore.children.filter((c) => c.parentId === parentId);
    return children.map((c) => {
      const txs = mockStore.coinTransactions.filter((tx) => tx.childId === c.id);
      const coinBalance = txs.reduce((acc, tx) => acc + tx.amount, 0);
      return {
        ...c,
        coinBalance: Math.max(0, coinBalance),
      };
    });
  }

  const children = await prisma.child.findMany({
    where: { parentId },
    include: {
      coinTransactions: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return children.map((c) => {
    const coinBalance = c.coinTransactions.reduce((acc, tx) => acc + tx.amount, 0);
    return {
      id: c.id,
      parentId: c.parentId,
      name: c.name,
      avatar: c.avatar,
      ageBand: c.ageBand,
      preferredLanguage: c.preferredLanguage,
      dailyScreenTimeMinutes: c.dailyScreenTimeMinutes,
      breakReminderMinutes: c.breakReminderMinutes,
      coinBalance: Math.max(0, coinBalance),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  });
}

export async function getChildById(parentId: string, childId: string): Promise<SafeChildWithBalance | null> {
  const hasDb = await isPostgresAvailable();
  if (!hasDb) {
    const child = mockStore.children.find((c) => c.id === childId && c.parentId === parentId);
    if (!child) return null;

    const txs = mockStore.coinTransactions.filter((tx) => tx.childId === child.id);
    const coinBalance = txs.reduce((acc, tx) => acc + tx.amount, 0);

    return {
      ...child,
      coinBalance: Math.max(0, coinBalance),
    };
  }

  const child = await prisma.child.findFirst({
    where: {
      id: childId,
      parentId,
    },
    include: {
      coinTransactions: true,
    },
  });

  if (!child) return null;

  const coinBalance = child.coinTransactions.reduce((acc, tx) => acc + tx.amount, 0);
  return {
    id: child.id,
    parentId: child.parentId,
    name: child.name,
    avatar: child.avatar,
    ageBand: child.ageBand,
    preferredLanguage: child.preferredLanguage,
    dailyScreenTimeMinutes: child.dailyScreenTimeMinutes,
    breakReminderMinutes: child.breakReminderMinutes,
    coinBalance: Math.max(0, coinBalance),
    createdAt: child.createdAt,
    updatedAt: child.updatedAt,
  };
}

export async function getChildForChildMode(childId: string): Promise<SafeChildWithBalance | null> {
  const hasDb = await isPostgresAvailable();
  if (!hasDb) {
    const child = mockStore.children.find((c) => c.id === childId);
    if (!child) return null;

    const txs = mockStore.coinTransactions.filter((tx) => tx.childId === child.id);
    const coinBalance = txs.reduce((acc, tx) => acc + tx.amount, 0);

    return {
      ...child,
      coinBalance: Math.max(0, coinBalance),
    };
  }

  const child = await prisma.child.findUnique({
    where: { id: childId },
    include: {
      coinTransactions: true,
    },
  });

  if (!child) return null;

  const coinBalance = child.coinTransactions.reduce((acc, tx) => acc + tx.amount, 0);
  return {
    id: child.id,
    parentId: child.parentId,
    name: child.name,
    avatar: child.avatar,
    ageBand: child.ageBand,
    preferredLanguage: child.preferredLanguage,
    dailyScreenTimeMinutes: child.dailyScreenTimeMinutes,
    breakReminderMinutes: child.breakReminderMinutes,
    coinBalance: Math.max(0, coinBalance),
    createdAt: child.createdAt,
    updatedAt: child.updatedAt,
  };
}

export async function createChild(
  parentId: string,
  input: z.infer<typeof childProfileSchema>
): Promise<SafeChildWithBalance> {
  const validated = childProfileSchema.parse(input);
  const hasDb = await isPostgresAvailable();

  if (!hasDb) {
    const childId = `child_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newChild: MockChild = {
      id: childId,
      parentId,
      name: validated.name,
      avatar: validated.avatar,
      ageBand: validated.ageBand as AgeBand,
      preferredLanguage: validated.preferredLanguage as Language,
      dailyScreenTimeMinutes: validated.dailyScreenTimeMinutes,
      breakReminderMinutes: validated.breakReminderMinutes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockStore.children.push(newChild);

    // Auto approve matching content in mock store
    mockStore.contentItems
      .filter((ci) => ci.ageBand === validated.ageBand)
      .forEach((ci, i) => {
        mockStore.approvals.push({
          id: `appr_${childId}_${i}`,
          parentId,
          childId,
          contentItemId: ci.id,
          status: ApprovalStatus.APPROVED,
          decidedAt: new Date(),
        });
      });

    // Initial 5 welcome coins
    mockStore.coinTransactions.push({
      id: `tx_welcome_${childId}`,
      childId,
      amount: 5,
      type: TransactionType.PARENT_ADJUSTMENT,
      reason: 'Welcome bonus for starting learning journey!',
      idempotencyKey: `welcome_${childId}`,
      createdAt: new Date(),
    });

    return {
      ...newChild,
      coinBalance: 5,
    };
  }

  const child = await prisma.child.create({
    data: {
      parentId,
      name: validated.name,
      avatar: validated.avatar,
      ageBand: validated.ageBand as AgeBand,
      preferredLanguage: validated.preferredLanguage as Language,
      dailyScreenTimeMinutes: validated.dailyScreenTimeMinutes,
      breakReminderMinutes: validated.breakReminderMinutes,
    },
  });

  const matchingContent = await prisma.contentItem.findMany({
    where: {
      ageBand: validated.ageBand as AgeBand,
      publicationStatus: 'PUBLISHED',
    },
  });

  for (const item of matchingContent) {
    await prisma.parentContentApproval.create({
      data: {
        parentId,
        childId: child.id,
        contentItemId: item.id,
        status: ApprovalStatus.APPROVED,
      },
    });
  }

  await prisma.coinTransaction.create({
    data: {
      childId: child.id,
      amount: 5,
      type: TransactionType.PARENT_ADJUSTMENT,
      reason: 'Welcome bonus for starting learning journey!',
      idempotencyKey: `welcome_${child.id}`,
    },
  });

  return {
    id: child.id,
    parentId: child.parentId,
    name: child.name,
    avatar: child.avatar,
    ageBand: child.ageBand,
    preferredLanguage: child.preferredLanguage,
    dailyScreenTimeMinutes: child.dailyScreenTimeMinutes,
    breakReminderMinutes: child.breakReminderMinutes,
    coinBalance: 5,
    createdAt: child.createdAt,
    updatedAt: child.updatedAt,
  };
}

export async function updateChild(
  parentId: string,
  childId: string,
  input: z.infer<typeof updateChildProfileSchema>
): Promise<SafeChildWithBalance> {
  const validated = updateChildProfileSchema.parse(input);
  const hasDb = await isPostgresAvailable();

  if (!hasDb) {
    const child = mockStore.children.find((c) => c.id === childId && c.parentId === parentId);
    if (!child) throw new Error('Child profile not found or unauthorized');

    if (validated.name) child.name = validated.name;
    if (validated.avatar) child.avatar = validated.avatar;
    if (validated.ageBand) child.ageBand = validated.ageBand as AgeBand;
    if (validated.preferredLanguage) child.preferredLanguage = validated.preferredLanguage as Language;
    if (validated.dailyScreenTimeMinutes !== undefined) {
      child.dailyScreenTimeMinutes = validated.dailyScreenTimeMinutes;
    }
    if (validated.breakReminderMinutes !== undefined) {
      child.breakReminderMinutes = validated.breakReminderMinutes;
    }
    child.updatedAt = new Date();

    const txs = mockStore.coinTransactions.filter((tx) => tx.childId === child.id);
    const balance = txs.reduce((acc, tx) => acc + tx.amount, 0);

    return {
      ...child,
      coinBalance: Math.max(0, balance),
    };
  }

  const existing = await prisma.child.findFirst({
    where: { id: childId, parentId },
  });
  if (!existing) throw new Error('Child profile not found or unauthorized');

  const updated = await prisma.child.update({
    where: { id: childId },
    data: {
      ...(validated.name && { name: validated.name }),
      ...(validated.avatar && { avatar: validated.avatar }),
      ...(validated.ageBand && { ageBand: validated.ageBand as AgeBand }),
      ...(validated.preferredLanguage && { preferredLanguage: validated.preferredLanguage as Language }),
      ...(validated.dailyScreenTimeMinutes !== undefined && {
        dailyScreenTimeMinutes: validated.dailyScreenTimeMinutes,
      }),
      ...(validated.breakReminderMinutes !== undefined && {
        breakReminderMinutes: validated.breakReminderMinutes,
      }),
    },
    include: { coinTransactions: true },
  });

  const balance = updated.coinTransactions.reduce((acc, tx) => acc + tx.amount, 0);

  return {
    id: updated.id,
    parentId: updated.parentId,
    name: updated.name,
    avatar: updated.avatar,
    ageBand: updated.ageBand,
    preferredLanguage: updated.preferredLanguage,
    dailyScreenTimeMinutes: updated.dailyScreenTimeMinutes,
    breakReminderMinutes: updated.breakReminderMinutes,
    coinBalance: Math.max(0, balance),
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
}

export async function deleteChild(parentId: string, childId: string): Promise<boolean> {
  const hasDb = await isPostgresAvailable();

  if (!hasDb) {
    const idx = mockStore.children.findIndex((c) => c.id === childId && c.parentId === parentId);
    if (idx === -1) throw new Error('Child profile not found or unauthorized');

    mockStore.children.splice(idx, 1);
    mockStore.approvals = mockStore.approvals.filter((a) => a.childId !== childId);
    mockStore.attempts = mockStore.attempts.filter((a) => a.childId !== childId);
    mockStore.coinTransactions = mockStore.coinTransactions.filter((tx) => tx.childId !== childId);
    mockStore.redemptions = mockStore.redemptions.filter((r) => r.childId !== childId);
    mockStore.sessions = mockStore.sessions.filter((s) => s.childId !== childId);

    return true;
  }

  const existing = await prisma.child.findFirst({
    where: { id: childId, parentId },
  });
  if (!existing) throw new Error('Child profile not found or unauthorized');

  await prisma.child.delete({
    where: { id: childId },
  });
  return true;
}
