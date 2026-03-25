// ============================================
// Chat API Route — Multi-Provider
//
// Pre-process:  retrieve context from memory
// Process:      route to correct AI provider
// Post-process: async reflection + usage logging
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { memoryManager } from "@/lib/memory";
import type { ChatMessage } from "@/lib/memory";
import { callAI, getProviderFromModel } from "@/lib/ai-client";
import { decryptApiKey } from "@/lib/encryption";
import OpenAI from "openai";

export async function POST(request: NextRequest) {
    try {
        // 1. Auth
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // 2. Parse request
        const body = await request.json();
        const {
            messages,
            agentId,
            organizationId,
        }: {
            messages: ChatMessage[];
            agentId?: string;
            organizationId?: string;
        } = body;

        if (!messages || messages.length === 0) {
            return NextResponse.json(
                { error: "Messages are required" },
                { status: 400 }
            );
        }

        // 3. Get agent config (if agentId provided)
        let systemPrompt = "You are a helpful AI assistant.";
        let model = "gpt-4o";
        let temperature = 0.7;

        if (agentId) {
            const { data: agent } = await supabase
                .from("agents")
                .select("system_prompt, model, temperature")
                .eq("id", agentId)
                .single();

            if (agent) {
                systemPrompt = agent.system_prompt;
                model = agent.model;
                temperature = Number(agent.temperature);
            }
        }

        // ─── STEP 1: Pre-processing — Retrieve memory context ───

        const lastUserMessage = [...messages]
            .reverse()
            .find((m) => m.role === "user");

        let memoryContext = "";

        if (lastUserMessage) {
            try {
                const ctx = await memoryManager.retrieveContext(
                    lastUserMessage.content,
                    user.id,
                    { agentId, organizationId }
                );
                memoryContext = ctx.systemPromptBlock;
            } catch (err) {
                console.error("[Chat API] Memory retrieval failed:", err);
            }
        }

        // ─── STEP 2: Inject memories into system message ───

        const fullSystemPrompt = memoryContext
            ? `${systemPrompt}\n\n---\n\n${memoryContext}`
            : systemPrompt;

        // ─── STEP 3: Resolve provider & API key ───

        const provider = getProviderFromModel(model);
        let apiKey = "";
        let usedFallback = false;

        // Try to get user-level API key from DB
        {
            const { data: providerConfig } = await supabase
                .from("ai_providers")
                .select("api_key_encrypted, is_active")
                .eq("user_id", user.id)
                .eq("provider", provider)
                .eq("is_active", true)
                .single();

            if (providerConfig?.api_key_encrypted) {
                try {
                    apiKey = await decryptApiKey(providerConfig.api_key_encrypted);
                } catch (e) {
                    console.error("[Chat API] Key decryption failed:", e);
                }
            }
        }

        // Fallback to env var
        if (!apiKey) {
            const envKeys: Record<string, string | undefined> = {
                openai: process.env.OPENAI_API_KEY,
                anthropic: process.env.ANTHROPIC_API_KEY,
                google: process.env.GOOGLE_AI_API_KEY,
                deepseek: process.env.DEEPSEEK_API_KEY,
            };
            apiKey = envKeys[provider] ?? "";
            usedFallback = true;
        }

        if (!apiKey) {
            return NextResponse.json(
                { error: `No API key configured for provider: ${provider}. Please add one in Settings → AI Models.` },
                { status: 400 }
            );
        }

        // ─── STEP 4: Call AI ───

        const chatMessages = [
            { role: "system", content: fullSystemPrompt },
            ...messages.map((m) => ({
                role: m.role,
                content: m.content,
            })),
        ];

        const result = await callAI(apiKey, provider, {
            model,
            messages: chatMessages,
            temperature,
        });

        // ─── STEP 5: Log usage ───

        {
            // Get model pricing
            const { data: modelInfo } = await supabase
                .from("ai_models")
                .select("input_price, output_price")
                .eq("model_id", model)
                .single();

            const inputPrice = Number(modelInfo?.input_price ?? 0);
            const outputPrice = Number(modelInfo?.output_price ?? 0);
            const costUsd = (result.usage.promptTokens * inputPrice / 1_000_000) +
                           (result.usage.completionTokens * outputPrice / 1_000_000);

            void supabase
                .from("ai_usage_log")
                .insert({
                    user_id: user.id,
                    agent_id: agentId || null,
                    model_id: model,
                    provider,
                    tokens_in: result.usage.promptTokens,
                    tokens_out: result.usage.completionTokens,
                    cost_usd: costUsd,
                    request_type: "chat",
                })
                .then(({ error: logErr }) => {
                    if (logErr) console.error("[Chat API] Usage log failed:", logErr);
                });
        }

        // ─── STEP 6: Post-processing — Async reflection ───

        const allMessages: ChatMessage[] = [
            ...messages,
            { role: "assistant", content: result.content },
        ];

        if (allMessages.length >= 5) {
            memoryManager
                .reflectOnInteraction(allMessages, user.id, agentId, organizationId)
                .catch((err) =>
                    console.error("[Chat API] Reflection failed:", err)
                );
        }

        // 7. Optionally save to messages table
        if (body.threadId) {
            await supabase.from("messages").insert([
                {
                    thread_id: body.threadId,
                    role: "user",
                    content: lastUserMessage?.content ?? "",
                },
                {
                    thread_id: body.threadId,
                    role: "assistant",
                    content: result.content,
                },
            ]);
        }

        return NextResponse.json({
            message: result.content,
            model,
            provider,
            usage: result.usage,
            usedFallback,
        });
    } catch (error) {
        console.error("[Chat API] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
