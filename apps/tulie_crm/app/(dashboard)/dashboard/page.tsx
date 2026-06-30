import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { RecentActivities } from '@/components/dashboard/recent-activities'
import { CRMAlerts } from '@/components/dashboard/crm-alerts'
import { formatCurrency } from '@/lib/utils/format'
import { getActiveContractTimelines, getDashboardStats, getRevenueChartData, getCRMAlerts } from '@/lib/supabase/services/dashboard-service'
import { getRecentActivities } from '@/lib/supabase/services/activity-service'
import { ActiveContractTimeline } from '@/components/dashboard/active-contract-timeline'
import { Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui'
import { Progress } from '@repo/ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui'
import { Info, Lightbulb, AlertTriangle, Landmark, FileText, Users, ShoppingBag, Activity, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

function calculateHealthScore(stats: any, dealStats: any) {
    let score = 0
    const metrics: { label: string; value: number; max: number; status: string; colorClass: string; target: string }[] = []

    // 1. Revenue score (0-30): based on monthly revenue vs target
    const TARGET_REVENUE = stats.revenue.targets?.month || 50000000
    const currentMonthRevenue = stats.revenue.month || 0
    const revenueScore = Math.min(Math.round((currentMonthRevenue / TARGET_REVENUE) * 30), 30)
    score += revenueScore
    
    // Status text depending on percentage of monthly target achieved
    const achPercent = TARGET_REVENUE > 0 ? (currentMonthRevenue / TARGET_REVENUE) * 100 : 0
    const statusText = achPercent >= 90 
        ? 'Tốt' 
        : achPercent >= 50 
            ? 'Trung bình' 
            : currentMonthRevenue > 0 
                ? 'Yếu' 
                : 'Chưa có'

    metrics.push({
        label: 'Dòng tiền',
        value: revenueScore,
        max: 30,
        status: statusText,
        colorClass: '[&>div]:bg-indigo-500',
        target: `Mục tiêu: ${formatCurrency(TARGET_REVENUE)}/tháng`
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
        colorClass: '[&>div]:bg-blue-500',
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
        colorClass: '[&>div]:bg-emerald-500',
        target: `Mục tiêu: ${TARGET_CONTRACTS} hợp đồng`
    })

    return { score, metrics }
}

function getScoreColorClass(score: number): string {
    if (score >= 75) return 'text-emerald-600 border-emerald-500 dark:text-emerald-400 dark:border-emerald-400'
    if (score >= 50) return 'text-blue-600 border-blue-500 dark:text-blue-400 dark:border-blue-400'
    if (score >= 25) return 'text-amber-600 border-amber-500 dark:text-amber-400 dark:border-amber-400'
    return 'text-red-600 border-red-500 dark:text-red-400 dark:border-red-400'
}

function getScoreLabel(score: number): string {
    if (score >= 75) return 'Xuất sắc'
    if (score >= 50) return 'Tốt'
    if (score >= 25) return 'Cần cải thiện'
    return 'Cần hành động'
}

interface MetricCardProps {
    title: string
    value: string | number
    glow: "coral" | "emerald" | "blue" | "violet"
    icon: any
    iconColor: string
    iconBg: string
    footer: React.ReactNode | null
    trend?: { value: number; label: string }
}

function MetricCard({
    title,
    value,
    glow,
    icon: Icon,
    iconColor,
    iconBg,
    footer,
    trend,
}: MetricCardProps) {
    const isPositive = trend && trend.value > 0
    const isNegative = trend && trend.value < 0

    return (
        <Card glow={glow} className="border border-border/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_32px_-8px_rgba(0,0,0,0.06)] transition-all">
            <CardContent className="p-4 flex flex-col justify-between min-h-[100px]">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-muted-foreground">{title}</span>
                    <div className={cn("p-1 rounded-lg border shrink-0", iconBg)}>
                        <Icon className={cn("size-3.5", iconColor)} />
                    </div>
                </div>
                <div className="mt-1 flex-1 flex flex-col justify-end">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                        <h3 className="text-lg font-bold text-foreground leading-none">{value}</h3>
                        {trend && trend.value !== 0 && (
                            <span className={cn(
                                "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold font-mono border shrink-0",
                                isPositive 
                                    ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-250/20" 
                                    : "bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 border-red-250/20"
                            )}>
                                {isPositive ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
                                {Math.abs(trend.value).toFixed(0)}%
                                <span className="text-[8px] font-medium text-muted-foreground/85 ml-0.5">{trend.label}</span>
                            </span>
                        )}
                    </div>
                    {footer && (
                        <div className="mt-2 text-[10px] text-muted-foreground border-t border-border/40 pt-1.5 leading-snug flex items-center justify-between w-full font-semibold">
                            {footer}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default async function DashboardPage() {
    try {
        const [stats, chartData, recentActivities, crmAlerts, activeContractTimelines] = await Promise.all([
            getDashboardStats(),
            getRevenueChartData(),
            getRecentActivities(),
            getCRMAlerts(),
            getActiveContractTimelines()
        ])

        const health = calculateHealthScore(stats, null)
        const scoreColorClass = getScoreColorClass(health.score)
        const scoreLabel = getScoreLabel(health.score)

        // Lấy các tỷ lệ tăng trưởng thực tế từ dữ liệu
        const b2bMonthGrowth = stats.revenue.b2b_month_growth || 0
        const b2bQuarterGrowth = stats.revenue.b2b_quarter_growth || 0
        const b2cMonthGrowth = stats.revenue.b2c_month_growth || 0
        const b2cQuarterGrowth = stats.revenue.b2c_quarter_growth || 0

        const customerGrowth = stats.customers.total > 0
            ? (stats.customers.new / stats.customers.total) * 100
            : 0

        return (
            <div className="space-y-6 max-w-[1600px] mx-auto w-full pb-8">
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
                    <div className="flex flex-col gap-0.5">
                        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                        <p className="text-xs text-muted-foreground">Tổng quan hoạt động kinh doanh Tulie Agency</p>
                    </div>
                </div>

                {/* B2B Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                        <h2 className="text-xs font-bold text-zinc-500 flex items-center gap-1.5">
                            <Landmark className="size-3.5" />
                            B2B · Doanh nghiệp
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        <MetricCard 
                            title="Doanh thu B2B" 
                            value={formatCurrency(stats.revenue.b2b)} 
                            glow="coral"
                            icon={Landmark}
                            iconColor="text-orange-500"
                            iconBg="bg-orange-50 border border-orange-100"
                            trend={b2bMonthGrowth !== 0 ? { value: b2bMonthGrowth, label: 'MoM' } : undefined}
                            footer={null}
                        />
                        <MetricCard 
                            title="Tháng này" 
                            value={formatCurrency(stats.revenue.b2b_month)} 
                            glow="coral"
                            icon={Calendar}
                            iconColor="text-orange-500"
                            iconBg="bg-orange-50 border border-orange-100"
                            trend={b2bMonthGrowth !== 0 ? { value: b2bMonthGrowth, label: 'MoM' } : undefined}
                            footer={null}
                        />
                        <MetricCard 
                            title="Quý này" 
                            value={formatCurrency(stats.revenue.b2b_quarter)} 
                            glow="coral"
                            icon={Calendar}
                            iconColor="text-orange-500"
                            iconBg="bg-orange-50 border border-orange-100"
                            trend={b2bQuarterGrowth !== 0 ? { value: b2bQuarterGrowth, label: 'QoQ' } : undefined}
                            footer={null}
                        />
                        <MetricCard 
                            title="Giá trị hợp đồng" 
                            value={formatCurrency(stats.contracts.total_value)} 
                            glow="emerald"
                            icon={FileText}
                            iconColor="text-emerald-500"
                            iconBg="bg-emerald-50 border border-emerald-100"
                            footer={
                                <>
                                    <span>Đang chạy: <strong>{stats.contracts.active}</strong></span>
                                    <span>Chờ ký: <strong>{stats.contracts.pending}</strong></span>
                                </>
                            }
                        />
                        <MetricCard 
                            title="Khách hàng B2B" 
                            value={stats.customers.total.toString()} 
                            glow="blue"
                            icon={Users}
                            iconColor="text-blue-500"
                            iconBg="bg-blue-50 border border-blue-100"
                            trend={customerGrowth > 0 ? { value: customerGrowth, label: 'mới' } : undefined}
                            footer={
                                <>
                                    <span>Mới: <strong>{stats.customers.new}</strong></span>
                                    <span>Chốt: <strong>{stats.conversion_rate}%</strong></span>
                                </>
                            }
                        />
                    </div>
                </div>

                {/* B2C Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                        <h2 className="text-xs font-bold text-zinc-500 flex items-center gap-1.5">
                            <ShoppingBag className="size-3.5" />
                            B2C · Bán lẻ
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        <MetricCard 
                            title="Doanh thu bán lẻ" 
                            value={formatCurrency(stats.revenue.b2c)} 
                            glow="violet"
                            icon={ShoppingBag}
                            iconColor="text-purple-500"
                            iconBg="bg-purple-50 border border-purple-100"
                            trend={b2cMonthGrowth !== 0 ? { value: b2cMonthGrowth, label: 'MoM' } : undefined}
                            footer={null}
                        />
                        <MetricCard 
                            title="Tháng này" 
                            value={formatCurrency(stats.revenue.b2c_month)} 
                            glow="violet"
                            icon={Calendar}
                            iconColor="text-purple-500"
                            iconBg="bg-purple-50 border border-purple-100"
                            trend={b2cMonthGrowth !== 0 ? { value: b2cMonthGrowth, label: 'MoM' } : undefined}
                            footer={null}
                        />
                        <MetricCard 
                            title="Quý này" 
                            value={formatCurrency(stats.revenue.b2c_quarter)} 
                            glow="violet"
                            icon={Calendar}
                            iconColor="text-purple-500"
                            iconBg="bg-purple-50 border border-purple-100"
                            trend={b2cQuarterGrowth !== 0 ? { value: b2cQuarterGrowth, label: 'QoQ' } : undefined}
                            footer={null}
                        />
                        <MetricCard 
                            title="Đơn hàng retail" 
                            value={stats.retail.orders.toString()} 
                            glow="coral"
                            icon={ShoppingBag}
                            iconColor="text-orange-500"
                            iconBg="bg-orange-50 border border-orange-100"
                            footer={
                                <>
                                    <span>Đơn giá TB: <strong>{formatCurrency(stats.retail.orders > 0 ? stats.revenue.b2c / stats.retail.orders : 0)}</strong></span>
                                </>
                            }
                        />
                        <MetricCard 
                            title="Hiệu suất tài chính" 
                            value={`${stats.efficiency_score}%`} 
                            glow="emerald"
                            icon={Activity}
                            iconColor="text-emerald-500"
                            iconBg="bg-emerald-50 border border-emerald-100"
                            footer={
                                <>
                                    <span>Thu hồi: <strong>{stats.efficiency_score}%</strong></span>
                                    <span>Sức khỏe: <strong>{stats.health_score}/100</strong></span>
                                </>
                            }
                        />
                    </div>
                </div>

                {/* Contract timeline */}
                <ActiveContractTimeline contracts={activeContractTimelines as any} />

                {/* Charts */}
                <div className="flex flex-col md:grid md:grid-cols-1 gap-4">
                    <RevenueChart data={chartData} />
                </div>

                {/* Bottom Section: Operations & Business Health */}
                <div className="grid gap-5 lg:grid-cols-12">
                    <div className="lg:col-span-8">
                        <Card className="flex flex-col h-full border border-border/50">
                            <Tabs defaultValue="alerts" className="flex flex-col h-full">
                                <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
                                    <span className="text-xs font-bold text-muted-foreground">
                                        Vận hành hệ thống
                                    </span>
                                    <TabsList className="h-7.5 w-[240px] grid grid-cols-2 rounded-full p-0.5 bg-secondary/50 border border-border/30">
                                        <TabsTrigger value="alerts" className="text-[10px] py-1 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-xs">
                                            Cần xử lý ({crmAlerts.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="activities" className="text-[10px] py-1 rounded-full data-[state=active]:bg-white data-[state=active]:shadow-xs">
                                            Hoạt động
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                                <TabsContent value="alerts" className="m-0 flex-1 flex flex-col">
                                    <CRMAlerts alerts={crmAlerts} hideCard />
                                </TabsContent>
                                <TabsContent value="activities" className="m-0 flex-1 flex flex-col">
                                    <RecentActivities data={recentActivities} hideCard />
                                </TabsContent>
                            </Tabs>
                        </Card>
                    </div>

                    {/* Business Health Card */}
                    <Card glow="coral" className="lg:col-span-4 flex flex-col h-full border border-border/50">
                        <CardHeader className="pb-2 pt-3.5 px-4 flex flex-row items-center justify-between border-b border-border/40">
                            <CardTitle className="text-xs font-bold text-foreground">Sức khỏe doanh nghiệp</CardTitle>
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
                                        </ul>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col space-y-4 px-4 pb-4 pt-3">
                            {/* Score circular segmented dial gauge */}
                            <div className="relative flex flex-col items-center justify-center py-2 shrink-0">
                                <svg width="180" height="100" viewBox="0 0 200 110" className="overflow-visible">
                                    {Array.from({ length: 25 }).map((_, idx) => {
                                        const angle = 180 - (idx * 180) / 24
                                        const rad = (angle * Math.PI) / 180
                                        const rInner = 75
                                        const rOuter = 88
                                        const x1 = 100 + rInner * Math.cos(rad)
                                        const y1 = 105 - rInner * Math.sin(rad)
                                        const x2 = 100 + rOuter * Math.cos(rad)
                                        const y2 = 105 - rOuter * Math.sin(rad)
                                        
                                        const percent = (idx / 24) * 100
                                        const isActive = percent <= health.score
                                        
                                        return (
                                            <line
                                                key={idx}
                                                x1={x1}
                                                y1={y1}
                                                x2={x2}
                                                y2={y2}
                                                stroke={isActive ? "var(--primary)" : "#ECE8E3"}
                                                strokeWidth={isActive ? "3" : "1.8"}
                                                strokeLinecap="round"
                                            />
                                        )
                                    })}
                                </svg>
                                <div className="absolute top-[55px] flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-foreground leading-none">
                                        {health.score}
                                    </span>
                                    <span className={cn("text-[10px] font-bold  mt-1.5 px-2.5 py-0.5 rounded-full border bg-white shadow-xs", scoreColorClass)}>
                                        {scoreLabel}
                                    </span>
                                </div>
                            </div>

                            {/* Details Metrics */}
                            <div className="space-y-2.5">
                                {health.metrics.map((metric, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-foreground">{metric.label}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground">{metric.status}</span>
                                        </div>
                                        <Progress 
                                            value={(metric.value / metric.max) * 100} 
                                            className={cn("h-1.5 bg-secondary", metric.colorClass)}
                                        />
                                        <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                                            <span>{metric.target}</span>
                                            <span className="font-bold px-1 rounded bg-secondary/50 text-[10px]">{metric.value}/{metric.max}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Improvement recommendations */}
                            <div className="pt-2 border-t border-border/40 mt-auto">
                                <h4 className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                                    <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                                    Hướng dẫn cải thiện
                                </h4>
                                <ul className="text-[10.5px] space-y-1.5 font-semibold text-muted-foreground">
                                    {health.score < 50 ? (
                                        <>
                                            <li className="flex items-start gap-1 leading-snug">
                                                <span className="text-red-500 mt-0.5">•</span>
                                                <span><strong className="text-foreground">Dòng tiền đang yếu:</strong> Ưu tiên chốt các Deal có giá trị cao trước cuối tháng.</span>
                                            </li>
                                            <li className="flex items-start gap-1 leading-snug">
                                                <span className="text-amber-500 mt-0.5">•</span>
                                                <span>Rà soát lại các leads yếu có nguy cơ gây tắc nghẽn.</span>
                                            </li>
                                        </>
                                    ) : health.score < 75 ? (
                                        <>
                                            <li className="flex items-start gap-1 leading-snug">
                                                <span className="text-amber-500 mt-0.5">•</span>
                                                <span><strong className="text-foreground">Đẩy nhanh nghiệm thu:</strong> Xuất hóa đơn cho các hợp đồng đã thực hiện.</span>
                                            </li>
                                            <li className="flex items-start gap-1 leading-snug">
                                                <span className="text-emerald-500 mt-0.5">•</span>
                                                <span>Duy trì tệp leads mới để giữ nhịp tăng trưởng.</span>
                                            </li>
                                        </>
                                    ) : (
                                        <>
                                            <li className="flex items-start gap-1 leading-snug">
                                                <span className="text-emerald-500 mt-0.5">•</span>
                                                <span><strong className="text-foreground">Đang vận hành tốt:</strong> Duy trì quy trình chăm sóc khách hàng tự động để giữ chân đối tác.</span>
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
        console.error('Error rendering dashboard:', error)
        return (
            <div className="p-8 border border-red-200/50 rounded-2xl bg-red-50/50 text-red-700 flex flex-col items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <h3 className="font-bold text-sm">Lỗi tải dữ liệu Dashboard</h3>
                <p className="text-xs text-red-650">Vui lòng kiểm tra lại kết nối cơ sở dữ liệu Supabase hoặc tải lại trang.</p>
            </div>
        )
    }
}
