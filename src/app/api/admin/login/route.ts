import { NextRequest, NextResponse } from "next/server";
import { createAdminSession, getAdminPassword } from "@/lib/adminAuth";
import { checkRateLimit, getClientIP, logAuditAction } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const clientIP = getClientIP(request);

    // Rate limiting for admin login
    const rateCheck = await checkRateLimit(clientIP, "admin_login");
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

    if (password !== getAdminPassword()) {
      await logAuditAction("admin_login_failed", undefined, undefined, "Invalid password", clientIP);
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = await createAdminSession(clientIP);

    await logAuditAction("admin_login_success", undefined, undefined, undefined, clientIP);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
