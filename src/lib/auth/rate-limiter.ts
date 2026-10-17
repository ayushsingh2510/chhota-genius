interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((entry, key) => {
      if (now > entry.resetAt) {
        rateLimitStore.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

export function checkRateLimit(
  identifier: string,
  options: { maxAttempts: number; windowSeconds: number } = { maxAttempts: 5, windowSeconds: 15 * 60 }
): { allowed: boolean; remaining: number; resetSeconds: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + options.windowSeconds * 1000,
    });
    return {
      allowed: true,
      remaining: options.maxAttempts - 1,
      resetSeconds: options.windowSeconds,
    };
  }

  if (entry.count >= options.maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: options.maxAttempts - entry.count,
    resetSeconds: Math.ceil((entry.resetAt - now) / 1000),
  };
}

export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}
