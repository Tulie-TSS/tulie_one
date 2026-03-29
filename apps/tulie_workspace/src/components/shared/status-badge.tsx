import { Badge } from "@repo/ui"
import { cn } from "@/lib/utils/cn"

interface StatusBadgeProps {
    status: string
    label?: string
    colorClass?: string
    className?: string
    showDot?: boolean
}

export function StatusBadge({ status, label, colorClass, className, showDot = true }: StatusBadgeProps) {
    const displayLabel = label || status

    // Determine dot color from the semantic color class or status
    const dotColor = getDotColor(colorClass, status)

    return (
        <Badge
            variant="outline"
            className={cn(
                'font-medium whitespace-nowrap px-2.5 py-0.5 h-6 flex items-center gap-1.5 rounded-full border-border bg-background text-foreground',
                className
            )}
        >
            {showDot && dotColor && (
                <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColor)} />
            )}
            {displayLabel}
        </Badge>
    )
}

function getDotColor(colorClass?: string, status?: string): string {
    if (colorClass) {
        if (colorClass.includes('emerald') || colorClass.includes('success')) return 'bg-emerald-500'
        if (colorClass.includes('blue-') || colorClass.includes('info')) return 'bg-blue-500'
        if (colorClass.includes('amber') || colorClass.includes('warning')) return 'bg-amber-500'
        if (colorClass.includes('rose') || colorClass.includes('destructive') || colorClass.includes('failed')) return 'bg-rose-500'
        if (colorClass.includes('indigo') || colorClass.includes('completed')) return 'bg-indigo-500'
        if (colorClass.includes('zinc') || colorClass.includes('muted')) return 'bg-zinc-500'
    }
    
    // Fallback dictionary based on status strings common in workforce
    if (status) {
        const s = status.toLowerCase()
        if (s === 'completed' || s === 'success' || s === 'done' || s === 'active' || s === 'ready' || s === 'approved') return 'bg-emerald-500'
        if (s === 'in_progress' || s === 'running' || s === 'processing' || s === 'changes_requested') return 'bg-blue-500'
        if (s === 'pending' || s === 'idle' || s === 'draft') return 'bg-zinc-400'
        if (s === 'failed' || s === 'cancelled' || s === 'error' || s === 'urgent' || s === 'rejected') return 'bg-rose-500'
        if (s === 'high' || s === 'pending_review') return 'bg-orange-500'
        if (s === 'high') return 'bg-orange-500'
        if (s === 'medium') return 'bg-amber-500'
        if (s === 'low') return 'bg-zinc-400'
    }

    return 'bg-zinc-400'
}
