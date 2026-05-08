# ERROR CODE CATALOG — Tulie Workspace

**Phiên bản:** 1.0  
**Ngày:** 2026-03-19  
**Tham chiếu:** [03_API_SPEC.md](./03_API_SPEC.md) §7

---

## 1. Error Format

Mọi API error response tuân theo format:

```json
{
    "error": {
        "code": "ERROR_CODE",
        "message": "Human-readable message (tiếng Anh)",
        "message_vi": "Thông báo lỗi (tiếng Việt)",
        "details": {},
        "request_id": "req-uuid",
        "timestamp": "2026-03-19T07:00:00Z"
    }
}
```

## 2. Error Code Convention

```
{MODULE}_{CATEGORY}_{SPECIFIC}
```

| Prefix | Module |
|--------|--------|
| `AUTH_` | Authentication & Authorization |
| `TASK_` | Task management |
| `WIP_` | WIP enforcement |
| `TRIAGE_` | Quarantine & Trade-off |
| `CYCLE_` | Cycle management |
| `FOCUS_` | Focus Mode |
| `SEARCH_` | Search & Filter |
| `FILE_` | Attachments & Upload |
| `USER_` | User management |
| `WEBHOOK_` | Webhooks |
| `SYSTEM_` | System-level errors |
| `VALID_` | Input validation |

---

## 3. Error Catalog

### 3.1 Authentication (AUTH_)

| Code | HTTP | Message | Message (vi) | Details |
|------|:----:|---------|-------------|---------|
| `AUTH_UNAUTHENTICATED` | 401 | Authentication required | Bạn cần đăng nhập | — |
| `AUTH_TOKEN_EXPIRED` | 401 | Access token has expired | Token đã hết hạn | `{ expires_at }` |
| `AUTH_TOKEN_INVALID` | 401 | Invalid or malformed token | Token không hợp lệ | — |
| `AUTH_REFRESH_FAILED` | 401 | Failed to refresh session | Không thể gia hạn phiên | — |
| `AUTH_INSUFFICIENT_PERMISSIONS` | 403 | You do not have permission for this action | Bạn không có quyền thực hiện | `{ required_role, current_role }` |
| `AUTH_CSRF_FAILED` | 403 | CSRF validation failed | Xác thực CSRF thất bại | — |
| `AUTH_SESSION_LIMIT` | 403 | Maximum concurrent sessions reached | Đã đạt giới hạn phiên đồng thời | `{ max_sessions: 5 }` |
| `AUTH_ORG_MISMATCH` | 403 | Resource belongs to a different organization | Resource không thuộc tổ chức của bạn | — |

### 3.2 Task Management (TASK_)

| Code | HTTP | Message | Message (vi) | Details |
|------|:----:|---------|-------------|---------|
| `TASK_NOT_FOUND` | 404 | Task not found | Không tìm thấy task | `{ task_id }` |
| `TASK_INVALID_TRANSITION` | 422 | Cannot transition from {from} to {to} | Không thể chuyển từ {from} sang {to} | `{ from, to, allowed_transitions }` |
| `TASK_TITLE_TOO_SHORT` | 400 | Title must be at least 10 characters | Tiêu đề phải có ít nhất 10 ký tự | `{ min_length: 10, current_length }` |
| `TASK_TITLE_NO_VERB` | 400 | Title should start with an action verb | Tiêu đề nên bắt đầu bằng động từ | — |
| `TASK_EFFORT_REQUIRED` | 400 | Estimated effort is required and must be > 0 | Cần nhập thời gian ước tính > 0 | — |
| `TASK_SUGGEST_QUICK_STRIKE` | 422 | Effort ≤ 2 minutes — use Quick Strike instead | Effort ≤ 2 phút — hãy dùng Quick Strike | `{ effort_minutes }` |
| `TASK_DEADLINE_INFEASIBLE` | 422 | Deadline is shorter than estimated duration | Deadline ngắn hơn thời gian ước tính | `{ deadline, scheduled_duration, hofstadter_duration }` |
| `TASK_DEPENDENCY_UNMET` | 409 | Blocked by unfinished dependency tasks | Bị chặn bởi task dependency chưa hoàn thành | `{ blocking_tasks: [{ id, title, status }] }` |
| `TASK_DEPENDENCY_CIRCULAR` | 422 | Circular dependency detected | Phát hiện dependency vòng lặp | `{ cycle_path: [task_ids] }` |
| `TASK_ALREADY_DONE` | 422 | Task is already completed | Task đã hoàn thành | — |
| `TASK_CROSS_CYCLE` | 422 | Cannot schedule task beyond current cycle boundary | Không thể lên lịch task vượt ranh giới cycle | `{ cycle_end_date }` |
| `TASK_ASSIGN_OBSERVER` | 422 | Cannot assign task to Observer role | Không thể giao task cho role Observer | — |
| `TASK_BULK_LIMIT` | 400 | Maximum 100 operations per bulk request | Tối đa 100 thao tác mỗi bulk request | `{ max: 100, received }` |

### 3.3 WIP Enforcement (WIP_)

| Code | HTTP | Message | Message (vi) | Details |
|------|:----:|---------|-------------|---------|
| `WIP_LIMIT_EXCEEDED` | 409 | WIP limit reached ({current}/{limit} tasks in Doing) | Đã đạt giới hạn WIP ({current}/{limit} task Doing) | `{ current_doing, wip_limit, doing_tasks, suggested_actions }` |
| `WIP_OVERRIDE_NOT_ALLOWED` | 403 | Only Managers can override WIP limit | Chỉ Manager mới có thể vượt WIP | `{ required_role: 'manager' }` |
| `WIP_OVERRIDE_REASON_SHORT` | 400 | Override reason must be at least 20 characters | Lý do override phải có ít nhất 20 ký tự | `{ min_length: 20 }` |
| `WIP_LIMIT_INVALID` | 400 | WIP limit must be between 1 and 5 | Giới hạn WIP phải từ 1 đến 5 | `{ min: 1, max: 5 }` |

### 3.4 Quarantine & Trade-off (TRIAGE_)

| Code | HTTP | Message | Message (vi) | Details |
|------|:----:|---------|-------------|---------|
| `TRIAGE_NOT_IN_QUARANTINE` | 422 | Task is not in Quarantine | Task không ở trong Quarantine | `{ current_status }` |
| `TRIAGE_REASON_SHORT` | 400 | Trade-off reason must be at least 20 characters | Lý do trade-off phải có ít nhất 20 ký tự | `{ min_length: 20 }` |
| `TRIAGE_AFFECTED_TASK_REQUIRED` | 400 | Swap decision requires specifying affected task | Quyết định Hoán đổi cần chỉ định task bị ảnh hưởng | — |
| `TRIAGE_AFFECTED_TASK_NOT_DOING` | 422 | Affected task must be in Doing status to swap | Task bị ảnh hưởng phải đang ở Doing | `{ affected_task_status }` |
| `TRIAGE_MANAGER_REQUIRED` | 403 | Only Managers can process Quarantine tasks | Chỉ Manager mới có thể xử lý Quarantine | — |

### 3.5 Cycle Management (CYCLE_)

| Code | HTTP | Message | Message (vi) | Details |
|------|:----:|---------|-------------|---------|
| `CYCLE_NOT_FOUND` | 404 | Cycle not found | Không tìm thấy cycle | `{ cycle_id }` |
| `CYCLE_ALREADY_ACTIVE` | 409 | An active cycle already exists | Đã có cycle đang active | `{ active_cycle_id }` |
| `CYCLE_NOT_REVIEWED` | 422 | Cycle must be reviewed before closing | Cycle phải được review trước khi đóng | `{ cycle_id }` |
| `CYCLE_DATES_INVALID` | 400 | End date must be after start date | Ngày kết thúc phải sau ngày bắt đầu | `{ start_date, end_date }` |
| `CYCLE_OVERLAP` | 409 | Cycle dates overlap with existing cycle | Ngày cycle trùng với cycle đang có | `{ conflicting_cycle_id }` |

### 3.6 Focus Mode (FOCUS_)

| Code | HTTP | Message | Message (vi) | Details |
|------|:----:|---------|-------------|---------|
| `FOCUS_TASK_NOT_DOING` | 422 | Can only focus on tasks in Doing status | Chỉ có thể focus task đang Doing | `{ task_status }` |
| `FOCUS_ALREADY_ACTIVE` | 409 | A focus session is already active | Đã có phiên focus đang hoạt động | `{ active_session_id, task_id }` |
| `FOCUS_SESSION_NOT_FOUND` | 404 | No active focus session | Không có phiên focus đang hoạt động | — |

### 3.7 Quick Strike (QS_)

| Code | HTTP | Message | Message (vi) | Details |
|------|:----:|---------|-------------|---------|
| `QS_DESCRIPTION_TOO_LONG` | 400 | Quick Strike description max 200 chars | Mô tả Quick Strike tối đa 200 ký tự | `{ max: 200, current }` |
| `QS_SUGGEST_FORMAL_TASK` | 200 | Description > 50 chars — consider creating a formal task | Mô tả > 50 ký tự — cân nhắc tạo task chính thức | `{ description_length }` |

### 3.8 File & Upload (FILE_)

| Code | HTTP | Message | Message (vi) | Details |
|------|:----:|---------|-------------|---------|
| `FILE_TOO_LARGE` | 413 | File exceeds 50MB limit | File vượt quá giới hạn 50MB | `{ max_bytes: 52428800, file_size }` |
| `FILE_PROJECT_STORAGE_FULL` | 413 | Project storage limit reached (500MB) | Dung lượng dự án đã đầy (500MB) | `{ max_bytes, used_bytes }` |
| `FILE_TYPE_NOT_ALLOWED` | 415 | File type not supported | Loại file không được hỗ trợ | `{ mime_type, allowed_types }` |
| `FILE_NOT_FOUND` | 404 | Attachment not found | Không tìm thấy file đính kèm | `{ attachment_id }` |

### 3.9 Search (SEARCH_)

| Code | HTTP | Message | Message (vi) | Details |
|------|:----:|---------|-------------|---------|
| `SEARCH_QUERY_EMPTY` | 400 | Search query is required | Cần nhập từ khóa tìm kiếm | — |
| `SEARCH_QUERY_TOO_LONG` | 400 | Search query max 500 characters | Từ khóa tối đa 500 ký tự | `{ max: 500 }` |

### 3.10 User Management (USER_)

| Code | HTTP | Message | Message (vi) | Details |
|------|:----:|---------|-------------|---------|
| `USER_NOT_FOUND` | 404 | User not found | Không tìm thấy user | `{ user_id }` |
| `USER_EMAIL_EXISTS` | 409 | Email already registered | Email đã được đăng ký | — |
| `USER_CANNOT_DELETE_SELF` | 422 | Cannot delete your own account via admin | Không thể xóa tài khoản chính mình qua admin | — |

### 3.11 Webhook (WEBHOOK_)

| Code | HTTP | Message | Message (vi) | Details |
|------|:----:|---------|-------------|---------|
| `WEBHOOK_URL_INVALID` | 400 | Webhook URL must be HTTPS | URL webhook phải là HTTPS | — |
| `WEBHOOK_DELIVERY_FAILED` | 502 | Webhook delivery failed after 3 retries | Gửi webhook thất bại sau 3 lần thử | `{ http_status, attempts }` |
| `WEBHOOK_SIGNATURE_INVALID` | 401 | Invalid webhook signature | Chữ ký webhook không hợp lệ | — |

### 3.12 Validation (VALID_)

| Code | HTTP | Message | Message (vi) | Details |
|------|:----:|---------|-------------|---------|
| `VALID_REQUIRED_FIELD` | 400 | Field {field} is required | Trường {field} là bắt buộc | `{ field }` |
| `VALID_INVALID_UUID` | 400 | Invalid UUID format for {field} | UUID không hợp lệ cho {field} | `{ field, value }` |
| `VALID_INVALID_DATE` | 400 | Invalid date format (expected ISO 8601) | Định dạng ngày không hợp lệ | `{ field, value }` |
| `VALID_STRING_TOO_LONG` | 400 | {field} exceeds max length of {max} | {field} vượt quá {max} ký tự | `{ field, max, current }` |
| `VALID_INVALID_ENUM` | 400 | Invalid value for {field} | Giá trị không hợp lệ cho {field} | `{ field, value, allowed_values }` |

### 3.13 System (SYSTEM_)

| Code | HTTP | Message | Message (vi) | Details |
|------|:----:|---------|-------------|---------|
| `SYSTEM_INTERNAL_ERROR` | 500 | An unexpected error occurred | Đã xảy ra lỗi không mong muốn | `{ request_id }` |
| `SYSTEM_RATE_LIMITED` | 429 | Too many requests — try again later | Quá nhiều yêu cầu — thử lại sau | `{ retry_after_seconds }` |
| `SYSTEM_MAINTENANCE` | 503 | System is under maintenance | Hệ thống đang bảo trì | `{ estimated_end }` |
| `SYSTEM_DATABASE_ERROR` | 500 | Database operation failed | Lỗi cơ sở dữ liệu | `{ request_id }` |

---

## 4. Error Code Implementation

```typescript
// lib/constants/error-codes.ts

export const ErrorCodes = {
    // Auth
    AUTH_UNAUTHENTICATED: { code: 'AUTH_UNAUTHENTICATED', status: 401 },
    AUTH_TOKEN_EXPIRED: { code: 'AUTH_TOKEN_EXPIRED', status: 401 },
    AUTH_INSUFFICIENT_PERMISSIONS: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', status: 403 },
    AUTH_CSRF_FAILED: { code: 'AUTH_CSRF_FAILED', status: 403 },
    
    // Task
    TASK_NOT_FOUND: { code: 'TASK_NOT_FOUND', status: 404 },
    TASK_INVALID_TRANSITION: { code: 'TASK_INVALID_TRANSITION', status: 422 },
    TASK_DEPENDENCY_UNMET: { code: 'TASK_DEPENDENCY_UNMET', status: 409 },
    
    // WIP
    WIP_LIMIT_EXCEEDED: { code: 'WIP_LIMIT_EXCEEDED', status: 409 },
    WIP_OVERRIDE_NOT_ALLOWED: { code: 'WIP_OVERRIDE_NOT_ALLOWED', status: 403 },
    
    // ... other codes
} as const

// Usage in service layer
import { AppError } from '@/lib/errors'
import { ErrorCodes } from '@/lib/constants/error-codes'

throw new AppError(
    ErrorCodes.WIP_LIMIT_EXCEEDED.code,
    'WIP limit reached (2/2 tasks in Doing)',
    ErrorCodes.WIP_LIMIT_EXCEEDED.status,
    { current_doing: 2, wip_limit: 2, doing_tasks: [...] }
)
```

---

## 5. Client-side Error Handling

```typescript
// lib/utils/error-handler.ts

const ERROR_MESSAGES_VI: Record<string, string> = {
    'WIP_LIMIT_EXCEEDED': 'Bạn đã đạt giới hạn WIP. Hoàn thành hoặc tạm dừng task hiện tại.',
    'TASK_INVALID_TRANSITION': 'Không thể chuyển trạng thái task. Kiểm tra lại flow.',
    'AUTH_UNAUTHENTICATED': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    // ...
}

export function getErrorMessage(code: string, locale = 'vi'): string {
    if (locale === 'vi') return ERROR_MESSAGES_VI[code] ?? 'Đã xảy ra lỗi không mong muốn'
    return code // fallback to code for EN (use `message` from API)
}
```

---

> **Tài liệu liên quan:**
> - [03_API_SPEC.md](./03_API_SPEC.md) — API error response format
> - [06_TASK_WORKFLOW.md](./06_TASK_WORKFLOW.md) — Transition rules that trigger errors
> - [04_SECURITY_MODEL.md](./04_SECURITY_MODEL.md) — Auth errors
