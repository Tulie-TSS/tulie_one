'use client'

import React from 'react'
import Link from 'next/link'
import { useCycles } from '@/hooks/useCycles'
import { useTasks } from '@/hooks/useTasks'
import { useProjects } from '@/hooks/useProjects'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useLocaleStore } from '@/lib/stores/locale-store'
import {
  Card, CardContent, CardHeader, CardTitle, CardAction,
  Badge, Progress, PageHeader, StatGrid, StatCard, EmptyState, Avatar, AvatarFallback,
} from '@repo/ui'
import { StatusBadge } from '@/components/shared/status-badge'
import { AlertCircle, KanbanSquare } from 'lucide-react'

export default function DashboardPage() {
  const { t } = useLocaleStore()
  const { user, canManage } = useCurrentUser()
  const { activeCycle } = useCycles()
  const { tasks, loading: tasksLoading } = useTasks()
  const { projects } = useProjects(activeCycle?.id)

  const doingTasks = tasks.filter(t => t.status === 'doing')
  const readyTasks = tasks.filter(t => t.status === 'ready')
  const quarantineTasks = tasks.filter(t => t.status === 'quarantine')
  const doneTasks = tasks.filter(t => t.status === 'done')

  const wipLimit = user?.personal_wip_limit ?? 2

  // Week number within cycle
  const weekNum = activeCycle ? (() => {
    const start = new Date(activeCycle.start_date)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()
    return Math.min(12, Math.max(1, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000))))
  })() : 1

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('dashboard.title')}
        description={activeCycle
          ? `${activeCycle.name} — ${t('dashboard.weekOf')} ${weekNum}/12`
          : 'Chưa có chu kỳ nào đang hoạt động'
        }
      />

      {/* Quarantine Alert — only managers see it */}
      {canManage && quarantineTasks.length > 0 && (
        <Link href="/quarantine" className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 hover:bg-amber-500/15 transition-colors">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium text-sm">
            {quarantineTasks.length} {t('dashboard.tasksTriage')}
          </span>
        </Link>
      )}

      {/* Stat Cards */}
      <StatGrid>
        <StatCard title={t('dashboard.doing')} value={`${doingTasks.length} / ${wipLimit}`} />
        <StatCard title={t('dashboard.ready')} value={readyTasks.length} />
        {canManage && <StatCard title={t('dashboard.quarantine')} value={quarantineTasks.length} />}
        <StatCard title={t('dashboard.completed')} value={doneTasks.length} />
      </StatGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Doing Tasks */}
        <Card className="lg:col-span-2 border-none bg-transparent shadow-none">
          <CardHeader className="px-0 pt-0 pb-4 flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">{t('dashboard.doingTasks')}</CardTitle>
            <CardAction>
              <Link href="/board" className="text-sm font-medium text-primary hover:underline">{t('dashboard.viewBoard')}</Link>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="space-y-3">
              {tasksLoading ? (
                <div className="space-y-2">
                  {[1, 2].map(i => (
                    <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : doingTasks.length === 0 ? (
                <EmptyState icon={KanbanSquare} title={t('dashboard.noDoingTasks')} className="bg-card border shadow-sm h-[280px]" />
              ) : (
                <div className="space-y-3">
                  {doingTasks.map(task => (
                    <Link key={task.id} href={`/tasks/${task.id}`} className="block group">
                      <Card className="hover:border-primary/50 transition-colors">
                        <CardContent className="flex items-center justify-between gap-4 py-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-foreground truncate mb-1.5 group-hover:text-primary transition-colors">
                              {task.title}
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={task.status} label={t(`status.${task.status}` as any)} className="text-[10px] h-5" />
                              {task.tags?.map(tag => (
                                <Badge key={tag.id} variant="outline" className="text-[10px] font-medium px-1.5 py-0 h-5 border-transparent" style={{ backgroundColor: tag.color + '15', color: tag.color }}>
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {task.assignee && (
                            <Avatar className="size-8 shrink-0">
                              <AvatarFallback className="text-xs font-semibold">
                                {task.assignee.full_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Cycle Progress */}
          {activeCycle && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t('dashboard.cycleProgress')}</CardTitle>
                <CardAction>
                  <Link href={`/cycles/${activeCycle.id}`} className="text-xs text-primary hover:underline">{t('dashboard.details')}</Link>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-4">
                {(activeCycle.goals || []).map((g, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-foreground">{g.title}</span>
                      <span className="text-muted-foreground">{g.progress}%</span>
                    </div>
                    <Progress value={g.progress} className={`h-1.5 ${g.progress >= 80 ? '[&>div]:bg-emerald-500' : ''}`} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t('dashboard.projects')}</CardTitle>
                <CardAction>
                  <Link href="/projects" className="text-xs text-primary hover:underline">{t('dashboard.allProjects')}</Link>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-2">
                {projects.slice(0, 5).map(p => (
                  <Link key={p.id} href={`/projects/${p.id}`} className="block group">
                    <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors">
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{p.name}</span>
                      <Badge variant="secondary" className="text-xs ml-2 shrink-0">
                        {p.done_count}/{p.task_count} {t('dashboard.tasksDone')}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
