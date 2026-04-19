'use client'

import { MOCK_TASKS, MOCK_USERS, MOCK_QUICK_STRIKES } from '@/lib/mock/data'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { PageHeader, Card, CardContent, CardHeader, CardTitle, StatGrid, StatCard, Progress, Badge, Avatar, AvatarFallback } from '@repo/ui'

export default function AnalyticsPage() {
    const { t } = useLocaleStore()
    const doneTasks = MOCK_TASKS.filter(t => t.status === 'done')
    const doingTasks = MOCK_TASKS.filter(t => t.status === 'doing')
    const makers = MOCK_USERS.filter(u => u.role_type === 'maker')
    const statusCounts = MOCK_TASKS.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc }, {} as Record<string, number>)

    return (
        <div className="space-y-6">
            <PageHeader title={t('analytics.title')} description={t('analytics.subtitle')} />

            <StatGrid>
                <StatCard title={t('analytics.totalTasks')} value={MOCK_TASKS.length} />
                <StatCard title={t('analytics.completed')} value={doneTasks.length} />
                <StatCard title={t('analytics.inProgress')} value={doingTasks.length} />
                <StatCard title={t('analytics.quickStrikes')} value={MOCK_QUICK_STRIKES.length} />
            </StatGrid>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{t('analytics.statusBreakdown')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {Object.entries(statusCounts).map(([status, count]) => (
                            <div key={status} className="flex items-center gap-3">
                                <span className="w-24 text-right text-xs text-muted-foreground">{t(`status.${status}` as const)}</span>
                                <div className="flex-1">
                                    <Progress value={Math.max((count / MOCK_TASKS.length) * 100, 5)} className="h-5" />
                                </div>
                                <span className="text-xs font-semibold text-foreground w-6 text-right">{count}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* WIP Heatmap */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{t('analytics.wipHeatmap')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {makers.map(user => {
                            const doingCount = MOCK_TASKS.filter(t => t.assigned_to === user.id && t.status === 'doing').length
                            const isAtLimit = doingCount >= user.personal_wip_limit
                            const isNearLimit = doingCount === user.personal_wip_limit - 1
                            return (
                                <div key={user.id} className="flex items-center gap-3">
                                    <Avatar className="size-8">
                                        <AvatarFallback className="text-[11px] font-semibold">
                                            {user.full_name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{user.full_name}</div>
                                    </div>
                                    <Badge variant={isAtLimit ? 'destructive' : isNearLimit ? 'secondary' : 'outline'}>
                                        {doingCount}/{user.personal_wip_limit}
                                    </Badge>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
