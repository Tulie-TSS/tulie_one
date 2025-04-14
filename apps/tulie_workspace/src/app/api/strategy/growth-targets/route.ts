import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const ORG_ID = "a0000000-0000-0000-0000-000000000001";

export async function GET() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/strategy_growth_targets?organization_id=eq.${ORG_ID}&select=*&order=month.asc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      },
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching growth targets:", error);
    return NextResponse.json(
      { error: "Failed to fetch growth targets" },
      { status: 500 },
    );
  }
}
