/**
 * @repo/supabase-utils
 *
 * Shared Supabase utilities for Tulie One multi-app architecture.
 *
 * Features:
 * - Schema configuration management
 * - Type-safe client factory
 * - Cross-schema access helpers
 */

export {
  SCHEMA_CONFIG,
  SCHEMA_OWNERS,
  type AppSchema,
  type SchemaName,
  getSchemaForApp,
  isValidSchema,
  getAllSchemas,
} from "./schema-config";

export {
  createServerSupabaseClient,
  createBrowserSupabaseClient,
  createCrossSchemaClients,
  type CreateClientOptions,
} from "./create-client";
