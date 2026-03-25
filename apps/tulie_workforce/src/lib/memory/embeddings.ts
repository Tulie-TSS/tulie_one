// ============================================
// OpenAI Embeddings Helper
// Uses text-embedding-3-small (1536 dims)
// ============================================

import OpenAI from "openai";

let _client: OpenAI | null = null;

function getClient(): OpenAI {
    if (!_client) {
        _client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return _client;
}

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

/**
 * Generate a vector embedding for a single text string.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const client = getClient();

    const response = await client.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text.trim(),
        dimensions: EMBEDDING_DIMENSIONS,
    });

    return response.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts in a single batch request.
 * Returns an array of embeddings in the same order as input texts.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    const client = getClient();

    // OpenAI supports up to 2048 inputs per batch, chunk if needed
    const BATCH_SIZE = 2048;
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        const batch = texts.slice(i, i + BATCH_SIZE).map((t) => t.trim());

        const response = await client.embeddings.create({
            model: EMBEDDING_MODEL,
            input: batch,
            dimensions: EMBEDDING_DIMENSIONS,
        });

        // Sort by index to preserve order
        const sorted = response.data.sort((a, b) => a.index - b.index);
        allEmbeddings.push(...sorted.map((d) => d.embedding));
    }

    return allEmbeddings;
}

export { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS };
