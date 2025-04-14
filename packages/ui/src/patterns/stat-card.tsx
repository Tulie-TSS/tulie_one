import { cn } from '../lib/utils'
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardFooter } from '../components/card'
import { Badge } from '../components/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'

/**
 * StatCard — Follows shadcn/ui dashboard-01 `section-cards.tsx` EXACTLY.
 *
 * Structure (from shadcn/ui blocks dashboard-01):
 * ┌─────────────────────────────────────┐
 * │ CardDescription (label)   Badge(trend)│  ← CardHeader + CardAction
 * │ CardTitle (value)                     │
 * │                                       │
 * │ Description line        TrendIcon     │  ← CardFooter
 * │ Footer text (muted)                   │
 * └─────────────────────────────────────┘
 *
 * Usage:
 * ```tsx
 * <StatCard
 *   title="Total Revenue"
 *   value="$1,250.00"
 *   trend="+12.5%"
 *   trendUp
 *   description="Trending up this month"
 *   footer="Visitors for the last 6 months"
 * />
 * ```
 */

interface StatCardProps {
    title: string
    value: string | number
    trend?: string
    trendUp?: boolean
    description?: string
    footer?: string
    className?: string
}

export function StatCard({
    title,
    value,
    trend,
    trendUp,
    description,
    footer,
    className,
}: StatCardProps) {
    return (
        <Card className={cn("@container/card", className)}>
            <CardHeader>
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {value}
                </CardTitle>
                {trend && (
                    <CardAction>
                        <Badge variant="outline">
                            {trendUp !== false ? <TrendingUp /> : <TrendingDown />}
                            {trend}
                        </Badge>
                    </CardAction>
                )}
            </CardHeader>
            {(description || footer) && (
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {description && (
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            {description}
                            {trendUp !== undefined && (
                                trendUp !== false
                                    ? <TrendingUp className="size-4" />
                                    : <TrendingDown className="size-4" />
                            )}
                        </div>
                    )}
                    {footer && (
                        <div className="text-muted-foreground">{footer}</div>
                    )}
                </CardFooter>
            )}
        </Card>
    )
}

/**
 * StatGrid — Grid container with shadcn/ui dashboard-01 gradient pattern.
 *
 * Applies gradient background to all child cards via data-slot selectors.
 *
 * Usage:
 * ```tsx
 * <StatGrid>
 *   <StatCard title="Revenue" value="$1,250" trend="+12.5%" trendUp />
 *   <StatCard title="Users" value="1,234" trend="-20%" trendUp={false} />
 * </StatGrid>
 * ```
 */

export function StatGrid({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <div className={cn(
            'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
            '*:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card',
            className
        )}>
            {children}
        </div>
    )
}
