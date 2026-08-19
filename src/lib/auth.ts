import { db } from "@/db";
import { users, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const FREE_CALCULATION_LIMIT = 5;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12); // Increased from 10 to 12 rounds
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(
  userId: number,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.insert(sessions).values({
    userId,
    token,
    expiresAt,
    ipAddress,
    userAgent,
  });

  // Update last login
  await db
    .update(users)
    .set({ lastLoginAt: new Date(), failedLoginAttempts: 0, lockedUntil: null })
    .where(eq(users.id, userId));

  return token;
}

export async function getUserFromToken(token: string) {
  if (!token) return null;

  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (!session || session.expiresAt < new Date()) {
    // Clean up expired session
    if (session) {
      await db.delete(sessions).where(eq(sessions.id, session.id));
    }
    return null;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user || null;
}

export async function checkAccountLocked(email: string): Promise<{
  locked: boolean;
  unlockTime?: Date;
  message?: string;
}> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user) {
    return { locked: false };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil(
      (user.lockedUntil.getTime() - Date.now()) / 60000
    );
    return {
      locked: true,
      unlockTime: user.lockedUntil,
      message: `Account is locked. Try again in ${minutesLeft} minutes.`,
    };
  }

  return { locked: false };
}

export async function recordFailedLogin(email: string): Promise<void> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user) return;

  const newAttempts = (user.failedLoginAttempts || 0) + 1;
  const updates: Partial<typeof users.$inferSelect> = {
    failedLoginAttempts: newAttempts,
  };

  if (newAttempts >= MAX_FAILED_ATTEMPTS) {
    updates.lockedUntil = new Date(
      Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000
    );
  }

  await db
    .update(users)
    .set(updates)
    .where(eq(users.id, user.id));
}

export async function invalidateSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.token, token));
}

export async function invalidateAllUserSessions(userId: number): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

export function canUseCalculator(user: {
  plan: string;
  calculationsUsed: number;
  planExpiresAt: Date | null;
}): { allowed: boolean; remaining: number; reason?: string } {
  if (user.plan === "lifetime") {
    return { allowed: true, remaining: Infinity };
  }

  if (user.plan === "monthly") {
    if (user.planExpiresAt && user.planExpiresAt > new Date()) {
      return { allowed: true, remaining: Infinity };
    }
    // Monthly plan expired, treat as free
  }

  const remaining = FREE_CALCULATION_LIMIT - user.calculationsUsed;
  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      reason:
        "You have used all your free calculations. Upgrade to continue!",
    };
  }

  return { allowed: true, remaining };
}

export async function incrementUsage(userId: number) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return;

  // Only increment for free/expired plans
  if (user.plan === "lifetime") return;
  if (
    user.plan === "monthly" &&
    user.planExpiresAt &&
    user.planExpiresAt > new Date()
  )
    return;

  await db
    .update(users)
    .set({ calculationsUsed: user.calculationsUsed + 1 })
    .where(eq(users.id, userId));
}
