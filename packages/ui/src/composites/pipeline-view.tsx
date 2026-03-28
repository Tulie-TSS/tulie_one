"use client"

import * as React from "react"
import { cn } from "../lib/utils"
import { Badge } from "../components/badge"
import { ScrollArea, ScrollBar } from "../components/scroll-area"

/**
 * PipelineView — Horizontal stage-based pipeline
 *
 * Used in: CRM (sales pipeline), ERP (procurement pipeline)
 * Follows ClickUp/HubSpot deal pipeline pattern.
 *
 * Usage:
 * ```tsx
 * <PipelineView
 *   stages={[
 *     { id: "lead", label: "Lead", count: 12, value: "50M" },
 *     { id: "contact", label: "Contacted", count: 8, value: "35M" },
 *     { id: "proposal", label: "Proposal", count: 5, value: "25M" },
 *     { id: "won", label: "Won", count: 3, value: "15M", color: "success" },
 *   ]}
 *   activeStage="contact"
 *   onStageClick={(id) => setFilter(id)}
 * >
 *   {(stage) => <PipelineCard key={card.id} {...card} />}
 * </PipelineView>
 * ```
 */

// ─── Types ───────────────────────────────────────────────

export interface PipelineStage {
  id: string
  label: string
  count: number
  value?: string
  color?: "default" | "success" | "warning" | "destructive" | "info"
}

interface PipelineViewProps {
  /** Pipeline stages */
  stages: PipelineStage[]
  /** Currently active/selected stage */
  activeStage?: string
  /** Callback when stage header is clicked */
  onStageClick?: (stageId: string) => void
  /** Render cards for each stage */
  renderCards?: (stage: PipelineStage) => React.ReactNode
  /** Children (alternative to renderCards) */
  children?: React.ReactNode
  className?: string
}

const stageColorMap = {
  default: "bg-muted/50 border-border",
  success: "bg-success/5 border-success-foreground/20",
  warning: "bg-warning/5 border-warning-foreground/20",
  destructive: "bg-destructive/5 border-destructive/20",
  info: "bg-info/5 border-info-foreground/20",
}

const headerColorMap = {
  default: "text-foreground",
  success: "text-success-foreground",
  warning: "text-warning-foreground",
  destructive: "text-destructive",
  info: "text-info-foreground",
}

// ─── Component ───────────────────────────────────────────

export function PipelineView({
  stages,
  activeStage,
  onStageClick,
  renderCards,
  children,
  className,
}: PipelineViewProps) {
  return (
    <ScrollArea className={cn("w-full", className)}>
      <div
        className="flex gap-3 pb-4 min-w-max"
        role="list"
        aria-label="Pipeline stages"
      >
        {stages.map((stage) => (
          <div
            key={stage.id}
            className={cn(
              "flex flex-col w-[280px] shrink-0 rounded-lg border transition-colors",
              stageColorMap[stage.color || "default"],
              activeStage === stage.id && "ring-2 ring-primary/20"
            )}
            role="listitem"
          >
            {/* Stage header */}
            <button
              className={cn(
                "flex items-center justify-between px-3 py-2.5 text-left hover:bg-muted/30 rounded-t-lg transition-colors",
                onStageClick && "cursor-pointer"
              )}
              onClick={() => onStageClick?.(stage.id)}
              type="button"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={cn(
                    "text-sm font-semibold truncate",
                    headerColorMap[stage.color || "default"]
                  )}
                >
                  {stage.label}
                </span>
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                  {stage.count}
                </Badge>
              </div>
              {stage.value && (
                <span className="text-xs font-medium text-muted-foreground shrink-0">
                  {stage.value}
                </span>
              )}
            </button>

            {/* Cards area */}
            <div className="flex-1 px-2 pb-2 space-y-2 min-h-[120px]">
              {renderCards?.(stage)}
            </div>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

// ─── Pipeline Card ───────────────────────────────────────

export interface PipelineCardProps {
  title: string
  subtitle?: string
  value?: string
  tags?: { label: string; color?: string }[]
  avatar?: React.ReactNode
  onClick?: () => void
  className?: string
}

export function PipelineCard({
  title,
  subtitle,
  value,
  tags,
  avatar,
  onClick,
  className,
}: PipelineCardProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card p-3 shadow-sm transition-all",
        "hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
        "animate-[scale-in_200ms_ease-out]",
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick?.()
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
        {avatar && <div className="shrink-0">{avatar}</div>}
      </div>

      {(value || tags) && (
        <div className="flex items-center justify-between mt-2.5 gap-2">
          {tags && tags.length > 0 && (
            <div className="flex gap-1 flex-wrap min-w-0">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground"
                >
                  {tag.label}
                </span>
              ))}
            </div>
          )}
          {value && (
            <span className="text-sm font-semibold text-foreground shrink-0">
              {value}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
