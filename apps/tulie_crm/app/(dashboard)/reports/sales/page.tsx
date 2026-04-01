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
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/reports">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Báo cáo bán hàng</h1>
                    <p className="text-muted-foreground">Chi tiết doanh thu và hiệu suất bán hàng</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Tổng doanh thu</p>
                                <p className="text-2xl font-bold mt-1">{formatCurrency(stats.revenue.total)}</p>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            12 tháng: {totalRevenue12m.toFixed(1)}tr VNĐ
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Chờ thanh toán</p>
                                <p className="text-2xl font-bold mt-1 text-amber-600">{formatCurrency(stats.revenue.change)}</p>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                <Receipt className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {stats.invoices.pending} hóa đơn pending
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Hợp đồng đang chạy</p>
                                <p className="text-2xl font-bold mt-1">{stats.contracts.active}</p>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Giá trị: {formatCurrency(stats.contracts.change)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Tỉ lệ chuyển đổi</p>
                                <p className="text-2xl font-bold mt-1">{stats.conversion_rate}%</p>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <Target className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Hiệu quả thu tiền: {stats.efficiency_score}%
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Doanh thu & Chi phí 12 tháng (triệu VNĐ)</CardTitle>
                </CardHeader>
                <CardContent>
                    <SalesCharts revenueData={revenueChartData} />
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                {/* Deal Pipeline */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Pipeline cơ hội</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pipelineStages.length > 0 ? (
                            <div className="space-y-3">
                                {pipelineStages.map(stage => {
                                    const maxVal = Math.max(...pipelineStages.map(s => s.value), 1)
                                    const widthPct = Math.max((stage.value / maxVal) * 100, 4)
                                    return (
                                        <div key={stage.name} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{stage.name}</span>
                                                <span className="text-muted-foreground">{formatCurrency(stage.value)}</span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${stage.color} transition-all duration-700`}
                                                    style={{ width: `${widthPct}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                                {dealStats && (
                                    <div className="pt-3 mt-3 border-t flex justify-between text-sm">
                                        <span className="font-semibold">Tổng tiềm năng</span>
                                        <span className="font-bold">{formatCurrency(dealStats.total_potential)}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Chưa có dữ liệu cơ hội.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Giao dịch gần đây</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentTransactions.length > 0 ? (
                            <div className="space-y-3">
                                {recentTransactions.slice(0, 8).map((tx: any) => (
                                    <div key={tx.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${tx.type === 'income' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                                {tx.type === 'income' ? (
                                                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                                                ) : (
                                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{tx.description}</p>
                                                <p className="text-xs text-muted-foreground">{tx.date ? new Date(tx.date).toLocaleDateString('vi-VN') : '—'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                            </p>
                                            <Badge variant={tx.status === 'paid' ? 'default' : 'secondary'} className="text-[10px]">
                                                {tx.status === 'paid' ? 'Đã TT' : tx.status === 'sent' ? 'Đã gửi' : tx.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Chưa có giao dịch nào.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Health Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Sức khỏe doanh nghiệp</p>
                        <p className="text-4xl font-bold">
                            {stats.health_score}
                            <span className="text-lg text-muted-foreground font-medium">/100</span>
                        </p>
                        <Badge className="mt-2" variant={stats.health_score >= 80 ? 'default' : stats.health_score >= 50 ? 'secondary' : 'destructive'}>
                            {stats.health_score >= 80 ? 'Ổn định' : stats.health_score >= 50 ? 'Cần chú ý' : 'Báo động'}
                        </Badge>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Lợi nhuận 12 tháng</p>
                        <p className={`text-4xl font-bold ${totalProfit12m >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {totalProfit12m.toFixed(1)}
                            <span className="text-lg text-muted-foreground font-medium">tr</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Thu: {totalRevenue12m.toFixed(1)}tr &mdash; Chi: {totalExpenses12m.toFixed(1)}tr
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Hiệu quả thu tiền</p>
                        <p className="text-4xl font-bold">
                            {stats.efficiency_score}
                            <span className="text-lg text-muted-foreground font-medium">%</span>
                        </p>
                        <div className="h-2 bg-muted rounded-full overflow-hidden mt-3">
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
