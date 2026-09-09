const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function rateLimit(
  key: string,
  action: string,
  limit: number,
  windowSeconds: number
): Promise<{ success: boolean }> {
  const rateKey = `${key}:${action}`;
  const now = Date.now();
  const entry = rateLimitStore.get(rateKey);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(rateKey, { count: 1, resetTime: now + windowSeconds * 1000 });
    return { success: true };
  }

  if (entry.count >= limit) {
    return { success: false };
  }

  entry.count++;
  return { success: true };
}
