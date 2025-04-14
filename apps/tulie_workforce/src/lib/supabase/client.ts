import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export const createClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Return a minimal mock client if credentials are not configured
    if (!url || !key) {
        return createBrowserClient<Database>(
            "https://placeholder.supabase.co",
            "placeholder-key"
        );
    }

    return createBrowserClient<Database>(url, key);
};
