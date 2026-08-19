import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("session_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }

    // Get user's recent payments
    const userPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.userId, user.id))
      .orderBy(desc(payments.createdAt))
      .limit(10);

    return NextResponse.json({
      payments: userPayments.map((p) => ({
        id: p.id,
        amount: p.amount,
        plan: p.plan,
        status: p.status,
        paymentMethod: p.paymentMethod,
        referenceNumber: p.referenceNumber,
        createdAt: p.createdAt,
        expiresAt: p.expiresAt,
        paidAt: p.paidAt,
        rejectedReason: p.rejectedReason,
      })),
    });
  } catch (error) {
    console.error("Payment status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment status" },
      { status: 500 }
    );
  }
}
