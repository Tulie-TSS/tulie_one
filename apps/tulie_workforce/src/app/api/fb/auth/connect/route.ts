import { NextResponse } from "next/server";
import { getFBLoginUrl } from "@/lib/fb/auth";

export async function GET() {
  try {
    const loginUrl = getFBLoginUrl();
    return NextResponse.json({ url: loginUrl });
  } catch (error) {
    console.error("FB Auth connect error:", error);
    return NextResponse.json(
      { error: "Failed to generate Facebook login URL" },
      { status: 500 },
    );
  }
}
