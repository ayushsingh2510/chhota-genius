import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getParentById } from '@/lib/auth/service';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ authenticated: false, parent: null }, { status: 401 });
  }

  const parent = await getParentById(session.parentId);
  if (!parent) {
    return NextResponse.json({ authenticated: false, parent: null }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, parent });
}
