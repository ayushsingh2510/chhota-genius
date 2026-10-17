import bcrypt from 'bcryptjs';
import { prisma, isPostgresAvailable } from '@/lib/db/prisma';
import { mockStore, MockParent } from '@/lib/db/mock-store';
import { registerSchema, loginSchema, updateParentSettingsSchema } from '@/lib/validation/auth';
import { z } from 'zod';

export interface SafeParent {
  id: string;
  email: string;
  name: string;
  role: string;
  dailyScreenTimeMinutesDefault: number;
  sessionBreakReminderMinutes: number;
  monthlyRewardCoinBudget: number;
  createdAt: Date;
}

export async function registerParent(input: z.infer<typeof registerSchema>): Promise<SafeParent> {
  const validated = registerSchema.parse(input);
  const hasDb = await isPostgresAvailable();

  if (!hasDb) {
    const existingMock = mockStore.parents.find((p) => p.email.toLowerCase() === validated.email.toLowerCase());
    if (existingMock) {
      throw new Error('An account with this email address already exists.');
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(validated.password, salt);

    const newParent: MockParent = {
      id: `parent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: validated.email,
      name: validated.name,
      passwordHash,
      role: 'PARENT',
      dailyScreenTimeMinutesDefault: 30,
      sessionBreakReminderMinutes: 15,
      monthlyRewardCoinBudget: 200,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockStore.parents.push(newParent);

    return {
      id: newParent.id,
      email: newParent.email,
      name: newParent.name,
      role: newParent.role,
      dailyScreenTimeMinutesDefault: newParent.dailyScreenTimeMinutesDefault,
      sessionBreakReminderMinutes: newParent.sessionBreakReminderMinutes,
      monthlyRewardCoinBudget: newParent.monthlyRewardCoinBudget,
      createdAt: newParent.createdAt,
    };
  }

  // With active database
  const existing = await prisma.parent.findUnique({
    where: { email: validated.email },
  });
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(validated.password, salt);

  const parent = await prisma.parent.create({
    data: {
      email: validated.email,
      name: validated.name,
      passwordHash,
      role: 'PARENT',
      dailyScreenTimeMinutesDefault: 30,
      sessionBreakReminderMinutes: 15,
      monthlyRewardCoinBudget: 200,
    },
  });

  return {
    id: parent.id,
    email: parent.email,
    name: parent.name,
    role: parent.role,
    dailyScreenTimeMinutesDefault: parent.dailyScreenTimeMinutesDefault,
    sessionBreakReminderMinutes: parent.sessionBreakReminderMinutes,
    monthlyRewardCoinBudget: parent.monthlyRewardCoinBudget,
    createdAt: parent.createdAt,
  };
}

export async function loginParent(input: z.infer<typeof loginSchema>): Promise<SafeParent> {
  const validated = loginSchema.parse(input);
  const hasDb = await isPostgresAvailable();

  if (!hasDb) {
    const parent = mockStore.parents.find((p) => p.email.toLowerCase() === validated.email.toLowerCase());
    if (!parent) {
      throw new Error('Invalid email or password.');
    }

    const validPassword = bcrypt.compareSync(validated.password, parent.passwordHash);
    if (!validPassword) {
      throw new Error('Invalid email or password.');
    }

    return {
      id: parent.id,
      email: parent.email,
      name: parent.name,
      role: parent.role,
      dailyScreenTimeMinutesDefault: parent.dailyScreenTimeMinutesDefault,
      sessionBreakReminderMinutes: parent.sessionBreakReminderMinutes,
      monthlyRewardCoinBudget: parent.monthlyRewardCoinBudget,
      createdAt: parent.createdAt,
    };
  }

  const parent = await prisma.parent.findUnique({
    where: { email: validated.email },
  });

  if (!parent) {
    throw new Error('Invalid email or password.');
  }

  const validPassword = await bcrypt.compare(validated.password, parent.passwordHash);
  if (!validPassword) {
    throw new Error('Invalid email or password.');
  }

  return {
    id: parent.id,
    email: parent.email,
    name: parent.name,
    role: parent.role,
    dailyScreenTimeMinutesDefault: parent.dailyScreenTimeMinutesDefault,
    sessionBreakReminderMinutes: parent.sessionBreakReminderMinutes,
    monthlyRewardCoinBudget: parent.monthlyRewardCoinBudget,
    createdAt: parent.createdAt,
  };
}

export async function getParentById(parentId: string): Promise<SafeParent | null> {
  const hasDb = await isPostgresAvailable();
  if (!hasDb) {
    const parent = mockStore.parents.find((p) => p.id === parentId);
    if (!parent) return null;
    return {
      id: parent.id,
      email: parent.email,
      name: parent.name,
      role: parent.role,
      dailyScreenTimeMinutesDefault: parent.dailyScreenTimeMinutesDefault,
      sessionBreakReminderMinutes: parent.sessionBreakReminderMinutes,
      monthlyRewardCoinBudget: parent.monthlyRewardCoinBudget,
      createdAt: parent.createdAt,
    };
  }

  const parent = await prisma.parent.findUnique({
    where: { id: parentId },
  });
  if (!parent) return null;

  return {
    id: parent.id,
    email: parent.email,
    name: parent.name,
    role: parent.role,
    dailyScreenTimeMinutesDefault: parent.dailyScreenTimeMinutesDefault,
    sessionBreakReminderMinutes: parent.sessionBreakReminderMinutes,
    monthlyRewardCoinBudget: parent.monthlyRewardCoinBudget,
    createdAt: parent.createdAt,
  };
}

export async function updateParentSettings(
  parentId: string,
  input: z.infer<typeof updateParentSettingsSchema>
): Promise<SafeParent> {
  const validated = updateParentSettingsSchema.parse(input);
  const hasDb = await isPostgresAvailable();

  if (!hasDb) {
    const parent = mockStore.parents.find((p) => p.id === parentId);
    if (!parent) throw new Error('Parent not found');

    if (validated.dailyScreenTimeMinutesDefault !== undefined) {
      parent.dailyScreenTimeMinutesDefault = validated.dailyScreenTimeMinutesDefault;
    }
    if (validated.sessionBreakReminderMinutes !== undefined) {
      parent.sessionBreakReminderMinutes = validated.sessionBreakReminderMinutes;
    }
    if (validated.monthlyRewardCoinBudget !== undefined) {
      parent.monthlyRewardCoinBudget = validated.monthlyRewardCoinBudget;
    }
    parent.updatedAt = new Date();

    return {
      id: parent.id,
      email: parent.email,
      name: parent.name,
      role: parent.role,
      dailyScreenTimeMinutesDefault: parent.dailyScreenTimeMinutesDefault,
      sessionBreakReminderMinutes: parent.sessionBreakReminderMinutes,
      monthlyRewardCoinBudget: parent.monthlyRewardCoinBudget,
      createdAt: parent.createdAt,
    };
  }

  const updated = await prisma.parent.update({
    where: { id: parentId },
    data: validated,
  });
  return {
    id: updated.id,
    email: updated.email,
    name: updated.name,
    role: updated.role,
    dailyScreenTimeMinutesDefault: updated.dailyScreenTimeMinutesDefault,
    sessionBreakReminderMinutes: updated.sessionBreakReminderMinutes,
    monthlyRewardCoinBudget: updated.monthlyRewardCoinBudget,
    createdAt: updated.createdAt,
  };
}
