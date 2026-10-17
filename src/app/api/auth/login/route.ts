import { NextRequest, NextResponse } from 'next/server';
import { loginParent } from '@/lib/auth/service';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { checkRateLimit, resetRateLimit } from '@/lib/auth/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = checkRateLimit(`login_${ip}`, { maxAttempts: 5, windowSeconds: 15 * 60 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many login attempts. Please wait ${rateLimit.resetSeconds} seconds before trying again.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parent = await loginParent(body);

    // Reset rate limiter on successful login
    resetRateLimit(`login_${ip}`);

    const token = await createSessionToken({
      parentId: parent.id,
      email: parent.email,
      name: parent.name,
      role: parent.role,
    });

    setSessionCookie(token);

    return NextResponse.json({
      message: 'Login successful',
      parent,
    });
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 401 });
  }
}
