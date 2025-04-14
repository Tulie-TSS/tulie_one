# Session Context - Tulie Workspace

## Current State (2026-04-12)

- Supabase SQL migration: FIXED UUID errors
- Dev server: port 3003

## Fixed Issues

| Error                                    | Fix                                                           |
| ---------------------------------------- | ------------------------------------------------------------- |
| `m0000000-...` invalid UUID (milestones) | Changed to `b0000000-...` (PROJECT_STATUS.md + migration)     |
| `90000001` invalid UUID (deals)          | Changed to `d0000001-0000-0000-0000-000000000001` (migration) |

## Current Context

- Workspace: `/Users/tungnguyen/Documents/code/tulie_one/apps/tulie_workspace`
- Database: Supabase (`zktmaekplppmzqdmglze`)
- App running: `npm run dev` on port 3003

## Next Steps

1. Test app at localhost:3003
2. Verify Supabase connection works
3. Continue development

## Project UUID Prefixes (from docs)

| Entity       | Prefix                      |
| ------------ | --------------------------- |
| Organization | `a0000000-...`              |
| Cycles       | `c0000000-...`              |
| Milestones   | `b0000000-...`              |
| Projects     | `f0000000-...`              |
| Tags         | `e0000000-...`              |
| Deals        | `d0000001-...-00000000000X` |
| Tasks        | `tk000001` → `tk000020`     |
