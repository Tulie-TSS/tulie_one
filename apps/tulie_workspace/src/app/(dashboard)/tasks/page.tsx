'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useTasks } from '@/hooks/useTasks'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { TASK_STATUS_COLORS } from '@/lib/constants/task-status'
import { useLocaleStore } from '@/lib/stores/locale-store'
import type { TaskStatus } from '@/types/database.types'
import { PageHeader, Card, CardContent, Button, Badge } from '@repo/ui'
import { StatusBadge } from '@/components/shared/status-badge'
import { Avatar, AvatarFallback } from '@repo/ui'
import { Loader2, Plus, Search, RefreshCw } from 'lucide-react'
import { useNewTaskStore } from '@/lib/stores/use-new-task-store'
import { CrmSyncDialog } from '@/components/tasks/crm-sync-dialog'

const FILTER_STATUSES: (TaskStatus | 'all')[] = [
  'all', 'backlog', 'ready', 'doing', 'in_review', 'done', 'quarantine', 'on_hold'
]

export default function TasksPage() {
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const { t } = useLocaleStore()
  const { canManage, isAdmin, isManager, isMaker } = useCurrentUser()
  const [openCrmSync, setOpenCrmSync] = useState(false)
  const { tasks, loading, refetch } = useTasks()
  const { setOpen: setOpenTaskSheet } = useNewTaskStore()

  const filteredTasks = useMemo(() => {
    let result = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.assignee?.full_name.toLowerCase().includes(q)
      )
    }
    return result
  }, [tasks, filter, search])

  return (
    <div className="space-y-6">
      <PageHeader title={t('tasks.title')} description={t('tasks.subtitle')}>
        {(isAdmin || isManager || isMaker) && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpenCrmSync(true)}>
              <RefreshCw className="size-4 mr-2" />
              Nhập từ CRM
            </Button>
            <Button onClick={() => setOpenTaskSheet(true)}>
              <Plus className="size-4 mr-2" />
              {t('tasks.createTask')}
            </Button>
          </div>
        )}
      </PageHeader>

      {/* Search + Filter */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm công việc..."
              className="w-full pl-9 pr-4 py-2 h-10 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {(isAdmin || isManager || isMaker) && (
            <div className="sm:hidden flex gap-2 w-full">
              <Button variant="outline" onClick={() => setOpenCrmSync(true)} className="flex-1">
                <RefreshCw className="size-4 mr-2" />
                Nhập từ CRM
              </Button>
              <Button onClick={() => setOpenTaskSheet(true)} className="flex-1">
                <Plus className="size-4 mr-2" />
                {t('tasks.createTask')}
              </Button>
            </div>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {FILTER_STATUSES.map(s => (
            <Button
              key={s}
              variant={filter === s ? 'default' : 'outline'}
              size="sm"
              className="rounded-full flex-shrink-0"
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? t('tasks.all') : t(`status.${s}` as const)}
              {s !== 'all' && tasks.filter(t => t.status === s).length > 0 && (
                <span className={`ml-1 text-[10px] ${filter === s ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  ({tasks.filter(t => t.status === s).length})
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">Không có công việc nào{search ? ` với từ khoá "${search}"` : ''}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map(task => (
            <Link key={task.id} href={`/tasks/${task.id}`} className="block group">
              <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="flex items-center gap-4 py-3">
                  <StatusBadge
                    status={task.status}
                    label={t(`status.${task.status}` as const)}
                    className="text-[10px] h-5 flex-shrink-0"
                  />
                  <span className="flex-1 truncate font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Project name */}
                    {task.project && (
                      <span className="text-xs text-muted-foreground hidden lg:inline">
                        {task.project.name}
                      </span>
                    )}
                    {task.tags?.slice(0, 2).map(tag => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="text-[10px] py-0 border-transparent hidden md:inline-flex"
                        style={{ backgroundColor: tag.color + '15', color: tag.color }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {task.eisenhower_quadrant && (
                      <Badge
                        variant={task.eisenhower_quadrant === 'Q1' ? 'destructive' : 'secondary'}
                        className="text-[10px] px-1.5 py-0 h-5"
                      >
                        {task.eisenhower_quadrant}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{task.estimated_effort_hours}h</span>
                    {task.requested_deadline && (
                      <span className={`text-xs hidden sm:inline ${new Date(task.requested_deadline) < new Date() && task.status !== 'done' ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                        {new Date(task.requested_deadline).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                    {task.assignee && (
                      <Avatar className="size-6">
                        <AvatarFallback className="text-[10px] font-semibold">
                          {task.assignee.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Summary */}
      {!loading && (
        <p className="text-xs text-muted-foreground text-center">
          Hiển thị {filteredTasks.length} / {tasks.length} công việc
        </p>
      )}

      <CrmSyncDialog
        open={openCrmSync}
        onOpenChange={setOpenCrmSync}
        onSuccess={refetch}
      />
    </div>
  )
}
