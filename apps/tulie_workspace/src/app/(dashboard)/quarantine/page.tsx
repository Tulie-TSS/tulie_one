'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MOCK_TASKS } from '@/lib/mock/data'
import { useLocaleStore } from '@/lib/stores/locale-store'
import type { Task } from '@/types/database.types'
import {
    Card, CardContent, Button, Badge, PageHeader, EmptyState,
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
    RadioGroup, RadioGroupItem, Label,
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@repo/ui'
import { StatusBadge } from '@/components/shared/status-badge'
import { CheckCircle, ArrowDownUp, ArrowRight, XCircle } from 'lucide-react'

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
        <div className="space-y-6">
            <PageHeader title={t('quarantine.title')} description={t('quarantine.subtitle')} />

            {quarantineTasks.length === 0 ? (
                <EmptyState
                    icon={CheckCircle}
                    title={t('quarantine.empty')}
                    description={t('quarantine.noTriage')}
                />
            ) : (
                <div className="space-y-4">
                    {quarantineTasks.map(task => (
                        <Card key={task.id} className="border-amber-500/50 hover:border-amber-500 transition-colors">
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
                                    <Button onClick={() => handleTradeOff(task)}>
                                        <ArrowDownUp className="size-4" />
                                        {t('quarantine.tradeOff')}
                                    </Button>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="outline" onClick={() => handleDefer(task)}>
                                                    <ArrowRight className="size-4" />
                                                    {t('quarantine.defer')}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                {getDeferTarget(task)}
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => handleReject(task)}>
                                        <XCircle className="size-4" />
                                        {t('quarantine.reject')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Trade-Off Dialog */}
            <Dialog open={!!tradeOffTask} onOpenChange={(open) => !open && setTradeOffTask(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{t('quarantine.tradeOffTitle')}</DialogTitle>
                        <DialogDescription>{t('quarantine.tradeOffDesc')}</DialogDescription>
                    </DialogHeader>

                    {tradeOffTask && (
                        <div className="space-y-4">
                            {/* Incoming task */}
                            <div className="p-3 rounded-lg border border-primary/50 bg-primary/5">
                                <div className="text-xs font-semibold text-primary mb-1">↓ Nhận vào</div>
                                <div className="font-medium text-sm text-foreground">{tradeOffTask.title}</div>
                                <div className="flex items-center gap-2 mt-1">
                                    {tradeOffTask.eisenhower_quadrant && (
                                        <Badge
                                            variant={tradeOffTask.eisenhower_quadrant === 'Q1' ? 'destructive' : 'default'}
                                            className="text-[10px] h-5"
                                        >
                                            {tradeOffTask.eisenhower_quadrant}
                                        </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">{tradeOffTask.estimated_effort_hours}h</span>
                                </div>
                            </div>

                            {/* Doing tasks to swap */}
                            <div className="space-y-2">
                                <div className="text-xs font-semibold text-muted-foreground">↑ Chọn để hoán đổi ra</div>
                                {doingTasks.length === 0 ? (
                                    <div className="p-4 text-center rounded-lg bg-muted">
                                        <p className="text-sm text-muted-foreground">Không có công việc đang Doing</p>
                                    </div>
                                ) : (
                                    <RadioGroup value={selectedSwap || ''} onValueChange={setSelectedSwap}>
                                        {doingTasks.map(task => (
                                            <label
                                                key={task.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border-2 ${selectedSwap === task.id ? 'border-amber-500 bg-amber-500/5' : 'border-transparent bg-muted/50'}`}
                                            >
                                                <RadioGroupItem value={task.id} />
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">{task.title}</div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {task.eisenhower_quadrant && (
                                                            <Badge variant="secondary" className="text-[10px] h-5">{task.eisenhower_quadrant}</Badge>
                                                        )}
                                                        <span className="text-xs text-muted-foreground">{task.estimated_effort_hours}h</span>
                                                        {task.assignee && (
                                                            <span className="text-xs text-muted-foreground">{task.assignee.full_name}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </RadioGroup>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTradeOffTask(null)}>
                            {t('quarantine.cancel')}
                        </Button>
                        <Button onClick={confirmSwap} disabled={!selectedSwap}>
                            {t('quarantine.swapConfirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-5 py-3 rounded-lg bg-foreground text-background text-sm font-medium shadow-lg z-[100]">
                    {toast}
                </div>
            )}
        </div>
    )
}
