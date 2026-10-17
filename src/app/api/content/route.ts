import { NextRequest, NextResponse } from 'next/server';
import { getAllCuratedContent } from '@/modules/content/service';
import { AgeBand, ContentCategory, Language } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') as ContentCategory | null;
  const ageBand = searchParams.get('ageBand') as AgeBand | null;
  const language = searchParams.get('language') as Language | null;

  const content = await getAllCuratedContent({
    category: category || undefined,
    ageBand: ageBand || undefined,
    language: language || undefined,
  });

  return NextResponse.json({ content });
}
