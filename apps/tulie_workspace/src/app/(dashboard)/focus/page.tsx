'use client'

import Link from 'next/link'
import { useTasks } from '@/hooks/useTasks'
import { useFocusStore } from '@/lib/stores/focus-store'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { PageHeader, Card, CardContent, CardHeader, CardTitle, Button, EmptyState } from '@repo/ui'
import { Target, Pause, Play, CheckCircle, Loader2 } from 'lucide-react'

export default function FocusPage() {
    const { tasks, loading, updateTaskStatus } = useTasks()
    const { isActive, taskId, startFocus, stopFocus, isPaused, togglePause } = useFocusStore()
    const { t } = useLocaleStore()

    const doingTasks = tasks.filter(task => task.status === 'doing')
    const activeTask = tasks.find(task => task.id === taskId)

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (isActive && activeTask) {
        return (
            <div className="-m-3 md:-m-5 flex items-center justify-center bg-background" style={{ height: 'calc(100vh - var(--header-height))' }}>
                <div className="text-center max-w-lg mx-auto px-6">
                    <div className="text-6xl font-mono text-foreground mb-6">
                        {isPaused ? '⏸' : '25:00'}
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">{activeTask.title}</h2>
                    <p className="text-sm text-muted-foreground mb-8">
                        {activeTask.description || 'Không có mô tả cho công việc này.'}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <Button variant={isPaused ? 'default' : 'outline'} size="lg" onClick={togglePause} className="cursor-pointer">
                            {isPaused ? <Play className="size-4 mr-2" /> : <Pause className="size-4 mr-2" />}
                            {isPaused ? t('focus.resume') : t('focus.pause')}
                        </Button>
                        <Button 
                            size="lg" 
                            className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                            onClick={async () => {
                                await updateTaskStatus(activeTask.id, 'done')
                                stopFocus()
                            }}
                        >
                            <CheckCircle className="size-4 mr-2" />
                            {t('focus.complete')}
                        </Button>
                    </div>
                    <Button variant="ghost" className="mt-6 text-muted-foreground cursor-pointer" onClick={stopFocus}>
                        {t('focus.exit')}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader title={t('focus.title')} description={t('focus.selectTask')} />

            {doingTasks.length === 0 ? (
                <EmptyState
                    icon={Target}
                    title={t('focus.noDoingTasks')}
                    description={t('focus.moveToBoard')}
                >
                    <Button asChild>
                        <Link href="/board">{t('focus.goToBoard')}</Link>
                    </Button>
                </EmptyState>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doingTasks.map(task => (
                        <Card key={task.id}>
                            <CardHeader>
                                <CardTitle className="text-base">{task.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {task.description && <p className="text-sm text-muted-foreground mb-4">{task.description}</p>}
                                <Button onClick={() => startFocus(task.id)} className="cursor-pointer">
                                    <Target className="size-4 mr-2" />
                                    {t('focus.start')}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
