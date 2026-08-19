import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/adminAuth";
import { db } from "@/db";
import { payments, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  
  if (!verifyAdminToken(authHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allPayments = await db
      .select({
        id: payments.id,
        userId: payments.userId,
        userName: users.name,
        userEmail: users.email,
        amount: payments.amount,
        plan: payments.plan,
        status: payments.status,
        paymentMethod: payments.paymentMethod,
        referenceNumber: payments.referenceNumber,
        createdAt: payments.createdAt,
        paidAt: payments.paidAt,
      })
      .from(payments)
      .leftJoin(users, eq(payments.userId, users.id))
      .orderBy(desc(payments.createdAt));

    return NextResponse.json({ payments: allPayments });
  } catch (error) {
    console.error("Admin payments error:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}
