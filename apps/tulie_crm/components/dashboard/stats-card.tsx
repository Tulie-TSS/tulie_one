import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction, CardFooter, Badge } from '@repo/ui'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * StatsCard — follows shadcn/ui dashboard-01 section-cards.tsx pattern.
 *
 * Uses CardDescription for label, CardTitle for value,
 * CardAction+Badge for trend, CardFooter for description.
 */

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
        <Card className={`@container/card ${className || ''}`}>
            <CardHeader>
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {value}
                </CardTitle>
                {change !== undefined && isPercentage && (
                    <CardAction>
                        <Badge variant="outline">
                            {isPositive ? <TrendingUp /> : isNegative ? <TrendingDown /> : <Minus />}
                            {isPositive ? '+' : ''}{change.toFixed(1)}%
                        </Badge>
                    </CardAction>
                )}
            </CardHeader>
            {(changeLabel || (change !== undefined && !isPercentage)) && (
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {change !== undefined && isPercentage && (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            {isPositive ? 'Tăng trưởng trong kỳ' : isNegative ? 'Sụt giảm trong kỳ' : 'Ổn định trong kỳ'}
                            {isPositive ? <TrendingUp className="size-4" /> : isNegative ? <TrendingDown className="size-4" /> : <Minus className="size-4" />}
                        </div>
                    )}
                    {change !== undefined && !isPercentage && (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            {isPositive ? '+' : ''}{change.toLocaleString('vi-VN')} đ
                            {isPositive ? <TrendingUp className="size-4" /> : isNegative ? <TrendingDown className="size-4" /> : null}
                        </div>
                    )}
                    {changeLabel && (
                        <div className="text-muted-foreground">
                            {changeLabel}
                        </div>
                    )}
                </CardFooter>
            )}
        </Card>
    )
}
