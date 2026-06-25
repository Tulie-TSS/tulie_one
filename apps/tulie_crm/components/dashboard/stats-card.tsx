'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@repo/ui'

interface StatsCardProps {
    title: string
    value: string | number
    change?: number
    changeLabel?: string
    className?: string
    compact?: boolean
    accent?: 'default' | 'emerald' | 'blue' | 'violet' | 'amber'
}

export function StatsCard({
    title,
    value,
    change,
    changeLabel,
    className,
    compact = false,
    accent = 'default',
}: StatsCardProps) {
    const isPositive = change !== undefined && change > 0
    const isNegative = change !== undefined && change < 0
    const isPercentage = change !== undefined && Math.abs(change) < 1000

    // Map accent colors to modern peach/coral glows
    const glowColor = 
        accent === 'emerald' ? 'emerald' : 
        accent === 'blue' ? 'blue' : 
        accent === 'violet' ? 'violet' : 'coral';

    return (
        <Card 
            glow={glowColor}
            className={cn('border border-border/50 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_24px_-8px_rgba(0,0,0,0.06)] transition-all', className)}
        >
            <CardContent className={cn("p-4 flex flex-col justify-between", compact ? "min-h-[84px] py-3" : "min-h-[96px]")}>
                <p className="text-[11px] font-bold text-muted-foreground tracking-wide leading-snug mb-1.5">
                    {title}
                </p>
                <div className={cn(
                    'font-bold tabular-nums text-foreground tracking-tight leading-none',
                    compact ? 'text-lg' : 'text-2xl'
                )}>
                    {value}
                </div>
                {change !== undefined ? (
                    <div className="flex items-center gap-1 mt-1.5">
                        {isPositive
                            ? <TrendingUp className="size-3 text-emerald-500 shrink-0" />
                            : isNegative
                                ? <TrendingDown className="size-3 text-red-500 shrink-0" />
                                : <Minus className="size-3 text-muted-foreground shrink-0" />
                        }
                        <span className={cn(
                            'text-[11px] font-semibold',
                            isPositive ? 'text-emerald-600' : isNegative ? 'text-red-500' : 'text-muted-foreground'
                        )}>
                            {changeLabel
                                ? `${isPositive ? '+' : ''}${change.toLocaleString('vi-VN')}`
                                : isPercentage
                                    ? `${isPositive ? '+' : ''}${change.toFixed(1)}%`
                                    : `${isPositive ? '+' : ''}${change.toLocaleString('vi-VN')} đ`
                            }
                        </span>
                        {changeLabel && (
                            <span className="text-[10px] text-muted-foreground/70 truncate">
                                {changeLabel}
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="h-4 mt-1.5" />
                )}
            </CardContent>
        </Card>
    )
}
