# Database Naming Conventions - Tulie One

## Overview

Multi-tenant database strategy using PostgreSQL schemas with clear ownership boundaries.

## Schema Ownership Matrix

| Schema      | Owner App          | Table Prefix | Description                                                         |
| ----------- | ------------------ | ------------ | ------------------------------------------------------------------- |
| `public`    | tulie_crm          | `crm_`       | Core CRM tables (customers, deals, quotations, contracts, invoices) |
| `workforce` | tulie_workforce    | `wf_`        | AI agents, threads, FB ads, content posts                           |
| `workspace` | tulie_workspace    | `ws_`        | Project management, tasks, cycles, notifications                    |
| `erp`       | tulie_erp (future) | `erp_`       | Accounting, invoices, budgets                                       |
| `hrm`       | tulie_hrm (future) | `hrm_`       | Employees, payroll, attendance                                      |

## Table Naming Rules

### 1. All tables MUST have schema prefix

```sql
-- CORRECT
crm_customers, crm_deals, crm_quotations
wf_agents, wf_tasks, wf_threads
ws_projects, ws_tasks, ws_cycles

-- WRONG (legacy, avoid)
customers, deals, agents, tasks
```

### 2. Cross-schema foreign keys MUST indicate source schema

When a table references a table in another schema, prefix the column with source schema:

```sql
-- ws_tasks references crm_projects (CRM owns the source)
CREATE TABLE ws_tasks (
    id UUID PRIMARY KEY,
    crm_project_id UUID REFERENCES crm_projects(id),  -- prefix = source schema
    wf_agent_id UUID REFERENCES wf_agents(id),         -- prefix = source schema
    title TEXT NOT NULL,
    ...
);
```

### 3. Junction tables use combined prefixes

```sql
-- Many-to-many between ws_projects and ws_tags
ws_project_tags (
    ws_project_id UUID REFERENCES ws_projects(id),
    ws_tag_id UUID REFERENCES ws_tags(id),
    PRIMARY KEY (ws_project_id, ws_tag_id)
)
```

## Column Naming Rules

### Standard Columns (All Tables)

| Column       | Type        | Description                              |
| ------------ | ----------- | ---------------------------------------- |
| `{prefix}id` | UUID        | Primary key (e.g., `crm_id`, `wf_id`)    |
| `created_at` | TIMESTAMPTZ | Creation timestamp                       |
| `updated_at` | TIMESTAMPTZ | Last update timestamp                    |
| `created_by` | UUID        | User who created (references auth.users) |
| `is_active`  | BOOLEAN     | Soft delete flag                         |

### Common Columns

| Column            | Type      | Description                               |
| ----------------- | --------- | ----------------------------------------- |
| `name`            | TEXT      | Display name                              |
| `description`     | TEXT      | Optional description                      |
| `status`          | TEXT/ENUM | Status (pending, active, completed, etc.) |
| `priority`        | TEXT/ENUM | Priority (low, medium, high, urgent)      |
| `user_id`         | UUID      | Owner user                                |
| `organization_id` | UUID      | Organization scope                        |

### Foreign Key Columns

Pattern: `{source_prefix}_{table}_{ref_prefix}id`

```sql
-- crm_project references wf_agent
crm_project.wf_agent_id  -- source_prefix = wf (from workforce schema)

-- ws_task references crm_project and wf_agent
ws_task.crm_project_id   -- CRM project
ws_task.wf_agent_id      -- Workforce agent
```

## Index Naming

Pattern: `idx_{schema_prefix}_{table}_{columns}`

```sql
-- Index on workforce.tasks for organization lookup
CREATE INDEX idx_wf_tasks_org ON workforce.wf_tasks(organization_id);

-- Index on workspace.tasks for project lookup
CREATE INDEX idx_ws_tasks_project ON workspace.ws_tasks(ws_project_id);
```

## Trigger Naming

Pattern: `{source_prefix}_sync_{target}_{event}`

```sql
-- CRM creates project, trigger creates workspace project
CREATE TRIGGER crm_sync_ws_project
    AFTER INSERT ON crm_projects
    FOR EACH ROW EXECUTE FUNCTION crm.sync_workspace_on_project_create();

-- Workforce creates FB alert, trigger creates workspace notification
CREATE TRIGGER wf_sync_ws_notification
    AFTER INSERT ON wf_fb_alerts
    FOR EACH ROW EXECUTE FUNCTION wf.sync_workspace_on_fb_alert();
```

## Function Naming

Pattern: `{schema_prefix}.{action}_{target}`

```sql
-- CRM schema functions
crm.sync_workspace_on_project_create()
crm.sync_workspace_on_work_item_confirmed()

-- Workforce schema functions
wf.sync_workspace_on_fb_alert()
wf.sync_workspace_on_content_pending()

-- Workspace schema functions
ws.update_project_counts()
ws.get_overdue_tasks()
```

## Migration File Naming

Pattern: `{YYYYMMDD}_{HHMMSS}_{description}.sql`

```sql
-- CRM migrations
20260322_000001_crm_core_tables.sql
20260322_000002_crm_rls_policies.sql

-- Workspace migrations
20260322_000001_ws_schema_setup.sql
20260322_000002_ws_tasks_table.sql

-- Workforce migrations
20260322_000001_wf_schema_setup.sql
20260322_000002_wf_agents_table.sql
```

## RLS Policy Naming

Pattern: `{action}_{role}_{table}_{scope}`

```sql
-- Admin and leader have full access
admin_leader_crm_customers_all

-- Staff can only see own records
staff_crm_customers_own

-- Authenticated users can view
authenticated_ws_projects_select
```

## Enum Naming

Pattern: `{prefix}_{table}_{column}_enum`

```sql
CREATE TYPE crm_project_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE ws_task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
```

## Anti-Patterns to Avoid

1. **No generic table names**: `users`, `tasks`, `projects` without prefix
2. **No cross-schema implicit FK**: Always prefix cross-schema references
3. **No schema without owner**: Every schema must have a designated owning app
4. **No trigger in wrong schema**: Triggers fire on source schema, defined in source schema

## Migration Checklist

When creating a new migration:

- [ ] Table name has correct prefix for schema owner
- [ ] Primary key uses `{prefix}id` pattern
- [ ] Cross-schema foreign keys have source schema prefix
- [ ] Indexes follow `idx_{prefix}_{table}_{col}` pattern
- [ ] Triggers are defined in source schema
- [ ] RLS policies are created for all tables
- [ ] Migration file is in correct app's migration folder

## Enforcement

CI/CD should check:

1. Migration creates tables only in its owning schema
2. No migration creates tables in another app's schema
3. All tables have proper prefix
