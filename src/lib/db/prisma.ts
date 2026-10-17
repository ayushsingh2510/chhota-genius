import { PrismaClient } from '@prisma/client';
import net from 'net';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  isDbAvailable: boolean | null;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

let isDatabaseConnected: boolean | null = globalForPrisma.isDbAvailable ?? null;

export async function isPostgresAvailable(): Promise<boolean> {
  if (isDatabaseConnected !== null) return isDatabaseConnected;
  if (process.env.DATABASE_OFFLINE === 'true') {
    isDatabaseConnected = false;
    return false;
  }

  // Quick 150ms TCP probe against PostgreSQL host and port
  return new Promise((resolve) => {
    let port = 5432;
    let host = '127.0.0.1';
    try {
      const url = new URL(process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5432/chhota_genius');
      port = parseInt(url.port || '5432', 10);
      host = url.hostname || '127.0.0.1';
    } catch {}

    const socket = new net.Socket();
    socket.setTimeout(150);

    const onFinish = (available: boolean) => {
      socket.destroy();
      isDatabaseConnected = available;
      globalForPrisma.isDbAvailable = available;
      resolve(available);
    };

    socket.on('connect', () => onFinish(true));
    socket.on('error', () => onFinish(false));
    socket.on('timeout', () => onFinish(false));

    socket.connect(port, host);
  });
}

export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  message: string;
}> {
  const available = await isPostgresAvailable();
  if (!available) {
    return {
      connected: false,
      message:
        'PostgreSQL server is not reachable on configured port. Using high-performance in-memory development store with sample data. To connect PostgreSQL, run PostgreSQL on port 5432.',
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      message: 'PostgreSQL database is connected and healthy.',
    };
  } catch (error: any) {
    return {
      connected: false,
      message: 'PostgreSQL TCP port is reachable but query failed.',
    };
  }
}

export function getDatabaseConnectionStatus(): boolean | null {
  return isDatabaseConnected;
}
