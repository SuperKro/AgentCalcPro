import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/adminAuth";
import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  
  if (!verifyAdminToken(authHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allSettings = await db.select().from(appSettings);
    const settings: Record<string, string> = {};
    allSettings.forEach((s) => {
      settings[s.settingKey] = s.settingValue;
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Admin get settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  
  if (!verifyAdminToken(authHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    for (const [key, value] of Object.entries(data)) {
      const existing = await db
        .select()
        .from(appSettings)
        .where(eq(appSettings.settingKey, key))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(appSettings)
          .set({ settingValue: String(value), updatedAt: new Date() })
          .where(eq(appSettings.settingKey, key));
      } else {
        await db
          .insert(appSettings)
          .values({ settingKey: key, settingValue: String(value) });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin save settings error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
