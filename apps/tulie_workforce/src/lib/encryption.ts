// Simple AES-256 encryption for API keys
// Uses Web Crypto API (available in Node 18+)

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;

function getEncryptionKey(): string {
    const key = process.env.API_KEYS_ENCRYPTION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!key) throw new Error("No encryption key configured");
    return key;
}

async function deriveKey(secret: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret).slice(0, 32).buffer as ArrayBuffer,
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: encoder.encode("tulie-ai-keys"),
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: ALGORITHM, length: KEY_LENGTH },
        false,
        ["encrypt", "decrypt"]
    );
}

export async function encryptApiKey(plaintext: string): Promise<string> {
    const key = await deriveKey(getEncryptionKey());
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();

    const encrypted = await crypto.subtle.encrypt(
        { name: ALGORITHM, iv },
        key,
        encoder.encode(plaintext)
    );

    // Combine IV + ciphertext, encode as base64
    const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return Buffer.from(combined).toString("base64");
}

export async function decryptApiKey(ciphertext: string): Promise<string> {
    const key = await deriveKey(getEncryptionKey());
    const combined = Buffer.from(ciphertext, "base64");

    const iv = combined.subarray(0, 12);
    const data = combined.subarray(12);

    const decrypted = await crypto.subtle.decrypt(
        { name: ALGORITHM, iv },
        key,
        data
    );

    return new TextDecoder().decode(decrypted);
}

export function maskApiKey(key: string): string {
    if (key.length <= 8) return "••••••••";
    const prefix = key.slice(0, 3);
    const suffix = key.slice(-4);
    return `${prefix}${"•".repeat(Math.min(key.length - 7, 20))}${suffix}`;
}
