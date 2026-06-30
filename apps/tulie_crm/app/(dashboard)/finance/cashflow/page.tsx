import { getCashFlowData, getRecentTransactions } from '@/lib/supabase/services/finance-service'
import { formatCurrency } from '@/lib/utils/format'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { ArrowDownLeft, ArrowUpRight, TrendingUp, PieChart, Wallet, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { CashFlowCharts } from './cashflow-charts'

export const dynamic = 'force-dynamic'

export default async function CashFlowPage() {
    try {
        const [cashFlowData, recentTxns] = await Promise.all([
            getCashFlowData(12),
            getRecentTransactions(20),
        ])

        // Summary calculations
        const totalInflow = cashFlowData.reduce((s, m) => s + m.inflow, 0) * 1000000
        const totalOutflow = cashFlowData.reduce((s, m) => s + m.outflow, 0) * 1000000
        const netCashFlow = totalInflow - totalOutflow
        const lastMonth = cashFlowData[cashFlowData.length - 1]

        return (
            <div className="space-y-6 max-w-[1600px] mx-auto w-full pb-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center text-white shadow-sm shrink-0">
                            <Wallet className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <h1 className="text-2xl font-bold text-foreground">Dòng tiền</h1>
                            <p className="text-xs text-muted-foreground">Cash Flow — Theo dõi dòng tiền vào/ra qua SePay & chi phí</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/finance"
                            className="px-4 py-1.5 rounded-full text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all border border-border/40 flex items-center gap-1.5"
                        >
                            <PieChart className="size-3.5" />
                            Xem P&L
                        </Link>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card glow="emerald" className="border border-border/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.03)]">
                        <CardContent className="p-4 flex flex-col justify-between min-h-[100px]">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-semibold text-muted-foreground">Tổng tiền vào</span>
                                <div className="p-1 rounded-lg border bg-emerald-50 border-emerald-100 shrink-0">
                                    <ArrowDownLeft className="size-3.5 text-emerald-500" />
                                </div>
                            </div>
                            <div className="mt-1 flex-1 flex flex-col justify-end">
                                <h3 className="text-lg font-bold text-emerald-600 leading-none">{formatCurrency(totalInflow)}</h3>
                                <div className="mt-2 text-[10px] text-muted-foreground border-t border-border/40 pt-1.5 leading-snug font-semibold">
                                    12 tháng gần nhất
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card glow="coral" className="border border-border/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.03)]">
                        <CardContent className="p-4 flex flex-col justify-between min-h-[100px]">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-semibold text-muted-foreground">Tổng tiền ra</span>
                                <div className="p-1 rounded-lg border bg-orange-50 border-orange-100 shrink-0">
                                    <ArrowUpRight className="size-3.5 text-orange-500" />
                                </div>
                            </div>
                            <div className="mt-1 flex-1 flex flex-col justify-end">
                                <h3 className="text-lg font-bold text-orange-600 leading-none">{formatCurrency(totalOutflow)}</h3>
                                <div className="mt-2 text-[10px] text-muted-foreground border-t border-border/40 pt-1.5 leading-snug font-semibold">
                                    SePay out + chi phí thủ công
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card glow={netCashFlow >= 0 ? "emerald" : "coral"} className="border border-border/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.03)]">
                        <CardContent className="p-4 flex flex-col justify-between min-h-[100px]">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-semibold text-muted-foreground">Số dư ròng</span>
                                <div className={cn("p-1 rounded-lg border shrink-0", netCashFlow >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100")}>
                                    <Wallet className={cn("size-3.5", netCashFlow >= 0 ? "text-emerald-500" : "text-red-500")} />
                                </div>
                            </div>
                            <div className="mt-1 flex-1 flex flex-col justify-end">
                                <h3 className={cn("text-lg font-bold  leading-none", netCashFlow >= 0 ? "text-emerald-600" : "text-red-600")}>
                                    {formatCurrency(netCashFlow)}
                                </h3>
                                <div className="mt-2 text-[10px] text-muted-foreground border-t border-border/40 pt-1.5 leading-snug font-semibold">
                                    Vào - Ra = Ròng
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card glow="blue" className="border border-border/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.03)]">
                        <CardContent className="p-4 flex flex-col justify-between min-h-[100px]">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-semibold text-muted-foreground">Tháng gần nhất</span>
                                <div className="p-1 rounded-lg border bg-blue-50 border-blue-100 shrink-0">
                                    <Activity className="size-3.5 text-blue-500" />
                                </div>
                            </div>
                            <div className="mt-1 flex-1 flex flex-col justify-end">
                                <h3 className={cn("text-lg font-bold  leading-none", (lastMonth?.net || 0) >= 0 ? "text-foreground" : "text-red-600")}>
                                    {lastMonth ? formatCurrency(lastMonth.net * 1000000) : '0 đ'}
                                </h3>
                                <div className="mt-2 text-[10px] text-muted-foreground border-t border-border/40 pt-1.5 leading-snug font-semibold">
                                    Vào: {lastMonth ? formatCurrency(lastMonth.inflow * 1000000) : '0'} · Ra: {lastMonth ? formatCurrency(lastMonth.outflow * 1000000) : '0'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts + Recent Transactions */}
                <CashFlowCharts cashFlowData={cashFlowData} recentTransactions={recentTxns} />
            </div>
        )
    } catch (error) {
        console.error('Error rendering cashflow page:', error)
        return (
            <div className="p-8 border border-red-200/50 rounded-2xl bg-red-50/50 text-red-700 flex flex-col items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <h3 className="font-bold text-sm">Lỗi tải dữ liệu Dòng tiền</h3>
                <p className="text-xs">Vui lòng kiểm tra kết nối cơ sở dữ liệu.</p>
            </div>
        )
    }
}
