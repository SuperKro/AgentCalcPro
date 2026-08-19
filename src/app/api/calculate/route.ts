import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken, canUseCalculator, incrementUsage } from "@/lib/auth";
import { db } from "@/db";
import { calculationHistory } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("session_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Please log in to use calculators" }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: "Please log in to use calculators" }, { status: 401 });
    }

    const access = canUseCalculator(user);
    if (!access.allowed) {
      return NextResponse.json(
        { error: access.reason, needsUpgrade: true, remaining: 0 },
        { status: 403 }
      );
    }

    const { calculatorType, inputData, resultData } = await request.json();

    // Save to history
    await db.insert(calculationHistory).values({
      userId: user.id,
      calculatorType,
      inputData: JSON.stringify(inputData),
      resultData: JSON.stringify(resultData),
    });

    // Increment usage
    await incrementUsage(user.id);

    const newRemaining = access.remaining === Infinity ? -1 : access.remaining - 1;

    return NextResponse.json({
      success: true,
      remaining: newRemaining,
    });
  } catch (error) {
    console.error("Calculate error:", error);
    return NextResponse.json({ error: "Calculation save failed" }, { status: 500 });
  }
}
