'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useTasks } from '@/hooks/useTasks'
import { useLocaleStore } from '@/lib/stores/locale-store'
import { PageHeader, Card, CardContent, CardHeader, CardTitle, CardDescription, StatGrid, StatCard, Progress, Badge, Avatar, AvatarFallback, Tabs, TabsList, TabsTrigger, TabsContent } from '@repo/ui'
import { Loader2, Activity, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react'

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
                supabase.from('user_profiles').select('id, full_name, role_type, personal_wip_limit, hofstadter_multiplier').eq('is_active', true),
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
            <PageHeader title="Nhịp độ & Sức khỏe" description="Góc nhìn toàn cảnh về dòng chảy công việc, không gây áp lực." />

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Tổng quan dòng chảy</TabsTrigger>
                    <TabsTrigger value="health">Sức khỏe đội ngũ</TabsTrigger>
                </TabsList>

                {/* TAB 1: TỔNG QUAN */}
                <TabsContent value="overview" className="space-y-6">
                    <StatGrid>
                        <StatCard title="Đang xử lý" value={doingTasks.length} description="Công việc trên toàn hệ thống" />
                        <StatCard title="Đã hoàn thành" value={doneTasks.length} description="Task đã xong" />
                        <StatCard title="Tương tác nhanh" value={quickStrikes.length} description="Quick strikes (< 2p)" />
                    </StatGrid>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Status Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-medium">Trạng thái hiện tại</CardTitle>
                                <CardDescription>Tỉ lệ phân bổ các công việc</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {Object.entries(statusCounts).map(([status, count]) => (
                                    <div key={status} className="flex items-center gap-3">
                                        <span className="w-24 text-right text-xs text-muted-foreground">{t(`status.${status}` as const)}</span>
                                        <div className="flex-1">
                                            <Progress value={Math.max((count / (tasks.length || 1)) * 100, 2)} className="h-2 bg-muted/50 [&>div]:bg-foreground/20" />
                                        </div>
                                        <span className="text-xs font-semibold text-muted-foreground w-6 text-right">{count}</span>
                                    </div>
                                ))}
                                {tasks.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">Chưa có dữ liệu</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* WIP Heatmap - Tối giản */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-medium">Giới hạn tập trung (WIP)</CardTitle>
                                <CardDescription>Bảo vệ dòng chảy công việc của từng cá nhân</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {makers.map(user => {
                                    const doingCount = tasks.filter(t => t.assigned_to === user.id && t.status === 'doing').length
                                    const isAtLimit = doingCount >= user.personal_wip_limit
                                    
                                    return (
                                        <div key={user.id} className="flex items-center gap-4">
                                            <Avatar className="size-8">
                                                <AvatarFallback className="text-[11px] bg-muted text-muted-foreground">
                                                    {user.full_name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <span className="font-medium text-sm text-foreground">{user.full_name}</span>
                                                    <span className="text-xs text-muted-foreground">{doingCount} / {user.personal_wip_limit}</span>
                                                </div>
                                                <Progress 
                                                    value={doingCount === 0 ? 0 : Math.max((doingCount / user.personal_wip_limit) * 100, 5)} 
                                                    className={`h-1.5 bg-muted/50 ${isAtLimit ? '[&>div]:bg-foreground' : '[&>div]:bg-foreground/40'}`} 
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* TAB 2: SỨC KHỎE ĐỘI NGŨ */}
                <TabsContent value="health" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-muted/30 border-none shadow-none">
                            <CardContent className="p-6">
                                <Activity className="size-5 text-muted-foreground mb-3" />
                                <h3 className="font-medium text-sm mb-1">Duy trì nhịp độ (Flow)</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Thành viên hiếm khi vượt quá giới hạn WIP. Họ đang hoàn thành trọn vẹn từng việc một thay vì làm nhiều việc cùng lúc.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-muted/30 border-none shadow-none">
                            <CardContent className="p-6">
                                <Zap className="size-5 text-muted-foreground mb-3" />
                                <h3 className="font-medium text-sm mb-1">Xử lý nhiễu (Quick Strikes)</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Các công việc lặt vặt (dưới 2 phút) đang được giải quyết tức thì không cần lên lịch, giúp bảo vệ thời gian Deep Work.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-muted/30 border-none shadow-none">
                            <CardContent className="p-6">
                                <ShieldCheck className="size-5 text-muted-foreground mb-3" />
                                <h3 className="font-medium text-sm mb-1">Tính dự báo (Hofstadter)</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Hệ thống tự động bù trừ thời gian cho các ước lượng, đảm bảo kỳ vọng thực tế thay vì deadline bất khả thi gây áp lực.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Chỉ số cá nhân</CardTitle>
                            <CardDescription>Các chỉ số ngầm giúp quản lý cân đối nguồn lực mà không gây áp lực KPI lên người thực thi.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y divide-border/50">
                                {makers.map(user => {
                                    const userTasks = tasks.filter(t => t.assigned_to === user.id)
                                    const completed = userTasks.filter(t => t.status === 'done').length
                                    const carriedOver = userTasks.reduce((acc, t) => acc + (t.carried_over_count || 0), 0)
                                    const isStressed = carriedOver > 3 || user.hofstadter_multiplier > 1.5
                                    
                                    return (
                                        <div key={user.id} className="py-4 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-8">
                                                    <AvatarFallback className="text-[11px]">{user.full_name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">{user.full_name}</p>
                                                    <p className="text-xs text-muted-foreground">Đã hoàn thành {completed} công việc</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-8 text-right">
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Độ trễ/Delay</p>
                                                    <p className="text-sm font-medium">{carriedOver} lần</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-1">Hệ số bù trừ</p>
                                                    <p className="text-sm font-medium">x{user.hofstadter_multiplier}</p>
                                                </div>
                                                <div className="w-24 text-right">
                                                    {isStressed ? (
                                                        <Badge variant="secondary" className="text-[10px] font-normal bg-muted">Cần hỗ trợ</Badge>
                                                    ) : (
                                                        <span className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                                                            <CheckCircle2 className="size-3" /> Ổn định
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
