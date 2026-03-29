import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { cn } from '@/lib/utils'

interface StatsCardProps {
    title: string
    value: string | number
    change?: number
    changeLabel?: string
    icon?: React.ReactNode
    className?: string
    gradient?: string // Kept for API compatibility with page.tsx, but unused in UI
}

export function StatsCard({
    title,
    value,
    change,
    changeLabel,
    icon,
    className,
}: StatsCardProps) {
    const isPositive = change !== undefined && change > 0
    const isNegative = change !== undefined && change < 0

    return (
        <Card className={cn("shadow-sm", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(changeLabel || change !== undefined) && (
                    <p className="text-xs text-muted-foreground">
                        {change !== undefined && (
                            <span className="font-medium mr-1">
                                {isPositive ? '+' : ''}
                                {Math.abs(change) < 1000 ? `${change.toFixed(1)}%` : change.toLocaleString('vi-VN')}
                            </span>
                        )}
                        {changeLabel}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
