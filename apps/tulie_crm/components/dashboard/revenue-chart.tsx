'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@repo/ui'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'
import { RevenueData } from '@/types'
import { formatCurrency } from '@/lib/utils/format'

interface RevenueChartProps {
    data: RevenueData[]
}

export function RevenueChart({ data }: RevenueChartProps) {
    const [period, setPeriod] = useState('year')

    const filteredData = (() => {
        if (period === 'month') {
            // Show last 2 months so Recharts can draw a monotone curve line representing MoM trend
            return data.slice(-2)
        }
        if (period === 'quarter') {
            return data.slice(-3)
        }
        return data
    })()

    const hasData = filteredData && filteredData.length > 0 && filteredData.some(d => d.revenue > 0 || d.profit > 0)

    return (
        <Card glow="blue" className="shadow-[0_4px_24px_-8px_rgba(0,0,0,0.04)] border border-border/50 transition-all hover:shadow-[0_10px_24px_-8px_rgba(0,0,0,0.06)]">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 pt-3 px-4">
                <CardTitle className="text-sm font-semibold">Doanh thu & Lợi nhuận</CardTitle>
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-[110px] h-7 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="month">Tháng này</SelectItem>
                        <SelectItem value="quarter">Quý này</SelectItem>
                        <SelectItem value="year">Năm nay</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="pt-1 px-4 pb-3">
                {!hasData ? (
                    <div className="h-[230px] flex items-center justify-center text-muted-foreground text-xs">
                        <div className="text-center space-y-1.5">
                            <p className="text-2xl">📊</p>
                            <p>Chưa có dữ liệu doanh thu</p>
                            <p className="text-[11px]">Dữ liệu hiển thị khi có thanh toán</p>
                        </div>
                    </div>
                ) : (
                    <div className="h-[230px]">
                        <ResponsiveContainer width="100%" height="100%" key={period}>
                            <AreaChart key={period} data={filteredData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                                    </linearGradient>
                                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                                    tickMargin={8}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                                    tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(0)}M` : value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value.toString()}
                                    width={40}
                                />
                                <Tooltip
                                    cursor={{ stroke: 'var(--color-border)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    itemStyle={{ fontSize: 13, fontWeight: 500 }}
                                    labelStyle={{ fontSize: 13, color: 'var(--color-muted-foreground)', marginBottom: 4 }}
                                    contentStyle={{ 
                                        borderRadius: 'var(--radius-lg)', 
                                        border: '1px solid var(--color-border)', 
                                        backgroundColor: 'var(--color-popover)', 
                                        color: 'var(--color-popover-foreground)',
                                        boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)'
                                    }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="rounded-lg border bg-popover text-popover-foreground p-3 shadow-lg ring-1 ring-border/10">
                                                    <p className="text-sm font-medium text-muted-foreground mb-2">Tháng {label}</p>
                                                    <div className="space-y-1">
                                                        {payload.map((entry, index) => (
                                                            <div key={index} className="flex items-center justify-between gap-6">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: entry.color }} />
                                                                    <span className="text-sm text-foreground">{entry.name}</span>
                                                                </div>
                                                                <span className="text-sm font-medium tabular-nums font-mono">{formatCurrency((entry.value as number) * 1000000)}</span>
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
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#revenueGrad)"
                                    dot={{ r: 3, strokeWidth: 0, fill: '#2563eb' }}
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="profit"
                                    name="Lợi nhuận"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#profitGrad)"
                                    dot={{ r: 3, strokeWidth: 0, fill: '#10b981' }}
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
