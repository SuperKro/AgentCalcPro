import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/adminAuth";
import { db } from "@/db";
import { payments, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getClientIP, logAuditAction } from "@/lib/security";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");

  if (!(await verifyAdminToken(authHeader))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { paymentId, action, reason } = await request.json();
    const clientIP = getClientIP(request);

    // Get payment details
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status !== "pending") {
      return NextResponse.json(
        { error: "Payment has already been processed" },
        { status: 400 }
      );
    }

    // Check if payment has expired
    if (payment.expiresAt < new Date()) {
      await db
        .update(payments)
        .set({ status: "expired" })
        .where(eq(payments.id, paymentId));
      return NextResponse.json(
        { error: "Payment has expired" },
        { status: 400 }
      );
    }

    if (action === "confirm") {
      // Update payment status
      await db
        .update(payments)
        .set({
          status: "paid",
          paidAt: new Date(),
        })
        .where(eq(payments.id, paymentId));

      // Update user plan
      const planExpiresAt =
        payment.plan === "monthly"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : null;

      await db
        .update(users)
        .set({ plan: payment.plan, planExpiresAt })
        .where(eq(users.id, payment.userId));

      await logAuditAction(
        "payment_confirmed",
        "payment",
        paymentId,
        `Confirmed ${payment.plan} payment of ₱${payment.amount / 100}`,
        clientIP
      );

      return NextResponse.json({
        success: true,
        message: "Payment confirmed and user upgraded!",
      });
    } else if (action === "reject") {
      await db
        .update(payments)
        .set({
          status: "rejected",
          rejectedReason: reason || "Payment could not be verified",
        })
        .where(eq(payments.id, paymentId));

      await logAuditAction(
        "payment_rejected",
        "payment",
        paymentId,
        `Rejected: ${reason || "No reason provided"}`,
        clientIP
      );

      return NextResponse.json({
        success: true,
        message: "Payment has been rejected",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin confirm payment error:", error);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}
