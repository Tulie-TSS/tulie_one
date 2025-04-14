'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MOCK_TASKS } from '@/lib/mock/data'
import { TASK_STATUS_COLORS } from '@/lib/constants/task-status'
import { useLocaleStore } from '@/lib/stores/locale-store'
import type { TaskStatus } from '@/types/database.types'

const FILTER_STATUSES: (TaskStatus | 'all')[] = ['all', 'backlog', 'ready', 'doing', 'in_review', 'done', 'quarantine', 'on_hold']

export default function TasksPage() {
    const [filter, setFilter] = useState<string>('all')
    const { t } = useLocaleStore()
    const tasks = filter === 'all' ? MOCK_TASKS : MOCK_TASKS.filter(t => t.status === filter)

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-fg)' }}>{t('tasks.title')}</h1>
                    <p style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>{t('tasks.subtitle')}</p>
                </div>
                <button className="px-4 py-2 font-medium cursor-pointer" style={{ backgroundColor: 'var(--color-info)', color: 'white', borderRadius: 'var(--radius-md)', border: 'none', fontSize: 'var(--text-sm)' }}>
                    {t('tasks.createTask')}
                </button>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
                {FILTER_STATUSES.map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className="px-3 py-1.5 rounded-full cursor-pointer transition-colors"
                        style={{
                            backgroundColor: filter === s ? 'var(--color-info)' : 'var(--color-bg)',
                            color: filter === s ? 'white' : 'var(--color-fg-secondary)',
                            border: filter === s ? 'none' : '1px solid var(--color-border)',
                            fontSize: 'var(--text-xs)', fontWeight: 500,
                        }}>
                        {s === 'all' ? t('tasks.all') : t(`status.${s}` as const)}
                    </button>
                ))}
            </div>

            <div className="space-y-2">
                {tasks.map(task => (
                    <Link key={task.id} href={`/tasks/${task.id}`}
                        className="flex items-center gap-4 p-4 no-underline rounded-md transition-colors"
                        style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <span className="px-2 py-0.5 rounded-full flex-shrink-0 font-semibold" style={{
                            backgroundColor: `color-mix(in srgb, ${TASK_STATUS_COLORS[task.status]} 15%, transparent)`,
                            color: TASK_STATUS_COLORS[task.status],
                            fontSize: 'var(--text-xs)',
                        }}>{t(`status.${task.status}` as const)}</span>
                        <span className="flex-1 truncate font-medium" style={{ color: 'var(--color-fg)', fontSize: 'var(--text-sm)' }}>{task.title}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {task.tags?.map(tag => (
                                <span key={tag.id} className="px-1.5 py-0.5 rounded hidden md:inline" style={{ backgroundColor: tag.color + '15', color: tag.color, fontSize: '10px' }}>{tag.name}</span>
                            ))}
                            <span style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-xs)' }}>{task.estimated_effort_hours}h</span>
                            {task.assignee && (
                                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-info)', color: 'white', fontSize: '10px', fontWeight: 600 }}>
                                    {task.assignee.full_name.charAt(0)}
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
