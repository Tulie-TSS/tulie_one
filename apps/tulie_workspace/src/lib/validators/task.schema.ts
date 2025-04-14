import { z } from 'zod'

export const createTaskSchema = z.object({
    title: z.string()
        .min(10, 'Tiêu đề phải có ít nhất 10 ký tự')
        .max(500, 'Tiêu đề tối đa 500 ký tự'),
    description: z.string().max(50000).optional(),
    project_id: z.string().uuid('Project ID không hợp lệ'),
    estimated_effort_hours: z.number()
        .positive('Thời gian ước tính phải > 0')
        .max(999),
    is_urgent: z.boolean(),
    is_important: z.boolean(),
    requested_deadline: z.string().datetime().optional().nullable(),
    assigned_to: z.string().uuid().optional().nullable(),
    tags: z.array(z.string()).max(10).optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>

export const updateTaskStatusSchema = z.object({
    status: z.enum([
        'intake', 'backlog', 'quarantine', 'ready',
        'doing', 'on_hold', 'in_review', 'done', 'rejected',
    ]),
    note: z.string().max(2000).optional(),
})

export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>

export const tradeOffSchema = z.object({
    decision: z.enum(['swap', 'add_resource', 'reduce_scope', 'extend_deadline', 'reject']),
    affected_task_id: z.string().uuid().optional().nullable(),
    reason: z.string()
        .min(20, 'Lý do phải có ít nhất 20 ký tự')
        .max(2000),
})

export type TradeOffInput = z.infer<typeof tradeOffSchema>

export const quickStrikeSchema = z.object({
    description: z.string()
        .min(1, 'Vui lòng nhập mô tả')
        .max(200, 'Mô tả tối đa 200 ký tự'),
})

export type QuickStrikeInput = z.infer<typeof quickStrikeSchema>
