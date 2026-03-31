'use client'

import React, { useEffect, useState } from 'react'
import { getEntityLineage, EntityLineage } from '@/lib/supabase/services/lineage-service'
import { ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  DEAL_STATUS_LABELS, DEAL_STATUS_COLORS,
  QUOTATION_STATUS_LABELS, QUOTATION_STATUS_COLORS,
  CONTRACT_STATUS_LABELS, CONTRACT_STATUS_COLORS,
  PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS
} from '@/lib/constants/status'

interface Props {
  entityType: 'deal' | 'quotation' | 'contract' | 'project'
  entityId: string
}

interface StepData {
  type: string
  label: string
  entity: { id: string; status: string } | null
  url: string | null
  displayText: string | null
  statusLabel: string | null
  statusColor: string
}

export function EntityPipelineTracker({ entityType, entityId }: Props) {
  const [lineage, setLineage] = useState<EntityLineage | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    getEntityLineage(entityType, entityId)
      .then(data => { if (mounted) { setLineage(data); setIsLoading(false) } })
      .catch(() => { if (mounted) setIsLoading(false) })
    return () => { mounted = false }
  }, [entityType, entityId])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2 px-1 print:hidden">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Đang tải...</span>
      </div>
    )
  }

  if (!lineage) return null

  const steps: StepData[] = [
    {
      type: 'deal',
      label: 'Cơ hội',
      entity: lineage.deal,
      url: lineage.deal ? `/deals/${lineage.deal.id}` : null,
      displayText: lineage.deal?.title || null,
      statusLabel: lineage.deal ? (DEAL_STATUS_LABELS as any)[lineage.deal.status] || null : null,
      statusColor: lineage.deal ? (DEAL_STATUS_COLORS as any)[lineage.deal.status] || '' : '',
    },
    {
      type: 'quotation',
      label: 'Báo giá',
      entity: lineage.quotation,
      url: lineage.quotation ? `/quotations/${lineage.quotation.id}` : null,
      displayText: lineage.quotation?.quotation_number || null,
      statusLabel: lineage.quotation ? (QUOTATION_STATUS_LABELS as any)[lineage.quotation.status] || null : null,
      statusColor: lineage.quotation ? (QUOTATION_STATUS_COLORS as any)[lineage.quotation.status] || '' : '',
    },
    {
      type: 'contract',
      label: 'Hợp đồng',
      entity: lineage.contract,
      url: lineage.contract ? `/contracts/${lineage.contract.id}` : null,
      displayText: lineage.contract?.contract_number || null,
      statusLabel: lineage.contract ? (CONTRACT_STATUS_LABELS as any)[lineage.contract.status] || null : null,
      statusColor: lineage.contract ? (CONTRACT_STATUS_COLORS as any)[lineage.contract.status] || '' : '',
    },
    {
      type: 'project',
      label: 'Dự án',
      entity: lineage.project,
      url: lineage.project ? `/projects/${lineage.project.id}` : null,
      displayText: lineage.project?.title || null,
      statusLabel: lineage.project ? (PROJECT_STATUS_LABELS as any)[lineage.project.status] || null : null,
      statusColor: lineage.project ? (PROJECT_STATUS_COLORS as any)[lineage.project.status] || '' : '',
    },
  ]

  // Don't render if no linked entities found at all (only self)
  const linkedCount = steps.filter(s => s.entity !== null).length
  if (linkedCount <= 1) return null

  return (
    <nav aria-label="Luồng dự án" className="flex items-center gap-1 py-1.5 overflow-x-auto print:hidden">
      {steps.map((step, index) => {
        const isCurrent = step.type === entityType
        const hasData = !!step.entity

        return (
          <React.Fragment key={step.type}>
            {index > 0 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0 mx-0.5" />
            )}

            {hasData && step.url && !isCurrent ? (
              <Link
                href={step.url}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors',
                  'border border-transparent hover:border-border hover:bg-muted/50'
                )}
              >
                <span className="text-muted-foreground">{step.label}:</span>
                <span className="font-medium text-foreground truncate max-w-[160px]">{step.displayText}</span>
                {step.statusLabel && (
                  <span className={cn('inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium', step.statusColor)}>
                    {step.statusLabel}
                  </span>
                )}
              </Link>
            ) : isCurrent ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs',
                  'bg-card border border-border shadow-sm'
                )}
              >
                <span className="text-muted-foreground">{step.label}:</span>
                <span className="font-semibold text-foreground truncate max-w-[160px]">
                  {step.displayText || 'Đang xem'}
                </span>
                {step.statusLabel && (
                  <span className={cn('inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium', step.statusColor)}>
                    {step.statusLabel}
                  </span>
                )}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground/50">
                <span>{step.label}</span>
                <span className="text-[10px]">—</span>
              </span>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
