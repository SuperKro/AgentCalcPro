import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createSession } from "@/lib/auth";
import {
  checkRateLimit,
  validatePassword,
  validateEmail,
  sanitizeInput,
  getClientIP,
  logAuditAction,
} from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get("user-agent") || undefined;

    // Rate limiting
    const rateCheck = await checkRateLimit(clientIP, "register");
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many registration attempts. Please try again in ${Math.ceil(
            rateCheck.retryAfter! / 60
          )} minutes.`,
        },
        { status: 429 }
      );
    }

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Validate name
    const cleanName = sanitizeInput(name);
    if (cleanName.length < 2 || cleanName.length > 100) {
      return NextResponse.json(
        { error: "Name must be between 2 and 100 characters" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.errors.join(". ") },
        { status: 400 }
      );
    }

    // Check for existing user
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "This email is already registered. Please login instead." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const [user] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        name: cleanName,
        passwordHash,
      })
      .returning();

    const token = await createSession(user.id, clientIP, userAgent);

    await logAuditAction("user_registered", "user", user.id, undefined, clientIP);

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        calculationsUsed: user.calculationsUsed,
      },
    });

    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
