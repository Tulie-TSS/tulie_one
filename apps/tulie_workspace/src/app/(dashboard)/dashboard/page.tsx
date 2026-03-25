'use client'

import Link from 'next/link'
import { MOCK_TASKS, MOCK_CYCLE, MOCK_PROJECTS, MOCK_NOTIFICATIONS, getMockCurrentUser } from '@/lib/mock/data'
import { TASK_STATUS_COLORS } from '@/lib/constants/task-status'
import { useLocaleStore } from '@/lib/stores/locale-store'
import type { TaskStatus } from '@/types/database.types'

export default function DashboardPage() {
    const { t } = useLocaleStore()
    const user = getMockCurrentUser()
    const doingTasks = MOCK_TASKS.filter(t => t.status === 'doing')
    const readyTasks = MOCK_TASKS.filter(t => t.status === 'ready')
    const quarantineTasks = MOCK_TASKS.filter(t => t.status === 'quarantine')
    const doneTasks = MOCK_TASKS.filter(t => t.status === 'done')
    const currentWeek = 11

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-fg)' }}>{t('dashboard.title')}</h1>
                <p style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>
                    {MOCK_CYCLE.name} — {t('dashboard.weekOf')} {currentWeek}/12
                </p>
            </div>

            {quarantineTasks.length > 0 && (
                <Link href="/quarantine" className="flex items-center gap-3 mb-6 p-4 no-underline rounded-xl"
                    style={{ backgroundColor: 'var(--color-warning-bg)', border: '1px solid var(--color-warning)' }}>
                    <span style={{ fontSize: '20px' }}>⚠️</span>
                    <span className="font-medium" style={{ color: 'var(--color-warning)', fontSize: 'var(--text-sm)' }}>
                        {quarantineTasks.length} {t('dashboard.tasksTriage')}
                    </span>
                </Link>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {([
                    { label: t('dashboard.doing'), value: doingTasks.length, sub: `/ ${user.personal_wip_limit}`, color: 'var(--color-info)' },
                    { label: t('dashboard.ready'), value: readyTasks.length, color: 'var(--color-fg)' },
                    { label: t('dashboard.quarantine'), value: quarantineTasks.length, color: 'var(--color-warning)' },
                    { label: t('dashboard.completed'), value: doneTasks.length, color: 'var(--color-success)' },
                ] as const).map(card => (
                    <div key={card.label} className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <div style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>{card.label}</div>
                        <div className="text-3xl font-bold mt-1" style={{ color: card.color }}>
                            {card.value}
                            {'sub' in card && <span className="text-base font-normal" style={{ color: 'var(--color-fg-tertiary)' }}>{card.sub}</span>}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold" style={{ color: 'var(--color-fg)' }}>{t('dashboard.doingTasks')}</h2>
                        <Link href="/board" className="no-underline font-medium" style={{ color: 'var(--color-info)', fontSize: 'var(--text-sm)' }}>{t('dashboard.viewBoard')}</Link>
                    </div>
                    <div className="space-y-3">
                        {doingTasks.length === 0 ? (
                            <div className="p-8 text-center rounded-xl" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                                <p style={{ color: 'var(--color-fg-tertiary)' }}>{t('dashboard.noDoingTasks')}</p>
                            </div>
                        ) : doingTasks.map(task => (
                            <Link key={task.id} href={`/tasks/${task.id}`} className="flex items-center gap-4 p-4 rounded-xl no-underline transition-colors"
                                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                                <div className="flex-1">
                                    <div className="font-medium mb-1" style={{ color: 'var(--color-fg)', fontSize: 'var(--text-sm)' }}>{task.title}</div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-full" style={{
                                            backgroundColor: `color-mix(in srgb, ${TASK_STATUS_COLORS[task.status as TaskStatus]} 15%, transparent)`,
                                            color: TASK_STATUS_COLORS[task.status as TaskStatus],
                                            fontSize: 'var(--text-xs)', fontWeight: 500
                                        }}>{t(`status.${task.status}` as const)}</span>
                                        {task.tags?.map(tag => (
                                            <span key={tag.id} className="px-1.5 py-0.5 rounded" style={{ backgroundColor: tag.color + '15', color: tag.color, fontSize: '10px' }}>{tag.name}</span>
                                        ))}
                                    </div>
                                </div>
                                {task.assignee && (
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: 'var(--color-info)', color: 'white', fontSize: '12px', fontWeight: 600 }}>
                                        {task.assignee.full_name.charAt(0)}
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-5 rounded-xl" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold" style={{ color: 'var(--color-fg)', fontSize: 'var(--text-sm)' }}>{t('dashboard.cycleProgress')}</h3>
                            <Link href={`/cycles/${MOCK_CYCLE.id}`} className="no-underline" style={{ color: 'var(--color-info)', fontSize: 'var(--text-xs)' }}>{t('dashboard.details')}</Link>
                        </div>
                        <div className="space-y-3">
                            {MOCK_CYCLE.goals.map((g, i) => (
                                <div key={i}>
                                    <div className="flex justify-between mb-1" style={{ fontSize: 'var(--text-xs)' }}>
                                        <span style={{ color: 'var(--color-fg)' }}>{g.title}</span>
                                        <span style={{ color: 'var(--color-fg-secondary)' }}>{g.progress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-surface)' }}>
                                        <div className="h-full rounded-full" style={{ width: `${g.progress}%`, backgroundColor: g.progress >= 80 ? 'var(--color-success)' : 'var(--color-info)' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 rounded-xl" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <h3 className="font-semibold mb-3" style={{ color: 'var(--color-fg)', fontSize: 'var(--text-sm)' }}>{t('dashboard.newNotifications')}</h3>
                        <div className="space-y-3">
                            {MOCK_NOTIFICATIONS.filter(n => !n.is_read).map(n => (
                                <div key={n.id} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                                    <div className="font-medium" style={{ color: 'var(--color-fg)', fontSize: 'var(--text-sm)' }}>{n.title}</div>
                                    <div style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-xs)' }}>{n.content}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-5 rounded-xl" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold" style={{ color: 'var(--color-fg)', fontSize: 'var(--text-sm)' }}>{t('dashboard.projects')}</h3>
                            <Link href="/projects" className="no-underline" style={{ color: 'var(--color-info)', fontSize: 'var(--text-xs)' }}>{t('dashboard.allProjects')}</Link>
                        </div>
                        <div className="space-y-2">
                            {MOCK_PROJECTS.map(p => (
                                <Link key={p.id} href={`/projects/${p.id}`} className="block no-underline">
                                    <div className="flex items-center justify-between" style={{ fontSize: 'var(--text-sm)' }}>
                                        <span style={{ color: 'var(--color-fg)' }}>{p.name}</span>
                                        <span style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-xs)' }}>{p.done_count}/{p.task_count} {t('dashboard.tasksDone')}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
