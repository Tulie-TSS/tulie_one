---
description: Quy trình xử lý tác vụ dự án - AI tự nhận diện skill phù hợp
---

# 🎯 Auto Agent Routing — Tulie One Monorepo

## Thông tin Dự án

- **Monorepo**: `tulie_one` (Turborepo + npm workspaces)
- **Apps**: `tulie_crm`, `tulie_erp`, `tulie_workforce`, `tulie_workspace`
- **Shared packages**: `packages/db-types`, `packages/ui`, `packages/events`, `packages/eslint-config`, `packages/typescript-config`
- **Tech stack**: Next.js 16, React 19, TypeScript 5, TailwindCSS 4, Supabase, Radix UI
- **Giai đoạn**: Development → Production

## Cách Hệ thống Hoạt động

Khi nhận yêu cầu từ user, AI sẽ:

1. **Phân loại tác vụ** theo bảng routing bên dưới
2. **Đọc SKILL.md** tương ứng bằng `view_file` (BẮT BUỘC trước khi thực thi)
3. **Áp dụng đúng persona & quy trình** từ skill đó
4. **Thực thi** theo context dự án, KHÔNG sáng tạo thêm tính năng

> ⚠️ **QUAN TRỌNG**: Mỗi skill nằm tại `/Users/tungnguyen/.gemini/antigravity/skills/{skill-name}/SKILL.md`. Luôn `view_file` trước khi hành động.

---

## Bảng Routing — Chọn Skill theo Tác vụ

### 🎨 UI & Thiết kế

| Khi user yêu cầu | Skill | Path |
|---|---|---|
| Thiết kế giao diện, design system, component visual | `agency-ui-designer` | `skills/agency-ui-designer/SKILL.md` |
| CSS system, responsive, technical UX foundation | `agency-ux-architect` | `skills/agency-ux-architect/SKILL.md` |
| Nghiên cứu UX, user flow, usability testing | `agency-ux-researcher` | `skills/agency-ux-researcher/SKILL.md` |

### 💻 Phát triển Code

| Khi user yêu cầu | Skill | Path |
|---|---|---|
| Code React component, Next.js page, frontend logic | `agency-frontend-developer` | `skills/agency-frontend-developer/SKILL.md` |
| API route, database schema, Supabase, backend logic | `agency-backend-architect` | `skills/agency-backend-architect/SKILL.md` |
| Kiến trúc hệ thống, refactor lớn, ADR | `agency-software-architect` | `skills/agency-software-architect/SKILL.md` |
| Code full-stack phức tạp (đa app, shared packages) | `agency-senior-developer` | `skills/agency-senior-developer/SKILL.md` |
| Prototype, POC, demo nhanh | `agency-rapid-prototyper` | `skills/agency-rapid-prototyper/SKILL.md` |
| Tối ưu query, indexing, schema Supabase | `agency-database-optimizer` | `skills/agency-database-optimizer/SKILL.md` |

### 🔍 Review & Debug

| Khi user yêu cầu | Skill | Path |
|---|---|---|
| Review code, check quality, tìm bug | `agency-code-reviewer` | `skills/agency-code-reviewer/SKILL.md` |
| Debug production, incident, sự cố | `agency-incident-response-commander` | `skills/agency-incident-response-commander/SKILL.md` |
| Phân tích kết quả test, coverage | `agency-test-results-analyzer` | `skills/agency-test-results-analyzer/SKILL.md` |
| Benchmark performance, load test | `agency-performance-benchmarker` | `skills/agency-performance-benchmarker/SKILL.md` |

### 🔒 Audit & Bảo mật

| Khi user yêu cầu | Skill | Path |
|---|---|---|
| Audit bảo mật, vulnerability, OWASP | `agency-security-engineer` | `skills/agency-security-engineer/SKILL.md` |
| Audit accessibility, WCAG | `agency-accessibility-auditor` | `skills/agency-accessibility-auditor/SKILL.md` |
| Audit compliance (SOC2, ISO, HIPAA) | `agency-compliance-auditor` | `skills/agency-compliance-auditor/SKILL.md` |

### ⚙️ DevOps & Vận hành

| Khi user yêu cầu | Skill | Path |
|---|---|---|
| CI/CD, deployment, Docker, cloud | `agency-devops-automator` | `skills/agency-devops-automator/SKILL.md` |
| Bảo trì server, monitoring, uptime | `agency-infrastructure-maintainer` | `skills/agency-infrastructure-maintainer/SKILL.md` |
| Git workflow, branching, merge | `agency-git-workflow-master` | `skills/agency-git-workflow-master/SKILL.md` |

### 📋 Quản lý & Kế hoạch

| Khi user yêu cầu | Skill | Path |
|---|---|---|
| PRD, roadmap, feature planning | `agency-product-manager` | `skills/agency-product-manager/SKILL.md` |
| Chia task, estimate, sprint planning | `agency-senior-project-manager` | `skills/agency-senior-project-manager/SKILL.md` |
| Đánh giá tool, framework, library | `agency-tool-evaluator` | `skills/agency-tool-evaluator/SKILL.md` |
| Tối ưu workflow, process improvement | `agency-workflow-optimizer` | `skills/agency-workflow-optimizer/SKILL.md` |

### 📢 Marketing & Content

| Khi user yêu cầu | Skill | Path |
|---|---|---|
| SEO, meta tags, structured data | `agency-seo-specialist` | `skills/agency-seo-specialist/SKILL.md` |
| Growth strategy, user acquisition | `agency-growth-hacker` | `skills/agency-growth-hacker/SKILL.md` |
| Viết content, copy, blog | `agency-content-creator` | `skills/agency-content-creator/SKILL.md` |
| Social media strategy, campaigns | `agency-social-media-strategist` | `skills/agency-social-media-strategist/SKILL.md` |

### 📝 Documentation

| Khi user yêu cầu | Skill | Path |
|---|---|---|
| Viết docs, README, API reference | `agency-technical-writer` | `skills/agency-technical-writer/SKILL.md` |

### 🤖 Điều phối (chỉ dùng khi task rất phức tạp)

| Khi user yêu cầu | Skill | Path |
|---|---|---|
| Điều phối pipeline phức tạp, multi-phase | `agency-agents-orchestrator` | `skills/agency-agents-orchestrator/SKILL.md` |

---

## Quy tắc Thực thi

### 1. Một tác vụ → Một skill

- Phần lớn yêu cầu chỉ cần **1 skill duy nhất**
- KHÔNG gọi nhiều skill nếu không cần thiết — tốn token vô ích
- Ưu tiên skill **cụ thể nhất** cho tác vụ

### 2. Khi tác vụ cần phối hợp (hiếm khi)

Chỉ kết hợp khi user **yêu cầu rõ ràng** hoặc task thực sự đa-domain:

| Tình huống | Pipeline |
|---|---|
| Tính năng mới end-to-end | `product-manager` → `software-architect` → `frontend-developer` hoặc `backend-architect` |
| Fix bug phức tạp | `code-reviewer` (phân tích) → skill dev phù hợp (fix) |
| Redesign UI | `ui-designer` (design) → `frontend-developer` (implement) |
| Audit toàn diện | `security-engineer` + `accessibility-auditor` + `performance-benchmarker` |
| Pre-launch checklist | `security-engineer` → `performance-benchmarker` → `devops-automator` |

### 3. Nguyên tắc tiết kiệm Token

- **Đọc SKILL.md 1 lần**, áp dụng persona xuyên suốt — KHÔNG đọc lại mỗi bước
- **Không lặp lại** nội dung SKILL.md trong response
- **Ưu tiên hành động** trước mô tả: code trước, giải thích sau
- **Tập trung vào diff**: chỉ show thay đổi, không show toàn bộ file
- **Skip skill** nếu tác vụ quá đơn giản (fix typo, thêm comment, format code) — xử lý trực tiếp

### 4. Quy ước Dự án Tulie One

- **Monorepo structure**: apps/ chứa các app, packages/ chứa shared code
- **Database**: Supabase (PostgreSQL), schema ở `supabase/` trong mỗi app
- **Styling**: TailwindCSS 4 + Radix UI primitives + shadcn/ui components
- **State**: React hooks + SWR cho data fetching
- **Auth**: Supabase Auth + middleware.ts
- **API**: Next.js App Router API routes (`app/api/`)
- **Deploy**: Vercel (CRM), Docker (Workforce)
- **Port convention**: CRM=3004, các app khác theo config riêng

---

## Quick Reference — Nhận diện nhanh

```
"thiết kế lại sidebar"         → agency-ui-designer
"fix bug API trả sai data"     → agency-code-reviewer
"tạo page mới cho CRM"         → agency-frontend-developer
"tối ưu query chậm"            → agency-database-optimizer
"setup CI/CD"                   → agency-devops-automator  
"viết PRD cho feature X"       → agency-product-manager
"deploy lên production"         → agency-devops-automator
"review code PR"                → agency-code-reviewer
"kiểm tra bảo mật"             → agency-security-engineer
"sửa lỗi, fix typo, nhỏ lẻ"   → xử lý trực tiếp, KHÔNG cần skill
```
