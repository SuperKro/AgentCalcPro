import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  verifyPassword,
  createSession,
  checkAccountLocked,
  recordFailedLogin,
} from "@/lib/auth";
import {
  checkRateLimit,
  resetRateLimit,
  validateEmail,
  getClientIP,
  logAuditAction,
} from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get("user-agent") || undefined;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Rate limiting by IP
    const rateCheck = await checkRateLimit(clientIP, "login");
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Please try again in ${Math.ceil(
            rateCheck.retryAfter! / 60
          )} minutes.`,
        },
        { status: 429 }
      );
    }

    // Check if account is locked
    const lockStatus = await checkAccountLocked(email);
    if (lockStatus.locked) {
      return NextResponse.json(
        { error: lockStatus.message },
        { status: 423 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      await recordFailedLogin(email);
      await logAuditAction("login_failed", "user", user.id, "Invalid password", clientIP);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Successful login - reset rate limit
    await resetRateLimit(clientIP, "login");

    const token = await createSession(user.id, clientIP, userAgent);

    await logAuditAction("login_success", "user", user.id, undefined, clientIP);

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
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
