import { cn } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/card'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

/**
 * StatCard — Dashboard stat card following shadcn/ui Dashboard example
 *
 * Structure (from shadcn screenshot):
 * ┌─────────────────────────────────────┐
 * │ Card Title           Trend (+12.5%) │
 * │ $1,250.00                           │ ← stat value
 * │ Trending up this month              │ ← description
 * │ Visitors for the last 6 months      │ ← footer text
 * └─────────────────────────────────────┘
 *
 * Usage:
 * ```tsx
 * <StatCard
 *   title="Tổng doanh thu"
 *   value="1.250.000.000 ₫"
 *   trend="+12.5%"
 *   trendUp
 *   description="Tăng trưởng so với tháng trước"
 *   footer="Dữ liệu 6 tháng gần nhất"
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
    icon?: React.ReactNode
    className?: string
}

export function StatCard({
    title,
    value,
    trend,
    trendUp,
    description,
    footer,
    icon,
    className,
}: StatCardProps) {
    return (
        <Card className={cn("shadow-sm", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {trend && (
                    <div className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold">
                        {trendUp !== false ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {trend}
                    </div>
                )}
                {icon && !trend && (
                    <div className="text-muted-foreground">{icon}</div>
                )}
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight">{value}</div>
                {description && (
                    <div className="mt-4 flex items-center gap-2 text-sm">
                        <span className="font-medium text-foreground">{description}</span>
                        {trendUp !== false ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    </div>
                )}
                {footer && (
                    <p className="text-sm text-muted-foreground mt-1">{footer}</p>
                )}
                {/* Fallback for when we only have description and no footer but we want it to look like standard description */}
                {!footer && !description && (
                    // Just a spacer if needed
                    <div className="h-0" />
                )}
            </CardContent>
        </Card>
    )
}

/**
 * StatGrid — Grid container for stat cards
 *
 * Usage:
 * ```tsx
 * <StatGrid>
 *   <StatCard title="Revenue" value="$1,250" />
 *   <StatCard title="Users" value="1,234" />
 *   <StatCard title="Active" value="45,678" />
 *   <StatCard title="Growth" value="4.5%" />
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
        <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
            {children}
        </div>
    )
}
