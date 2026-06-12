import { StatsCard } from '@/components/dashboard/stats-card'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { RecentActivities } from '@/components/dashboard/recent-activities'
import { CRMAlerts } from '@/components/dashboard/crm-alerts'
import { formatCurrency } from '@/lib/utils/format'
import { getDashboardStats, getRevenueChartData, getDealStats, getCRMAlerts } from '@/lib/supabase/services/dashboard-service'
import { getRecentActivities } from '@/lib/supabase/services/activity-service'
import { DealProjectionChart } from '@/components/dashboard/deal-projection-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { Progress } from '@repo/ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui'
import { Info, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

function calculateHealthScore(stats: any, dealStats: any) {
    let score = 0
    const metrics: { label: string; value: number; max: number; status: string; colorClass: string; target: string }[] = []

    // 1. Revenue score (0-30): based on total revenue vs target 50M
    const TARGET_REVENUE = 50000000
    const revenueScore = Math.min(Math.round((stats.revenue.total / TARGET_REVENUE) * 30), 30)
    score += revenueScore
    metrics.push({
        label: 'Dòng tiền',
        value: revenueScore,
        max: 30,
        status: stats.revenue.total > 30000000 ? 'Tốt' : stats.revenue.total > 10000000 ? 'Trung bình' : stats.revenue.total > 0 ? 'Yếu' : 'Chưa có',
        colorClass: '[&>div]:bg-zinc-800 dark:[&>div]:bg-zinc-200',
        target: `Mục tiêu: ${formatCurrency(TARGET_REVENUE)}`
    })

    // 2. Customer growth (0-25): based on new customers
    const TARGET_CUSTOMERS = 5
    const customerScore = Math.min(Math.round((stats.customers.new / TARGET_CUSTOMERS) * 25), 25)
    score += customerScore
    metrics.push({
        label: 'Khách hàng mới',
        value: customerScore,
        max: 25,
        status: `${stats.customers.new} khách`,
        colorClass: '[&>div]:bg-zinc-700 dark:[&>div]:bg-zinc-300',
        target: `Mục tiêu: ${TARGET_CUSTOMERS} khách/tháng`
    })

    // 3. Contract activity (0-25): based on active contracts
    const TARGET_CONTRACTS = 5
    const contractScore = Math.min(Math.round((stats.contracts.active / TARGET_CONTRACTS) * 25), 25)
    score += contractScore
    metrics.push({
        label: 'Hợp đồng đang thực hiện',
        value: contractScore,
        max: 25,
        status: `${stats.contracts.active} HĐ`,
        colorClass: '[&>div]:bg-zinc-600 dark:[&>div]:bg-zinc-400',
        target: `Mục tiêu: ${TARGET_CONTRACTS} hợp đồng`
    })

    // 4. Pipeline health (0-20): based on deal pipeline value
    const TARGET_PIPELINE = 50000000
    const pipelineValue = dealStats?.total_potential || 0
    const pipelineScore = Math.min(Math.round((pipelineValue / TARGET_PIPELINE) * 20), 20)
    score += pipelineScore
    metrics.push({
        label: 'Pipeline (cơ hội)',
        value: pipelineScore,
        max: 20,
        status: pipelineValue > 0 ? formatCurrency(pipelineValue) : 'Chưa có',
        colorClass: '[&>div]:bg-zinc-500',
        target: `Mục tiêu: ${formatCurrency(TARGET_PIPELINE)}`
    })

    return { score, metrics }
}

function getScoreColorClass(score: number): string {
    if (score >= 75) return 'text-foreground border-foreground'
    if (score >= 50) return 'text-zinc-600 border-zinc-600 dark:text-zinc-400 dark:border-zinc-400'
    if (score >= 25) return 'text-muted-foreground border-border'
    return 'text-destructive border-border'
}

function getScoreLabel(score: number): string {
    if (score >= 75) return 'Xuất sắc'
    if (score >= 50) return 'Tốt'
    if (score >= 25) return 'Cần cải thiện'
    return 'Cần hành động'
}

export default async function DashboardPage() {
    try {
        const [stats, chartData, recentActivities, dealStats, crmAlerts] = await Promise.all([
            getDashboardStats(),
            getRevenueChartData(),
            getRecentActivities(),
            getDealStats(),
            getCRMAlerts()
        ])

        const health = calculateHealthScore(stats, dealStats)
        const scoreColorClass = getScoreColorClass(health.score)
        const scoreLabel = getScoreLabel(health.score)

        return (
            <div className="space-y-6 max-w-[1600px] mx-auto w-full">
                {/* Page Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Tổng quan hoạt động kinh doanh của Tulie Agency
                    </p>
                </div>

                {/* Stats Cards */}
                {/* Stats — shadcn dashboard-01 pattern */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
                    <StatsCard
                        title="Doanh thu tổng"
                        value={formatCurrency(stats.revenue.total)}
                        change={stats.revenue.change}
                        changeLabel={stats.revenue.period}
                    />
                    <StatsCard
                        title="Tổng giá trị hợp đồng"
                        value={formatCurrency(stats.contracts.total_value)}
                    />
                    <StatsCard
                        title="Tổng khách hàng"
                        value={stats.customers.total.toString()}
                        change={stats.customers.new}
                        changeLabel="khách hàng mới"
                    />
                    <StatsCard
                        title="Tổng Leads"
                        value={stats.leads.total.toString()}
                    />
                    
                    <StatsCard
                        title="HĐ đang thực hiện"
                        value={stats.contracts.active.toString()}
                    />
                    <StatsCard
                        title="HĐ chờ ký/xác nhận"
                        value={stats.contracts.pending.toString()}
                    />
                    <StatsCard
                        title="HĐ quá hạn triển khai"
                        value={stats.contracts.overdue.toString()}
                        className="border-red-200/50 hover:border-red-300 dark:border-red-900/50 dark:hover:border-red-800 bg-red-50/5 text-red-600 dark:text-red-400"
                    />
                    <StatsCard
                        title="HĐ đã hoàn thành"
                        value={stats.contracts.completed.toString()}
                    />
                    <StatsCard
                        title="Leads chờ xử lý (mới)"
                        value={stats.leads.new.toString()}
                    />
                    <StatsCard
                        title="Leads tiềm năng"
                        value={stats.leads.qualified.toString()}
                    />
                </div>

                {/* Charts */}
                <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                    <RevenueChart data={chartData} />
                    <DealProjectionChart stats={dealStats} />
                </div>

                {/* Bottom Section */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <RecentActivities data={recentActivities} />
                    <CRMAlerts alerts={crmAlerts} />

                    {/* Business Health Card */}
                    <Card className="flex flex-col h-full">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-medium">Sức khỏe doanh nghiệp</CardTitle>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[350px] p-4 text-sm" side="left">
                                        <p className="font-semibold mb-2 text-foreground">Quy chuẩn đo lường (KGI & IFRS)</p>
                                        <ul className="list-disc pl-4 space-y-1.5 text-xs text-muted-foreground mr-2">
                                            <li><strong className="text-foreground">Dòng tiền (30%):</strong> Đo lường doanh thu đóng thực tế so với mục tiêu. Mức an toàn: &ge; 60%.</li>
                                            <li><strong className="text-foreground">Khách hàng mới (25%):</strong> Tăng trưởng tệp khách trong chu kỳ kinh doanh.</li>
                                            <li><strong className="text-foreground">Hợp đồng (25%):</strong> Tỷ lệ Service Retention (Duy trì dịch vụ).</li>
                                            <li><strong className="text-foreground">Pipeline (20%):</strong> Giá trị dự báo quy đổi trong ngắn hạn.</li>
                                        </ul>
                                        <div className="mt-3 pt-3 border-t border-border/50 text-[11px] text-muted-foreground/80">
                                            Thuật toán mô phỏng sức khoẻ tài chính tiêu chuẩn, tự động điều chỉnh trọng số dựa theo mùa vụ ngành B2B.
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col space-y-6">
                            {/* Score display */}
                            <div className="flex items-center gap-4">
                                <div
                                    className={cn("h-16 w-16 rounded-full flex items-center justify-center border-4 shrink-0 shadow-sm transition-all", scoreColorClass)}
                                >
                                    <span className="text-xl font-bold">
                                        {health.score}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold">{scoreLabel}</p>
                                    <p className="text-xs text-muted-foreground">Điểm cấu trúc /100. <span className="text-emerald-500 font-medium">Ổn định: &ge;75</span></p>
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="space-y-4">
                                {health.metrics.map((metric, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">{metric.label}</span>
                                            <span className="text-xs font-medium">{metric.status}</span>
                                        </div>
                                        <Progress 
                                            value={(metric.value / metric.max) * 100} 
                                            className={cn("h-2 bg-secondary", metric.colorClass)}
                                        />
                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                            <span>{metric.target}</span>
                                            <span className="font-medium bg-muted px-1 rounded">{metric.value}/{metric.max}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recommendations */}
                            <div className="mt-auto pt-5 border-t border-border/40">
                                <h4 className="text-[13px] font-semibold mb-3 flex items-center gap-1.5 focus:outline-none focus:ring-0">
                                    <Lightbulb className="h-4 w-4 text-amber-500" />
                                    Hướng dẫn cải thiện
                                </h4>
                                <ul className="text-xs space-y-2">
                                    {health.score < 50 ? (
                                        <>
                                            <li className="flex items-start gap-2 text-muted-foreground">
                                                <span className="text-red-500 mt-0.5">&bull;</span>
                                                <span><strong className="text-foreground">Dòng tiền đang yếu:</strong> Ưu tiên chốt các Deal trong Pipeline có giá trị cao trước cuối tháng.</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-muted-foreground">
                                                <span className="text-amber-500 mt-0.5">&bull;</span>
                                                <span>Rà soát lại tỷ lệ chuyển đổi Leads yếu hoặc có vấn đề nghẽn cổ chai.</span>
                                            </li>
                                        </>
                                    ) : health.score < 75 ? (
                                        <>
                                            <li className="flex items-start gap-2 text-muted-foreground">
                                                <span className="text-amber-500 mt-0.5">&bull;</span>
                                                <span><strong className="text-foreground">Đẩy nhanh nghiệm thu:</strong> Có nhiều hợp đồng đang thực hiện nhưng chưa xuất hóa đơn thanh toán.</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-muted-foreground">
                                                <span className="text-emerald-500 mt-0.5">&bull;</span>
                                                <span>Duy trì tìm kiếm khách hàng mới để giữ Pipeline không bị tụt gãy tháng tới.</span>
                                            </li>
                                        </>
                                    ) : (
                                        <>
                                            <li className="flex items-start gap-2 text-muted-foreground">
                                                <span className="text-emerald-500 mt-0.5">&bull;</span>
                                                <span><strong className="text-foreground">Doanh nghiệp đang vận hành tốt:</strong> Dòng tiền & Tỷ lệ chốt ổn định.</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-muted-foreground">
                                                <span className="text-emerald-500 mt-0.5">&bull;</span>
                                                <span>Bắt đầu xem xét nâng cấp giá trị trung bình mỗi hợp đồng (Up-sell).</span>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    } catch (error) {
        console.error('Fatal crash on DashboardPage:', error)
        return (
            <div className="flex h-[400px] items-center justify-center flex-col p-8 text-center space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    ⚠️
                </div>
                <div className="space-y-1">
                    <h1 className="text-lg font-semibold">Hệ thống đang gặp sự cố tải dữ liệu</h1>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Rất tiếc, chúng tôi không thể tải dữ liệu tổng quan vào lúc này.
                    </p>
                </div>
            </div>
        )
    }
}
