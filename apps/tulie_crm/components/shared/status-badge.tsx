import { Badge } from '@repo/ui'
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

/**
 * Shadcn v4 standard Badge — uses only `variant` for visual styling.
 * No custom colors, no hardcoded classes.
 * Maps status → shadcn Badge variant (default | secondary | outline | destructive)
 */
export function StatusBadge({ status, label, entityType = 'none', className }: StatusBadgeProps) {
    let displayLabel = label || status

    if (entityType !== 'none') {
        const labels = LABEL_MAPPINGS[entityType]
        displayLabel = label || labels?.[status as keyof typeof labels] || status
    }

    const variant = getVariant(status)

    return (
        <Badge variant={variant} className={cn(className)}>
            {displayLabel}
        </Badge>
    )
}

/**
 * Map any status string → standard shadcn Badge variant.
 * No custom colors — only the 4 built-in variants.
 */
function getVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
    const s = status.toLowerCase()

    // Destructive states
    if (['rejected', 'failed', 'cancelled', 'error', 'overdue', 'urgent', 'blocked', 'churned'].includes(s)) {
        return 'destructive'
    }

    // Success / active states → default (primary)
    if (['completed', 'done', 'active', 'paid', 'signed', 'accepted', 'approved', 'ready', 'resolved', 'closed_won', 'vip', 'converted', 'edit_done'].includes(s)) {
        return 'default'
    }

    // In-progress / waiting → secondary
    if (['in_progress', 'running', 'processing', 'sent', 'viewed', 'shipping', 'waiting_ship', 'waiting', 'open', 'editing', 'briefing', 'prospect', 'proposal_sent', 'partial', 'review', 'pending_review', 'changes_requested'].includes(s)) {
        return 'secondary'
    }

    // Default → outline (draft, pending, todo, etc.)
    return 'outline'
}
