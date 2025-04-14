'use client'

import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

interface PerformanceChartsProps {
    workload: Array<{
        user_id: string
        full_name: string
        role: string
        active_tasks: number
    }>
}

export function PerformanceCharts({ workload }: PerformanceChartsProps) {
    // Take top 10 users for the chart to keep it clean
    const chartData = workload.slice(0, 10).map(w => ({
        name: w.full_name.split(' ').pop() || w.full_name, // Just use last name for shorter x-axis labels
        fullName: w.full_name,
        tasks: w.active_tasks
    }))

    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                            fontSize: '12px'
                        }}
                        itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}
                        formatter={(value: any, name: any, props: any) => [
                            `${value} tasks`, 
                            props.payload.fullName
                        ]}
                    />
                    <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
