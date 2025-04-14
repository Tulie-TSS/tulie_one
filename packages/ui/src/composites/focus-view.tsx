"use client"

import * as React from "react"
import { cn } from "../lib/utils"
import { Button } from "../components/button"
import { Card, CardContent } from "../components/card"
import { Progress } from "../components/progress"

/**
 * FocusView — Deep work / focus mode interface
 *
 * Used in: Workspace (The Territory — Maker mode)
 * Minimal, distraction-free UI for deep work sessions.
 *
 * Usage:
 * ```tsx
 * <FocusView
 *   task={{ title: "Implement auth system", description: "..." }}
 *   elapsedMinutes={45}
 *   pomodoroCount={2}
 *   pomodoroTarget={4}
 *   onComplete={() => markDone()}
 *   onExit={() => exitFocus()}
 * />
 * ```
 */

// ─── Types ───────────────────────────────────────────────

interface FocusTask {
  title: string
  description?: string
  labels?: string[]
  estimatedHours?: number
}

interface FocusViewProps {
  /** Current focus task */
  task: FocusTask
  /** Elapsed time in minutes */
  elapsedMinutes?: number
  /** Completed pomodoro count */
  pomodoroCount?: number
  /** Target pomodoro count */
  pomodoroTarget?: number
  /** Checklist items */
  checklist?: { id: string; text: string; done: boolean }[]
  /** Complete task handler */
  onComplete?: () => void
  /** Exit focus mode */
  onExit?: () => void
  /** Toggle checklist item */
  onChecklistToggle?: (id: string) => void
  className?: string
}

// ─── Helpers ─────────────────────────────────────────────

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

// ─── Component ───────────────────────────────────────────

export function FocusView({
  task,
  elapsedMinutes = 0,
  pomodoroCount = 0,
  pomodoroTarget = 4,
  checklist,
  onComplete,
  onExit,
  onChecklistToggle,
  className,
}: FocusViewProps) {
  const pomodoroProgress = Math.min(100, (pomodoroCount / pomodoroTarget) * 100)
  const checklistDone = checklist?.filter((c) => c.done).length ?? 0
  const checklistTotal = checklist?.length ?? 0

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[60vh] p-6 max-w-xl mx-auto",
        className
      )}
    >
      {/* Exit button */}
      <div className="self-end mb-8">
        <Button variant="ghost" size="sm" onClick={onExit} className="text-muted-foreground">
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
            className="mr-1.5"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          Exit Focus
        </Button>
      </div>

      {/* Focus indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-2 w-2 rounded-full bg-success-foreground animate-pulse" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Deep Focus
        </span>
      </div>

      {/* Task title */}
      <h1 className="text-2xl font-bold text-center mb-2">
        {task.title}
      </h1>

      {task.description && (
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
          {task.description}
        </p>
      )}

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex gap-1.5 mb-6">
          {task.labels.map((label) => (
            <span
              key={label}
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Timer & Progress */}
      <Card className="w-full max-w-sm mb-6">
        <CardContent className="pt-6">
          {/* Elapsed time */}
          <div className="text-center mb-4">
            <p className="text-4xl font-bold tabular-nums">
              {formatDuration(elapsedMinutes)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Elapsed time</p>
          </div>

          {/* Pomodoro progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Pomodoro</span>
              <span className="font-medium">
                {pomodoroCount}/{pomodoroTarget}
              </span>
            </div>
            <Progress value={pomodoroProgress} className="h-1.5" />
          </div>

          {/* Estimated time */}
          {task.estimatedHours && (
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Estimated: {task.estimatedHours}h
            </p>
          )}
        </CardContent>
      </Card>

      {/* Checklist */}
      {checklist && checklist.length > 0 && (
        <Card className="w-full max-w-sm mb-6">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium">Checklist</span>
              <span className="text-xs text-muted-foreground">
                {checklistDone}/{checklistTotal}
              </span>
            </div>
            <div className="space-y-2">
              {checklist.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => onChecklistToggle?.(item.id)}
                    className="rounded border-border"
                  />
                  <span
                    className={cn(
                      "text-sm transition-colors",
                      item.done
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    )}
                  >
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={onComplete} className="min-w-[140px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Mark Complete
        </Button>
      </div>
    </div>
  )
}
