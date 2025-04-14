import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const ORG_ID = "a0000000-0000-0000-0000-000000000001";

export async function GET() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/kpis?organization_id=eq.${ORG_ID}&is_active=eq.true&select=*&order=category,created_at.desc`,
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
    console.error("Error fetching KPIs:", error);
    return NextResponse.json(
      { error: "Failed to fetch KPIs" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/kpis`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        ...body,
        organization_id: ORG_ID,
      }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating KPI:", error);
    return NextResponse.json(
      { error: "Failed to create KPI" },
      { status: 500 },
    );
  }
}
