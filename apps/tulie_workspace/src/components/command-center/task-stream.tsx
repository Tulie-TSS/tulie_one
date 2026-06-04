'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardAction, Badge, EmptyState } from '@repo/ui'
import { CheckCircle2, Circle, Clock, AlertTriangle, ListTodo } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TaskRow } from '@/hooks/useTasks'
import type { LifeRole } from '@/types/command-center.types'
import { useLifeRoleStore } from '@/lib/stores/life-role-store'

interface TaskStreamProps {
  tasks: TaskRow[]
  roles: LifeRole[]
  onComplete: (taskId: string) => void
  loading?: boolean
}

function getRoleForTask(task: TaskRow, roles: LifeRole[]) {
  const roleId = task.life_role_id || task.project?.life_role_id
  if (!roleId) return null
  return roles.find(r => r.id === roleId) || null
}

function PriorityDot({ priority }: { priority: number }) {
  const color = priority >= 8 ? 'bg-red-500' : priority >= 5 ? 'bg-amber-500' : priority >= 3 ? 'bg-emerald-500' : 'bg-muted-foreground/30'
  return <div className={cn('size-2 rounded-full shrink-0', color)} title={`Priority: ${priority}`} />
}

function isOverdue(task: TaskRow) {
  if (!task.requested_deadline) return false
  return new Date(task.requested_deadline) < new Date() && task.status !== 'done'
}

export function TaskStream({ tasks, roles, onComplete, loading }: TaskStreamProps) {
  const { activeRole } = useLifeRoleStore()

  // Filter by active role
  const filteredTasks = activeRole === 'all'
    ? tasks
    : tasks.filter(t => {
        const role = getRoleForTask(t, roles)
        return role?.role === activeRole
      })

  // Sort: overdue first, then by priority desc
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const aOverdue = isOverdue(a) ? 1 : 0
    const bOverdue = isOverdue(b) ? 1 : 0
    if (aOverdue !== bOverdue) return bOverdue - aOverdue
    return b.priority - a.priority
  })

  // Zeigarnik: show max 8 tasks, rest hidden
  const DISPLAY_LIMIT = 8
  const visibleTasks = sortedTasks.slice(0, DISPLAY_LIMIT)
  const hiddenCount = Math.max(0, sortedTasks.length - DISPLAY_LIMIT)

  return (
    <Card className="shadow-sm border-muted/60 bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex-row items-center justify-between border-b border-muted/40 pb-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <ListTodo className="size-4" />
          Tasks Hôm nay
          {filteredTasks.length > 0 && (
            <Badge variant="secondary" className="text-xs ml-1">
              {filteredTasks.filter(t => t.status === 'done').length}/{filteredTasks.length}
            </Badge>
          )}
        </CardTitle>
        <CardAction>
          <Link href="/tasks" className="text-xs text-primary hover:underline">Tất cả</Link>
        </CardAction>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : visibleTasks.length === 0 ? (
          <EmptyState
            icon={ListTodo}
            title="Không có task nào"
            className="h-[200px] bg-muted/20 border-none shadow-none"
          />
        ) : (
          <div className="space-y-1.5">
            {visibleTasks.map((task) => {
              const role = getRoleForTask(task, roles)
              const overdue = isOverdue(task)
              const isDone = task.status === 'done'

              return (
                <div
                  key={task.id}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    'hover:bg-muted/50',
                    isDone && 'opacity-50',
                    overdue && !isDone && 'bg-red-50 dark:bg-red-950/20'
                  )}
                  style={{ borderLeft: role ? `3px solid ${role.color}` : '3px solid transparent' }}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => onComplete(task.id)}
                    className={cn(
                      'shrink-0 transition-all duration-200',
                      isDone ? 'text-emerald-500' : 'text-muted-foreground/40 hover:text-emerald-400'
                    )}
                    title={isDone ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <Circle className="size-5 group-hover:hidden" />
                    )}
                    {!isDone && (
                      <CheckCircle2 className="size-5 hidden group-hover:block" />
                    )}
                  </button>

                  {/* Task content */}
                  <Link href={`/tasks/${task.id}`} className="flex-1 min-w-0">
                    <div className={cn(
                      'text-sm font-medium truncate transition-colors',
                      isDone ? 'line-through text-muted-foreground' : 'text-foreground group-hover:text-primary'
                    )}>
                      {task.title}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {role && (
                        <span
                          className="text-[10px] font-medium px-1.5 py-0 rounded"
                          style={{ backgroundColor: role.color + '15', color: role.color }}
                        >
                          {role.icon} {role.display_name}
                        </span>
                      )}
                      {overdue && !isDone && (
                        <span className="flex items-center gap-0.5 text-[10px] text-red-500 font-medium">
                          <AlertTriangle className="size-3" />
                          Quá hạn
                        </span>
                      )}
                      {task.requested_deadline && !overdue && !isDone && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Clock className="size-3" />
                          {new Date(task.requested_deadline).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Priority */}
                  <PriorityDot priority={task.priority} />
                </div>
              )
            })}

            {hiddenCount > 0 && (
              <Link
                href="/tasks"
                className="block text-center text-xs text-muted-foreground hover:text-primary py-2 transition-colors"
              >
                + {hiddenCount} tasks khác
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
