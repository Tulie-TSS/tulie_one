import * as React from "react"
import { cn } from "../lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "../components/avatar"

/**
 * ActivityTimeline — Chronological event feed
 *
 * Used in: CRM (customer history), Workforce (agent log),
 * Workspace (task activity), ERP (audit trail)
 *
 * Follows GitHub activity feed / Linear timeline pattern.
 *
 * Usage:
 * ```tsx
 * <ActivityTimeline>
 *   <ActivityTimelineItem
 *     icon={<CheckCircle2 className="size-3.5" />}
 *     iconColor="success"
 *     title="Hợp đồng đã ký"
 *     description="Hợp đồng #HĐ-001 đã được ký bởi khách hàng"
 *     timestamp="2 giờ trước"
 *     user={{ name: "Tung", avatar: "/avatar.jpg" }}
 *   />
 * </ActivityTimeline>
 * ```
 */

// ─── Types ───────────────────────────────────────────────

export interface TimelineUser {
  name: string
  avatar?: string
}

type IconColor = "default" | "success" | "warning" | "destructive" | "info"

const iconColorMap: Record<IconColor, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info text-info-foreground",
}

// ─── Container ───────────────────────────────────────────

export function ActivityTimeline({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn("relative space-y-0", className)}
      role="feed"
      aria-label="Activity timeline"
    >
      {children}
    </div>
  )
}

// ─── Item ────────────────────────────────────────────────

interface ActivityTimelineItemProps {
  /** Icon to display in the timeline dot */
  icon?: React.ReactNode
  /** Semantic color for the icon dot */
  iconColor?: IconColor
  /** Main title text */
  title: React.ReactNode
  /** Description / details */
  description?: React.ReactNode
  /** Timestamp string */
  timestamp?: string
  /** User who performed the action */
  user?: TimelineUser
  /** Additional content below description */
  children?: React.ReactNode
  /** Whether this is the last item (hides connector line) */
  isLast?: boolean
  className?: string
}

export function ActivityTimelineItem({
  icon,
  iconColor = "default",
  title,
  description,
  timestamp,
  user,
  children,
  isLast = false,
  className,
}: ActivityTimelineItemProps) {
  return (
    <article
      className={cn("relative flex gap-3 pb-6 last:pb-0", className)}
      role="article"
    >
      {/* Connector line */}
      {!isLast && (
        <div
          className="absolute left-[15px] top-[30px] bottom-0 w-px bg-border"
          aria-hidden="true"
        />
      )}

      {/* Icon dot */}
      <div
        className={cn(
          "relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full",
          iconColorMap[iconColor]
        )}
      >
        {icon || (
          <div className="h-2 w-2 rounded-full bg-current opacity-60" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground leading-snug">
              {title}
            </p>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Timestamp + User */}
          <div className="flex items-center gap-2 shrink-0">
            {user && (
              <Avatar className="h-5 w-5">
                {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                <AvatarFallback className="text-[9px]">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            {timestamp && (
              <time className="text-xs text-muted-foreground whitespace-nowrap">
                {timestamp}
              </time>
            )}
          </div>
        </div>

        {/* Extra content */}
        {children && <div className="mt-2">{children}</div>}
      </div>
    </article>
  )
}
