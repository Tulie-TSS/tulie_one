import * as React from "react"
import { cn } from "../lib/utils"
import { Card, CardContent } from "../components/card"
import { Avatar, AvatarFallback, AvatarImage } from "../components/avatar"
import { Badge } from "../components/badge"

/**
 * AgentCard — AI Agent display card
 *
 * Used in: Workforce (Agent management dashboard)
 * Shows agent avatar, status, role, and key metrics.
 *
 * Usage:
 * ```tsx
 * <AgentCard
 *   name="Research Agent"
 *   avatar="/agents/research.png"
 *   status="active"
 *   role="Research & Analysis"
 *   model="GPT-4o"
 *   metrics={{ tasks: 45, successRate: 98, avgTime: "2.3s" }}
 *   onClick={() => openAgent(id)}
 * />
 * ```
 */

// ─── Types ───────────────────────────────────────────────

export type AgentStatus = "active" | "idle" | "error" | "disabled"

interface AgentMetrics {
  tasks?: number
  successRate?: number
  avgTime?: string
}

interface AgentCardProps {
  name: string
  avatar?: string
  status: AgentStatus
  role?: string
  model?: string
  description?: string
  metrics?: AgentMetrics
  onClick?: () => void
  className?: string
}

// ─── Status ──────────────────────────────────────────────

const statusConfig: Record<AgentStatus, { label: string; dotClass: string; badgeClass: string }> = {
  active: {
    label: "Active",
    dotClass: "bg-success-foreground animate-pulse",
    badgeClass: "bg-success/20 text-success-foreground border-success-foreground/20",
  },
  idle: {
    label: "Idle",
    dotClass: "bg-muted-foreground",
    badgeClass: "bg-muted text-muted-foreground",
  },
  error: {
    label: "Error",
    dotClass: "bg-destructive",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
  },
  disabled: {
    label: "Disabled",
    dotClass: "bg-muted-foreground/40",
    badgeClass: "bg-muted text-muted-foreground/60",
  },
}

// ─── Component ───────────────────────────────────────────

export function AgentCard({
  name,
  avatar,
  status,
  role,
  model,
  description,
  metrics,
  onClick,
  className,
}: AgentCardProps) {
  const statusInfo = statusConfig[status]

  return (
    <Card
      className={cn(
        "transition-all",
        onClick && "cursor-pointer hover:shadow-md hover:-translate-y-0.5",
        status === "disabled" && "opacity-60",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="pt-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative shrink-0">
            <Avatar className="h-10 w-10">
              {avatar && <AvatarImage src={avatar} alt={name} />}
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                {name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {/* Status dot */}
            <div
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                statusInfo.dotClass
              )}
              aria-hidden="true"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold truncate">{name}</h3>
              <Badge
                variant="outline"
                className={cn("text-[10px] h-4 px-1.5 border", statusInfo.badgeClass)}
              >
                {statusInfo.label}
              </Badge>
            </div>
            {role && (
              <p className="text-xs text-muted-foreground mt-0.5">{role}</p>
            )}
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {description}
          </p>
        )}

        {/* Model badge */}
        {model && (
          <div className="mb-3">
            <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
              🤖 {model}
            </span>
          </div>
        )}

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
            {metrics.tasks !== undefined && (
              <div className="text-center">
                <p className="text-sm font-semibold">{metrics.tasks}</p>
                <p className="text-[10px] text-muted-foreground">Tasks</p>
              </div>
            )}
            {metrics.successRate !== undefined && (
              <div className="text-center">
                <p className="text-sm font-semibold text-success-foreground">
                  {metrics.successRate}%
                </p>
                <p className="text-[10px] text-muted-foreground">Success</p>
              </div>
            )}
            {metrics.avgTime !== undefined && (
              <div className="text-center">
                <p className="text-sm font-semibold">{metrics.avgTime}</p>
                <p className="text-[10px] text-muted-foreground">Avg Time</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
