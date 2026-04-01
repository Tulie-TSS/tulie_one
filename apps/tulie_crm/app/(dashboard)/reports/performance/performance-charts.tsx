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
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                        dataKey="name" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#64748b' }}
                    />
                    <YAxis 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#64748b' }}
                        allowDecimals={false}
                    />
                    <Tooltip
                        contentStyle={{ 
                            borderRadius: '8px', 
                            border: 'none', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            fontSize: '12px'
                        }}
                        formatter={(value: number, name: string, props: any) => [
                            `${value} tasks`, 
                            props.payload.fullName
                        ]}
                    />
                    <Bar dataKey="tasks" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
