import Link from 'next/link'
import { MOCK_CYCLE, MOCK_MILESTONES, MOCK_TASKS } from '@/lib/mock/data'
import { notFound } from 'next/navigation'
import { TASK_STATUS_LABELS } from '@/lib/constants/task-status'

export default async function CycleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    if (id !== MOCK_CYCLE.id) return notFound()
    const cycleTasks = MOCK_TASKS.filter(t => t.cycle_id === id)
    const statusGroups = cycleTasks.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc }, {} as Record<string, number>)

    return (
        <div>
            <Link href="/cycles" className="inline-flex items-center gap-1 no-underline mb-4" style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>← Quay lại Cycles</Link>
            <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-fg)' }}>{MOCK_CYCLE.name}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6" style={{ backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                        <h2 className="font-semibold mb-4" style={{ color: 'var(--color-fg)' }}>Goals</h2>
                        {MOCK_CYCLE.goals.map((g, i) => (
                            <div key={i} className="mb-3">
                                <div className="flex justify-between mb-1" style={{ fontSize: 'var(--text-sm)' }}>
                                    <span style={{ color: 'var(--color-fg)' }}>{g.title}</span>
                                    <span style={{ color: 'var(--color-fg-secondary)' }}>{g.progress}%</span>
                                </div>
                                <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--color-surface)' }}>
                                    <div className="h-full rounded-full" style={{ width: `${g.progress}%`, backgroundColor: g.progress >= 80 ? 'var(--color-success)' : 'var(--color-info)' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-6" style={{ backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                        <h2 className="font-semibold mb-4" style={{ color: 'var(--color-fg)' }}>Milestones</h2>
                        <div className="space-y-4">
                            {MOCK_MILESTONES.map(ms => (
                                <div key={ms.id} className="flex items-center gap-4">
                                    <div className="w-10 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: ms.completion_rate === 100 ? 'var(--color-success)' : 'var(--color-surface)', color: ms.completion_rate === 100 ? 'white' : 'var(--color-fg)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>{ms.completion_rate === 100 ? '✓' : `${ms.completion_rate}%`}</div>
                                    <div className="flex-1">
                                        <div className="font-medium" style={{ color: 'var(--color-fg)', fontSize: 'var(--text-sm)' }}>{ms.name}</div>
                                        <div style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-xs)' }}>Mục tiêu: {new Date(ms.target_date).toLocaleDateString('vi-VN')}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div>
                    <div className="p-5" style={{ backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                        <h3 className="font-semibold mb-3" style={{ color: 'var(--color-fg)', fontSize: 'var(--text-sm)' }}>Task Status</h3>
                        <div className="space-y-2">
                            {Object.entries(statusGroups).map(([s, c]) => (
                                <div key={s} className="flex justify-between" style={{ fontSize: 'var(--text-sm)' }}>
                                    <span style={{ color: 'var(--color-fg-secondary)' }}>{TASK_STATUS_LABELS[s as keyof typeof TASK_STATUS_LABELS]}</span>
                                    <span className="font-medium" style={{ color: 'var(--color-fg)' }}>{c}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
