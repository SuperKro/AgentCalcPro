import { db } from "@/db";
import { adminSessions } from "@/db/schema";
import { eq, lt } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin123";
}

export async function createAdminSession(ipAddress?: string): Promise<string> {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await db.insert(adminSessions).values({
    token,
    ipAddress,
    expiresAt,
  });

  return token;
}

export async function verifyAdminToken(authHeader: string | null): Promise<boolean> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.replace("Bearer ", "");

  const [session] = await db
    .select()
    .from(adminSessions)
    .where(eq(adminSessions.token, token))
    .limit(1);

  if (!session) {
    return false;
  }

  if (session.expiresAt < new Date()) {
    // Clean up expired session
    await db.delete(adminSessions).where(eq(adminSessions.id, session.id));
    return false;
  }

  return true;
}

export async function invalidateAdminSession(token: string): Promise<void> {
  await db.delete(adminSessions).where(eq(adminSessions.token, token));
}

export async function cleanupExpiredAdminSessions(): Promise<void> {
  await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));
}
