import crypto from "crypto";

const csrfTokens = new Map<string, { token: string; createdAt: number }>();
const TOKEN_EXPIRY = 3600000; // 1 hour

export function generateCSRFToken(): string {
  const token = crypto.randomBytes(32).toString("hex");
  const id = crypto.randomBytes(16).toString("hex");
  
  csrfTokens.set(id, {
    token,
    createdAt: Date.now(),
  });

  // Cleanup old tokens
  for (const [key, value] of csrfTokens.entries()) {
    if (Date.now() - value.createdAt > TOKEN_EXPIRY) {
      csrfTokens.delete(key);
    }
  }

  return token;
}

export function verifyCSRFToken(token: string): boolean {
  for (const [, value] of csrfTokens.entries()) {
    if (value.token === token && Date.now() - value.createdAt < TOKEN_EXPIRY) {
      return true;
    }
  }
  return false;
}
