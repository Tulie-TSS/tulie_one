import { Badge } from '@repo/ui'
import { cn } from '@/lib/utils'
import {
    CUSTOMER_STATUS_LABELS, CUSTOMER_STATUS_COLORS,
    QUOTATION_STATUS_LABELS, QUOTATION_STATUS_COLORS,
    CONTRACT_STATUS_LABELS, CONTRACT_STATUS_COLORS,
    INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS,
    DEAL_STATUS_LABELS, DEAL_STATUS_COLORS,
    PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS,
    PRODUCT_STATUS_LABELS, PRODUCT_STATUS_COLORS,
    BRAND_LABELS, BRAND_COLORS,
    TICKET_STATUS_LABELS, TICKET_STATUS_COLORS,
    TICKET_PRIORITY_LABELS, TICKET_PRIORITY_COLORS,
    RETAIL_ORDER_STATUS_LABELS, RETAIL_ORDER_STATUS_COLORS,
    RETAIL_PAYMENT_STATUS_LABELS, RETAIL_PAYMENT_STATUS_COLORS,
} from '@/lib/constants/status'

type EntityType = 'customer' | 'quotation' | 'contract' | 'invoice' | 'deal' | 'project' | 'product' | 'brand' | 'ticket' | 'ticket_priority' | 'retail_order' | 'retail_payment' | 'none'

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
}

/**
 * Unified StatusBadge — uses semantic color tokens from status.ts.
 * Renders as a Shadcn Badge with `variant="outline"` as base,
 * then applies the semantic color class from the entity's color map.
 *
 * If no entityType or no matching color is found, falls back to
 * a generic variant mapping.
 */
export function StatusBadge({ status, label, entityType = 'none', className, showDot }: StatusBadgeProps) {
    let displayLabel = label || status

    if (entityType !== 'none') {
        const labels = LABEL_MAPPINGS[entityType]
        displayLabel = label || labels?.[status as keyof typeof labels] || status
    }

    // Try to get semantic color from the entity's color map
    let colorClass = ''
    if (entityType !== 'none') {
        const colors = COLOR_MAPPINGS[entityType]
        colorClass = colors?.[status as keyof typeof colors] || ''
    }

    // If we have a semantic color, use it with outline variant as base
    if (colorClass) {
        return (
            <Badge
                variant="outline"
                className={cn(
                    'rounded-md text-[11px] font-medium px-2 py-0.5',
                    colorClass,
                    className
                )}
            >
                {displayLabel}
            </Badge>
        )
    }

    // Fallback: no entityType or no color found → use generic variant
    const variant = getVariant(status)
    return (
        <Badge variant={variant} className={cn('rounded-md text-[11px] font-medium', className)}>
            {displayLabel}
        </Badge>
    )
}

/**
 * Fallback variant mapping for when no semantic color is available.
 */
function getVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
    const s = status.toLowerCase()

    if (['rejected', 'failed', 'cancelled', 'error', 'overdue', 'urgent', 'blocked', 'churned'].includes(s)) {
        return 'destructive'
    }

    if (['completed', 'done', 'active', 'paid', 'signed', 'accepted', 'approved', 'ready', 'resolved', 'closed_won', 'vip', 'converted', 'edit_done'].includes(s)) {
        return 'default'
    }

    if (['in_progress', 'running', 'processing', 'sent', 'viewed', 'shipping', 'waiting_ship', 'waiting', 'open', 'editing', 'briefing', 'prospect', 'proposal_sent', 'partial', 'review', 'pending_review', 'changes_requested'].includes(s)) {
        return 'secondary'
    }

    return 'outline'
}
