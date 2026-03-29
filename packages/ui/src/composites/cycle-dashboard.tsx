import * as React from "react"
import { cn } from "../lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/card"
import { Progress } from "../components/progress"
import { Badge } from "../components/badge"

/**
 * CycleDashboard — Sprint/Cycle progress overview
 *
 * Used in: Workspace (The Bridge — Cycle Planning)
 * Shows cycle progress, task breakdown, and time remaining.
 *
 * Usage:
 * ```tsx
 * <CycleDashboard
 *   name="Sprint 14"
 *   startDate="Mar 18"
 *   endDate="Mar 29"
 *   daysRemaining={3}
 *   stats={{
 *     total: 24,
 *     done: 16,
 *     inProgress: 5,
 *     todo: 3,
 *   }}
 *   carryOver={2}
 * />
 * ```
 */

// ─── Types ───────────────────────────────────────────────

interface CycleStats {
  total: number
  done: number
  inProgress: number
  todo: number
}

interface CycleDashboardProps {
  /** Cycle name */
  name: string
  /** Start date display */
  startDate: string
  /** End date display */
  endDate: string
  /** Days remaining */
  daysRemaining: number
  /** Task statistics */
  stats: CycleStats
  /** Carry-over from previous cycle */
  carryOver?: number
  /** Goal description */
  goal?: string
  /** Click handler */
  onClick?: () => void
  className?: string
}

// ─── Component ───────────────────────────────────────────

export function CycleDashboard({
  name,
  startDate,
  endDate,
  daysRemaining,
  stats,
  carryOver,
  goal,
  onClick,
  className,
}: CycleDashboardProps) {
  const completionRate = stats.total > 0
    ? Math.round((stats.done / stats.total) * 100)
    : 0

  const isNearDeadline = daysRemaining <= 2
  const isOverdue = daysRemaining < 0

  return (
    <Card
      className={cn(
        "transition-all",
        onClick && "cursor-pointer hover:bg-accent",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">{name}</CardTitle>
            <CardDescription className="text-xs">
              {startDate} — {endDate}
            </CardDescription>
          </div>
          <Badge
            variant={isOverdue ? "destructive" : isNearDeadline ? "outline" : "secondary"}
            className="text-xs"
          >
            {isOverdue
              ? `${Math.abs(daysRemaining)}d overdue`
              : `${daysRemaining}d left`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Goal */}
        {goal && (
          <p className="text-xs text-muted-foreground italic">
            Goal: {goal}
          </p>
        )}

        {/* Completion ring + stats */}
        <div className="flex items-center gap-6">
          {/* Progress ring */}
          <div className="relative shrink-0">
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              className="transform -rotate-90"
              aria-hidden="true"
            >
              <circle
                cx="32" cy="32" r="26"
                fill="none" strokeWidth="6"
                className="stroke-muted"
              />
              <circle
                cx="32" cy="32" r="26"
                fill="none" strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 26}
                strokeDashoffset={2 * Math.PI * 26 * (1 - completionRate / 100)}
                className="stroke-primary transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold">{completionRate}%</span>
            </div>
          </div>

          {/* Task breakdown */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Done</span>
              <span className="font-medium text-success-foreground">{stats.done}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">In Progress</span>
              <span className="font-medium text-info-foreground">{stats.inProgress}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">To Do</span>
              <span className="font-medium">{stats.todo}</span>
            </div>
            {carryOver !== undefined && carryOver > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Carry Over</span>
                <span className="font-medium text-warning-foreground">{carryOver}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stacked progress bar */}
        <div className="space-y-1">
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="bg-success-foreground transition-all duration-500"
              style={{ width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%` }}
            />
            <div
              className="bg-info-foreground transition-all duration-500"
              style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{stats.done + stats.inProgress}/{stats.total} tasks</span>
            <span>{stats.total - stats.done - stats.inProgress} remaining</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
