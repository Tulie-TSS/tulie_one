export const ErrorCodes = {
    // Auth
    AUTH_UNAUTHENTICATED: { code: 'AUTH_UNAUTHENTICATED', status: 401, vi: 'Bạn cần đăng nhập' },
    AUTH_TOKEN_EXPIRED: { code: 'AUTH_TOKEN_EXPIRED', status: 401, vi: 'Token đã hết hạn' },
    AUTH_TOKEN_INVALID: { code: 'AUTH_TOKEN_INVALID', status: 401, vi: 'Token không hợp lệ' },
    AUTH_INSUFFICIENT_PERMISSIONS: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', status: 403, vi: 'Bạn không có quyền thực hiện' },
    AUTH_CSRF_FAILED: { code: 'AUTH_CSRF_FAILED', status: 403, vi: 'Xác thực CSRF thất bại' },
    AUTH_SESSION_LIMIT: { code: 'AUTH_SESSION_LIMIT', status: 403, vi: 'Đã đạt giới hạn phiên đồng thời' },
    AUTH_ORG_MISMATCH: { code: 'AUTH_ORG_MISMATCH', status: 403, vi: 'Resource không thuộc tổ chức của bạn' },

    // Task
    TASK_NOT_FOUND: { code: 'TASK_NOT_FOUND', status: 404, vi: 'Không tìm thấy task' },
    TASK_INVALID_TRANSITION: { code: 'TASK_INVALID_TRANSITION', status: 422, vi: 'Không thể chuyển trạng thái task' },
    TASK_TITLE_TOO_SHORT: { code: 'TASK_TITLE_TOO_SHORT', status: 400, vi: 'Tiêu đề phải có ít nhất 10 ký tự' },
    TASK_EFFORT_REQUIRED: { code: 'TASK_EFFORT_REQUIRED', status: 400, vi: 'Cần nhập thời gian ước tính > 0' },
    TASK_SUGGEST_QUICK_STRIKE: { code: 'TASK_SUGGEST_QUICK_STRIKE', status: 422, vi: 'Effort ≤ 2 phút — hãy dùng Quick Strike' },
    TASK_DEADLINE_INFEASIBLE: { code: 'TASK_DEADLINE_INFEASIBLE', status: 422, vi: 'Deadline ngắn hơn thời gian ước tính' },
    TASK_DEPENDENCY_UNMET: { code: 'TASK_DEPENDENCY_UNMET', status: 409, vi: 'Bị chặn bởi task dependency chưa hoàn thành' },
    TASK_DEPENDENCY_CIRCULAR: { code: 'TASK_DEPENDENCY_CIRCULAR', status: 422, vi: 'Phát hiện dependency vòng lặp' },
    TASK_ALREADY_DONE: { code: 'TASK_ALREADY_DONE', status: 422, vi: 'Task đã hoàn thành' },
    TASK_CROSS_CYCLE: { code: 'TASK_CROSS_CYCLE', status: 422, vi: 'Không thể lên lịch task vượt ranh giới cycle' },

    // WIP
    WIP_LIMIT_EXCEEDED: { code: 'WIP_LIMIT_EXCEEDED', status: 409, vi: 'Đã đạt giới hạn WIP' },
    WIP_OVERRIDE_NOT_ALLOWED: { code: 'WIP_OVERRIDE_NOT_ALLOWED', status: 403, vi: 'Chỉ Manager mới có thể vượt WIP' },
    WIP_OVERRIDE_REASON_SHORT: { code: 'WIP_OVERRIDE_REASON_SHORT', status: 400, vi: 'Lý do override phải có ít nhất 20 ký tự' },

    // Triage
    TRIAGE_NOT_IN_QUARANTINE: { code: 'TRIAGE_NOT_IN_QUARANTINE', status: 422, vi: 'Task không ở trong Quarantine' },
    TRIAGE_REASON_SHORT: { code: 'TRIAGE_REASON_SHORT', status: 400, vi: 'Lý do trade-off phải có ít nhất 20 ký tự' },
    TRIAGE_MANAGER_REQUIRED: { code: 'TRIAGE_MANAGER_REQUIRED', status: 403, vi: 'Chỉ Manager mới có thể xử lý Quarantine' },

    // Cycle
    CYCLE_NOT_FOUND: { code: 'CYCLE_NOT_FOUND', status: 404, vi: 'Không tìm thấy cycle' },
    CYCLE_ALREADY_ACTIVE: { code: 'CYCLE_ALREADY_ACTIVE', status: 409, vi: 'Đã có cycle đang active' },

    // Focus
    FOCUS_TASK_NOT_DOING: { code: 'FOCUS_TASK_NOT_DOING', status: 422, vi: 'Chỉ có thể focus task đang Doing' },
    FOCUS_ALREADY_ACTIVE: { code: 'FOCUS_ALREADY_ACTIVE', status: 409, vi: 'Đã có phiên focus đang hoạt động' },

    // System
    SYSTEM_INTERNAL_ERROR: { code: 'SYSTEM_INTERNAL_ERROR', status: 500, vi: 'Đã xảy ra lỗi không mong muốn' },
    SYSTEM_RATE_LIMITED: { code: 'SYSTEM_RATE_LIMITED', status: 429, vi: 'Quá nhiều yêu cầu — thử lại sau' },
} as const

export const ERROR_MESSAGES_VI: Record<string, string> = Object.fromEntries(
    Object.values(ErrorCodes).map(e => [e.code, e.vi])
)

export function getErrorMessage(code: string, locale = 'vi'): string {
    if (locale === 'vi') return ERROR_MESSAGES_VI[code] ?? 'Đã xảy ra lỗi không mong muốn'
    return code
}
