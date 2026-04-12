# Tulie Workspace - Project Status & Implementation Plan

**Updated:** 2026-04-12  
**Project Path:** `/Users/tungnguyen/Documents/code/tulie_one/apps/tulie_workspace`

---

## Current Status

### ✅ Completed

| Step                  | Status  | Notes                                   |
| --------------------- | ------- | --------------------------------------- |
| Supabase Client Setup | ✅ Done | `src/lib/supabase.ts` created           |
| Migration Files       | ✅ Done | 5 files in `supabase/migrations/`       |
| Environment Config    | ✅ Done | `.env.local` with URL + publishable key |

### 🚧 In Progress

| Step                | Status  | Notes                         |
| ------------------- | ------- | ----------------------------- |
| Run Migrations      | ✅ Done | All 5 migration files applied |
| Auth Implementation | ✅ Done | Supabase Auth + middleware    |
| Seed Data           | ✅ Done | Seeded after auth signup      |
| UI Connection       | ✅ Done | Pages connected to Supabase   |

---

## Database Migration Files

**Location:** `supabase/migrations/`

| File                      | Content                                                                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `001_initial_schema.sql`  | Core tables + enums (organizations, user_profiles, cycles, milestones, projects, tasks, tags, task_tags, task_logs, comments)                 |
| `002_strategy_schema.sql` | Strategy tables (deals, transactions, monthly_finance, hiring_plans, marketing_metrics, content_calendar, sales_targets, content_performance) |
| `003_indexes.sql`         | Performance indexes                                                                                                                           |
| `004_triggers.sql`        | Auto-update triggers + task audit log                                                                                                         |
| `005_seed_tulie.sql`      | Seed data (4 cycles, 4 milestones, 6 projects, 20 tasks, 12 tags, 5 deals, 9 months P&L, 4 hiring plans)                                      |

---

## Next Steps (Todo)

### 1. Run Migrations on Supabase Dashboard

- Open: https://supabase.com/dashboard/project/zktmaekplppmzqdmglze
- Go to SQL Editor
- Run files in order: 001 → 002 → 003 → 004 → 005

### 2. Implement Auth

- Create `src/lib/auth/auth-provider.tsx`
- Create `src/lib/supabase-server.ts`
- Create login/register pages
- Create `src/middleware.ts` for route protection

### 3. Seed User Data

- After signup, run SQL to link user_profiles

### 4. Connect UI to Supabase

- Create data hooks: `use-tasks.ts`, `use-cycles.ts`, `use-projects.ts`, etc.
- Update pages: dashboard, tasks, board, strategy, projects, cycles

### 5. Verify

- Run `npm run type-check`
- Run `npm run build`
- Manual test

---

## Environment Variables

```
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://zktmaekplppmzqdmglze.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_o11TSuhPlIua6Jw7Uretfw_xNHuFg6K
```

---

## Data Schema Summary

### Core Tables

- `organizations` - Single org (Tulie TSS)
- `user_profiles` - Links to auth.users
- `cycles` - 4 phases (Bootstrap → Professionalize)
- `milestones` - 4 sprints in Phase 1
- `projects` - 6 workstreams
- `tasks` - ~78 tasks across all phases
- `tags` - 12 categories
- `task_tags` - Many-to-many
- `task_logs` - Audit trail
- `comments` - Task comments

### Strategy Tables

- `deals` - 5 pipeline deals
- `transactions` - Income/expense log
- `monthly_finance` - 9 months P&L (Apr-Dec 2026)
- `hiring_plans` - 4 positions
- `marketing_metrics` - Ads + outreach metrics
- `content_calendar` - 7 content items
- `sales_targets` - Monthly targets

---

## Key UUIDs Used in Seed Data

| Entity             | UUID Prefix                                                                     |
| ------------------ | ------------------------------------------------------------------------------- |
| Organization       | `a0000000-...`                                                                  |
| User (placeholder) | `a0000000-...-000000000002`                                                     |
| Cycles             | `c0000000-...`                                                                  |
| Milestones         | `b0000000-...`                                                                  |
| Projects           | `p0000000-...`                                                                  |
| Tags               | `t0000000-...`                                                                  |
| Tasks              | `tk000001` → `tk000020`                                                         |
| Deals              | `d0000001-0000-0000-0000-000000000001` → `d0000001-0000-0000-0000-000000000005` |
| Finance            | `mf000001` → `mf000009`                                                         |
| Hiring             | `hp000001` → `hp000004`                                                         |

---

## Notes

- `users` table renamed to `user_profiles` to avoid conflict with Supabase built-in `auth.users`
- All foreign keys reference `auth.users(id)` directly for user fields
- Seed data uses placeholder user ID - must be updated after real signup
- Single-user mode: RLS disabled for now

---

## Files Reference

**Source Code:**

- `/Users/tungnguyen/Documents/code/tulie_workspace/` (original)
- `/Users/tungnguyen/Documents/code/tulie_one/apps/tulie_workspace/` (working copy)

**Mock Data (for reference):**

- `src/lib/mock/data.ts` - Tasks, cycles, projects, tags
- `src/lib/mock/strategy-data.ts` - Deals, finance, hiring

**Supabase Connection:**

- Project: `zktmaekplppmzqdmglze`
- Region: ap-northeast-2
