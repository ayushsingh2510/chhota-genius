import { NextRequest, NextResponse } from 'next/server';
import { getChildApprovedContent } from '@/modules/content/service';

interface RouteContext {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const content = await getChildApprovedContent(params.id);
  return NextResponse.json({ content });
}
