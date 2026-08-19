import { db } from "@/db";
import { rateLimits, auditLogs } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

// Rate limiting configuration
const RATE_LIMITS = {
  login: { maxAttempts: 5, windowMinutes: 15 },
  register: { maxAttempts: 3, windowMinutes: 60 },
  payment: { maxAttempts: 5, windowMinutes: 60 },
  admin_login: { maxAttempts: 3, windowMinutes: 30 },
};

export async function checkRateLimit(
  identifier: string,
  action: keyof typeof RATE_LIMITS
): Promise<{ allowed: boolean; remainingAttempts: number; retryAfter?: number }> {
  const config = RATE_LIMITS[action];
  const windowStart = new Date(Date.now() - config.windowMinutes * 60 * 1000);

  const [existing] = await db
    .select()
    .from(rateLimits)
    .where(
      and(
        eq(rateLimits.identifier, identifier),
        eq(rateLimits.action, action),
        gt(rateLimits.windowStart, windowStart)
      )
    )
    .limit(1);

  if (!existing) {
    // First attempt in this window
    await db.insert(rateLimits).values({
      identifier,
      action,
      attempts: 1,
      windowStart: new Date(),
    });
    return { allowed: true, remainingAttempts: config.maxAttempts - 1 };
  }

  if (existing.attempts >= config.maxAttempts) {
    const retryAfter = Math.ceil(
      (new Date(existing.windowStart).getTime() + config.windowMinutes * 60 * 1000 - Date.now()) / 1000
    );
    return { allowed: false, remainingAttempts: 0, retryAfter };
  }

  // Increment attempts
  await db
    .update(rateLimits)
    .set({ attempts: existing.attempts + 1 })
    .where(eq(rateLimits.id, existing.id));

  return { allowed: true, remainingAttempts: config.maxAttempts - existing.attempts - 1 };
}

export async function resetRateLimit(identifier: string, action: string): Promise<void> {
  await db
    .delete(rateLimits)
    .where(and(eq(rateLimits.identifier, identifier), eq(rateLimits.action, action)));
}

export async function logAuditAction(
  action: string,
  targetType?: string,
  targetId?: number,
  details?: string,
  ipAddress?: string
): Promise<void> {
  await db.insert(auditLogs).values({
    action,
    targetType,
    targetId,
    details,
    ipAddress,
  });
}

// Password strength validation
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return { valid: errors.length === 0, errors };
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitize input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

// Get client IP from request
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

// Validate reference number format
export function validateReferenceNumber(ref: string): boolean {
  // Allow alphanumeric, spaces, and common separators
  const cleaned = ref.trim();
  if (cleaned.length < 4 || cleaned.length > 50) {
    return false;
  }
  return /^[a-zA-Z0-9\s\-_.]+$/.test(cleaned);
}
