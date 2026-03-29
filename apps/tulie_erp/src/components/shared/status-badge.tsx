import { Badge } from '@repo/ui'
import { cn } from '@/lib/utils'
import { CheckCircle2, CircleDashed, AlertCircle, XCircle, Clock, Circle } from "lucide-react"
import {
    CUSTOMER_STATUS_LABELS,
    CUSTOMER_STATUS_COLORS,
    QUOTATION_STATUS_LABELS,
    QUOTATION_STATUS_COLORS,
    CONTRACT_STATUS_LABELS,
    CONTRACT_STATUS_COLORS,
    INVOICE_STATUS_LABELS,
    INVOICE_STATUS_COLORS,
    DEAL_STATUS_LABELS,
    DEAL_STATUS_COLORS,
    PROJECT_STATUS_LABELS,
    PROJECT_STATUS_COLORS,
    PRODUCT_STATUS_LABELS,
    PRODUCT_STATUS_COLORS,
    BRAND_LABELS,
    BRAND_COLORS,
    TICKET_STATUS_LABELS,
    TICKET_STATUS_COLORS,
    TICKET_PRIORITY_LABELS,
    TICKET_PRIORITY_COLORS,
    RETAIL_ORDER_STATUS_LABELS,
    RETAIL_ORDER_STATUS_COLORS,
    RETAIL_PAYMENT_STATUS_LABELS,
    RETAIL_PAYMENT_STATUS_COLORS,
} from '@/lib/constants/status'

type EntityType = 'customer' | 'quotation' | 'contract' | 'invoice' | 'deal' | 'project' | 'product' | 'brand' | 'ticket' | 'ticket_priority' | 'retail_order' | 'retail_payment' | 'none'

interface StatusBadgeProps {
    status: string
    label?: string
    entityType?: EntityType
    className?: string
    showDot?: boolean
}

const MAPPINGS: Record<Exclude<EntityType, 'none'>, { labels: any, colors: any }> = {
    customer: { labels: CUSTOMER_STATUS_LABELS, colors: CUSTOMER_STATUS_COLORS },
    quotation: { labels: QUOTATION_STATUS_LABELS, colors: QUOTATION_STATUS_COLORS },
    contract: { labels: CONTRACT_STATUS_LABELS, colors: CONTRACT_STATUS_COLORS },
    invoice: { labels: INVOICE_STATUS_LABELS, colors: INVOICE_STATUS_COLORS },
    deal: { labels: DEAL_STATUS_LABELS, colors: DEAL_STATUS_COLORS },
    project: { labels: PROJECT_STATUS_LABELS, colors: PROJECT_STATUS_COLORS },
    product: { labels: PRODUCT_STATUS_LABELS, colors: PRODUCT_STATUS_COLORS },
    brand: { labels: BRAND_LABELS, colors: BRAND_COLORS },
    ticket: { labels: TICKET_STATUS_LABELS, colors: TICKET_STATUS_COLORS },
    ticket_priority: { labels: TICKET_PRIORITY_LABELS, colors: TICKET_PRIORITY_COLORS },
    retail_order: { labels: RETAIL_ORDER_STATUS_LABELS, colors: RETAIL_ORDER_STATUS_COLORS },
    retail_payment: { labels: RETAIL_PAYMENT_STATUS_LABELS, colors: RETAIL_PAYMENT_STATUS_COLORS },
}

export function StatusBadge({ status, label, entityType = 'none', className, showDot = true }: StatusBadgeProps) {
    let displayLabel = label || status
    let colorClass = ''

    if (entityType !== 'none') {
        const mapping = MAPPINGS[entityType]
        displayLabel = label || mapping.labels[status as keyof typeof mapping.labels] || status
        colorClass = mapping.colors[status as keyof typeof mapping.colors] || ''
    }

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
    } else if (s === 'in_progress' || s === 'running' || s === 'processing' || s === 'changes_requested' || c.includes('blue') || c.includes('info') || c.includes('sky')) {
        icon = CircleDashed
        color = 'text-muted-foreground'
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

    if (s === 'todo' || s === 'low') {
        icon = Circle
        color = 'text-zinc-400'
    }

    return { icon, color }
}
