import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("session_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }

    const { plan } = await request.json();

    if (plan === "monthly") {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await db
        .update(users)
        .set({ plan: "monthly", planExpiresAt: expiresAt })
        .where(eq(users.id, user.id));
      return NextResponse.json({
        success: true,
        plan: "monthly",
        expiresAt,
        message: "Upgraded to Monthly plan (₱50/month)!",
      });
    } else if (plan === "lifetime") {
      await db
        .update(users)
        .set({ plan: "lifetime", planExpiresAt: null })
        .where(eq(users.id, user.id));
      return NextResponse.json({
        success: true,
        plan: "lifetime",
        message: "Upgraded to Lifetime plan (₱200)!",
      });
    }

    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  } catch (error) {
    console.error("Upgrade error:", error);
    return NextResponse.json({ error: "Upgrade failed" }, { status: 500 });
  }
}
