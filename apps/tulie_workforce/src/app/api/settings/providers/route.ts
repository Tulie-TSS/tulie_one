// ============================================
// API Route: /api/settings/providers
// CRUD for AI provider API keys
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encryptApiKey, decryptApiKey, maskApiKey } from "@/lib/encryption";
import { testProviderConnection } from "@/lib/ai-client";

// GET — List all providers with status
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get configured providers for this user
        const { data: providers } = await supabase
            .from("ai_providers")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at");

        // Get available models grouped by provider
        const { data: models } = await supabase
            .from("ai_models")
            .select("*")
            .eq("is_enabled", true)
            .order("sort_order");

        // Build full provider list (including unconfigured)
        const allProviders = ["openai", "anthropic", "google", "deepseek"];
        const providerLabels: Record<string, string> = {
            openai: "OpenAI",
            anthropic: "Anthropic",
            google: "Google AI",
            deepseek: "DeepSeek",
        };

        const result = allProviders.map(providerId => {
            const existing = providers?.find(p => p.provider === providerId);
            const providerModels = models?.filter(m => m.provider === providerId) ?? [];

            return {
                provider: providerId,
                label: providerLabels[providerId] ?? providerId,
                isConfigured: existing?.is_configured ?? false,
                isActive: existing?.is_active ?? false,
                keyMasked: existing?.api_key_masked ?? "",
                baseUrl: existing?.base_url ?? null,
                lastTestedAt: existing?.last_tested_at ?? null,
                testStatus: existing?.test_status ?? "untested",
                testError: existing?.test_error ?? null,
                models: providerModels.map(m => ({
                    modelId: m.model_id,
                    displayName: m.display_name,
                    description: m.description,
                    inputPrice: Number(m.input_price),
                    outputPrice: Number(m.output_price),
                    maxContext: m.max_context,
                    supportsVision: m.supports_vision,
                    supportsJson: m.supports_json,
                    supportsTools: m.supports_tools,
                    tier: m.tier,
                    isEnabled: m.is_enabled,
                })),
            };
        });

        return NextResponse.json({ providers: result });
    } catch (error) {
        console.error("[Providers API] GET error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

// POST — Add/update provider API key
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { provider, apiKey, baseUrl } = await request.json();

        if (!provider || !apiKey) {
            return NextResponse.json({ error: "provider and apiKey required" }, { status: 400 });
        }

        // Encrypt the key
        const encrypted = await encryptApiKey(apiKey);
        const masked = maskApiKey(apiKey);

        // Upsert provider
        const { data, error } = await supabase
            .from("ai_providers")
            .upsert(
                {
                    user_id: user.id,
                    provider,
                    label: (({ openai: "OpenAI", anthropic: "Anthropic", google: "Google AI", deepseek: "DeepSeek" } as Record<string, string>)[provider]) ?? provider,
                    api_key_encrypted: encrypted,
                    api_key_masked: masked,
                    base_url: baseUrl || null,
                    is_configured: true,
                    is_active: true,
                    test_status: "untested",
                },
                { onConflict: "user_id,provider" }
            )
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ provider: { ...data, api_key_encrypted: undefined } });
    } catch (error) {
        console.error("[Providers API] POST error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

// PATCH — Test connection or toggle active
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { provider, action, isActive } = await request.json();

        // Get the provider record
        const { data: providerRecord } = await supabase
            .from("ai_providers")
            .select("*")
            .eq("user_id", user.id)
            .eq("provider", provider)
            .single();

        if (!providerRecord) {
            return NextResponse.json({ error: "Provider not found" }, { status: 404 });
        }

        // Test connection
        if (action === "test") {
            const apiKey = await decryptApiKey(providerRecord.api_key_encrypted);
            const result = await testProviderConnection(provider, apiKey);

            await supabase
                .from("ai_providers")
                .update({
                    last_tested_at: new Date().toISOString(),
                    test_status: result.success ? "success" : "failed",
                    test_error: result.error || null,
                })
                .eq("id", providerRecord.id);

            return NextResponse.json({
                success: result.success,
                error: result.error,
                latencyMs: result.latencyMs,
            });
        }

        // Toggle active
        if (typeof isActive === "boolean") {
            await supabase
                .from("ai_providers")
                .update({ is_active: isActive })
                .eq("id", providerRecord.id);

            return NextResponse.json({ success: true, isActive });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("[Providers API] PATCH error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

// DELETE — Remove provider
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { provider } = await request.json();

        const { error } = await supabase
            .from("ai_providers")
            .delete()
            .eq("user_id", user.id)
            .eq("provider", provider);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Providers API] DELETE error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
