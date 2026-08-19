import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, getAdminPassword } from "@/lib/adminAuth";

// Note: In production, store the password in a database or secure storage
// This is a simple implementation for demonstration

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  
  if (!verifyAdminToken(authHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (currentPassword !== getAdminPassword()) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    // In a real app, you would save this to a database or update an environment variable
    // For now, this just validates - actual password change requires updating ADMIN_PASSWORD env var
    
    return NextResponse.json({ 
      success: true,
      message: "To change the password, update the ADMIN_PASSWORD environment variable on your hosting platform."
    });
  } catch (error) {
    console.error("Admin password change error:", error);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
