'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MOCK_TASKS } from '@/lib/mock/data'
import { TASK_STATUS_COLORS } from '@/lib/constants/task-status'
import { useLocaleStore } from '@/lib/stores/locale-store'
import type { TaskStatus } from '@/types/database.types'
import { PageHeader, Card, CardContent, Button, Badge } from '@repo/ui'
import { StatusBadge } from '@/components/shared/status-badge'
import { Avatar, AvatarFallback } from '@repo/ui'

const FILTER_STATUSES: (TaskStatus | 'all')[] = ['all', 'backlog', 'ready', 'doing', 'in_review', 'done', 'quarantine', 'on_hold']

export default function TasksPage() {
    const [filter, setFilter] = useState<string>('all')
    const { t } = useLocaleStore()
    const tasks = filter === 'all' ? MOCK_TASKS : MOCK_TASKS.filter(t => t.status === filter)

    return (
        <div className="space-y-6">
            <PageHeader title={t('tasks.title')} description={t('tasks.subtitle')}>
                <Button>{t('tasks.createTask')}</Button>
            </PageHeader>

            <div className="flex gap-2 flex-wrap">
                {FILTER_STATUSES.map(s => (
                    <Button
                        key={s}
                        variant={filter === s ? 'default' : 'outline'}
                        size="sm"
                        className="rounded-full"
                        onClick={() => setFilter(s)}
                    >
                        {s === 'all' ? t('tasks.all') : t(`status.${s}` as const)}
                    </Button>
                ))}
            </div>

            <div className="space-y-2">
                {tasks.map(task => (
                    <Link key={task.id} href={`/tasks/${task.id}`} className="block group">
                        <Card className="hover:border-primary/50 transition-colors">
                            <CardContent className="flex items-center gap-4 py-3">
                                <StatusBadge status={task.status} label={t(`status.${task.status}` as const)} className="text-[10px] h-5" />
                                <span className="flex-1 truncate font-medium text-sm text-foreground group-hover:text-primary transition-colors">{task.title}</span>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {task.tags?.map(tag => (
                                        <Badge key={tag.id} variant="outline" className="text-[10px] py-0 border-transparent hidden md:inline-flex" style={{ backgroundColor: tag.color + '15', color: tag.color }}>{tag.name}</Badge>
                                    ))}
                                    <span className="text-xs text-muted-foreground">{task.estimated_effort_hours}h</span>
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
        </div>
    )
}
