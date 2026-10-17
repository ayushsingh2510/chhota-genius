import { NextRequest, NextResponse } from 'next/server';
import { registerParent } from '@/lib/auth/service';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { checkRateLimit } from '@/lib/auth/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = checkRateLimit(`register_${ip}`, { maxAttempts: 5, windowSeconds: 15 * 60 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many registration attempts. Please try again in ${rateLimit.resetSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parent = await registerParent(body);

    const token = await createSessionToken({
      parentId: parent.id,
      email: parent.email,
      name: parent.name,
      role: parent.role,
    });

    setSessionCookie(token);

    return NextResponse.json(
      {
        message: 'Account created successfully',
        parent,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 400 });
  }
}
