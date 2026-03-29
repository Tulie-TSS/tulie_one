import { StatsCard } from '@/components/dashboard/stats-card'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { RecentActivities } from '@/components/dashboard/recent-activities'
import { CRMAlerts } from '@/components/dashboard/crm-alerts'
import { formatCurrency } from '@/lib/utils/format'
import { Users, FileSignature, Receipt, Wallet } from 'lucide-react'
import { getDashboardStats, getRevenueChartData, getDealStats, getCRMAlerts } from '@/lib/supabase/services/dashboard-service'
import { getRecentActivities } from '@/lib/supabase/services/activity-service'
import { DealProjectionChart } from '@/components/dashboard/deal-projection-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { Progress, Badge } from '@repo/ui'
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
        colorClass: stats.revenue.total > 30000000 ? '[&>div]:bg-emerald-500' : stats.revenue.total > 10000000 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500',
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
        colorClass: stats.customers.new >= 3 ? '[&>div]:bg-emerald-500' : stats.customers.new >= 1 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500',
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
        colorClass: stats.contracts.active >= 3 ? '[&>div]:bg-emerald-500' : stats.contracts.active >= 1 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500',
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
        colorClass: pipelineValue > 30000000 ? '[&>div]:bg-emerald-500' : pipelineValue > 5000000 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500',
        target: `Mục tiêu: ${formatCurrency(TARGET_PIPELINE)}`
    })

    return { score, metrics }
}

function getScoreColorClass(score: number): string {
    if (score >= 75) return 'text-emerald-500 border-emerald-500'
    if (score >= 50) return 'text-amber-500 border-amber-500'
    if (score >= 25) return 'text-orange-500 border-orange-500'
    return 'text-red-500 border-red-500'
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
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Doanh thu tổng"
                        value={formatCurrency(stats.revenue.total)}
                        change={stats.revenue.change}
                        changeLabel={stats.revenue.period}
                        icon={<Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                    />
                    <StatsCard
                        title="Tổng khách hàng"
                        value={stats.customers.total.toString()}
                        change={stats.customers.change}
                        changeLabel="so với tháng trước"
                        icon={<Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                    />
                    <StatsCard
                        title="Hợp đồng đang thực hiện"
                        value={stats.contracts.active.toString()}
                        change={stats.contracts.change}
                        changeLabel="Tổng giá trị HĐ"
                        icon={<FileSignature className="h-4 w-4 text-sky-600 dark:text-sky-400" />}
                    />
                    <StatsCard
                        title="Hóa đơn chờ thanh toán"
                        value={stats.invoices.pending.toString()}
                        icon={<Receipt className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
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
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium">Sức khỏe doanh nghiệp</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Score display */}
                            <div className="flex items-center gap-4">
                                <div
                                    className={cn("h-16 w-16 rounded-full flex items-center justify-center border-4 shrink-0", scoreColorClass)}
                                >
                                    <span className="text-xl font-bold">
                                        {health.score}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold">{scoreLabel}</p>
                                    <p className="text-xs text-muted-foreground">Điểm sức khỏe tổng thể /100</p>
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="space-y-4">
                                {health.metrics.map((metric, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">{metric.label}</span>
                                            <span className="text-xs text-muted-foreground">{metric.status}</span>
                                        </div>
                                        <Progress 
                                            value={(metric.value / metric.max) * 100} 
                                            className={cn("h-2", metric.colorClass)}
                                        />
                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                            <span>{metric.target}</span>
                                            <span className="font-medium">{metric.value}/{metric.max} điểm</span>
                                        </div>
                                    </div>
                                ))}
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
