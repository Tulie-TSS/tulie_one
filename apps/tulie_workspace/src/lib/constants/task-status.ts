import type { TaskStatus } from '@/types/database.types'

export const TASK_STATUS = {
    INTAKE: 'intake',
    BACKLOG: 'backlog',
    QUARANTINE: 'quarantine',
    READY: 'ready',
    DOING: 'doing',
    ON_HOLD: 'on_hold',
    IN_REVIEW: 'in_review',
    DONE: 'done',
    REJECTED: 'rejected',
} as const

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
    intake: 'Intake',
    backlog: 'Backlog',
    quarantine: 'Quarantine',
    ready: 'Ready',
    doing: 'Doing',
    on_hold: 'On-Hold',
    in_review: 'In Review',
    done: 'Done',
    rejected: 'Rejected',
}

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
    intake: 'var(--color-fg-tertiary)',
    backlog: 'var(--color-fg-secondary)',
    quarantine: 'var(--color-warning)',
    ready: 'var(--color-info)',
    doing: 'var(--color-info)',
    on_hold: 'var(--color-warning)',
    in_review: 'var(--color-info)',
    done: 'var(--color-success)',
    rejected: 'var(--color-danger)',
}

export const TASK_STATUS_ICONS: Record<TaskStatus, string> = {
    intake: 'inbox',
    backlog: 'layers',
    quarantine: 'shield-alert',
    ready: 'circle-dot',
    doing: 'play-circle',
    on_hold: 'pause-circle',
    in_review: 'eye',
    done: 'check-circle',
    rejected: 'x-circle',
}

// Valid transitions based on 06_TASK_WORKFLOW.md
export const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
    intake: ['backlog', 'quarantine', 'rejected'],
    backlog: ['quarantine', 'ready'],
    quarantine: ['backlog', 'ready', 'rejected'],
    ready: ['backlog', 'doing'],
    doing: ['on_hold', 'in_review', 'done'],
    on_hold: ['backlog', 'doing'],
    in_review: ['doing', 'on_hold', 'done'],
    done: [],
    rejected: [],
}

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

export const BOARD_COLUMNS: TaskStatus[] = [
    'backlog', 'ready', 'doing', 'in_review', 'done',
]

export const ALL_STATUSES: TaskStatus[] = [
    'intake', 'backlog', 'quarantine', 'ready', 'doing', 'on_hold', 'in_review', 'done', 'rejected',
]
