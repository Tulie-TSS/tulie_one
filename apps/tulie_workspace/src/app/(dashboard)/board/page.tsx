'use client'

import Link from 'next/link'
import { MOCK_TASKS } from '@/lib/mock/data'
import { BOARD_COLUMNS, TASK_STATUS_COLORS } from '@/lib/constants/task-status'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { PageHeader, Card, CardContent, Button, Badge, Avatar, AvatarFallback } from '@repo/ui'
import { Plus } from 'lucide-react'

export default function BoardPage() {
    const { t } = useLocaleStore()

    return (
        <div className="-m-3 md:-m-5 flex flex-col" style={{ height: 'calc(100vh - var(--header-height))' }}>
            {/* Top Bar */}
            <div className="flex items-center justify-between px-5 py-3 flex-shrink-0 border-b bg-background">
                <div>
                    <h1 className="text-lg font-semibold text-foreground">{t('board.title')}</h1>
                    <p className="text-xs text-muted-foreground">{t('board.subtitle')}</p>
                </div>
                <Button asChild>
                    <Link href="/tasks">
                        <Plus className="size-4" />
                        {t('board.createTask')}
                    </Link>
                </Button>
            </div>

            {/* Board Columns */}
            <div className="flex-1 flex gap-3 overflow-x-auto overflow-y-hidden p-4">
                {BOARD_COLUMNS.map(status => {
                    const tasks = MOCK_TASKS.filter(t => t.status === status)
                    const statusKey = `status.${status}` as const
                    return (
                        <div key={status} className="flex-shrink-0 flex flex-col w-[260px]">
                            {/* Column Header */}
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: TASK_STATUS_COLORS[status] }} />
                                <span className="font-semibold text-sm text-foreground">
                                    {t(statusKey)}
                                </span>
                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                    {tasks.length}
                                </Badge>
                            </div>

                            {/* Column Body */}
                            <div className="flex-1 overflow-y-auto space-y-2 p-2 rounded-lg bg-muted/50">
                                {tasks.map(task => (
                                    <Link
                                        key={task.id}
                                        href={`/tasks/${task.id}`}
                                        className="block group"
                                    >
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
                                                <div className="font-medium text-sm text-foreground mb-2 leading-tight group-hover:text-primary transition-colors">
                                                    {task.title}
                                                </div>
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
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                                {tasks.length === 0 && (
                                    <div className="p-4 text-center rounded-lg border-2 border-dashed border-border">
                                        <span className="text-xs text-muted-foreground">{t('board.dragHere')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
