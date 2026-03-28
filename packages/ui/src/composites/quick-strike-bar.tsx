"use client"

import * as React from "react"
import { cn } from "../lib/utils"
import { Button } from "../components/button"
import { Input } from "../components/input"

/**
 * QuickStrikeBar — Floating quick capture input
 *
 * Used in: Workspace (Quick Strike pattern — tasks < 10 min)
 * Follows Linear's inline task creation pattern.
 *
 * Usage:
 * ```tsx
 * <QuickStrikeBar
 *   onSubmit={(text) => createQuickTask(text)}
 *   placeholder="Quick Strike — capture a fast task..."
 * />
 * ```
 */

interface QuickStrikeBarProps {
  /** Submit handler */
  onSubmit?: (text: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Max character count */
  maxLength?: number
  /** Position */
  position?: "bottom" | "top" | "inline"
  /** Disabled state */
  disabled?: boolean
  className?: string
}

export function QuickStrikeBar({
  onSubmit,
  placeholder = "Quick Strike — capture a fast task (< 10 min)...",
  maxLength = 200,
  position = "bottom",
  disabled = false,
  className,
}: QuickStrikeBarProps) {
  const [text, setText] = React.useState("")
  const [focused, setFocused] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  function handleSubmit() {
    const trimmed = text.trim()
    if (trimmed && onSubmit) {
      onSubmit(trimmed)
      setText("")
    }
  }

  const positionClasses = {
    bottom: "fixed bottom-4 left-1/2 -translate-x-1/2 z-[var(--z-sticky)] w-full max-w-lg px-4",
    top: "fixed top-4 left-1/2 -translate-x-1/2 z-[var(--z-sticky)] w-full max-w-lg px-4",
    inline: "w-full",
  }

  return (
    <div className={cn(positionClasses[position], className)}>
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border bg-card px-3 py-2 transition-all",
          focused
            ? "border-primary shadow-md ring-[3px] ring-primary/10"
            : "border-border shadow-sm",
          position !== "inline" && "backdrop-blur-xl bg-card/95",
          disabled && "opacity-50"
        )}
      >
        {/* Lightning bolt icon */}
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md shrink-0 transition-colors",
            focused ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
          >
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>

        {/* Input */}
        <Input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxLength))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="border-0 shadow-none focus-visible:ring-0 bg-transparent px-0 h-8 text-sm"
          aria-label="Quick task input"
          maxLength={maxLength}
        />

        {/* Character count */}
        {text.length > 0 && (
          <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
            {text.length}/{maxLength}
          </span>
        )}

        {/* Submit button */}
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!text.trim() || disabled}
          className="h-7 px-3 shrink-0"
        >
          Done
        </Button>
      </div>
    </div>
  )
}
