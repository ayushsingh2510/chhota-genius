import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dbHealth = await checkDatabaseHealth();

  return NextResponse.json(
    {
      status: 'ok',
      service: 'Chhota Genius API',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        provider: 'postgresql',
        connected: dbHealth.connected,
        status: dbHealth.message,
      },
      storage: {
        driver: process.env.STORAGE_DRIVER || 'local',
        healthy: true,
      },
      environment: process.env.NODE_ENV || 'development',
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
