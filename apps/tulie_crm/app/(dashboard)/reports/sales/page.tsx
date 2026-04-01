import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { Button } from '@repo/ui'
import { Badge } from '@repo/ui'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, FileText, Target, Receipt } from 'lucide-react'
import Link from 'next/link'
import { getDashboardStats, getRevenueChartData, getDealStats, getRecentTransactions } from '@/lib/supabase/services/dashboard-service'
import { formatCurrency } from '@/lib/utils/format'
import { SalesCharts } from './sales-charts'

export default async function SalesReportPage() {
    const [stats, chartData, dealStats, recentTransactions] = await Promise.all([
        getDashboardStats(),
        getRevenueChartData(),
        getDealStats(),
        getRecentTransactions(),
    ])

    // Transform chart data for recharts (values are already in triệu)
    const revenueChartData = chartData.map(d => ({
        name: d.date,
        revenue: d.revenue,
        expenses: d.expenses,
        profit: d.profit,
    }))

    const totalRevenue12m = chartData.reduce((sum, d) => sum + d.revenue, 0)
    const totalExpenses12m = chartData.reduce((sum, d) => sum + d.expenses, 0)
    const totalProfit12m = totalRevenue12m - totalExpenses12m

    // Deal pipeline stages
    const pipelineStages = dealStats ? [
        { name: 'Mới', value: dealStats.new, color: 'bg-blue-500' },
        { name: 'Briefing', value: dealStats.briefing, color: 'bg-amber-500' },
        { name: 'Đã gửi BG', value: dealStats.proposal_sent, color: 'bg-purple-500' },
        { name: 'Thắng', value: dealStats.closed_won, color: 'bg-emerald-500' },
        { name: 'Thua', value: dealStats.closed_lost, color: 'bg-red-500' },
    ] : []

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild className="h-9 w-9">
                    <Link href="/reports">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Báo cáo bán hàng</h1>
                    <p className="text-sm text-muted-foreground mt-1">Chi tiết doanh thu và hiệu suất bán hàng</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.revenue.total)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            12 tháng: {totalRevenue12m.toFixed(1)} triệu VNĐ
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Chờ thanh toán</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.revenue.change)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.invoices.pending} hóa đơn pending
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Hợp đồng đang chạy</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.contracts.active}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Giá trị: {formatCurrency(stats.contracts.change)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Tỉ lệ chuyển đổi</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.conversion_rate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Hiệu quả thu tiền: {stats.efficiency_score}%
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Doanh thu & Chi phí 12 tháng (triệu VNĐ)</CardTitle>
                </CardHeader>
                <CardContent>
                    <SalesCharts revenueData={revenueChartData} />
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                {/* Deal Pipeline */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Pipeline cơ hội</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pipelineStages.length > 0 ? (
                            <div className="space-y-4">
                                {pipelineStages.map(stage => {
                                    const maxVal = Math.max(...pipelineStages.map(s => s.value), 1)
                                    const widthPct = Math.max((stage.value / maxVal) * 100, 4)
                                    return (
                                        <div key={stage.name} className="space-y-1.5">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium text-foreground">{stage.name}</span>
                                                <span className="text-muted-foreground font-mono text-xs">{formatCurrency(stage.value)}</span>
                                            </div>
                                            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-primary rounded-full transition-all duration-700`}
                                                    style={{ width: `${widthPct}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                                {dealStats && (
                                    <div className="pt-4 mt-4 border-t flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Tổng tiềm năng</span>
                                        <span className="font-semibold text-lg">{formatCurrency(dealStats.total_potential)}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <FileText className="h-8 w-8 text-muted-foreground/50 mb-3" />
                                <p className="text-sm text-muted-foreground">Chưa có dữ liệu cơ hội.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Giao dịch gần đây</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {recentTransactions.length > 0 ? (
                            <div className="space-y-4">
                                {recentTransactions.slice(0, 8).map((tx: any) => (
                                    <div key={tx.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                                                {tx.type === 'income' ? (
                                                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                                                ) : (
                                                    <TrendingDown className="h-4 w-4 text-destructive" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex flex-col">
                                                <span className="text-sm font-medium leading-none truncate">{tx.description}</span>
                                                <span className="text-xs text-muted-foreground mt-1">{tx.date ? new Date(tx.date).toLocaleDateString('vi-VN') : '—'}</span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 flex flex-col items-end">
                                            <span className={`text-sm font-medium leading-none ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                                                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                            </span>
                                            <Badge variant="outline" className="mt-1 font-normal text-[10px] px-1.5 py-0 h-4">
                                                {tx.status === 'paid' ? 'Đã TT' : tx.status === 'sent' ? 'Đã gửi' : tx.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                                <Receipt className="h-8 w-8 text-muted-foreground/50 mb-3" />
                                <p className="text-sm text-muted-foreground">Chưa có giao dịch nào.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Health Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <p className="text-sm font-medium text-muted-foreground mb-4">Sức khỏe doanh nghiệp</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold tracking-tight">{stats.health_score}</span>
                            <span className="text-sm font-medium text-muted-foreground">/100</span>
                        </div>
                        <Badge className="mt-4" variant={stats.health_score >= 80 ? 'default' : stats.health_score >= 50 ? 'secondary' : 'destructive'}>
                            {stats.health_score >= 80 ? 'Ổn định' : stats.health_score >= 50 ? 'Cần chú ý' : 'Báo động'}
                        </Badge>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <p className="text-sm font-medium text-muted-foreground mb-4">Lợi nhuận 12 tháng</p>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-4xl font-bold tracking-tight ${totalProfit12m >= 0 ? '' : 'text-destructive'}`}>
                                {totalProfit12m.toFixed(1)}
                            </span>
                            <span className="text-sm font-medium text-muted-foreground">triệu</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                            Thu: {totalRevenue12m.toFixed(1)}tr &mdash; Chi: {totalExpenses12m.toFixed(1)}tr
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <p className="text-sm font-medium text-muted-foreground mb-4">Hiệu quả thu tiền</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold tracking-tight">{stats.efficiency_score}</span>
                            <span className="text-sm font-medium text-muted-foreground">%</span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mt-4">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-700"
                                style={{ width: `${stats.efficiency_score}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
