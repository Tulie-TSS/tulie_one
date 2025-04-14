# UI Audit & Synchronization Task

> Rà soát toàn bộ giao diện tulie_workforce, đồng bộ theo Vercel/Geist UI guideline,
> tone đen trắng monochrome (zinc), hiện đại, chuyên nghiệp.

---

## 1. Typography Audit

### Rules (từ PRD §3.3)
- Font: Inter (Google Fonts) — ONLY
- Weight: 400 (body), 500 (labels), 600 (subheadings), 700 (headings) — **NEVER 800/900**
- ❌ NO `text-transform: uppercase`
- ❌ NO `text-transform: capitalize` trên headings/buttons
- ❌ NO `tracking-tight`, `tracking-wide`, custom letter-spacing
- ✅ `tracking-normal` (0em) for all text

### Checklist
- [x] Scan toàn bộ `.tsx` files cho `uppercase`, `capitalize`, `tracking-tight`, `tracking-wide` — ✅ No violations
- [x] Scan cho `font-weight: 800`, `font-weight: 900`, `font-extrabold`, `font-black` — ✅ No violations
- [x] Verify Inter font applied globally, no fallback to system fonts — ✅ Confirmed
- [x] Verify type scale consistency: h1=4xl, h2=3xl, h3=2xl, h4=xl, body=base, small=sm, caption=xs — ✅ Consistent

---

## 2. Color System Audit

### Rules (từ PRD §3.2)
- ✅ Zinc scale for 95% of UI
- ✅ Semantic colors (success/error/warning) sparingly
- ❌ NO brand colors (blue, purple, teal, etc.)
- ❌ NO gradients or color overlays
- ❌ NO colored backgrounds except white/zinc

### Checklist
- [x] Scan cho `bg-blue`, `bg-purple`, `bg-teal`, `bg-indigo`, `bg-green` — ✅ Fixed (badge, signup)
- [x] Scan cho `text-blue`, `text-purple`, `text-teal`, `text-indigo` — ✅ None found
- [x] Scan cho `gradient`, `bg-gradient` — ✅ None found
- [x] Verify tất cả buttons dùng zinc-900/white scheme — ✅ Fixed (destructive variant)
- [x] Verify hover states dùng zinc-50/zinc-800 — ✅ Confirmed
- [x] Verify borders dùng zinc-200/zinc-300 — ✅ Fixed (settings danger zone)

---

## 3. Component Style Audit (PRD §3.4)

### Rules
- `border-radius`: `rounded-md` (6px) — consistent across ALL components
- `shadow`: `shadow-sm` — minimal only
- `border`: `border-zinc-200`
- `hover`: `hover:bg-zinc-50`
- Icons: Lucide React only, size w-5 h-5, color text-zinc-600 (default), text-zinc-900 (active)

### Checklist per component

#### UI Components (src/components/ui/)
- [ ] `button.tsx` — variants match PRD (primary: bg-zinc-900/white, outline: border-zinc-300, ghost: text-zinc-600)
- [ ] `input.tsx` — border-zinc-300, focus:border-zinc-400, focus:ring-zinc-400
- [ ] `card.tsx` — border-zinc-200, shadow-sm, CardHeader border-b border-zinc-100
- [ ] `label.tsx` — font-medium (500), text-sm
- [ ] `avatar.tsx` — rounded-full, proper fallback styling
- [ ] `dropdown-menu.tsx` — bg-white, border-zinc-200, hover:bg-zinc-50
- [ ] `badge.tsx` — semantic variants only (success/error/warning/default)
- [ ] `separator.tsx` — bg-zinc-200
- [ ] `skeleton.tsx` — bg-zinc-100, animate-pulse

#### Layout Components (src/components/layouts/)
- [ ] `sidebar.tsx` — bg-white, border-r border-zinc-200, nav links hover:bg-zinc-50, active:bg-zinc-100
- [ ] `header.tsx` — bg-white, border-b border-zinc-200, sticky top-0, proper z-index

---

## 4. Page-by-Page Audit

### Auth Pages (src/app/(auth)/)
- [ ] `login/page.tsx` — centered card, icon, form inputs, button styling, link to signup
- [ ] `signup/page.tsx` — centered card, all fields, password requirements text, link to login
- [ ] Auth layout — centered vertically & horizontally, bg-zinc-50

### Dashboard Pages (src/app/(dashboard)/)
- [ ] `page.tsx` (Dashboard Home) — stat cards grid, recent activity section, empty states
- [ ] `agents/page.tsx` — header with Create button, empty state with icon and CTA
- [ ] `tasks/page.tsx` — header with Assign button, empty state
- [ ] `knowledge/page.tsx` — header with Upload button, empty state
- [ ] `settings/page.tsx` — profile form, Telegram section, danger zone
- [ ] Dashboard layout — 12-col grid (col-span-2 sidebar + col-span-10 main)

---

## 5. Missing Pages / Features

### Cần tạo mới
- [ ] `/forgot-password` — forgot password flow (đã có link từ login)
- [ ] `/agents/[id]` — agent detail/edit page
- [ ] `/agents/new` — create new agent form
- [ ] `/tasks/[id]` — task detail page
- [ ] `/knowledge/upload` — document upload page
- [ ] `/settings/profile` — dedicated profile page (đã có link từ header dropdown)
- [ ] Auth callback page `/auth/callback` — xử lý email verification redirect

### Chức năng chưa hoạt động
- [ ] Header user dropdown — signOut chỉ redirect, chưa gọi Supabase signOut
- [ ] Settings page — form chưa submit được (chưa có API)
- [ ] Dashboard stats — hiện hardcoded 0, cần fetch từ Supabase
- [ ] Sidebar active state — chỉ highlight Dashboard, cần detect route dynamically
- [ ] Create agent button — chưa link đến trang tạo agent
- [ ] Knowledge upload — chưa có upload flow

---

## 6. Layout & Spacing Audit (PRD §3.5)

### Rules
- Spacing: 4px base (gap-2=8px, gap-4=16px, gap-6=24px, p-8=32px)
- Max width: max-w-7xl (1280px)
- Content width: max-w-4xl (896px)
- Form width: max-w-md (448px)
- Grid: 12-col (sidebar 2 + content 10)

### Checklist
- [ ] Verify sidebar width = col-span-2 (consistent)
- [ ] Verify main content padding = p-8
- [ ] Verify card spacing = gap-4 or gap-6 between cards
- [ ] Verify form inputs spacing = space-y-4
- [ ] Verify responsive behavior on mobile (collapse sidebar to drawer/bottom nav)

---

## 7. Accessibility & UX

- [ ] All interactive elements have unique IDs
- [ ] Focus rings visible (ring-zinc-400)
- [ ] Proper ARIA labels on icon-only buttons
- [ ] Loading states implemented (skeletons, spinners)
- [ ] Error states for forms (red border, error text)
- [ ] Empty states for all list pages
- [ ] Transitions/animations smooth (transition-colors, duration-150)

---

## Priority Order

1. **Critical** — Typography violations (uppercase, wrong weights)
2. **Critical** — Color violations (non-zinc colors)  
3. **High** — Missing pages (forgot-password, agent detail, create agent)
4. **High** — Non-functional features (signOut, settings form, route detection)
5. **Medium** — Component style mismatches (border-radius, shadows)
6. **Medium** — Layout/spacing inconsistencies
7. **Low** — Accessibility improvements
