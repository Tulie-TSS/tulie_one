import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "KPI ID required" }, { status: 400 });
    }

    const body = await request.json();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/kpis?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating KPI:", error);
    return NextResponse.json(
      { error: "Failed to update KPI" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "KPI ID required" }, { status: 400 });
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/kpis?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting KPI:", error);
    return NextResponse.json(
      { error: "Failed to delete KPI" },
      { status: 500 },
    );
  }
}
