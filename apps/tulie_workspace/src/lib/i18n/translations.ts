export type Locale = "vi" | "en";

export const translations = {
  // ============================================
  // Chung / Common
  // ============================================
  "app.name": { vi: "Tulie Workspace", en: "Tulie Workspace" },
  "app.tagline": {
    vi: "Bảo vệ Dòng chảy công việc của bạn",
    en: "Protect your workflow",
  },
  "app.description": {
    vi: "Hệ thống quản lý công việc bảo vệ Flow State qua giới hạn WIP",
    en: "Task management system protecting Flow State via WIP limits",
  },

  // ============================================
  // Điều hướng / Navigation
  // ============================================
  "nav.overview": { vi: "Tổng quan", en: "Overview" },
  "nav.board": { vi: "Bảng công việc", en: "Board" },
  "nav.focus": { vi: "Chế độ tập trung", en: "Focus Mode" },
  "nav.quarantine": { vi: "Vùng cách ly", en: "Quarantine" },
  "nav.tasks": { vi: "Công việc", en: "Tasks" },
  "nav.projects": { vi: "Dự án", en: "Projects" },
  "nav.cycles": { vi: "Chu kỳ", en: "Cycles" },
  "nav.analytics": { vi: "Phân tích", en: "Analytics" },
  "nav.templates": { vi: "Mẫu", en: "Templates" },
  "nav.strategy": { vi: "Chiến lược", en: "Strategy" },
  "nav.okrs": { vi: "KPI & OKRs", en: "KPI & OKRs" },
  "nav.settings": { vi: "Cài đặt", en: "Settings" },
  "nav.search": { vi: "Tìm kiếm", en: "Search" },
  "nav.resources": { vi: "Tài liệu & Nhúng", en: "Resources & Embeds" },
  "nav.commandCenter": { vi: "Command Center", en: "Command Center" },
  "nav.habits": { vi: "Thói quen", en: "Habits" },
  "nav.learning": { vi: "Học tập (FPT)", en: "Learning (FPT)" },
  "nav.kpi": { vi: "KPI Tulie", en: "KPI Tulie" },
  "nav.lifeRoles": { vi: "Lĩnh vực / Mảng", en: "Life Roles" },
  "nav.details.cycles": { vi: "Chi tiết chu kỳ", en: "Cycle Details" },
  "nav.details.projects": { vi: "Chi tiết dự án", en: "Project Details" },
  "nav.details.tasks": { vi: "Chi tiết công việc", en: "Task Details" },
  "nav.details.default": { vi: "Chi tiết", en: "Details" },

  // ============================================
  // Trạng thái Task / Task Statuses
  // ============================================
  "status.backlog": { vi: "Chờ xử lý", en: "Backlog" },
  "status.ready": { vi: "Sẵn sàng", en: "Ready" },
  "status.doing": { vi: "Đang làm", en: "Doing" },
  "status.in_review": { vi: "Đang duyệt", en: "In Review" },
  "status.done": { vi: "Hoàn thành", en: "Done" },
  "status.on_hold": { vi: "Tạm dừng", en: "On Hold" },
  "status.quarantine": { vi: "Cách ly", en: "Quarantine" },
  "status.cancelled": { vi: "Đã huỷ", en: "Cancelled" },
  "status.carried_over": { vi: "Chuyển tiếp", en: "Carried Over" },

  // ============================================
  // Xác thực / Auth
  // ============================================
  "auth.login": { vi: "Đăng nhập", en: "Sign in" },
  "auth.register": { vi: "Đăng ký", en: "Sign up" },
  "auth.email": { vi: "Email", en: "Email" },
  "auth.password": { vi: "Mật khẩu", en: "Password" },
  "auth.fullName": { vi: "Họ và tên", en: "Full name" },
  "auth.role": { vi: "Vai trò", en: "Role" },
  "auth.noAccount": { vi: "Chưa có tài khoản?", en: "Don't have an account?" },
  "auth.hasAccount": { vi: "Đã có tài khoản?", en: "Already have an account?" },
  "auth.loggingIn": { vi: "Đang đăng nhập...", en: "Signing in..." },
  "auth.registering": {
    vi: "Đang tạo tài khoản...",
    en: "Creating account...",
  },
  "auth.createAccount": { vi: "Tạo tài khoản mới", en: "Create new account" },

  // ============================================
  // Vai trò / Roles
  // ============================================
  "role.maker": {
    vi: "Nhân viên (Maker)",
    en: "Staff (Maker)",
  },
  "role.manager": { vi: "CEO / Quản lý", en: "CEO / Manager" },
  "role.observer": {
    vi: "Quan sát (Stakeholder)",
    en: "Observer (Stakeholder)",
  },
  "role.admin": { vi: "Quản trị viên (Admin)", en: "Admin" },

  // ============================================
  // Tổng quan / Dashboard
  // ============================================
  "dashboard.title": { vi: "Tổng quan", en: "Overview" },
  "dashboard.doing": { vi: "Đang thực hiện", en: "In Progress" },
  "dashboard.ready": { vi: "Sẵn sàng", en: "Ready" },
  "dashboard.quarantine": { vi: "Cách ly", en: "Quarantine" },
  "dashboard.completed": { vi: "Hoàn thành", en: "Completed" },
  "dashboard.weekOf": { vi: "Tuần", en: "Week" },
  "dashboard.tasksTriage": {
    vi: "công việc đang chờ phân loại",
    en: "tasks awaiting triage",
  },
  "dashboard.doingTasks": {
    vi: "Công việc đang thực hiện",
    en: "Tasks in progress",
  },
  "dashboard.viewBoard": { vi: "Xem bảng →", en: "View board →" },
  "dashboard.noDoingTasks": {
    vi: "Chưa có công việc nào đang làm",
    en: "No tasks in progress",
  },
  "dashboard.cycleProgress": { vi: "Tiến độ chu kỳ", en: "Cycle Progress" },
  "dashboard.details": { vi: "Chi tiết →", en: "Details →" },
  "dashboard.newNotifications": {
    vi: "Thông báo mới",
    en: "New notifications",
  },
  "dashboard.projects": { vi: "Dự án", en: "Projects" },
  "dashboard.allProjects": { vi: "Tất cả →", en: "All →" },
  "dashboard.tasksDone": { vi: "công việc hoàn thành", en: "tasks done" },

  // ============================================
  // Bảng công việc / Board
  // ============================================
  "board.title": { vi: "Bảng công việc", en: "Board" },
  "board.subtitle": {
    vi: "Kéo thả công việc giữa các cột",
    en: "Drag and drop tasks between columns",
  },
  "board.createTask": { vi: "Tạo công việc", en: "Create task" },
  "board.dragHere": { vi: "Kéo công việc vào đây", en: "Drag tasks here" },

  // ============================================
  // Chế độ tập trung / Focus Mode
  // ============================================
  "focus.title": { vi: "Chế độ tập trung", en: "Focus Mode" },
  "focus.selectTask": {
    vi: "Chọn công việc và bắt đầu tập trung",
    en: "Select a task to start focusing",
  },
  "focus.noDoingTasks": {
    vi: "Chưa có công việc nào đang thực hiện",
    en: "No tasks currently in progress",
  },
  "focus.moveToBoard": {
    vi: "Chuyển công việc từ Sẵn sàng sang Đang làm trước",
    en: "Move a task from Ready to Doing first",
  },
  "focus.goToBoard": { vi: "Đến bảng công việc", en: "Go to board" },
  "focus.start": { vi: "Bắt đầu", en: "Start" },
  "focus.pause": { vi: "Tạm dừng", en: "Pause" },
  "focus.resume": { vi: "Tiếp tục", en: "Resume" },
  "focus.complete": { vi: "✓ Hoàn thành", en: "✓ Complete" },
  "focus.exit": { vi: "Thoát chế độ tập trung", en: "Exit Focus Mode" },

  // ============================================
  // Vùng cách ly / Quarantine
  // ============================================
  "quarantine.title": { vi: "Vùng cách ly", en: "Quarantine Zone" },
  "quarantine.subtitle": {
    vi: "Công việc cần phân loại: khẩn cấp, deadline không khả thi, hoặc bị đánh dấu",
    en: "Tasks needing triage: urgent, infeasible deadline, or flagged",
  },
  "quarantine.empty": {
    vi: "Vùng cách ly trống",
    en: "Quarantine zone is empty",
  },
  "quarantine.noTriage": {
    vi: "Không có công việc nào cần phân loại",
    en: "No tasks need triage",
  },
  "quarantine.tradeOff": { vi: "Đánh đổi", en: "Trade-off" },
  "quarantine.defer": { vi: "Hoãn lại", en: "Defer" },
  "quarantine.reject": { vi: "Từ chối", en: "Reject" },
  "quarantine.deferToReady": {
    vi: "→ Chuyển sang Sẵn sàng (ưu tiên cao)",
    en: "→ Move to Ready (high priority)",
  },
  "quarantine.deferToBacklog": {
    vi: "→ Chuyển sang Chờ xử lý",
    en: "→ Move to Backlog",
  },
  "quarantine.tradeOffTitle": {
    vi: "Chọn công việc để hoán đổi",
    en: "Select a task to swap",
  },
  "quarantine.tradeOffDesc": {
    vi: "Bạn đã đạt giới hạn WIP. Chọn 1 công việc đang làm để hoán đổi ra.",
    en: "You've reached WIP limit. Select a task to swap out.",
  },
  "quarantine.swapConfirm": { vi: "Xác nhận hoán đổi", en: "Confirm swap" },
  "quarantine.cancel": { vi: "Huỷ", en: "Cancel" },
  "quarantine.swapSuccess": {
    vi: "Đã hoán đổi thành công!",
    en: "Swap successful!",
  },
  "quarantine.deferSuccess": { vi: "Đã hoãn công việc", en: "Task deferred" },
  "quarantine.rejectSuccess": {
    vi: "Đã từ chối công việc",
    en: "Task rejected",
  },

  // ============================================
  // Công việc / Tasks
  // ============================================
  "tasks.title": { vi: "Công việc", en: "Tasks" },
  "tasks.subtitle": { vi: "Danh sách tất cả công việc", en: "All tasks list" },
  "tasks.all": { vi: "Tất cả", en: "All" },
  "tasks.createTask": { vi: "Tạo công việc", en: "Create task" },
  "tasks.backToList": { vi: "← Quay lại danh sách", en: "← Back to list" },
  "tasks.transitionTo": { vi: "Chuyển sang:", en: "Transition to:" },
  "tasks.comments": { vi: "Bình luận", en: "Comments" },
  "tasks.noComments": { vi: "Chưa có bình luận", en: "No comments yet" },
  "tasks.writeComment": { vi: "Viết bình luận...", en: "Write a comment..." },
  "tasks.activityLog": { vi: "Lịch sử hoạt động", en: "Activity log" },
  "tasks.details": { vi: "Chi tiết", en: "Details" },
  "tasks.assignee": { vi: "Người thực hiện", en: "Assignee" },
  "tasks.unassigned": { vi: "Chưa giao", en: "Unassigned" },
  "tasks.estimate": { vi: "Ước tính", en: "Estimate" },
  "tasks.actualDuration": { vi: "Thời lượng thực", en: "Actual duration" },
  "tasks.project": { vi: "Dự án", en: "Project" },
  "tasks.deadline": { vi: "Hạn chót", en: "Deadline" },
  "tasks.tags": { vi: "Nhãn", en: "Tags" },
  "tasks.changed": { vi: "chuyển", en: "changed" },

  // ============================================
  // Dự án / Projects
  // ============================================
  "projects.title": { vi: "Dự án", en: "Projects" },
  "projects.subtitle": {
    vi: "Quản lý các dự án trong chu kỳ",
    en: "Manage projects in cycle",
  },
  "projects.create": { vi: "Tạo dự án", en: "Create project" },
  "projects.newProject": { vi: "Khởi tạo Dự án", en: "New Project" },
  "projects.editProject": { vi: "Chỉnh sửa Dự án", en: "Edit Project" },
  "projects.info": { vi: "Thông tin dự án", en: "Project Information" },
  "projects.details": { vi: "Điền thông tin chi tiết để bắt đầu một dự án mới.", en: "Fill in the details to start a new project." },
  "projects.name": { vi: "Tên dự án", en: "Project Name" },
  "projects.description": { vi: "Mô tả mục tiêu", en: "Project Description" },
  "projects.owner": { vi: "Chủ trì dự án (Owner)", en: "Project Owner" },
  "projects.members": { vi: "Thành viên tham gia", en: "Project Members" },
  "projects.backToList": { vi: "← Quay lại danh sách", en: "← Back to list" },
  "projects.tasks": { vi: "Công việc", en: "Tasks" },

  // ============================================
  // Chu kỳ / Cycles
  // ============================================
  "cycles.title": { vi: "Chu kỳ", en: "Cycles" },
  "cycles.subtitle": {
    vi: "Chu kỳ 12 tuần — Kế hoạch theo giai đoạn",
    en: "12-Week Cycles — Phase-based planning",
  },
  "cycles.create": { vi: "Tạo chu kỳ", en: "Create cycle" },
  "cycles.backToList": { vi: "← Quay lại danh sách", en: "← Back to list" },
  "cycles.start": { vi: "Bắt đầu", en: "Start" },
  "cycles.end": { vi: "Kết thúc", en: "End" },
  "cycles.goals": { vi: "Mục tiêu", en: "Goals" },
  "cycles.milestones": { vi: "Cột mốc", en: "Milestones" },
  "cycles.target": { vi: "Mục tiêu", en: "Target" },
  "cycles.taskStatus": { vi: "Trạng thái công việc", en: "Task status" },
  "cycles.active": { vi: "Đang diễn ra", en: "Active" },

  // ============================================
  // Phân tích / Analytics
  // ============================================
  "analytics.title": { vi: "Phân tích", en: "Analytics" },
  "analytics.subtitle": {
    vi: "Số liệu & thông tin chi tiết cho Quản lý",
    en: "Metrics & insights for Managers",
  },
  "analytics.totalTasks": { vi: "Tổng công việc", en: "Total tasks" },
  "analytics.completed": { vi: "Hoàn thành", en: "Completed" },
  "analytics.inProgress": { vi: "Đang làm", en: "In progress" },
  "analytics.quickStrikes": { vi: "Xử lý nhanh", en: "Quick Strikes" },
  "analytics.statusBreakdown": {
    vi: "Phân bổ theo trạng thái",
    en: "Status breakdown",
  },
  "analytics.wipHeatmap": { vi: "Bản đồ nhiệt WIP", en: "WIP Heatmap" },

  // ============================================
  // Cài đặt / Settings
  // ============================================
  "settings.title": { vi: "Cài đặt", en: "Settings" },
  "settings.subtitle": {
    vi: "Quản lý tài khoản và cài đặt hệ thống",
    en: "Manage account and system settings",
  },
  "settings.general": { vi: "Cài đặt chung", en: "General settings" },
  "settings.generalDesc": {
    vi: "Giao diện, ngôn ngữ, múi giờ, thông báo",
    en: "Theme, language, timezone, notifications",
  },
  "settings.team": { vi: "Quản lý nhóm", en: "Team management" },
  "settings.teamDesc": {
    vi: "Thành viên, vai trò, phân quyền",
    en: "Members, roles, permissions",
  },
  "settings.wip": { vi: "Quy tắc WIP", en: "WIP Rules" },
  "settings.wipDesc": {
    vi: "Giới hạn WIP, quy tắc ghi đè, hệ số Hofstadter",
    en: "WIP limits, override rules, Hofstadter coefficient",
  },
  "settings.theme": { vi: "Giao diện", en: "Theme" },
  "settings.themeLight": { vi: "Sáng", en: "Light" },
  "settings.themeDark": { vi: "Tối", en: "Dark" },
  "settings.themeAuto": { vi: "Tự động (theo hệ thống)", en: "Auto (system)" },
  "settings.language": { vi: "Ngôn ngữ", en: "Language" },
  "settings.timezone": { vi: "Múi giờ", en: "Timezone" },
  "settings.save": { vi: "Lưu thay đổi", en: "Save changes" },
  "settings.inviteMember": { vi: "Mời thành viên", en: "Invite member" },
  "settings.backToSettings": {
    vi: "← Quay lại Cài đặt",
    en: "← Back to Settings",
  },

  // ============================================
  // Bảng Team / Team table
  // ============================================
  "team.member": { vi: "Thành viên", en: "Member" },
  "team.email": { vi: "Email", en: "Email" },
  "team.role": { vi: "Vai trò", en: "Role" },
  "team.wipLimit": { vi: "Giới hạn WIP", en: "WIP Limit" },
  "team.status": { vi: "Trạng thái", en: "Status" },
  "team.active": { vi: "Hoạt động", en: "Active" },
  "team.inactive": { vi: "Không hoạt động", en: "Inactive" },

  // ============================================
  // WIP Settings
  // ============================================
  "wip.personalLimit": { vi: "Giới hạn WIP cá nhân", en: "Personal WIP limit" },
  "wip.maxDoing": {
    vi: "Số công việc Đang làm tối đa",
    en: "Max simultaneous Doing tasks",
  },
  "wip.allowOverride": {
    vi: "Cho phép Quản lý ghi đè giới hạn WIP",
    en: "Allow Manager to override WIP limit",
  },
  "wip.hofstadter": { vi: "Hệ số Hofstadter", en: "Hofstadter Multiplier" },
  "wip.defaultCoeff": { vi: "Hệ số mặc định", en: "Default coefficient" },
  "wip.formula": {
    vi: "thời_lượng_dự_kiến = nỗ_lực × Hofstadter",
    en: "scheduled_duration = effort × Hofstadter",
  },
  "wip.range": { vi: "Phạm vi", en: "Range" },
  "wip.allowed": { vi: "Cho phép", en: "Allowed" },

  // ============================================
  // Mẫu / Templates
  // ============================================
  "templates.title": { vi: "Mẫu công việc", en: "Task Templates" },
  "templates.subtitle": {
    vi: "Tạo công việc nhanh từ các mẫu có sẵn",
    en: "Quickly create tasks from predefined templates",
  },
  "templates.create": { vi: "Tạo mẫu", en: "Create template" },
  "templates.defaultEffort": { vi: "Nỗ lực mặc định", en: "Default effort" },

  // ============================================
  // Tìm kiếm / Search
  // ============================================
  "search.title": { vi: "Tìm kiếm", en: "Search" },
  "search.placeholder": {
    vi: "Tìm công việc, dự án, người...",
    en: "Search tasks, projects, people...",
  },
  "search.headerPlaceholder": { vi: "Tìm kiếm... (⌘K)", en: "Search... (⌘K)" },
  "search.results": { vi: "kết quả cho", en: "results for" },
  "search.minChars": {
    vi: "Nhập ít nhất 2 ký tự để tìm kiếm",
    en: "Enter at least 2 characters to search",
  },

  // ============================================
  // Xử lý nhanh / Quick Strike
  // ============================================
  "quickStrike.placeholder": {
    vi: "Xử lý nhanh... (≤ 2 phút)",
    en: "Quick Strike... (≤ 2 min)",
  },
  "quickStrike.recent": { vi: "Hoàn thành gần đây", en: "Recently completed" },

  // ============================================
  // Thông báo / Notifications
  // ============================================
  "notifications.title": { vi: "Thông báo", en: "Notifications" },
  "notifications.markAllRead": {
    vi: "Đánh dấu tất cả đã đọc",
    en: "Mark all as read",
  },
  "notifications.empty": {
    vi: "Không có thông báo mới",
    en: "No new notifications",
  },
  "notifications.allCaughtUp": {
    vi: "Bạn đã xem hết thông báo!",
    en: "You're all caught up!",
  },
  "notifications.justNow": { vi: "Vừa xong", en: "Just now" },
  "notifications.minutesAgo": { vi: "phút trước", en: "minutes ago" },
  "notifications.hoursAgo": { vi: "giờ trước", en: "hours ago" },
  "notifications.daysAgo": { vi: "ngày trước", en: "days ago" },

  // ============================================
  // Strategy Plan
  // ============================================
  "strategy.title": { vi: "Kế hoạch Chiến lược", en: "Strategy Plan" },
  "strategy.subtitle": {
    vi: "Theo dõi deals, tài chính, tuyển dụng và marketing",
    en: "Track deals, finance, hiring and marketing",
  },
  "strategy.pipelineValue": { vi: "Giá trị Pipeline", en: "Pipeline Value" },
  "strategy.weighted": { vi: "Giá trị trọng số", en: "Weighted" },
  "strategy.netProfit": { vi: "Lợi nhuận ròng", en: "Net Profit" },
  "strategy.thisMonth": { vi: "tháng này", en: "this month" },
  "strategy.hiring": { vi: "Tuyển dụng", en: "Hiring" },
  "strategy.positionsOpen": {
    vi: "vị trí đang lên kế hoạch",
    en: "positions planning",
  },
  "strategy.marketing": { vi: "Marketing", en: "Marketing" },
  "strategy.leads": { vi: "leads", en: "leads" },
  "strategy.spent": { vi: "đã chi", en: "spent" },
  "strategy.dealsPipeline": { vi: "Pipeline Deals", en: "Deals Pipeline" },
  "strategy.salesTargets": { vi: "Mục tiêu Doanh thu", en: "Sales Targets" },
  "strategy.hiringPlans": { vi: "Kế hoạch Tuyển dụng", en: "Hiring Plans" },
  "strategy.contentCalendar": { vi: "Lịch Nội dung", en: "Content Calendar" },
  "strategy.monthlyFinance": {
    vi: "Tài chính Hàng tháng",
    en: "Monthly Finance",
  },
  "strategy.revenue": { vi: "DT", en: "Rev" },

  // ============================================
  // Chung / General
  // ============================================
  "common.notFound": { vi: "Trang không tồn tại", en: "Page not found" },
  "common.notFoundDesc": {
    vi: "Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.",
    en: "The page you are looking for does not exist or has been moved.",
  },
  "common.goHome": { vi: "← Về trang chủ", en: "← Go home" },
  "common.error": { vi: "Đã xảy ra lỗi", en: "An error occurred" },
  "common.errorDefault": {
    vi: "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
    en: "An unexpected error occurred. Please try again.",
  },
  "common.retry": { vi: "Thử lại", en: "Retry" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale = "vi"): string {
  const entry = translations[key];
  return entry?.[locale] || key;
}
