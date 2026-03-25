// ============================================
// API Route: /api/settings/models
// List models with pricing, set default
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — List all models with pricing
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get all models
        const { data: models, error } = await supabase
            .from("ai_models")
            .select("*")
            .order("provider, sort_order");

        if (error) throw error;

        // Get user-level settings (overrides)
        let settings: Record<string, { isEnabled: boolean; isDefault: boolean }> = {};

        {
            const { data: userSettings } = await supabase
                .from("ai_model_settings")
                .select("model_id, is_enabled, is_default")
                .eq("user_id", user.id);

            if (userSettings) {
                for (const s of userSettings) {
                    settings[s.model_id] = {
                        isEnabled: s.is_enabled,
                        isDefault: s.is_default,
                    };
                }
            }
        }

        // Get configured providers
        const { data: providers } = await supabase
            .from("ai_providers")
            .select("provider, is_active, is_configured")
            .eq("user_id", user.id);

        const activeProviders = new Set(
            providers?.filter(p => p.is_active && p.is_configured).map(p => p.provider) ?? []
        );

        // Merge
        const result = (models ?? []).map(m => {
            const override = settings[m.model_id];
            return {
                modelId: m.model_id,
                displayName: m.display_name,
                description: m.description,
                provider: m.provider,
                inputPrice: Number(m.input_price),
                outputPrice: Number(m.output_price),
                maxContext: m.max_context,
                supportsVision: m.supports_vision,
                supportsJson: m.supports_json,
                supportsTools: m.supports_tools,
                supportsStreaming: m.supports_streaming,
                tier: m.tier,
                isEnabled: override?.isEnabled ?? m.is_enabled,
                isDefault: override?.isDefault ?? m.is_default,
                providerActive: activeProviders.has(m.provider),
            };
        });

        return NextResponse.json({ models: result });
    } catch (error) {
        console.error("[Models API] GET error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

// PATCH — Set default model or toggle enabled
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { modelId, isDefault, isEnabled } = await request.json();

        if (!modelId) {
            return NextResponse.json({ error: "modelId required" }, { status: 400 });
        }

        // If setting as default, unset all other defaults first
        if (isDefault === true) {
            await supabase
                .from("ai_model_settings")
                .update({ is_default: false })
                .eq("user_id", user.id)
                .eq("is_default", true);
        }

        // Upsert model setting
        const updateData: Record<string, unknown> = {};
        if (typeof isDefault === "boolean") updateData.is_default = isDefault;
        if (typeof isEnabled === "boolean") updateData.is_enabled = isEnabled;

        const { error } = await supabase
            .from("ai_model_settings")
            .upsert(
                {
                    user_id: user.id,
                    model_id: modelId,
                    ...updateData,
                },
                { onConflict: "user_id,model_id" }
            );

        if (error) throw error;

        return NextResponse.json({ success: true, modelId, ...updateData });
    } catch (error) {
        console.error("[Models API] PATCH error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
