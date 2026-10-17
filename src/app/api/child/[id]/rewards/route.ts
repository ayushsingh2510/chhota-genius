import { NextRequest, NextResponse } from 'next/server';
import { getRewardsForChild, requestRewardRedemption, getChildCoinBalance } from '@/modules/rewards/service';

interface RouteContext {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const [rewards, balance] = await Promise.all([
    getRewardsForChild(params.id),
    getChildCoinBalance(params.id),
  ]);

  return NextResponse.json({ rewards, currentBalance: balance });
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const body = await req.json();
    const { rewardId } = body;
    if (!rewardId) {
      return NextResponse.json({ error: 'rewardId is required' }, { status: 400 });
    }

    const result = await requestRewardRedemption(params.id, rewardId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Redemption request failed' }, { status: 400 });
  }
}
