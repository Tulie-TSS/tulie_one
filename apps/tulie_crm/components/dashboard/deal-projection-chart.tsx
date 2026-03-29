'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts"
import { DEAL_STATUS_LABELS, DEAL_CHART_COLORS as COLORS } from "@/lib/constants/status"
import { formatCurrency } from "@/lib/utils/format"

interface DealProjectionChartProps {
    stats: any
}

export function DealProjectionChart({ stats }: DealProjectionChartProps) {
    if (!stats) return null

    const data = [
        { name: 'Mới', value: stats.new, key: 'new' },
        { name: 'Briefing', value: stats.briefing, key: 'briefing' },
        { name: 'Báo giá', value: stats.proposal_sent, key: 'proposal_sent' },
        { name: 'Thành công', value: stats.closed_won, key: 'closed_won' },
    ].filter(item => item.value > 0)

    const barData = data.map(item => ({
        name: item.name,
        amount: item.value / 1000000,
        rawAmount: item.value,
        fullName: DEAL_STATUS_LABELS[item.key as keyof typeof DEAL_STATUS_LABELS]?.split('(')[0] || item.name,
        key: item.key
    }))

    const hasData = barData.length > 0

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-base font-medium">Pipeline Doanh thu</CardTitle>
                    <CardDescription className="text-sm">Tiềm năng dựa trên các cơ hội</CardDescription>
                </div>
                <div className="text-right space-y-1">
                    <p className="text-sm text-muted-foreground mr-4">Tổng tiềm năng</p>
                    <p className="text-xl mr-4">{formatCurrency(stats.total_potential)}</p>
                </div>
            </CardHeader>
            <CardContent>
                {!hasData ? (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                        <div className="text-center space-y-2">
                            <p className="text-3xl">📭</p>
                            <p>Không có dữ liệu</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={barData}
                                    layout="vertical"
                                    margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        width={80}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f3f4f6' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const d = payload[0].payload
                                                return (
                                                    <div className="rounded-lg border bg-background p-3">
                                                        <p className="text-xs font-medium text-muted-foreground mb-1">{d.fullName}</p>
                                                        <p className="text-sm">{formatCurrency(d.rawAmount)}</p>
                                                    </div>
                                                )
                                            }
                                            return null
                                        }}
                                    />
                                    <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={24}>
                                        {barData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={(COLORS as any)[entry.key] || '#3b82f6'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-4 border-t">
                            {data.map((item) => (
                                <div key={item.key} className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: (COLORS as any)[item.key] || '#3b82f6' }} />
                                        <span className="text-xs text-muted-foreground font-medium truncate">
                                            {DEAL_STATUS_LABELS[item.key as keyof typeof DEAL_STATUS_LABELS]?.split('(')[0]}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold truncate">
                                        {formatCurrency(item.value)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
