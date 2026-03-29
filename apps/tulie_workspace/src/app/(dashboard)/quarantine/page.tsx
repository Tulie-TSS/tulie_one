'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MOCK_TASKS } from '@/lib/mock/data'
import { useLocaleStore } from '@/lib/stores/locale-store'
import type { Task } from '@/types/database.types'
import { Card, CardContent } from '@repo/ui'
import { Badge } from '@repo/ui'
import { StatusBadge } from '@/components/shared/status-badge'

export default function QuarantinePage() {
    const { t } = useLocaleStore()
    const [quarantineTasks, setQuarantineTasks] = useState(
        MOCK_TASKS.filter(task => task.status === 'quarantine')
    )
    const [tradeOffTask, setTradeOffTask] = useState<Task | null>(null)
    const [selectedSwap, setSelectedSwap] = useState<string | null>(null)
    const [toast, setToast] = useState<string | null>(null)

    const doingTasks = MOCK_TASKS.filter(task => task.status === 'doing')

    const showToast = (msg: string) => {
        setToast(msg)
        setTimeout(() => setToast(null), 3000)
    }

    const handleTradeOff = (task: Task) => {
        setTradeOffTask(task)
        setSelectedSwap(null)
    }

    const confirmSwap = () => {
        if (tradeOffTask && selectedSwap) {
            setQuarantineTasks(prev => prev.filter(t => t.id !== tradeOffTask.id))
            setTradeOffTask(null)
            setSelectedSwap(null)
            showToast(t('quarantine.swapSuccess'))
        }
    }

    const handleDefer = (task: Task) => {
        const isUrgent = task.eisenhower_quadrant === 'Q1'
        setQuarantineTasks(prev => prev.filter(t => t.id !== task.id))
        const dest = isUrgent ? t('status.ready') : t('status.backlog')
        showToast(`${t('quarantine.deferSuccess')} → ${dest}`)
    }

    const handleReject = (task: Task) => {
        setQuarantineTasks(prev => prev.filter(t => t.id !== task.id))
        showToast(t('quarantine.rejectSuccess'))
    }

    const getDeferTarget = (task: Task) => {
        return task.eisenhower_quadrant === 'Q1'
            ? t('quarantine.deferToReady')
            : t('quarantine.deferToBacklog')
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-foreground">{t('quarantine.title')}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t('quarantine.subtitle')}</p>
            </div>

            {quarantineTasks.length === 0 ? (
                <Card className="shadow-sm border-dashed">
                    <CardContent className="p-12 text-center text-muted-foreground">
                        <div className="text-4xl mb-4">✅</div>
                        <h3 className="font-semibold text-foreground mb-1">{t('quarantine.empty')}</h3>
                        <p className="text-sm text-muted-foreground">{t('quarantine.noTriage')}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {quarantineTasks.map(task => (
                        <Card key={task.id} className="shadow-sm border-amber-500/50 hover:border-amber-500 transition-colors">
                            <CardContent className="p-6">
                                {/* Badges */}
                                <div className="flex items-center gap-2 mb-3">
                                    <StatusBadge status="quarantine" label={t('status.quarantine')} />
                                    {task.eisenhower_quadrant && (
                                        <Badge variant="outline" className={`text-xs ${task.eisenhower_quadrant === 'Q1' ? 'text-destructive border-destructive/50' : 'text-muted-foreground'}`}>
                                            {task.eisenhower_quadrant}
                                        </Badge>
                                    )}
                                    {task.tags?.map(tag => (
                                        <Badge key={tag.id} variant="outline" className="text-[10px] py-0 border-transparent" style={{ backgroundColor: tag.color + '15', color: tag.color }}>
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>

                                {/* Title & Description */}
                                <Link href={`/tasks/${task.id}`} className="block hover:underline">
                                    <h3 className="text-lg font-semibold text-foreground mb-1">{task.title}</h3>
                                </Link>
                                {task.description && (
                                    <p className="text-sm text-muted-foreground mb-5">{task.description}</p>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-3 flex-wrap mt-2">
                                    <button onClick={() => handleTradeOff(task)}
                                        className="px-4 py-2 font-semibold text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                                        {t('quarantine.tradeOff')}
                                    </button>
                                    <div className="relative group">
                                        <button onClick={() => handleDefer(task)}
                                            className="px-4 py-2 font-semibold text-sm rounded-md border border-border bg-background text-foreground hover:bg-muted transition-colors">
                                            {t('quarantine.defer')}
                                        </button>
                                        <div className="absolute bottom-full left-0 mb-2 px-3 py-1.5 rounded-md text-xs font-medium bg-foreground text-background whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
                                            {getDeferTarget(task)}
                                        </div>
                                    </div>
                                    <button onClick={() => handleReject(task)}
                                        className="px-4 py-2 font-semibold text-sm rounded-md text-destructive border border-destructive/20 hover:bg-destructive/10 transition-colors">
                                        {t('quarantine.reject')}
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Trade-Off Dialog */}
            {tradeOffTask && (
                <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 1000 }}>
                    <div className="absolute inset-0 bg-black/40" onClick={() => setTradeOffTask(null)} />
                    <div className="relative w-full max-w-lg mx-4 p-6 rounded-md" style={{
                        backgroundColor: 'var(--color-bg)',
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid var(--color-border)',
                    }}>
                        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-fg)' }}>{t('quarantine.tradeOffTitle')}</h2>
                        <p className="mb-5" style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-sm)' }}>{t('quarantine.tradeOffDesc')}</p>

                        {/* Incoming task */}
                        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-info-bg)', border: '1px solid var(--color-info)' }}>
                            <div style={{ color: 'var(--color-info)', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: '4px' }}>↓ Nhận vào</div>
                            <div className="font-medium" style={{ color: 'var(--color-fg)', fontSize: 'var(--text-sm)' }}>{tradeOffTask.title}</div>
                            <div className="flex items-center gap-2 mt-1">
                                {tradeOffTask.eisenhower_quadrant && (
                                    <span className="px-1.5 py-0.5 rounded font-semibold" style={{
                                        fontSize: '10px',
                                        backgroundColor: tradeOffTask.eisenhower_quadrant === 'Q1' ? 'var(--color-danger-bg)' : 'var(--color-info-bg)',
                                        color: tradeOffTask.eisenhower_quadrant === 'Q1' ? 'var(--color-danger)' : 'var(--color-info)',
                                    }}>{tradeOffTask.eisenhower_quadrant}</span>
                                )}
                                <span style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-xs)' }}>{tradeOffTask.estimated_effort_hours}h</span>
                            </div>
                        </div>

                        {/* Doing tasks to swap */}
                        <div className="space-y-2 mb-5">
                            <div style={{ color: 'var(--color-fg-secondary)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>↑ Chọn để hoán đổi ra</div>
                            {doingTasks.length === 0 ? (
                                <div className="p-4 text-center rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
                                    <p style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-sm)' }}>Không có công việc đang Doing</p>
                                </div>
                            ) : doingTasks.map(task => (
                                <label key={task.id}
                                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                                    style={{
                                        backgroundColor: selectedSwap === task.id ? 'var(--color-warning-bg)' : 'var(--color-surface)',
                                        border: selectedSwap === task.id ? '2px solid var(--color-warning)' : '2px solid transparent',
                                    }}
                                >
                                    <input type="radio" name="swap" value={task.id}
                                        checked={selectedSwap === task.id}
                                        onChange={() => setSelectedSwap(task.id)}
                                        className="w-4 h-4 accent-blue-500" />
                                    <div className="flex-1">
                                        <div className="font-medium" style={{ color: 'var(--color-fg)', fontSize: 'var(--text-sm)' }}>{task.title}</div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {task.eisenhower_quadrant && (
                                                <span className="px-1.5 py-0.5 rounded" style={{ fontSize: '10px', fontWeight: 600, backgroundColor: 'var(--color-surface)', color: 'var(--color-fg-secondary)' }}>{task.eisenhower_quadrant}</span>
                                            )}
                                            <span style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-xs)' }}>{task.estimated_effort_hours}h</span>
                                            {task.assignee && (
                                                <span style={{ color: 'var(--color-fg-tertiary)', fontSize: 'var(--text-xs)' }}>{task.assignee.full_name}</span>
                                            )}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        {/* Dialog Actions */}
                        <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setTradeOffTask(null)}
                                className="px-4 py-2 font-medium cursor-pointer"
                                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-fg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 'var(--text-sm)' }}>
                                {t('quarantine.cancel')}
                            </button>
                            <button onClick={confirmSwap}
                                disabled={!selectedSwap}
                                className="px-4 py-2 font-medium cursor-pointer"
                                style={{
                                    backgroundColor: selectedSwap ? 'var(--color-info)' : 'var(--color-surface)',
                                    color: selectedSwap ? 'white' : 'var(--color-fg-tertiary)',
                                    borderRadius: 'var(--radius-md)', border: 'none', fontSize: 'var(--text-sm)',
                                    opacity: selectedSwap ? 1 : 0.5,
                                }}>
                                {t('quarantine.swapConfirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-5 py-3 rounded-md"
                    style={{
                        backgroundColor: 'var(--color-fg)',
                        color: 'var(--color-bg)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 500,
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 2000,
                    }}>
                    {toast}
                </div>
            )}
        </div>
    )
}
