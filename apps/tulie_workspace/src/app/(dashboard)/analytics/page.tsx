'use client'

import { MOCK_TASKS, MOCK_USERS, MOCK_QUICK_STRIKES } from '@/lib/mock/data'
import { useLocaleStore } from '@/lib/stores/locale-store'
import type { TaskStatus } from '@/types/database.types'

export default function AnalyticsPage() {
    const { t } = useLocaleStore()
    const doneTasks = MOCK_TASKS.filter(t => t.status === 'done')
    const doingTasks = MOCK_TASKS.filter(t => t.status === 'doing')
    const makers = MOCK_USERS.filter(u => u.role_type === 'maker')
    const statusCounts = MOCK_TASKS.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc }, {} as Record<string, number>)

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-fg)' }}>{t('analytics.title')}</h1>
                <p style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>{t('analytics.subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: t('analytics.totalTasks'), value: MOCK_TASKS.length, color: 'var(--color-fg)' },
                    { label: t('analytics.completed'), value: doneTasks.length, color: 'var(--color-success)' },
                    { label: t('analytics.inProgress'), value: doingTasks.length, color: 'var(--color-info)' },
                    { label: t('analytics.quickStrikes'), value: MOCK_QUICK_STRIKES.length, color: 'var(--color-warning)' },
                ].map(c => (
                    <div key={c.label} className="p-5 rounded-md" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <div style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>{c.label}</div>
                        <div className="text-3xl font-bold mt-1" style={{ color: c.color }}>{c.value}</div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="p-6 rounded-md" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                    <h2 className="font-semibold mb-4" style={{ color: 'var(--color-fg)' }}>{t('analytics.statusBreakdown')}</h2>
                    <div className="space-y-3">
                        {Object.entries(statusCounts).map(([status, count]) => (
                            <div key={status} className="flex items-center gap-3">
                                <span className="w-24 text-right" style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-xs)' }}>{t(`status.${status}` as const)}</span>
                                <div className="flex-1 h-5 rounded" style={{ backgroundColor: 'var(--color-surface)' }}>
                                    <div className="h-full rounded flex items-center pl-2" style={{
                                        width: `${Math.max((count / MOCK_TASKS.length) * 100, 8)}%`,
                                        backgroundColor: 'var(--color-info)', minWidth: '24px',
                                    }}>
                                        <span style={{ color: 'white', fontSize: '10px', fontWeight: 600 }}>{count}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-6 rounded-md" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                    <h2 className="font-semibold mb-4" style={{ color: 'var(--color-fg)' }}>{t('analytics.wipHeatmap')}</h2>
                    <div className="space-y-4">
                        {makers.map(user => {
                            const doingCount = MOCK_TASKS.filter(t => t.assigned_to === user.id && t.status === 'doing').length
                            const isAtLimit = doingCount >= user.personal_wip_limit
                            const isNearLimit = doingCount === user.personal_wip_limit - 1
                            return (
                                <div key={user.id} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-info)', color: 'white', fontSize: '11px', fontWeight: 600 }}>
                                        {user.full_name.charAt(0)}
                                    </div>
                                    <div className="flex-1"><div className="font-medium" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-fg)' }}>{user.full_name}</div></div>
                                    <span className="px-2.5 py-1 rounded-full font-semibold" style={{
                                        fontSize: 'var(--text-xs)',
                                        backgroundColor: isAtLimit ? 'var(--color-danger-bg)' : isNearLimit ? 'var(--color-warning-bg)' : 'var(--color-success-bg)',
                                        color: isAtLimit ? 'var(--color-danger)' : isNearLimit ? 'var(--color-warning)' : 'var(--color-success)',
                                    }}>{doingCount}/{user.personal_wip_limit}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
