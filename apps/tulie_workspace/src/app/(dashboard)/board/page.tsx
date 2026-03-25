'use client'

import Link from 'next/link'
import { MOCK_TASKS } from '@/lib/mock/data'
import { BOARD_COLUMNS, TASK_STATUS_COLORS } from '@/lib/constants/task-status'
import { useLocaleStore } from '@/lib/stores/locale-store'

export default function BoardPage() {
    const { t } = useLocaleStore()

    return (
        <div className="-m-3 md:-m-5 flex flex-col" style={{ height: 'calc(100vh - var(--header-height))' }}>
            {/* Top Bar */}
            <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
                style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
                <div>
                    <h1 className="text-lg font-semibold" style={{ color: 'var(--color-fg)' }}>{t('board.title')}</h1>
                    <p style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-xs)' }}>{t('board.subtitle')}</p>
                </div>
                <Link href="/tasks" className="inline-flex items-center gap-2 px-4 py-2 no-underline font-medium" style={{ backgroundColor: 'var(--color-info)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
                    {t('board.createTask')}
                </Link>
            </div>

            {/* Board Columns — fill remaining height */}
            <div className="flex-1 flex gap-3 overflow-x-auto overflow-y-hidden p-4">
                {BOARD_COLUMNS.map(status => {
                    const tasks = MOCK_TASKS.filter(t => t.status === status)
                    const statusKey = `status.${status}` as const
                    return (
                        <div key={status} className="flex-shrink-0 flex flex-col" style={{ width: '260px' }}>
                            {/* Column Header */}
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: TASK_STATUS_COLORS[status] }} />
                                <span className="font-semibold" style={{ color: 'var(--color-fg)', fontSize: 'var(--text-sm)' }}>
                                    {t(statusKey)}
                                </span>
                                <span className="px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-fg-secondary)', fontSize: 'var(--text-xs)' }}>
                                    {tasks.length}
                                </span>
                            </div>

                            {/* Column Body — scrollable */}
                            <div className="flex-1 overflow-y-auto space-y-2 p-2 rounded-xl" style={{ backgroundColor: 'var(--color-surface)' }}>
                                {tasks.map(task => (
                                    <Link
                                        key={task.id}
                                        href={`/tasks/${task.id}`}
                                        className="block p-3 no-underline transition-all hover:-translate-y-0.5"
                                        style={{
                                            backgroundColor: 'var(--color-bg)',
                                            borderRadius: 'var(--radius-md)',
                                            boxShadow: 'var(--shadow-sm)',
                                            border: '1px solid var(--color-border)',
                                        }}
                                    >
                                        {task.tags && task.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {task.tags.map(tag => (
                                                    <span key={tag.id} className="px-1.5 py-0.5 rounded" style={{ backgroundColor: tag.color + '20', color: tag.color, fontSize: '10px', fontWeight: 500 }}>
                                                        {tag.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="font-medium mb-2" style={{ color: 'var(--color-fg)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-tight)' }}>
                                            {task.title}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {task.eisenhower_quadrant && (
                                                    <span className="px-1.5 py-0.5 rounded" style={{
                                                        fontSize: '10px', fontWeight: 600,
                                                        backgroundColor: task.eisenhower_quadrant === 'Q1' ? 'var(--color-danger-bg)' : task.eisenhower_quadrant === 'Q2' ? 'var(--color-info-bg)' : task.eisenhower_quadrant === 'Q3' ? 'var(--color-warning-bg)' : 'var(--color-surface)',
                                                        color: task.eisenhower_quadrant === 'Q1' ? 'var(--color-danger)' : task.eisenhower_quadrant === 'Q2' ? 'var(--color-info)' : task.eisenhower_quadrant === 'Q3' ? 'var(--color-warning)' : 'var(--color-fg-tertiary)',
                                                    }}>
                                                        {task.eisenhower_quadrant}
                                                    </span>
                                                )}
                                                <span style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-xs)' }}>
                                                    {task.estimated_effort_hours}h
                                                </span>
                                            </div>
                                            {task.assignee && (
                                                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-info)', color: 'white', fontSize: '10px', fontWeight: 600 }}>
                                                    {task.assignee.full_name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                                {tasks.length === 0 && (
                                    <div className="p-4 text-center rounded-lg" style={{ border: '2px dashed var(--color-border)' }}>
                                        <span style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-xs)' }}>{t('board.dragHere')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
