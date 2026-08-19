import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/adminAuth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  
  if (!verifyAdminToken(authHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId, plan } = await request.json();

    const planExpiresAt = plan === "monthly" 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
      : null;

    await db
      .update(users)
      .set({ plan, planExpiresAt })
      .where(eq(users.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin update user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
