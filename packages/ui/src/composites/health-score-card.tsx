import * as React from "react"
import { cn } from "../lib/utils"
import { Card, CardContent } from "../components/card"

/**
 * HealthScoreCard — Business health score ring indicator
 *
 * Used in: CRM (business health metrics)
 * Follows dashboard KPI pattern with visual ring gauge.
 *
 * Usage:
 * ```tsx
 * <HealthScoreCard
 *   score={78}
 *   label="Business Health"
 *   description="Based on revenue, retention, and activity"
 *   items={[
 *     { label: "Revenue", score: 85, color: "success" },
 *     { label: "Retention", score: 72, color: "warning" },
 *     { label: "Activity", score: 90, color: "info" },
 *   ]}
 * />
 * ```
 */

// ─── Types ───────────────────────────────────────────────

interface HealthItem {
  label: string
  score: number
  color?: "success" | "warning" | "destructive" | "info" | "default"
}

interface HealthScoreCardProps {
  /** Overall score (0-100) */
  score: number
  /** Label text */
  label: string
  /** Description */
  description?: string
  /** Breakdown items */
  items?: HealthItem[]
  className?: string
}

// ─── Helpers ─────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 80) return "text-success-foreground"
  if (score >= 60) return "text-warning-foreground"
  return "text-destructive"
}

function getScoreStroke(score: number): string {
  if (score >= 80) return "stroke-success-foreground"
  if (score >= 60) return "stroke-warning-foreground"
  return "stroke-destructive"
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent"
  if (score >= 60) return "Good"
  if (score >= 40) return "Fair"
  return "Poor"
}

const barColorMap = {
  success: "bg-success-foreground",
  warning: "bg-warning-foreground",
  destructive: "bg-destructive",
  info: "bg-info-foreground",
  default: "bg-primary",
}

// ─── Component ───────────────────────────────────────────

export function HealthScoreCard({
  score,
  label,
  description,
  items,
  className,
}: HealthScoreCardProps) {
  const clampedScore = Math.max(0, Math.min(100, score))
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (clampedScore / 100) * circumference

  return (
    <Card className={cn(className)}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-6">
          {/* Score Ring */}
          <div className="relative shrink-0">
            <svg
              width="96"
              height="96"
              viewBox="0 0 96 96"
              className="transform -rotate-90"
              aria-hidden="true"
            >
              {/* Background ring */}
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                strokeWidth="8"
                className="stroke-muted"
              />
              {/* Score ring */}
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={cn(getScoreStroke(clampedScore), "transition-all duration-700 ease-apple")}
              />
            </svg>
            {/* Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-2xl font-bold", getScoreColor(clampedScore))}>
                {clampedScore}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {getScoreLabel(clampedScore)}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{label}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}

            {/* Breakdown items */}
            {items && items.length > 0 && (
              <div className="space-y-2 mt-3">
                {items.map((item) => (
                  <div key={item.label} className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {item.label}
                      </span>
                      <span className="text-xs font-medium">{item.score}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500 ease-apple",
                          barColorMap[item.color || "default"]
                        )}
                        style={{ width: `${Math.min(100, item.score)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
