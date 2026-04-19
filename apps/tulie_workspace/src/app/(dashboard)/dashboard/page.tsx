'use client'

import Link from 'next/link'
import { MOCK_TASKS, MOCK_CYCLE, MOCK_PROJECTS, MOCK_NOTIFICATIONS, getMockCurrentUser } from '@/lib/mock/data'
import { useLocaleStore } from '@/lib/stores/locale-store'
import {
    Card, CardContent, CardHeader, CardTitle, CardAction,
    Badge, Progress, PageHeader, StatGrid, StatCard, EmptyState, Avatar, AvatarFallback,
} from '@repo/ui'
import { StatusBadge } from '@/components/shared/status-badge'
import { AlertCircle, KanbanSquare } from 'lucide-react'

export default function DashboardPage() {
    const { t } = useLocaleStore()
    const user = getMockCurrentUser()
    const doingTasks = MOCK_TASKS.filter(t => t.status === 'doing')
    const readyTasks = MOCK_TASKS.filter(t => t.status === 'ready')
    const quarantineTasks = MOCK_TASKS.filter(t => t.status === 'quarantine')
    const doneTasks = MOCK_TASKS.filter(t => t.status === 'done')
    const currentWeek = 11

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('dashboard.title')}
                description={`${MOCK_CYCLE.name} — ${t('dashboard.weekOf')} ${currentWeek}/12`}
            />

            {/* Quarantine Alert */}
            {quarantineTasks.length > 0 && (
                <Link href="/quarantine" className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 hover:bg-amber-500/15 transition-colors">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium text-sm">
                        {quarantineTasks.length} {t('dashboard.tasksTriage')}
                    </span>
                </Link>
            )}

            {/* Stat Cards */}
            <StatGrid>
                <StatCard title={t('dashboard.doing')} value={`${doingTasks.length} / ${user.personal_wip_limit}`} />
                <StatCard title={t('dashboard.ready')} value={readyTasks.length} />
                <StatCard title={t('dashboard.quarantine')} value={quarantineTasks.length} />
                <StatCard title={t('dashboard.completed')} value={doneTasks.length} />
            </StatGrid>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Doing Tasks */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-medium">{t('dashboard.doingTasks')}</h2>
                        <Link href="/board" className="text-sm font-medium text-primary hover:underline">{t('dashboard.viewBoard')}</Link>
                    </div>
                    <div className="space-y-3">
                        {doingTasks.length === 0 ? (
                            <EmptyState
                                icon={KanbanSquare}
                                title={t('dashboard.noDoingTasks')}
                            />
                        ) : doingTasks.map(task => (
                            <Link key={task.id} href={`/tasks/${task.id}`} className="block group">
                                <Card className="hover:border-primary/50 transition-colors">
                                    <CardContent className="flex items-center justify-between gap-4 py-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm text-foreground truncate mb-1.5 group-hover:text-primary transition-colors">
                                                {task.title}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <StatusBadge status={task.status} label={t(`status.${task.status}` as const)} className="text-[10px] h-5" />
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
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Cycle Progress */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">{t('dashboard.cycleProgress')}</CardTitle>
                            <CardAction>
                                <Link href={`/cycles/${MOCK_CYCLE.id}`} className="text-xs text-primary hover:underline">{t('dashboard.details')}</Link>
                            </CardAction>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {MOCK_CYCLE.goals.map((g, i) => (
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

                    {/* Notifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">{t('dashboard.newNotifications')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-0.5 -mx-1">
                            {MOCK_NOTIFICATIONS.filter(n => !n.is_read).map(n => (
                                <div key={n.id} className="p-3 border-b last:border-0 border-border/50 hover:bg-muted/50 transition-colors rounded-md cursor-pointer">
                                    <div className="font-medium text-sm text-foreground mb-0.5">{n.title}</div>
                                    <div className="text-xs text-muted-foreground line-clamp-2">{n.content}</div>
                                </div>
                            ))}
                            {MOCK_NOTIFICATIONS.filter(n => !n.is_read).length === 0 && (
                                <div className="text-center text-sm text-muted-foreground py-4">
                                    Không có thông báo mới
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Projects */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">{t('dashboard.projects')}</CardTitle>
                            <CardAction>
                                <Link href="/projects" className="text-xs text-primary hover:underline">{t('dashboard.allProjects')}</Link>
                            </CardAction>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {MOCK_PROJECTS.map(p => (
                                <Link key={p.id} href={`/projects/${p.id}`} className="block group">
                                    <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors">
                                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{p.name}</span>
                                        <Badge variant="secondary" className="text-xs">
                                            {p.done_count}/{p.task_count} {t('dashboard.tasksDone')}
                                        </Badge>
                                    </div>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
