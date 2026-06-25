import { cn } from '@/lib/utils'
import {
    CUSTOMER_STATUS_LABELS,
    QUOTATION_STATUS_LABELS,
    CONTRACT_STATUS_LABELS,
    INVOICE_STATUS_LABELS,
    DEAL_STATUS_LABELS,
    PROJECT_STATUS_LABELS,
    PRODUCT_STATUS_LABELS,
    BRAND_LABELS,
    TICKET_STATUS_LABELS,
    TICKET_PRIORITY_LABELS,
    RETAIL_ORDER_STATUS_LABELS,
    RETAIL_PAYMENT_STATUS_LABELS,
    MILESTONE_STATUS_LABELS,
} from '@/lib/constants/status'
import {
    CUSTOMER_STATUS_COLORS,
    QUOTATION_STATUS_COLORS,
    CONTRACT_STATUS_COLORS,
    INVOICE_STATUS_COLORS,
    DEAL_STATUS_COLORS,
    PROJECT_STATUS_COLORS,
    PRODUCT_STATUS_COLORS,
    BRAND_COLORS,
    TICKET_STATUS_COLORS,
    TICKET_PRIORITY_COLORS,
    RETAIL_ORDER_STATUS_COLORS,
    RETAIL_PAYMENT_STATUS_COLORS,
    MILESTONE_STATUS_COLORS,
} from '@/lib/constants/status'

type EntityType = 'customer' | 'quotation' | 'contract' | 'invoice' | 'deal' | 'project' | 'product' | 'brand' | 'ticket' | 'ticket_priority' | 'retail_order' | 'retail_payment' | 'milestone' | 'none'

interface StatusBadgeProps {
    status: string
    label?: string
    entityType?: EntityType
    className?: string
    showDot?: boolean
}

const LABEL_MAPPINGS: Record<Exclude<EntityType, 'none'>, any> = {
    customer: CUSTOMER_STATUS_LABELS,
    quotation: QUOTATION_STATUS_LABELS,
    contract: CONTRACT_STATUS_LABELS,
    invoice: INVOICE_STATUS_LABELS,
    deal: DEAL_STATUS_LABELS,
    project: PROJECT_STATUS_LABELS,
    product: PRODUCT_STATUS_LABELS,
    brand: BRAND_LABELS,
    ticket: TICKET_STATUS_LABELS,
    ticket_priority: TICKET_PRIORITY_LABELS,
    retail_order: RETAIL_ORDER_STATUS_LABELS,
    retail_payment: RETAIL_PAYMENT_STATUS_LABELS,
    milestone: MILESTONE_STATUS_LABELS,
}

const COLOR_MAPPINGS: Record<Exclude<EntityType, 'none'>, any> = {
    customer: CUSTOMER_STATUS_COLORS,
    quotation: QUOTATION_STATUS_COLORS,
    contract: CONTRACT_STATUS_COLORS,
    invoice: INVOICE_STATUS_COLORS,
    deal: DEAL_STATUS_COLORS,
    project: PROJECT_STATUS_COLORS,
    product: PRODUCT_STATUS_COLORS,
    brand: BRAND_COLORS,
    ticket: TICKET_STATUS_COLORS,
    ticket_priority: TICKET_PRIORITY_COLORS,
    retail_order: RETAIL_ORDER_STATUS_COLORS,
    retail_payment: RETAIL_PAYMENT_STATUS_COLORS,
    milestone: MILESTONE_STATUS_COLORS,
}

/**
 * StatusBadge with per-entity semantic colors.
 * Uses *_STATUS_COLORS mappings for distinct color per status (emerald, blue, amber, red, violet).
 */
export function StatusBadge({ status, label, entityType = 'none', className, showDot }: StatusBadgeProps) {
    let displayLabel = label || status
    let colorClass = ''

    if (entityType !== 'none') {
        const labels = LABEL_MAPPINGS[entityType]
        displayLabel = label || labels?.[status as keyof typeof labels] || status

        const colors = COLOR_MAPPINGS[entityType]
        colorClass = colors?.[status as keyof typeof colors] || getFallbackColor(status)
    } else {
        colorClass = getFallbackColor(status)
    }

    return (
        <span className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
            colorClass,
            className
        )}>
            {displayLabel}
        </span>
    )
}

/**
 * Fallback color when no entity-specific color mapping is found.
 */
function getFallbackColor(status: string): string {
    const s = status.toLowerCase()

    if (['rejected', 'failed', 'cancelled', 'error', 'overdue', 'urgent', 'blocked', 'churned'].includes(s)) {
        return 'bg-red-600 text-white border-none'
    }
    if (['completed', 'done', 'active', 'paid', 'signed', 'accepted', 'approved', 'ready', 'resolved', 'closed_won', 'vip', 'converted', 'edit_done'].includes(s)) {
        return 'bg-emerald-600 text-white border-none'
    }
    if (['in_progress', 'running', 'processing', 'sent', 'viewed', 'shipping', 'waiting_ship', 'waiting', 'open', 'editing', 'briefing', 'prospect', 'proposal_sent', 'partial', 'review', 'pending_review', 'changes_requested'].includes(s)) {
        return 'bg-orange-600 text-white border-none'
    }
    return 'bg-zinc-400 text-white border-none'
}
