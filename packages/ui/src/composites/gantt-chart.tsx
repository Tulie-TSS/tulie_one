"use client"

import * as React from "react"
import { cn } from "../lib/utils"
import { ScrollArea, ScrollBar } from "../components/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/tooltip"

/**
 * GanttChart — Row-based timeline visualization
 *
 * Used in: Workspace (The Bridge — project planning)
 * Lightweight CSS-based Gantt chart (no D3/chart library).
 *
 * Usage:
 * ```tsx
 * <GanttChart
 *   tasks={[
 *     { id: "1", title: "Design", start: new Date("2026-03-01"), end: new Date("2026-03-07"), progress: 80, color: "info" },
 *     { id: "2", title: "Dev", start: new Date("2026-03-05"), end: new Date("2026-03-15"), progress: 30, color: "warning", assignee: "Tung" },
 *   ]}
 *   startDate={new Date("2026-03-01")}
 *   endDate={new Date("2026-03-31")}
 * />
 * ```
 */

// ─── Types ───────────────────────────────────────────────

export type GanttBarColor = "default" | "success" | "warning" | "destructive" | "info"

export interface GanttTask {
  id: string
  title: string
  start: Date
  end: Date
  progress?: number
  color?: GanttBarColor
  assignee?: string
  group?: string
}

interface GanttChartProps {
  tasks: GanttTask[]
  /** Timeline start date */
  startDate: Date
  /** Timeline end date */
  endDate: Date
  /** Column width in pixels per day */
  dayWidth?: number
  /** Row height */
  rowHeight?: number
  /** Click handler */
  onTaskClick?: (taskId: string) => void
  /** Show today marker */
  showToday?: boolean
  className?: string
}

// ─── Colors ──────────────────────────────────────────────

const barColors: Record<GanttBarColor, { bg: string; fill: string; text: string }> = {
  default: { bg: "bg-muted", fill: "bg-primary", text: "text-foreground" },
  success: { bg: "bg-success/20", fill: "bg-success-foreground", text: "text-success-foreground" },
  warning: { bg: "bg-warning/20", fill: "bg-warning-foreground", text: "text-warning-foreground" },
  destructive: { bg: "bg-destructive/20", fill: "bg-destructive", text: "text-destructive" },
  info: { bg: "bg-info/20", fill: "bg-info-foreground", text: "text-info-foreground" },
}

// ─── Helpers ─────────────────────────────────────────────

function daysBetween(start: Date, end: Date): number {
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
}

function generateDays(start: Date, end: Date): Date[] {
  const days: Date[] = []
  const current = new Date(start)
  while (current <= end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return days
}

function getMonthLabels(days: Date[]): { label: string; span: number }[] {
  const months: { label: string; span: number }[] = []
  let current = ""
  let count = 0

  for (const day of days) {
    const label = day.toLocaleDateString("vi-VN", { month: "short", year: "numeric" })
    if (label === current) {
      count++
    } else {
      if (current) months.push({ label: current, span: count })
      current = label
      count = 1
    }
  }
  if (current) months.push({ label: current, span: count })

  return months
}

// ─── Component ───────────────────────────────────────────

export function GanttChart({
  tasks,
  startDate,
  endDate,
  dayWidth = 32,
  rowHeight = 40,
  onTaskClick,
  showToday = true,
  className,
}: GanttChartProps) {
  const days = React.useMemo(() => generateDays(startDate, endDate), [startDate, endDate])
  const months = React.useMemo(() => getMonthLabels(days), [days])
  const totalDays = days.length
  const gridWidth = totalDays * dayWidth
  const today = new Date()
  const todayOffset = daysBetween(startDate, today)
  const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6

  return (
    <div className={cn("rounded-lg border border-border bg-card overflow-hidden", className)}>
      <TooltipProvider delayDuration={0}>
        <div className="flex">
          {/* Left panel — task labels */}
          <div className="w-[200px] shrink-0 border-r border-border bg-muted/30">
            {/* Month header space */}
            <div className="h-[28px] border-b border-border" />
            {/* Day header space */}
            <div className="h-[24px] border-b border-border px-3 flex items-center">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Task
              </span>
            </div>
            {/* Task rows */}
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center px-3 border-b border-border"
                style={{ height: rowHeight }}
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{task.title}</p>
                  {task.assignee && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      {task.assignee}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right panel — timeline grid */}
          <ScrollArea className="flex-1">
            <div style={{ width: gridWidth }}>
              {/* Month headers */}
              <div className="flex h-[28px] border-b border-border">
                {months.map((month, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center text-[10px] font-medium text-muted-foreground border-r border-border last:border-0"
                    style={{ width: month.span * dayWidth }}
                  >
                    {month.label}
                  </div>
                ))}
              </div>

              {/* Day headers */}
              <div className="flex h-[24px] border-b border-border">
                {days.map((day, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center justify-center text-[9px] border-r border-border last:border-0",
                      isWeekend(day) ? "text-muted-foreground/40 bg-muted/20" : "text-muted-foreground"
                    )}
                    style={{ width: dayWidth }}
                  >
                    {day.getDate()}
                  </div>
                ))}
              </div>

              {/* Task bars */}
              <div className="relative">
                {/* Grid lines */}
                {days.map((day, i) => (
                  <div
                    key={i}
                    className={cn(
                      "absolute top-0 bottom-0 border-r border-border/30",
                      isWeekend(day) && "bg-muted/10"
                    )}
                    style={{ left: i * dayWidth, width: dayWidth }}
                    aria-hidden="true"
                  />
                ))}

                {/* Today marker */}
                {showToday && todayOffset >= 0 && todayOffset < totalDays && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-destructive z-10"
                    style={{ left: todayOffset * dayWidth + dayWidth / 2 }}
                    aria-label="Today"
                  />
                )}

                {/* Bars */}
                {tasks.map((task) => {
                  const taskStart = Math.max(0, daysBetween(startDate, task.start))
                  const taskDuration = Math.max(1, daysBetween(task.start, task.end))
                  const taskLeft = taskStart * dayWidth
                  const taskWidth = taskDuration * dayWidth
                  const colors = barColors[task.color || "default"]

                  return (
                    <div
                      key={task.id}
                      className="relative border-b border-border"
                      style={{ height: rowHeight }}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className={cn(
                              "absolute top-1/2 -translate-y-1/2 rounded-md overflow-hidden cursor-pointer transition-all",
                              "hover:brightness-95",
                              colors.bg
                            )}
                            style={{
                              left: taskLeft + 2,
                              width: Math.max(taskWidth - 4, dayWidth - 4),
                              height: rowHeight - 12,
                            }}
                            onClick={() => onTaskClick?.(task.id)}
                            type="button"
                            aria-label={`${task.title}: ${formatDate(task.start)} - ${formatDate(task.end)}`}
                          >
                            {/* Progress fill */}
                            <div
                              className={cn(
                                "absolute inset-y-0 left-0 rounded-md transition-all duration-500",
                                colors.fill,
                                "opacity-70"
                              )}
                              style={{ width: `${task.progress ?? 0}%` }}
                            />
                            {/* Label */}
                            {taskWidth > 60 && (
                              <span
                                className={cn(
                                  "relative z-10 px-2 text-[10px] font-medium truncate block leading-[28px]",
                                  task.progress && task.progress > 50
                                    ? "text-white"
                                    : colors.text
                                )}
                              >
                                {task.title}
                              </span>
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-0.5">
                            <p className="font-medium text-xs">{task.title}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatDate(task.start)} — {formatDate(task.end)} ({taskDuration}d)
                            </p>
                            {task.progress !== undefined && (
                              <p className="text-[10px]">Progress: {task.progress}%</p>
                            )}
                            {task.assignee && (
                              <p className="text-[10px] text-muted-foreground">
                                Assignee: {task.assignee}
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )
                })}
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </TooltipProvider>
    </div>
  )
}
