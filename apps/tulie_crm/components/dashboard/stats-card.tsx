import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui'
import { cn } from '@/lib/utils'
import { ArrowDown, ArrowUp } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: string | number
    change?: number
    changeLabel?: string
    icon?: React.ReactNode
    className?: string
    isCurrency?: boolean
    gradient?: string
}

export function StatsCard({
    title,
    value,
    change,
    changeLabel,
    icon,
    className,
    isCurrency = false,
    gradient,
}: StatsCardProps) {
    const isPositive = change !== undefined && change > 0
    const isNegative = change !== undefined && change < 0

    return (
        <Card className={cn('relative group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm shadow-sm transition-all duration-300', className)}>
            {/* Decorative gradient background */}
            {gradient && (
                <div className={cn(
                    "absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br",
                    gradient
                )} />
            )}
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground">
                    {title}
                </CardTitle>
                {icon && (
                    <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                        {icon}
                    </div>
                )}
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-xl sm:text-2xl font-medium truncate">{value}</div>
                {change !== undefined && (
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className={cn(
                            "flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-medium transition-colors",
                            isPositive ? "bg-green-500/10 text-green-600" :
                                isNegative ? "bg-red-500/10 text-red-600" :
                                    "bg-muted text-muted-foreground"
                        )}>
                            {isPositive && <ArrowUp className="h-3 w-3" />}
                            {isNegative && <ArrowDown className="h-3 w-3" />}
                            {Math.abs(change) < 1000 ? `${Math.abs(change).toFixed(1)}%` : Math.abs(change).toLocaleString('vi-VN')}
                        </div>
                        {changeLabel && (
                            <span className="text-xs text-muted-foreground font-normal">
                                {changeLabel}
                            </span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
