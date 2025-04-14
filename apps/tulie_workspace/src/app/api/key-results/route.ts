import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/key_results?select=*&order=created_at.desc`,
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
    console.error("Error fetching key results:", error);
    return NextResponse.json(
      { error: "Failed to fetch key results" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/key_results`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating key result:", error);
    return NextResponse.json(
      { error: "Failed to create key result" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Key Result ID required" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/key_results?id=eq.${id}`,
      {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (body.current_value !== undefined) {
      await fetch(`${SUPABASE_URL}/rest/v1/key_result_updates`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key_result_id: id,
          value: body.current_value,
          note: body.note || null,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating key result:", error);
    return NextResponse.json(
      { error: "Failed to update key result" },
      { status: 500 },
    );
  }
}
