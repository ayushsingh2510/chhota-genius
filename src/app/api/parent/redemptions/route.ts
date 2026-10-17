import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getRedemptionsForParent, decideRewardRedemption } from '@/modules/rewards/service';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const redemptions = await getRedemptionsForParent(session.parentId);
  return NextResponse.json({ redemptions });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { redemptionId, decision, parentNote } = body;

    if (!redemptionId || !['APPROVE', 'REJECT'].includes(decision)) {
      return NextResponse.json({ error: 'redemptionId and valid decision (APPROVE/REJECT) are required' }, { status: 400 });
    }

    const result = await decideRewardRedemption(session.parentId, redemptionId, decision, parentNote);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to process redemption' }, { status: 400 });
  }
}
