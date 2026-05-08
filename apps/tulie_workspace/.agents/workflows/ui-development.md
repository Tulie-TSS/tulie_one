---
description: Quy trình bắt buộc khi phát triển hoặc điều chỉnh giao diện Tulie Workspace
---

# UI Development Workflow

> **BẮT BUỘC** tuân theo khi tạo mới, chỉnh sửa, hoặc mở rộng bất kỳ chức năng/giao diện nào trong Tulie Workspace.

## Bước 1: Đọc PRD — Hiểu Context & Yêu cầu

// turbo
1. Đọc file `PRD.md` tại project root để hiểu:
   - Triết lý sản phẩm (§2): Bảo vệ Flow State, WIP Limit, Eisenhower, Maker vs Manager
   - Module liên quan (§4): The Border, The Bridge, The Territory, The Commons, The Forge, The Lens
   - User Stories (§1.4): Acceptance Criteria cho feature liên quan
   - Task Status Flow (§4.3.4): Các trạng thái hợp lệ và transition rules
   - Edge Case Rules (§4.3.5): In-Review reject, On-Hold timeout, Carried Over limits
   - Phân quyền (§8): Ma trận permission theo role (Admin/Manager/Maker/Observer)

2. Xác định feature thuộc Module nào và persona nào sẽ sử dụng.

## Bước 2: Đọc UI Guideline — Nắm Design System

// turbo
3. Đọc file `docs/ui-guideline.md` để tuân thủ:
   - **5 nguyên tắc thiết kế** (§1): Tối giản, chống nhiễu, rào cản có chủ đích, context-aware, progressive disclosure
   - **Color System** (§5): Monochrome chủ đạo, signal colors chỉ dùng cho tín hiệu
   - **Typography** (§3): Inter font, size scale, weights
   - **Spacing** (§4): 4px grid, border radius, shadow tokens
   - **Role-Based Views** (§7): Maker/Manager/Observer mỗi role thấy gì, ẩn gì
   - **States** (§8): Loading, empty, error, success, WIP block feedback
   - **Motion** (§9): Duration tokens, easing, reduced-motion respect
   - **Accessibility** (§10): WCAG 2.1 AA, contrast, focus ring, ARIA, keyboard nav

## Bước 3: Kiểm tra Component Library — Tái sử dụng

// turbo
4. Mở file `docs/components/index.html` trong browser hoặc đọc source code để xem các components có sẵn.

5. Kiểm tra xem giao diện mới có thể dùng components nào đã có:
   - **CSS Custom Properties:** LUÔN dùng token từ `design-tokens.css`, KHÔNG hardcode giá trị
   - **Component classes:** Dùng class prefix `fg-` (VD: `fg-btn`, `fg-card`, `fg-badge`)
   - **Naming convention:** `.fg-{component}--{variant}`, `.fg-{component}___{element}`, `.is-{state}`

6. Nếu cần component MỚI:
   - Component mới PHẢI dùng design tokens đã có
   - Thêm CSS vào `docs/components/components.css`
   - Thêm demo HTML vào `docs/components/index.html`
   - Cập nhật `docs/ui-guideline.md` nếu component mới tạo pattern mới

## Bước 4: Thiết kế theo Role-Based Rules

7. **XÁC ĐỊNH ROLE** — Feature này dành cho Maker, Manager, hay Observer?

8. Tuân thủ nghiêm ngặt quy tắc hiển thị theo role:

   **Maker View — KHÔNG được hiển thị:**
   - Quarantine Zone, Backlog list, Triage panel
   - Analytics, Charts, WIP Heatmap, Trade-off history
   - Chỉ hiển thị: task đang Doing, Quick Strike, Ready badge count

   **Focus Mode (khi Maker bật Start) — CHỈ hiển thị:**
   - Tên task, Description, Timer, Done/Pause buttons
   - ẨN toàn bộ: sidebar, navigation, chat, notifications (trừ Critical)
   - Giao diện chuyển monochrome

   **Manager View — Hiển thị:**
   - Kanban Board, Quarantine Zone (trên cùng nếu có task)
   - WIP Heatmap, Cycle progress, Trade-off log, Full Backlog

   **Observer View — Read-only:**
   - Cycle progress, Milestone status
   - KHÔNG thấy: chi tiết task, WIP cá nhân, internal notes
   - Có Export PDF/CSV

## Bước 5: Kiểm tra Intentional Friction

9. Nếu feature liên quan đến **hành vi phá kỷ luật** (vượt WIP, chen task gấp, skip triage):
   - PHẢI implement nhiều bước xác nhận (không shortcut)
   - Trade-off: 3 bước (chọn phương án → nhập lý do ≥ 20 ký tự → xác nhận)
   - WIP Override: BLOCK hành động (không chỉ cảnh báo) → hiển thị quick actions → yêu cầu Manager approve
   - Mọi override PHẢI được log vào audit trail

## Bước 6: Kiểm tra Accessibility

10. Checklist bắt buộc trước khi hoàn tất:
    - [ ] Color contrast ≥ 4.5:1 (text), ≥ 3:1 (large text/UI)
    - [ ] Focus ring visible trên mọi interactive element (`:focus-visible`)
    - [ ] Keyboard navigation hoạt động (Tab, Enter, Space, Escape)
    - [ ] Icon-only buttons có `aria-label`
    - [ ] Dynamic content có `aria-live` regions
    - [ ] Không chỉ dùng màu — luôn có icon + text bổ trợ
    - [ ] Touch target ≥ 44px × 44px (mobile)

## Bước 7: Kiểm tra Responsive

11. Test trên 3 breakpoints:
    - **Mobile** (< 768px): Sidebar off-canvas, board stacked, Quick Strike full-width
    - **Tablet** (768-1024px): Sidebar collapsed (icons only)
    - **Desktop** (> 1024px): Full layout

12. Mobile priorities (PRD §14.2):
    - 🔴 Critical: Quick Strike, Focus Mode, Notifications, Task status update
    - 🟠 High: Task list view
    - 🟡 Medium: Kanban (simplified), Triage
    - ⚪ Low: Auto-Schedule, Analytics (defer to desktop)

## Bước 8: Review & Commit

13. Self-review checklist:
    - [ ] Tuân thủ PRD requirements và acceptance criteria
    - [ ] Dùng đúng design tokens (không hardcode)
    - [ ] Dùng components có sẵn hoặc tạo component mới ĐÚNG convention
    - [ ] Role-based visibility đúng
    - [ ] Intentional friction đầy đủ (nếu applicable)
    - [ ] Accessibility checklist passed
    - [ ] Responsive trên 3 breakpoints
    - [ ] Component library cập nhật (nếu tạo component mới)

---

## Tham chiếu nhanh

| Tài liệu | Đường dẫn | Nội dung |
|-----------|-----------|----------|
| PRD | `PRD.md` | Yêu cầu sản phẩm, modules, user stories, data model |
| UI Guideline | `docs/ui-guideline.md` | Design system, colors, typography, spacing, rules |
| Design Tokens | `docs/components/design-tokens.css` | CSS custom properties |
| Components CSS | `docs/components/components.css` | Tất cả component styles |
| Component Preview | `docs/components/index.html` | Live preview tất cả components |
