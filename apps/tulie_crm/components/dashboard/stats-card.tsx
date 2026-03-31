import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: string | number
    change?: number
    changeLabel?: string
    className?: string
}

export function StatsCard({
    title,
    value,
    change,
    changeLabel,
    className,
}: StatsCardProps) {
    const isPositive = change !== undefined && change > 0
    const isNegative = change !== undefined && change < 0
    const isPercentage = change !== undefined && Math.abs(change) < 1000

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tabular-nums">{value}</div>
                {change !== undefined ? (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                        {isPercentage && (
                            <>
                                {isPositive ? <TrendingUp className="size-3.5 text-emerald-500" /> : isNegative ? <TrendingDown className="size-3.5 text-red-500" /> : <Minus className="size-3.5 text-muted-foreground" />}
                                <span className={isPositive ? 'text-emerald-500 font-medium' : isNegative ? 'text-red-500 font-medium' : 'text-muted-foreground font-medium'}>
                                    {isPositive ? '+' : ''}{change.toFixed(1)}%
                                </span>
                            </>
                        )}
                        {!isPercentage && (
                            <>
                                {isPositive ? <TrendingUp className="size-3.5 text-emerald-500" /> : isNegative ? <TrendingDown className="size-3.5 text-red-500" /> : <Minus className="size-3.5 text-muted-foreground" />}
                                <span className={isPositive ? 'text-emerald-500 font-medium' : isNegative ? 'text-red-500 font-medium' : 'text-muted-foreground font-medium'}>
                                    {isPositive ? '+' : ''}{change.toLocaleString('vi-VN')} đ
                                </span>
                            </>
                        )}
                        <span className="text-muted-foreground/80 line-clamp-1 flex-1">
                            {changeLabel || (isPercentage ? (isPositive ? 'Tăng trưởng trong kỳ' : isNegative ? 'Sụt giảm trong kỳ' : 'Ổn định') : '')}
                        </span>
                    </p>
                ) : (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 opacity-0 pointer-events-none select-none">
                        <Minus className="size-3.5" />
                        <span>Placeholder</span>
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
