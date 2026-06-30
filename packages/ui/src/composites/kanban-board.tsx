"use client"

import * as React from "react"
import { cn } from "../lib/utils"
import { Badge } from "../components/badge"
import { ScrollArea, ScrollBar } from "../components/scroll-area"

/**
 * KanbanBoard — Drag-ready column-based task board
 *
 * Used in: Workspace (The Territory — task execution)
 * Follows Linear/Notion/ClickUp kanban pattern.
 *
 * Note: This provides the visual structure. For DnD, integrate with
 * @dnd-kit or react-beautiful-dnd at the app level.
 *
 * Usage:
 * ```tsx
 * <KanbanBoard>
 *   <KanbanColumn id="todo" title="To Do" count={5}>
 *     <KanbanCard title="Task 1" assignee="Tung" />
 *     <KanbanCard title="Task 2" priority="high" />
 *   </KanbanColumn>
 *   <KanbanColumn id="doing" title="In Progress" count={3} color="info" />
 *   <KanbanColumn id="done" title="Done" count={8} color="success" />
 * </KanbanBoard>
 * ```
 */

// ─── Types ───────────────────────────────────────────────

export type KanbanColumnColor =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "info"

const columnDotColor: Record<KanbanColumnColor, string> = {
  default: "bg-muted-foreground",
  success: "bg-success-foreground",
  warning: "bg-warning-foreground",
  destructive: "bg-destructive",
  info: "bg-info-foreground",
}

// ─── Board ───────────────────────────────────────────────

interface KanbanBoardProps {
  children: React.ReactNode
  className?: string
}

export function KanbanBoard({ children, className }: KanbanBoardProps) {
  return (
    <ScrollArea className={cn("w-full", className)}>
      <div
        className="flex gap-3 pb-4 min-w-max"
        role="list"
        aria-label="Kanban board"
      >
        {children}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

// ─── Column ──────────────────────────────────────────────

interface KanbanColumnProps {
  id: string
  title: string
  count?: number
  color?: KanbanColumnColor
  /** WIP limit — shows warning when exceeded */
  wipLimit?: number
  children?: React.ReactNode
  /** Add card button click handler */
  onAddCard?: () => void
  className?: string
}

export function KanbanColumn({
  id,
  title,
  count = 0,
  color = "default",
  wipLimit,
  children,
  onAddCard,
  className,
}: KanbanColumnProps) {
  const isOverWip = wipLimit !== undefined && count > wipLimit

  return (
    <div
      className={cn(
        "flex flex-col w-[280px] shrink-0 rounded-lg bg-muted/30 border border-border",
        isOverWip && "border-destructive/40 bg-destructive/5",
        className
      )}
      data-column-id={id}
      role="listitem"
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn("h-2.5 w-2.5 rounded-full shrink-0", columnDotColor[color])}
            aria-hidden="true"
          />
          <span className="text-sm font-semibold truncate">{title}</span>
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px] h-5 px-1.5",
              isOverWip && "bg-destructive/10 text-destructive"
            )}
          >
            {count}
            {wipLimit !== undefined && `/${wipLimit}`}
          </Badge>
        </div>

        {/* Add card button */}
        {onAddCard && (
          <button
            onClick={onAddCard}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label={`Add card to ${title}`}
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </button>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 px-2 pb-2 space-y-2 min-h-[60px]">
        {children}
      </div>
    </div>
  )
}

// ─── Card ────────────────────────────────────────────────

export type KanbanPriority = "urgent" | "high" | "medium" | "low"

const priorityColors: Record<KanbanPriority, string> = {
  urgent: "text-destructive",
  high: "text-warning-foreground",
  medium: "text-info-foreground",
  low: "text-muted-foreground",
}

interface KanbanCardProps {
  id?: string
  title: string
  description?: string
  priority?: KanbanPriority
  assignee?: string
  assigneeAvatar?: string
  labels?: string[]
  dueDate?: string
  effortHours?: number
  onClick?: () => void
  className?: string
}

export function KanbanCard({
  id,
  title,
  description,
  priority,
  assignee,
  assigneeAvatar,
  labels,
  dueDate,
  effortHours,
  onClick,
  className,
}: KanbanCardProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card p-3 shadow-sm cursor-pointer transition-all",
        "hover:bg-accent",
        "animate-[scale-in_150ms_ease-out]",
        className
      )}
      data-card-id={id}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick?.()
      }}
    >
      {/* Labels */}
      {labels && labels.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-1.5">
          {labels.map((label) => (
            <span
              key={label}
              className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-medium leading-snug">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {description}
        </p>
      )}

      {/* Footer */}
      {(priority || assignee || dueDate || effortHours) && (
        <div className="flex items-center justify-between mt-2.5 gap-2">
          <div className="flex items-center gap-2">
            {priority && (
              <span
                className={cn("text-[10px] font-semibold ", priorityColors[priority])}
              >
                {priority}
              </span>
            )}
            {effortHours && (
              <span className="text-[10px] text-muted-foreground">
                {effortHours}h
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {dueDate && (
              <span className="text-[10px] text-muted-foreground">{dueDate}</span>
            )}
            {assignee && (
              <div
                className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-medium shrink-0"
                title={assignee}
              >
                {assignee.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
