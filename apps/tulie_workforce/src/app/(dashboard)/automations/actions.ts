"use server";

export async function getN8nWorkflows() {
    const baseUrl = process.env.N8N_BASE_URL || "https://n8n.tulie.app";
    const apiKey = process.env.N8N_API_KEY;

    if (!apiKey) {
        console.error("N8N_API_KEY is not defined in environment variables");
        return [];
    }

    try {
        const response = await fetch(`${baseUrl}/api/v1/workflows`, {
            method: "GET",
            headers: {
                "X-N8N-API-KEY": apiKey,
                "Content-Type": "application/json",
            },
            next: { revalidate: 30 } // Cache for 30s
        });

        if (!response.ok) {
            console.error(`n8n API responded with ${response.status}`);
            return [];
        }

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error("Failed to fetch n8n workflows:", error);
        return [];
    }
}
