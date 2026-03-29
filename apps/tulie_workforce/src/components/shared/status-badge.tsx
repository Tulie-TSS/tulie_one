import { Badge } from "@repo/ui"
import { cn } from "@/lib/utils"
import { CheckCircle2, CircleDashed, AlertCircle, XCircle, Clock, Circle } from "lucide-react"

interface StatusBadgeProps {
    status: string
    label?: string
    colorClass?: string
    className?: string
    showDot?: boolean
}

export function StatusBadge({ status, label, colorClass, className, showDot = true }: StatusBadgeProps) {
    const displayLabel = label || status

    // Determine config from the semantic color class or status
    const config = getIconConfig(colorClass, status)
    const Icon = config.icon

    return (
        <Badge
            variant="outline"
            className={cn(
                'font-medium whitespace-nowrap px-2.5 py-0.5 h-6 flex items-center gap-1.5 rounded-full border-border bg-background text-foreground',
                className
            )}
        >
            {showDot && (
                <Icon className={cn('w-3.5 h-3.5 shrink-0', config.color)} />
            )}
            {displayLabel}
        </Badge>
    )
}

function getIconConfig(colorClass?: string, status?: string) {
    let icon = Circle
    let color = 'text-zinc-400'

    const s = (status || '').toLowerCase()
    const c = (colorClass || '').toLowerCase()

    // Status map overrides
    if (s === 'completed' || s === 'success' || s === 'done' || s === 'active' || s === 'ready' || s === 'approved' || c.includes('emerald') || c.includes('success')) {
        icon = CheckCircle2
        color = 'text-emerald-500'
    } else if (s === 'in_progress' || s === 'running' || s === 'processing' || s === 'changes_requested' || c.includes('blue') || c.includes('info')) {
        icon = CircleDashed
        color = 'text-muted-foreground' // matched closely to the user's reference image where "In Process" has a grey icon
    } else if (s === 'failed' || s === 'cancelled' || s === 'error' || s === 'rejected' || c.includes('rose') || c.includes('destructive') || c.includes('failed')) {
        icon = XCircle
        color = 'text-rose-500'
    } else if (s === 'urgent' || s === 'high' || s === 'medium' || s === 'pending_review' || c.includes('amber') || c.includes('warning') || c.includes('orange')) {
        icon = AlertCircle
        color = 'text-amber-500'
    } else if (s === 'pending' || s === 'idle' || s === 'draft' || c.includes('zinc') || c.includes('muted')) {
        icon = Clock
        color = 'text-zinc-400'
    }

    // specific status overrides from other app contexts if needed
    if (s === 'todo' || s === 'low') {
        icon = Circle
        color = 'text-zinc-400'
    }

    return { icon, color }
}
