import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { db } from "@/db";
import { payments, appSettings } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import { checkRateLimit, validateReferenceNumber, getClientIP, logAuditAction, sanitizeInput } from "@/lib/security";

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

    const clientIP = getClientIP(request);

    // Rate limiting
    const rateCheck = await checkRateLimit(user.email, "payment");
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many payment attempts. Please try again in ${Math.ceil(rateCheck.retryAfter! / 60)} minutes.` },
        { status: 429 }
      );
    }

    const { plan, paymentMethod, referenceNumber } = await request.json();

    // Validate inputs
    if (!plan || !["monthly", "lifetime"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    if (!paymentMethod || !["gcash", "paymaya", "bank"].includes(paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    const cleanRef = sanitizeInput(referenceNumber || "");
    if (!validateReferenceNumber(cleanRef)) {
      return NextResponse.json(
        { error: "Invalid reference number. Use only letters, numbers, and basic characters." },
        { status: 400 }
      );
    }

    // Check for existing pending payment
    const [existingPending] = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.userId, user.id),
          eq(payments.status, "pending")
        )
      )
      .limit(1);

    if (existingPending) {
      return NextResponse.json(
        { error: "You already have a pending payment. Please wait for it to be processed or contact support." },
        { status: 400 }
      );
    }

    // Check for duplicate reference number
    const [duplicateRef] = await db
      .select()
      .from(payments)
      .where(eq(payments.referenceNumber, cleanRef))
      .limit(1);

    if (duplicateRef) {
      return NextResponse.json(
        { error: "This reference number has already been used. Please check your reference number." },
        { status: 400 }
      );
    }

    // Get prices from settings
    const settings = await db.select().from(appSettings);
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.settingKey] = s.settingValue;
    });

    const amount = plan === "monthly"
      ? parseInt(settingsMap.monthlyPrice || "50") * 100
      : parseInt(settingsMap.lifetimePrice || "200") * 100;

    // Payment expires in 48 hours
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // Create payment record
    const [payment] = await db
      .insert(payments)
      .values({
        userId: user.id,
        amount,
        plan,
        status: "pending",
        paymentMethod,
        referenceNumber: cleanRef,
        expiresAt,
        ipAddress: clientIP,
      })
      .returning();

    // Log the action
    await logAuditAction(
      "payment_created",
      "payment",
      payment.id,
      `User ${user.email} created ${plan} payment via ${paymentMethod}`,
      clientIP
    );

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        amount,
        plan,
        status: "pending",
        expiresAt,
      },
      message: "Payment submitted! Please wait for admin confirmation (usually within 24 hours).",
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
