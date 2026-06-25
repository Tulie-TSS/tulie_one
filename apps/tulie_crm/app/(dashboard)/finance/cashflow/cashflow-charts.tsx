'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { formatCurrency } from '@/lib/utils/format'
import { ArrowDownLeft, ArrowUpRight, Minus } from 'lucide-react'
import {
    BarChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ComposedChart,
    Area,
} from 'recharts'
import { CashFlowMonth } from '@/types'
import { cn } from '@/lib/utils'

interface CashFlowChartsProps {
    cashFlowData: CashFlowMonth[]
    recentTransactions: any[]
}

export function CashFlowCharts({ cashFlowData, recentTransactions }: CashFlowChartsProps) {
    const hasData = cashFlowData.some(d => d.inflow > 0 || d.outflow > 0)

    return (
        <div className="grid gap-4 lg:grid-cols-3">
            {/* Cash Flow Chart */}
            <Card glow="blue" className="lg:col-span-2 border border-border/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.04)]">
                <CardHeader className="pb-1.5 pt-3 px-4">
                    <CardTitle className="text-sm font-semibold">Dòng tiền theo tháng (triệu VND)</CardTitle>
                </CardHeader>
                <CardContent className="pt-1 px-4 pb-3">
                    {!hasData ? (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground text-xs">
                            <div className="text-center space-y-1.5">
                                <p className="text-2xl">💸</p>
                                <p>Chưa có dữ liệu dòng tiền</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={cashFlowData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.3} />
                                        </linearGradient>
                                        <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0.3} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="var(--color-border)" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
                                        tickMargin={8}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
                                        tickFormatter={(v) => v >= 1 ? `${v.toFixed(0)}M` : v > 0 ? `${(v * 1000).toFixed(0)}K` : '0'}
                                        width={40}
                                    />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="rounded-xl border bg-popover text-popover-foreground p-3 shadow-lg ring-1 ring-border/10">
                                                        <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
                                                        <div className="space-y-1">
                                                            {payload.map((entry, index) => (
                                                                <div key={index} className="flex items-center justify-between gap-6">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: entry.color }} />
                                                                        <span className="text-sm text-foreground">{entry.name}</span>
                                                                    </div>
                                                                    <span className="text-sm font-medium tabular-nums font-mono">
                                                                        {formatCurrency((entry.value as number) * 1000000)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )
                                            }
                                            return null
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="top"
                                        align="right"
                                        height={24}
                                        iconType="circle"
                                        iconSize={6}
                                        wrapperStyle={{ fontSize: 11, fontWeight: 500, color: 'var(--color-foreground)', marginTop: -10 }}
                                    />
                                    <Bar
                                        dataKey="inflow"
                                        name="Tiền vào"
                                        fill="url(#inflowGrad)"
                                        radius={[6, 6, 0, 0]}
                                        barSize={18}
                                    />
                                    <Bar
                                        dataKey="outflow"
                                        name="Tiền ra"
                                        fill="url(#outflowGrad)"
                                        radius={[6, 6, 0, 0]}
                                        barSize={18}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="cumulative"
                                        name="Tích lũy"
                                        stroke="#3b82f6"
                                        strokeWidth={2.5}
                                        dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
                                        activeDot={{ r: 5, strokeWidth: 0 }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card glow="emerald" className="border border-border/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.04)]">
                <CardHeader className="pb-1.5 pt-3 px-4">
                    <CardTitle className="text-sm font-semibold">Giao dịch gần đây</CardTitle>
                </CardHeader>
                <CardContent className="pt-1 px-4 pb-3">
                    {recentTransactions.length === 0 ? (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground text-xs">
                            <div className="text-center space-y-1.5">
                                <p className="text-2xl">🏦</p>
                                <p>Chưa có giao dịch SePay</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1">
                            {recentTransactions.map((tx, idx) => {
                                const isIn = tx.transfer_type === 'in'
                                const amount = isIn ? Number(tx.amount_in) || 0 : Number(tx.amount_out) || 0
                                const date = tx.transaction_date
                                    ? new Date(tx.transaction_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
                                    : '—'

                                return (
                                    <div key={tx.id || idx} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-b-0">
                                        <div className={cn(
                                            "p-1 rounded-lg shrink-0",
                                            isIn ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-orange-50 dark:bg-orange-950/20"
                                        )}>
                                            {isIn
                                                ? <ArrowDownLeft className="size-3 text-emerald-500" />
                                                : <ArrowUpRight className="size-3 text-orange-500" />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-medium text-foreground truncate leading-tight" title={tx.content || tx.code || ''}>
                                                {tx.content?.substring(0, 50) || tx.code || 'Giao dịch SePay'}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-[9px] text-muted-foreground font-mono">{date}</span>
                                                {tx.matched_invoice_id && <span className="text-[8px] bg-blue-50 text-blue-600 px-1 rounded font-bold">HĐ</span>}
                                                {tx.matched_order_id && <span className="text-[8px] bg-violet-50 text-violet-600 px-1 rounded font-bold">ĐH</span>}
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "text-xs font-bold tabular-nums shrink-0",
                                            isIn ? "text-emerald-600" : "text-orange-600"
                                        )}>
                                            {isIn ? '+' : '-'}{formatCurrency(amount)}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
