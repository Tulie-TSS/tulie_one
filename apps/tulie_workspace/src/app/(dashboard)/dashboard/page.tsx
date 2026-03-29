'use client'

import Link from 'next/link'
import { MOCK_TASKS, MOCK_CYCLE, MOCK_PROJECTS, MOCK_NOTIFICATIONS, getMockCurrentUser } from '@/lib/mock/data'
import { TASK_STATUS_COLORS } from '@/lib/constants/task-status'
import { useLocaleStore } from '@/lib/stores/locale-store'
import type { TaskStatus } from '@/types/database.types'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { Badge } from '@repo/ui'
import { Progress } from '@repo/ui'
import { AlertCircle, ArrowRight } from 'lucide-react'

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
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold tracking-tight">{t('dashboard.title')}</h1>
                <p className="text-sm text-muted-foreground">
                    {MOCK_CYCLE.name} — {t('dashboard.weekOf')} {currentWeek}/12
                </p>
            </div>

            {quarantineTasks.length > 0 && (
                <Link href="/quarantine" className="flex items-center gap-3 p-4 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 hover:bg-amber-500/15 transition-colors">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium text-sm">
                        {quarantineTasks.length} {t('dashboard.tasksTriage')}
                    </span>
                </Link>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {([
                    { label: t('dashboard.doing'), value: doingTasks.length, sub: `/ ${user.personal_wip_limit}`, color: 'text-blue-600' },
                    { label: t('dashboard.ready'), value: readyTasks.length, color: 'text-foreground' },
                    { label: t('dashboard.quarantine'), value: quarantineTasks.length, color: 'text-amber-600' },
                    { label: t('dashboard.completed'), value: doneTasks.length, color: 'text-emerald-600' },
                ] as const).map(card => (
                    <Card key={card.label} className="shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-3xl font-bold ${card.color}`}>
                                {card.value}
                                {'sub' in card && <span className="text-base font-normal text-muted-foreground ml-1">{card.sub}</span>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-medium">{t('dashboard.doingTasks')}</h2>
                        <Link href="/board" className="text-sm font-medium text-primary hover:underline">{t('dashboard.viewBoard')}</Link>
                    </div>
                    <div className="space-y-3">
                        {doingTasks.length === 0 ? (
                            <Card className="shadow-sm border-dashed">
                                <CardContent className="p-8 text-center text-muted-foreground">
                                    {t('dashboard.noDoingTasks')}
                                </CardContent>
                            </Card>
                        ) : doingTasks.map(task => (
                            <Link key={task.id} href={`/tasks/${task.id}`} className="block block group">
                                <Card className="shadow-sm hover:border-primary/50 transition-colors">
                                    <CardContent className="p-4 flex items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm text-foreground truncate mb-1.5 group-hover:text-primary transition-colors">
                                                {task.title}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-[10px] font-medium px-1.5 py-0 h-5" style={{
                                                    backgroundColor: `color-mix(in srgb, ${TASK_STATUS_COLORS[task.status as TaskStatus]} 15%, transparent)`,
                                                    color: TASK_STATUS_COLORS[task.status as TaskStatus],
                                                }}>
                                                    {t(`status.${task.status}` as const)}
                                                </Badge>
                                                {task.tags?.map(tag => (
                                                    <Badge key={tag.id} variant="outline" className="text-[10px] font-medium px-1.5 py-0 h-5 border-transparent" style={{ backgroundColor: tag.color + '15', color: tag.color }}>
                                                        {tag.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        {task.assignee && (
                                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                                                {task.assignee.full_name.charAt(0)}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-medium">{t('dashboard.cycleProgress')}</CardTitle>
                            <Link href={`/cycles/${MOCK_CYCLE.id}`} className="text-xs text-primary hover:underline">{t('dashboard.details')}</Link>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {MOCK_CYCLE.goals.map((g, i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-medium text-foreground">{g.title}</span>
                                        <span className="text-muted-foreground">{g.progress}%</span>
                                    </div>
                                    <Progress value={g.progress} className={`h-1.5 ${g.progress >= 80 ? '[&>div]:bg-emerald-500' : '[&>div]:bg-primary'}`} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="pb-3 text-sm font-medium">
                            <CardTitle className="text-sm font-medium">{t('dashboard.newNotifications')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-0.5 px-3">
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

                    <Card className="shadow-sm">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-medium">{t('dashboard.projects')}</CardTitle>
                            <Link href="/projects" className="text-xs text-primary hover:underline">{t('dashboard.allProjects')}</Link>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {MOCK_PROJECTS.map(p => (
                                <Link key={p.id} href={`/projects/${p.id}`} className="block group">
                                    <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors">
                                        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{p.name}</span>
                                        <span className="text-xs text-muted-foreground bg-muted group-hover:bg-background px-2 py-0.5 rounded-full transition-colors">
                                            {p.done_count}/{p.task_count} {t('dashboard.tasksDone')}
                                        </span>
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
