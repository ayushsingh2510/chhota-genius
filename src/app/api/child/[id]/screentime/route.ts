import { NextRequest, NextResponse } from 'next/server';
import {
  startOrResumeScreenSession,
  heartbeatScreenSession,
  endScreenSession,
  getScreenTimeSummary,
} from '@/modules/screentime/service';

interface RouteContext {
  params: { id: string };
}

// GET summary
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const summary = await getScreenTimeSummary(params.id);
    return NextResponse.json(summary);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

// POST start or resume session
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const status = await startOrResumeScreenSession(params.id);
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// PUT heartbeat
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionToken, deltaSeconds } = body;
    if (!sessionToken) {
      return NextResponse.json({ error: 'sessionToken is required' }, { status: 400 });
    }

    const result = await heartbeatScreenSession(sessionToken, deltaSeconds || 30);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// DELETE end session cleanly
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionToken } = body;
    if (sessionToken) {
      await endScreenSession(sessionToken);
    }
    return NextResponse.json({ message: 'Session closed' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
