// ============================================
// MemoryManager — Core Memory Engine
//
// Three key methods:
//   1. addMemory      — Ingest new memories with embeddings
//   2. retrieveContext — Semantic search + format for injection
//   3. reflectOnInteraction — Auto-learn from conversations
// ============================================

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { generateEmbedding } from "./embeddings";
import type {
    AddMemoryInput,
    RetrieveContextOptions,
    ReflectionOutput,
    MemorySearchResult,
    ChatMessage,
    FormattedContext,
} from "./types";

// ─── Supabase admin client (bypasses RLS for server-side ops) ───

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    return createClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

function getOpenAI(): OpenAI {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ─── REFLECTION SYSTEM PROMPT ───

const REFLECTION_SYSTEM_PROMPT = `You are a memory extraction assistant. Analyze the conversation below and extract exactly 3 categories of information:

1. **facts**: New factual information about the user, their company, projects, or technical stack. Only include concrete, verifiable facts.
2. **preferences**: The user's specific likes, dislikes, formatting preferences, tone preferences, or working style. Be very specific.
3. **mistakes**: Mistakes the AI made during the conversation that should be avoided in the future. Include what went wrong and the correction.

Return ONLY valid JSON in this exact format (no markdown):
{
  "facts": ["fact 1", "fact 2"],
  "preferences": ["preference 1"],
  "mistakes": ["mistake 1"]
}

If a category has no entries, return an empty array. Be concise but specific in each entry.`;

// ============================================
// MemoryManager Class
// ============================================

export class MemoryManager {
    // ─── A. INGESTION ───

    /**
     * Add a new memory with auto-generated embedding.
     * Returns the inserted memory ID.
     */
    async addMemory(input: AddMemoryInput): Promise<string> {
        const supabase = getSupabaseAdmin();

        // Generate embedding for the content
        let embedding: number[] | null = null;
        try {
            embedding = await generateEmbedding(input.content);
        } catch (err) {
            console.error("[MemoryManager] Embedding generation failed:", err);
            // Store without embedding — can backfill later
        }

        const { data, error } = await supabase
            .from("memories")
            .insert({
                user_id: input.userId,
                agent_id: input.agentId || null,
                organization_id: input.organizationId || null,
                type: input.type,
                content: input.content,
                embedding: embedding ? `[${embedding.join(",")}]` : null,
                importance: input.importance ?? 0.5,
                access_level: input.accessLevel ?? "private",
                source: input.source ?? "manual",
                source_ref: input.sourceRef ?? null,
                metadata: input.metadata ?? {},
            })
            .select("id")
            .single();

        if (error) {
            throw new Error(`[MemoryManager] Insert failed: ${error.message}`);
        }

        return data.id;
    }

    /**
     * Add multiple memories in batch.
     */
    async addMemories(inputs: AddMemoryInput[]): Promise<string[]> {
        const ids: string[] = [];
        for (const input of inputs) {
            const id = await this.addMemory(input);
            ids.push(id);
        }
        return ids;
    }

    // ─── B. RETRIEVAL ───

    /**
     * Retrieve relevant memories for a given query.
     * Uses vector similarity search via the match_memories RPC.
     * Always prioritises preferences (1.5× boost in SQL).
     */
    async retrieveContext(
        userQuery: string,
        userId: string,
        options: RetrieveContextOptions = {}
    ): Promise<FormattedContext> {
        const supabase = getSupabaseAdmin();

        // 1. Vectorise the query
        const queryEmbedding = await generateEmbedding(userQuery);

        // 2. Call match_memories RPC
        const { data, error } = await supabase.rpc("match_memories", {
            query_embedding: `[${queryEmbedding.join(",")}]`,
            match_threshold: options.matchThreshold ?? 0.65,
            match_count: options.matchCount ?? 10,
            filter_user_id: userId,
            filter_agent_id: options.agentId ?? null,
            filter_org_id: options.organizationId ?? null,
            filter_types: options.filterTypes ?? null,
            filter_access_level: options.accessLevel ?? null,
        });

        if (error) {
            console.error("[MemoryManager] Retrieval failed:", error);
            return { systemPromptBlock: "", memories: [], count: 0 };
        }

        const memories = (data ?? []) as MemorySearchResult[];

        // 3. Touch each memory to update access stats
        for (const mem of memories) {
            supabase.rpc("touch_memory", { memory_id: mem.id }).then();
        }

        // 4. Format as system prompt block
        const systemPromptBlock = this.formatContextBlock(memories);

        return {
            systemPromptBlock,
            memories,
            count: memories.length,
        };
    }

    /**
     * Format retrieved memories into a system prompt injection block.
     * Groups by type for clean presentation.
     */
    private formatContextBlock(memories: MemorySearchResult[]): string {
        if (memories.length === 0) return "";

        const groups: Record<string, string[]> = {
            preference: [],
            fact: [],
            sop: [],
            reflection: [],
        };

        for (const mem of memories) {
            const key = mem.type;
            if (groups[key]) {
                groups[key].push(mem.content);
            }
        }

        const lines: string[] = ["CONTEXT FROM MEMORY:"];

        if (groups.preference.length > 0) {
            lines.push("");
            lines.push("## User Preferences (ALWAYS respect these)");
            for (const p of groups.preference) {
                lines.push(`- ${p}`);
            }
        }

        if (groups.fact.length > 0) {
            lines.push("");
            lines.push("## Known Facts");
            for (const f of groups.fact) {
                lines.push(`- ${f}`);
            }
        }

        if (groups.sop.length > 0) {
            lines.push("");
            lines.push("## Standard Operating Procedures");
            for (const s of groups.sop) {
                lines.push(`- ${s}`);
            }
        }

        if (groups.reflection.length > 0) {
            lines.push("");
            lines.push("## Lessons Learned");
            for (const r of groups.reflection) {
                lines.push(`- ${r}`);
            }
        }

        lines.push("");
        lines.push("Use the above context to provide accurate, personalized responses.");

        return lines.join("\n");
    }

    // ─── C. THE LEARNING LOOP ───

    /**
     * Reflect on a conversation to extract learnable memories.
     * Triggered after a conversation ends or every N messages.
     *
     * Uses GPT-4o-mini for cost efficiency.
     */
    async reflectOnInteraction(
        messages: ChatMessage[],
        userId: string,
        agentId?: string,
        organizationId?: string
    ): Promise<ReflectionOutput> {
        const openai = getOpenAI();

        // Format conversation for analysis
        const conversationText = messages
            .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
            .join("\n");

        // Call GPT-4o-mini for reflection
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.3,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: REFLECTION_SYSTEM_PROMPT },
                { role: "user", content: conversationText },
            ],
        });

        const raw = response.choices[0]?.message?.content ?? "{}";
        let reflection: ReflectionOutput;

        try {
            reflection = JSON.parse(raw) as ReflectionOutput;
        } catch {
            console.error("[MemoryManager] Failed to parse reflection:", raw);
            reflection = { facts: [], preferences: [], mistakes: [] };
        }

        // Save extracted memories
        const baseInput = {
            userId,
            agentId,
            organizationId,
            source: "reflection" as const,
        };

        const promises: Promise<string>[] = [];

        for (const fact of reflection.facts) {
            promises.push(
                this.addMemory({
                    ...baseInput,
                    content: fact,
                    type: "fact",
                    importance: 0.7,
                    accessLevel: "public",
                })
            );
        }

        for (const pref of reflection.preferences) {
            promises.push(
                this.addMemory({
                    ...baseInput,
                    content: pref,
                    type: "preference",
                    importance: 0.9,  // high importance — never ignore preferences
                    accessLevel: "private",
                })
            );
        }

        for (const mistake of reflection.mistakes) {
            promises.push(
                this.addMemory({
                    ...baseInput,
                    content: `AVOID: ${mistake}`,
                    type: "reflection",
                    importance: 0.8,
                    accessLevel: "private",
                })
            );
        }

        await Promise.all(promises);

        return reflection;
    }
}

// Singleton export
export const memoryManager = new MemoryManager();
