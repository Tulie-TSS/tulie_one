# ⚠️ MIGRATIONS DEPRECATED - ACTION REQUIRED

## Status: **DO NOT DEPLOY** until issues are resolved

---

## Issues Identified

### 1. Schema Conflict with CRM

The `000_all_in_one.sql` file creates tables in the `public` schema:

- `organizations`, `user_profiles`, `cycles`, `projects`, `tasks`, `tags`, `deals`, etc.

**Problem:** The CRM app (`tulie_crm`) also uses the `public` schema and has tables with the SAME names:

- `public.projects`, `public.tasks`, `public.users`, `public.notifications`, etc.

**If deployed:** This migration would DROP CRM tables and replace them with Workspace tables = **DATA LOSS**

### 2. Dangerous DROP Statements

This migration has DROP statements at the top:

```sql
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
-- etc.
```

These would destroy CRM production data.

### 3. Missing Schema Qualification

All tables are created in `public` without schema prefix, causing ambiguity.

---

## Resolution Plan

### Option A: Workspace App Uses Dedicated Schema (Recommended)

1. **Rename all tables** to include `ws_` prefix and create them in `workspace` schema:

   ```sql
   CREATE TABLE workspace.ws_organizations (...);
   CREATE TABLE workspace.ws_projects (...);
   CREATE TABLE workspace.ws_tasks (...);
   ```

2. **Update Supabase client** in workspace app to use `workspace` schema

3. **Migrate existing data** from CRM's `workspace` schema if needed

### Option B: Workspace App Uses CRM Schema (Less Clean)

1. **Remove duplicate tables** - Use CRM tables directly
2. **Update queries** to use CRM schema client
3. **Delete this migration file** after migration

---

## Who Owns What

| Schema      | Owner                 | Tables                    |
| ----------- | --------------------- | ------------------------- |
| `public`    | tulie_crm             | Core CRM tables           |
| `workspace` | tulie_crm (currently) | Project management tables |
| `workforce` | tulie_crm (currently) | AI agents, FB ads         |

**Note:** Workspace and Workforce schemas were created by CRM migrations but conceptually belong to their respective apps.

---

## Next Steps

1. ❌ **DO NOT** run this migration on production
2. ✅ Run `./scripts/backup-supabase.sh` to backup current database
3. 📋 Decide on Option A or B above
4. 🔧 Implement the chosen option
5. ✅ Test thoroughly before deploying

---

## Contact

For questions about this migration, contact the team that owns the tulie_workspace app.
