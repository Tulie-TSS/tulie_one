import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS, VALID_TRANSITIONS } from '@/lib/constants/task-status'
import { notFound } from 'next/navigation'
import type { TaskStatus } from '@/types/database.types'
import { CommentForm } from '@/components/tasks/comment-form'

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch Task
    const { data: task } = await supabase
        .from('tasks')
        .select(`
            *,
            assignee:user_profiles!tasks_assigned_to_fkey(id, full_name, email),
            project:projects(id, name),
            tags:task_tags(tag:tags(id, name, color))
        `)
        .eq('id', id)
        .single()

    if (!task) return notFound()

    // Fetch Comments
    const { data: commentsData } = await supabase
        .from('comments')
        .select(`
            *,
            user:user_profiles(id, full_name)
        `)
        .eq('task_id', id)
        .order('created_at', { ascending: true })

    const comments = commentsData || []

    // Fetch Logs
    const { data: logsData } = await supabase
        .from('task_logs')
        .select(`
            *,
            user:user_profiles(id, full_name)
        `)
        .eq('task_id', id)
        .order('created_at', { ascending: false })

    const logs = logsData || []

    const tags = task.tags?.map((tt: any) => tt.tag).filter(Boolean) || []
    const nextTransitions = VALID_TRANSITIONS[task.status as TaskStatus] || []

    return (
        <div>
            <div className="mb-6">
                <Link href="/tasks" className="inline-flex items-center gap-1 no-underline mb-4" style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>
                    ← Quay lại Tasks
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title & Description */}
                    <div className="p-6" style={{ backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2.5 py-1 rounded-full font-semibold" style={{
                                backgroundColor: `color-mix(in srgb, ${TASK_STATUS_COLORS[task.status as TaskStatus]} 15%, transparent)`,
                                color: TASK_STATUS_COLORS[task.status as TaskStatus], fontSize: 'var(--text-xs)',
                            }}>{TASK_STATUS_LABELS[task.status as TaskStatus]}</span>
                            {task.eisenhower_quadrant && (
                                <span className="px-2 py-0.5 rounded font-semibold" style={{ fontSize: 'var(--text-xs)', backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
                                    {task.eisenhower_quadrant}
                                </span>
                            )}
                        </div>
                        <h1 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-fg)' }}>{task.title}</h1>
                        {task.description && (
                            <p style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', whiteSpace: 'pre-wrap' }}>{task.description}</p>
                        )}

                        {/* Status Transitions */}
                        {nextTransitions.length > 0 && (
                            <div className="mt-5 pt-5 flex flex-wrap gap-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                                <span style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-xs)', alignSelf: 'center' }}>Chuyển sang:</span>
                                {nextTransitions.map(status => (
                                    <button key={status} className="px-3 py-1.5 font-medium cursor-pointer transition-colors hover:opacity-80" style={{
                                        backgroundColor: 'var(--color-surface)', color: TASK_STATUS_COLORS[status],
                                        borderRadius: 'var(--radius-md)', border: `1px solid var(--color-border)`,
                                        fontSize: 'var(--text-xs)',
                                    }}>
                                        {TASK_STATUS_LABELS[status]}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Comments */}
                    <div className="p-6" style={{ backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                        <h2 className="font-semibold mb-4" style={{ color: 'var(--color-fg)' }}>Bình luận</h2>
                        {comments.length > 0 ? (
                            <div className="space-y-4">
                                {comments.map((c: any) => (
                                    <div key={c.id} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-info)', color: 'white', fontSize: '11px', fontWeight: 600 }}>
                                            {c.user?.full_name?.charAt(0) || '?'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-fg)' }}>{c.user?.full_name || 'Người dùng ẩn danh'}</span>
                                                <span style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-xs)' }}>{new Date(c.created_at).toLocaleString('vi-VN')}</span>
                                            </div>
                                            <p style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)', whiteSpace: 'pre-wrap' }}>{c.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-sm)' }}>Chưa có bình luận</p>
                        )}
                        <CommentForm taskId={task.id} />
                    </div>

                    {/* Activity Log */}
                    <div className="p-6" style={{ backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                        <h2 className="font-semibold mb-4" style={{ color: 'var(--color-fg)' }}>Lịch sử hoạt động</h2>
                        {logs.length > 0 ? (
                            <div className="space-y-3">
                                {logs.map((log: any) => (
                                    <div key={log.id} className="flex items-start gap-3" style={{ fontSize: 'var(--text-sm)' }}>
                                        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: 'var(--color-info)' }} />
                                        <div className="flex-1">
                                            <span style={{ color: 'var(--color-fg-secondary)' }}>
                                                <strong style={{ color: 'var(--color-fg)' }}>{log.user?.full_name || 'Hệ thống'}</strong>
                                                {' '}chuyển trạng thái {log.from_value ? `từ ${log.from_value} ` : ''}→ <strong>{log.to_value}</strong>
                                            </span>
                                            {log.note && (
                                                <p className="mt-1 italic" style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-xs)' }}>"{log.note}"</p>
                                            )}
                                        </div>
                                        <span style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-xs)', flexShrink: 0 }}>
                                            {new Date(log.created_at).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-sm)' }}>Chưa có hoạt động nào</p>
                        )}
                    </div>
                </div>

                {/* Sidebar Details */}
                <div className="space-y-4">
                    <div className="p-5" style={{ backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                        <h3 className="font-semibold mb-4" style={{ color: 'var(--color-fg)', fontSize: 'var(--text-sm)' }}>Chi tiết</h3>
                        <dl className="space-y-3" style={{ fontSize: 'var(--text-sm)' }}>
                            <div className="flex justify-between items-center gap-4">
                                <dt style={{ color: 'var(--color-fg-secondary)' }}>Người thực hiện</dt>
                                <dd className="font-medium truncate" style={{ color: 'var(--color-fg)' }}>{task.assignee?.full_name || 'Chưa giao'}</dd>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <dt style={{ color: 'var(--color-fg-secondary)' }}>Ước tính</dt>
                                <dd className="font-medium" style={{ color: 'var(--color-fg)' }}>{task.estimated_effort_hours}h</dd>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <dt style={{ color: 'var(--color-fg-secondary)' }}>Hofstadter</dt>
                                <dd className="font-medium" style={{ color: 'var(--color-fg)' }}>×{task.hofstadter_multiplier}</dd>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <dt style={{ color: 'var(--color-fg-secondary)' }}>Thời lượng thực</dt>
                                <dd className="font-medium" style={{ color: 'var(--color-fg)' }}>{task.scheduled_duration_hours}h</dd>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <dt style={{ color: 'var(--color-fg-secondary)' }}>Dự án</dt>
                                <dd className="truncate text-right">
                                    <Link href={`/projects/${task.project_id}`} className="font-medium no-underline" style={{ color: 'var(--color-info)' }}>
                                        {task.project?.name || task.project_id}
                                    </Link>
                                </dd>
                            </div>
                            {task.requested_deadline && (
                                <div className="flex justify-between items-center gap-4">
                                    <dt style={{ color: 'var(--color-fg-secondary)' }}>Deadline</dt>
                                    <dd className="font-medium" style={{ color: 'var(--color-fg)' }}>{new Date(task.requested_deadline).toLocaleDateString('vi-VN')}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {tags.length > 0 && (
                        <div className="p-5" style={{ backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                            <h3 className="font-semibold mb-3" style={{ color: 'var(--color-fg)', fontSize: 'var(--text-sm)' }}>Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag: any) => (
                                    <span key={tag.id} className="px-2.5 py-1 rounded-full" style={{ backgroundColor: tag.color + '20', color: tag.color, fontSize: 'var(--text-xs)', fontWeight: 500 }}>
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
