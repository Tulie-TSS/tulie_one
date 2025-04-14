import type { Task } from '@/types/database.types'

export class AppError extends Error {
    constructor(
        public code: string,
        message: string,
        public statusCode: number = 400,
        public details?: Record<string, unknown>
    ) {
        super(message)
        this.name = 'AppError'
    }

    toJSON() {
        return {
            error: {
                code: this.code,
                message: this.message,
                details: this.details,
                timestamp: new Date().toISOString(),
            },
        }
    }
}

export class WipLimitError extends AppError {
    constructor(currentDoing: number, limit: number, doingTasks: Pick<Task, 'id' | 'title'>[]) {
        super(
            'WIP_LIMIT_EXCEEDED',
            `WIP limit reached (${currentDoing}/${limit})`,
            409,
            {
                current_doing: currentDoing,
                wip_limit: limit,
                doing_tasks: doingTasks,
                suggested_actions: ['complete', 'pause', 'request_override'],
            }
        )
    }
}

export class ForbiddenError extends AppError {
    constructor(code = 'AUTH_INSUFFICIENT_PERMISSIONS') {
        super(code, 'You do not have permission to perform this action', 403)
    }
}

export class InvalidTransitionError extends AppError {
    constructor(from: string, to: string, allowedTransitions?: string[]) {
        super(
            'TASK_INVALID_TRANSITION',
            `Cannot transition from ${from} to ${to}`,
            422,
            { from, to, allowed_transitions: allowedTransitions }
        )
    }
}

export class DependencyUnmetError extends AppError {
    constructor(taskId: string, blockingTasks: Pick<Task, 'id' | 'title' | 'status'>[]) {
        super(
            'TASK_DEPENDENCY_UNMET',
            'Blocked by unfinished dependency tasks',
            409,
            { task_id: taskId, blocking_tasks: blockingTasks }
        )
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string, id: string) {
        super(
            `${resource.toUpperCase()}_NOT_FOUND`,
            `${resource} not found`,
            404,
            { [`${resource.toLowerCase()}_id`]: id }
        )
    }
}
