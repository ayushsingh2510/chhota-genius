import crypto from 'crypto';

const SIGNED_URL_SECRET = process.env.AUTH_SECRET || 'chhota-genius-video-stream-signing-key';

export interface SignedPlaybackToken {
  token: string;
  expiresAt: number;
  url: string;
}

export function generateSignedPlaybackUrl(contentItemId: string, storageKey: string, expiresInSeconds: number = 300): SignedPlaybackToken {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = `${contentItemId}:${storageKey}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', SIGNED_URL_SECRET).update(payload).digest('hex');

  const token = `${expiresAt}.${signature}`;
  const playbackUrl = `/api/content/${contentItemId}/stream?token=${encodeURIComponent(token)}`;

  return {
    token,
    expiresAt,
    url: playbackUrl,
  };
}

export function verifyPlaybackToken(contentItemId: string, storageKey: string, token: string): boolean {
  try {
    const [expiresAtStr, signature] = token.split('.');
    if (!expiresAtStr || !signature) return false;

    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || Math.floor(Date.now() / 1000) > expiresAt) {
      return false; // Expired
    }

    const expectedPayload = `${contentItemId}:${storageKey}:${expiresAt}`;
    const expectedSignature = crypto.createHmac('sha256', SIGNED_URL_SECRET).update(expectedPayload).digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
  } catch {
    return false;
  }
}

// Media verification: validate allowed MIME types and magic signatures
export function validateMediaFile(buffer: Buffer, originalMime: string): { valid: boolean; reason?: string } {
  // Allowed types for children's video library: MP4 (H.264), WebM
  const allowedMimes = ['video/mp4', 'video/webm'];
  if (!allowedMimes.includes(originalMime)) {
    return { valid: false, reason: 'Invalid media format. Only MP4 and WebM videos are allowed.' };
  }

  // Validate file signature (magic bytes)
  if (originalMime === 'video/mp4') {
    // MP4 usually starts with ftyp at byte offset 4: bytes 4-7 are 'ftyp' (0x66 0x74 0x79 0x70)
    if (buffer.length < 12) {
      return { valid: false, reason: 'File is too small to be a valid video.' };
    }
    const ftyp = buffer.subarray(4, 8).toString('ascii');
    if (ftyp !== 'ftyp') {
      return { valid: false, reason: 'File signature does not match MP4 video format.' };
    }
  }

  // Max 50MB for MVP
  const MAX_SIZE = 50 * 1024 * 1024;
  if (buffer.length > MAX_SIZE) {
    return { valid: false, reason: 'File size exceeds maximum permitted limit of 50MB.' };
  }

  return { valid: true };
}
