// ============================================
// Memory Engine — Public API
// ============================================

export { MemoryManager, memoryManager } from "./memory-manager";
export { generateEmbedding, generateEmbeddings } from "./embeddings";
export type {
    MemoryType,
    MemorySource,
    MemoryAccessLevel,
    MemoryEntry,
    MemorySearchResult,
    AddMemoryInput,
    RetrieveContextOptions,
    ReflectionOutput,
    ChatMessage,
    FormattedContext,
} from "./types";
