// ============================================
// Tulie Workspace — TypeScript Type Definitions
// Generated from: docs/02_DATABASE_SCHEMA.md
// ============================================

// Enum Types
export type UserRole = 'admin' | 'manager' | 'maker' | 'observer'
export type CycleStatus = 'planning' | 'active' | 'review' | 'closed'
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived'
export type ProjectPriority = 'critical' | 'high' | 'medium' | 'low'
export type TaskStatus = 'intake' | 'backlog' | 'quarantine' | 'ready' | 'doing' | 'on_hold' | 'in_review' | 'done' | 'rejected'
export type EisenhowerQuadrant = 'Q1' | 'Q2' | 'Q3' | 'Q4'
export type DependencyType = 'blocks' | 'relates_to'
export type TradeOffDecision = 'swap' | 'add_resource' | 'reduce_scope' | 'extend_deadline' | 'reject'
export type CommentType = 'general' | 'decision' | 'blocker' | 'handoff'
export type NotificationSeverity = 'critical' | 'important' | 'info' | 'silent'
export type NotificationChannel = 'push' | 'in_app' | 'email' | 'badge'
export type RecurrenceType = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom'
export type ThemePreference = 'light' | 'dark' | 'auto'
export type WipScope = 'user' | 'team' | 'department' | 'organization'

// Entity Types
export interface Organization {
    id: string
    name: string
    slug: string
    logo_url: string | null
    settings: Record<string, unknown>
    created_at: string
    updated_at: string
}

export interface Department {
    id: string
    organization_id: string
    name: string
    head_user_id: string | null
    created_at: string
    updated_at: string
}

export interface Team {
    id: string
    department_id: string
    name: string
    lead_user_id: string | null
    created_at: string
    updated_at: string
}

export interface User {
    id: string
    email: string
    full_name: string
    avatar_url: string | null
    role_type: UserRole
    organization_id: string | null
    department_id: string | null
    team_id: string | null
    maker_block_min_hours: number
    personal_wip_limit: number
    hofstadter_multiplier: number
    is_active: boolean
    last_seen_at: string | null
    created_at: string
    updated_at: string
}

export interface Cycle {
    id: string
    name: string
    organization_id: string
    parent_cycle_id: string | null
    start_date: string
    end_date: string
    buffer_week_start: string
    status: CycleStatus
    goals: CycleGoal[]
    created_by: string
    created_at: string
    updated_at: string
}

export interface CycleGoal {
    title: string
    progress: number
}

export interface Milestone {
    id: string
    cycle_id: string
    name: string
    description: string | null
    target_date: string
    completion_rate: number
    sort_order: number
    created_at: string
    updated_at: string
}

export interface Project {
    id: string
    name: string
    description: string | null
    cycle_id: string
    owner_id: string
    organization_id: string
    status: ProjectStatus
    priority: ProjectPriority
    created_at: string
    updated_at: string
    // Joined fields
    owner?: User
    cycle?: Cycle
    task_count?: number
    done_count?: number
}

export interface Task {
    id: string
    title: string
    description: string | null
    project_id: string
    created_by: string
    assigned_to: string | null
    status: TaskStatus
    eisenhower_quadrant: EisenhowerQuadrant | null
    estimated_effort_hours: number
    hofstadter_multiplier: number
    scheduled_duration_hours: number
    requested_deadline: string | null
    scheduled_start: string | null
    scheduled_end: string | null
    actual_start: string | null
    actual_end: string | null
    priority: number
    cycle_id: string | null
    milestone_id: string | null
    carried_over_from: string | null
    carried_over_count: number
    is_recurring_instance: boolean
    recurring_rule_id: string | null
    created_at: string
    updated_at: string
    // Joined fields
    assignee?: User
    creator?: User
    project?: Project
    tags?: Tag[]
    dependencies?: TaskDependency[]
}

export interface TaskDependency {
    id: string
    task_id: string
    depends_on_task_id: string
    dependency_type: DependencyType
    created_at: string
    // Joined
    depends_on_task?: Task
}

export interface WipRule {
    id: string
    scope_type: WipScope
    scope_id: string
    max_doing: number
    max_projects: number | null
    can_override: boolean
    created_at: string
    updated_at: string
}

export interface TradeOffLog {
    id: string
    task_id: string
    decided_by: string
    decision: TradeOffDecision
    affected_task_id: string | null
    reason: string
    decided_at: string
    // Joined
    task?: Task
    decider?: User
    affected_task?: Task
}

export interface QuickStrikeLog {
    id: string
    user_id: string
    description: string
    completed_at: string
}

export interface TaskLog {
    id: string
    task_id: string
    user_id: string
    action: string
    from_value: string | null
    to_value: string | null
    note: string | null
    metadata: Record<string, unknown>
    created_at: string
    // Joined
    user?: User
}

export interface Comment {
    id: string
    task_id: string
    user_id: string
    content: string
    comment_type: CommentType
    is_pinned: boolean
    parent_comment_id: string | null
    created_at: string
    updated_at: string
    // Joined
    user?: User
    replies?: Comment[]
}

export interface Attachment {
    id: string
    task_id: string
    uploaded_by: string
    file_name: string
    file_path: string
    file_size_bytes: number
    mime_type: string
    version: number
    created_at: string
}

export interface Tag {
    id: string
    name: string
    color: string
    organization_id: string
}

export interface TaskTemplate {
    id: string
    name: string
    category: string | null
    title_prefix: string | null
    description_template: string | null
    default_effort_hours: number | null
    default_labels: string[]
    checklist_template: string[]
    organization_id: string
    created_by: string
    created_at: string
    updated_at: string
}

export interface RecurringRule {
    id: string
    template_id: string | null
    title_pattern: string
    recurrence_type: RecurrenceType
    cron_expression: string | null
    assigned_to: string | null
    project_id: string | null
    is_active: boolean
    last_generated_at: string | null
    created_by: string
    created_at: string
    updated_at: string
}

export interface Notification {
    id: string
    user_id: string
    type: NotificationSeverity
    title: string
    content: string | null
    related_task_id: string | null
    channel: NotificationChannel
    is_read: boolean
    created_at: string
}

export interface FocusSession {
    id: string
    user_id: string
    task_id: string
    started_at: string
    ended_at: string | null
    duration_minutes: number | null
    exit_note: string | null
    pomodoro_count: number
    created_at: string
}

export interface CycleReview {
    id: string
    cycle_id: string
    reviewed_by: string
    completion_rate: number
    carry_over_count: number
    lessons_learned: string | null
    improvement_actions: Record<string, unknown>[]
    reviewed_at: string
}

export interface UserPreferences {
    user_id: string
    theme: ThemePreference
    language: string
    notification_channels: Record<string, string[]>
    default_view: string
    timezone: string
    focus_mode_auto_dnd: boolean
    updated_at: string
}

export interface SavedView {
    id: string
    user_id: string
    name: string
    filters: Record<string, unknown>
    is_default: boolean
    is_shared: boolean
    team_id: string | null
    created_at: string
    updated_at: string
}

// WIP Check Result
export interface WipCheckResult {
    current_doing: number
    wip_limit: number
    is_within_limit: boolean
    slots_available: number
    doing_tasks: Task[]
    ready_queue: Task[]
}

// API Response types
export interface ApiResponse<T> {
    data: T
    meta?: Record<string, unknown>
}

export interface ApiErrorResponse {
    error: {
        code: string
        message: string
        message_vi?: string
        details?: Record<string, unknown>
        request_id?: string
        timestamp?: string
    }
}

export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        cursor: string | null
        has_more: boolean
        total_count: number
    }
}
