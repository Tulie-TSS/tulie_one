'use client'

import React, { useEffect, useState } from 'react'
import { getEntityLineage, EntityLineage } from '@/lib/supabase/services/lineage-service'
import { ChevronRight, FolderKanban, FileText, PenTool, Rocket, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@repo/ui'
import { cn } from '@/lib/utils'
import { DEAL_STATUS_LABELS, QUOTATION_STATUS_LABELS, CONTRACT_STATUS_LABELS, PROJECT_STATUS_LABELS } from '@/lib/constants/status'

interface Props {
  entityType: 'deal' | 'quotation' | 'contract' | 'project'
  entityId: string
}

export function EntityPipelineTracker({ entityType, entityId }: Props) {
  const [lineage, setLineage] = useState<EntityLineage | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    getEntityLineage(entityType, entityId).then(data => {
      if (mounted) {
        setLineage(data)
        setIsLoading(false)
      }
    })
    return () => { mounted = false }
  }, [entityType, entityId])

  if (isLoading || !lineage) {
    return (
      <div className="w-full bg-muted/30 border-y border-border py-4 mb-6 flex items-center justify-center print:hidden">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
        <span className="text-sm text-muted-foreground">Đang cập nhật luồng dự án...</span>
      </div>
    )
  }

  const steps = [
    {
        type: 'deal',
        label: 'Cơ hội bán hàng',
        icon: <FolderKanban className="w-4 h-4" />,
        entity: lineage.deal,
        url: lineage.deal ? `/sales/deals/${lineage.deal.id}` : null,
        title: lineage.deal?.title,
        statusLabel: lineage.deal ? (DEAL_STATUS_LABELS as any)[lineage.deal.status] : null
    },
    {
        type: 'quotation',
        label: 'Báo giá',
        icon: <FileText className="w-4 h-4" />,
        entity: lineage.quotations && lineage.quotations.length > 0 ? lineage.quotations[0] : null,
        url: lineage.quotations && lineage.quotations.length > 0 ? `/quotations/${lineage.quotations[0].id}` : null,
        title: lineage.quotations && lineage.quotations.length > 0 
            ? `${lineage.quotations[0].quotation_number} ${lineage.quotations[0].version_name ? `(${lineage.quotations[0].version_name})` : ''}` 
            : (entityType === 'quotation' ? 'Đang truy xuất...' : null),
        statusLabel: lineage.quotations && lineage.quotations.length > 0 ? (QUOTATION_STATUS_LABELS as any)[lineage.quotations[0].status] : null,
        extraCount: lineage.quotations && lineage.quotations.length > 1 ? lineage.quotations.length - 1 : 0
    },
    {
        type: 'contract',
        label: 'Hợp đồng',
        icon: <PenTool className="w-4 h-4" />,
        entity: lineage.contract,
        url: lineage.contract ? `/contracts/${lineage.contract.id}` : null,
        title: lineage.contract ? `${lineage.contract.contract_number} - ${lineage.contract.title}` : null,
        statusLabel: lineage.contract ? (CONTRACT_STATUS_LABELS as any)[lineage.contract.status] : null
    },
    {
        type: 'project',
        label: 'Dự án',
        icon: <Rocket className="w-4 h-4" />,
        entity: lineage.project,
        url: lineage.project ? `/projects/${lineage.project.id}` : null,
        title: lineage.project?.title,
        statusLabel: lineage.project ? (PROJECT_STATUS_LABELS as any)[lineage.project.status] : null
    }
  ]

  return (
    <div className="w-full bg-muted/30 border-y border-border py-3 px-4 md:px-6 mb-6 flex overflow-x-auto print:hidden scrollbar-hide">
      <div className="flex items-center text-sm w-max">
        {steps.map((step, index) => {
          const isCurrent = step.type === entityType
          const hasData = !!step.entity
          
          return (
            <React.Fragment key={step.type}>
              {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0 mx-2" />}
              <div 
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2 rounded-md transition-all whitespace-nowrap min-w-[200px]",
                  isCurrent 
                    ? "bg-white dark:bg-zinc-900 border border-border shadow-sm ring-1 ring-primary/10" 
                    : hasData 
                        ? "hover:bg-card/60 cursor-pointer opacity-70 hover:opacity-100 border border-transparent" 
                        : "opacity-40 grayscale border border-transparent pointer-events-none"
                )}
              >
                <div className={cn("shrink-0", isCurrent ? "text-primary" : "text-muted-foreground", hasData && !isCurrent && "text-foreground")}>
                  {step.icon}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-tight mb-0.5">
                    {step.label}
                  </span>
                  
                  {hasData && step.url ? (
                    <div className="flex items-center gap-1.5">
                      <Link href={step.url as string} className={cn("text-sm font-bold truncate max-w-[180px]", isCurrent ? "text-foreground" : "text-foreground hover:text-primary")}>
                        {step.title || 'Không tên'}
                      </Link>
                      {step.extraCount ? (
                          <Badge variant="outline" className="text-[9px] h-4 px-1 py-0 ml-1">+{step.extraCount}</Badge>
                      ) : null}
                    </div>
                  ) : isCurrent ? (
                    <span className="text-sm font-semibold text-foreground truncate max-w-[180px]">
                      Đang xử lý...
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground italic">
                      Chưa khởi tạo
                    </span>
                  )}
                </div>
                {hasData && step.statusLabel && (
                  <Badge variant="secondary" className={cn("ml-auto text-[10px] h-5 px-1.5 font-medium shrink-0", isCurrent ? "bg-muted text-foreground" : "bg-transparent border border-border")}>
                    {step.statusLabel}
                  </Badge>
                )}
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
