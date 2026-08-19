import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/adminAuth";
import { db } from "@/db";
import { users, payments } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  
  if (!verifyAdminToken(authHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all users
    const allUsers = await db.select().from(users);
    
    const totalUsers = allUsers.length;
    const freeUsers = allUsers.filter((u) => u.plan === "free").length;
    const monthlyUsers = allUsers.filter((u) => u.plan === "monthly").length;
    const lifetimeUsers = allUsers.filter((u) => u.plan === "lifetime").length;

    // Get total revenue from paid payments
    const paidPayments = await db
      .select({ amount: payments.amount })
      .from(payments)
      .where(eq(payments.status, "paid"));

    const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);

    // Get pending payments count
    const pendingPayments = await db
      .select({ id: payments.id })
      .from(payments)
      .where(eq(payments.status, "pending"));

    return NextResponse.json({
      stats: {
        totalUsers,
        freeUsers,
        monthlyUsers,
        lifetimeUsers,
        totalRevenue,
        pendingPayments: pendingPayments.length,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
