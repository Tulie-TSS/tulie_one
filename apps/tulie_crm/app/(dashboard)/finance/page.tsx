import { getFinancePnL, getPnLMonthly, getExpenseBreakdown } from '@/lib/supabase/services/finance-service'
import { formatCurrency } from '@/lib/utils/format'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { TrendingUp, TrendingDown, DollarSign, Receipt, Wallet, BarChart3, ArrowUpRight, ArrowDownRight, PieChart } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { PnLCharts } from './pnl-charts'

export const dynamic = 'force-dynamic'

interface FinanceMetricProps {
    title: string
    value: string
    subtitle?: string
    glow: "coral" | "emerald" | "blue" | "violet"
    icon: any
    iconColor: string
    iconBg: string
    trend?: { value: number; label: string }
    isNegative?: boolean
}

function FinanceMetric({ title, value, subtitle, glow, icon: Icon, iconColor, iconBg, trend, isNegative }: FinanceMetricProps) {
    const isPositive = trend && trend.value > 0
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
                        <h3 className={cn(
                            "text-lg font-bold  leading-none",
                            isNegative ? "text-red-600 dark:text-red-400" : "text-foreground"
                        )}>{value}</h3>
                        {trend && trend.value !== 0 && (
                            <span className={cn(
                                "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold font-mono border shrink-0",
                                isPositive
                                    ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-250/20"
                                    : "bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 border-red-250/20"
                            )}>
                                {isPositive ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
                                {Math.abs(trend.value).toFixed(1)}%
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <div className="mt-2 text-[10px] text-muted-foreground border-t border-border/40 pt-1.5 leading-snug font-semibold">
                            {subtitle}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default async function FinancePage() {
    try {
        const [pnlYear, pnlMonth, pnlQuarter, monthlyData, expenseBreakdown] = await Promise.all([
            getFinancePnL('year'),
            getFinancePnL('month'),
            getFinancePnL('quarter'),
            getPnLMonthly(12),
            getExpenseBreakdown('year'),
        ])

        return (
            <div className="space-y-6 max-w-[1600px] mx-auto w-full pb-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center text-white shadow-sm shrink-0">
                            <PieChart className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <h1 className="text-2xl font-bold text-foreground">Báo cáo P&L</h1>
                            <p className="text-xs text-muted-foreground">Lãi / Lỗ — Profit & Loss Statement</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/finance/cashflow"
                            className="px-4 py-1.5 rounded-full text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all border border-border/40 flex items-center gap-1.5"
                        >
                            <Wallet className="size-3.5" />
                            Xem dòng tiền
                        </Link>
                    </div>
                </div>

                {/* Year Summary — 4 key metrics */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-1 border-b border-border/60">
                        <h2 className="text-xs font-bold text-zinc-500 flex items-center gap-1.5">
                            <BarChart3 className="size-3.5" />
                            Tổng kết năm nay
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <FinanceMetric
                            title="Doanh thu"
                            value={formatCurrency(pnlYear.revenue)}
                            glow="blue"
                            icon={DollarSign}
                            iconColor="text-blue-500"
                            iconBg="bg-blue-50 border border-blue-100"
                            subtitle={`B2B: ${formatCurrency(pnlYear.revenue_b2b)} · B2C: ${formatCurrency(pnlYear.revenue_b2c)}`}
                        />
                        <FinanceMetric
                            title="Giá vốn (COGS)"
                            value={formatCurrency(pnlYear.cogs)}
                            glow="coral"
                            icon={Receipt}
                            iconColor="text-orange-500"
                            iconBg="bg-orange-50 border border-orange-100"
                            subtitle={`CTV: ${formatCurrency(pnlYear.cogs_ctv)} · Mua vào: ${formatCurrency(pnlYear.cogs_input_invoices)}`}
                        />
                        <FinanceMetric
                            title="Lãi gộp"
                            value={formatCurrency(pnlYear.gross_profit)}
                            glow="emerald"
                            icon={TrendingUp}
                            iconColor="text-emerald-500"
                            iconBg="bg-emerald-50 border border-emerald-100"
                            trend={{ value: pnlYear.gross_margin, label: '' }}
                            isNegative={pnlYear.gross_profit < 0}
                            subtitle={`Biên lãi gộp: ${pnlYear.gross_margin.toFixed(1)}%`}
                        />
                        <FinanceMetric
                            title="Lãi ròng"
                            value={formatCurrency(pnlYear.net_profit)}
                            glow={pnlYear.net_profit >= 0 ? "emerald" : "coral"}
                            icon={pnlYear.net_profit >= 0 ? TrendingUp : TrendingDown}
                            iconColor={pnlYear.net_profit >= 0 ? "text-emerald-500" : "text-red-500"}
                            iconBg={pnlYear.net_profit >= 0 ? "bg-emerald-50 border border-emerald-100" : "bg-red-50 border border-red-100"}
                            isNegative={pnlYear.net_profit < 0}
                            subtitle={`Biên lãi ròng: ${pnlYear.net_margin.toFixed(1)}% · OpEx: ${formatCurrency(pnlYear.opex)}`}
                        />
                    </div>
                </div>

                {/* Period comparison — month & quarter */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* This month */}
                    <Card glow="blue" className="border border-border/50">
                        <CardHeader className="pb-2 pt-3.5 px-4 border-b border-border/40">
                            <CardTitle className="text-xs font-bold text-foreground">Tháng này</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Doanh thu</span>
                                <span className="font-bold text-foreground">{formatCurrency(pnlMonth.revenue)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Giá vốn (COGS)</span>
                                <span className="font-bold text-orange-600">-{formatCurrency(pnlMonth.cogs)}</span>
                            </div>
                            <div className="border-t border-border/40 pt-2 flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Lãi gộp</span>
                                <span className={cn("font-bold", pnlMonth.gross_profit >= 0 ? "text-emerald-600" : "text-red-600")}>
                                    {formatCurrency(pnlMonth.gross_profit)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Chi phí vận hành</span>
                                <span className="font-bold text-orange-600">-{formatCurrency(pnlMonth.opex)}</span>
                            </div>
                            <div className="border-t border-border/60 pt-2 flex items-center justify-between text-sm">
                                <span className="font-bold text-foreground">Lãi ròng</span>
                                <span className={cn("font-bold text-base", pnlMonth.net_profit >= 0 ? "text-emerald-600" : "text-red-600")}>
                                    {formatCurrency(pnlMonth.net_profit)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* This quarter */}
                    <Card glow="violet" className="border border-border/50">
                        <CardHeader className="pb-2 pt-3.5 px-4 border-b border-border/40">
                            <CardTitle className="text-xs font-bold text-foreground">Quý này</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Doanh thu</span>
                                <span className="font-bold text-foreground">{formatCurrency(pnlQuarter.revenue)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Giá vốn (COGS)</span>
                                <span className="font-bold text-orange-600">-{formatCurrency(pnlQuarter.cogs)}</span>
                            </div>
                            <div className="border-t border-border/40 pt-2 flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Lãi gộp</span>
                                <span className={cn("font-bold", pnlQuarter.gross_profit >= 0 ? "text-emerald-600" : "text-red-600")}>
                                    {formatCurrency(pnlQuarter.gross_profit)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Chi phí vận hành</span>
                                <span className="font-bold text-orange-600">-{formatCurrency(pnlQuarter.opex)}</span>
                            </div>
                            <div className="border-t border-border/60 pt-2 flex items-center justify-between text-sm">
                                <span className="font-bold text-foreground">Lãi ròng</span>
                                <span className={cn("font-bold text-base", pnlQuarter.net_profit >= 0 ? "text-emerald-600" : "text-red-600")}>
                                    {formatCurrency(pnlQuarter.net_profit)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <PnLCharts monthlyData={monthlyData} expenseBreakdown={expenseBreakdown} />
            </div>
        )
    } catch (error) {
        console.error('Error rendering finance page:', error)
        return (
            <div className="p-8 border border-red-200/50 rounded-2xl bg-red-50/50 text-red-700 flex flex-col items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <h3 className="font-bold text-sm">Lỗi tải dữ liệu Tài chính</h3>
                <p className="text-xs text-red-650">Vui lòng kiểm tra kết nối cơ sở dữ liệu hoặc tải lại trang.</p>
            </div>
        )
    }
}
