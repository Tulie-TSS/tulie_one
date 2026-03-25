import type { User, Task, Project, Cycle, Milestone, Tag, Notification, QuickStrikeLog, Comment, TaskLog } from '@/types/database.types'

// ============================================
// Mock Users — Tulie Agency Team
// ============================================

export const MOCK_USERS: User[] = [
    {
        id: 'usr-001', email: 'tung@tulie.vn', full_name: 'Nguyễn Tùng', avatar_url: null,
        role_type: 'admin', organization_id: 'org-001', department_id: 'dept-001', team_id: 'team-001',
        maker_block_min_hours: 2.0, personal_wip_limit: 3, hofstadter_multiplier: 1.20,
        is_active: true, last_seen_at: new Date().toISOString(), created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    },
    {
        id: 'usr-002', email: 'linh@tulie.vn', full_name: 'Trần Thùy Linh', avatar_url: null,
        role_type: 'manager', organization_id: 'org-001', department_id: 'dept-001', team_id: 'team-001',
        maker_block_min_hours: 2.0, personal_wip_limit: 3, hofstadter_multiplier: 1.25,
        is_active: true, last_seen_at: new Date().toISOString(), created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    },
    {
        id: 'usr-003', email: 'minh@tulie.vn', full_name: 'Lê Quang Minh', avatar_url: null,
        role_type: 'maker', organization_id: 'org-001', department_id: 'dept-001', team_id: 'team-001',
        maker_block_min_hours: 4.0, personal_wip_limit: 2, hofstadter_multiplier: 1.30,
        is_active: true, last_seen_at: new Date().toISOString(), created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    },
    {
        id: 'usr-004', email: 'hoa@tulie.vn', full_name: 'Phạm Thanh Hoa', avatar_url: null,
        role_type: 'maker', organization_id: 'org-001', department_id: 'dept-001', team_id: 'team-001',
        maker_block_min_hours: 3.0, personal_wip_limit: 2, hofstadter_multiplier: 1.35,
        is_active: true, last_seen_at: new Date().toISOString(), created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    },
    {
        id: 'usr-005', email: 'duc@tulie.vn', full_name: 'Võ Hoàng Đức', avatar_url: null,
        role_type: 'maker', organization_id: 'org-001', department_id: 'dept-001', team_id: 'team-001',
        maker_block_min_hours: 4.0, personal_wip_limit: 2, hofstadter_multiplier: 1.25,
        is_active: true, last_seen_at: new Date().toISOString(), created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    },
    {
        id: 'usr-006', email: 'contact@phuclong.vn', full_name: 'Anh Khoa (Phúc Long)', avatar_url: null,
        role_type: 'observer', organization_id: 'org-001', department_id: null, team_id: null,
        maker_block_min_hours: 2.0, personal_wip_limit: 2, hofstadter_multiplier: 1.30,
        is_active: true, last_seen_at: null, created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-01T00:00:00Z',
    },
]

// ============================================
// Mock Tags
// ============================================

export const MOCK_TAGS: Tag[] = [
    { id: 'tag-001', name: 'design', color: '#FB8C00', organization_id: 'org-001' },
    { id: 'tag-002', name: 'frontend', color: '#1E88E5', organization_id: 'org-001' },
    { id: 'tag-003', name: 'content', color: '#7B1FA2', organization_id: 'org-001' },
    { id: 'tag-004', name: 'urgent', color: '#E53935', organization_id: 'org-001' },
    { id: 'tag-005', name: 'review', color: '#00897B', organization_id: 'org-001' },
    { id: 'tag-006', name: 'branding', color: '#FF6F00', organization_id: 'org-001' },
    { id: 'tag-007', name: 'seo', color: '#43A047', organization_id: 'org-001' },
    { id: 'tag-008', name: 'bug', color: '#D32F2F', organization_id: 'org-001' },
]

// ============================================
// Mock Cycle & Milestones
// ============================================

export const MOCK_CYCLE: Cycle = {
    id: 'cycle-001', name: 'Q1-2026 — Sprint Tháng 3', organization_id: 'org-001', parent_cycle_id: null,
    start_date: '2026-03-02', end_date: '2026-03-28', buffer_week_start: '2026-03-30',
    status: 'active',
    goals: [
        { title: 'Bàn giao website Phúc Long Coffee', progress: 55 },
        { title: 'Hoàn thành bộ nhận diện Minh Tâm Pharma', progress: 30 },
        { title: 'Onboard 2 khách hàng mới', progress: 50 },
    ],
    created_by: 'usr-001', created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-19T00:00:00Z',
}

export const MOCK_MILESTONES: Milestone[] = [
    { id: 'ms-001', cycle_id: 'cycle-001', name: 'Design & Wireframe', description: 'Hoàn thành wireframe và thiết kế UI/UX', target_date: '2026-03-14', completion_rate: 85, sort_order: 1, created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-14T00:00:00Z' },
    { id: 'ms-002', cycle_id: 'cycle-001', name: 'Development & Content', description: 'Code frontend và nhập nội dung', target_date: '2026-03-21', completion_rate: 45, sort_order: 2, created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-19T00:00:00Z' },
    { id: 'ms-003', cycle_id: 'cycle-001', name: 'Testing & Launch', description: 'QA, fix bug, và launch', target_date: '2026-03-28', completion_rate: 10, sort_order: 3, created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-19T00:00:00Z' },
]

// ============================================
// Mock Projects
// ============================================

export const MOCK_PROJECTS: Project[] = [
    {
        id: 'proj-001', name: 'Website Phúc Long Coffee', description: 'Thiết kế & phát triển website thương hiệu cho chuỗi Phúc Long Coffee — 12 trang, responsive, SEO-ready, tích hợp menu online',
        cycle_id: 'cycle-001', owner_id: 'usr-002', organization_id: 'org-001',
        status: 'active', priority: 'critical',
        created_at: '2026-02-15T00:00:00Z', updated_at: '2026-03-19T00:00:00Z',
        task_count: 14, done_count: 5,
    },
    {
        id: 'proj-002', name: 'Logo & Branding Minh Tâm Pharma', description: 'Thiết kế logo, bộ nhận diện thương hiệu, brand guideline cho công ty dược phẩm Minh Tâm',
        cycle_id: 'cycle-001', owner_id: 'usr-002', organization_id: 'org-001',
        status: 'active', priority: 'high',
        created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-19T00:00:00Z',
        task_count: 10, done_count: 3,
    },
]

// ============================================
// Mock Tasks — Full lifecycle simulation
// ============================================

export const MOCK_TASKS: Task[] = [
    // ===== PROJECT 1: Website Phúc Long Coffee =====

    // DONE — hoàn thành trước hạn
    {
        id: 'task-001', title: 'Họp brief và thu thập tài liệu từ khách hàng Phúc Long Coffee',
        description: 'Họp khách để hiểu yêu cầu, thu thập logo gốc, ảnh sản phẩm, menu, brand color. Tạo creative brief.',
        project_id: 'proj-001', created_by: 'usr-002', assigned_to: 'usr-002',
        status: 'done', eisenhower_quadrant: 'Q1', estimated_effort_hours: 3.0,
        hofstadter_multiplier: 1.25, scheduled_duration_hours: 3.75,
        requested_deadline: '2026-03-05T17:00:00Z', scheduled_start: '2026-03-03T09:00:00Z', scheduled_end: '2026-03-05T12:00:00Z',
        actual_start: '2026-03-03T09:00:00Z', actual_end: '2026-03-04T14:00:00Z', priority: 18,
        cycle_id: 'cycle-001', milestone_id: 'ms-001', carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-02T00:00:00Z', updated_at: '2026-03-04T14:00:00Z',
        assignee: MOCK_USERS[1], tags: [MOCK_TAGS[0], MOCK_TAGS[2]],
    },
    // DONE — đúng hạn
    {
        id: 'task-002', title: 'Thiết kế wireframe toàn bộ 12 trang website Phúc Long Coffee',
        description: 'Wireframe lo-fi cho: Trang chủ, Giới thiệu, Menu (3 sub), Tin tức, Blog, Cửa hàng, Tuyển dụng, Liên hệ, Chính sách, FAQ.',
        project_id: 'proj-001', created_by: 'usr-002', assigned_to: 'usr-004',
        status: 'done', eisenhower_quadrant: 'Q2', estimated_effort_hours: 8.0,
        hofstadter_multiplier: 1.35, scheduled_duration_hours: 10.80,
        requested_deadline: '2026-03-10T17:00:00Z', scheduled_start: '2026-03-05T09:00:00Z', scheduled_end: '2026-03-10T17:00:00Z',
        actual_start: '2026-03-05T09:00:00Z', actual_end: '2026-03-10T16:30:00Z', priority: 15,
        cycle_id: 'cycle-001', milestone_id: 'ms-001', carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-03T00:00:00Z', updated_at: '2026-03-10T16:30:00Z',
        assignee: MOCK_USERS[3], tags: [MOCK_TAGS[0]],
    },
    // DONE — hoàn thành sớm 2 ngày
    {
        id: 'task-003', title: 'Thiết kế UI/UX trang chủ và trang Menu với hiệu ứng parallax',
        description: 'Design hi-fi cho trang chủ (hero, featured, testimonials) và trang Menu (filter, ảnh sản phẩm, giá).',
        project_id: 'proj-001', created_by: 'usr-002', assigned_to: 'usr-004',
        status: 'done', eisenhower_quadrant: 'Q2', estimated_effort_hours: 12.0,
        hofstadter_multiplier: 1.35, scheduled_duration_hours: 16.20,
        requested_deadline: '2026-03-17T17:00:00Z', scheduled_start: '2026-03-11T09:00:00Z', scheduled_end: '2026-03-17T17:00:00Z',
        actual_start: '2026-03-11T08:30:00Z', actual_end: '2026-03-15T15:00:00Z', priority: 14,
        cycle_id: 'cycle-001', milestone_id: 'ms-001', carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-05T00:00:00Z', updated_at: '2026-03-15T15:00:00Z',
        assignee: MOCK_USERS[3], tags: [MOCK_TAGS[0], MOCK_TAGS[1]],
    },
    // DONE — đã hoàn thành
    {
        id: 'task-004', title: 'Viết content SEO trang chủ và trang Giới thiệu Phúc Long Coffee',
        description: 'Viết bài quảng cáo cho trang chủ (hero text, section headings), trang Giới thiệu (lịch sử, giá trị, đội ngũ).',
        project_id: 'proj-001', created_by: 'usr-002', assigned_to: 'usr-002',
        status: 'done', eisenhower_quadrant: 'Q2', estimated_effort_hours: 5.0,
        hofstadter_multiplier: 1.25, scheduled_duration_hours: 6.25,
        requested_deadline: '2026-03-14T17:00:00Z', scheduled_start: '2026-03-10T09:00:00Z', scheduled_end: '2026-03-14T17:00:00Z',
        actual_start: '2026-03-10T10:00:00Z', actual_end: '2026-03-13T16:00:00Z', priority: 10,
        cycle_id: 'cycle-001', milestone_id: 'ms-002', carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-05T00:00:00Z', updated_at: '2026-03-13T16:00:00Z',
        assignee: MOCK_USERS[1], tags: [MOCK_TAGS[2], MOCK_TAGS[6]],
    },
    // DONE
    {
        id: 'task-005', title: 'Code HTML/CSS responsive trang chủ Phúc Long theo bản thiết kế',
        description: 'Chuyển bản thiết kế Figma sang HTML/CSS responsive (mobile-first). Animation parallax cho hero.',
        project_id: 'proj-001', created_by: 'usr-002', assigned_to: 'usr-005',
        status: 'done', eisenhower_quadrant: 'Q2', estimated_effort_hours: 10.0,
        hofstadter_multiplier: 1.25, scheduled_duration_hours: 12.50,
        requested_deadline: '2026-03-19T17:00:00Z', scheduled_start: '2026-03-15T09:00:00Z', scheduled_end: '2026-03-19T17:00:00Z',
        actual_start: '2026-03-15T09:00:00Z', actual_end: '2026-03-18T17:00:00Z', priority: 12,
        cycle_id: 'cycle-001', milestone_id: 'ms-002', carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-10T00:00:00Z', updated_at: '2026-03-18T17:00:00Z',
        assignee: MOCK_USERS[4], tags: [MOCK_TAGS[1]],
    },
    // DOING — đang làm, chồng chéo với task khác (overload usr-005)
    {
        id: 'task-006', title: 'Code HTML/CSS trang Menu với bộ lọc sản phẩm theo danh mục',
        description: 'Code trang Menu: grid sản phẩm, filter theo loại (cà phê, trà, bánh), animation hover, responsive.',
        project_id: 'proj-001', created_by: 'usr-002', assigned_to: 'usr-005',
        status: 'doing', eisenhower_quadrant: 'Q2', estimated_effort_hours: 8.0,
        hofstadter_multiplier: 1.25, scheduled_duration_hours: 10.0,
        requested_deadline: '2026-03-21T17:00:00Z', scheduled_start: '2026-03-18T09:00:00Z', scheduled_end: null,
        actual_start: '2026-03-18T14:00:00Z', actual_end: null, priority: 11,
        cycle_id: 'cycle-001', milestone_id: 'ms-002', carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-10T00:00:00Z', updated_at: '2026-03-19T08:00:00Z',
        assignee: MOCK_USERS[4], tags: [MOCK_TAGS[1], MOCK_TAGS[0]],
    },
    // DOING — đang làm, SẮP TRỄ DEADLINE (deadline ngày mai)
    {
        id: 'task-007', title: 'Thiết kế UI/UX các trang phụ: Tin tức, Blog, Cửa hàng, Liên hệ',
        description: 'Design hi-fi cho 4 trang phụ, reuse components từ trang chủ. Đảm bảo thống nhất style.',
        project_id: 'proj-001', created_by: 'usr-002', assigned_to: 'usr-004',
        status: 'doing', eisenhower_quadrant: 'Q1', estimated_effort_hours: 10.0,
        hofstadter_multiplier: 1.35, scheduled_duration_hours: 13.50,
        requested_deadline: '2026-03-20T17:00:00Z', scheduled_start: '2026-03-16T09:00:00Z', scheduled_end: null,
        actual_start: '2026-03-17T09:00:00Z', actual_end: null, priority: 13,
        cycle_id: 'cycle-001', milestone_id: 'ms-001', carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-10T00:00:00Z', updated_at: '2026-03-19T10:00:00Z',
        assignee: MOCK_USERS[3], tags: [MOCK_TAGS[0]],
    },
    // IN_REVIEW — chờ khách duyệt
    {
        id: 'task-008', title: 'Viết content SEO cho trang Menu và Tin tức Phúc Long Coffee',
        description: 'Viết mô tả sản phẩm (40+ món), bài tin tức mẫu (3 bài). Tối ưu SEO on-page.',
        project_id: 'proj-001', created_by: 'usr-002', assigned_to: 'usr-002',
        status: 'in_review', eisenhower_quadrant: 'Q2', estimated_effort_hours: 6.0,
        hofstadter_multiplier: 1.25, scheduled_duration_hours: 7.50,
        requested_deadline: '2026-03-19T17:00:00Z', scheduled_start: '2026-03-14T09:00:00Z', scheduled_end: null,
        actual_start: '2026-03-14T09:00:00Z', actual_end: null, priority: 9,
        cycle_id: 'cycle-001', milestone_id: 'ms-002', carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-08T00:00:00Z', updated_at: '2026-03-18T15:00:00Z',
        assignee: MOCK_USERS[1], tags: [MOCK_TAGS[2], MOCK_TAGS[4], MOCK_TAGS[6]],
    },
    // READY — chờ xếp lịch, phụ thuộc task design
    {
        id: 'task-009', title: 'Code frontend các trang phụ: Tin tức, Blog, Cửa hàng, Liên hệ',
        description: 'Code frontend 4 trang phụ sau khi nhận bản design. Tích hợp Google Maps cho trang Cửa hàng.',
        project_id: 'proj-001', created_by: 'usr-002', assigned_to: 'usr-005',
        status: 'ready', eisenhower_quadrant: 'Q2', estimated_effort_hours: 14.0,
        hofstadter_multiplier: 1.25, scheduled_duration_hours: 17.50,
        requested_deadline: '2026-03-26T17:00:00Z', scheduled_start: null, scheduled_end: null,
        actual_start: null, actual_end: null, priority: 8,
        cycle_id: 'cycle-001', milestone_id: 'ms-002', carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-10T00:00:00Z', updated_at: '2026-03-15T00:00:00Z',
        assignee: MOCK_USERS[4], tags: [MOCK_TAGS[1]],
    },
    // QUARANTINE — khách đổi yêu cầu đột xuất, cần trade-off
    {
        id: 'task-010', title: 'Khách yêu cầu thêm tính năng đặt hàng online vào website Phúc Long',
        description: 'KHẨN: Khách muốn thêm module đặt hàng online (giỏ hàng, thanh toán). Cần trade-off vì ngoài scope ban đầu, ảnh hưởng deadline.',
        project_id: 'proj-001', created_by: 'usr-006', assigned_to: null,
        status: 'quarantine', eisenhower_quadrant: 'Q1', estimated_effort_hours: 20.0,
        hofstadter_multiplier: 1.30, scheduled_duration_hours: 26.0,
        requested_deadline: '2026-03-28T17:00:00Z', scheduled_start: null, scheduled_end: null,
        actual_start: null, actual_end: null, priority: 20,
        cycle_id: 'cycle-001', milestone_id: null, carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-19T09:00:00Z', updated_at: '2026-03-19T09:00:00Z',
        tags: [MOCK_TAGS[3], MOCK_TAGS[1]],
    },
    // BACKLOG — chưa xếp lịch
    {
        id: 'task-011', title: 'Tối ưu SEO kỹ thuật: sitemap, schema markup, Core Web Vitals',
        description: 'Tạo sitemap XML, thêm structured data (LocalBusiness, Menu), tối ưu LCP/CLS/FID.',
        project_id: 'proj-001', created_by: 'usr-002', assigned_to: 'usr-005',
        status: 'backlog', eisenhower_quadrant: 'Q2', estimated_effort_hours: 6.0,
        hofstadter_multiplier: 1.25, scheduled_duration_hours: 7.50,
        requested_deadline: null, scheduled_start: null, scheduled_end: null,
        actual_start: null, actual_end: null, priority: 5,
        cycle_id: 'cycle-001', milestone_id: 'ms-003', carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-05T00:00:00Z', updated_at: '2026-03-05T00:00:00Z',
        assignee: MOCK_USERS[4], tags: [MOCK_TAGS[6]],
    },
    // BACKLOG — testing
    {
        id: 'task-012', title: 'QA test toàn bộ website trên các thiết bị và trình duyệt phổ biến',
        description: 'Test responsive trên iPhone, iPad, Android. Test trên Chrome, Safari, Firefox. Kiểm tra form, link, ảnh.',
        project_id: 'proj-001', created_by: 'usr-002', assigned_to: 'usr-003',
        status: 'backlog', eisenhower_quadrant: 'Q2', estimated_effort_hours: 5.0,
        hofstadter_multiplier: 1.30, scheduled_duration_hours: 6.50,
        requested_deadline: '2026-03-27T17:00:00Z', scheduled_start: null, scheduled_end: null,
        actual_start: null, actual_end: null, priority: 6,
        cycle_id: 'cycle-001', milestone_id: 'ms-003', carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-05T00:00:00Z', updated_at: '2026-03-05T00:00:00Z',
        assignee: MOCK_USERS[2], tags: [MOCK_TAGS[4]],
    },
    // ON_HOLD — bị chặn do chờ tài liệu
    {
        id: 'task-013', title: 'Nhập nội dung và hình ảnh cho trang Tuyển dụng Phúc Long Coffee',
        description: 'Chờ khách gửi thông tin tuyển dụng (JD, phúc lợi, ảnh văn phòng). Đã follow up 2 lần.',
        project_id: 'proj-001', created_by: 'usr-002', assigned_to: 'usr-002',
        status: 'on_hold', eisenhower_quadrant: 'Q3', estimated_effort_hours: 3.0,
        hofstadter_multiplier: 1.25, scheduled_duration_hours: 3.75,
        requested_deadline: '2026-03-25T17:00:00Z', scheduled_start: '2026-03-17T09:00:00Z', scheduled_end: null,
        actual_start: '2026-03-17T09:00:00Z', actual_end: null, priority: 4,
        cycle_id: 'cycle-001', milestone_id: 'ms-002', carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-10T00:00:00Z', updated_at: '2026-03-18T11:00:00Z',
        assignee: MOCK_USERS[1], tags: [MOCK_TAGS[2]],
    },
    // INTAKE — mới vào
    {
        id: 'task-014', title: 'Deploy website Phúc Long lên hosting và cấu hình domain chính thức',
        description: 'Deploy lên VPS, cấu hình SSL, trỏ domain phuclongcoffee.vn, setup CDN cho ảnh.',
        project_id: 'proj-001', created_by: 'usr-002', assigned_to: null,
        status: 'intake', eisenhower_quadrant: null, estimated_effort_hours: 4.0,
        hofstadter_multiplier: 1.25, scheduled_duration_hours: 5.0,
        requested_deadline: '2026-03-28T17:00:00Z', scheduled_start: null, scheduled_end: null,
        actual_start: null, actual_end: null, priority: 3,
        cycle_id: 'cycle-001', milestone_id: 'ms-003', carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-19T08:00:00Z', updated_at: '2026-03-19T08:00:00Z',
        tags: [],
    },

    // ===== PROJECT 2: Logo & Branding Minh Tâm Pharma =====

    // DONE — hoàn thành đúng hạn
    {
        id: 'task-015', title: 'Nghiên cứu thị trường dược phẩm và phân tích đối thủ cho Minh Tâm',
        description: 'Research 10 brand dược phẩm VN & quốc tế. Phân tích color, typography, logo style. Tạo moodboard.',
        project_id: 'proj-002', created_by: 'usr-002', assigned_to: 'usr-003',
        status: 'done', eisenhower_quadrant: 'Q2', estimated_effort_hours: 4.0,
        hofstadter_multiplier: 1.30, scheduled_duration_hours: 5.20,
        requested_deadline: '2026-03-07T17:00:00Z', scheduled_start: '2026-03-03T09:00:00Z', scheduled_end: '2026-03-07T17:00:00Z',
        actual_start: '2026-03-03T09:30:00Z', actual_end: '2026-03-07T15:00:00Z', priority: 16,
        cycle_id: 'cycle-001', milestone_id: 'ms-001', carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-07T15:00:00Z',
        assignee: MOCK_USERS[2], tags: [MOCK_TAGS[5]],
    },
    // DONE — nhưng bị carry over 1 lần (trễ lần đầu)
    {
        id: 'task-016', title: 'Thiết kế 5 phương án logo sơ bộ cho Minh Tâm Pharma',
        description: 'Tạo 5 concept logo: 1 wordmark, 2 combination mark, 1 abstract, 1 emblem. Variant đen trắng.',
        project_id: 'proj-002', created_by: 'usr-002', assigned_to: 'usr-004',
        status: 'done', eisenhower_quadrant: 'Q2', estimated_effort_hours: 12.0,
        hofstadter_multiplier: 1.35, scheduled_duration_hours: 16.20,
        requested_deadline: '2026-03-12T17:00:00Z', scheduled_start: '2026-03-07T09:00:00Z', scheduled_end: '2026-03-12T17:00:00Z',
        actual_start: '2026-03-07T09:00:00Z', actual_end: '2026-03-14T11:00:00Z', priority: 17,
        cycle_id: 'cycle-001', milestone_id: 'ms-001', carried_over_from: 'task-016-prev', carried_over_count: 1,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-14T11:00:00Z',
        assignee: MOCK_USERS[3], tags: [MOCK_TAGS[0], MOCK_TAGS[5]],
    },
    // DONE
    {
        id: 'task-017', title: 'Trình bày và thuyết trình các phương án logo cho ban giám đốc Minh Tâm',
        description: 'Chuẩn bị slide, trình bày 5 concept. Thu thập feedback. Khách chọn concept 3 (combination mark).',
        project_id: 'proj-002', created_by: 'usr-002', assigned_to: 'usr-002',
        status: 'done', eisenhower_quadrant: 'Q1', estimated_effort_hours: 3.0,
        hofstadter_multiplier: 1.25, scheduled_duration_hours: 3.75,
        requested_deadline: '2026-03-15T17:00:00Z', scheduled_start: '2026-03-14T14:00:00Z', scheduled_end: '2026-03-14T17:00:00Z',
        actual_start: '2026-03-14T14:00:00Z', actual_end: '2026-03-14T16:30:00Z', priority: 15,
        cycle_id: 'cycle-001', milestone_id: 'ms-001', carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-10T00:00:00Z', updated_at: '2026-03-14T16:30:00Z',
        assignee: MOCK_USERS[1], tags: [MOCK_TAGS[5], MOCK_TAGS[4]],
    },
    // DOING — đang refine logo, OVERLOAD (usr-004 đang làm 2 task doing)
    {
        id: 'task-018', title: 'Refine logo concept được chọn và tạo bộ variation hoàn chỉnh',
        description: 'Chỉnh sửa concept 3 theo feedback. Tạo variations: full color, mono, reversed, favicon, social avatar.',
        project_id: 'proj-002', created_by: 'usr-002', assigned_to: 'usr-004',
        status: 'doing', eisenhower_quadrant: 'Q1', estimated_effort_hours: 8.0,
        hofstadter_multiplier: 1.35, scheduled_duration_hours: 10.80,
        requested_deadline: '2026-03-19T17:00:00Z', scheduled_start: '2026-03-15T09:00:00Z', scheduled_end: null,
        actual_start: '2026-03-16T09:00:00Z', actual_end: null, priority: 16,
        cycle_id: 'cycle-001', milestone_id: 'ms-002', carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-14T00:00:00Z', updated_at: '2026-03-19T10:00:00Z',
        assignee: MOCK_USERS[3], tags: [MOCK_TAGS[0], MOCK_TAGS[5]],
    },
    // DOING — overload usr-003 (WIP vượt limit)
    {
        id: 'task-019', title: 'Thiết kế bảng màu và typography system cho brand guideline Minh Tâm',
        description: 'Chọn primary/secondary colors, typography scale (heading/body). Tạo color palette với accessibility check.',
        project_id: 'proj-002', created_by: 'usr-002', assigned_to: 'usr-003',
        status: 'doing', eisenhower_quadrant: 'Q2', estimated_effort_hours: 5.0,
        hofstadter_multiplier: 1.30, scheduled_duration_hours: 6.50,
        requested_deadline: '2026-03-21T17:00:00Z', scheduled_start: '2026-03-18T09:00:00Z', scheduled_end: null,
        actual_start: '2026-03-18T10:00:00Z', actual_end: null, priority: 10,
        cycle_id: 'cycle-001', milestone_id: 'ms-002', carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-14T00:00:00Z', updated_at: '2026-03-19T09:00:00Z',
        assignee: MOCK_USERS[2], tags: [MOCK_TAGS[0], MOCK_TAGS[5]],
    },
    // READY — chờ xong logo mới làm
    {
        id: 'task-020', title: 'Thiết kế bộ name card, letterhead, và phong bì cho Minh Tâm Pharma',
        description: 'Ứng dụng logo & brand guideline vào: name card (2 mặt), letterhead A4, phong bì DL, tiêu đề fax.',
        project_id: 'proj-002', created_by: 'usr-002', assigned_to: 'usr-004',
        status: 'ready', eisenhower_quadrant: 'Q2', estimated_effort_hours: 6.0,
        hofstadter_multiplier: 1.35, scheduled_duration_hours: 8.10,
        requested_deadline: '2026-03-25T17:00:00Z', scheduled_start: null, scheduled_end: null,
        actual_start: null, actual_end: null, priority: 7,
        cycle_id: 'cycle-001', milestone_id: 'ms-002', carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-10T00:00:00Z', updated_at: '2026-03-16T00:00:00Z',
        assignee: MOCK_USERS[3], tags: [MOCK_TAGS[0], MOCK_TAGS[5]],
    },
    // BACKLOG — deadline xa
    {
        id: 'task-021', title: 'Soạn brand guideline document hoàn chỉnh (50+ trang) cho Minh Tâm',
        description: 'Document hướng dẫn: logo usage, color, typography, photography, tone of voice, do/dont.',
        project_id: 'proj-002', created_by: 'usr-002', assigned_to: 'usr-003',
        status: 'backlog', eisenhower_quadrant: 'Q2', estimated_effort_hours: 15.0,
        hofstadter_multiplier: 1.30, scheduled_duration_hours: 19.50,
        requested_deadline: '2026-03-28T17:00:00Z', scheduled_start: null, scheduled_end: null,
        actual_start: null, actual_end: null, priority: 6,
        cycle_id: 'cycle-001', milestone_id: 'ms-003', carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-05T00:00:00Z', updated_at: '2026-03-05T00:00:00Z',
        assignee: MOCK_USERS[2], tags: [MOCK_TAGS[5], MOCK_TAGS[2]],
    },
    // REJECTED — khách từ chối yêu cầu ban đầu
    {
        id: 'task-022', title: 'Thiết kế mascot character cho thương hiệu Minh Tâm Pharma',
        description: 'Khách ban đầu muốn mascot (nhân vật hoạt hình). Sau họp nội bộ, khách quyết định không cần.',
        project_id: 'proj-002', created_by: 'usr-002', assigned_to: 'usr-004',
        status: 'rejected', eisenhower_quadrant: 'Q4', estimated_effort_hours: 8.0,
        hofstadter_multiplier: 1.35, scheduled_duration_hours: 10.80,
        requested_deadline: null, scheduled_start: null, scheduled_end: null,
        actual_start: null, actual_end: null, priority: 2,
        cycle_id: 'cycle-001', milestone_id: null, carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-05T00:00:00Z', updated_at: '2026-03-12T10:00:00Z',
        assignee: MOCK_USERS[3], tags: [MOCK_TAGS[0]],
    },
    // DOING — overload usr-003 đang làm task này + task-019 (vượt WIP limit 2)
    {
        id: 'task-023', title: 'Thiết kế mockup ứng dụng logo trên bao bì thuốc và hộp sản phẩm',
        description: 'Tạo mockup thực tế: hộp thuốc, lọ thuốc, túi giấy, bảng hiệu cửa hàng. Dùng cho presentation.',
        project_id: 'proj-002', created_by: 'usr-002', assigned_to: 'usr-003',
        status: 'doing', eisenhower_quadrant: 'Q3', estimated_effort_hours: 4.0,
        hofstadter_multiplier: 1.30, scheduled_duration_hours: 5.20,
        requested_deadline: '2026-03-20T17:00:00Z', scheduled_start: '2026-03-18T14:00:00Z', scheduled_end: null,
        actual_start: '2026-03-18T14:00:00Z', actual_end: null, priority: 7,
        cycle_id: 'cycle-001', milestone_id: 'ms-002', carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-15T00:00:00Z', updated_at: '2026-03-19T08:00:00Z',
        assignee: MOCK_USERS[2], tags: [MOCK_TAGS[0], MOCK_TAGS[5]],
    },
    // IN_REVIEW — fix bug urgent từ project Phúc Long
    {
        id: 'task-024', title: 'Fix lỗi menu dropdown không hoạt động trên Safari mobile khi cuộn trang',
        description: 'Bug: Menu hamburger không đóng/mở đúng trên Safari iOS 17. Nguyên nhân: CSS position sticky conflict.',
        project_id: 'proj-001', created_by: 'usr-005', assigned_to: 'usr-005',
        status: 'in_review', eisenhower_quadrant: 'Q1', estimated_effort_hours: 2.0,
        hofstadter_multiplier: 1.25, scheduled_duration_hours: 2.50,
        requested_deadline: '2026-03-19T17:00:00Z', scheduled_start: '2026-03-19T08:00:00Z', scheduled_end: null,
        actual_start: '2026-03-19T08:30:00Z', actual_end: null, priority: 19,
        cycle_id: 'cycle-001', milestone_id: 'ms-003', carried_over_from: null, carried_over_count: 0,
        is_recurring_instance: false, recurring_rule_id: null,
        created_at: '2026-03-19T07:00:00Z', updated_at: '2026-03-19T11:00:00Z',
        assignee: MOCK_USERS[4], tags: [MOCK_TAGS[7], MOCK_TAGS[3]],
    },
]

// ============================================
// Mock Notifications
// ============================================

export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: 'notif-001', user_id: 'usr-002', type: 'critical', title: 'Yêu cầu ngoài scope từ Phúc Long', content: '"Thêm tính năng đặt hàng online" cần trade-off ngay — ảnh hưởng deadline dự án', related_task_id: 'task-010', channel: 'in_app', is_read: false, created_at: '2026-03-19T09:00:00Z' },
    { id: 'notif-002', user_id: 'usr-004', type: 'important', title: 'WIP limit vượt ngưỡng!', content: 'Bạn đang có 2 task "Doing" (refine logo + design trang phụ). WIP limit = 2, không thể nhận thêm.', related_task_id: 'task-018', channel: 'in_app', is_read: false, created_at: '2026-03-19T10:00:00Z' },
    { id: 'notif-003', user_id: 'usr-005', type: 'important', title: 'Bug cần review gấp', content: '"Fix menu Safari" đã xong, đang chờ review từ PM', related_task_id: 'task-024', channel: 'in_app', is_read: false, created_at: '2026-03-19T11:00:00Z' },
    { id: 'notif-004', user_id: 'usr-002', type: 'important', title: 'Task sắp trễ deadline', content: '"Thiết kế UI trang phụ" deadline ngày mai 20/03 nhưng mới hoàn thành ~60%', related_task_id: 'task-007', channel: 'in_app', is_read: false, created_at: '2026-03-19T08:00:00Z' },
    { id: 'notif-005', user_id: 'usr-003', type: 'important', title: 'WIP overload cảnh báo', content: 'Bạn đang có 2 task Doing (typography + mockup bao bì). Cân nhắc hoàn thành trước khi nhận thêm.', related_task_id: 'task-019', channel: 'in_app', is_read: false, created_at: '2026-03-19T09:30:00Z' },
    { id: 'notif-006', user_id: 'usr-002', type: 'info', title: 'Task đã hoàn thành sớm', content: '"Code trang chủ Phúc Long" hoàn thành trước hạn 1 ngày 🎉', related_task_id: 'task-005', channel: 'in_app', is_read: true, created_at: '2026-03-18T17:00:00Z' },
    { id: 'notif-007', user_id: 'usr-002', type: 'info', title: 'Content cần duyệt', content: '"Content SEO Menu & Tin tức" đang chờ review', related_task_id: 'task-008', channel: 'in_app', is_read: true, created_at: '2026-03-18T15:00:00Z' },
    { id: 'notif-008', user_id: 'usr-002', type: 'info', title: 'Task on-hold chờ tài liệu', content: '"Nhập nội dung Tuyển dụng" đang chờ khách gửi JD — đã follow up 2 lần', related_task_id: 'task-013', channel: 'in_app', is_read: true, created_at: '2026-03-18T11:00:00Z' },
]

// ============================================
// Mock Quick Strikes
// ============================================

export const MOCK_QUICK_STRIKES: QuickStrikeLog[] = [
    { id: 'qs-001', user_id: 'usr-002', description: 'Reply email Phúc Long xác nhận lịch họp thứ 6', completed_at: '2026-03-19T08:15:00Z' },
    { id: 'qs-002', user_id: 'usr-004', description: 'Export file PNG logo Minh Tâm cho in test', completed_at: '2026-03-19T09:10:00Z' },
    { id: 'qs-003', user_id: 'usr-005', description: 'Gửi link staging Phúc Long cho khách xem thử', completed_at: '2026-03-18T16:30:00Z' },
    { id: 'qs-004', user_id: 'usr-003', description: 'Cập nhật Pantone code cho bảng màu Minh Tâm', completed_at: '2026-03-19T10:00:00Z' },
    { id: 'qs-005', user_id: 'usr-002', description: 'Follow up khách Phúc Long gửi JD tuyển dụng', completed_at: '2026-03-18T10:30:00Z' },
]

// ============================================
// Mock Comments
// ============================================

export const MOCK_COMMENTS: Comment[] = [
    {
        id: 'cmt-001', task_id: 'task-007', user_id: 'usr-002', content: 'Hoa ơi, task này deadline ngày mai rồi, tiến độ đang đến đâu? Cần hỗ trợ gì không?',
        comment_type: 'blocker', is_pinned: true, parent_comment_id: null,
        created_at: '2026-03-19T08:30:00Z', updated_at: '2026-03-19T08:30:00Z',
        user: MOCK_USERS[1],
    },
    {
        id: 'cmt-002', task_id: 'task-007', user_id: 'usr-004', content: 'Em đã xong 3/4 trang (Tin tức, Blog, Liên hệ). Trang Cửa hàng cần thêm 1 ngày do có map integration.',
        comment_type: 'general', is_pinned: false, parent_comment_id: 'cmt-001',
        created_at: '2026-03-19T09:00:00Z', updated_at: '2026-03-19T09:00:00Z',
        user: MOCK_USERS[3],
    },
    {
        id: 'cmt-003', task_id: 'task-010', user_id: 'usr-002', content: 'Yêu cầu này ngoài scope hợp đồng ban đầu. Cần họp nhanh với khách để thống nhất chi phí và timeline bổ sung.',
        comment_type: 'decision', is_pinned: true, parent_comment_id: null,
        created_at: '2026-03-19T09:15:00Z', updated_at: '2026-03-19T09:15:00Z',
        user: MOCK_USERS[1],
    },
    {
        id: 'cmt-004', task_id: 'task-018', user_id: 'usr-004', content: 'Khách muốn đổi shade xanh lá sang đậm hơn, em đang chỉnh lại toàn bộ variant.',
        comment_type: 'general', is_pinned: false, parent_comment_id: null,
        created_at: '2026-03-19T10:30:00Z', updated_at: '2026-03-19T10:30:00Z',
        user: MOCK_USERS[3],
    },
    {
        id: 'cmt-005', task_id: 'task-024', user_id: 'usr-005', content: 'Đã fix bằng cách thay position:sticky → position:fixed cho header trên mobile. Test OK trên Safari iOS 17.',
        comment_type: 'handoff', is_pinned: false, parent_comment_id: null,
        created_at: '2026-03-19T11:00:00Z', updated_at: '2026-03-19T11:00:00Z',
        user: MOCK_USERS[4],
    },
]

// ============================================
// Mock Task Logs
// ============================================

export const MOCK_TASK_LOGS: TaskLog[] = [
    { id: 'log-001', task_id: 'task-006', user_id: 'usr-005', action: 'status_change', from_value: 'ready', to_value: 'doing', note: 'Bắt đầu code trang Menu', metadata: {}, created_at: '2026-03-18T14:00:00Z', user: MOCK_USERS[4] },
    { id: 'log-002', task_id: 'task-007', user_id: 'usr-004', action: 'status_change', from_value: 'ready', to_value: 'doing', note: null, metadata: {}, created_at: '2026-03-17T09:00:00Z', user: MOCK_USERS[3] },
    { id: 'log-003', task_id: 'task-005', user_id: 'usr-005', action: 'status_change', from_value: 'doing', to_value: 'done', note: 'Hoàn thành trước deadline 1 ngày', metadata: {}, created_at: '2026-03-18T17:00:00Z', user: MOCK_USERS[4] },
    { id: 'log-004', task_id: 'task-010', user_id: 'usr-002', action: 'status_change', from_value: 'intake', to_value: 'quarantine', note: 'Cần trade-off — yêu cầu ngoài scope', metadata: {}, created_at: '2026-03-19T09:00:00Z', user: MOCK_USERS[1] },
    { id: 'log-005', task_id: 'task-013', user_id: 'usr-002', action: 'status_change', from_value: 'doing', to_value: 'on_hold', note: 'Chờ khách gửi nội dung tuyển dụng', metadata: {}, created_at: '2026-03-18T11:00:00Z', user: MOCK_USERS[1] },
    { id: 'log-006', task_id: 'task-024', user_id: 'usr-005', action: 'status_change', from_value: 'doing', to_value: 'in_review', note: 'Đã fix, chờ PM review', metadata: {}, created_at: '2026-03-19T11:00:00Z', user: MOCK_USERS[4] },
    { id: 'log-007', task_id: 'task-022', user_id: 'usr-002', action: 'status_change', from_value: 'backlog', to_value: 'rejected', note: 'Khách họp nội bộ quyết định không cần mascot', metadata: {}, created_at: '2026-03-12T10:00:00Z', user: MOCK_USERS[1] },
    { id: 'log-008', task_id: 'task-016', user_id: 'usr-004', action: 'carry_over', from_value: null, to_value: null, note: 'Carry over từ tuần trước do chưa hoàn thành hết 5 concept', metadata: { carried_over_count: 1 }, created_at: '2026-03-12T17:00:00Z', user: MOCK_USERS[3] },
]

// ============================================
// Helper: Get current user (mock)
// ============================================

export function getMockCurrentUser(): User {
    return MOCK_USERS[1] // PM Trần Thùy Linh
}

export function getMockTasksByStatus(status: string): Task[] {
    return MOCK_TASKS.filter(t => t.status === status)
}

export function getMockTaskById(id: string): Task | undefined {
    return MOCK_TASKS.find(t => t.id === id)
}
