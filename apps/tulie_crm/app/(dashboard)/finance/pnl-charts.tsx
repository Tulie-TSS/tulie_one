'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { formatCurrency } from '@/lib/utils/format'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie,
} from 'recharts'
import { PnLMonthly, ExpenseSummary } from '@/types'

interface PnLChartsProps {
    monthlyData: PnLMonthly[]
    expenseBreakdown: ExpenseSummary[]
}

const EXPENSE_COLORS = [
    '#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899',
    '#06b6d4', '#f59e0b', '#6366f1', '#14b8a6', '#ef4444',
]

export function PnLCharts({ monthlyData, expenseBreakdown }: PnLChartsProps) {
    const hasData = monthlyData.some(d => d.revenue > 0 || d.cogs > 0)
    const hasExpenses = expenseBreakdown.length > 0

    return (
        <div className="grid gap-4 lg:grid-cols-3">
            {/* P&L Trend Chart */}
            <Card glow="blue" className="lg:col-span-2 border border-border/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.04)]">
                <CardHeader className="pb-1.5 pt-3 px-4">
                    <CardTitle className="text-sm font-semibold">P&L theo tháng (triệu VND)</CardTitle>
                </CardHeader>
                <CardContent className="pt-1 px-4 pb-3">
                    {!hasData ? (
                        <div className="h-[280px] flex items-center justify-center text-muted-foreground text-xs">
                            <div className="text-center space-y-1.5">
                                <p className="text-2xl">📊</p>
                                <p>Chưa có dữ liệu tài chính</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                                        </linearGradient>
                                        <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
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
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        name="Doanh thu"
                                        stroke="#3b82f6"
                                        strokeWidth={2.5}
                                        fillOpacity={1}
                                        fill="url(#revGrad)"
                                        activeDot={{ r: 5, strokeWidth: 0, fill: '#3b82f6' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="cogs"
                                        name="Giá vốn"
                                        stroke="#f97316"
                                        strokeWidth={2}
                                        fillOpacity={0}
                                        fill="transparent"
                                        strokeDasharray="5 3"
                                        activeDot={{ r: 4, strokeWidth: 0, fill: '#f97316' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="net_profit"
                                        name="Lãi ròng"
                                        stroke="#10b981"
                                        strokeWidth={2.5}
                                        fillOpacity={1}
                                        fill="url(#netGrad)"
                                        activeDot={{ r: 5, strokeWidth: 0, fill: '#10b981' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card glow="coral" className="border border-border/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.04)]">
                <CardHeader className="pb-1.5 pt-3 px-4">
                    <CardTitle className="text-sm font-semibold">Phân bổ chi phí vận hành</CardTitle>
                </CardHeader>
                <CardContent className="pt-1 px-4 pb-3">
                    {!hasExpenses ? (
                        <div className="h-[280px] flex items-center justify-center text-muted-foreground text-xs">
                            <div className="text-center space-y-1.5">
                                <p className="text-2xl">💰</p>
                                <p>Chưa có chi phí được ghi nhận</p>
                                <p className="text-[10px]">Thêm chi phí vào bảng expenses</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Pie chart */}
                            <div className="h-[160px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={expenseBreakdown}
                                            dataKey="amount"
                                            nameKey="category"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={65}
                                            innerRadius={35}
                                            strokeWidth={2}
                                            stroke="var(--color-card)"
                                        >
                                            {expenseBreakdown.map((_, index) => (
                                                <Cell key={index} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const d = payload[0].payload as ExpenseSummary
                                                    return (
                                                        <div className="rounded-xl border bg-popover text-popover-foreground p-2.5 shadow-lg ring-1 ring-border/10">
                                                            <p className="text-xs font-medium">{d.category}</p>
                                                            <p className="text-sm font-bold">{formatCurrency(d.amount)}</p>
                                                            <p className="text-[10px] text-muted-foreground">{d.percentage.toFixed(1)}% · {d.count} khoản</p>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Legend list */}
                            <div className="space-y-1.5">
                                {expenseBreakdown.slice(0, 6).map((cat, idx) => (
                                    <div key={cat.category} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2.5 h-2.5 rounded-sm shrink-0"
                                                style={{ backgroundColor: EXPENSE_COLORS[idx % EXPENSE_COLORS.length] }}
                                            />
                                            <span className="text-muted-foreground font-medium truncate max-w-[120px]">{cat.category}</span>
                                        </div>
                                        <span className="font-bold text-foreground tabular-nums">{formatCurrency(cat.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
