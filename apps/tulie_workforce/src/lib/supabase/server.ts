import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Create a Supabase server client scoped to the `workforce` schema.
 * 
 * This allows Workforce app to use `.from("agents")` which maps to
 * `workforce.agents` in the shared Supabase project (same DB as CRM).
 * 
 * CRM tables in `public` schema are untouched and inaccessible
 * through this client unless explicitly specified.
 */
export const createClient = async () => {
    const cookieStore = await cookies();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return createServerClient(
        url || "https://placeholder.supabase.co",
        key || "placeholder-key",
        {
            db: {
                schema: "workforce",
            },
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing sessions.
                    }
                },
            },
        }
    );
};

/**
 * Create a Supabase client that queries CRM tables (public schema).
 * Use this when Workforce needs to READ CRM data (e.g., orders, customers).
 * 
 * Example: const crm = await createCrmClient();
 *          const { data } = await crm.from("projects").select("*");
 */
export const createCrmClient = async () => {
    const cookieStore = await cookies();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return createServerClient(
        url || "https://placeholder.supabase.co",
        key || "placeholder-key",
        {
            db: {
                schema: "public",
            },
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Ignored in Server Components
                    }
                },
            },
        }
    );
};

/**
 * Create a Supabase client for workspace schema.
 * Use this when Workforce AI agents need to read/write workspace tasks.
 * 
 * Example: const ws = await createWorkspaceClient();
 *          const { data } = await ws.from("tasks").select("*").eq("status", "doing");
 */
export const createWorkspaceClient = async () => {
    const cookieStore = await cookies();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return createServerClient(
        url || "https://placeholder.supabase.co",
        key || "placeholder-key",
        {
            db: {
                schema: "workspace",
            },
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Ignored in Server Components
                    }
                },
            },
        }
    );
};
