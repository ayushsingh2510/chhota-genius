import { NextRequest, NextResponse } from 'next/server';
import { getContentItemById } from '@/modules/content/service';
import { verifyPlaybackToken } from '@/lib/storage/service';

interface RouteContext {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  const contentItem = await getContentItemById(params.id);
  if (!contentItem) {
    return NextResponse.json({ error: 'Video not found.' }, { status: 404 });
  }

  // Verify short-lived signed playback token
  if (!token || !verifyPlaybackToken(contentItem.id, contentItem.storageKey, token)) {
    return NextResponse.json(
      {
        error: 'Forbidden. The video playback link has expired or is invalid. Please request a fresh playback session.',
      },
      { status: 403 }
    );
  }

  // In production, this would stream from private S3 / R2 or local storage
  // For local development with sample content, return a structured streaming payload or fallback
  return NextResponse.json({
    status: 'ready',
    contentId: contentItem.id,
    title: contentItem.title,
    durationSeconds: contentItem.durationSeconds,
    isSampleContent: contentItem.isSampleContent,
    notice: 'Local development preview playback stream verified with short-lived HMAC token.',
  });
}
