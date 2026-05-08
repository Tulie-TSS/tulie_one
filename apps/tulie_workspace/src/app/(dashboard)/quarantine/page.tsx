'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useTasks } from '@/hooks/useTasks'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useLocaleStore } from '@/lib/stores/locale-store'
import type { TaskRow } from '@/hooks/useTasks'
import type { TaskStatus } from '@/types/database.types'
import {
  Card, CardContent, Button, Badge, PageHeader, EmptyState,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  RadioGroup, RadioGroupItem, Label,
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@repo/ui'
import { StatusBadge } from '@/components/shared/status-badge'
import { CheckCircle, ArrowDownUp, ArrowRight, XCircle, Loader2 } from 'lucide-react'

export default function QuarantinePage() {
  const { t } = useLocaleStore()
  const { canManage } = useCurrentUser()
  const { tasks, loading, updateTaskStatus, refetch } = useTasks()

  const quarantineTasks = tasks.filter(t => t.status === 'quarantine')
  const doingTasks = tasks.filter(t => t.status === 'doing')

  const [tradeOffTask, setTradeOffTask] = useState<TaskRow | null>(null)
  const [selectedSwap, setSelectedSwap] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleDefer = async (task: TaskRow) => {
    setActionLoading(task.id + '-defer')
    const dest: TaskStatus = task.eisenhower_quadrant === 'Q1' ? 'ready' : 'backlog'
    const result = await updateTaskStatus(task.id, dest)
    if (result.success) {
      showToast(`${t('quarantine.deferSuccess')} → ${dest === 'ready' ? t('status.ready') : t('status.backlog')}`)
    }
    setActionLoading(null)
  }

  const handleReject = async (task: TaskRow) => {
    setActionLoading(task.id + '-reject')
    const result = await updateTaskStatus(task.id, 'rejected' as TaskStatus)
    if (result.success) showToast(t('quarantine.rejectSuccess'))
    setActionLoading(null)
  }

  const confirmSwap = async () => {
    if (!tradeOffTask || !selectedSwap) return
    setActionLoading('swap')

    // 1. Move selected doing-task to on_hold
    await updateTaskStatus(selectedSwap, 'on_hold')
    // 2. Move quarantine task to doing
    const result = await updateTaskStatus(tradeOffTask.id, 'doing')

    if (result.success) showToast(t('quarantine.swapSuccess'))
    setTradeOffTask(null)
    setSelectedSwap(null)
    setActionLoading(null)
  }

  const getDeferTarget = (task: TaskRow) =>
    task.eisenhower_quadrant === 'Q1'
      ? t('quarantine.deferToReady')
      : t('quarantine.deferToBacklog')

  if (!canManage) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('quarantine.title')} description={t('quarantine.subtitle')} />
        <EmptyState icon={CheckCircle} title="Không có quyền truy cập" description="Chỉ Quản lý và Admin mới có thể xem trang này" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('quarantine.title')} description={t('quarantine.subtitle')} />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : quarantineTasks.length === 0 ? (
        <EmptyState icon={CheckCircle} title={t('quarantine.empty')} description={t('quarantine.noTriage')} />
      ) : (
        <div className="space-y-4">
          {quarantineTasks.map(task => (
            <Card key={task.id} className="border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
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

                <Link href={`/tasks/${task.id}`} className="block hover:underline">
                  <h3 className="text-lg font-semibold text-foreground mb-1">{task.title}</h3>
                </Link>
                {task.description && (
                  <p className="text-sm text-muted-foreground mb-5 line-clamp-3">{task.description}</p>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <span>Nỗ lực: <strong>{task.estimated_effort_hours}h</strong></span>
                  {task.requested_deadline && (
                    <span>• Deadline: <strong>{new Date(task.requested_deadline).toLocaleDateString('vi-VN')}</strong></span>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap mt-2">
                  <Button
                    onClick={() => { setTradeOffTask(task); setSelectedSwap(null) }}
                    disabled={!!actionLoading}
                  >
                    <ArrowDownUp className="size-4" />
                    {t('quarantine.tradeOff')}
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => handleDefer(task)}
                          disabled={actionLoading === task.id + '-defer'}
                        >
                          {actionLoading === task.id + '-defer'
                            ? <Loader2 className="size-4 animate-spin" />
                            : <ArrowRight className="size-4" />
                          }
                          {t('quarantine.defer')}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{getDeferTarget(task)}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    variant="outline"
                    className="text-destructive border-destructive/20 hover:bg-destructive/10"
                    onClick={() => handleReject(task)}
                    disabled={actionLoading === task.id + '-reject'}
                  >
                    {actionLoading === task.id + '-reject'
                      ? <Loader2 className="size-4 animate-spin" />
                      : <XCircle className="size-4" />
                    }
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
              <div className="p-3 rounded-lg border border-primary/50 bg-primary/5">
                <div className="text-xs font-semibold text-primary mb-1">↓ Nhận vào</div>
                <div className="font-medium text-sm text-foreground">{tradeOffTask.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  {tradeOffTask.eisenhower_quadrant && (
                    <Badge variant={tradeOffTask.eisenhower_quadrant === 'Q1' ? 'destructive' : 'default'} className="text-[10px] h-5">
                      {tradeOffTask.eisenhower_quadrant}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">{tradeOffTask.estimated_effort_hours}h</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">↑ Chọn để hoán đổi ra (On-Hold)</div>
                {doingTasks.length === 0 ? (
                  <div className="p-4 text-center rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Không có công việc đang Doing</p>
                  </div>
                ) : (
                  <RadioGroup value={selectedSwap || ''} onValueChange={setSelectedSwap}>
                    {doingTasks.map(task => (
                      <label key={task.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border-2 ${selectedSwap === task.id ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/50'}`}>
                        <RadioGroupItem value={task.id} />
                        <div className="flex-1">
                          <div className="font-medium text-sm line-clamp-1">{task.title}</div>
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
            <Button variant="outline" onClick={() => setTradeOffTask(null)} disabled={actionLoading === 'swap'}>
              {t('quarantine.cancel')}
            </Button>
            <Button onClick={confirmSwap} disabled={!selectedSwap || actionLoading === 'swap'}>
              {actionLoading === 'swap' ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              {t('quarantine.swapConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-5 py-3 rounded-lg bg-foreground text-background text-sm font-medium shadow-lg z-[100]">
          {toast}
        </div>
      )}
    </div>
  )
}
