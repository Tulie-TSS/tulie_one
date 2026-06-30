'use client'

import React, { useEffect, useState } from 'react'
import { getEntityLineage, EntityLineage } from '@/lib/supabase/services/lineage-service'
import { ChevronRight, Loader2, Target, FileText, FileSignature, Briefcase } from 'lucide-react'
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
  minimal?: boolean
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

export function EntityPipelineTracker({ entityType, entityId, minimal = false }: Props) {
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
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Đang tải luồng tiến trình...</span>
      </div>
    )
  }

  if (!lineage) return null

  const steps: StepData[] = [
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
  ]

  // Don't render if no linked entities found at all (only self)
  const linkedCount = steps.filter(s => s.entity !== null).length
  if (linkedCount <= 1) return null

  return (
    <nav aria-label="Luồng tiến trình" className={cn("print:hidden", minimal ? "w-auto" : "w-full")}>
      <div className={cn(
        "flex flex-row flex-wrap items-center gap-3",
        minimal 
          ? "bg-transparent p-0 border-none shadow-none justify-start md:justify-end" 
          : "bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-3.5 shadow-sm justify-between"
      )}>
        {steps.map((step, index) => {
          const isCurrent = step.type === entityType
          const hasData = !!step.entity

          // Select icon for the step
          const Icon = {
            deal: Target,
            quotation: FileText,
            contract: FileSignature,
            project: Briefcase,
          }[step.type as 'deal' | 'quotation' | 'contract' | 'project'] || FileText

          const stepContent = (
            <div className={cn(
              "flex items-center gap-2 rounded-lg transition-all",
              minimal ? "py-0.5 px-1.5" : "py-1.5 px-2",
              hasData && !isCurrent && "hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80"
            )}>
              {/* Icon Circle */}
              <div className={cn(
                "rounded-full flex items-center justify-center shrink-0 transition-all border",
                minimal ? "h-7.5 w-7.5" : "h-9 w-9",
                isCurrent 
                  ? "bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-950 dark:border-zinc-100 shadow-sm ring-4 ring-zinc-950/10 dark:ring-zinc-100/10" 
                  : hasData
                    ? "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm"
                    : "bg-zinc-50/50 dark:bg-zinc-950/20 text-zinc-400 dark:text-zinc-650 border-dashed border-zinc-200 dark:border-zinc-800"
              )}>
                <Icon className={cn(minimal ? "h-3.5 w-3.5" : "h-4.5 w-4.5", !isCurrent && !hasData && "opacity-60")} />
              </div>

              {/* Text Info */}
              <div className="flex flex-col min-w-0">
                <span className={cn(
                  "text-[9px]   font-bold",
                  isCurrent 
                    ? "text-zinc-950 dark:text-zinc-100" 
                    : hasData 
                      ? "text-zinc-500 dark:text-zinc-450"
                      : "text-zinc-400/80 dark:text-zinc-600/80"
                )}>
                  {step.label}
                </span>
                
                {hasData ? (
                  <div className="flex items-center gap-1.5 mt-0.5 min-w-0 flex-wrap sm:flex-nowrap">
                    <span className={cn(
                      "text-xs font-semibold truncate max-w-[110px] md:max-w-[140px]",
                      isCurrent ? "text-zinc-950 dark:text-white" : "text-zinc-700 dark:text-zinc-300"
                    )}>
                      {step.displayText}
                    </span>
                    {step.statusLabel && (
                      <span className={cn(
                        "inline-flex items-center rounded-full px-1.5 py-0.5 text-[8.5px] font-bold  whitespace-nowrap",
                        step.statusColor
                      )}>
                        {step.statusLabel}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-zinc-450/60 dark:text-zinc-600/60 mt-0.5">
                    Chưa tạo
                  </span>
                )}
              </div>
            </div>
          )

          return (
            <React.Fragment key={step.type}>
              {/* Connector line on desktop */}
              {index > 0 && (
                <div className={cn("hidden md:block flex-1 mx-1 self-center", minimal ? "h-[1.5px] min-w-[24px] max-w-[60px]" : "h-[2px] min-w-[20px]")}>
                  <div className={cn(
                    "h-full w-full rounded-full transition-colors duration-300",
                    steps[index - 1].entity && steps[index].entity
                      ? "bg-zinc-800 dark:bg-zinc-200"
                      : "bg-zinc-200 dark:bg-zinc-800 border-t border-dashed border-zinc-200/50 dark:border-zinc-800/50"
                  )} />
                </div>
              )}

              {/* Chevron on mobile (if wrapped) */}
              {index > 0 && (
                <ChevronRight className="md:hidden h-3.5 w-3.5 text-zinc-400 dark:text-zinc-600 shrink-0 mx-0.5" />
              )}

              {/* Step Block wrapper */}
              <div className="flex-1 md:flex-none">
                {hasData && step.url && !isCurrent ? (
                  <Link href={step.url} className="block">
                    {stepContent}
                  </Link>
                ) : (
                  <div className="block">
                    {stepContent}
                  </div>
                )}
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </nav>
  )
}
