import { NextRequest, NextResponse } from 'next/server';
import { getLearningActivitiesForChild, submitLearningActivity } from '@/modules/learning/service';

interface RouteContext {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const activities = await getLearningActivitiesForChild(params.id);
  return NextResponse.json({ activities });
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const body = await req.json();
    const { activityId, answers } = body;

    if (!activityId || !answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'activityId and answers object are required' }, { status: 400 });
    }

    const result = await submitLearningActivity(params.id, activityId, { answers });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Submission failed' }, { status: 400 });
  }
}
