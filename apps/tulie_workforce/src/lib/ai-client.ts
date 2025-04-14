// ============================================
// Multi-Provider AI Client
// Routes to OpenAI, Anthropic, Google, DeepSeek
// ============================================

import OpenAI from "openai";

// Provider config mapping
const PROVIDER_CONFIG: Record<string, {
    baseUrl?: string;
    headerKey: string;
}> = {
    openai: { headerKey: "Authorization" },
    anthropic: { baseUrl: "https://api.anthropic.com", headerKey: "x-api-key" },
    google: { baseUrl: "https://generativelanguage.googleapis.com", headerKey: "x-goog-api-key" },
    deepseek: { baseUrl: "https://api.deepseek.com", headerKey: "Authorization" },
};

export interface ChatRequest {
    model: string;
    messages: { role: string; content: string }[];
    temperature?: number;
    maxTokens?: number;
    responseFormat?: "text" | "json_object";
}

export interface ChatResponse {
    content: string;
    model: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

/**
 * Get provider from model ID
 */
export function getProviderFromModel(modelId: string): string {
    if (modelId.startsWith("gpt-") || modelId.startsWith("o3") || modelId.startsWith("o4")) return "openai";
    if (modelId.startsWith("claude-")) return "anthropic";
    if (modelId.startsWith("gemini-")) return "google";
    if (modelId.startsWith("deepseek-")) return "deepseek";
    return "openai"; // fallback
}

/**
 * Call AI model with automatic provider routing
 */
export async function callAI(
    apiKey: string,
    provider: string,
    request: ChatRequest
): Promise<ChatResponse> {
    switch (provider) {
        case "openai":
            return callOpenAI(apiKey, request);
        case "anthropic":
            return callAnthropic(apiKey, request);
        case "google":
            return callGoogle(apiKey, request);
        case "deepseek":
            return callDeepSeek(apiKey, request);
        default:
            throw new Error(`Unknown provider: ${provider}`);
    }
}

// ─── OpenAI ───

async function callOpenAI(apiKey: string, req: ChatRequest): Promise<ChatResponse> {
    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
        model: req.model,
        temperature: req.temperature ?? 0.7,
        max_tokens: req.maxTokens,
        messages: req.messages.map(m => ({
            role: m.role as "user" | "assistant" | "system",
            content: m.content,
        })),
        ...(req.responseFormat === "json_object" ? { response_format: { type: "json_object" } } : {}),
    });

    return {
        content: completion.choices[0]?.message?.content ?? "",
        model: req.model,
        usage: {
            promptTokens: completion.usage?.prompt_tokens ?? 0,
            completionTokens: completion.usage?.completion_tokens ?? 0,
            totalTokens: completion.usage?.total_tokens ?? 0,
        },
    };
}

// ─── Anthropic ───

async function callAnthropic(apiKey: string, req: ChatRequest): Promise<ChatResponse> {
    const systemMsg = req.messages.find(m => m.role === "system");
    const chatMsgs = req.messages.filter(m => m.role !== "system");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: req.model,
            max_tokens: req.maxTokens ?? 4096,
            temperature: req.temperature ?? 0.7,
            system: systemMsg?.content ?? "",
            messages: chatMsgs.map(m => ({
                role: m.role as "user" | "assistant",
                content: m.content,
            })),
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Anthropic API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const textBlock = data.content?.find((c: { type: string }) => c.type === "text");

    return {
        content: textBlock?.text ?? "",
        model: req.model,
        usage: {
            promptTokens: data.usage?.input_tokens ?? 0,
            completionTokens: data.usage?.output_tokens ?? 0,
            totalTokens: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
        },
    };
}

// ─── Google Gemini ───

async function callGoogle(apiKey: string, req: ChatRequest): Promise<ChatResponse> {
    const systemMsg = req.messages.find(m => m.role === "system");
    const chatMsgs = req.messages.filter(m => m.role !== "system");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${req.model}:generateContent?key=${apiKey}`;

    const contents = chatMsgs.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
    }));

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents,
            systemInstruction: systemMsg ? { parts: [{ text: systemMsg.content }] } : undefined,
            generationConfig: {
                temperature: req.temperature ?? 0.7,
                maxOutputTokens: req.maxTokens ?? 4096,
                ...(req.responseFormat === "json_object" ? { responseMimeType: "application/json" } : {}),
            },
        }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Google AI error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return {
        content: text,
        model: req.model,
        usage: {
            promptTokens: data.usageMetadata?.promptTokenCount ?? 0,
            completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
            totalTokens: data.usageMetadata?.totalTokenCount ?? 0,
        },
    };
}

// ─── DeepSeek (OpenAI-compatible) ───

async function callDeepSeek(apiKey: string, req: ChatRequest): Promise<ChatResponse> {
    const client = new OpenAI({
        apiKey,
        baseURL: "https://api.deepseek.com",
    });

    const completion = await client.chat.completions.create({
        model: req.model,
        temperature: req.temperature ?? 0.7,
        max_tokens: req.maxTokens,
        messages: req.messages.map(m => ({
            role: m.role as "user" | "assistant" | "system",
            content: m.content,
        })),
    });

    return {
        content: completion.choices[0]?.message?.content ?? "",
        model: req.model,
        usage: {
            promptTokens: completion.usage?.prompt_tokens ?? 0,
            completionTokens: completion.usage?.completion_tokens ?? 0,
            totalTokens: completion.usage?.total_tokens ?? 0,
        },
    };
}

// ─── Test Connection ───

export async function testProviderConnection(
    provider: string,
    apiKey: string
): Promise<{ success: boolean; error?: string; latencyMs: number }> {
    const start = Date.now();
    try {
        const result = await callAI(apiKey, provider, {
            model: getTestModel(provider),
            messages: [{ role: "user", content: "Reply with just: ok" }],
            temperature: 0,
            maxTokens: 5,
        });
        return { success: !!result.content, latencyMs: Date.now() - start };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
            latencyMs: Date.now() - start,
        };
    }
}

function getTestModel(provider: string): string {
    const models: Record<string, string> = {
        openai: "gpt-4o-mini",
        anthropic: "claude-3.5-haiku",
        google: "gemini-2.0-flash",
        deepseek: "deepseek-chat",
    };
    return models[provider] ?? "gpt-4o-mini";
}
