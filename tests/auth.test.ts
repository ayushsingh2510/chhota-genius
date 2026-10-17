// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema, childProfileSchema } from '@/lib/validation/auth';
import { createSessionToken, verifySessionToken } from '@/lib/auth/session';
import { checkRateLimit, resetRateLimit } from '@/lib/auth/rate-limiter';
import bcrypt from 'bcryptjs';

describe('Authentication & Validation Suite', () => {
  it('validates parent registration inputs correctly', () => {
    // Valid input
    const valid = registerSchema.safeParse({
      name: 'Rohan Verma',
      email: 'rohan@example.com',
      password: 'StrongPassword123',
      consentPrivacy: true,
    });
    expect(valid.success).toBe(true);

    // Missing consent
    const missingConsent = registerSchema.safeParse({
      name: 'Rohan Verma',
      email: 'rohan@example.com',
      password: 'StrongPassword123',
      consentPrivacy: false,
    });
    expect(missingConsent.success).toBe(false);

    // Weak password (no number)
    const weakPassword = registerSchema.safeParse({
      name: 'Rohan Verma',
      email: 'rohan@example.com',
      password: 'onlyletters',
      consentPrivacy: true,
    });
    expect(weakPassword.success).toBe(false);
  });

  it('validates parent login inputs', () => {
    const valid = loginSchema.safeParse({
      email: 'parent@example.com',
      password: 'SecretPassword1',
    });
    expect(valid.success).toBe(true);

    const invalidEmail = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'SecretPassword1',
    });
    expect(invalidEmail.success).toBe(false);
  });

  it('securely hashes passwords with bcrypt and verifies hashes', async () => {
    const raw = 'SuperSecretParent@2026';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(raw, salt);

    expect(hash).not.toBe(raw);
    expect(await bcrypt.compare(raw, hash)).toBe(true);
    expect(await bcrypt.compare('WrongPassword', hash)).toBe(false);
  });

  it('signs and verifies secure JWT session tokens with HttpOnly payload', async () => {
    const payload = {
      parentId: 'parent_test_123',
      email: 'test@parent.local',
      name: 'Priya Sharma',
      role: 'PARENT',
    };

    const token = await createSessionToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = await verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.parentId).toBe(payload.parentId);
    expect(decoded?.email).toBe(payload.email);
  });

  it('enforces rate limiting on auth identifiers', () => {
    const testId = `test_ip_${Date.now()}`;
    resetRateLimit(testId);

    // First 5 attempts should succeed
    for (let i = 0; i < 5; i++) {
      const res = checkRateLimit(testId, { maxAttempts: 5, windowSeconds: 60 });
      expect(res.allowed).toBe(true);
    }

    // 6th attempt must be rejected
    const blocked = checkRateLimit(testId, { maxAttempts: 5, windowSeconds: 60 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
});
