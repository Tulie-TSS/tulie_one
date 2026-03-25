// ============================================
// Memory Engine — Type Definitions
// ============================================

export type MemoryType = "fact" | "preference" | "sop" | "reflection";
export type MemorySource = "task" | "manual" | "document" | "reflection";
export type MemoryAccessLevel = "public" | "private";

export interface MemoryEntry {
    id: string;
    userId: string;
    agentId: string | null;
    organizationId: string | null;
    type: MemoryType;
    content: string;
    embedding: number[] | null;
    importance: number;
    accessLevel: MemoryAccessLevel;
    metadata: Record<string, unknown>;
    source: MemorySource;
    sourceRef: string | null;
    accessCount: number;
    lastAccessedAt: string;
    createdAt: string;
}

export interface MemorySearchResult {
    id: string;
    userId: string;
    agentId: string | null;
    type: MemoryType;
    content: string;
    importance: number;
    accessLevel: string;
    source: string;
    sourceRef: string | null;
    similarity: number;
    weightedScore: number;
}

export interface AddMemoryInput {
    content: string;
    type: MemoryType;
    userId: string;
    agentId?: string;
    organizationId?: string;
    importance?: number;
    accessLevel?: MemoryAccessLevel;
    source?: MemorySource;
    sourceRef?: string;
    metadata?: Record<string, unknown>;
}

export interface RetrieveContextOptions {
    agentId?: string;
    organizationId?: string;
    matchCount?: number;
    matchThreshold?: number;
    filterTypes?: MemoryType[];
    accessLevel?: string;
}

export interface ReflectionOutput {
    facts: string[];
    preferences: string[];
    mistakes: string[];
}

export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

export interface FormattedContext {
    systemPromptBlock: string;
    memories: MemorySearchResult[];
    count: number;
}
