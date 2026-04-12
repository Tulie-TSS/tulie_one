# ⚠️ MIGRATIONS DEPRECATED - ACTION REQUIRED

## Status: **DO NOT DEPLOY** until issues are resolved

---

## Issues Identified

### 1. Schema Mismatch

The `001_initial_schema.sql` creates tables in the `public` schema without schema prefix:

- `profiles`, `agents`, `threads`, `messages`, `tasks`

**Problem:**

- CRM app (`tulie_crm`) has already created a `workforce` schema with similar tables:
  - `workforce.agents`, `workforce.threads`, `workforce.messages`, `workforce.tasks`
- The workforce app's `supabase/server.ts` is already configured to use `workforce` schema

**Result:** This migration creates tables in `public` while the code queries `workforce` = **Tables created but never used!**

### 2. Conflict with CRM

If CRM also has a `public.profiles` table (likely), there would be naming conflicts.

---

## Current Architecture

```
Supabase Project: zktmaekplppmzqdmglze

tulie_crm (production):
├── public schema → CRM tables (customers, deals, projects, users, etc.)
├── workforce schema → AI workforce tables (agents, threads, messages, tasks) - CREATED BY CRM
└── workspace schema → Project management tables (projects, tasks, cycles) - CREATED BY CRM

tulie_workforce (dev):
├── Client configured to use: workforce schema
├── But migration creates tables in: public schema ❌
└── Result: Code queries workforce.* but tables are in public.*
```

---

## Resolution Plan

### 1. Verify Workforce Schema Exists

Check if `workforce.agents`, `workforce.threads`, etc. exist (created by CRM)

### 2. If workforce schema tables exist:

- Delete this migration file
- Update workforce app code to use the existing `workforce` schema tables
- No new tables needed

### 3. If workforce schema tables do NOT exist:

- Rename tables to `wf_*` prefix
- Create them in `workforce` schema:
  ```sql
  CREATE TABLE workforce.wf_agents (...);
  CREATE TABLE workforce.wf_threads (...);
  CREATE TABLE workforce.wf_messages (...);
  CREATE TABLE workforce.wf_tasks (...);
  ```
- Update RLS policies

---

## Next Steps

1. ❌ **DO NOT** run this migration on production
2. ✅ Check what tables exist in `workforce` schema (via Supabase Dashboard)
3. 📋 Decide if workforce app should use existing CRM-created workforce tables or create new ones
4. 🔧 Fix migration or delete it
5. ✅ Test thoroughly before deploying

---

## Tables Currently in workforce Schema (from CRM)

| Table                           | Purpose                            |
| ------------------------------- | ---------------------------------- |
| `workforce.organizations`       | AI organizations                   |
| `workforce.profiles`            | User profiles linked to auth.users |
| `workforce.agents`              | AI agents                          |
| `workforce.threads`             | Chat threads                       |
| `workforce.messages`            | Chat messages                      |
| `workforce.tasks`               | Agent tasks                        |
| `workforce.documents`           | Documents                          |
| `workforce.document_embeddings` | Vector embeddings                  |
| `workforce.memories`            | Agent memories                     |
| `workforce.fb_ad_accounts`      | Facebook ad accounts               |
| `workforce.fb_campaigns`        | FB campaigns                       |
| `workforce.fb_adsets`           | FB ad sets                         |
| `workforce.fb_ads`              | FB ads                             |
| `workforce.fb_alerts`           | FB alerts                          |
| `workforce.content_posts`       | Content posts                      |
| `workforce.ai_providers`        | AI provider config                 |
| `workforce.ai_models`           | AI models config                   |
| `workforce.ai_usage_log`        | AI usage tracking                  |
