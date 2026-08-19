import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { db } from "@/db";
import { calculationHistory } from "@/db/schema";
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

    const history = await db
      .select()
      .from(calculationHistory)
      .where(eq(calculationHistory.userId, user.id))
      .orderBy(desc(calculationHistory.createdAt))
      .limit(50);

    return NextResponse.json({ history });
  } catch (error) {
    console.error("History error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
