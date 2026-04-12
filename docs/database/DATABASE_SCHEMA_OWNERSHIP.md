# Database Schema Ownership - Tulie One

## Overview

Tulie One uses a **single Supabase project** (`zktmaekplppmzqdmglze.supabase.co`) with **multiple PostgreSQL schemas** to separate data between apps.

## Schema Ownership Matrix

| Schema      | Owner App       | Status        | Tables                     | Cross-References                      |
| ----------- | --------------- | ------------- | -------------------------- | ------------------------------------- |
| `public`    | tulie_crm       | ✅ Production | CRM core tables            | → workspace.projects, workspace.tasks |
| `workforce` | tulie_workforce | ✅ Production | AI agents, threads, FB ads | ← public.users                        |
| `workspace` | tulie_workspace | ✅ Production | Projects, tasks, cycles    | ← public.projects, public.work_items  |
| `erp`       | tulie_erp       | 🔜 Future     | Accounting tables          | TBD                                   |
| `hrm`       | tulie_hrm       | 🔜 Future     | HRM tables                 | TBD                                   |

## Current State (April 2026)

### ✅ Production Apps

#### tulie_crm (Owner of `public` schema)

- **Location:** `apps/tulie_crm`
- **Migrations:** `apps/tulie_crm/supabase/migrations/`
- **Tables:** customers, deals, quotations, contracts, invoices, projects, leads, products, users, notifications, work_items
- **Also manages:** `workspace` and `workforce` schemas via migrations

#### tulie_workforce (Owner of `workforce` schema)

- **Location:** `apps/tulie_workforce`
- **Migrations:** ⚠️ DEPRECATED - see below
- **Tables:** agents, threads, messages, tasks (in `workforce` schema via CRM migration)
- **Client config:** Uses `workforce` schema

#### tulie_workspace (Owner of `workspace` schema)

- **Location:** `apps/tulie_workspace`
- **Migrations:** ⚠️ DEPRECATED - see below
- **Tables:** projects, tasks, cycles, tags (in `workspace` schema via CRM migration)
- **Client config:** Currently uses `public` schema (❌ needs fixing)

### ⚠️ DEPRECATED Migrations

Due to schema conflicts, the following migrations have been deprecated:

| File                                                                                  | Issue                                                 | Action Required               |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------- |
| `tulie_workspace/supabase/migrations/000_all_in_one.sql.DEPRECATED_DO_NOT_DEPLOY`     | Creates tables in `public` schema, conflicts with CRM | Fix to use `workspace` schema |
| `tulie_workforce/supabase/migrations/001_initial_schema.sql.DEPRECATED_DO_NOT_DEPLOY` | Creates tables in `public` schema, conflicts with CRM | Fix to use `workforce` schema |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SUPABASE PROJECT: zktmaekplppmzqdmglze                     │
│                         Single Database, Multiple Schemas                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ SCHEMA: public (Owner: tulie_crm)                                    │    │
│  │                                                                         │    │
│  │ Core CRM tables:                                                       │    │
│  │   ├── customers, contacts                                              │    │
│  │   ├── deals, quotations, contracts                                     │    │
│  │   ├── invoices, products                                               │    │
│  │   ├── projects, leads, users                                           │    │
│  │   ├── notifications, work_items                                        │    │
│  │                                                                         │    │
│  │ Triggers (source schema):                                             │    │
│  │   └── crm_trigger_order_to_workspace                                  │    │
│  │       (fires on public.work_items → creates workspace.tasks)           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ SCHEMA: workspace (Owner: tulie_workspace)                           │    │
│  │ (Created by tulie_crm migration 20260322_workspace_schema.sql)        │    │
│  │                                                                         │    │
│  │ Tables:                                                               │    │
│  │   ├── projects (with crm_project_id FK to public.projects)            │    │
│  │   ├── tasks (with crm_project_id, crm_work_item_id FKs)               │    │
│  │   ├── cycles, tags, task_tags, task_comments                           │    │
│  │   ├── templates, notifications                                         │    │
│  │                                                                         │    │
│  │ Internal triggers:                                                    │    │
│  │   └── trigger_ws_task_completion (on workspace.tasks)                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ SCHEMA: workforce (Owner: tulie_workforce)                            │    │
│  │ (Created by tulie_crm migration 20260322_workforce_schema.sql)       │    │
│  │                                                                         │    │
│  │ Tables:                                                               │    │
│  │   ├── organizations, profiles, agents                                │    │
│  │   ├── threads, messages, tasks                                        │    │
│  │   ├── documents, document_embeddings, memories                       │    │
│  │   ├── fb_ad_accounts, fb_campaigns, fb_adsets, fb_ads, fb_alerts       │    │
│  │   ├── content_posts, content_templates                               │    │
│  │   ├── ai_providers, ai_models, ai_model_settings, ai_usage_log        │    │
│  │                                                                         │    │
│  │ Internal triggers:                                                    │    │
│  │   └── trigger_fb_alert_to_workspace (on workforce.fb_alerts)         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ SCHEMA: erp (Owner: tulie_erp) - FUTURE                               │    │
│  │   acc_accounts, acc_fiscal_years, acc_journal_entries, etc.          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ SCHEMA: hrm (Owner: tulie_hrm) - FUTURE                               │    │
│  │   hrm_employees, hrm_departments, hrm_attendances, etc.             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Migration File Locations

```
apps/
├── tulie_crm/
│   └── supabase/migrations/
│       ├── 20260322_workspace_schema.sql      # Creates workspace.* tables
│       ├── 20260322_workforce_schema.sql     # Creates workforce.* tables
│       ├── 20260322_expose_schemas.sql       # PostgREST config
│       ├── 20260323_cross_module_triggers.sql # Cross-schema triggers
│       └── 20260412_refactor_triggers.sql     # NEW: Properly placed triggers
│
├── tulie_workspace/
│   └── supabase/migrations/
│       ├── README_DEPRECATED.md              # ⚠️ DEPRECATED
│       └── 000_all_in_one.sql.DEPRECATED     # ⚠️ DO NOT DEPLOY
│
├── tulie_workforce/
│   └── supabase/migrations/
│       ├── README_DEPRECATED.md              # ⚠️ DEPRECATED
│       └── 001_initial_schema.sql.DEPRECATED  # ⚠️ DO NOT DEPLOY
│
├── tulie_erp/
│   └── supabase/migrations/                  # (empty - future)
│
└── tulie_hrm/
    └── supabase/migrations/                  # (empty - future)
```

## Trigger Conventions

### Rule: Triggers belong to SOURCE schema

When a trigger fires on table A and writes to table B:

- **Function** should be in schema A
- **Trigger** should be defined in schema A

### Current Triggers

| Trigger                          | Schema    | Fires On            | Writes To               | Convention            |
| -------------------------------- | --------- | ------------------- | ----------------------- | --------------------- |
| `crm_trigger_order_to_workspace` | public    | public.work_items   | workspace.tasks         | ✅ Correct            |
| `trigger_ws_task_completion`     | workspace | workspace.tasks     | workspace.tasks         | ✅ Correct (internal) |
| `trigger_fb_alert_to_workspace`  | workforce | workforce.fb_alerts | workspace.notifications | ✅ Correct            |

## Shared Package: @repo/supabase-utils

Location: `packages/supabase-utils/`

Provides:

- Schema configuration (`SCHEMA_CONFIG`)
- Type-safe client factory (`createServerSupabaseClient`, `createBrowserSupabaseClient`)
- Cross-schema client helpers (`createCrossSchemaClients`)

### Usage

```typescript
import {
  SCHEMA_CONFIG,
  createServerSupabaseClient,
  createCrossSchemaClients,
} from "@repo/supabase-utils";

// Single schema client
const crm = createServerSupabaseClient({
  schema: "crm",
  cookies: cookieStore,
});

// All cross-schema clients
const clients = createCrossSchemaClients(cookieStore);
const crmData = await clients.crm.from("customers").select();
const wsData = await clients.workspace.from("tasks").select();
```

## Next Steps

### Immediate (Before deploying workspace/workforce apps)

1. **Fix tulie_workspace:**
   - Update Supabase client to use `workspace` schema (not `public`)
   - Create new migration for workspace tables in `workspace` schema
   - Or: Use existing `workspace.*` tables created by CRM

2. **Fix tulie_workforce:**
   - Verify `workforce.*` tables exist (created by CRM)
   - Create new migration if additional tables needed
   - Use existing `workforce.*` tables

### Future (When adding ERP/HRM)

1. Create schema: `CREATE SCHEMA erp;` and `CREATE SCHEMA hrm;`
2. Create migrations in respective apps
3. Use `@repo/supabase-utils` for schema-aware client creation
4. Document cross-schema references

## Emergency Rollback

If migrations cause issues:

```sql
-- Disable problematic trigger
DROP TRIGGER IF EXISTS crm_trigger_order_to_workspace ON public.work_items;

-- Re-enable old trigger (if it exists)
CREATE TRIGGER trigger_crm_order_to_workspace
    AFTER UPDATE OF status ON public.work_items
    FOR EACH ROW
    EXECUTE FUNCTION workspace.on_crm_order_confirmed();
```

## Contacts

| Schema    | Owner           | App Team          |
| --------- | --------------- | ----------------- |
| public    | tulie_crm       | CRM Team          |
| workspace | tulie_workspace | Workspace Team    |
| workforce | tulie_workforce | Workforce Team    |
| erp       | tulie_erp       | ERP Team (future) |
| hrm       | tulie_hrm       | HRM Team (future) |
