import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getChildrenForParent, createChild } from '@/modules/children/service';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in as a parent.' }, { status: 401 });
  }

  const children = await getChildrenForParent(session.parentId);
  return NextResponse.json({ children });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in as a parent.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const child = await createChild(session.parentId, body);
    return NextResponse.json({ message: 'Child profile created', child }, { status: 201 });
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create child profile' }, { status: 400 });
  }
}
