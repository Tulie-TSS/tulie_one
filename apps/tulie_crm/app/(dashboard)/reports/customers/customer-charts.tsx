'use client'

import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

interface CustomerChartsProps {
    data: Array<{ name: string; value: number }>
}

export function CustomerCharts({ data }: CustomerChartsProps) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                        allowDecimals={false}
                        tickMargin={10}
                    />
                    <Tooltip
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        contentStyle={{
                            borderRadius: '8px',
                            border: '1px solid hsl(var(--border))',
                            backgroundColor: 'hsl(var(--popover))',
                            color: 'hsl(var(--popover-foreground))',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            fontSize: '12px',
                        }}
                        itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
                        formatter={(value: any) => [`${value} khách hàng`, 'KH mới']}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
