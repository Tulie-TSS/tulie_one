# FlowGuard — UI Design Guideline

> **Phiên bản:** 1.0  
> **Ngày:** 2026-03-19  
> **Tham chiếu:** [PRD.md](../PRD.md) §6, §13.5, §14

---

## MỤC LỤC

1. [Triết lý Thiết kế](#1-triết-lý-thiết-kế)
2. [Design Tokens](#2-design-tokens)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Color System](#5-color-system)
6. [Iconography & Badges](#6-iconography--badges)
7. [Role-Based Views](#7-role-based-views)
8. [States & Feedback](#8-states--feedback)
9. [Motion & Animation](#9-motion--animation)
10. [Accessibility](#10-accessibility)
11. [Responsive Design](#11-responsive-design)
12. [Component Patterns](#12-component-patterns)

---

## 1. Triết lý Thiết kế

Giao diện FlowGuard phục vụ một mục đích duy nhất: **bảo vệ Flow State của người dùng**.

### 5 Nguyên tắc Cốt lõi (từ PRD §6.1)

| # | Nguyên tắc | Quy tắc Thực hành |
|---|-----------|-------------------|
| 1 | **Tối giản thị giác** | Monochrome chủ đạo. Màu sắc CHỈ dùng làm tín hiệu báo động. Không gradient trang trí, không bóng đổ nặng. |
| 2 | **Chống nhiễu** | Maker KHÔNG thấy chart/graph/analytics. Chỉ thấy: tên task, tài liệu, nút Done. Manager mới thấy dashboard. |
| 3 | **Rào cản có chủ đích** (Intentional Friction) | Hành vi phá kỷ luật (vượt WIP, chen task gấp) phải qua NHIỀU bước xác nhận. Không shortcut. |
| 4 | **Context-aware** | Giao diện thay đổi hoàn toàn theo Role. Maker ≠ Manager ≠ Observer. |
| 5 | **Progressive disclosure** | Thông tin phức tạp ẩn sau interaction. Không dump data lên màn hình. |

### Quy tắc Vàng

> ⚠️ **Khi thiết kế bất kỳ component/feature nào, luôn tự hỏi:**
> 1. Component này có làm gián đoạn Flow State của Maker không?
> 2. Maker có cần thấy thông tin này không? Hay chỉ Manager mới cần?
> 3. Nếu đây là hành vi phá kỷ luật, đã có đủ friction chưa?

---

## 2. Design Tokens

Tất cả giá trị thiết kế được định nghĩa dưới dạng CSS Custom Properties trong file `design-tokens.css`.

### Cách sử dụng

```css
/* ✅ Đúng — dùng token */
.card { background: var(--color-surface); }

/* ❌ Sai — hardcode giá trị */
.card { background: #ffffff; }
```

> **Quy tắc:** KHÔNG BAO GIỜ hardcode raw value. Luôn dùng CSS custom property.

---

## 3. Typography

### Font Chính: Inter

Sử dụng **Inter** (Google Fonts) — sans-serif, tối ưu cho đọc trên màn hình, hỗ trợ Vietnamese tốt.

```
Fallback: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

### Thang Kích thước

| Token | Size | Weight | Sử dụng |
|-------|-----:|--------|---------|
| `--text-xs` | 11px | 400 | Captions, badges, timestamps |
| `--text-sm` | 13px | 400 | Secondary text, labels |
| `--text-base` | 15px | 400 | Body text, descriptions |
| `--text-lg` | 17px | 500 | Subheadings, card titles |
| `--text-xl` | 20px | 600 | Section headers |
| `--text-2xl` | 24px | 600 | Page titles |
| `--text-3xl` | 30px | 700 | Dashboard numbers, hero text |

### Font Weight

| Token | Weight | Sử dụng |
|-------|-------:|---------|
| `--font-regular` | 400 | Body text |
| `--font-medium` | 500 | Labels, nút text |
| `--font-semibold` | 600 | Headings, emphasis |
| `--font-bold` | 700 | Hero numbers, critical alerts |

### Line Height

| Token | Value | Sử dụng |
|-------|------:|---------|
| `--leading-tight` | 1.25 | Headings |
| `--leading-normal` | 1.5 | Body text |
| `--leading-relaxed` | 1.75 | Long paragraph, description |

---

## 4. Spacing & Layout

### Hệ thống 4px Grid

Mọi spacing đều là bội số của **4px**.

| Token | Value | Sử dụng |
|-------|------:|---------|
| `--space-0` | 0px | — |
| `--space-1` | 4px | Inline spacing, icon gap |
| `--space-2` | 8px | Compact elements |
| `--space-3` | 12px | List items, tight padding |
| `--space-4` | 16px | Default padding, gaps |
| `--space-5` | 20px | Card padding |
| `--space-6` | 24px | Section spacing |
| `--space-8` | 32px | Section gap |
| `--space-10` | 40px | Large section gap |
| `--space-12` | 48px | Page section |
| `--space-16` | 64px | Layout spacing |

### Border Radius

| Token | Value | Sử dụng |
|-------|------:|---------|
| `--radius-sm` | 4px | Badges, chips |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards, modals |
| `--radius-xl` | 16px | Large panels |
| `--radius-full` | 9999px | Avatars, pills |

### Shadow

| Token | Sử dụng |
|-------|---------|
| `--shadow-sm` | Subtle lift: cards trong board |
| `--shadow-md` | Dropdowns, popovers |
| `--shadow-lg` | Modals, dialogs |
| `--shadow-focus` | Focus ring (accessibility) |

### Layout Breakpoints

| Token | Min-width | Sử dụng |
|-------|----------:|---------|
| `--bp-mobile` | 0px | Mobile-first |
| `--bp-tablet` | 768px | Tablet landscape |
| `--bp-desktop` | 1024px | Desktop |
| `--bp-wide` | 1440px | Wide monitors |

---

## 5. Color System

### Triết lý Màu sắc

> **Monochrome là mặc định. Màu sắc là tín hiệu.**
>
> Khi dùng màu, nó phải mang ý nghĩa rõ ràng. Không dùng màu để trang trí.

### Bảng Màu Chính (từ PRD §6.2)

#### Neutral / Monochrome

| Token | Light Mode | Dark Mode | Sử dụng |
|-------|-----------|-----------|---------|
| `--color-bg` | `#FFFFFF` | `#0F0F0F` | Nền chính |
| `--color-surface` | `#F5F5F5` | `#1A1A1A` | Card, panel |
| `--color-surface-hover` | `#EBEBEB` | `#252525` | Surface khi hover |
| `--color-surface-active` | `#E0E0E0` | `#303030` | Surface khi active |
| `--color-border` | `#E0E0E0` | `#2A2A2A` | Borders |
| `--color-border-strong` | `#C0C0C0` | `#404040` | Border nổi bật |
| `--color-text` | `#1A1A1A` | `#F5F5F5` | Text chính |
| `--color-text-secondary` | `#6B6B6B` | `#8B8B8B` | Text phụ |
| `--color-text-tertiary` | `#9B9B9B` | `#5B5B5B` | Text rất nhạt (timestamps) |
| `--color-text-inverse` | `#FFFFFF` | `#0F0F0F` | Text trên nền tối/sáng |

#### Signal Colors (Tín hiệu — chỉ dùng khi có ý nghĩa)

| Token | Hex | Sử dụng | Ý nghĩa |
|-------|-----|---------|---------|
| `--color-danger` | `#E53935` | 🔴 Cảnh báo NGHIÊM TRỌNG | Vượt WIP, task overdue, system error |
| `--color-danger-bg` | `#FDE8E8` | Nền cho danger state | — |
| `--color-warning` | `#FB8C00` | 🟠 Cảnh báo NHẸ | Quarantine, deadline gần, gần WIP limit |
| `--color-warning-bg` | `#FFF3E0` | Nền cho warning state | — |
| `--color-success` | `#43A047` | 🟢 Thành công | Task Done, Cycle hoàn thành, WIP OK |
| `--color-success-bg` | `#E8F5E9` | Nền cho success state | — |
| `--color-info` | `#1E88E5` | 🔵 Tương tác / Thông tin | Links, button chính, Focus Mode active |
| `--color-info-bg` | `#E3F2FD` | Nền cho info state | — |

#### WIP Heatmap Colors

| Token | Hex | Ý nghĩa |
|-------|-----|---------|
| `--color-wip-ok` | `#43A047` | WIP dưới limit — an toàn |
| `--color-wip-warning` | `#FB8C00` | WIP gần limit (= limit - 1) |
| `--color-wip-danger` | `#E53935` | Vượt WIP limit |

#### Eisenhower Quadrant Colors

| Token | Hex | Quadrant |
|-------|-----|----------|
| `--color-q1` | `#E53935` | Q1: Urgent + Important (Crisis) |
| `--color-q2` | `#1E88E5` | Q2: Not Urgent + Important (Strategic) |
| `--color-q3` | `#FB8C00` | Q3: Urgent + Not Important (Interruption) |
| `--color-q4` | `#9B9B9B` | Q4: Not Urgent + Not Important (Noise) |

#### Focus Mode Colors

| Token | Light | Dark | Mô tả |
|-------|-------|------|-------|
| `--focus-bg` | `#FAFAFA` | `#0A0A0A` | Nền siêu tối giản |
| `--focus-text` | `#2A2A2A` | `#E0E0E0` | Text chính |
| `--focus-accent` | `#1E88E5` | `#42A5F5` | Timer, nút Done |
| `--focus-muted` | `#BDBDBD` | `#404040` | Borders, dividers |

---

## 6. Iconography & Badges

### Bộ Icon

Sử dụng **Lucide Icons** (mã nguồn mở, consistent, lightweight).

```
CDN: https://unpkg.com/lucide@latest
```

### Icon Sizes

| Token | Size | Sử dụng |
|-------|-----:|---------|
| `--icon-xs` | 14px | Inline, badges |
| `--icon-sm` | 16px | Buttons, list items |
| `--icon-md` | 20px | Standalone icons |
| `--icon-lg` | 24px | Navigation, cards |
| `--icon-xl` | 32px | Empty states |

### Task Status Badges

| Status | Color | Icon | Label |
|--------|-------|------|-------|
| Intake | `--color-text-tertiary` | `inbox` | Intake |
| Backlog | `--color-text-secondary` | `layers` | Backlog |
| Quarantine | `--color-warning` | `shield-alert` | Quarantine |
| Ready | `--color-info` | `circle-dot` | Ready |
| Doing | `--color-info` (pulse) | `play-circle` | Doing |
| On-Hold | `--color-warning` | `pause-circle` | On-Hold |
| In Review | `--color-info` | `eye` | In Review |
| Done | `--color-success` | `check-circle` | Done |
| Rejected | `--color-danger` | `x-circle` | Rejected |

### WIP Badge

```
┌──────────────────────────┐
│  WIP: 2/2 ████████ FULL  │  ← --color-danger, bg filled
│  WIP: 1/2 ████░░░░ OK    │  ← --color-success, half filled
│  WIP: 0/2 ░░░░░░░░ FREE  │  ← --color-text-tertiary
└──────────────────────────┘
```

### Eisenhower Badges

| Quadrant | Badge Text | Color |
|----------|-----------|-------|
| Q1 | 🔴 Crisis | `--color-q1` |
| Q2 | 🔵 Strategic | `--color-q2` |
| Q3 | 🟠 Interrupt | `--color-q3` |
| Q4 | ⚪ Noise | `--color-q4` |

### Carried Over Flags

| Lần | Badge | Color |
|-----|-------|-------|
| 1 | "Carried Over" | `--color-warning` |
| 2 | "Chronic Carry" | `--color-danger` |
| 3+ | "Escalated" | `--color-danger` (pulse) |

---

## 7. Role-Based Views

> **Quy tắc TUYỆT ĐỐI:** Không bao giờ hiển thị component/dữ liệu cho role không có quyền xem.

### Maker View

| Hiển thị | Ẩn |
|----------|-----|
| Focus View (task đang Doing) | Quarantine Zone |
| Quick Strike Bar (góc dưới-phải) | Backlog list (chỉ badge count) |
| Timer / Pomodoro | Triage panel |
| Done / Pause buttons | Analytics/Charts |
| Badge "Ready: N task" trên sidebar | WIP Heatmap |
| Task description + attachments | Trade-off history |

**Focus Mode (bật khi Start task):**
- Giao diện chuyển monochrome hoàn toàn
- Ẩn sidebar, navigation, chat
- CHỈ hiện: tên task, description, timer, Done/Pause
- Notification: chỉ Critical + @mention trực tiếp

### Manager View

| Hiển thị | Ẩn |
|----------|-----|
| Kanban Board (columns = status) | Focus View |
| Quarantine Zone (nổi bật trên cùng) | — |
| WIP Heatmap (workload team) | — |
| Cycle progress bar | — |
| Trade-off history + Audit log | — |
| Burndown chart | — |
| Full Backlog | — |

### Observer View

| Hiển thị | Ẩn |
|----------|-----|
| Cycle progress | Chi tiết task |
| Milestone status | WIP cá nhân |
| Export buttons (PDF/CSV) | Internal notes |
| High-level metrics | Quarantine |

---

## 8. States & Feedback

### Loading States

```
Skeleton:     ░░░░░░░░░░░░░░░  (pulse animation, var(--color-surface))
Spinner:      ◠◡ (simple, 16px, var(--color-text-secondary))
Full-page:    Center spinner + "Đang tải..." text
```

- Skeleton cho danh sách/bảng (board, task list)
- Spinner cho actions (submit form, status change)
- Full-page cho initial page load

### Empty States

> **Quy tắc:** Empty state PHẢI có:
> 1. Illustration hoặc icon lớn (muted)
> 2. Headline giải thích
> 3. CTA (call-to-action) button
> 4. (Tùy chọn) Link tới help article

**Ví dụ:**
```
┌──────────────────────────────────────────┐
│                                          │
│              📋 (icon lớn)               │
│                                          │
│     Chưa có task nào trong Doing         │
│                                          │
│   Kéo task từ Ready hoặc tạo task mới   │
│                                          │
│        [ + Tạo task mới ]                │
│                                          │
└──────────────────────────────────────────┘
```

### Error States

| Loại | Hiển thị | Màu |
|------|----------|-----|
| Field validation | Inline dưới input | `--color-danger` |
| Form error | Toast ở top-right | `--color-danger` |
| System error | Full-page error | `--color-danger` |
| Network error | Banner ở top | `--color-warning` |

### Success Feedback

| Loại | Hiển thị |
|------|----------|
| Task Done | Confetti nhẹ + toast "Task hoàn thành!" |
| Quick Strike | Inline checkmark animation |
| Form submit | Toast "Đã lưu" |
| Cycle complete | Celebration modal |

### WIP Block (Intentional Friction)

```
┌──────────────────────────────────────────┐
│  ⚠️  BẠN ĐÃ ĐẠT WIP LIMIT              │
│                                          │
│  Đang có 2/2 task Doing.                 │
│  Vui lòng hoàn thành hoặc tạm dừng      │
│  1 task trước khi bắt đầu task mới.      │
│                                          │
│  ┌─ Task đang Doing ─────────────────┐   │
│  │ ☐ Hoàn thành "Task A"            │   │
│  │ ⏸ Tạm dừng "Task A"              │   │
│  │ ☐ Hoàn thành "Task B"            │   │
│  │ ⏸ Tạm dừng "Task B"              │   │
│  └───────────────────────────────────┘   │
│                                          │
│                          [ Hủy ]         │
└──────────────────────────────────────────┘
```

---

## 9. Motion & Animation

### Nguyên tắc

1. **Có mục đích:** Animation phải truyền tải thông tin (feedback, trạng thái), không chỉ trang trí.
2. **Nhanh:** Duration mặc định 150-200ms. Không quá 300ms.
3. **Tôn trọng `prefers-reduced-motion`:** Tắt animation nếu user thiết lập.

### Duration Tokens

| Token | Value | Sử dụng |
|-------|------:|---------|
| `--duration-fast` | 100ms | Hover, focus |
| `--duration-normal` | 200ms | Transitions, toast |
| `--duration-slow` | 300ms | Modal open/close |

### Easing

| Token | Value | Sử dụng |
|-------|-------|---------|
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Phần tử xuất hiện |
| `--ease-in-out` | `cubic-bezier(0.45, 0, 0.55, 1)` | Chuyển đổi |

### Animations Cụ thể

| Component | Animation | Duration |
|-----------|-----------|----------|
| Toast appear | Slide in from right + fade | 200ms |
| Modal open | Scale(0.95→1) + fade | 200ms |
| Card hover | Translate Y (-2px) + shadow | 150ms |
| Skeleton | Pulse (opacity 0.5→1) | 1.5s loop |
| WIP violation badge | Pulse (scale 1→1.05) | 1s loop |
| Done checkmark | Draw SVG path | 300ms |
| Quick Strike complete | Strikethrough + fade out | 300ms |
| Focus Mode transition | Fade to monochrome | 500ms |
| Kanban drag | Card lifts with shadow | 150ms |

---

## 10. Accessibility

> **Target: WCAG 2.1 Level AA** (từ PRD §13.5)

### Checklist Bắt buộc

- [ ] **Contrast ratio:** Text ≥ 4.5:1, Large text/UI ≥ 3:1
- [ ] **Focus indicators:** Visible focus ring (`--shadow-focus`) cho MỌI interactive element
- [ ] **Keyboard navigation:** Tab order logic, Enter/Space activate, Escape close
- [ ] **ARIA labels:** Mọi icon-only button phải có `aria-label`
- [ ] **Screen reader:** ARIA roles, live regions cho dynamic content
- [ ] **Không chỉ dùng màu:** Luôn có icon + text bổ trợ
- [ ] **Drag-and-drop:** Phải có keyboard alternative (Kanban board)

### Focus Ring

```css
/* Focus ring chuẩn */
:focus-visible {
  outline: 2px solid var(--color-info);
  outline-offset: 2px;
}
```

### Skip Link

Mọi trang phải có "Skip to content" link ở đầu DOM.

### ARIA Patterns Cần Thiết

| Component | ARIA Role/Pattern |
|-----------|-------------------|
| Kanban Board | `role="list"`, cards là `role="listitem"` |
| Modal | `role="dialog"`, `aria-modal="true"` |
| Toast | `role="alert"`, `aria-live="polite"` |
| WIP Block | `role="alertdialog"`, `aria-live="assertive"` |
| Sidebar | `role="navigation"` |
| Quick Strike | `role="search"` |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"` |

---

## 11. Responsive Design

### Approach: Desktop-First (từ PRD §14.1)

> Task management cần màn hình lớn. Desktop là trải nghiệm chính.

### Breakpoints & Behavior

| Breakpoint | Width | Sidebar | Board | Quick Strike |
|-----------|------:|---------|-------|-------------|
| Mobile | < 768px | Off-canvas (hamburger) | Stack list view | Full-width bottom bar |
| Tablet | 768-1024px | Collapsed (icons only) | Horizontal scroll | Floating right |
| Desktop | > 1024px | Expanded | Full columns | Floating right |

### Mobile Priorities (từ PRD §14.2)

| Priority | Feature |
|----------|---------|
| 🔴 Critical | Quick Strike, Focus Mode, Notifications, Task status update |
| 🟠 High | Task list view (simplified) |
| 🟡 Medium | Kanban (simplified), Triage |
| ⚪ Low | Auto-Schedule, Analytics (defer to desktop) |

### Touch Targets

- Minimum touch target: **44px × 44px** (WCAG 2.5.5)
- Spacing between touch targets: ≥ 8px

---

## 12. Component Patterns

### Naming Convention

```
.fg-{component}
.fg-{component}--{variant}
.fg-{component}___{element}
.fg-{component}.is-{state}
```

**Ví dụ:**
```css
.fg-btn              /* Button base */
.fg-btn--primary     /* Variant: primary */
.fg-btn--danger      /* Variant: danger */
.fg-btn.is-loading   /* State: loading */
.fg-card___header    /* Element: card header */
```

### Z-Index Scale

| Token | Value | Sử dụng |
|-------|------:|---------|
| `--z-base` | 0 | Default |
| `--z-dropdown` | 100 | Dropdowns, popovers |
| `--z-sticky` | 200 | Sticky headers |
| `--z-overlay` | 300 | Overlay backdrop |
| `--z-modal` | 400 | Modals, dialogs |
| `--z-toast` | 500 | Toast notifications |
| `--z-quick-strike` | 600 | Quick Strike Bar (luôn trên cùng) |
| `--z-tooltip` | 700 | Tooltips |

### Component Reference

Xem Component Library tại: [docs/components/index.html](components/index.html)

---

> **Ghi chú:** Tài liệu này là living document. Cập nhật khi design system phát triển.
> Mọi thay đổi phải được review và phải tuân thủ PRD.md.
