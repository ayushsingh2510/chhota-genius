import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must not exceed 50 characters')
    .trim(),
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  consentPrivacy: z
    .boolean()
    .refine((val) => val === true, 'You must confirm parental consent and accept the privacy notice'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  password: z.string().min(1, 'Password is required'),
});

export const childProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Nickname must be at least 2 characters')
    .max(30, 'Nickname must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9\s'-]+$/, 'Name should only contain letters, numbers, spaces or hyphens')
    .trim(),
  avatar: z.enum(['lion', 'elephant', 'monkey', 'peacock', 'tiger', 'rabbit']).default('lion'),
  ageBand: z.enum(['BAND_3_5', 'BAND_6_8']),
  preferredLanguage: z.enum(['ENGLISH', 'HINDI']).default('ENGLISH'),
  dailyScreenTimeMinutes: z
    .number()
    .int('Screen time must be a whole number')
    .min(10, 'Minimum screen time is 10 minutes')
    .max(120, 'Maximum recommended screen time is 120 minutes')
    .default(30),
  breakReminderMinutes: z
    .number()
    .int()
    .min(5, 'Minimum break interval is 5 minutes')
    .max(60, 'Maximum break interval is 60 minutes')
    .default(15),
});

export const updateChildProfileSchema = childProfileSchema.partial();

export const updateParentSettingsSchema = z.object({
  dailyScreenTimeMinutesDefault: z.number().int().min(10).max(120).optional(),
  sessionBreakReminderMinutes: z.number().int().min(5).max(60).optional(),
  monthlyRewardCoinBudget: z.number().int().min(10).max(1000).optional(),
});
