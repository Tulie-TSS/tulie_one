'use client'

import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'

interface SalesChartsProps {
    revenueData: Array<{
        name: string
        revenue: number
        expenses: number
        profit: number
    }>
}

export function SalesCharts({ revenueData }: SalesChartsProps) {
    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="name"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickMargin={10}
                    />
                    <YAxis
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => `${value}tr`}
                        tickMargin={10}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid hsl(var(--border))',
                            backgroundColor: 'hsl(var(--popover))',
                            color: 'hsl(var(--popover-foreground))',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            fontSize: '12px',
                        }}
                        itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
                        formatter={(value: any, name: any) => [
                            `${value.toFixed(1)} triệu VNĐ`,
                            name === 'revenue' ? 'Doanh thu' : name === 'expenses' ? 'Chi phí' : 'Lợi nhuận',
                        ]}
                    />
                    <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '13px', paddingBottom: '20px' }}
                        formatter={(value: string) =>
                            <span className="text-foreground font-medium ml-1">
                                {value === 'revenue' ? 'Doanh thu' : value === 'expenses' ? 'Chi phí' : 'Lợi nhuận'}
                            </span>
                        }
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                    />
                    <Area
                        type="monotone"
                        dataKey="expenses"
                        stroke="hsl(var(--destructive))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorExpenses)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
