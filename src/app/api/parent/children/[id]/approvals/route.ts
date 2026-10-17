import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getContentApprovalsForChild, toggleContentApproval } from '@/modules/content/service';

interface RouteContext {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await getContentApprovalsForChild(session.parentId, params.id);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch content approvals' }, { status: 404 });
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { contentItemId, approved } = body;
    if (!contentItemId || typeof approved !== 'boolean') {
      return NextResponse.json({ error: 'contentItemId and approved (boolean) are required' }, { status: 400 });
    }

    const result = await toggleContentApproval(session.parentId, params.id, contentItemId, approved);
    return NextResponse.json({ message: 'Approval status updated', ...result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update approval' }, { status: 400 });
  }
}
