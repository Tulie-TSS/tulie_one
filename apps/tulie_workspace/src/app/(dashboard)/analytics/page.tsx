'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useTasks } from '@/hooks/useTasks'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { PageHeader, Card, CardContent, CardHeader, CardTitle, StatGrid, StatCard, Progress, Badge, Avatar, AvatarFallback } from '@repo/ui'
import { Loader2 } from 'lucide-react'

export default function AnalyticsPage() {
    const { t } = useLocaleStore()
    const { tasks, loading: tasksLoading } = useTasks()
    
    const [users, setUsers] = useState<any[]>([])
    const [quickStrikes, setQuickStrikes] = useState<any[]>([])
    const [loadingData, setLoadingData] = useState(true)

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            const supabase = createClient()
            
            const [usersRes, strikesRes] = await Promise.all([
                supabase.from('user_profiles').select('id, full_name, role_type, personal_wip_limit').eq('is_active', true),
                supabase.from('quick_strikes').select('id')
            ])
            
            if (usersRes.data) setUsers(usersRes.data)
            if (strikesRes.data) setQuickStrikes(strikesRes.data)
            
            setLoadingData(false)
        }
        
        fetchAnalyticsData()
    }, [])

    if (tasksLoading || loadingData) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const doneTasks = tasks.filter(t => t.status === 'done')
    const doingTasks = tasks.filter(t => t.status === 'doing')
    const makers = users.filter(u => u.role_type === 'maker' || u.role_type === 'manager')
    const statusCounts = tasks.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc }, {} as Record<string, number>)

    return (
        <div className="space-y-6">
            <PageHeader title={t('analytics.title')} description={t('analytics.subtitle')} />

            <StatGrid>
                <StatCard title={t('analytics.totalTasks')} value={tasks.length} />
                <StatCard title={t('analytics.completed')} value={doneTasks.length} />
                <StatCard title={t('analytics.inProgress')} value={doingTasks.length} />
                <StatCard title={t('analytics.quickStrikes')} value={quickStrikes.length} />
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
                                    <Progress value={Math.max((count / tasks.length) * 100, 5)} className="h-5" />
                                </div>
                                <span className="text-xs font-semibold text-foreground w-6 text-right">{count}</span>
                            </div>
                        ))}
                        {tasks.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">Chưa có công việc nào</p>
                        )}
                    </CardContent>
                </Card>

                {/* WIP Heatmap */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{t('analytics.wipHeatmap')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {makers.map(user => {
                            const doingCount = tasks.filter(t => t.assigned_to === user.id && t.status === 'doing').length
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
                        {makers.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">Không có dữ liệu thành viên</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
