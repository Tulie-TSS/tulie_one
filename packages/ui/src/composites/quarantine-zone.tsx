import * as React from "react"
import { cn } from "../lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "../components/card"
import { Badge } from "../components/badge"
import { Button } from "../components/button"

/**
 * QuarantineZone — Overflow/conflict task container
 *
 * Used in: Workspace (The Border — task intake triage)
 * Tasks that exceed WIP limits or have conflicts are quarantined here.
 * Manager must make trade-off decisions before releasing.
 *
 * Usage:
 * ```tsx
 * <QuarantineZone
 *   tasks={quarantinedTasks}
 *   onDecision={(taskId, decision) => handleTradeOff(taskId, decision)}
 * />
 * ```
 */

// ─── Types ───────────────────────────────────────────────

export type QuarantineReason = "wip_exceeded" | "conflict" | "blocked" | "low_priority"

export type TradeOffDecision = "swap" | "add_resource" | "reduce_scope" | "extend_deadline" | "reject"

export interface QuarantineTask {
  id: string
  title: string
  reason: QuarantineReason
  reasonDetail?: string
  requestedBy?: string
  priority?: "urgent" | "high" | "medium" | "low"
  effort?: string
  timestamp: string
  conflictsWith?: string
}

interface QuarantineZoneProps {
  tasks: QuarantineTask[]
  onDecision?: (taskId: string, decision: TradeOffDecision, reason?: string) => void
  onViewTask?: (taskId: string) => void
  className?: string
}

// ─── Helpers ─────────────────────────────────────────────

const reasonLabelMap: Record<QuarantineReason, { label: string; color: string }> = {
  wip_exceeded: { label: "WIP Exceeded", color: "text-destructive" },
  conflict: { label: "Conflict", color: "text-warning-foreground" },
  blocked: { label: "Blocked", color: "text-muted-foreground" },
  low_priority: { label: "Low Priority", color: "text-info-foreground" },
}

const decisionLabels: Record<TradeOffDecision, string> = {
  swap: "Swap with existing",
  add_resource: "Add resource",
  reduce_scope: "Reduce scope",
  extend_deadline: "Extend deadline",
  reject: "Reject",
}

// ─── Component ───────────────────────────────────────────

export function QuarantineZone({
  tasks,
  onDecision,
  onViewTask,
  className,
}: QuarantineZoneProps) {
  if (tasks.length === 0) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" /><path d="M12 17h.01" />
            </svg>
          </div>
          <p className="text-sm font-medium">Quarantine Zone is empty</p>
          <p className="text-xs text-muted-foreground mt-1">No tasks exceeding WIP limits</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border-destructive/30 bg-destructive/[0.02]", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" /><path d="M12 17h.01" />
            </svg>
            <CardTitle className="text-sm font-semibold">Quarantine Zone</CardTitle>
            <Badge variant="destructive" className="text-[10px] h-5">
              {tasks.length}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {tasks.map((task) => {
          const reason = reasonLabelMap[task.reason]

          return (
            <div
              key={task.id}
              className="rounded-md border border-destructive/20 bg-card p-3 space-y-2 animate-[scale-in_200ms_ease-out]"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <button
                    className="text-sm font-medium hover:underline text-left"
                    onClick={() => onViewTask?.(task.id)}
                    type="button"
                  >
                    {task.title}
                  </button>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn("text-[10px] font-semibold", reason.color)}>
                      {reason.label}
                    </span>
                    {task.reasonDetail && (
                      <span className="text-[10px] text-muted-foreground">
                        — {task.reasonDetail}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {task.timestamp}
                </span>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                {task.requestedBy && <span>By: {task.requestedBy}</span>}
                {task.priority && (
                  <span className="font-medium">{task.priority}</span>
                )}
                {task.effort && <span>{task.effort}</span>}
                {task.conflictsWith && (
                  <span className="text-warning-foreground">
                    Conflicts with: {task.conflictsWith}
                  </span>
                )}
              </div>

              {/* Trade-off decisions */}
              {onDecision && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(Object.entries(decisionLabels) as [TradeOffDecision, string][]).map(
                    ([decision, label]) => (
                      <Button
                        key={decision}
                        variant={decision === "reject" ? "destructive" : "outline"}
                        size="sm"
                        className="h-6 text-[10px] px-2"
                        onClick={() => onDecision(task.id, decision)}
                      >
                        {label}
                      </Button>
                    )
                  )}
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
