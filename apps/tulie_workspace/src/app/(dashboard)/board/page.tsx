'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useTasks, type TaskRow } from '@/hooks/useTasks'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { BOARD_COLUMNS, TASK_STATUS_COLORS } from '@/lib/constants/task-status'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { PageHeader, Card, CardContent, Button, Badge, Avatar, AvatarFallback } from '@repo/ui'
import { WipBlockDialog } from '@/components/shared/wip-block-dialog'
import { Plus, AlertTriangle } from 'lucide-react'
import type { TaskStatus } from '@/types/database.types'

export default function BoardPage() {
  const { t } = useLocaleStore()
  const { user, canManage } = useCurrentUser()
  const { tasks, loading, updateTaskStatus, refetch } = useTasks()

  const [wipDialog, setWipDialog] = useState<{
    open: boolean
    doingCount: number
    wipLimit: number
    targetTaskId: string
    targetStatus: TaskStatus
  }>({ open: false, doingCount: 0, wipLimit: 2, targetTaskId: '', targetStatus: 'doing' })

  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const result = await updateTaskStatus(taskId, newStatus)
    if (result.wipViolation) {
      setWipDialog({
        open: true,
        doingCount: result.doingCount ?? 0,
        wipLimit: result.wipLimit ?? 2,
        targetTaskId: taskId,
        targetStatus: newStatus,
      })
      return
    }
    if (result.success) {
      showToast('Đã cập nhật trạng thái công việc')
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    await updateTaskStatus(taskId, 'done')
    // Retry the original move
    await updateTaskStatus(wipDialog.targetTaskId, wipDialog.targetStatus)
    setWipDialog(d => ({ ...d, open: false }))
    showToast('Hoàn thành — công việc mới đã vào Doing ✓')
  }

  const handlePauseTask = async (taskId: string) => {
    await updateTaskStatus(taskId, 'on_hold')
    // Retry the original move
    await updateTaskStatus(wipDialog.targetTaskId, wipDialog.targetStatus)
    setWipDialog(d => ({ ...d, open: false }))
    showToast('Đã tạm dừng — công việc mới đã vào Doing')
  }

  const doingTasksForDialog = tasks
    .filter(t => t.status === 'doing')
    .map(t => ({ id: t.id, title: t.title }))

  // Filter columns visible by role
  const visibleColumns = canManage
    ? BOARD_COLUMNS
    : BOARD_COLUMNS.filter(c => !['quarantine', 'intake'].includes(c))

  return (
    <div className="-m-3 md:-m-5 flex flex-col" style={{ height: 'calc(100vh - var(--header-height))' }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0 border-b bg-background">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{t('board.title')}</h1>
          <p className="text-xs text-muted-foreground">{t('board.subtitle')}</p>
        </div>
        {canManage && (
          <Button asChild>
            <Link href="/tasks/new">
              <Plus className="size-4" />
              {t('board.createTask')}
            </Link>
          </Button>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="flex-1 flex gap-3 overflow-x-auto p-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-shrink-0 w-[260px] space-y-2">
              <div className="h-5 bg-muted rounded animate-pulse" />
              <div className="h-24 bg-muted rounded animate-pulse" />
              <div className="h-16 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Board Columns */}
      {!loading && (
        <div className="flex-1 flex gap-3 overflow-x-auto overflow-y-hidden p-4">
          {visibleColumns.map(status => {
            const columnTasks = tasks.filter(t => t.status === status)
            const statusKey = `status.${status}` as const
            return (
              <div key={status} className="flex-shrink-0 flex flex-col w-[260px]">
                {/* Column Header */}
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: TASK_STATUS_COLORS[status] }} />
                  <span className="font-semibold text-sm text-foreground">{t(statusKey)}</span>
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                    {columnTasks.length}
                  </Badge>
                </div>

                {/* Column Body */}
                <div className="flex-1 overflow-y-auto space-y-2 p-2 rounded-lg bg-muted/50">
                  {columnTasks.map(task => (
                    <div key={task.id} className="group">
                      <Card className="hover:border-primary/50 transition-all">
                        <CardContent className="p-3">
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {task.tags.map(tag => (
                                <Badge key={tag.id} variant="outline" className="text-[10px] py-0 px-1.5 border-transparent" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <Link href={`/tasks/${task.id}`} className="block">
                            <div className="font-medium text-sm text-foreground mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                              {task.title}
                            </div>
                          </Link>

                          {/* Carried-over warning */}
                          {task.carried_over_count > 0 && (
                            <div className="flex items-center gap-1 mb-2 text-xs text-foreground/70">
                              <AlertTriangle className="size-3" />
                              <span>Chuyển tiếp {task.carried_over_count} lần</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {task.eisenhower_quadrant && (
                                <Badge
                                  variant={task.eisenhower_quadrant === 'Q1' ? 'destructive' : task.eisenhower_quadrant === 'Q2' ? 'default' : 'secondary'}
                                  className="text-[10px] px-1.5 py-0 h-5"
                                >
                                  {task.eisenhower_quadrant}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {task.estimated_effort_hours}h
                              </span>
                            </div>
                            {task.assignee && (
                              <Avatar className="size-6">
                                <AvatarFallback className="text-[10px] font-semibold">
                                  {task.assignee.full_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>

                          {/* Status transition buttons — only for allowed transitions */}
                          {canManage && status === 'intake' && (
                            <div className="mt-2 flex gap-1">
                              <button
                                className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                onClick={() => handleStatusChange(task.id, 'backlog')}
                              >
                                → Backlog
                              </button>
                              <button
                                className="text-[10px] px-2 py-0.5 rounded bg-foreground/10 text-foreground hover:bg-foreground/20 transition-colors"
                                onClick={() => handleStatusChange(task.id, 'quarantine')}
                              >
                                → Cách ly
                              </button>
                            </div>
                          )}
                          {status === 'ready' && (
                            <div className="mt-2">
                              <button
                                className="text-[10px] w-full px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                onClick={() => handleStatusChange(task.id, 'doing')}
                              >
                                ▶ Bắt đầu
                              </button>
                            </div>
                          )}
                          {status === 'doing' && (
                            <div className="mt-2 flex gap-1">
                              <button
                                className="text-[10px] flex-1 px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                onClick={() => handleStatusChange(task.id, 'in_review')}
                              >
                                ✓ Gửi review
                              </button>
                              <button
                                className="text-[10px] px-2 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                                onClick={() => handleStatusChange(task.id, 'on_hold')}
                              >
                                ⏸
                              </button>
                            </div>
                          )}
                          {status === 'in_review' && canManage && (
                            <div className="mt-2 flex gap-1">
                              <button
                                className="text-[10px] flex-1 px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                onClick={() => handleStatusChange(task.id, 'done')}
                              >
                                ✓ Duyệt
                              </button>
                              <button
                                className="text-[10px] flex-1 px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                                onClick={() => handleStatusChange(task.id, 'doing')}
                              >
                                ← Sửa lại
                              </button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="p-4 text-center rounded-lg border-2 border-dashed border-border">
                      <span className="text-xs text-muted-foreground">{t('board.dragHere')}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* WIP Block Dialog */}
      <WipBlockDialog
        open={wipDialog.open}
        onClose={() => setWipDialog(d => ({ ...d, open: false }))}
        doingCount={wipDialog.doingCount}
        wipLimit={wipDialog.wipLimit}
        doingTasks={doingTasksForDialog}
        onCompleteTask={handleCompleteTask}
        onPauseTask={handlePauseTask}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-5 py-3 rounded-lg bg-foreground text-background text-sm font-medium shadow-lg z-[100] animate-in fade-in">
          {toast}
        </div>
      )}
    </div>
  )
}
