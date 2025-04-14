/**
 * Supabase Client Factory for Tulie One
 *
 * Provides type-safe client creation with schema awareness.
 * Each app should use its designated schema.
 */

import { createServerClient, createBrowserClient } from "@supabase/ssr";
import type { AppSchema, SchemaName } from "./schema-config";
import { SCHEMA_CONFIG, getSchemaForApp } from "./schema-config";

export interface CreateClientOptions {
  schema?: AppSchema;
  cookies?: {
    getAll(): Array<{ name: string; value: string }>;
    setAll?(
      cookies: Array<{
        name: string;
        value: string;
        options?: Record<string, unknown>;
      }>,
    ): void;
  };
}

/**
 * Create a server-side Supabase client with schema awareness
 */
export function createServerSupabaseClient(
  options: CreateClientOptions & { cookies: CreateClientOptions["cookies"] },
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. " +
        "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
    );
  }

  const schema = options.schema
    ? getSchemaForApp(options.schema)
    : SCHEMA_CONFIG.crm; // Default to CRM

  return createServerClient(url, key, {
    db: { schema },
    cookies: options.cookies,
  });
}

/**
 * Create a browser-side Supabase client with schema awareness
 */
export function createBrowserSupabaseClient(options?: { schema?: AppSchema }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. " +
        "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
    );
  }

  const schema = options?.schema
    ? getSchemaForApp(options.schema)
    : SCHEMA_CONFIG.crm; // Default to CRM

  return createBrowserClient(url, key, {
    db: { schema },
  });
}

/**
 * Create clients for cross-schema access
 */
export function createCrossSchemaClients(
  cookies: CreateClientOptions["cookies"],
) {
  return {
    /** CRM client - accesses public schema */
    crm: createServerSupabaseClient({ schema: "crm", cookies }),

    /** Workforce client - accesses workforce schema */
    workforce: createServerSupabaseClient({ schema: "workforce", cookies }),

    /** Workspace client - accesses workspace schema */
    workspace: createServerSupabaseClient({ schema: "workspace", cookies }),
  };
}

/**
 * Example usage:
 *
 * // In a server component (App Router)
 * import { cookies } from 'next/headers';
 *
 * export default async function Page() {
 *   const cookieStore = await cookies();
 *
 *   // CRM client
 *   const crm = createServerSupabaseClient({
 *     schema: 'crm',
 *     cookies: cookieStore
 *   });
 *
 *   // Or create all cross-schema clients
 *   const clients = createCrossSchemaClients(cookieStore);
 *   const { data: crmData } = await clients.crm.from('customers').select();
 *   const { data: wsData } = await clients.workspace.from('tasks').select();
 * }
 *
 * // In a client component
 * const crm = createBrowserSupabaseClient({ schema: 'crm' });
 * const { data } = await crm.from('customers').select();
 */
