"use client"

import * as React from "react"
import { cn } from "../lib/utils"
import { Button } from "../components/button"
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover"
import { ScrollArea } from "../components/scroll-area"
import { Separator } from "../components/separator"
import { Badge } from "../components/badge"

/**
 * NotificationCenter — Dropdown notification panel
 *
 * Used in: CRM, Workforce, Workspace, ERP
 * Follows GitHub/Linear notification center pattern.
 *
 * Usage:
 * ```tsx
 * <NotificationCenter
 *   notifications={notifications}
 *   unreadCount={5}
 *   onMarkRead={(id) => markAsRead(id)}
 *   onMarkAllRead={() => markAllRead()}
 *   onNotificationClick={(n) => router.push(n.href)}
 * />
 * ```
 */

// ─── Types ───────────────────────────────────────────────

export type NotificationType = "info" | "success" | "warning" | "error"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  description?: string
  timestamp: string
  isRead: boolean
  href?: string
  icon?: React.ReactNode
  avatar?: {
    src?: string
    fallback: string
  }
}

interface NotificationCenterProps {
  notifications: Notification[]
  unreadCount?: number
  onMarkRead?: (id: string) => void
  onMarkAllRead?: () => void
  onNotificationClick?: (notification: Notification) => void
  onClearAll?: () => void
  /** Trigger button (defaults to bell icon) */
  trigger?: React.ReactNode
  /** Empty state message */
  emptyMessage?: string
  className?: string
}

// ─── Type Color Map ──────────────────────────────────────

const typeIndicator: Record<NotificationType, string> = {
  info: "bg-info-foreground",
  success: "bg-success-foreground",
  warning: "bg-warning-foreground",
  error: "bg-destructive",
}

// ─── Component ───────────────────────────────────────────

export function NotificationCenter({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onNotificationClick,
  onClearAll,
  trigger,
  emptyMessage = "No notifications",
  className,
}: NotificationCenterProps) {
  const [open, setOpen] = React.useState(false)
  const count = unreadCount ?? notifications.filter((n) => !n.isRead).length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
          >
            {/* Bell icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>

            {/* Unread badge */}
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Button>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className={cn(
          "w-[380px] p-0 overflow-hidden",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {count > 0 && (
              <Badge variant="secondary" className="text-xs h-5 px-1.5">
                {count}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {count > 0 && onMarkAllRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllRead}
                className="text-xs h-7"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Notification list */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                <line x1="1" x2="23" y1="1" y2="23" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div role="list" aria-label="Notifications">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  role="listitem"
                  className={cn(
                    "flex gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-muted/50 border-b border-border last:border-0",
                    !notification.isRead && "bg-muted/30"
                  )}
                  onClick={() => {
                    onMarkRead?.(notification.id)
                    onNotificationClick?.(notification)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onMarkRead?.(notification.id)
                      onNotificationClick?.(notification)
                    }
                  }}
                  tabIndex={0}
                >
                  {/* Type indicator dot */}
                  <div className="mt-1.5 shrink-0">
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        notification.isRead
                          ? "bg-transparent"
                          : typeIndicator[notification.type]
                      )}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm leading-snug",
                        notification.isRead
                          ? "text-muted-foreground"
                          : "text-foreground font-medium"
                      )}
                    >
                      {notification.title}
                    </p>
                    {notification.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.description}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground/60 mt-1">
                      {notification.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="px-4 py-2 flex justify-center">
              <Button variant="ghost" size="sm" className="text-xs h-7 w-full">
                View all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
