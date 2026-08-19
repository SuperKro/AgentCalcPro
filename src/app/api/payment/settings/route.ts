import { NextResponse } from "next/server";
import { db } from "@/db";
import { appSettings } from "@/db/schema";

export async function GET() {
  try {
    const settings = await db.select().from(appSettings);
    const result: Record<string, string> = {};
    settings.forEach((s) => {
      result[s.settingKey] = s.settingValue;
    });

    return NextResponse.json({
      gcashNumber: result.gcashNumber || "",
      gcashName: result.gcashName || "",
      paymayaNumber: result.paymayaNumber || "",
      paymayaName: result.paymayaName || "",
      bankName: result.bankName || "",
      bankAccountNumber: result.bankAccountNumber || "",
      bankAccountName: result.bankAccountName || "",
      monthlyPrice: result.monthlyPrice || "50",
      lifetimePrice: result.lifetimePrice || "200",
    });
  } catch (error) {
    console.error("Get payment settings error:", error);
    return NextResponse.json({
      gcashNumber: "",
      gcashName: "",
      paymayaNumber: "",
      paymayaName: "",
      bankName: "",
      bankAccountNumber: "",
      bankAccountName: "",
      monthlyPrice: "50",
      lifetimePrice: "200",
    });
  }
}
