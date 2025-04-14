import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
    try {
        const body = await request.json();
        const { userId, email, fullName, companyName } = body;

        if (!userId || !email) {
            return NextResponse.json(
                { error: "userId and email are required" },
                { status: 400 }
            );
        }

        // Use service role to bypass RLS for profile creation
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { error } = await supabase.from("profiles").insert({
            id: userId,
            email,
            full_name: fullName || null,
            company_name: companyName || null,
        });

        if (error) {
            console.error("Profile creation error:", error);
            return NextResponse.json(
                { error: "Failed to create profile" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true }, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
};
